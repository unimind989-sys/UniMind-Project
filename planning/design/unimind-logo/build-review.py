"""Four review concepts; no selected identity or production kit."""
from pathlib import Path
import html
import sys

BASE = Path(__file__).parent
SKILL = BASE.parents[2] / '.agents' / 'skills' / 'logo-design' / 'scripts'
sys.path.insert(0, str(SKILL))
import render_png
import concept_sheet

CONCEPTS = BASE / 'concepts'
CONCEPTS.mkdir(exist_ok=True)
src = BASE / 'exploration' / '2026-09-30'
items = [
    ('a-sourcefold', 'Sourcefold', 'A folded U: source material becomes understanding.', 'Project direction / Letterform'),
    ('b-focus-shelf', 'Focus Shelf', 'One expanded study plate among ordered shelves.', 'Project direction / Abstract'),
    ('c-common-ground', 'Common Ground', 'Two boundaries hold one shared knowledge pool.', 'Project direction / Abstract'),
    ('d-mindwave', 'Mindwave', 'A flowing m with a curled tail: curiosity keeps moving.', 'Personal direction / Expressive letterform'),
]

for key, _, _, _ in items[:3]:
    for kind in ('', '-lockup'):
        raw = (src / f'{key}{kind}-v3.svg').read_text(encoding='utf-8')
        (CONCEPTS / f'{key}{kind}.svg').write_text(raw, encoding='utf-8', newline='\n')

# D is deliberately soft, animated and informal rather than shelf-derived.
# One contour, two rolling arches, short center stem and a curled right exit.
d1 = 'M24 216V104C24 60 48 32 84 32C106 32 122 42 132 60C144 42 160 32 180 32C216 32 240 60 240 104V160C240 196 218 216 180 216H168V176H180C194 176 200 170 200 156V104C200 82 192 72 180 72C162 72 152 86 152 112V184H112V112C112 86 104 72 84 72C70 72 64 82 64 104V216Z'
d2 = 'M24 216V104C24 60 48 32 84 32C106 32 122 42 132 60C144 42 160 32 180 32C216 32 240 60 240 104V160C240 196 218 216 180 216H168V180H180C194 180 204 172 204 156V104C204 82 194 72 180 72C162 72 152 86 152 112V176H112V112C112 86 104 72 84 72C70 72 64 82 64 104V216Z'
for i, d in enumerate((d1, d2), 1):
    art = f'<path fill="#111111" d="{d}"/>'
    raw = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 264 256"><title>Mindwave — unapproved UniMind concept</title>{art}</svg>\n'
    (CONCEPTS / f'd-mindwave-v{i}.svg').write_text(raw, encoding='utf-8', newline='\n')
art = f'<path fill="#111111" d="{d2}"/>'
(CONCEPTS / 'd-mindwave.svg').write_text(raw, encoding='utf-8', newline='\n')
original = (src / 'a-sourcefold-lockup-v3.svg').read_text(encoding='utf-8')
lettering = original[original.index('<g '):original.rindex('</svg>')]
(CONCEPTS / 'd-mindwave-lockup.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 940 256"><title>Mindwave — unapproved UniMind concept</title>{art}{lettering}</svg>\n', encoding='utf-8', newline='\n')

W, H = 2048, 1024
parts = [f'<rect width="{W}" height="{H}" fill="#f7f7f4"/>']
font = 'font-family="Segoe UI,Arial,sans-serif"'
def label(x, y, value, size, color='#111111', weight=400):
    return f'<text x="{x}" y="{y}" {font} font-size="{size}" font-weight="{weight}" fill="{color}">{html.escape(value)}</text>'
parts += [label(48, 70, 'UniMind / Three directions + one personal take', 40, weight=700), label(48, 108, 'Concept checkpoint / A–C within the accepted identity / D explores my own taste', 21, '#666666')]
for i, (key, name, note, tag) in enumerate(items):
    x, y, cw = 48 + i * 492, 150, 476
    parts.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{810}" rx="18" fill="#ffffff" stroke="#d9d9d5"/>')
    parts.append(concept_sheet.embed(str(CONCEPTS / f'{key}.svg'), f'{key}-big', x + 90, y + 54, 296, 296))
    parts.append(concept_sheet.embed(str(CONCEPTS / f'{key}-lockup.svg'), f'{key}-name', x + 24, y + 382, 428, 117))
    sx = x + 32
    for s in (64, 32, 16):
        parts.append(concept_sheet.embed(str(CONCEPTS / f'{key}.svg'), f'{key}-{s}', sx, y + 530 + 64 - s, s, s))
        parts.append(label(sx, y + 615, f'{s}px', 13, '#666666'))
        sx += s + 32
    parts.append(label(x + 32, y + 665, f'{chr(65+i)} / {name}', 28, weight=700))
    for j, line in enumerate(concept_sheet.wrap(note, 39)):
        parts.append(label(x + 32, y + 707 + 26*j, line, 20, '#555555'))
    parts.append(label(x + 32, y + 785, tag, 14, '#666666'))
doc = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{"".join(parts)}</svg>'
(BASE / 'concept-review.svg').write_text(doc, encoding='utf-8', newline='\n')
renderer = render_png.render(str(BASE / 'concept-review.svg'), str(BASE / 'concept-review.png'), W, H)
print('Rendered four-concept sheet:', renderer)

# Render-only context examples. These are not exported production variants.
contexts = []
for key, name, _, tag in items:
    uri = 'concepts/' + key + '-lockup.svg'
    contexts.append(f'<article><h2>{html.escape(name)}</h2><p>{html.escape(tag)}</p><div class="sample light"><img src="{uri}" alt="UniMind"><span lang="en">Your study shelf</span></div><div class="sample dark"><img src="{uri}" alt="UniMind"><span lang="ar" dir="rtl">موادك الدراسية</span></div><div class="sample rtl" lang="ar" dir="rtl"><img src="{uri}" alt="UniMind"><span>موادك الدراسية</span></div></article>')
preview = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UniMind logo concepts</title><style>body{margin:32px;background:#ecf3f9;color:#0c1823;font:16px Segoe UI,Arial,sans-serif}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}article{border:1px solid #253a55;padding:20px;border-radius:14px}h2{margin:0 0 8px}p{color:#4c5763}.sample{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:24px;margin-top:16px;min-height:36px}.sample img{width:210px;height:auto;flex-shrink:0}.sample span{white-space:normal}.light,.rtl{background:#ffffff}.dark{background:#0c1823;color:#ecf3f9}.dark img{filter:brightness(0) invert(1)}.rtl{direction:rtl}.rtl img{direction:ltr}@media(max-width:800px){main{grid-template-columns:minmax(0,1fr)}article{min-width:0}h1{overflow-wrap:anywhere}body{margin:16px}.sample{flex-wrap:wrap}.sample img{width:160px;max-width:100%}}</style><h1>UniMind / Layout examples</h1><p>Review only. Latin artwork stays intact in English and Arabic contexts; no invented Arabic brand spelling.</p><main>'+''.join(contexts)+'</main></html>'
(BASE / 'layout-preview.html').write_text(preview, encoding='utf-8', newline='\n')
print('Wrote concepts and light/dark EN/AR layout examples; no kit.')
