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
