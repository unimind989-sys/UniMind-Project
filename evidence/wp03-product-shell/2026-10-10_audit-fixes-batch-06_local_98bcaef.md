# WP03-T13 — audit fixes batch 06, local proof

Ahmed accepted batch 05 and requested the next batch on 10 October 2026, saying “appeoved. next”. Five current presentation problems were selected after rechecking the actual normal development UI on port 3000. Audit recommendations remain excluded. This candidate stays on codex/frontend-refinements at base 98bcaefca5512817c9d18e87e7bc2e9086fa89b4. No commit or external delivery is authorized.

## Findings and implementation

| Finding | Actual normal UI before | Actual normal UI after |
| --- | --- | --- |
| F236 | Setup parent H2 is 20px; step/review H3 is 24px. | Parent is 24px and step/review is 20px. Native H2/H3 semantics and focus remain; Welcome H1 remains 34px on desktop. |
| F261 | Faculty includes two faculties and a flexible-credit program. | Faculty or program / الكلية أو البرنامج names the category in the step, legend, review/Edit and editable Settings. Actual catalog names and high-school Track remain. |
| F246 | Choose what you study precedes institution, program, year and period questions. | Choose your academic path / اختر مسارك الدراسي describes the whole selection. The original ability to edit later remains. |
| F087 | The historical 820px split no longer reproduces, but at 900px the arrow is y280.27 and Academic settings is y305.86. | An inline-block reference moves together when space permits; a nonbreaking space binds the arrow to the first destination word on narrow/enlarged text. Reference text remains noninteractive. |
| F296 | At 1440px the ending divider is 1200px wide, while choices/actions are 640px. | The onboarding section, helper and divider share the existing 640px form limit. Editable Settings width remains unchanged. |

F242/F317 map to hierarchy. Only the wider-divider portions of F240/F250/F292 map to F296. Their broader aesthetic severity is not adopted. Unused space around a short flow remains. Historical audit verdicts are preserved; shared claims do not count as additional fixes.

## Preparation and review

Disposition is MATERIAL; Ahmed's rendered acceptance is pending. Two UI files and one test file change from the batch baseline. Manrope and Noto Sans Arabic remain, and root layout/global CSS hashes are identical. No dependencies, providers, account identity, authorization, storage, catalog availability or durable data rules change. Shared academic labels and helper text stay within the existing adapter.

Inline React and layout review is complete. Native radio/select controls, progression, dependent reset, Edit, focus and save remain. Reference grouping wraps on narrow/enlarged screens without becoming a new action. The full incremental source/test/design diff was inspected; 30 unchanged prior source/test hashes retain earlier review. Baseline: E:/Unimind audits/analysis/fix-batch-06-baseline/manifest.json. Rollback restores only this batch, preserving earlier approved and unrelated dirty work.

## Verification

- Focused browser run: 12 passed, zero unexpected/flaky/skipped/runner errors, 175.47 seconds. No repair run or later source changes. Two new EN/AR cases exercise all five fixes; ten affected entry, editable-account, review, profile/workspace and disabled-action cases also pass.
- Both themes, 1440/900/820/390/320px, 200% text, axe, keyboard and original loaded fonts are covered. Assertions reject reversed heading sizes, mismatched section/form widths, imprecise helper/category labels and separation between the arrow and the first destination word. New cases also preserve high-school Track, flexible-credit period labels, upstream reset, review/Edit, saving and the selected Medicine shelf context. Isolation checks reject write/API requests, foreign origins, cookie writes and page errors.
- Repository and narrow lint, normal/fresh types, module boundaries and changed-file formatting pass. Generated next-env imports were inspected and restored; their final diff is empty, then normal/fresh types pass. One final layout detector reports no findings. Actual-diff routing is policy 10, R2, MATERIAL, HUMAN_DESIGN_ACCEPTANCE_REQUIRED.
- Final artifact scans, source binding and diff checks are recorded below after execution. No broad suite, exact-head CI or production proof is claimed.

Command: corepack pnpm test:e2e:demo --grep 'audit batch 06|audit batch 02 .*distinct progress|audit batch 05 .*disabled setup|student entry .*progressive|academic setup, editable account|workspace revision .*profile' --reporter=list,json, with temporary UNIMIND_E2E_USE_WEBPACK=1 and PLAYWRIGHT_JSON_OUTPUT_NAME pointing to the report below. Other checks: corepack pnpm lint; corepack pnpm typecheck; corepack pnpm typecheck:fresh; corepack pnpm check:boundaries; changed-file Prettier; git diff --check/stat and full incremental inspection.

Normal port 3000 before/after measurements cover desktop, tablet and phones, English/Arabic, and both themes. No measured after state overflows horizontally. Parent/step scale, Faculty or program in setup/review/Settings, helper text, reference grouping and matched boundary are visible on this server. Actual setup saves to the correct Study Shelf and persists into editable Settings. The arrow split is reproduced before at 900px; precise after arrow/destination geometry is asserted in the browser tests, while normal UI confirms the grouped reference. DOM-only inspection cannot expose text Range geometry; no geometry result is claimed from that unavailable probe. Audit screenshots are not proof. Current screenshots serve as review presentation.

## Artifacts and handoff

- Source binding (hash manifest removed in WP03-T15; see git history) binds 33 candidate source/test files, three incremental source/test changes, original font sources, report, normal live ledger and presentation images. Thirty prior hashes remain identical. Aggregate: 51c905a124c4243837e9bfd1b0b3e37b4f747affe985fdfb8919e349b8b009f9.
- [Before/after tracker](<E:/Unimind audits/fix-batches.md>).
- [Normal live ledger](<E:/Unimind audits/analysis/fix-batch-06-live-ui.json>).
- [Browser report](<E:/Unimind audits/analysis/fix-batch-06-initial-e2e.json>).
- Presentation: fix-batch-06-setup-review.jpg and fix-batch-06-settings-review.jpg in E:/Unimind audits/analysis.

Normal dev session 60000 remains running at http://127.0.0.1:3000 with temporary process-local mocks, zero provider budget and disabled paid providers. Stop it before another Next server in this checkout. In-app tab 9 shows setup → Faculty or program; tab 8 shows saved Academic settings. The setup handoff viewport is 1034 × 892, with temporary overrides reset. Both use the public document-local sample fixture; reload discards fixture data and approved sample entry restores it. The setup tab is deliberately unsaved for reviewing the five presentation changes. No environment file changed.

Review these five before another batch. Full WP03-T13 acceptance and preparation fingerprint remain pending. No new branch, commit or external delivery.


**Final batch 06 checks:** Final secret scan passes for 3205 files. Agent readiness passes for 811 names, 362 local links, 23 synchronized decisions and 116 task contracts. Changed-file formatting and diff integrity pass; generated next-env diff is empty. All 33 source/test hashes, the 12-case report, final live ledger and two presentation images match the binding. Original font sources remain identical. No source changes after passing focused proof.


## Scoped founder review — batch 06 (10 October 2026)

Ahmed said “appeoved. next”. This accepts F236/F261/F246/F087/F296 against source aggregate 51c905a124c4243837e9bfd1b0b3e37b4f747affe985fdfb8919e349b8b009f9. Scope: routes:/learn,/settings; surfaces:setup heading scale, faculty/program label, academic-path helper, profile reference, onboarding divider; states:presented responsive EN/AR public-fixture candidate. The original batch 06 binding remains unchanged. This is scoped acceptance, not whole WP03-T13 acceptance or commit/external delivery authorization. The next local batch follows the existing 5–10-finding cadence.
