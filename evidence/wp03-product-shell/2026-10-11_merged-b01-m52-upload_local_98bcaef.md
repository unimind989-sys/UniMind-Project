# WP03-T13 — B01/M52 upload-description repair

Ahmed said "Start the first repair batch" after approving the merged plan. The task record's controlled amendment owns only the edited synthetic upload-description/finalization case. Admin hold reasons/dates and other B01 issues remain separate slices. Branch `codex/frontend-refinements`; base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`; local work remains uncommitted.

## Problem and change

The supplied PDF with the default description worked. Editing only the description to `Invented materials for a synthetic upload review.` uploaded the same approved bytes but returned an unconfirmed-submission error. The actual website reproduced this, and the EN regression failed twice at zero received submissions in about ten seconds.

Three hypotheses were recorded before diagnosis: exact sample-text validation, different upload/finalization metadata, or conflicting validity rules. The synthetic finalizer compared the description with one exact sentence. The shared queue carries the entered, trimmed description correctly, while the normal application accepts 10–1,000 trimmed characters. Those facts establish the first cause without temporary logging or a broader refactor.

Only that exact-description check is replaced with a string and trimmed-length check matching the normal application's bounds. Source-title restrictions, supplied-byte comparison, rights declaration, receipt/item/key matching, replay handling, counters, update and receipt deletion remain unchanged. No real server, database, storage, provider, account or permission behavior changes.

## Verification and review

- New EN/AR regressions pass: short rejected input retained; rights required; ordinary valid edited descriptions; native keyboard submission; light/dark at 1440/390/320px without horizontal overflow; one received queue row and one latest submission; no Retry submission action after completion.
- Existing EN/AR supplied-reference/default metadata cases and the supplied PDF/WAV/PNG, private-byte rejection and cancel/retry case pass. Five distinct browser cases have applicable passing proof.
- The first post-repair run recorded two test failures after successful finalization: the test expected the shared description control to remain visible, although completion intentionally removes the form. The erroneous post-completion control assertions were removed. Both new cases then passed. The original failures and traces remain; the initial run is not represented as all green. Existing adjacent tests were unchanged and their passing results are reused.
- Eight existing collection application/domain unit tests pass. Focused lint, repository lint, normal/fresh types, module boundaries and source/test/new-evidence formatting pass. The runbook's whole-file formatting check reports existing differences in the saved baseline; normalized before/after comparison confirms only the two added entries. Those earlier formatting differences remain preserved. Final secret scan covers 3,221 files; readiness checks 826 names, 383 links, 23 decisions and 116 contracts.
- The in-app browser retains the original failed row across hot refresh. Retrying its finalization succeeds with one received row and no new upload. Fresh isolated browser tests separately prove ordinary edited input succeeds. This manual retry and unchanged replay code do not establish new independent backend/idempotency certification.
- Inline review and independent review by `/root/audit_reconciliation` are clean. The saved before-test remainder is unchanged after newline normalization; the added two-locale block is the entire incremental test change.
- Design disposition `OBJECTIVE_PRESERVING`: restore the accepted metadata-validity/success path without markup, CSS, layout or copy changes. Baseline is the approved CollectionFlow contract in `DESIGN.md` and the captured pre-slice manifest. The full existing candidate remains `MATERIAL/PENDING/NOT_READY`. Central routing separately retains that full-candidate gate and validates this four-file incremental disposition, policy v10, R2/Short, one worker, no nested workers.
- Exact-head CI, broad whole-candidate verification, commit, delivery and production proof remain at the separately authorized delivery boundary. No application-wide PASS or acceptance is claimed.

## Evidence and disposition

[Source binding](2026-10-11-merged-b01-m52-upload-source-binding.json) records source/test input hashes, the four-file incremental change, retained result/evidence hashes and 3,215 unchanged pre-existing files. The [baseline and complete result folder](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-upload>) retains failing and passing runs, DOM observations, routing output and before copies.

[Before](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-upload/before.jpg>): edited description and unconfirmed finalization. [After](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-upload/after.jpg>): the same retained receipt completes successfully. The review capture shows the campaign and completed receipt below.

![Completed synthetic upload](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-upload/after-review.jpg>)

M52 is partially complete; only its upload-description case is repaired. The ordinary admin hold-removal reason and alternative expiry remain open. B01 also retains catalog, invitation/example, clock, varied-output and reference-origin work. The exact sample title check remains unchanged and title editing was not tested in this slice. The frozen merged registry and original approval export remain intact.

The loopback synthetic demo remains available on port 3101 for review. No new branch, commit, push, PR, merge or deployment.
