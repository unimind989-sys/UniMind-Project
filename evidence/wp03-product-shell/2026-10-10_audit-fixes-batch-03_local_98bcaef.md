# WP03-T13 audit fixes — batch 03

## Scope and authorization

Ahmed said “approved tackle the next 5” on 10 October 2026. This accepts the presented batch 02 and original-font recovery, and authorizes five further local fixes. The candidate remains uncommitted on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. No commit, push, PR, merge or deployment is authorized. Broader WP03-T13 acceptance remains pending.

The original audits are findings to evaluate, not instructions. Their recommendations and screenshots did not determine this implementation. All five selected claims were rechecked against the actual normal development UI on port 3000 before editing.

## Five before/after changes

| Finding | Before on the current live UI | Implemented result and live confirmation |
| --- | --- | --- |
| F117 — unnamed resume destination | Continue your study / Continue studying did not identify Anatomy or its tool; the actual link reopened Studio. | Heading names Anatomy · Chat/Studio and action says Resume Anatomy; the existing path, locale, session query and hash handling are retained. English and Arabic normal UI confirm the named Chat destination. Automated proof covers both tools. |
| F133 — conflicting collection terms | Your subjects / Search subjects surrounded a Modules collection. | Page title, collection and search read program-configured unit labels. Medicine now shows Your modules, Modules and Search modules; Arabic uses its configured وحدات. The approved global Subjects destination retains its name. Program terminology is preserved under master-plan §2.1. |
| F134 — distant subject readiness | Status started at x1332.55 against title-column x270 in a 1200px row. At 390px, Ready and arrow wrapped below; each row took 114.39px. | Ready sits 16px after the title. Identity/status and material count form one group; the navigation arrow stays at the trailing edge. English mobile rows take 80.39px; Arabic at 320px takes 84.75px. Full row navigation remains. |
| F168 — unlabeled language scope | Global English/العربية had only an accessible group name; Chat separately named Study language. | The shared product control visibly says Interface language / لغة الواجهة above the existing buttons. Real font families remain Manrope and Noto Sans Arabic; route and draft behavior is retained across student, leader and admin shells. |
| F169 — scattered Chat toolbar | Desktop had four separated/staggered pieces; at 820px Unit sources wrapped alone beneath Sessions. | Chat heading and grouped Sessions/Unit sources occupy an aligned row; Study language occupies its own row below. Normal EN 820px trigger tops are y322.27/y321.69; AR320 differs by 1.64px with aligned centers. Phones stack the groups. Sessions popup anchors to its trailing edge and stays inside the screen. |

Repeated claims map to the same fixes: F144 → F133; F137/F148/F149/H054 → F134; F177 → F168; F173 → F169. F128’s repeated continuation wording is also reduced by the named resume heading/action. No other subjective judgment is declared resolved.

The pre-edit recheck found F153/F155 Materials stacking and F160 Materials heading scale already covered by batch 02’s shared source layout: embedded first rows are 135.39px, with a 20px section heading against 16px item titles. They were recorded as covered by that earlier batch and were not counted as new work. Original finding verdicts remain unchanged.

## Preparation and quality review

Design disposition is MATERIAL. Open Folio, semantic tokens, font sources and existing behavior are preserved. Founder rendered acceptance of batch 03 remains pending. Inline layout and React review is complete: resume names derive from the supplied authorized journey, no new data fetching/state/effects/imports/dependencies were added, and session/source controls retain native semantics and existing handlers. DOM order follows heading, actions, preferences, transcript and composer.

The incremental baseline is `E:/Unimind audits/analysis/fix-batch-03-baseline/manifest.json`. Six UI files and one test file change; 24 other candidate source/test files match batch 02’s source hashes. Original `layout.tsx` and `globals.css` match the baseline. The full incremental source/test/design diff was inspected with `git diff --check`, stat and changed-scope/secret review. Earlier full-candidate review is retained for unchanged files.

## Verification

