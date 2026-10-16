# WP03-T13 local student entry and navigation candidate

Prepared 2026-10-06 at 14:53 UTC by Codex `/root`, selected speaker Ahmed. This is local candidate evidence, not founder acceptance, CI, deployment or production proof.

## Candidate and boundary

- Branch: `codex/frontend-refinements`.
- Base HEAD: `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`; approved landing commits remain intact.
- All WP03-T13 changes remain uncommitted. Ahmed's scoped hold in AGENTS and the task record governs every continuing agent: commit only on instruction; push, PR, merge and deployment each need his explicit instruction.
- Exactly one selected task: [WP03-T13](../../planning/tasks/wp03-t13-student-entry-navigation.md). Manual Sol High block 1, no workers or model-certification claim. Final envelope: policy 10, R1/Short, docs/frontend/tooling.

## Implemented behavior and proof

| Requested result | Implementation and rejecting proof |
| --- | --- |
| Replace the product language dropdown | Shared AppShell English / العربية native buttons with an accessible group, pressed state and 44px targets. Both directions and keyboard activation tested for student, leader and admin. Existing query/route preservation, Chat draft/output choice preservation and hosted session memory tests pass. Fragment is retained by the router URL composition and reviewed in source. Landing and `(auth)` source are outside the diff. |
| One academic choice at a time | Onboarding renders one radio group, Continue/Back, progress and an editable review before submit. Native EN/AR tests prove no onboarding selects, initially disabled Continue, Back retention, high-school branching, upstream reset, locale switch without losing the current step/selection, year edit clearing old term, complete save and distinct destinations. Existing account settings keep field editing. Domain/account unit proof covers invalid/unavailable contexts and authorized save. |
| Distinct Study and Subjects | Study has a first-use subject action or existing Chat/Studio resume destination, plus concise tool guidance. Subjects alone owns the searchable authorized catalog in the actual product. Existing `/preview` catalog behavior remains a verification adapter. Both locales prove search is absent from Study, present in Subjects and that opening Chat creates the existing resume action. No new tracking, progress, persistence or history feature is claimed. |
| One Student settings entry | Student replaces Account in student navigation and opens `/settings`; the separate Student identity label is removed. Other roles keep their Account navigation. EN/AR proof checks exactly three student destinations and one Student link; existing settings/theme and role routes pass. |

## Passing local checks

All providers and service inputs were deterministic mocks or synthetic fixtures, with budget zero. No real account or provider mutation was performed.

- Native demo: **13 distinct affected cases pass**, collected through scoped runs rather than one full-suite claim. Seven cases passed in the nine-case run (product language student/leader/admin; existing academic setup EN/AR; revised sample EN/AR). Four leader EN/AR Light/Dark reflow cases passed in the six-case run. The new progressive-entry EN case passed in the final three-case run; the new AR case passed after correcting the test's Chat translation. Admin language passed again with added light/dark 1440/768/390/320px and 200% reflow/axe checks.
- Commands: `UNIMIND_DEMO_REUSE=1 corepack pnpm exec playwright test --config=playwright.demo.config.ts --grep "student entry|product language|academic setup, editable|revised sample"`; scoped leader-reflow run; final `--grep "student entry|product language admin"`, then `--grep "student entry ar"`. Earlier passing cases are reused only for unchanged test behavior and public seams. Subsequent Study Arabic copy changes were exercised by the final AR entry run and rendered review.
- Normal test configuration: `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm exec playwright test tests/e2e/study-shelf.spec.ts tests/e2e/hosted-synthetic-login.spec.ts --grep "valid direct deep link|hosted student: study memory"`: **2 passed**, exit 0. This proves existing catalog scope/locale behavior and synthetic hosted study memory, locale, sign-out, refresh and new-document isolation.
- `corepack pnpm exec vitest run --project unit tests/unit/account-settings.test.ts tests/unit/catalog-journey.test.ts`: **15 tests / 2 files passed**, exit 0.
- `corepack pnpm lint`: exit 0, zero-warning policy.
- `corepack pnpm typecheck:fresh`: exit 0; all authored TypeScript, independent of generated Next cache.
- `corepack pnpm typecheck`: exit 0 after the serial demo startup regenerated a malformed `.next/dev/types/validator.ts` left during the server transition. The first attempt rejected that generated file; no authored code was changed to suppress it. Generated `next-env.d.ts` route imports were restored to the clean starting version.
- `corepack pnpm check:boundaries`: exit 0, reused; later changes were literal copy and test assertions with no module/import boundary change.
- Changed-code, DESIGN and surface-brief Prettier check: exit 0; repository-ignored planning/docs/evidence respect existing ignore policy.
- `corepack pnpm scan:secrets`: exit 0, 3186 files including final evidence. Changed-file review found only synthetic fixtures and no private data, credentials, logs or provider payloads.
- `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`: exit 0 after final handoff documentation, 797 names, 349 local links, 23 synchronized decisions and 116 task contracts checked.
- `git diff --check`, stat and full changed-file diff reviewed inline. No changes to landing, login/access, guards, backend adapters, schema, providers, dependencies or paid settings.
- One bounded Impeccable detector over the four affected component targets: exit 0, no output/findings. It ran before the final review-definition-list correction; final semantics are covered by axe and source review. No detector re-run or skill adaptation.
- React best-practices inline review: separate private setup component, derived catalog options, a step-only focus effect, native controls, stable control keys, no new listener/fetch/storage effect or dependency. No actionable finding remains.

