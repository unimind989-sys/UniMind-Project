# WP00-T14 Manual Sol/Luna work blocks

**State:** Implementation and isolated local proof PASS. Final closure is conditional on required CI for the final PR head and protected merge.

**Task:** WP00-T14

**Implemented source:** `cbfc83cda3c0024571471a7032e23040232bbfda` (`cbfc83c`)

**Environment:** local synthetic/mock-only checks and isolated checkout; planned GitHub CI uses disposable services. No hosted database, application production runtime, paid provider, private source, or student data was changed.

## Change and boundaries

- Policy v7 and its router no longer compute a model floor, preserve sticky Sol escalation, accept active/previous model flags, choose a worker model, or claim to verify or switch the Codex Desktop model.
- Sol High plans each new runbook task in the fewest useful ordered blocks. The durable task template records assignments, governing inputs, independent acceptance checks including failure cases, evidence, and the next manually selected model. Luna Max can implement substantial coherent bounded work when all four guide conditions hold; uncertainty or nonconverging work returns the same block to Sol.
- Risk classification, planning floor, verification selection, worker limit, evidence invalidation, branch protection, founder approvals, and the financial stop remain separate from model choice. Completed historical task records were preserved.
- An occupied local port exposed an E2E harness issue. Playwright now accepts a bounded alternate test port, owns only a server named by its lock, and warms the preview route before browser tests. The pre-existing server on port 3100 was preserved.

## Local proof

- Focused policy tests 45/45 and Playwright ownership tests 2/2 passed. The R3 auth case still selects authorization-denial verification. The router emitted no model fields; deprecated `--active-model` was rejected with exit 1.
- Policy validation passed 10 historical cases and 5 conditional-CI regressions. Typecheck, fresh typecheck, CI workflow, readiness (201 names, 48 links, 23 decisions, 108 records), isolated handoff, 22-skill validation, formatting, lint, secret scan, and diff integrity passed.
- The final guarded `corepack pnpm verify` returned exit 0 in a detached isolated checkout using `UNIMIND_E2E_PORT=3101`: 381 unit, 15 integration (two expected hosted-only skips), 26 security, 3 evaluation, 5 load, 31 E2E, production build, client artifact scan, and preflight checks passed. Preparation fingerprint: `c1e1bf3c62c1f3a2e405b41de18d917c2d5f20f8694f06e03239b946d98f4737`.
- Initial local broad proof stopped because port 3100 held the user's dev server. The first isolated browser run reached 29/31; traces showed transient route readiness failure. A fresh focused rerun passed 2/2 after the readiness URL fix, followed by the full guarded pass above.
- The full staged diff, stat, changed-file secret/scope risk, and `git diff --cached --check` were reviewed before implementation commit. The three pre-existing unrelated edits remained unstaged and uncommitted.

## Delivery condition

The evidence above binds to the implementation source. This closure document changes the PR head, so final PASS requires the required checks on that exact head, accurate distinct-account review provenance, protected merge, and confirmation on merged `main`. GitHub is the only affected external proof surface. There is no Supabase migration, Vercel deployment, or other production runtime proof for this workflow-only change. Rollback is a protected revert PR. D-22 authorizes this non-financial task after technical gates; it does not turn executor review into independent review.

An experiment created an untracked `.next-playwright/` directory in the original checkout. Automatic approval review rejected recursive removal; this directory is excluded from the commit and is a local cleanup limitation, not part of the delivered source.
