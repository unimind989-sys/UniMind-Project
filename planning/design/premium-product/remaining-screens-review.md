# Remaining-screen candidate review

WP03-T10; Ahmed; branch `codex/premium-product-screens`. Landing acceptance remains bound to `569c467` and recovery tag `codex/landing-approved-2026-10-04`. This review is inline executor judgment, not independent review or founder acceptance.

## First finish review

Disposition: **fix**. Existing-world refinement; no new concept roll or approved comp. A standalone quality-bar card was not supplied. No new raster ships: the folio, book identities and appearance preview use CSS geometry; control icons use authored SVG.

### persistence

The candidate extends the established Open Folio system across access, shelf, subject workspace, six Studio artifacts, Quiz, Account, collection intake/history and administrative decisions. Landing source remains unchanged. Candidate rules and proof must be persisted before presentation; founder acceptance of the expanded scope remains pending.

### fidelity

Round one inspected local synthetic fixtures in EN/AR, light/dark and desktop/phone. Valid viewport captures are under `.local/premium-product-review/`: auth, onboarding, shelf, materials, Chat, Studio, Quiz, Account, evidence/report, campaign/intake and Admin. `auth-ar-dark-mobile.png` was actually desktop and is rejected as mobile evidence. Full-page flashcard captures show a stitching error in the sticky rail and prove only the card detail; they are not shell-layout evidence. No private data or external provider was used.

### ceiling

Phone Materials and campaign intake put too much context before the task. The access headline also drifted from the exact approved slogan. These are concrete fidelity and usability findings. Incumbent type, neutral ground, authored geometry and native controls set the ceiling for this Operate refinement; no new visual world was requested.

### material_fixes

One ordered correction batch: restore “Study deeper / Go further.” on access; hide its decorative aside at tablet widths; use explicit rem heading sizes; compact the phone subject header and Materials summary so a real source appears in the first viewport; keep Quiz selected through attempt/review routes; announce only the active flashcard face with stable keyboard focus and instant reduced motion; hide the decorative phone upload mark so the chooser appears sooner. The initial demo suite passed 40/41 tests; its sole History failure was an empty streamed document title when Axe ran. Add an explicit nonempty-title wait before the existing accessibility assertion and rerun the affected proof without excluding any rule.

### keep

Retain existing actions, names, roles, context, source status, synthetic truth labels and failure states. Retain the literal geometric book spine: the one detector warning calls it a side-tab, but it is part of the authored book object, not an accent stripe on a generic card. Keep paired themes, native form controls and route structure. No new dependency, provider, domain rule or auth/storage change.

## Confirmation verdict

Inline reviewer substitution; scoring the known fixes only. No standalone quality-bar card or approved comp was supplied for this existing-world refinement.

### verdict

- Resolved: `auth-desktop.png` shows the exact approved two-line slogan. `auth-ar-dark-mobile.png` now shows a real 390×844 Arabic dark form with its brand decoded and controls enabled. Tests prove the aside recedes at 1000/768/390/320px.
- Resolved: explicit rem titles are present in the source; `studio-desktop.png` shows the resulting hierarchy at 1440×900. TYPE matches the incumbent Manrope/Noto Sans Arabic; MATERIAL adapts the folio as actual geometric CSS planes; GROUND matches the paired neutral theme tokens.
- Resolved: `materials-mobile.png` and `materials-ar-dark-mobile.png` show the first source heading in the initial 390×844 viewport. Normal source detail and Chat destinations remain available.
- Resolved: `quiz-attempt-desktop.png` shows Quiz selected on the nested attempt route, at 1440×900 in dark theme. Focused tests assert the same current destination after submission into review.
- Resolved: `flashcard-desktop.png` shows the question face; `flashcard-answer-desktop.png` shows the answer. These are reading-detail captures, not full-page shell proof. The second image has a transient sidebar-compositor gap and is excluded from shell-layout evidence; Studio and Quiz's valid root viewport captures prove the shared shell. Tests prove one accessible active face, stable keyboard focus and zero transition under reduced motion.
- Resolved: `upload-mobile.png` shows the native chooser above the bottom navigation at 390×844 in dark theme (button bottom 726px). Phone margins were also compacted after the rejecting first-viewport test measured EN 762px/AR 787px. The final focused test passes both languages with a conservative 756px boundary.
- Resolved: all four leader language/theme cases pass the retained Axe rules after explicitly waiting for the History title. This does not claim that streamed metadata is synchronously present with the first heading paint.
- No material regression found in the correction batch's valid captures and focused checks. No third polishing round or second detector run.

### remaining

Clear for the scored presentation fixes. Expanded founder acceptance, final candidate binding, required guarded verification/CI/delivery and the complete WP03-T10 gate remain separate and open.

disposition: **ship** — covers the scored fixes only; it is not founder acceptance or delivery approval.

## Documentation pass

Inline documenter substitution; updated DESIGN.md and added only the scoped pending extension in `.impeccable/design.json`. Historical sidecar values retain their original provenance.

1. Palette remains the existing neutral light/dark canvas and semantic UniMind blue.
2. Typography remains Manrope/Noto Sans Arabic with explicit rem product headings and neutral Arabic tracking.
3. Layout records the persistent desktop rail, full-width phone task surface and compact native navigation.
4. Reading and review use solid, bordered surfaces; brand geometry stays in the folio and subject identity.
5. Motion records 180ms task feedback and the explicit 240ms flashcard flip, with instant reduced-motion states.

Not canonized: an image-capture compositor gap, the absent standalone quality-bar card, or the historical sidecar's stale palette narrative. None defines the product system.

## Trust and proof boundaries

The changed adapters retain existing authority: verified identity and authorized PostgreSQL-backed scope own real routes; client input never establishes role or source permission. Existing server guards recompute scope and ownership. The demo's allowed study/leader/admin paths use fixed document-local fixtures; the real-mode regression exercises anonymous/forged-role denial. No expiry, revocation, replay, cache, upload finalizer or stale-decision rule changes. Added DOM contains only existing permitted content and a decorative preview; no credential, raw source, private payload or new provider data is exposed. The router still conservatively widens auth paths and the unknown sidecar to R3; its later security/storage/database/delivery obligations remain required.

The real-mode initial run's combined learning/reset denial test reached its 15-second budget. Trace shows `/learn` navigation 8759ms, its URL assertion passing, `/reset-password` navigation 5918ms and its URL assertion passing. Split the two independent denial checks so each retains the existing 15-second test budget; assertions and application guards stay unchanged. Rerun those checks explicitly and retain the failed run in evidence.
