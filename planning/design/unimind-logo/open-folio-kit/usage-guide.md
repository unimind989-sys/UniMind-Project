# UniMind Open Folio — usage guide

The open book is the approved identifier. Use the supplied outlined lettering; keep the page order and logo proportions intact.

| Use | Choose |
| --- | --- |
| Main header | Horizontal, `dark` on night or `light` on white/paper |
| Square composition or cover | Stacked |
| Compact navigation or avatar | Symbol |
| 16–24 px mark | Symbol-small; wider 48-unit page gutter |
| One-color reproduction | Black, white or blue; white has a slightly lighter optical drawing |

Masters are in `svg/`; matching transparent raster exports are in `png/`. Horizontal PNGs are 1888 × 512; stacked 1328 × 864; symbols 512 × 512. Wordmark PNG dimensions follow their master. Raster icons are drawn at their exact 16/24/32/48/180/192/512 px sizes, without resizing a larger export.

**Clear space:** leave at least 32 master units beyond the SVG artboard on every side, scaled with the image. This equals the standard book's page gutter. Example: a 200 px horizontal image needs 200 × 32 / 944 = 6.8 px outside space. Icon tiles include their own safe margins and are exempt from this outside-space rule.

| Version | Minimum screen width | Suggested print width |
| --- | --- | --- |
| Horizontal | 144 px | 30 mm |
| Stacked | 128 px | 25 mm |
| Wordmark | 96 px | 20 mm |
| Normal symbol | 32 px | 7 mm |
| Small symbol | 16 px | Use normal symbol for print |

Screen minima were visually inspected at native size. Print minima are starting points for a printer's material proof, not physical tests. Below the horizontal minimum use the symbol with an accessible UniMind name; do not shrink the full logo further.

| Color | HEX | RGB | CMYK starting point, unprofiled |
| --- | --- | --- | --- |
| Night | `#0c1823` | 12, 24, 35 | 66, 31, 0, 86 |
| Paper | `#ecf3f9` | 236, 243, 249 | 5, 2, 0, 2 |
| Cobalt | `#3977f7` | 57, 119, 247 | 77, 52, 0, 3 |
| Black / white mono | `#000000` / `#ffffff` | 0 / 255 in each channel | 0, 0, 0, 100 / 0, 0, 0, 0 |

SVG and PNG files use RGB values. A printer must convert and proof for the target ICC profile; Pantone matches are not specified. Use black for reliable single-ink reproduction. This kit does not redefine the application palette.

**Background pairs:** full-color light on white or paper; full-color dark on night/deep-night; white on night/deep-night or cobalt; black on white/paper. Blue mono works on white or night for brand graphics. Use white instead of the two-color dark logo on focused/active surfaces where cobalt loses contrast. Place the mark on a quiet solid field when imagery is busy. All vector logos and their PNGs are transparent; the favicon tile and platform app icons intentionally contain a night background.

**English/Arabic:** the approved Latin name stays UniMind in either locale. Keep the entire logo as one image with `dir="ltr"`, position its container with logical CSS, and retain the book on the left of its lettering. Never mirror the pages, reorder the lettering or invent an Arabic wordmark. The Arabic examples use Arabic interface labels beside the same logo.

**Typography:** logo outlines derive from Manrope at weight 650 with the approved spacing. Pure-white reverse uses weight 640 and a 0.6-unit inset on the normal page silhouettes. The small symbol prioritizes its wider opening. Interface type stays Manrope/Noto Sans Arabic per DESIGN.md; the raster layout samples use system fallback where those UI fonts are unavailable. License and original font source are in `provenance/`.

Keep a uniform scale. Preserve exact colors, clear space and the supplied lockups. Avoid effects, extra outlines, gradients, rotations and improvised letter spacing. See `previews/kit-overview.png`, `previews/size-proof.png` and `previews/layout-examples.png` for usage examples.
