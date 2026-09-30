"""Reproducible Open Folio kit. Render SVG atlases once, crop exact PNG exports."""
from pathlib import Path
import sys
import os
import re
import json
import math
import html
from PIL import Image

BASE = Path(__file__).parent
LOGO = BASE.parent
sys.path.insert(0, os.environ.get('UNIMIND_LOGO_FONTTOOLS', 'C:/Users/Ahmed/AppData/Local/Temp/unimind-logo-font-tools'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
sys.path.insert(0, str(BASE.parents[3] / '.agents/skills/logo-design/scripts'))
import render_png

NIGHT, PAPER, BLUE = '#0c1823', '#ecf3f9', '#3977f7'
for folder in ('svg', 'png', 'icons', 'previews', 'provenance'):
    (BASE / folder).mkdir(parents=True, exist_ok=True)
for name in ('manrope-variable.ttf', 'manrope-ofl.txt', 'font-source.txt'):
    (BASE / 'provenance' / name).write_bytes((LOGO / 'round-2/provenance' / name).read_bytes())

def write(name, value):
    (BASE / name).write_text(value, encoding='utf-8', newline='\n')

def tidy(d):
    def number(m):
        return str(round(float(m.group()), 2)).rstrip('0').rstrip('.') if '.' in str(round(float(m.group()), 2)) else str(round(float(m.group()), 2))
    return re.sub(r'-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?', number, d)

def word(weight):
    font = instantiateVariableFont(TTFont(BASE / 'provenance/manrope-variable.ttf'), {'wght': weight}, inplace=False)
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale, cursor, paths, boxes = 158 / font['head'].unitsPerEm, 0, [], []
    for char in 'UniMind':
        name = cmap[ord(char)]
        transform = (scale, 0, 0, -scale, 294 + cursor * scale, 185)
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, transform))
        paths.append(tidy(pen.getCommands()))
        bp = BoundsPen(glyphs)
        glyphs[name].draw(TransformPen(bp, transform))
        boxes.append(bp.bounds)
        cursor += font['hmtx'][name][0] - 10
    bounds = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    return paths, bounds

words, word_bounds = word(650)
white_words, _ = word(640)  # Slightly lighter pure-white reverse, without changing letter construction.
LEFT = 'M40 48C70 49 96 59 112 78V208C92 190 64 182 40 182Q32 182 32 174V56Q32 48 40 48Z'
RIGHT = 'M216 48C186 49 160 59 144 78V208C164 190 192 182 216 182Q224 182 224 174V56Q224 48 216 48Z'
REVERSE_LEFT = 'M40.5 48.6C70 49.6 96 59.6 111.4 78.4V206.8C92 189.4 64 181.4 40.5 181.4Q32.6 181.4 32.6 173.5V56.5Q32.6 48.6 40.5 48.6Z'
REVERSE_RIGHT = 'M215.5 48.6C186 49.6 160 59.6 144.6 78.4V206.8C164 189.4 192 181.4 215.5 181.4Q223.4 181.4 223.4 173.5V56.5Q223.4 48.6 215.5 48.6Z'
SMALL_LEFT = 'M40 48C70 49 92 59 104 78V208C88 190 64 182 40 182Q32 182 32 174V56Q32 48 40 48Z'
SMALL_RIGHT = 'M216 48C186 49 164 59 152 78V208C168 190 192 182 216 182Q224 182 224 174V56Q224 48 216 48Z'
TREATMENTS = {'light': (NIGHT, BLUE), 'dark': (PAPER, BLUE), 'black': ('#000000', '#000000'), 'white': ('#ffffff', '#ffffff'), 'blue': (BLUE, BLUE)}

def symbol(mode, small=False):
    paths = [SMALL_LEFT, SMALL_RIGHT] if small else ([REVERSE_LEFT, REVERSE_RIGHT] if mode == 'white' else [LEFT, RIGHT])
    return ''.join(f'<path fill="{color}" d="{d}"/>' for color, d in zip(TREATMENTS[mode], paths))

def lettering(mode):
    return ''.join(f'<path fill="{TREATMENTS[mode][0]}" d="{d}"/>' for d in (white_words if mode == 'white' else words))

word_w = math.ceil(word_bounds[2] - word_bounds[0] + 64)
word_h = math.ceil(word_bounds[3] - word_bounds[1] + 64)
ART = {}
def save_svg(name, w, h, body, tiled=False):
    doc = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}"><title>UniMind Open Folio</title>{body}</svg>\n'
    write(name, doc)
    ART[name] = {'width': w, 'height': h, 'body': body, 'tiled': tiled}

