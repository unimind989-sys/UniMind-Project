# WP03-T13 — audit fixes batch 05, local proof

Ahmed accepted batch 04 and authorized 5–10 related findings in the next local batch on 10 October 2026. Six supported presentation problems were selected after rechecking the actual normal development UI on port 3000. Audit recommendations remain excluded. This candidate stays on codex/frontend-refinements, base 98bcaefca5512817c9d18e87e7bc2e9086fa89b4; no commit or external delivery is authorized.

## Findings and implementation

| Finding | Actual normal UI before | Actual normal UI after |
| --- | --- | --- |
| F001 | Student repeats in utility header, H1 and assigned-role metadata. | Header and H1 say Settings / الإعدادات. Assigned role remains in Your account, and the personal profile destination remains. |
| F059 | A textless 200 × 122px schematic sits beside the choices, 28px away, or above them on phones. | A captioned preview below the choices shows readable Study, Your Study Shelf, Materials and View supporting excerpt using the existing theme tokens. It is display-only, maximum 360px, with a 16px gap. |
| F101 | Earlier mode, saving/retention and qualifying report review share one paragraph. | Three labelled explanations use a native definition list. Every original qualification sentence is preserved verbatim in both languages. |
| F171 | Sessions is transparent, borderless and 13px beside outlined Unit sources. | Surfaced, bordered 14px native disclosure. Its marker, keyboard operation, bounded menu and focus return remain. On phones, two equal columns keep Sessions and Sources together. |
| F174 | Sharing status and shortcuts share a secondary 13px line, 12px on phones, joined by a middle dot. | Status is foreground 14px/600; shortcut help is a separate 14px span. They wrap independently and retain their existing wording and state. |
| H067 | Disabled Continue retains the active blue fill at 65% opacity. | Disabled Continue uses a neutral surface, border and secondary text at full opacity. Selecting a valid option restores the original blue and enables the action. |

Related title claims F011/F022/F033/F056/F073/F077/F097/F102/H029/H050 map to F001. F045/F062 map to preview grouping; F110 to privacy scanning; F175/F180 to Sessions. These shared claims do not count as additional fixes. H067 still reproduces in current initial setup; its alleged low text contrast remains unsupported. Historical findings and verdicts are preserved.

Privacy-policy gaps F105/F106/F108 remain unresolved. This presentation change supplies no retention period, report criteria or privacy promise. The retained English qualifications are: “Earlier exchanges keep their recorded mode.” “Private mode is separate from saving and retention.” “Qualifying reports permit audited review of the reported exchange only; the disclosure wording is still being confirmed.” Their original Arabic equivalents, sharing choices and pending-retention notice also remain. Tests assert the exact original sentences.

## Preparation and review

Design disposition is MATERIAL; Ahmed's rendered acceptance is pending. Open Folio, Manrope and Noto Sans Arabic remain. Seven UI source files and one test file change from the batch baseline. Root layout and global CSS hashes are identical. No dependencies, provider, account, authorization, storage, availability or durable data behavior changes.

Inline React and layout review is complete. Native controls and focus order are retained, the privacy structure uses dt/dd, and preview text is not presented as an interactive action. Full incremental source/test/design changes and the final repaired Chat diff were inspected; unchanged prior candidate files reuse their earlier review. The baseline preserves eleven files at E:/Unimind audits/analysis/fix-batch-05-baseline/manifest.json. Restore only this batch's changes if requested, preserving unrelated dirty work.

## Verification

