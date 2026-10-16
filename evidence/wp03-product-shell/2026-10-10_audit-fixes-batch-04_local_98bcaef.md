# WP03-T13 — audit fixes batch 04, local proof

Ahmed authorized five more findings on 10 October 2026 with “everything else approved move on to the next 5”. His annotation requested removal of the visible “Interface language” label. The scoped batch 03 receipt records acceptance of its other four changes against their original source binding. This batch remains on `codex/frontend-refinements`, base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. No commit or external delivery is authorized.

## Findings and implementation

| Finding | Actual normal dev UI before | Candidate after |
| --- | --- | --- |
| F162 | Materials edition `synthetic-2026-2027`; six appendices say “No reliable locator in fixture”. | Known sample edition has a readable English/Arabic label. Appendices say “No verified page or timestamp reference”. Underlying edition, sample disclosure, eight sources and supplied page/timestamp references remain. Other edition strings pass through. |
| F200 | Studio “Topic” contains Study sequence and Diagram comparison. | Selector and result say Study focus / Selected study focus, with Arabic equivalents. Values, options and generated artifact semantics remain. |
| F184 | Depth and size works as a native disclosure but uses 13px/400 secondary color. | 14px/600 foreground; native marker, keyboard operation and target retained. Normal live target is 46.39px EN and 48.5px AR. This addresses only the supported emphasis concern. |
| F208 | Quiz inputs spread over two columns, leaving Difficulty alone below. Tablet input grid is 623px wide above the centered Start action. | One centered 512px maximum column includes timed duration when selected. Start stays centered as Ahmed approved. Mobile follows the same input order. |
| F209 | Timing/Difficulty legends are secondary 14px; count is foreground 16px. | All configuration labels are foreground 16px/400. Choice options retain their own existing 14px styling. |

The separately requested correction removes the visible shared language label and its unused wrapper/CSS. Accessible Interface language / لغة الواجهة naming, native buttons, locale behavior and draft retention remain. F168/F177 are superseded by Ahmed’s preferred omission; do not re-add the label in a later batch.

F349/F360 map to F162’s missing-reference wording. F212/F215 map to F208’s column grouping. F218’s mismatch between left inputs and the centered action is reduced by centering the input column; the approved center action remains. F221’s related input-density concern is partially covered; unused space outside the column remains. Historical verdicts and original observations stay intact. F162/F200 concern the selected public fixture; no claim about real academic material is made.

## Preparation and review

Design disposition is MATERIAL; rendered acceptance is pending. Open Folio, semantic tokens and original Manrope/Noto Sans Arabic are retained. Six UI files and one test file change from the batch baseline. No dependency, new hook, data fetch, authorization, protected copy, availability, persistence or quiz-domain behavior changes. The display mapping affects only the known sample edition string.

Inline React and layout review is complete. DOM/focus order follows the unchanged native controls. Scoped label styling does not change shared ChoiceGroup styling elsewhere. Full incremental source/test/design changes, `git diff --check`, stat and scope/secret risk were inspected; prior full-candidate review is reused for files with unchanged hashes. Baseline and rollback copies live at `E:/Unimind audits/analysis/fix-batch-04-baseline/manifest.json`. Restore only this batch’s edits if requested, preserving unrelated dirty work.

## Verification

- Initial focused run: **15 passed**, zero unexpected/flaky/skipped/runner errors, 224.98 seconds. It covers the four new EN/AR cases, all-role language switching, Chat draft/session/source continuity, both original Quiz configuration/invalid-input/timer cases, six Studio artifact types in each language and both Studio cancellation cases.
- Final affected run: **4 passed**, zero unexpected/flaky/skipped/runner errors. New assertions prove material count and references, edition/locator wording, selected study focus, native disclosure emphasis/keyboard/draft values, generated output/source returns, single-column geometry, equivalent labels, centered action and native invalid count rejection. Both themes, 1440/820/390/320px, 200% text, axe and original loaded font faces are covered.
- An initial fresh typecheck found five possibly-undefined array accesses in new test assertions. Non-null assertions were added for the already-tested populated field list; Materials narrow/enlarged reflow assertions were also added. The four affected cases were rerun. Product source did not change between browser runs. Final fresh types and lint pass; eleven unchanged browser cases reuse the initial passing run.
- Normal typecheck, module boundaries, changed-file Prettier, secrets, readiness, diff checks and the layout detector pass. The first secret scan checked 3199 files; the final artifact scan is recorded in the task handoff. Actual-diff routing retains policy 10, R2 and human MATERIAL acceptance required. No broad suite, exact-head CI or production proof is claimed.

Normal server UI on port 3000 confirms English desktop/tablet/mobile and Arabic 320px after state, including all five results, preserved source counts, native options and original fonts. No measured state overflows horizontally. Original screenshot audits are not used as evidence; current screenshots only present the resulting live UI. Temporary viewport overrides are reset.

## Artifacts and review boundary

- Source binding (hash manifest removed in WP03-T15; see git history) binds the current source, baseline, both passing reports and live ledger.
- [Before/after tracker](<E:/Unimind audits/fix-batches.md>) records the five changes and scoped prior acceptance.
- Live ledger: `E:/Unimind audits/analysis/fix-batch-04-live-ui.json`.
- Reports: `E:/Unimind audits/analysis/fix-batch-04-initial-e2e.json` and `fix-batch-04-final-e2e.json`.

Normal dev session 23626 runs at `http://127.0.0.1:3000` with process-local mocks, disabled paid providers and budget zero. Stop it before E2E starts another Next instance in this checkout. Generated `next-env.d.ts` imports were inspected and restored; its diff is empty and normal types pass. A stale in-app connection-error document could not be reloaded under the browser URL policy, so normal inspection continued in a fresh same-browser tab. No URL-policy bypass was attempted. Reload/new documents discard the public fixture. The final task handoff records the live review tabs. Review batch 04 before another five changes; commits and external delivery remain held.


**Final rendered handoff:** In-app tab 5 is at English Studio with completed academic setup; Chrome tab 734484459 is at English Quiz. Both retain the public fixture. Live screenshots for presentation: E:/Unimind audits/analysis/fix-batch-04-review.jpg and fix-batch-04-studio-review.jpg. The source aggregate is `a9a308ee7a36bf2de5225d0d896fbdcf91b2a5371c35ddec5784f1917a5a4191`; 25 earlier sources retain their hashes. Full task acceptance, broad verification and external delivery remain pending.

Final scan: 3201 files. Final readiness: 807 names, 358 local links, 23 synchronized decisions and 116 task contracts. Final affected E2E: four passes in 75.79 seconds. All 32 source hashes and the live-ledger hash match the binding.


## Scoped founder review — batch 04 (10 October 2026)

Ahmed said “approved next batch (5 to 10 you may have more ability to choose how many you'll tackle according to relevancy findings)”. This accepts the presented batch 04 findings F162/F200/F184/F208/F209 and requested visible-language-label removal against source aggregate `a9a308ee7a36bf2de5225d0d896fbdcf91b2a5371c35ddec5784f1917a5a4191`. Scope: Materials sample metadata, Studio study-focus naming and optional-control emphasis, Quiz configuration grouping/labels, and the shared language label omission in the presented EN/AR responsive public-fixture candidate. The original batch 04 source binding remains unchanged. This is scoped batch acceptance, not whole WP03-T13 acceptance or authorization for commit/external delivery. The next local batch may contain 5–10 related findings and requires its own before/after review.
