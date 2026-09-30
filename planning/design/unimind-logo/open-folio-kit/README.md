# UniMind Open Folio — complete digital logo kit

Ahmed approved 01 Open Folio in the round-2 sheet and requested this kit. The main horizontal artwork preserves the approved silhouette, proportions, spacing and palette. Additional placements are derived from that identifier; application integration is reserved for the frontend owner after review.

Start with `previews/kit-overview.png`. The one-page guide is `usage-guide.html` (also inspected as `previews/usage-guide.png`), with fuller notes in `usage-guide.md`; exact application copy paths are in `integration.md`. `asset-manifest.json` binds all packaged files to hashes. `unimind-open-folio-kit.zip` is the portable delivery archive; its SHA-256 is in `archive-sha256.txt`.

| Folder / file | Contents |
| --- | --- |
| `svg/` | 25 transparent vector masters: horizontal, stacked, wordmark, normal symbol, small symbol, each in light/dark/black/white/blue |
| `png/` | 20 transparent large logo exports and 12 exact-size small symbols |
| `icons/` | Five SVG icon sources; three exact-size favicon PNGs; three-resolution ICO; Apple touch, 192/512 and maskable PNGs; minimal webmanifest |
| `previews/` | Overview with six contexts, minimum-size proof, HTML English/Arabic examples at 608/320 px and their rendered image |
| `provenance/` | Founder approval receipt, construction/font source, original Manrope font/OFL license and structural audit |
| `color-palette.json` | Exact existing palette plus clearly labeled unprofiled print conversion starting points |
| `build-kit.py`, `verify-kit.py`, `package-kit.py` | Repository-based reproducible generation, rejecting checks and deterministic packaging |

All logo masters contain outlined paths, with no font loading, live text, raster data, filters or external asset references. Backgrounds are transparent except the intentional icon tiles. SVG is the editable, scalable production master format; PNG is for software that cannot use SVG. Files are RGB. Profiled CMYK/Pantone print masters and physical print proofs are not claimed.

The two-color dark artwork stays at the approved Manrope 650 weight. The pure-white reverse reduces the wordmark to 640 and insets the normal page boundaries by 0.6 units to offset visual expansion. The small drawing widens the center opening from 32 to 48 units. The stacked composition aligns the book and wordmark on one vertical axis and balances its outer margins. The final board corrects the initial Arabic presentation-label alignment; historical inspection iterations stay outside the delivery archive.

From this isolated repository worktree, install/use FontTools 4.66.1 and Pillow outside the application toolchain. Set `UNIMIND_LOGO_FONTTOOLS` if the package is installed in a separate directory. Run `python planning/design/unimind-logo/open-folio-kit/build-kit.py`, then `verify-kit.py`, then `package-kit.py` using the same directory prefix. Rendering uses the pinned repository logo-design helpers and a disposable local headless renderer. No preview server, frontend server or frontend-checkout operation is required.

The scripts depend on the repository's logo-design utilities and earlier round source records; the portable archive is for asset use, not a standalone copy of that tooling. Keep this branch unmerged. No app components or shared PRODUCT/DESIGN/runbook authority documents were changed.
