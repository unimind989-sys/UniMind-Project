# Task record: WP01-T08 create CI

**Task ID:** WP01-T08

**Status:** [x]

**Outcome:** A least-privilege standard GitHub-hosted runner reproduces application checks and a complete disposable Supabase database/Auth gate without persistent database credentials or founder-computer infrastructure.

**Owner:** Codex `/root`

**Reviewer:** Ahmed — ordinary human checkpoint completed 2026-08-28 after reviewing the green disposable-CI evidence and explicitly approving the required-check update and obsolete-environment deletion.

**Branch:** `wp01/environment-provisioning-authorization`

**Updated (UTC):** 2026-08-28

## Execution contract

**Dependencies:** WP01-T04 through WP01-T07 historical PASS; revised D-21 and ADR-0001 approved; repository is public; standard GitHub-hosted runner container support is available.

**Inputs:** Runbook WP01-T08; D-21/ADR-0001; exact package manager/runtime; pinned Supabase CLI; versioned migrations/seed/types; all test-layer scripts; synthetic environment profile.

**Files:** `.github/workflows/ci.yml`, immutable action pins, safe cache/report configuration, repository security/dependency checks, task/runbook state, and evidence.

**Verify:** Workflow syntax/pin/permission/trigger audit; standard Ubuntu runner starts a complete disposable Supabase stack; two clean resets; stable generated types; Auth/database/security checks; Preview/Beta isolation; cleanup; no persistent Supabase secret; clean GitHub run. WP02-T04 owns the deliberate RLS-leak regression after the database RLS matrix exists.

**Pass:** A fresh runner needs no Supabase dashboard state or persistent database credential, makes no paid call, cannot reach Preview/Beta, removes its database stack with the job, leaks no secret, and fails closed at every security seam implemented in WP01.

**Evidence:** External disposable proof: `evidence/wp01-foundation/2026-08-28_ci-disposable-database_github_c1428f2.md`; local candidate: `evidence/wp01-foundation/2026-08-28_ci-disposable-database_local_82d6be8.md`; historical hosted proof: `evidence/wp01-foundation/2026-08-27_ci-clean-database_github_06b6a76.md`; supporting revision: `evidence/wp01-foundation/2026-08-26_ci-security-review_local_ce7750b.md`; original rehearsal: `evidence/wp01-foundation/2026-08-26_ci-clean-database_local_2919e42.md`.

**Rollback:** Revert the candidate workflow only if a later regression is proven; preserve the three required checks. Do not recreate the obsolete hosted-CI environment or secrets unless a separately reviewed rollback requires them, and never restore retired credentials.

**Hard stop:** Do not repurpose either existing Supabase project before disposable CI passes. Do not publish an unverified workflow, grant write permissions by default, cache secrets/private data, expose the container stack, reach/reset Preview or Beta from CI, invent action SHAs, use a founder-hosted runner, or alter branch protection without authority.

## Steps

- [x] WP01-T04 through WP01-T07 have reviewed PASS evidence.
- [x] Author least-privilege workflow with immutable pins, safe concurrency, no credential cache, and hosted secrets scoped only to the guarded step. Owner: Codex `/root`; merged to `main`.
- [x] Reproduce every implemented database/application/security/smoke command on a fresh runner. Corrective PR CI #7 and protected main CI #8 passed.
- [x] Add secret scan, zero-cost production dependency audit, and sanitized always-upload reports. Both main artifacts were inspected by name and digest.
- [x] Obtain authorized external CI run and branch-protection review. `main` requires a PR, one human approval, and `application` plus `dependency-audit`; force pushes and deletion are disabled.
- [x] Replace the historical persistent hosted-CI workflow job with a pinned complete Supabase lifecycle on `ubuntu-24.04`, without a secret expression or protected environment.
- [x] Add a fail-closed runner guard, explicit local-only CLI actions, two-reset workflow policy, local-status parser, runner-local Auth seam, deterministic type generation, always cleanup, and sanitized reports.
- [x] Prove two clean resets, stable types, Auth/database/security checks, target isolation, cleanup, and absence of persistent hosted credentials in a real GitHub run. PR run `33122706939` passed at `c1428f2`.
- [x] After the external run passes, remove the obsolete GitHub hosted-CI secrets/environment dependency, add `database-ci` to the protected `main` checks, and hand WP01-T09 the unchanged current CI project for guarded Beta repurposing. Ahmed explicitly approved both live GitHub changes; GitHub confirmed the rule save and environment deletion on 2026-08-28.

