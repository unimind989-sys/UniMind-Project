# WP03-T13 — B01/M52 admin-input repair

The demo now accepts ordinary safe hold-removal reasons and alternative illustrative hold dates. It keeps the entered details after an unavailable result. The second administrator sees the original reason/date, cannot replace them and must make a separate attestation before confirming.

Ahmed's continuation authorizes this bounded local slice after the upload repair. Branch `codex/frontend-refinements`; base `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. Work is uncommitted. The original audit, approval export, prior upload evidence and unrelated local work remain preserved.

## What caused the failures

The actual website rejected `Synthetic hold review is complete.` for removal and `2026-10-18T16:00` for placement, although the forms presented them as valid. The reason/date regression failed twice before editing; a separate red test proved lost draft fields after an unavailable result. Three hypotheses preceded diagnosis: exact-fixture restrictions, disagreement between form/submission validation, and React action reset.

The loopback adapter required exact sample sentences and the exact sample date. Pending reasons were stored only in the hosted path; expiry was never stored. Uncontrolled form fields reset during the React action lifecycle. The repair uses the existing 8–500 trimmed-character and offset-datetime contracts, canonical date normalization and controlled drafts/request keys. It captures and checks pending reason/expiry in document-local synthetic state. The shared queue accepts optional expiry metadata without changing the real server/database queue.

M48's synthetic pending-expiry case is a necessary adjacent repair: completing an alternative-date proposal safely requires the second reviewer to confirm that same date. This does not close B05 or establish production queue behavior. No production retention period, future-date rule or new clock policy is inferred while D-19 is open. The existing server request validation is unchanged; only its validator is reused behind an application interface. No storage, provider, paid enablement, deletion or real authorization mutation.

## Verification and review

- Twelve browser cases pass in the final focused run: four EN/AR ordinary reason/date flows through distinct review; two retained-error-draft cases; one malformed/tampered-payload case; two prior edited-upload regressions; three existing governed-example, stale/readiness and availability workflows.
- Tests cover both themes, 1440/390/320px, native keyboard, retained short input, cancel/edit and focus restoration, read-only original reason/date, initially unchecked independent attestation, same-principal denial and altered payload rejection. Axe passes for the affected main region; this is not a whole-page accessibility claim.
- After the final application-interface extraction, the three affected date/payload browser cases pass again. Previously passing unrelated cases are unchanged and reused. Seven focused unit files pass 99 tests; five admin-boundary security tests pass. No real-data, persistence, provider-quality or concurrency certification is implied.
- Initial failed runs and traces remain in the evidence folder. Test-only corrections address Arabic action names and student-only sign-out helper assumptions. A whole-page Axe failure identified the unchanged demo notice outside landmarks; the affected-region check does not conceal that limit. A draft retry assertion was corrected to respect the existing requirement to reload uncertain authority. Strict optional-property typing and a module-layer import were also corrected. Initial commands naming nonexistent Vitest configs ran no tests; the project-based reports contain the actual passing results.
- Independent review caught permissive date-parser shortcuts. The existing ISO schema now rejects malformed submitted expiry, including `1`; the browser test verifies no pending proposal and retained input. Final eight-file review is clean at aggregate `ff317265c4625d38c35cc50ba20fe5ba9307162d903602e4c6f6183654676d0d` (sorted relative path, space, lowercase file SHA-256; UTF-8/LF with trailing LF).
- Inline React review confirms unconditional hooks, per-document fixture state, explicit controlled fields, stable request keys, existing error/reload behavior, native labels/required controls and preserved focus behavior. No new provider, waterfall, module-shared mutable state, component library, stylesheet or layout work.
- Repository/focused lint, normal/fresh types and module boundaries pass. Source/test/new-evidence formatting, secret/readiness checks, complete incremental diff inspection and unchanged-baseline verification are retained with the source binding. Whole-task formatting identifies two pre-existing extra blank lines; whole-runbook formatting also has baseline differences. Both are preserved, the new task append passes formatting independently, and only two completed runbook entries are added. The original task-record prefix remains intact.
- Design disposition `OBJECTIVE_PRESERVING` restores the approved exact-change admin contract in `DESIGN.md`. Full candidate remains `MATERIAL/PENDING/NOT_READY`; no material acceptance, exact-head CI, commit or external delivery is claimed.

## Evidence and remaining work

[Source binding](2026-10-11-merged-b01-m52-admin-source-binding.json) identifies the final source/test inputs, changed paths, baseline preservation and retained artifact hashes. The [complete evidence folder](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-admin>) keeps before copies, red/failing/passing reports, DOM observations, native screenshots and routing results.

[Reason before](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-admin/reason-before.jpg>) and [reason after](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-admin/reason-after.jpg>) show the same ordinary reason moving from rejection to pending independent approval. [Date before](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-admin/expiry-before.jpg>) and [date after](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-admin/expiry-after.jpg>) show the alternative date accepted and retained.

![Independent review of the original hold date](<E:/Unimind audits/flow audit/Merged/repairs/B01-M52-admin/independent-review.jpg>)

M52's three reported cases have local repair proof: the prior edited upload description and this slice's ordinary admin reason/alternative date. B01 remains open for clock, catalog, example, output and reference-origin work. M48 is addressed only for synthetic pending-hold metadata; other admin design/recovery work remains in B05. The frozen issue registry is unchanged; the separate repair disposition records this progress.

The synthetic demo remains on loopback port 3101 for review. No branch change, commit, push, PR, merge or deployment.
