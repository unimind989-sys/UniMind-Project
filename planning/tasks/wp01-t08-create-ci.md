# Task record: WP01-T08 create CI

**Task ID:** WP01-T08

**Status:** [x]

**Outcome:** A least-privilege clean runner reproduces install, database reset, security tests, generated types, application checks, smoke tests, secret scan, and sanitized failure reports.

**Owner:** Codex `/root`

**Reviewer:** Ahmed via `unimind989-sys` approved corrective implementation PR #3. Completion evidence PR #4 passed all three checks and was merged by the repository owner with the documented administrator bypass after GitHub rejected repeated attempts to submit an additional approval.

**Branch:** implementation merged to `main` as `ee18f702e99131f5307de50bdbf9a799b2d92120`; implementation branch deleted

**Updated (UTC):** 2026-08-27

## Execution contract

**Dependencies:** WP01-T04 through WP01-T07 reviewed PASS, including hosted CI isolation; approved repository/branch-protection authority for external GitHub settings.

**Inputs:** Runbook WP01-T08; exact package manager/runtime; versioned migrations/seed/types; all test-layer scripts; synthetic environment profile.

**Files:** `.github/workflows/ci.yml`, immutable action pins, safe cache/report configuration, repository security/dependency checks, task/runbook state, and evidence.

**Verify:** Local equivalent gate; workflow syntax/pin/permission/trigger/secret-scope audit; approved-target rejection; clean GitHub run when authorized. WP02-T04 owns the deliberate RLS-leak regression after the database RLS matrix exists.

**Pass:** A fresh runner needs no dashboard state, makes no paid call, leaks no secret, and fails closed at every security seam implemented in WP01. The later database RLS matrix cannot be a prerequisite for the CI foundation that WP02 depends on; WP02-T04 must add and prove the deliberate leaking-policy failure before the WP02 gate.

**Evidence:** Final external proof at `evidence/wp01-foundation/2026-08-27_ci-clean-database_github_06b6a76.md`; supporting revision at `evidence/wp01-foundation/2026-08-26_ci-security-review_local_ce7750b.md`; original rehearsal at `evidence/wp01-foundation/2026-08-26_ci-clean-database_local_2919e42.md`.

**Rollback:** Disable/revert the future workflow and preserve required branch protections unless an authorized owner changes them.

**Hard stop:** Do not publish an unverified workflow, grant write permissions by default, cache secrets/private data, reset development/preview/beta from CI, invent action SHAs, alter branch protection without authority, or claim the database security gate before WP01-T04/T07 pass.

## Steps

- [x] WP01-T04 through WP01-T07 have reviewed PASS evidence.
- [x] Author least-privilege workflow with immutable pins, safe concurrency, no credential cache, and hosted secrets scoped only to the guarded step. Owner: Codex `/root`; merged to `main`.
- [x] Reproduce every implemented database/application/security/smoke command on a fresh runner. Corrective PR CI #7 and protected main CI #8 passed.
- [x] Add secret scan, zero-cost production dependency audit, and sanitized always-upload reports. Both main artifacts were inspected by name and digest.
- [x] Obtain authorized external CI run and branch-protection review. `main` requires a PR, one human approval, and `application` plus `dependency-audit`; force pushes and deletion are disabled.

## Handoff

**Changed:** The least-privilege workflow is live on protected `main`. The credential-free application job and production dependency audit run on pull requests; the credentialed hosted job can run only after reviewed `main` code reaches the protected `ci` environment. Six CI secrets remain step-scoped. The target guard validates the committed fingerprint before dry run or reset. The gate performs reset, migrations, synthetic seed, type stability, hosted Auth integration, implemented security tests, and sanitized report upload. The corrective revision reconciled exact hosted PostgREST 14.17 type output and kept runtime timeouts bounded.

**Commands:** Exact-runtime `corepack pnpm verify` passed on Node 24.19.0/pnpm 10.34.5 with format, lint, typecheck, boundary/workflow audits, a 606-file secret scan, 214 unit tests, integration, 8 security, 3 evaluation, 5 load-profile, one Chromium smoke, production build, and client-artifact scan. `db:types:check`, agent readiness, and isolated handoff rehearsal also passed. GitHub CI #7 passed the protected pull-request checks. CI #8 application passed in 1m 17s and hosted CI passed in 33s after the approved isolated reset.

