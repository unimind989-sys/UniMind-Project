# WP03-T10 premium product-screen local candidate

Status: **local candidate preparation; founder acceptance and full gate delivery pending**. No full WP03-T10 PASS is asserted.

## Candidate and recovery

Branch: `codex/premium-product-screens`. Candidate source commit: `0d2c31c765f7ab26c346d842daeee7b620d7b0bd`. The final local proof ran against the same source/test/config contents before this commit. Later review/evidence records are nonvisual. The approved landing checkpoint is `569c467bb2f84c6efcbef616528c9b090768b61c`, retained on `codex/premium-landing` and tag `codex/landing-approved-2026-10-04`. Landing page, landing client/CSS, brand, root tokens and control icon sources are unchanged relative to that tag.

The change extends presentation across account access/onboarding, the shared role shell, shelf, subject navigation, Materials/evidence/report reading, Chat, Studio's six types, Quiz/attempt/review, Account, collection intake/history and Admin queue/resources. Existing names, actions, source truth labels and role/scope semantics remain. Added motion is explicit feedback and a keyboard-accessible CSS flashcard flip. Reduced motion shows the same states instantly. No new package, raster, provider call, financial exposure or auth/storage/domain rule is introduced.

ESLint now ignores the existing Git-ignored `.local/**` scratch/cache tree. This fixes standard lint scanning old generated checkouts; source rules are unchanged. The real-mode combined learning/reset denial test is split into independent cases with the same assertions and unchanged 15-second limits.

Executor/review provenance: Codex inline executor; Ahmed selected as the conversation speaker. No subagent or independent reviewer. Local observations occurred 2026-10-03 UTC / 4 October Cairo time. Configuration is repository-pinned Next 16.3.6, strict TypeScript and Playwright Chromium; fixture credentials/URLs are invented, provider mode mock, budget zero and all provider enable flags false. Browser fixture tests block non-loopback requests. Test servers are owned by their launcher; the local demo was stopped before real-mode E2E and production build.

Source/config Git blob bindings at the source commit: synthetic fixture pool `56ef7f5ff797a7e5e7d9d70ecfde5543dac5000b`; real-mode Playwright config `1dc6dc9f6c6b9a5d66a3ce42078f261b44f0af8d`; demo config `d2a8cea9de2eb2c7c4ad7261ea27c6b692ae6b4a`; safe build script `844f9aec04404889796fe76a9b04865e5250cf08`; package contract `77ae33ff27cda80d8a47f479d180fccce335679a`.

## Executed proof and retained failures

| Check | Result | Scope and limitation |
| --- | --- | --- |
| Initial full demo suite | 40/41; 19.4 minutes | All original journeys/states exercised. Sole failure: History's document title was empty when Axe ran immediately after the heading. This is a retained failed run, not full PASS. |
| First focused correction proof | 10/12 | Both new first-viewport intake tests rejected the chooser position (EN 762px, AR 787px against conservative 756px bound). Phone context margins were compacted. |
| Final focused demo proof | 12/12; 102.6 seconds | EN/AR, paired themes, access/tablet/320px/200% reflow, first Materials source, flashcard accessible active face/keyboard focus/reduced motion, Quiz selected attempt/review, first-viewport chooser, all four leader accessibility cases including History. |
| Initial real-mode E2E | 62/63; 9.1 minutes | Demo absent. Auth/recovery, catalog, working session persistence, scoped denial, collection recovery, admin decisions, RSC/action safety, both locales/themes/reflow and unchanged landing. Combined learning/reset test hit the overall 15-second budget. |
| Affected real-mode denial rerun | 2/2; 72.3 seconds including server startup | Same denial assertions in independent cases. `/learn` case 13.2s and `/reset-password` case 8.7s. No guard, URL expectation or global timeout weakened. |
| Fresh TypeScript | PASS | Credential-free `typecheck:fresh`, repeated after test changes. |
| Standard ESLint | PASS | `pnpm lint` with source rules unchanged and local scratch excluded; final auth-test source lint also passes. |
| Module boundaries | PASS | Existing adapter/domain dependency boundaries. |
| Repository secret scan | PASS | 2876 files at the final completed scan. No logs, provider/source payloads or credentials are committed. |
| Safe production build and client-artifact secret scan | PASS | Next 16.3.6 compiled, strict TypeScript and all 22 generated pages passed; client secret canary scan passed. Existing zero-budget, mock-provider build script; no `.env` file edited. |
| Changed-file formatting and diff integrity | PASS | Source, tests, ESLint and scoped design files formatted; full diff, stat and `git diff --check` inspected. |
| Agent readiness | PASS | Final repeat: 498 names, 167 local links, 23 synchronized decisions and 113 contracts. |
| Detector | One contextual warning | One run only: literal geometric subject-book spine reported as side-tab; retained as an authored book-object feature, explained in the inline review. |
| Bounded rendered finish review | `ship` for scored fixes only | Two capture rounds; inline executor provenance, not independent review or founder acceptance. |