for mode in TREATMENTS:
    name = f'svg/unimind-open-folio'
    save_svg(f'{name}-horizontal-{mode}.svg', 944, 256, symbol(mode) + lettering(mode))
    save_svg(f'{name}-symbol-{mode}.svg', 256, 256, symbol(mode))
    offset = (round(32-word_bounds[0], 2), round(32-word_bounds[1], 2))
    save_svg(f'{name}-wordmark-{mode}.svg', word_w, word_h, f'<g transform="translate({offset[0]} {offset[1]})">{lettering(mode)}</g>')
    sx = round(320 - (word_bounds[0]+word_bounds[2])/2, 2)
    sy = round(265 - word_bounds[1], 2)
    save_svg(f'{name}-stacked-{mode}.svg', 664, 432, f'<g transform="translate(204 1)">{symbol(mode)}</g><g transform="translate({sx+12} {sy})">{lettering(mode)}</g>')
    save_svg(f'{name}-symbol-small-{mode}.svg', 256, 256, symbol(mode, True))

save_svg('icons/favicon-light.svg', 256, 256, symbol('light', True))
save_svg('icons/favicon-dark.svg', 256, 256, symbol('dark', True))
save_svg('icons/favicon.svg', 256, 256, f'<rect width="256" height="256" rx="40" fill="{NIGHT}"/>'+symbol('dark', True), True)
for kind, scale in (('app-icon', 1.6), ('maskable-icon', 1.2)):
    offset = (512-256*scale)/2
    save_svg(f'icons/{kind}.svg', 512, 512, f'<rect width="512" height="512" fill="{NIGHT}"/><g transform="translate({offset} {offset}) scale({scale})">{symbol("dark")}</g>', True)

# Transparent exports and opaque platform icon files are rendered at their exact target sizes.
JOBS = []
for form, w in (('horizontal', 1888), ('stacked', 1328), ('wordmark', word_w*2), ('symbol', 512)):
    for mode in ('light', 'dark', 'black', 'white', 'blue'):
        source = f'svg/unimind-open-folio-{form}-{mode}.svg'
        h = round(w * ART[source]['height'] / ART[source]['width'])
        JOBS.append((source, f'png/unimind-open-folio-{form}-{mode}.png', w, h))
for mode in ('light', 'dark', 'black', 'white'):
    for s in (16, 24, 32):
        JOBS.append((f'svg/unimind-open-folio-symbol-small-{mode}.svg', f'png/unimind-open-folio-symbol-small-{mode}-{s}.png', s, s))
for s in (16, 32, 48):
    JOBS.append(('icons/favicon.svg', f'icons/favicon-{s}.png', s, s))
for name, s, src in (('apple-touch-icon',180,'app-icon'), ('icon-192',192,'app-icon'), ('icon-512',512,'app-icon'), ('maskable-512',512,'maskable-icon')):
    JOBS.append((f'icons/{src}.svg', f'icons/{name}.png', s, s))

atlas_width, x, y, row_h, placements = 2048, 0, 0, 0, []
for src, dest, w, h in JOBS:
    if x + w > atlas_width:
        x, y, row_h = 0, y+row_h+8, 0
    placements.append((src, dest, x, y, w, h))
    x += w+8
    row_h = max(row_h, h)