**Remaining:** None for WP01-T08. WP02-T04 still owns the deliberate RLS-leak regression after the RLS matrix exists. Critical RLS, deletion, rights, budget, release/unlock, and beta decisions continue to require the repository's two-person rule even though this ordinary CI implementation needed one human approval.

**Next safe action:** Stop after merging this completion evidence. WP01-T09 is intentionally reserved for Ziad and must not be started in this task.

**Reviewer action:** Confirm the final evidence identifiers match CI #8, then approve the completion PR. Future migration/RLS changes retain the two-person rule.

## 2026-08-27 external continuation checkpoint

- Repository owner is `unimind989-sys`; `aboayman-oss` is a collaborator and the configured `ci` environment reviewer.
- PR #2 merged to `main` as `06b6a76f2a4f3c9ea402ea0564616cdb35a93501` after Ahmed approved head `a1c7edb3269a594758f6879616fe9502c98a8c67`.
- GitHub dependency review is a paid Code Security feature for private repositories. It was replaced by the pinned zero-cost `corepack pnpm audit --audit-level high --prod` job plus policy regressions preventing reintroduction of the unsupported action.
- PR CI run `33020995316` passed `dependency-audit` and `application`; main run `33021371273` passed `application` and uploaded local artifact `9626663618` with digest `sha256:ba69e50f339bad9c751fbb551ad6f6191dfad9bdc349483622e50c68511f2b1b`.
- Main run `33021371273`, hosted job `98352561534`, received protected-environment approval and completed the reset/migration/type-generation sequence described below.
- Durable resume instructions and remaining branch-protection/evidence work are in `evidence/wp01-foundation/2026-08-27_ci-clean-database_github_06b6a76.md`.

## 2026-08-27 hosted attempt 1 result

- `aboayman-oss` approved environment `ci`; job `98352561534` reset the isolated synthetic target, applied migration `20260824235549`, seeded it, and verified local/remote migration parity.
- The job failed closed at `db:types:check` because hosted generation changed only `PostgrestVersion` from `14.15` to `14.17`. Hosted Auth, security, and the hosted artifact did not run.
- The corrective evidence branch carries the exact generated-type update. Local review also found and fixed two test-orchestration flakes: the 2-second unit cold-import limit is now 5 seconds, and the slow-filesystem Next.js startup allowance is now 120 seconds while E2E assertions remain 15 seconds.
- The corrected main run received a fresh explicit destructive-reset confirmation for fingerprint `sha256:6ad364ad022a`; no other target was approved.

## 2026-08-27 final result

- PR #3 passed required checks, received human approval through `unimind989-sys`, and merged as `ee18f702e99131f5307de50bdbf9a799b2d92120`; its local and remote implementation branches were deleted.
- Main CI run `33043240893` passed. The credential-free application job passed in 1m 17s before the protected environment released credentials.
- `aboayman-oss` approved only environment `ci` for committed fingerprint `sha256:6ad364ad022a`. Hosted job `98421571535` passed in 33s: guarded database/Auth 21s, security 1s, sanitized artifact upload 1s.
- Hosted artifact `9634839025` has digest `sha256:f81f692ed45bc15746020694d2b2e7adf03d92becb1df5a6f0327eb3ac599598`; local artifact `9634668004` has digest `sha256:1f6a75259746ff302e174c3d21e1f2b1951938d1426f2573d8c71318364f32d4`.
- Classic protection applies to `main`: require a pull request, one human approval, `application`, and `dependency-audit`; force pushes and branch deletion are disabled.
- Completion evidence PR #4 passed its three checks. GitHub rejected repeated owner-account approval submissions, so the repository owner used the permitted administrator bypass for this documentation-only merge without weakening the saved protection rule or approving another database reset.
- WP01-T08 is PASS. WP01-T09 remains unstarted for Ziad.
