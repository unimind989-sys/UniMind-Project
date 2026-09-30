"""Reject logo defects, compare approved construction and bind deliverable bytes."""
from pathlib import Path
import sys
import os
import json
import hashlib
import struct
import math
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from PIL import Image

BASE = Path(__file__).parent
for name, expected in {
    '01-open-folio-v2.svg': '76ad56bc3c6d5f0041714c8da3b4346cfaa6e9f24f90de96a909a7b395e14d39',
    '01-open-folio-lockup-v2.svg': '50e48521af9ecda474e2ca93fc664d23e3ab0c93da1debdcc474cfc309e650ae',
    'concept-sheet-v2.png': '0086a43889d06405a7aa85dfef97e2cea90524b4214091f2eab5bb301a4812aa',
}.items():
    assert hashlib.sha256((BASE.parent/'round-2'/name).read_bytes()).hexdigest()==expected, name
sys.path.insert(0, os.environ.get('UNIMIND_LOGO_FONTTOOLS', 'C:/Users/Ahmed/AppData/Local/Temp/unimind-logo-font-tools'))
from fontTools.svgLib.path import parse_path
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen

NS = '{http://www.w3.org/2000/svg}'
allowed_colors = {'#0c1823','#ecf3f9','#3977f7','#000000','#ffffff'}
vectors = sorted((BASE/'svg').glob('*.svg')) + sorted((BASE/'icons').glob('*.svg'))
assert len(vectors) == 30
for p in vectors:
    root = ET.parse(p).getroot()
    w,h = [float(v) for v in root.attrib['viewBox'].split()][2:]
    assert w>0 and h>0
    for node in root.iter():
        tag = node.tag.split('}')[-1]
        assert tag in ('svg','title','path','g','rect'), (p.name,tag)
        assert not any(k.split('}')[-1] in ('href','stroke','filter','style','onclick') for k in node.attrib)
        if 'fill' in node.attrib:
            assert node.attrib['fill'] in allowed_colors
        if tag=='rect':
            assert p.parent.name=='icons', 'Background rectangle in transparent logo'
        if tag=='path':
            assert node.attrib['d'].rstrip().upper().endswith('Z'), p.name
    source = p.read_text(encoding='utf-8')
    assert '<image' not in source and '://' not in source.split('>', 1)[1]

original = ET.parse(BASE.parent/'round-2/01-open-folio-lockup-v2.svg').getroot()
primary = ET.parse(BASE/'svg/unimind-open-folio-horizontal-dark.svg').getroot()
assert [p.attrib['d'] for p in original.findall(NS+'path')] == [p.attrib['d'] for p in primary.findall(NS+'path')[:2]]
original_letters = original.find(NS+'g').findall(NS+'path')
final_letters = primary.findall(NS+'path')[2:]
assert len(original_letters)==len(final_letters)==7
max_error=0
for old,new in zip(original_letters,final_letters):
    cursor=float(old.attrib['transform'].split('(')[1].split()[0])
    a,b=RecordingPen(),RecordingPen()
    parse_path(old.attrib['d'],TransformPen(a,(.079,0,0,-.079,294+cursor*.079,185)))
    parse_path(new.attrib['d'],b)
    assert len(a.value)==len(b.value)
    for (oa,pa),(ob,pb) in zip(a.value,b.value):
        assert oa==ob and len(pa)==len(pb)
        for point_a,point_b in zip(pa,pb):
            for ca,cb in zip(point_a,point_b):
                max_error=max(max_error,abs(ca-cb))
assert max_error<=.011, max_error

audit=json.loads((BASE/'provenance/svg-audit.json').read_text(encoding='utf-8-sig'))
assert len(audit)==25
assert all(f['level']=='INFO' for item in audit for f in item['findings'])
for item in audit:
    x0,y0,x1,y1=item['content_bbox']
    _,_,w,h=item['viewBox']
    assert 0<x0<x1<w and 0<y0<y1<h, item['file']

