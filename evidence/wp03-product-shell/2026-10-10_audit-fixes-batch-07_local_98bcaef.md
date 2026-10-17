# WP03-T13 — audit fixes batch 07, local proof

Ahmed accepted batch 06 and requested the next batch on 10 October 2026, saying “appeoved. next”. Five bounded weaknesses were rechecked against the normal development UI on port 3000. Recommendations remain excluded. Their original Partly supported verdicts and qualifications remain unchanged; this batch does not adopt inflated impact claims. Candidate stays on codex/frontend-refinements at base 98bcaefca5512817c9d18e87e7bc2e9086fa89b4, with no commit or external delivery authorization.

## Findings and implementation

| Finding | Before on the normal live UI | After |
| --- | --- | --- |
| F118 | At 1440px, resume context starts at x248 and its action at x1233 in a 1200px panel. | Panel is capped at 640px; the action starts at x248 beneath its context, with a 16px gap. Phone action stretches within the panel. |
| F150 | PDF/AUDIO are secondary 14px/400 metadata below material titles. | Plain foreground 14px/600 format labels sit beside titles and wrap when needed. Locators remain below. |
| F347 | Excerpt summary is a borderless, transparent 44px row. | A surfaced native disclosure has a 1px boundary, existing marker and 44px minimum height. Enter opens and Space closes the original excerpt. |
| F192 | At 820px, empty Studio H3 is 26px while the form H2 is 18px. | Only the empty H3 becomes 16px. Configuration leads; generated artifacts retain their hierarchy. |
| F217 | Count has native min1/max6, with no adjacent range or accessible description. | Visible 1–6 questions per sample attempt helper is connected through aria-describedby. Exact input label, native limits and validation remain. |

Related F125 maps only to resume grouping; F343 maps to format scanning; F194 maps only to empty-state hierarchy, not its unsupported contrast claim. H060 is already covered by batch 04's centered Quiz column. These duplicates are not extra fixes. Privacy-policy gaps F105/F106/F108 remain unresolved and no policy promises are invented.

## Preparation and review

Disposition is MATERIAL, policy 10 / R2 / HUMAN_DESIGN_ACCEPTANCE_REQUIRED. Four UI files and one test file change from this batch baseline. Manrope and Noto Sans Arabic remain; root layout and global CSS hashes are identical. Native disclosures, input semantics, locators, availability, resume targets, all six Studio types and quiz configuration remain. No dependencies, providers, account identity, authorization, storage, domain range or durable data changes.

Inline React/layout review and the full incremental source/test/design diff inspection are complete. Twenty-eight prior candidate source/test hashes retain earlier review. Test locator adjustments accommodate the source-title wrapper and count-helper container while preserving original behavior and geometry assertions. Baseline E:/Unimind audits/analysis/fix-batch-07-baseline/manifest.json allows restoring only this batch while preserving approved and unrelated dirty work.

## Verification

- Fourteen focused cases pass: zero unexpected/flaky/skipped/runner errors, 231.09 seconds, no repair run. Two new EN/AR cases cover these five changes; twelve affected resume/catalog, material disclosure/context-return, Studio generation, Quiz configuration and validation cases also pass.
- Both themes, EN/AR, 1440/820/390/320px, 200% text, keyboard, axe and original loaded fonts are covered. New checks reject detached resume actions, weak source formats, missing native excerpt boundaries, reversed Studio heading scale and absent visible/accessible count guidance. Invalid 0/7/blank counts disable starting; native ArrowUp remains. All six Studio artifacts, source continuity, untimed/timed Quiz and original score/review behavior pass in affected cases. Isolation checks reject write/API requests, foreign origins, cookie writes and page errors.
- Repository/narrow lint, normal/fresh types, boundaries, changed-file formatting and layout detector pass. Detector returns no findings. Generated next-env imports were inspected/restored; diff is empty and normal/fresh types pass after restart. Diff integrity/stat and full incremental scope/secret review are complete. Final artifact scans follow below.

Focused command: corepack pnpm test:e2e:demo --grep 'audit batch 07|audit batch 02 .*compact source|audit batch 03 .*named resume|audit batch 04|all six Studio artifacts|workspace revision .*quiz count' --reporter=list,json. Temporary UNIMIND_E2E_USE_WEBPACK=1 and PLAYWRIGHT_JSON_OUTPUT_NAME select the local report. No broad suite, exact-head CI or production proof is claimed.

Normal port 3000 before/after measurements confirm all five changes, desktop/tablet/phone reflow, EN/AR and both themes. No measured after state overflows horizontally. Actual native Enter/Space toggles preserve excerpt text/locator; Resume Anatomy activated by Enter returns to the correct Anatomy Studio. Count helper is localized and associated without changing the accessible label. Original audit screenshots are not used as proof; the saved current views are presentation for Ahmed's review. A fresh sample tab replaced a stale page after the server restart; prior setup tab 9 was left untouched.

## Artifacts and handoff

- Source binding (hash manifest removed in WP03-T15; see git history): 33 candidate source/test files, five incremental source/test changes, 28 unchanged prior hashes, original font sources, browser report, live ledger and four presentation images. Aggregate a8b56922aeee4f72149eba164b3253ca52acbebefe628756537bebb5e1cc527d.
- [Before/after tracker](<E:/Unimind audits/fix-batches.md>).
- [Normal live ledger](<E:/Unimind audits/analysis/fix-batch-07-live-ui.json>).
- [Browser report](<E:/Unimind audits/analysis/fix-batch-07-initial-e2e.json>).
- Current presentation images in E:/Unimind audits/analysis: fix-batch-07-materials-review.jpg, fix-batch-07-studio-review.jpg, fix-batch-07-quiz-review.jpg, fix-batch-07-resume-review.jpg.

Normal dev session 97815 remains running at http://127.0.0.1:3000 with process-local mocks, zero provider budget and disabled paid providers. Stop it before E2E starts another Next server in this checkout. In-app tab 10 shows Anatomy Materials; Studio/Quiz and Study provide the other changed views. Temporary viewport overrides are reset; final normal viewport is 1280 × 720. The public document-local sample fixture is configured to Medicine / First year / Term 1; reload discards it and approved sample entry restores it. No environment file changed.

Five changes await Ahmed's rendered review before another batch. Whole WP03-T13 acceptance and preparation fingerprint remain NOT_READY. No new branch, commit or external delivery.


**Final batch 07 checks:** Final secret scan passes for 3207 files. Agent readiness passes for 813 names, 365 local links, 23 synchronized decisions and 116 task contracts. Changed-file formatting and diff integrity pass; next-env diff is empty. All 33 candidate source/test hashes, the 14-case report, final normal live ledger and four presentation images match the binding. Original font sources remain identical. No source changes after passing focused proof. Ahmed rendered review remains pending.


## Scoped founder review — batch 07 (10 October 2026)

Ahmed said “approved. next batch, also to make it easier for me to review I want before and after screenshots”. This accepts F118/F150/F347/F192/F217 against source aggregate a8b56922aeee4f72149eba164b3253ca52acbebefe628756537bebb5e1cc527d. Scope: routes:/learn,/learn/[cohortId]/[unitId],/studio,/quiz; surfaces:resume grouping, source formats, native excerpt boundary, Studio empty heading, count helper; states:presented responsive EN/AR public-fixture candidate. Original batch 07 binding remains unchanged. This is scoped acceptance, not whole WP03-T13 acceptance or commit/external delivery authorization. Next local batch is authorized with matching before/after screenshots.