Original results are retained locally as `.local/premium-product-review/demo-initial-results.json`, `demo-focused-initial-results.json`, `demo-focused-final-results.json`, `real-initial-results.json` and `real-denial-final-results.json`. Use their actual source scope: the first full demo pass predates the last visual correction batch, so final-head complete demo coverage remains a later gate. The 62 unaffected real-mode cases retain their source-bound application proof; the two changed denial cases have direct rejecting reruns. Never add counts into a fictitious single green suite.

Commands and exit codes: `UNIMIND_E2E_USE_WEBPACK=1 pnpm test:e2e:demo` exited 1; with `UNIMIND_DEMO_REUSE=1` and `--grep 'premium product|leader .*queue, History'`, first focused run exited 1 and final run 0. `UNIMIND_E2E_USE_WEBPACK=1 pnpm test:e2e` exited 1; the affected `tests/e2e/auth-flows.spec.ts --grep 'learning routes reject|reset routes reject'` rerun exited 0. Commands used `corepack pnpm` on Windows. Standard `pnpm lint`, final auth-test ESLint, `pnpm typecheck:fresh`, `pnpm check:boundaries`, `pnpm scan:secrets`, `pnpm test:env-build`, changed-file Prettier and final `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` all exited 0. `git diff --check` passed before source commit and for subsequent records. No guarded verification or external mutation command was executed.

The original real-mode trace records successful navigation/assertion pairs: `/learn` navigation 8759ms; `/reset-password` navigation 5918ms. The combined test, including fixtures, exceeded its total budget. Splitting preserves both independent boundaries.

## Rendered and React review

The [surface brief](../../.impeccable/surfaces/src-app-components-app-shell-tsx.md), [inline finish record](../../planning/design/premium-product/remaining-screens-review.md), scoped `DESIGN.md` candidate section and sidecar extension persist the actual implemented direction. The historical sidecar was not silently rewritten. No standalone quality-bar card or approved comp was supplied for this existing-world refinement.

Valid root viewport captures cover access/onboarding, shelf, Studio, Quiz, Account, leader and Admin; phone captures cover Materials, access, Account, mixed-language study reading, evidence/report, intake and Admin. DOM viewports are 1280/1440px desktop and 390px phone; the native browser exports slightly resampled JPEG bytes even under `.png` filenames. The local `capture-manifest.json` records actual pixel dimensions, format and SHA-256 hashes. Automated proof also covers 768px, 320px and 200% text. The Arabic phone access capture was replaced after viewport/paint validation. Flashcard files are reading-detail evidence; the answer image's transient sidebar compositor gap is excluded from shell proof. Valid Studio/Quiz root captures and DOM geometry independently establish the shared rail.

React review: CSS handles routine motion without render-loop state or added effects. The flashcard uses the existing flip state and native button; hidden faces have `aria-hidden`, a named live region announces the active content, and focus remains on the trigger. Appearance retains its existing external-store subscription and storage behavior. Decorative objects are hidden from assistive technology. Domain rules, provider SDKs and protected adapters were not moved into UI code.

## Policy and remaining gates

Actual-diff routing uses policy 9, zero workers and MATERIAL design disposition. Auth-path classification and the unknown sidecar conservatively widen the envelope to R3, with frontend/runtime/auth/data/storage/delivery/tooling/docs surfaces. Keep the selected security/database/storage and exact-head delivery obligations; the source diff's presentation-only nature is not permission to downgrade them.

New founder receipt is missing. Landing acceptance applies only to its earlier scoped candidate. Guarded broad `pnpm verify`, complete final-head demo coverage, exact-head required CI, protected merge, affected production proof and WP03-T10 closure have not run for this candidate. Production is unchanged. No claim of independent review, live provider capability or full gate completion is made.

Review the concrete candidate through the [live local guide](../../planning/design/premium-product/README.md). After acceptance, record actor/time/exact candidate and student/leader/admin/consistency route/state scope, derive current proof preflight/fingerprint, then complete required verification and delivery. Roll back only task-scoped product commits to recover the saved landing; preserve unrelated work.
