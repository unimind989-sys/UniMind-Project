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

**Verify:** Local equivalent gate; workflow syntax/pin/permission/trigger/secret-scope audit; approved-target rejection; clean GitHub run when authorized. WP02-T04 owns the deliberate RLS-leak regression after the database RLS matrix exists.

**Pass:** A fresh runner needs no dashboard state, makes no paid call, leaks no secret, and fails closed at every security seam implemented in WP01. The later database RLS matrix cannot be a prerequisite for the CI foundation that WP02 depends on; WP02-T04 must add and prove the deliberate leaking-policy failure before the WP02 gate.

**Evidence:** Security-revision draft at `evidence/wp01-foundation/2026-08-26_ci-security-review_local_ce7750b.md`; original rehearsal at `evidence/wp01-foundation/2026-08-26_ci-clean-database_local_2919e42.md`; the final external proof remains `evidence/wp01-foundation/YYYY-MM-DD_ci-clean-database_github_<short-sha>.md`.

**Rollback:** Disable/revert the future workflow and preserve required branch protections unless an authorized owner changes them.

**Hard stop:** Do not publish an unverified workflow, grant write permissions by default, cache secrets/private data, reset development/preview/beta from CI, invent action SHAs, alter branch protection without authority, or claim the database security gate before WP01-T04/T07 pass.

## Steps

- [x] WP01-T04 through WP01-T07 have reviewed PASS evidence.
- [~] Author least-privilege workflow with immutable pins and safe concurrency/cache behavior. Owner: Codex `/root`; branch: `main`.
- [?] Reproduce every database/application/security/smoke command on a clean runner. The complete local equivalent and guarded hosted-CI rehearsal pass; an external clean runner remains authorization-gated.
- [~] Add secret/dependency review and sanitized always-upload reports. Authored and locally audited; reviewer and external-run proof remain outstanding.
- [?] Obtain authorized external CI run and branch-protection review.

## Handoff

**Changed:** Revision candidate `ce7750b` fixes three security defects found during review. Every hosted database/Auth/metadata adapter now consumes one approved-target interface that validates the committed environment fingerprint. The credentialed hosted job runs only for `main` push/manual executions, and its six CI secrets exist only on the database/Auth step—not checkout, install, security tests, or artifact upload. The workflow audit now locks trigger scope, secret mapping, `write-all` rejection, dependency review, frozen install, no cache, Chromium install, full application gate, action pins, concurrency, commands, and reports. The repository scanner no longer lets words such as `synthetic` or `example` suppress a token/database credential; only `.invalid` database hosts are exempt. The WP01/WP02 contract now assigns deliberate RLS-leak rejection to WP02-T04, where the RLS matrix actually exists. External publication, GitHub secret entry, workflow execution, and branch-protection mutation remain authorization-gated.

**Commands:** Focused red/green tests proved unapproved-target, pull-request secret exposure, job-level secret scope, `write-all`, missing dependency review/frozen install/application gate/Chromium, cache configuration, and scanner-bypass failures. The revised adapters passed `db:metadata`, `db:push:dry-run`, `db:migrations`, `db:types`, `db:types:check`, and environment-backed `test:integration:hosted:ci` against CI fingerprint `sha256:6ad364ad022a`; no additional reset was needed. Exact-runtime `pnpm verify` passed on Node 24.19.0 with 212 unit tests, local integration, 8 security, 3 evaluation, 5 load-profile, one Chromium smoke, production build, CI-policy audit, 604-file repository scan, and client-artifact scan. Immutable action tags were independently resolved to the committed SHAs. Full results are in the linked revision evidence.

**Remaining:** Assign an independent reviewer; authenticate an authorized GitHub session; explicitly authorize push/workflow publication and GitHub settings; configure the protected public-repository `ci` environment with the exact six secrets and `main`-only deployment policy; run the candidate on a fresh GitHub runner; inspect logs/artifacts; require the application/dependency checks and independent review in `main` branch protection. The deliberate RLS-leak test remains a named WP02-T04 requirement and does not block WP01-T08/WP01-T09 sequencing.

**Next safe action:** Review `evidence/wp01-foundation/2026-08-26_ci-security-review_local_ce7750b.md`, name the reviewer, and obtain explicit authorization for GitHub authentication, push, `ci` environment configuration, first workflow run, and branch protection. Do not start WP01-T09 until that external evidence is reviewed PASS.

**Reviewer action:** Inspect `ce7750b` plus the original candidate series, verify the protected trigger/step-scoped secrets/approved fingerprint and immutable pins, then independently inspect the first external run, artifacts, environment policy, and branch rules. Future migration/RLS changes retain the two-person rule.
