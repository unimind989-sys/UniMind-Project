"""Check proposal vectors and bind inspected review artwork to its exact bytes."""
from pathlib import Path
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from PIL import Image

BASE = Path(__file__).parent
sys.path.insert(0, str(BASE.parents[3] / '.agents/skills/logo-design/scripts'))
import render_png

keys = ('01-open-folio', '02-page-turn', '03-bound-u')
hashes = {}
for key in keys:
    for suffix in ('', '-mono', '-lockup'):
        path = BASE / f'{key}{suffix}-v2.svg'
        root = ET.parse(path).getroot()
        assert 'viewBox' in root.attrib
        assert len(list(root.iter('{http://www.w3.org/2000/svg}path'))) > 0
        for node in root.iter():
            assert node.tag.split('}')[-1] in ('svg', 'title', 'g', 'path')
            assert not any(attr in node.attrib for attr in ('stroke', 'filter', 'href'))
        hashes[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
    render_path = BASE / f'{key}-transparency-inspection.png'
    render_png.render(str(BASE / f'{key}-v2.svg'), str(render_path), 256, 256)
    im = Image.open(render_path)
    assert im.mode == 'RGBA'
    assert im.getchannel('A').getextrema() == (0, 255)
    assert all(im.getpixel(pos)[3] == 0 for pos in ((0, 0), (255, 0), (0, 255), (255, 255)))
    hashes[render_path.name] = hashlib.sha256(render_path.read_bytes()).hexdigest()

def luminance(h):
    channels = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels]
    return sum(v * k for v, k in zip(linear, (.2126, .7152, .0722)))

contrasts = {}
for fg, bg in (('#ecf3f9', '#0c1823'), ('#0c1823', '#ffffff'), ('#3977f7', '#0c1823'), ('#3977f7', '#ffffff')):
    light, dark = sorted((luminance(fg), luminance(bg)), reverse=True)
    ratio = (light + .05) / (dark + .05)
    assert ratio >= (3 if fg == '#3977f7' else 4.5)
    contrasts[f'{fg} on {bg}'] = round(ratio, 2)
for name in ('concept-sheet-v2.svg', 'concept-sheet-v2.png', 'provenance/manrope-variable.ttf', 'provenance/manrope-ofl.txt'):
    hashes[name] = hashlib.sha256((BASE / name).read_bytes()).hexdigest()
report = {'scope': 'round 2 concepts only; not approved or a production kit', 'svgFiles': 9, 'transparentSymbolRenders': 3, 'contrastRatios': contrasts, 'sha256': hashes}
(BASE / 'review-manifest.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps({k: v for k, v in report.items() if k != 'sha256'}))
