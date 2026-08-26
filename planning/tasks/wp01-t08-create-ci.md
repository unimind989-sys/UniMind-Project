# Task record: WP01-T08 create CI

**Task ID:** WP01-T08

**Status:** [~]

**Outcome:** A least-privilege clean runner reproduces install, database reset, security tests, generated types, application checks, smoke tests, secret scan, and sanitized failure reports.

**Owner:** Codex `/root`

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-26

## Execution contract

**Dependencies:** WP01-T04 through WP01-T07 reviewed PASS, including hosted CI isolation; approved repository/branch-protection authority for external GitHub settings.

**Inputs:** Runbook WP01-T08; exact package manager/runtime; versioned migrations/seed/types; all test-layer scripts; synthetic environment profile.

**Files:** `.github/workflows/ci.yml`, immutable action pins, safe cache/report configuration, repository security/dependency checks, task/runbook state, and evidence.

**Verify:** Local equivalent gate; workflow syntax/pin/permission audit; clean GitHub run when authorized; deliberate RLS leak rejection after database security tests exist.

**Pass:** A fresh runner needs no dashboard state, makes no paid call, leaks no secret, and rejects an intentionally unsafe RLS policy.

**Evidence:** Local rehearsal draft at `evidence/wp01-foundation/2026-08-26_ci-clean-database_local_2919e42.md`; the final external proof remains `evidence/wp01-foundation/YYYY-MM-DD_ci-clean-database_github_<short-sha>.md`.

**Rollback:** Disable/revert the future workflow and preserve required branch protections unless an authorized owner changes them.

**Hard stop:** Do not publish an unverified workflow, grant write permissions by default, cache secrets/private data, reset development/preview/beta from CI, invent action SHAs, alter branch protection without authority, or claim the database security gate before WP01-T04/T07 pass.

## Steps

- [x] WP01-T04 through WP01-T07 have reviewed PASS evidence.
- [~] Author least-privilege workflow with immutable pins and safe concurrency/cache behavior. Owner: Codex `/root`; branch: `main`.
- [?] Reproduce every database/application/security/smoke command on a clean runner. The complete local equivalent and guarded hosted-CI rehearsal pass; an external clean runner remains authorization-gated.
- [~] Add secret/dependency review and sanitized always-upload reports. Authored and locally audited; reviewer and external-run proof remain outstanding.
- [?] Obtain authorized external CI run and branch-protection review.

## Handoff

**Changed:** Candidate commits `2c14cda`, `371717e`, and `2919e42` add the least-privilege workflow, immutable action pins, environment-backed CI profile adapter, guarded hosted Auth command, workflow-policy audit, repository secret scan, stable generated-type formatting, focused tests, and formatting normalization. The workflow uses no cache, serializes the hosted CI database, and uploads only `test-results/` with `if: always()`. External publication, GitHub secret entry, workflow execution, and branch-protection mutation remain unauthorized hard stops.

**Commands:** `corepack pnpm db:metadata --environment ci`, `db:push:dry-run --environment ci`, `db:reset --environment ci`, `db:migrations --environment ci`, two runs of `db:types --environment ci`, `db:types:check`, and the environment-backed `test:integration:hosted:ci` passed against the reviewed isolated CI fingerprint. `corepack pnpm verify` passed after formatting four new files; 202 unit tests, the local integration seam, 8 security tests, 3 evaluation tests, 5 load-profile tests, one Chromium smoke, the production build, CI-policy audit, and 603-file repository/client-artifact secret scans passed. `corepack pnpm install --frozen-lockfile`, `git diff --check`, and generated-type no-diff checks passed. The sanitized command record is in the linked local evidence draft.

**Remaining:** Assign an independent reviewer; explicitly authorize workflow publication and CI-environment secret entry; run the candidate on a fresh GitHub runner; inspect sanitized artifacts; require CI and independent review in `main` branch protection. The deliberate leaking-RLS rejection cannot be claimed until WP02 introduces the database RLS matrix it is meant to test.

**Next safe action:** Review `evidence/wp01-foundation/2026-08-26_ci-clean-database_local_2919e42.md` and obtain explicit external authorization plus a named reviewer. Do not start WP01-T09 or publish/configure GitHub state from this task record alone.

**Reviewer action:** Inspect the three candidate commits and local evidence, verify the action pins and report scope, then independently review the first external run and branch rules. Migration/RLS/security changes retain the two-person rule.
