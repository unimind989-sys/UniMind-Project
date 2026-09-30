"""Reject structural/transparency defects in review artwork; bind proof to file hashes."""
from pathlib import Path
import hashlib
import json
import xml.etree.ElementTree as ET
from PIL import Image

BASE = Path(__file__).parent
KEYS = ('a-sourcefold', 'b-focus-shelf', 'c-common-ground', 'd-mindwave')
hashes = {}
for key in KEYS:
    for suffix in ('', '-lockup'):
        path = BASE / 'concepts' / f'{key}{suffix}.svg'
        root = ET.parse(path).getroot()
        assert 'viewBox' in root.attrib
        assert len(list(root.iter('{http://www.w3.org/2000/svg}path'))) > 0
        for node in root.iter():
            tag = node.tag.split('}')[-1]
            assert tag in ('svg', 'title', 'g', 'path'), (path, tag)
            assert 'stroke' not in node.attrib and 'filter' not in node.attrib
            assert 'href' not in node.attrib
        hashes[path.relative_to(BASE).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()

for key in KEYS:
    if key == 'd-mindwave':
        path = BASE / 'd-transparency-inspection.png'
    else:
        path = BASE / 'exploration/2026-09-30/renders' / f'{key}-v2.png'
        # Reuse existing transparent render only when the final symbol path is identical.
        old = ET.parse(BASE / 'exploration/2026-09-30' / f'{key}-v2.svg').getroot()
        new = ET.parse(BASE / 'concepts' / f'{key}.svg').getroot()
        assert [x.attrib['d'] for x in old.iter('{http://www.w3.org/2000/svg}path')] == [x.attrib['d'] for x in new.iter('{http://www.w3.org/2000/svg}path')]
    im = Image.open(path)
    assert im.mode == 'RGBA'
    assert im.getchannel('A').getextrema() == (0, 255)
    assert all(im.getpixel(pos)[3] == 0 for pos in ((0, 0), (im.width-1, 0), (0, im.height-1), (im.width-1, im.height-1)))

def luminance(h):
    channels = [int(h[i:i+2], 16) / 255 for i in (1, 3, 5)]
    linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in channels]
    return sum(v * k for v, k in zip(linear, (.2126, .7152, .0722)))

contrasts = {}
for fg, bg in (('#111111', '#ffffff'), ('#ffffff', '#0c1823')):
    light, dark = sorted((luminance(fg), luminance(bg)), reverse=True)
    ratio = (light + .05) / (dark + .05)
    assert ratio >= 4.5
    contrasts[f'{fg} on {bg}'] = round(ratio, 2)
for name in ('concept-review.svg', 'concept-review.png', 'layout-preview.html', 'layout-preview.png'):
    hashes[name] = hashlib.sha256((BASE / name).read_bytes()).hexdigest()
report = {'scope': 'proposal artwork only; no final kit or approval', 'svgFiles': 8, 'transparentSymbolRenders': 4, 'contrastRatios': contrasts, 'sha256': hashes}
(BASE / 'review-manifest.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
print(json.dumps({k: v for k, v in report.items() if k != 'sha256'}))
