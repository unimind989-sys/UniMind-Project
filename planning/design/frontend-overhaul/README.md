# UniMind Phase 1 design review

**30 September–1 October 2026 · WP03-T09 · Phase 1 approved.** Ahmed approved candidate `ab568b6`; see the [receipt](phase-1-approval.md). This separate proposal changed no product runtime, schema or dependency. All Phase 2 role checkpoints and final consistency `8ad3a9b` are now accepted; see the [final receipt](final-approval.md). The [delivery record](phase-2-delivery.md) owns delivered technical proof. PR #64 merged as `f107e41`; runtime is promoted and verified. [DESIGN](../../../DESIGN.md) is canonical; the [audit](../../../docs/reviews/wp03-frontend-overhaul.md) contains the inventory, role flows, reconciliation and sequence.

## Open the sample

From the repository root, run `corepack pnpm demo` once to produce the existing self-hosted font output, then `node planning/design/frontend-overhaul/serve-preview.mjs`. Open **http://127.0.0.1:3103/#workspace**. The preview server binds only to loopback, accepts GET requests for an explicit asset allowlist and serves no product API. It needs no added package or provider. Font filenames in the server map are this checkout's generated Next development artifacts; if regeneration changes them, update only that allowlist from the existing font output.

The external review toolbar changes theme, interface language and representative workspace state. It is outside the proposed product shell. Start with Materials → Create a summary → Generate → View supporting material → Back to Studio. Use Study for the Shelf, Subjects for its searchable list, and Account for the proposed academic/preferences grouping. Public page shows a hero/composition sketch with the exact slogan, not a complete implemented public/auth flow.

## What the sample proves

The sample renders the proposed paired neutral system, student shell, mobile navigation, academic context, Material/Chat/Studio/viewer reading areas and state treatment. Source content is fictional. Four of eight illustrative source rows are shown; each opens a labeled processed excerpt. Studio deliberately displays one fixed summary for all six selection options, and Quiz explains the retained existing capability. No upload, role grant, real source retrieval, generation, quiz scoring or saved academic-account data is performed. The preview's local theme key is isolated from future product settings.

At the Phase 1 review, the Open Folio kit was absent and the wordmark was temporary; Ahmed's “okay” allowed that review to continue. The kit is now supplied and integrated through the shared Brand component in Phase 2. The proposal retains its historical placeholder. Unrelated logo exploration is untouched.

## Audit and rendered review

Current source/contract review covers public/auth, catalog and role routing, profile/consent/privacy, guarded study scope, workspace/Chat/Studio/quiz/evidence/report/viewer, collection/upload contracts, real admin governance and synthetic resources. Current in-app UI inspection used normal synthetic sign-in/commitments for student, leader and admin. It covered the resolved catalog/search, Anatomy workspace, populated Chat in EN/AR, account, campaign upload form, blocked admin readiness and Arabic Sources. No real/private data or provider was accessed. Broader historical route/state evidence is identified separately in the audit and is not a fresh PASS.

The first sample inspection found duplicate fixed-summary notices, inconsistent state labels, a partial-source count omission, placeholder styling and capture-scroll problems. Those were corrected together. A route-changing skip link was corrected and rechecked separately without changing the visual system. Final inspection confirmed the following bounded representative set; it is not the Phase 2 platform-wide state matrix:

| Surface                | Rendered scope                                                        | Findings / proof                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Materials workspace    | EN desktop 1440, Light and Dark                                       | Quiet role shell, source list and actions; one academic heading; no decorative metric tiles                                            |
| Studio                 | EN desktop Light/Dark; 430 Light; 390 Dark; 768 Light                 | Options before reading; full reading width on phone; material context beside work on desktop                                           |
| Arabic Studio          | 360 Light; 390 Dark; desktop 1440 Light/Dark                          | RTL shell, LTR wordmark, Arabic font; separate English/Arabic output direction retained                                                |
| Reflow floor           | EN 320                                                                | DOM geometry checked; no horizontal document overflow, no visible sample controls below 44px                                           |
| States                 | Phone ready/loading/empty/error and retry                             | Context remains; loading/absence/error text and safe recovery; false Ready label removed                                               |
| Navigation and reading | Shelf, search/no-match, Chat draft, Studio → viewer → Studio, Account | Browser actions and DOM checks; no invented service results                                                                            |
| Theme / keyboard       | Light/Dark reload, System control, Tab/Enter, skip link               | Local preference survives reload; visible focus and route-preserving skip; OS-change/storage-denial require later implementation proof |

Final captures were inspected individually. Long phone screenshots contain the viewport-anchored bottom bar at the original viewport boundary; use the viewport images to judge its actual placement. RTL full-page compositor crops were rejected: DOM rectangles were in bounds at scroll X/Y zero; settled viewport images replace those desktop/phone captures. No malformed capture is offered as design proof.

## Checks and limits

- Computed sample tokens: 22 intended text/control pairs in each theme. Normal text minimum **4.60:1 Light / 5.15:1 Dark**; necessary control/focus minimum **4.04:1 / 4.59:1**. This supports these pairs, not a whole-platform WCAG certification.
- DOM measurements at 320/360/390/430/768/1440: no horizontal document overflow in the measured sample states; visible sample control targets meet 44px. Browser focus, state recovery and language/draft checks are recorded with the candidate artifacts.
- JavaScript syntax, changed-artifact formatting, repository secret scan, agent link/readiness and diff/scope review are recorded in the active task's final P1 handoff. Broad runtime verification/CI and delivery are deferred to the approved stable implementation; historical tests are not rerun as visual proof.
- Impeccable's one static detector pass was **DEGRADED** because optional HTML parser modules were unavailable. Its regex fallback does not evaluate computed CSS or contrast; no clean detector PASS is asserted and no package was installed.
- This preview does not prove real onboarding persistence, role redirects, backend concurrency, storage-denied behavior, OS-theme changes, screen-reader output, 200% text, all six working artifacts or production behavior. Those remain explicit Phase 2 acceptance checks.

The [render/source manifest](review-manifest.json) binds the inspected capture bytes and sample source hashes. The [observed sample measurements](sample-checks.json) record geometry and contrast. The [inline finish review](finish-review.md) says `ship` only for presenting this proposal, with non-independent provenance. The [previous contract](previous-design-contract.md) and [previous audit](previous-overhaul-audit.md) preserve history, not competing design authority; one relocated Markdown link in the archived contract is corrected for this folder.

## Approval scope and next work

Ahmed approved the proposed information architecture, paired theme/component system, student shell/workspace composition and ordered rollout. Phase 2 follows shared tokens/Brand/theme → student public/auth/account/study checkpoint → leader upload/history checkpoint → admin checkpoint → final consistency checkpoint → required stable verification/delivery. Routine decisions continue independently inside that scope. The supplied kit is now integrated in the student candidate; no substitute logo was created.

**Receipt: [Phase 1 approved](phase-1-approval.md).** The [student implementation record](phase-2-student.md) owns the next rendered approval boundary. This historical proposal's presentation alone did not authorize merge, promotion, task closure or WP04.