The responsive tests cover EN/AR, both themes, keyboard, reduced-motion preference, 320px through desktop and 200% text reflow; zero axe WCAG A/AA violations in the checked states. This does not claim that every platform route/state or the complete application suite ran.

## Rejecting checks and diagnosis

Initial tests caught premature submit when React reused the advance button as the final submit button. Distinct button keys and preventing the advance click's default action fixed it; the editable review is now exercised before save. Axe rejected invalid review definition-list nesting; valid `dl > div > dt/dd` fixed both locale checks. New test failures also exposed an outdated post-switch accessible group name and an incorrect Arabic Chat locator, corrected to the rendered names.

The resume assertion initially treated a Materials visit as an existing resume event; the existing adapter records Chat/Studio use. A further race left Chat before its component mounted. The diagnosing-bugs loop tested three hypotheses: premature navigation, lost saved destination, or an unusable sample path. Waiting for the visible Message textbox before returning to Study made EN pass; AR then passed with the actual `المحادثة` link. Product tracking was not expanded. No temporary diagnostics remain.

One initial side-browser access attempt was invalidated by source Fast Refresh resetting document-local synthetic state. The frozen candidate was reopened and reviewed through the normal synthetic login/consent flow. A screenshot captured immediately after viewport change was blank; only the settled rendered capture is retained as visual evidence.

## Rendered review

One batched side-browser review covered desktop English setup, all five questions, editable review, save, first-use Study, Subjects and Student settings; mobile Arabic setup and dark Study. Keyboard radio activation and native theme settings were used. The temporary mobile viewport was reset. No visual correction or extra polish loop was needed.

Local, ignored synthetic screenshot files:

- `.local/wp03-t13/review/setup-en-desktop.png`
- `.local/wp03-t13/review/setup-ar-mobile.png`
- `.local/wp03-t13/review/review-en-desktop.png`
- `.local/wp03-t13/review/study-en-desktop.png`
- `.local/wp03-t13/review/subjects-en-desktop.png`
- `.local/wp03-t13/review/study-ar-dark-mobile.png`

Task-owned preview: `http://127.0.0.1:3101/login?lang=en&email=student@example.invalid`, synthetic services only. Fresh login opens setup; reload clears demo state. The preview is left running for review.

## Authored source binding

SHA-256 of the frozen implementation and affected tests:

| Path | SHA-256 |
| --- | --- |
| src/app/_components/academic-settings.tsx | 7257adf844090cc605a06e882ba0271c3fe39579cd2bc739cd8841469ca7f9ba |
| src/app/_components/student-account.module.css | 1ad61c8303d81d9f00623c57b6a879479f4acdf6b7ff150b874e1600fbb0c8b5 |
| src/app/_components/app-shell.tsx | fc18fb88eaff7124d0b254d8e56552ae86d5d87544fd1c0c346d029acce44cb6 |
| src/app/_components/app-shell.module.css | 0c3853746f3ab9477e576ea507d62a8326082f4e7ca11cfab106d28da9b93b66 |
| src/app/_components/frontend-controls.tsx | 2f29d37e7bea543faaaa97eacee47d6087146a7eef6b90ee7ea79cb78e232e67 |
| src/app/_components/frontend-system.module.css | 437fbcce830bd0d79cf93c65ec809b2bc5f0db2cdf56173853ba3eddc279b147 |
| src/app/_components/product-native-page.tsx | 9434ce8bfc4cfcd655ff31f1d07ae2eb9ab0ca6488ce01348ddc84dfca8e955a |
| src/app/settings/page.tsx | 9494ab25bbba0192e47e4b70e31ae834538b4ba1780c8b4edc596bcfe811f301 |
| src/app/learn/_components/study-shelf.tsx | 89bcd2fb44819f36a540d9ffda9cdd9957e83252f1253bda5ee25b2bb1f66b5b |
| src/app/learn/study-shelf.module.css | ce68620831ef73c51e69857edaf4a6c09afa9dfdda629ed3ee23296638c92baf |
| tests/e2e/native-product-demo.spec.ts | c512fb43c4438b2c484fa835a80c1494b9e6bc5355b993d8c1ce99a252b8ce0f |
| tests/e2e/hosted-synthetic-login.spec.ts | a6f19c89ef8dee96a327ea08dcc758bafe35750ca477efaf9f3ba6dda70a299f |
| tests/e2e/study-shelf.spec.ts | ddd281274249f37f354f717f13e67b472a51f92948b449f5539fbed8290e4d0b |

Reopen proof if a bound source changes in a way that affects its assertion. No automatic evidence receipt certifies an uncommitted candidate as delivered.

## Review disposition and remaining action

Inline technical review: complete, no unresolved finding. Design disposition MATERIAL; founder receipt PENDING. Actual-diff routing exits 0 with `HUMAN_DESIGN_ACCEPTANCE_REQUIRED`. Preparation fingerprint stays NOT_READY until Ahmed accepts the rendered candidate and proof-preflight records a valid receipt. Broad `pnpm verify`, exact-head GitHub CI, database/provider proof and production delivery were not run: this is a frontend-only local review request with an explicit external-delivery hold.

Rollback is limited to this slice's uncommitted paths relative to 98bcaef; preserve both accepted landing commits and any later unrelated work. Next safe action is Ahmed's rendered review or requested revisions. Commit and external actions remain on hold.

## Snapshot superseded by approved revision

On 6 October Ahmed approved applying the voice-note review and expanded reduced margins to every product section. This document remains evidence for its earlier source snapshot only. It is not PASS for the revised candidate. The WP03-T13 record owns the revision and the continuing commit/external-delivery hold.