- Initial focused run: 7 passed, 8 failed, zero flaky/skipped/runner errors, 281.36 seconds. This is a nonpassing run. Passing unaffected entry, academic/account and storage-denial cases remain applicable. New padding exposed narrow toolbar wrapping; new test assumptions also incorrectly required a document title, desktop menu position, draft clearing and caret position.
- Repair run: 6 passed, 4 failed, zero flaky/skipped/runner errors, 177.38 seconds. Settings/privacy/theme and disabled-setup cases pass in both languages. The old mobile history rule still spanned both toolbar columns; new newline coverage also assumed the cursor was at the draft end. This is a nonpassing run.
- Final affected run: 6 passed, zero unexpected/flaky/skipped/runner errors, 96.45 seconds. Removing the obsolete history grid-column rule keeps the two actions together. The test explicitly moves the caret to the end before Shift+Enter. Both old and new Chat keyboard/draft/session/locale cases pass on the final layout.
- Fifteen distinct focused cases have applicable passing proof across the scoped runs: six final Chat cases, four settings/setup cases reused from the repair run and five unchanged entry/account/storage cases from the initial run. No later source changes affect the nine reused cases. Both themes, EN/AR, 1440/820/390/320px, 200% text, axe and original self-hosted font faces are covered.
- Repository lint, narrow final-test lint, normal and fresh types, module boundaries and changed-file formatting pass. Final layout detector reports no findings. Actual-diff routing is policy 10, R2, MATERIAL, HUMAN_DESIGN_ACCEPTANCE_REQUIRED. Final secret/readiness/diff results are recorded after artifact creation below. No broad suite, exact-head CI or production proof is claimed.

Normal port 3000 before/after observations cover twelve responsive states plus two native menu bounds checks, with English/Arabic and both themes. None of the measured after states overflows horizontally. The original families render on the normal server. EN320/AR320 menus remain within the 320px viewport, and Sessions aligns with Sources. Enabled and disabled setup colors were checked through actual radio choices. Original audit screenshots are not evidence; screenshots of the current result serve only as review presentation. Temporary viewport overrides are reset.

## Artifacts and handoff

- [Source binding](2026-10-10-audit-fixes-batch-05-source-binding.json) binds 33 candidate source/test files, eight incremental source/test changes, the original fonts, reports and final normal-UI ledger. 25 prior candidate hashes remain identical. Aggregate: 92785e1431073ee34c96189e0da93dd58a6deb473082a86464de452bdeea6565.
- [Before/after tracker](<E:/Unimind audits/fix-batches.md>).
- [Normal live ledger](<E:/Unimind audits/analysis/fix-batch-05-live-ui.json>).
- Reports: fix-batch-05-initial-e2e.json, fix-batch-05-repair-e2e.json and fix-batch-05-final-e2e.json in E:/Unimind audits/analysis.
- Presentation images: fix-batch-05-settings-review.jpg and fix-batch-05-chat-review.jpg in the same folder.

Normal dev session 79724 remains running at http://127.0.0.1:3000 with temporary process-local mocks, zero provider budget and disabled paid providers. Stop it before starting another Next server in this checkout. In-app tab 6 shows Settings → Appearance; tab 7 shows Anatomy → Chat. Final handoff viewport is 1034 × 892 with the temporary override reset. Both retain the public sample fixture; a reload discards document-local fixture data, and approved sample entry restores it. Compilation cleared an earlier review fixture; the final Settings and Chat title/font states were verified after entry was restored. Chrome control was unattached, so the retained review tabs are in-app. Generated next-env imports were inspected/restored and normal/fresh types pass. No environment file changed.

Review this six-finding batch before another batch. Full WP03-T13 acceptance and preparation fingerprint remain pending. No new branch, commit or external delivery.

**Final checks:** Final secret scan passes for 3203 files. Agent readiness passes for 809 names, 359 local links, 23 synchronized decisions and 116 task contracts. Changed-file Prettier and diff integrity pass; generated next-env diff is empty. All 33 source/test hashes, three reports and final live-ledger hash match the binding. The final six-case Chat run has zero unexpected/flaky/skipped/runner errors. Original fonts remain; no new source changes after passing affected proof.


## Scoped founder review — batch 05 (10 October 2026)

Ahmed said “appeoved. next”. This accepts the six presented findings F001/F059/F101/F171/F174/H067 against source aggregate 92785e1431073ee34c96189e0da93dd58a6deb473082a86464de452bdeea6565. Scope: routes:/settings,/learn,/learn/[cohortId]/[unitId]/chat; surfaces:settings titles, appearance preview, privacy explanations, Sessions disclosure, composer status, disabled setup action; states:presented responsive EN/AR public-fixture candidate. The original batch 05 binding remains unchanged. This is scoped acceptance, not whole WP03-T13 acceptance or authorization for commit/external delivery. The next local batch is authorized under the existing 5–10-finding review cadence.
