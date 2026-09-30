"""Book-led concept proposals; not a final kit. Original symbols, outlined Manrope."""
from pathlib import Path
import sys
import os
import html

BASE = Path(__file__).parent
sys.path.insert(0, os.environ.get('UNIMIND_LOGO_FONTTOOLS', 'C:/Users/Ahmed/AppData/Local/Temp/unimind-logo-font-tools'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
sys.path.insert(0, str(BASE.parents[3] / '.agents/skills/logo-design/scripts'))
import render_png

ROUND = int(sys.argv[1]) if len(sys.argv) > 1 else 2
NIGHT, PAPER, BLUE = '#0c1823', '#ecf3f9', '#3977f7'
font = instantiateVariableFont(TTFont(BASE / 'provenance/manrope-variable.ttf'), {'wght': 650}, inplace=False)
glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
upm = font['head'].unitsPerEm
cursor, letters = 0, []
for char in 'UniMind':
    name = cmap[ord(char)]
    pen = SVGPathPen(glyphs)
    glyphs[name].draw(pen)
    letters.append(f'<path transform="translate({cursor} 0)" d="{pen.getCommands()}"/>')
    cursor += font['hmtx'][name][0] - 10
scale = 158 / upm
word_width = cursor * scale
W = round(294 + word_width + 28)

gap = 12 if ROUND == 1 else 16
left_inner, right_inner = 128 - gap, 128 + gap
folio_left = f'M40 48C70 49 96 59 {left_inner} 78V208C92 190 64 182 40 182Q32 182 32 174V56Q32 48 40 48Z'
folio_right = f'M216 48C186 49 160 59 {right_inner} 78V208C164 190 192 182 216 182Q224 182 224 174V56Q224 48 216 48Z'
turn_left = f'M40 74C70 76 96 92 {left_inner} 110V212C90 192 64 180 40 178Q32 178 32 170V82Q32 73 40 74Z'
turn_right = f'M{right_inner} 110C162 80 186 54 216 42Q224 39 224 49V168Q224 176 216 178C188 184 164 195 {right_inner} 212Z'
# Two pages held by a U-shaped binding, with a genuine open gutter cut into the top.
# This one-color alternative joins the leaves instead of splitting them by color.
bound = ('M40 52C68 53 98 65 120 84V170Q120 186 128 186Q136 186 136 170V84C158 65 188 53 216 52Q224 52 224 60V176C224 204 186 224 128 224S32 204 32 176V60Q32 52 40 52Z'
         if ROUND == 1 else
         'M40 52C68 53 96 65 116 84V164Q116 184 128 184Q140 184 140 164V84C160 65 188 53 216 52Q224 52 224 60V176C224 204 186 220 128 220S32 204 32 176V60Q32 52 40 52Z')
items = [
    ('01-open-folio', 'Open Folio', 'A calm, open spread with generous breathing room.', [folio_left, folio_right]),
    ('02-page-turn', 'Page Turn', 'A lifted page gives the book a little movement.', [turn_left, turn_right]),
    ('03-bound-u', 'Bound U', 'Two pages share a curved binding that quietly forms a U.', [bound]),
]

def symbol(paths, mode):
    colors = ([PAPER, BLUE] if mode == 'dark' else [NIGHT, BLUE]) if len(paths) == 2 else ([PAPER] if mode == 'dark' else [NIGHT])
    if mode == 'mono': colors = ['#111111'] * len(paths)
    correction = ' transform="translate(0 -8)"' if len(paths) == 1 and ROUND >= 2 else ''
    return ''.join(f'<path fill="{color}"{correction} d="{path}"/>' for color, path in zip(colors, paths))

def lockup(paths, mode):
    color = PAPER if mode == 'dark' else NIGHT
    return symbol(paths, mode) + f'<g fill="{color}" transform="translate(294 185) scale({scale:.6f} {-scale:.6f})">{"".join(letters)}</g>'

for key, name, _, paths in items:
    for suffix, vb, content in (('', '0 0 256 256', symbol(paths, 'dark')), ('-mono', '0 0 256 256', symbol(paths, 'mono')), ('-lockup', f'0 0 {W} 256', lockup(paths, 'dark'))):
        svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><title>UniMind {name} — round 2 proposal</title>{content}</svg>\n'
        (BASE / f'{key}{suffix}-v{ROUND}.svg').write_text(svg, encoding='utf-8', newline='\n')

SW, SH = 1440, 1300
parts = [f'<rect width="{SW}" height="{SH}" fill="#f5f6f4"/>']
def text(x, y, s, size, fill=NIGHT, weight=400):
    return f'<text x="{x}" y="{y}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}">{html.escape(s)}</text>'
parts += [text(48, 64, 'UniMind / A closer direction', 38, weight=700), text(48, 105, 'Round 2 / Open books, softer lettering, the existing blue-and-night palette', 21, '#53606b')]
for i, (key, name, note, paths) in enumerate(items):
    y = 150 + i * 368
    parts.append(f'<rect x="48" y="{y}" width="1344" height="340" rx="16" fill="#ffffff" stroke="#dfe4e7"/>')
    parts += [text(76, y + 43, f'{i+1:02d} / {name}', 25, weight=650), text(76, y + 73, note, 18, '#53606b')]
    parts.append(f'<rect x="76" y="{y+98}" width="796" height="184" rx="10" fill="{NIGHT}"/>')
    parts.append(f'<svg x="100" y="{y+111}" width="748" height="158" viewBox="0 0 {W} 256">{lockup(paths,"dark")}</svg>')
    parts.append(f'<svg x="926" y="{y+115}" width="430" height="124" viewBox="0 0 {W} 256">{lockup(paths,"light")}</svg>')
    sx = 948
    for s in (64, 32, 16):
        parts.append(f'<svg x="{sx}" y="{y+236+64-s}" width="{s}" height="{s}" viewBox="0 0 256 256">{symbol(paths,"mono")}</svg>')
        parts.append(text(sx, y+321, f'{s}px', 12, '#53606b'))
        sx += s + 28
    parts.append(text(92, y + 318, 'Dark context', 13, '#53606b'))
doc = f'<svg xmlns="http://www.w3.org/2000/svg" width="{SW}" height="{SH}" viewBox="0 0 {SW} {SH}">{"".join(parts)}</svg>\n'
(BASE / f'concept-sheet-v{ROUND}.svg').write_text(doc, encoding='utf-8', newline='\n')
renderer = render_png.render(str(BASE / f'concept-sheet-v{ROUND}.svg'), str(BASE / f'concept-sheet-v{ROUND}.png'), SW, SH)
print('Built and rendered book-led round', ROUND, 'via', renderer, '; wordmark: outlined Manrope 650.')
