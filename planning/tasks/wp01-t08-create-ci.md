# Task record: WP01-T08 create CI

**Task ID:** WP01-T08

**Status:** [?]

**Outcome:** A least-privilege clean runner reproduces install, database reset, security tests, generated types, application checks, smoke tests, secret scan, and sanitized failure reports.

**Owner:** Codex `/root` after WP01-T07 PASS

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-26

## Execution contract

**Dependencies:** WP01-T04 through WP01-T07 reviewed PASS, including hosted CI isolation; approved repository/branch-protection authority for external GitHub settings.

**Inputs:** Runbook WP01-T08; exact package manager/runtime; versioned migrations/seed/types; all test-layer scripts; synthetic environment profile.

**Files:** `.github/workflows/ci.yml`, immutable action pins, safe cache/report configuration, repository security/dependency checks, task/runbook state, and evidence.

**Verify:** Local equivalent gate; workflow syntax/pin/permission audit; clean GitHub run when authorized; deliberate RLS leak rejection after database security tests exist.

**Pass:** A fresh runner needs no dashboard state, makes no paid call, leaks no secret, and rejects an intentionally unsafe RLS policy.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_ci-clean-database_github_<short-sha>.md`

**Rollback:** Disable/revert the future workflow and preserve required branch protections unless an authorized owner changes them.

**Hard stop:** Do not publish an unverified workflow, grant write permissions by default, cache secrets/private data, reset development/preview/beta from CI, invent action SHAs, alter branch protection without authority, or claim the database security gate before WP01-T04/T07 pass.

## Steps

- [?] Wait for WP01-T07 reviewed PASS; WP01-T04, WP01-T05, and WP01-T06 have reviewed PASS evidence.
- [ ] Author least-privilege workflow with immutable pins and safe concurrency/cache behavior.
- [ ] Reproduce every database/application/security/smoke command on a clean runner.
- [ ] Add secret/dependency review and sanitized always-upload reports.
- [ ] Obtain authorized external CI run and branch-protection review.

## Handoff

**Changed:** No workflow authored; its exact dependency and external review boundaries are recorded.

**Commands:** NOT RUN for WP01-T08. The versioned hosted CI database isolation is reviewed; Auth and complete test-layer commands remain blocked upstream.

**Remaining:** Entire WP01-T08 implementation after WP01-T07 PASS plus an authorized external run.

**Next safe action:** Complete the hosted development/CI database/Auth/test chain; then author CI from the proven guarded command contract.

**Reviewer action:** Assign before external publication; migration/RLS/security changes retain independent review.