atlas_h = y + row_h
pieces = []
for src, dest, x, y, w, h in placements:
    a = ART[src]
    pieces.append(f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 {a["width"]} {a["height"]}">{a["body"]}</svg>')
write('previews/export-atlas.svg', f'<svg xmlns="http://www.w3.org/2000/svg" width="{atlas_width}" height="{atlas_h}">{"".join(pieces)}</svg>\n')
render_png.render(str(BASE/'previews/export-atlas.svg'), str(BASE/'previews/export-atlas.png'), atlas_width, atlas_h)
atlas = Image.open(BASE/'previews/export-atlas.png')
for src, dest, x, y, w, h in placements:
    atlas.crop((x,y,x+w,y+h)).save(BASE/dest)
render_png.write_ico([str(BASE/f'icons/favicon-{s}.png') for s in (16,32,48)], str(BASE/'icons/favicon.ico'))
write('icons/site.webmanifest', json.dumps({'name':'UniMind','short_name':'UniMind','icons':[{'src':'icon-192.png','sizes':'192x192','type':'image/png','purpose':'any'},{'src':'icon-512.png','sizes':'512x512','type':'image/png','purpose':'any'},{'src':'maskable-512.png','sizes':'512x512','type':'image/png','purpose':'maskable'}]},indent=2)+'\n')
write('export-spec.json', json.dumps({'approvalCommit':'2bb133c7a6621e61ebc7e1279df6c672ff706ea8','pngExports':[{'source':a,'path':b,'width':c,'height':d} for a,b,c,d in JOBS]},indent=2)+'\n')

# The presentation board includes six study-brand contexts; none is an application screenshot.
def label(x,y,value,size=20,color=NIGHT,weight=400,extra=''):
    return f'<text x="{x}" y="{y}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" fill="{color}" font-weight="{weight}" {extra}>{html.escape(value)}</text>'
def placed(name,x,y,w,h):
    a = ART[name]
    return f'<svg x="{x}" y="{y}" width="{w}" height="{h}" viewBox="0 0 {a["width"]} {a["height"]}">{a["body"]}</svg>'

board = ['<rect width="1440" height="1720" fill="#f4f6f7"/>',label(48,62,'UniMind / Open Folio',36,weight=700),label(48,102,'Approved direction · production kit · original symbol / outlined Manrope',19,'#53606b')]
board += [f'<rect x="48" y="136" width="1344" height="240" rx="12" fill="{NIGHT}"/>',placed('svg/unimind-open-folio-horizontal-dark.svg',90,162,790,188),placed('svg/unimind-open-folio-stacked-dark.svg',1050,154,248,202)]
board += [label(48,425,'Light / dark / one color',24,weight=650)]
for i,mode in enumerate(('light','dark','black','white','blue')):
    xx=48+i*272
    bg = NIGHT if mode in ('dark','white') else '#ffffff'
    board += [f'<rect x="{xx}" y="450" width="256" height="120" rx="8" fill="{bg}"/>',placed(f'svg/unimind-open-folio-horizontal-{mode}.svg',xx+14,471,228,72),label(xx,597,mode,16,'#53606b')]
board += [label(48,649,'In study-brand contexts',24,weight=650),label(48,679,'Standalone examples with synthetic labels; application integration remains with the frontend owner.',16,'#53606b')]
for index,title in enumerate(('English desktop header','Arabic desktop header','English compact header','Arabic compact header','Study-guide cover','App / browser icons')):
    xx=48+(index%2)*688
    yy=710+(index//2)*292
    board += [f'<rect x="{xx}" y="{yy}" width="656" height="264" rx="10" fill="#ffffff"/>',label(xx+20,yy+34,title,18,weight=650)]
    if index in (0,1,2,3):
        bw=320 if index in (2,3) else 608
        bx=xx+(656-bw)/2
        board.append(f'<rect x="{bx}" y="{yy+56}" width="{bw}" height="180" rx="6" fill="{NIGHT}"/>')
        rtl=index in (1,3)
        logo_w=144 if index in (2,3) else 200
        logo_x=bx+bw-logo_w-16 if rtl else bx+16
        board.append(placed('svg/unimind-open-folio-horizontal-dark.svg',logo_x,yy+68,logo_w,55))
        board.append(label(bx+bw-20 if rtl else bx+20,yy+164,'مكتبة الدراسة' if rtl else 'Your study shelf',24,PAPER,650,'direction="rtl" text-anchor="start"' if rtl else ''))
        board.append(label(bx+bw-20 if rtl else bx+20,yy+207,'موادك في مكان واحد' if rtl else 'Your materials, together',17,'#c8d1d8',extra='direction="rtl" text-anchor="start"' if rtl else ''))
    elif index==4:
        board += [f'<rect x="{xx+22}" y="{yy+54}" width="610" height="188" rx="3" fill="{PAPER}"/>',placed('svg/unimind-open-folio-horizontal-light.svg',xx+44,yy+70,240,65),label(xx+44,yy+184,'Study notes',30,weight=650),label(xx+44,yy+219,'Synthetic cover example',16,'#53606b')]
    else:
        board += [placed('icons/app-icon.svg',xx+24,yy+64,128,128),placed('icons/maskable-icon.svg',xx+176,yy+64,128,128)]
        for i,s in enumerate((16,24,32,48)):
            board += [placed('icons/favicon.svg',xx+340+i*66,yy+108,s,s),label(xx+340+i*66,yy+179,f'{s}px',14,'#53606b')]
        board.append(label(xx+24,yy+222,'Square and maskable tiles · 16–48 px favicon ladder',16,'#53606b'))
board += [label(48,1651,'The approved silhouette stays unchanged. Small icons open the gutter; white reverse receives optical thinning.',17,'#53606b')]
write('previews/kit-overview.svg','<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1720">'+''.join(board)+'</svg>\n')
render_png.render(str(BASE/'previews/kit-overview.svg'),str(BASE/'previews/kit-overview.png'),1440,1720)

# Actual RTL/LTR HTML containers, with embedded 320 px header examples.
contexts=[]
for locale in ('en','ar'):
    for theme in ('light','dark'):
        for width in (608,320):
            rtl=locale=='ar'
            title='مكتبة الدراسة' if rtl else 'Your study shelf'
            copy='موادك في مكان واحد' if rtl else 'Your materials, together'
            contexts.append(f'<section><h2>{locale} / {theme} / {width}px container</h2><article lang="{locale}" dir="{"rtl" if rtl else "ltr"}" class="{theme}" style="inline-size:{width}px"><header><img class="brand" dir="ltr" src="../svg/unimind-open-folio-horizontal-{theme}.svg" width="944" height="256" alt="UniMind"><span>{"العربية" if rtl else "English"}</span></header><h3>{title}</h3><p>{copy}</p></article></section>')
write('previews/layout-examples.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UniMind Open Folio layout examples</title><style>html{font-family:Segoe UI,Arial,sans-serif;background:#f4f6f7;color:'+NIGHT+'}body{margin:32px}h1{font-size:28px}h2{font-size:14px;font-weight:500}main{display:grid;grid-template-columns:1fr 1fr;gap:24px}section{min-inline-size:0}article{box-sizing:border-box;max-inline-size:100%;padding:16px;background:white;border:1px solid #c8d1d8;border-radius:8px}.dark{background:'+NIGHT+';color:'+PAPER+'}header{display:flex;align-items:center;justify-content:space-between;gap:12px}.brand{inline-size:200px;max-inline-size:70%;block-size:auto;direction:ltr;flex-shrink:1}article[style*="320"] .brand{inline-size:144px}header span{font-size:12px;white-space:nowrap}h3{font-size:24px;line-height:1.5;margin-block:28px 4px}p{margin-block:0 8px}article[lang=ar]{font-family:Noto Sans Arabic,Segoe UI,Arial,sans-serif}@media(max-width:720px){main{grid-template-columns:1fr}body{margin:16px}}</style><h1>UniMind / English and Arabic placement</h1><p>Standalone asset examples with synthetic text. These are not application screenshots.</p><main>'+''.join(contexts)+'</main></html>\n')
render_png.screenshot_html(str(BASE/'previews/layout-examples.html'),str(BASE/'previews/layout-examples.png'),1440,1460)

# Asset inspection ladder at the contractual minimum sizes, including actual PNG icons.
ladder=['<rect width="1200" height="600" fill="#ffffff"/>',label(24,40,'Open Folio / minimum-size and clear-space proof',24,weight=650)]
for i,(form,w,h) in enumerate((('horizontal',144,39),('stacked',128,83),('wordmark',96,27),('symbol-small',16,16))):
    xx=30+i*292
    ladder += [label(xx,90,form,17),placed(f'svg/unimind-open-folio-{form}-light.svg',xx,110,w,h),f'<rect x="{xx}" y="220" width="264" height="150" fill="{NIGHT}"/>',placed(f'svg/unimind-open-folio-{form}-dark.svg',xx+12,232,w,h),label(xx,402,f'{w} px wide',16,'#53606b')]
ladder += [label(24,455,'Clear space: 32 master units (the normal page gutter) beyond the SVG artboard.',18),label(24,489,'Use the small symbol at 16–24 px. Keep book and Latin lettering intact in Arabic layouts.',18)]
write('previews/size-proof.svg','<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600">'+''.join(ladder)+'</svg>\n')
render_png.render(str(BASE/'previews/size-proof.svg'),str(BASE/'previews/size-proof.png'),1200,600)
print(f'Built {len(ART)} SVG masters/icons, {len(JOBS)} exact-size PNGs, multi-resolution ICO, manifest and inspected preview sheets.')
