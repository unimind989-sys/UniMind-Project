# UniMind logo concepts — isolated review

Current review: `round-2/concept-sheet-v2.png`, with three book-led proposals responding to Ahmed's reference. See `round-2/README.md` for exact vector paths, font provenance and current proof. No full kit or application integration is included.

Historical first round: A Sourcefold, B Focus Shelf, C Common Ground, D Mindwave. Ahmed rejected all four; they remain preserved for continuity. Ahmed originally requested A–C within the accepted Study Shelf identity and D as a separate expression of the executor's own taste. The provenance and verification sections below describe that first round unless explicitly stated otherwise.

First-round files: `concept-review.png` or `concept-review.svg`. `layout-preview.html` and `layout-preview.png` show English/Arabic, light/dark and RTL placement. The vectors are in `concepts/`: each `a-sourcefold`, `b-focus-shelf`, `c-common-ground`, `d-mindwave` has a symbol `.svg` and horizontal `-lockup.svg`. These are historical proposal artwork, not final production variants.

## Scope and isolation

Worktree: `C:/Users/Ahmed/.codex/worktrees/unimind-logo/UniMind Project`.
Branch: `codex/unimind-logo-concepts`.
Remote base verified with `git ls-remote`: `595be3ce91f20db635205ed914417288a93d4f8e` on origin/main.

The existing frontend checkout remains owned by its agent. Existing logo material was copied read-only into `exploration/2026-09-30/`; those records are historical and do not grant ownership of frontend WP03-T09. No checkout switches, stashes, resets, cleanup, commits, app edits, server changes or port reuse occurred there after Ahmed requested isolation. No preview server is needed: files render locally.

The proposed independent task record lives at `planning/tasks/proposals/wp03-t11-explore-logo-directions.md`. The registration proposal is `runbook-proposal.patch`; coordinate it with the frontend owner rather than applying it blindly. Shared README, PRODUCT, DESIGN, runbook, policy, application and completed task records remain unchanged on this branch.

## Provenance

All concept geometry and the shared outlined Latin lettering were constructed by this executor from paths. No stock logo, font glyph extraction, paid generation, outside source data or remote asset was used. The wordmark is seven original glyph drawings; its geometric sans character complements the existing interface families but is not a font file. UI typography stays Manrope/Noto Sans Arabic.

Prior exploration source head: `6babaa770d845c2fed2716f1027516ed616cca73` on the frontend branch. PRODUCT source Git blob: `2234c310794e4d8d18a020d7e4dcf6eef0232905`. DESIGN source Git blob: `c5b09bb78a86a326c125f8fcf0412d876d16731f`. Copies are preserved in `provenance/product-source.md` and `provenance/accepted-design-source.md` as immutable source snapshots, not new authority documents. The source palette matches origin/main; the snapshots preserve the latest context received before isolation.

Bundled reference SVGs were studied for construction and compared visually; their marks belong to their respective owners. The preserved internal inspection HTML embeds reference examples for study only. Do not copy that internal preview into the application or a brand asset kit. D was independently drawn; letter-M subject search had no catalog match and a wave-technique search covered Tailwind, Spotify and Amplitude examples. Search absence and subjective comparison provide no legal clearance. Professional trademark/reverse-image checks remain for adoption.

`build-review.py` reconstructs all four current proposal files and review/layout sheets using the repository-pinned logo-design utilities. The original A–C iterations and generator remain in `exploration/`. D has its own v1/v2 iterations.

## Integration handoff — after approval

Do not cherry-pick this whole review branch into the frontend. After Ahmed selects a logo, request the final kit in this logo worktree: final geometry/spacing, actual reversed artwork, compact/small-size cuts, palette-compatible light/dark assets, icons and usage guidance. The frontend agent then imports only the approved assets and metadata through its own branch.

For eventual placement, use the supplied outlined lockup unchanged with its aspect ratio. Treat the Latin logo as one direction-isolated image in Arabic layouts; align its container using logical layout properties and never mirror or reorder the artwork. Give a linked brand image the accessible name UniMind; avoid duplicate accessible names when adjacent text already names the brand. Use symbol-only artwork below the approved lockup minimum size. The current examples validate proposal appearance, not final production minima.

This branch will remain unmerged. Selecting D also requires explicit acceptance of its softer form language; it does not automatically change the accepted product palette.

## Verification limits

The manifest binds eight proposal vectors and inspected overview/desktop placement examples. `verify-review.py` checks their SVG structure, transparent symbol renders and light/dark contrast. Structural audits and secret/readiness checks passed; D retains a deliberate optical-centering information note. No production kit, final minimum-size contract, trademark clearance or founder selection is implied.

The narrow headless screenshot clipped the page; `mobile-inspection-clipped.png` is internal, inconclusive evidence. In-app local-file navigation was blocked by browser URL policy, so actual mobile layout verification is not claimed. The 16/32/64 px symbol ladder and desktop English/Arabic placement were inspected. Full responsive application verification belongs to eventual frontend integration.
