# Frontend integration handoff

This kit belongs to `codex/unimind-logo-concepts`. Ahmed selected 01 Open Folio and requested the full kit. Application integration remains with the frontend agent after review. Do not cherry-pick this whole branch; it contains rejected exploration and private-to-task evidence structures. Copy only the production files listed below into your own branch.

## Exact source paths

All paths below are relative to `planning/design/unimind-logo/open-folio-kit/` in the isolated logo worktree.

| Placement | Source file |
| --- | --- |
| Current dark header | `svg/unimind-open-folio-horizontal-dark.svg` |
| Light header | `svg/unimind-open-folio-horizontal-light.svg` |
| Compact mark, 32 px and larger | `svg/unimind-open-folio-symbol-dark.svg` or `-light.svg` |
| Compact mark, 16–24 px | `svg/unimind-open-folio-symbol-small-dark.svg` or `-light.svg` |
| White mark on active/focused surfaces | `svg/unimind-open-folio-horizontal-white.svg` or `svg/unimind-open-folio-symbol-white.svg` |
| Square composition | `svg/unimind-open-folio-stacked-dark.svg` or `-light.svg` |
| Browser favicon | `icons/favicon.svg` and `icons/favicon.ico` |
| Apple touch icon | `icons/apple-touch-icon.png` |
| PWA icons | `icons/icon-192.png`, `icons/icon-512.png`, `icons/maskable-512.png`, `icons/site.webmanifest` |

Each master also has black, white and blue variants. Transparent PNG alternatives use the same base filenames in `png/`. `asset-manifest.json` gives exact paths and SHA-256 hashes for every packaged file. Preserve `provenance/manrope-ofl.txt` and source metadata wherever the source font is redistributed; no font is required to render the outlined logos.

Suggested destination: `public/brand/unimind/` for selected SVGs and `public/brand/unimind/icons/` for the entire icons directory. The webmanifest intentionally defines only names and relative icon files: it does not invent application `start_url`, scope, display mode or installation behavior. Resolve those through the frontend owner's existing application configuration.

## Placement example

```html
<img class="unimind-logo" dir="ltr"
     src="/brand/unimind/unimind-open-folio-horizontal-dark.svg"
     width="944" height="256" alt="UniMind">
```

```css
.unimind-logo {
  inline-size: 12.5rem;
  block-size: auto;
  direction: ltr;
}
```

Select the asset using the application's actual theme, preserve its aspect ratio, and keep at least 32/944 of its displayed width as outside clear space. Choose symbol-only when the available logo width is below 144 px. Use a 44 px touch target for a linked brand mark even when the visible symbol is smaller. Align the container with logical properties in RTL; the image itself remains intact.

Give the brand link one accessible UniMind name. If adjacent text or the link already supplies that name, use empty image alt text to avoid repetition. Keep focus visible using the existing application rules. Application routing, behavior, component structure, loading policy and visual verification remain the frontend owner's responsibility.

If the frontend configuration supports these tags, point them to the copied files:

```html
<link rel="icon" href="/brand/unimind/icons/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/brand/unimind/icons/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="apple-touch-icon" href="/brand/unimind/icons/apple-touch-icon.png">
<link rel="manifest" href="/brand/unimind/icons/site.webmanifest">
```

Before landing integration, inspect actual light/dark desktop and mobile headers in English/Arabic, confirm the asset hashes, confirm no image distortion or clipping, check the brand link's accessible name/focus/target, and inspect the real browser favicon. The supplied 320 px samples test standalone containers, not the application's responsive routes.