spec=json.loads((BASE/'export-spec.json').read_text(encoding='utf-8'))
transparent_count=0
for item in spec['pngExports']:
    im=Image.open(BASE/item['path'])
    assert im.mode=='RGBA' and im.size==(item['width'],item['height']), item['path']
    if item['path'].startswith('png/'):
        transparent_count+=1
        alpha=im.getchannel('A')
        assert alpha.getextrema()==(0,255)
        assert all(im.getpixel(pos)[3]==0 for pos in ((0,0),(im.width-1,0),(0,im.height-1),(im.width-1,im.height-1)))
        x0,y0,x1,y1=alpha.getbbox()
        assert 0<x0<x1<im.width and 0<y0<y1<im.height, item['path']
        if 'symbol-small' in item['path']:
            assert all(im.getpixel((im.width//2,y))[3]==0 for y in range(im.height)), item['path']
    elif 'favicon-' not in item['path']:
        assert im.getchannel('A').getextrema()==(255,255), item['path']
assert transparent_count==32

ico=(BASE/'icons/favicon.ico').read_bytes()
reserved,kind,count=struct.unpack_from('<HHH',ico)
assert (reserved,kind,count)==(0,1,3)
for i,size in enumerate((16,32,48)):
    w,h,_,_,planes,bits,length,offset=struct.unpack_from('<BBBBHHII',ico,6+i*16)
    assert (w,h,planes,bits)==(size,size,1,32)
    assert ico[offset:offset+length]==(BASE/f'icons/favicon-{size}.png').read_bytes()

mask=Image.open(BASE/'icons/maskable-512.png')
night=(12,24,35)
max_radius=0
for y in range(512):
    for x in range(512):
        if mask.getpixel((x,y))[:3]!=night:
            max_radius=max(max_radius,math.hypot(x+.5-256,y+.5-256))
assert max_radius<=512*.4, max_radius
manifest=json.loads((BASE/'icons/site.webmanifest').read_text(encoding='utf-8'))
for icon in manifest['icons']:
    path=BASE/'icons'/icon['src']
    assert path.is_file() and '://' not in icon['src']
    assert Image.open(path).size==tuple(map(int,icon['sizes'].split('x')))
assert 'start_url' not in manifest and 'scope' not in manifest

class LayoutParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.articles=[]; self.images=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='article': self.articles.append(a)
        if tag=='img': self.images.append(a)
layout=LayoutParser(); layout.feed((BASE/'previews/layout-examples.html').read_text(encoding='utf-8'))
assert len(layout.articles)==len(layout.images)==8
assert sum(a['dir']=='rtl' and a['lang']=='ar' for a in layout.articles)==4
assert all(i['dir']=='ltr' and i['alt']=='UniMind' for i in layout.images)
assert all((BASE/'previews'/i['src']).resolve().is_file() for i in layout.images)

def luminance(value):
    values=[int(value[i:i+2],16)/255 for i in (1,3,5)]
    linear=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in values]
    return sum(a*b for a,b in zip(linear,(.2126,.7152,.0722)))
contrasts={}
for fg,bg in (('#0c1823','#ffffff'),('#0c1823','#ecf3f9'),('#ecf3f9','#0c1823'),('#3977f7','#0c1823'),('#3977f7','#ffffff'),('#3977f7','#ecf3f9'),('#ffffff','#3977f7')):
    light,dark=sorted((luminance(fg),luminance(bg)),reverse=True)
    ratio=(light+.05)/(dark+.05)
    assert ratio>=3, (fg,bg,ratio)
    contrasts[f'{fg} on {bg}']=round(ratio,2)

files={}
for p in sorted(BASE.rglob('*')):
    name=p.relative_to(BASE).as_posix()
    if not p.is_file() or name in ('asset-manifest.json','unimind-open-folio-kit.zip','archive-sha256.txt') or name.startswith(('previews/export-atlas','previews/iterations/','__pycache__/')):
        continue
    files[name]=hashlib.sha256(p.read_bytes()).hexdigest()
report={'scope':'Open Folio digital logo kit; standalone asset proof, no application integration or physical print proof','approvedSourceCommit':spec['approvalCommit'],'vectorFiles':len(vectors),'pngFiles':len(spec['pngExports']),'transparentLogoPngs':transparent_count,'icoSizes':[16,32,48],'maximumOutlineRoundingError':round(max_error,6),'maskableMarkMaximumRadiusPx':round(max_radius,2),'maskableSafeRadiusPx':204.8,'ltrRtlContainers':8,'contrastRatios':contrasts,'sha256':files}
(BASE/'asset-manifest.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps({k:v for k,v in report.items() if k!='sha256'},indent=2))