- Final `corepack pnpm test:e2e:demo --grep 'audit batch 03|student entry .*progressive|product language|revised sample supports direct Send'`, with process-local `UNIMIND_E2E_USE_WEBPACK=1`: **11 passed**, zero unexpected, flaky, skipped or runner errors; 149.07 seconds.
- Four new EN/AR cases prove named Studio/Chat resume links, completed academic setup, matching configured collection/search labels, all five entries, search/filter/empty recovery, grouped status geometry, both original loaded fonts, Sessions menu bounds and Escape focus, language/draft retention, sending/new/reopened sessions and source return continuity. Coverage includes paired themes, 1440/820/390/320px, 200% text and axe checks.
- Existing entry cases pass in both locales. Existing language tests pass for student, leader and admin; visible scope labels are asserted in both languages. Existing EN/AR direct-Send/history/Studio-interruption cases also pass.
- Lint, normal typecheck, fresh typecheck, module boundaries, changed-file Prettier, secret scan and agent readiness pass. Final secret scan checked 3199 files. Final readiness checked 805 names, 357 local links, 23 synchronized decisions and 116 task contracts.
- Impeccable layout detector reports `[]`. Actual-diff routing retains policy 10, R2 and MATERIAL, with human acceptance required. Broad stable verification, exact-head CI and production proof remain outside this local review scope.

The initial complete run had nine passes and two failures because the new resume tests deep-entered Studio without saving academic context; returning to Study correctly reached onboarding. The test now completes the actual setup flow. One subsequent run was stopped after two entry passes to correct its new Studio-ready heading assertion. These reports are retained and superseded by the final eleven-pass run; no failing proof is called PASS.

Normal live recheck confirms all five results, original English/Arabic fonts, responsive geometry and native keyboard menu bounds. Temporary viewport overrides were reset. New screenshots only present the resulting live UI; measured DOM/styles/interactions are the evidence. No real identity, private content, provider, storage or backend proof is claimed.

## Artifacts and handoff

- Source binding (hash manifest removed in WP03-T15; see git history) binds the current candidate, incremental baseline, final report and live ledger by SHA-256.
- [Before/after tracker](<E:/Unimind audits/fix-batches.md>) retains scoped acceptance and claim mapping.
- Live ledger: `E:/Unimind audits/analysis/fix-batch-03-live-ui.json`.
- Final E2E report: `E:/Unimind audits/analysis/fix-batch-03-final-e2e.json`; initial and interrupted reports remain beside it.
- Presentation: `E:/Unimind audits/analysis/fix-batch-03-review.jpg`.

Normal dev session 8386 runs on `http://127.0.0.1:3000` using temporary process-local mocks with all paid providers disabled and budget zero. Stop this server before a test starts another Next instance in the same checkout. `next-env.d.ts` generated type imports were inspected and restored to their pre-turn state; final normal typecheck passes. Chrome tab 734484459 retains the completed public fixture at Study, showing Anatomy · Chat and Resume Anatomy. Subjects opens the updated catalog; Resume Anatomy opens the grouped Chat controls. A development reload discarded the first document fixtures after the measured verification; Chrome was re-entered after route compilation settled and the final named resume/font state was confirmed. Reload discards fixture state. Review this batch before starting batch 04; commits and external delivery remain held.


## Scoped founder review — batch 03 (10 October 2026)

Ahmed said “everything else approved move on to the next 5” and annotated the visible “Interface language” label with “we need to remove this”. This accepts F117 named resume, F133 configured catalog terminology, F134 subject status grouping and F169 Chat toolbar grouping in the presented batch 03 source snapshot, aggregate `2cbe58d0aeeef63bbc0cc6c69bc580cae4df951538cad140ad7b5b06f956b028`. Scope: `routes:/learn,/learn?view=subjects,/learn/[cohortId]/[unitId]/chat; surfaces:Study,Subjects,Chat; states:presented completed public fixture, responsive EN/AR candidate`. F168’s visible-label addition is rejected and will be removed; keep the accessible scope name and language buttons. Related F177 is superseded by this explicit preference. No whole-task acceptance, commit or external delivery is authorized. Batch 04’s five new fixes need their own rendered review.