## Handoff

**Changed:** The candidate least-privilege workflow now runs `application`, `dependency-audit`, and a complete credential-free disposable `database-ci` job on GitHub-hosted infrastructure. The protected `main` rule requires all three checks, a pull request, and one approval. The obsolete `ci` environment, its six secrets, and its two protection rules were permanently deleted after explicit approval. The two Supabase Free projects were not changed.

**Commands:** Exact-runtime `corepack pnpm verify` passed on Node 24.19.0/pnpm 10.34.5 with format, lint, typecheck, boundary/workflow audits, a 606-file secret scan, 214 unit tests, integration, 8 security, 3 evaluation, 5 load-profile, one Chromium smoke, production build, and client-artifact scan. `db:types:check`, agent readiness, and isolated handoff rehearsal also passed. GitHub CI #7 passed the protected pull-request checks. CI #8 application passed in 1m 17s and hosted CI passed in 33s after the approved isolated reset.

**2026-08-28 candidate commands:** The policy tests first failed against the old hosted job, then passed after implementation. `corepack pnpm verify` passed formatting, lint, strict types, boundaries, the revised CI policy, a 623-file secret scan, 225 unit tests, credential-free integration, 8 security tests, 3 evaluation cases, 5 load-profile checks, two Playwright checks, the production build, and client-artifact scan. `corepack pnpm db:ci:start` failed closed on the workstation before invoking Supabase with `Disposable Supabase commands require a GitHub-hosted Linux runner.` A real container lifecycle was not run locally and remains the required external checkpoint.

**2026-08-28 external result:** PR #6 run `33122706939` passed `dependency-audit`, `application`, and `database-ci` at `c1428f2`. The database job started the complete runner-local stack, reset twice, checked migration parity and generated types, passed 2 Auth/database integration tests and 8 security tests, removed the stack, and uploaded artifact `9667211781` with digest `sha256:e32f9dc756f2bc5b7197180e71f0ca631bb7838be9fda327ab277af439a3e3db`. The artifact records Ubuntu 24 runner image `20260823.283.1`, Docker 28.0.4, Node 24.19.0, Supabase CLI 2.115.0, PostgreSQL 17.6, PostgREST 16.1, vector 0.8.2, and the remaining installed extension versions. Attempts `33120854376` and `33121576946` failed closed only on environment-dependent generated-type metadata; fixes `a0365c2` and `2ec7118` normalized the public schema output before the final pass.

**Remaining:** No WP01-T08 work remains. WP02-T04 still owns the deliberate RLS-leak regression after the RLS matrix exists. WP01-T09 may now begin the separately authorized, guarded Preview/Beta repurposing sequence.

**Next safe action:** Start WP01-T09 with a fresh read-only Supabase inventory and a written action sequence. Obtain action-time confirmation before resetting data, rotating credentials, renaming projects, or changing callbacks/secrets.

**Reviewer action:** Complete. Ahmed reviewed the green runner evidence and authorized the required-check update plus permanent obsolete-environment deletion on 2026-08-28. Future migration/RLS changes retain the two-person rule.

## 2026-08-27 architecture revision

- Ahmed approved revised D-21: workstation mocks, disposable Supabase CI, and the two persistent Free projects reserved for separate Preview and locked Beta.
- The earlier PASS proves the superseded persistent hosted-CI design at its recorded commits. Its evidence and historical sections below remain unchanged.
- WP01-T08 is reopened because WP01-T09 may not repurpose the current CI project until the replacement CI path passes.
- No CI workflow, secret, project role, or external resource was changed by the documentation revision.

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
