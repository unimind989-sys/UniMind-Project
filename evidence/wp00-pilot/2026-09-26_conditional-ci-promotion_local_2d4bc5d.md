# WP00-T16 conditional CI promotion

## Scope and evidence

Policy v8 enables conservative PR job selection. It validates workflow SHA-256 `841a0d8381a41687776660eec787f73b4639dd27bd62ff707f3b4f8d987b1fce`, current-policy readiness and exact PR merge parents. PR diff extraction includes deletions and both sides of renames; missing/malformed comparison state rejects selection. Failed selection runs full jobs and is a required blocking check.

Historical GitHub PR runs 46 (`35799810641`), 48 (`35893819433`), 50 (`36045288034`), 53 (`36138168844`) and 54 (`36139600120`) were read from authenticated GitHub APIs and replayed through policy v8 using each exact PR head and changed-path list. They were successful broad executions under their original policy versions, not new runs under v8. All three jobs have run and skip observations, eight regressions are covered, and there are no contradictions. Detailed input/outcome provenance remains in `conditional-ci-shadow-evidence.json`.

Security/policy documents consumed by tests, structured planning/evidence files, selector governance files and unknown paths force full CI. Ordinary Markdown documentation uses formatting, secret scanning and readiness in the selector job. Main pushes keep application/database proof; manual database feedback remains opt-in.

## Local proof

- Focused policy/workflow/selector tests: 74 PASS.
- Fresh TypeScript, policy/workflow auditors, readiness and isolated handoff rehearsal: PASS.
- First guarded invocation was rejected before the broad chain because the task's Commands field lacked the required `exit 0` wording; corrected from already observed results.
- First broad run passed formatting, lint, TypeScript, boundaries, SQL, policy, secrets, 449 unit, 15 integration, 31 security, 3 evaluation and 5 load tests. Browser server exceeded the 120-second startup timeout; Next.js regenerated `next-env.d.ts`, and the completion guard rejected the run. This is a failed broad result, not PASS.
- A focused retry warmed the local server; all 39 browser tests passed. A guarded rerun then passed the full local chain for unchanged fingerprint `69b0d133b5fdf2356f556e2660f64a3f6a9a67c48e7008d844caf43586a3511f`, including the build and client artifact secret scan.
- Final review found that database integration imports under `src/lib/db/` were classified as generic runtime code. The final policy additionally forces full CI for those adapters, scripts, integration/security tests and dependency files. This only expands RUN decisions. Focused tests were rerun (78 PASS) and both policy/workflow auditors passed; unaffected broad layer results are reused. Complete final-head CI remains required.

## Delivery and rollback

No hosted product resource, schema, real data or paid provider changes. Required status contexts retain the existing three names and add `ci-selector` with the same GitHub Actions app binding. Protected merge keeps the existing review rule. Review by the same executor through a separate authorized account is distinct-account approval, not independent review.

Rollback: protected revert of selector, policy and workflow together. Keep `ci-selector` required while the revert is checked; if its removal is approved, remove only that context after the reverting CI has completed and retain all original contexts.

## Exact-head GitHub proof

- Implementation [PR #55](https://github.com/unimind989-sys/UniMind-Project/pull/55), head `31055701e159c70353bfd1759d8a1495ed68f212`, [run 36266710640](https://github.com/unimind989-sys/UniMind-Project/actions/runs/36266710640): `ci-selector` PASS (22s), `dependency-audit` PASS (11s), `application` PASS (2m43s), `database-ci` PASS (4m20s). The full final-head application gate includes all test layers and the production build.
- Safe documentation [probe PR #56](https://github.com/unimind989-sys/UniMind-Project/pull/56), head `0515f962456e498e6b6a148e784befa0c5d3b0df`, [run 36266843284](https://github.com/unimind989-sys/UniMind-Project/actions/runs/36266843284): `ci-selector` PASS (29s); the three heavyweight jobs all SKIPPED. Required check names were present. Probe closed without merge and its branch deleted.
- Initial probe head `2ac51a90eef511048ef60de0ed06e622923017bf`, run `36266727982`: selector correctly chose docs-only, but readiness rejected the executor's undated probe evidence filename. The selector job failed and all three heavyweight jobs started, demonstrating live full fallback. Run cancelled; GitHub force-cancel was used when ordinary cancellation left always-conditioned database work running. The disposable runner owns its stack; no persistent database was involved. The fixture filename was corrected before the successful probe.
- Main protection retains `application`, `dependency-audit`, `database-ci` and adds `ci-selector`; all are bound to GitHub Actions app 15368. Approval count remains 1; strictness and admin settings remain unchanged. The same executor operated `aboayman-oss` to approve exact head `3105570`, then restored `unimind989-sys`. This approval is not independent review.
- Protected squash merge: `c21e1d9bcac5f85d6c140cb0d5e3a57b2156bdc0` on 2026-09-26. [Post-merge main run 36267019639](https://github.com/unimind989-sys/UniMind-Project/actions/runs/36267019639) PASS: selector, application and database-ci all passed; the PR-only dependency audit was skipped. The merged workflow retained full main-push proof.

## Limits

This reduces redundant PR CI work; it does not establish a measured Codex quota saving. Safe docs still get a package install and lightweight checks. Main pushes intentionally keep full application/database proof, including documentation closure pushes. Ordinary cancellation can leave always-conditioned database work running; the redundant failed probe was explicitly stopped. No tests were removed.
