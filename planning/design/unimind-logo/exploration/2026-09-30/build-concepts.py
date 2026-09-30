"""Local review proposals only. Hand-drawn paths; no font or network dependency."""
from pathlib import Path
import sys

OUT = Path(__file__).parent
ROUND = int(sys.argv[1]) if len(sys.argv) > 1 else 2

symbols = {
    "a-sourcefold": (
        'M40 40H80V136C80 166 98 184 128 184S176 166 176 136V40H216V136C216 190 182 224 128 224S40 190 40 136Z'
        if ROUND == 1 else
        'M40 40H80V128C80 158 98 176 128 176S176 158 176 128V80L216 40V128C216 182 182 216 128 216S40 182 40 128Z'
    ),
    "b-focus-shelf": (
        'M40 40H216V64H40Z M40 96H128V120H40Z M40 152H128V176H40Z M160 96H216V216H160Z'
        if ROUND == 1 else
        'M40 40H216V72H40Z M40 112H128V144H40Z M40 184H128V216H40Z M160 112H216V216H160Z'
    ),
    "c-common-ground": (
        'M112 32V72C80 80 64 100 64 128S80 176 112 184V224C56 216 24 180 24 128S56 40 112 32Z M144 32C200 40 232 76 232 128S200 216 144 224V184C176 176 192 156 192 128S176 80 144 72Z M112 112H144V144H112Z'
        if ROUND == 1 else
        'M112 32V72C84 80 68 100 68 128S84 176 112 184V224C58 216 24 180 24 128S58 40 112 32Z M144 32C198 40 232 76 232 128S198 216 144 224V184C172 176 188 156 188 128S172 80 144 72Z M104 104H152V152H104Z'
    ),
}

# Original geometric lettering, held constant so the symbol is the review variable.
# Consistent 12-unit stems, curved U/n bowls, square dots, open M valley.
glyphs = [
    (0, 'M0 0H12V48C12 64 20 72 34 72S56 64 56 48V0H68V48C68 72 55 84 34 84S0 72 0 48Z'),
    (84, 'M0 24H12V30C18 24 25 22 32 22C49 22 58 32 58 50V82H46V50C46 38 41 33 31 33S12 39 12 52V82H0Z'),
    (160, 'M0 0H12V12H0Z M0 24H12V82H0Z'),
    (192, 'M0 0H14L40 42L66 0H80V82H68V21L40 65L12 21V82H0Z'
     if ROUND <= 2 else 'M0 0H14L40 45.033L66 0H80V82H68V14L40 62.497L12 14V82H0Z'),
    (290, 'M0 0H12V12H0Z M0 24H12V82H0Z'),
    (320, 'M0 24H12V30C18 24 25 22 32 22C49 22 58 32 58 50V82H46V50C46 38 41 33 31 33S12 39 12 52V82H0Z'),
    (396, 'M46 0H58V82H46V76C40 82 33 84 26 84C10 84 0 72 0 53S10 22 26 22C34 22 40 25 46 30Z M12 53C12 66 18 73 28 73S46 66 46 53S39 33 28 33S12 40 12 53Z'),
]

def svg(vb, title, content):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><title>{title} — unapproved UniMind concept</title>{content}</svg>\n'

for key, path in symbols.items():
    art = f'<path fill="#111111" d="{path}"/>'
    (OUT / f'{key}-v{ROUND}.svg').write_text(svg('0 0 256 256', key, art), encoding='utf-8')
    lettering = ''.join(f'<path transform="translate({x} 0)" fill="#111111" fill-rule="evenodd" d="{d}"/>' for x, d in glyphs)
    lockup = art + f'<g transform="translate(284 67) scale(1.4)">{lettering}</g>'
    (OUT / f'{key}-lockup-v{ROUND}.svg').write_text(svg('0 0 940 256', key, lockup), encoding='utf-8')
print(f'Wrote 3 symbols and 3 exploratory lockups, round {ROUND}.')
