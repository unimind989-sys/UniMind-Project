# Gate report: WP01-T08 CI security revision

**Status:** IN PROGRESS

**Environment:** Exact-runtime local application gate plus guarded synthetic hosted Supabase `ci`; no GitHub setting, secret, workflow run, push, branch rule, or RLS policy was changed

**Commit SHA:** `ce7750b3744cc63710411168a8c045329e65103b`

**Release/config fingerprint:** Hosted CI `sha256:6ad364ad022a`; PostgreSQL 17.6; vector 0.8.2; pgcrypto 1.3; Node 24.19.0; pnpm 10.34.5; Supabase CLI 2.115.0

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql` (unchanged; no reset required for this revision)

**Dataset/fixture versions:** Hosted synthetic `wp01-foundation-v1`; 3 fixtures/canaries; local foundation evaluation/load fixtures

**Executor:** Codex `/root`

**Independent reviewer:** UNASSIGNED — EXTERNAL GATE BLOCKED

**Started/finished (UTC):** 2026-08-26T09:10Z / local revision verification finished 2026-08-26T09:50Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Approved target | Every database/Auth/metadata adapter rejects a syntactically valid but unapproved project before access or mutation | One `readApprovedHostedSupabaseTarget` interface now parses, checks reset confirmation when required, and validates the committed fingerprint; all three adapters use it | PASS | Target unit test; adapter diff; hosted commands below |
| Untrusted-code isolation | No credentialed job executes pull-request code | Hosted job runs only on `refs/heads/main` for push/manual events; PRs run credential-free application and dependency-review jobs | PASS locally | Workflow and policy mutation test |
| Secret scope | Checkout, setup, install, local security, and artifact upload cannot read CI credentials | Six exact `UNIMIND_CI_*` values are mapped only on the combined database/Auth step; job scope contains only non-secret `CI` and environment name | PASS locally | Workflow and secret-scope mutation test |
| Workflow contract | Unsafe trigger, write permission, floating action, cache, missing install/browser/application/dependency/hosted command, unsafe concurrency/target/report fails audit | Ten workflow-policy tests pass; the repository workflow audit returns no violations | PASS locally | `tests/unit/ci-workflow-policy.test.ts`; `pnpm verify:ci-workflow` |
| Secret scanner | A prose marker cannot exempt a credential, and output never copies the value | `synthetic`/`example` bypasses now fail; only database URLs with a `.invalid` host are exempt; reports remain path/line/code only | PASS | Scanner tests; final 605-file scan |
| Guarded hosted rehearsal | Approved fingerprint, metadata, migration parity, stable types, Auth and cleanup pass without another reset | Metadata/dry-run/migrations/types/no-diff and environment-backed Auth passed; temporary synthetic user cleanup passed | PASS | Commands below |
| Exact-runtime local gate | Complete credential-free gate passes under Node/pnpm pins | 212 unit, local integration, 8 security, 3 evaluation, 5 load-profile, one Chromium, build, and client scan passed | PASS | `pnpm verify` below |
| RLS sequencing | CI foundation must not depend on RLS work that begins in WP02, while deliberate leak proof remains mandatory when policies exist | WP01-T08 pass now covers implemented WP01 seams; deliberate leaking-policy failure is an explicit WP02-T04 acceptance item before the WP02 gate | PASS contract correction | Runbook WP01-T08 and WP02-T04 |
| External clean runner and governance | GitHub environment, secrets, run, artifacts, reviewer, and branch protections are verified | GitHub CLI is not authenticated; no external mutation was authorized or attempted | BLOCKED | Task handoff and final GitHub evidence required |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-26 revision session | Red/green approved-target interface test | expected 1 then 0 | Missing interface failed; unapproved CI-shaped project now fails fingerprint validation |
| 2026-08-26 revision session | Red/green hosted trigger and secret-scope policy tests | expected 1 then 0 | PR-capable hosted job, job-level secret, and whitespace-variant secret expressions are rejected |
| 2026-08-26 revision session | Red/green workflow contract tests | expected 1 then 0 | `write-all`, missing dependency review/frozen install/application gate/Chromium, and cache configuration are rejected |
| 2026-08-26 revision session | Red/green repository scanner tests | expected 1 then 0 | Token/database URLs remain detected even beside `synthetic`/`example`; emitted violation omits the value |
| 2026-08-26 09:46 | `pnpm db:metadata --environment ci` | 0 | Approved fingerprint; PostgreSQL/extensions/3 fixtures; private schema denied |
| 2026-08-26 09:46 | `pnpm db:push:dry-run --environment ci`; `db:migrations --environment ci` | 0 | Approved target is up to date and migration histories match |
| 2026-08-26 09:46 | `pnpm db:types --environment ci`; `pnpm db:types:check` | 0 | Generated public types remain deterministic and no-diff |
| 2026-08-26 09:46 | Environment-backed `pnpm test:integration:hosted:ci` | 0 | Provider mock and hosted Auth create/sign-in/refresh/forgery denial/cleanup passed; expected forged-cookie parser warnings contained no credential |
| 2026-08-26 09:48 | Exact Node 24.19.0 `pnpm verify` | 0 | Complete gate passed with counts recorded above and 604-file repository scan |
| 2026-08-26 revision session | Official action-tag `git ls-remote` checks | 0 | checkout `3d3c42e…`, setup-node `8207627…`, upload-artifact `043fb46…`, dependency-review `a1d282b…` match workflow pins |
| 2026-08-26 09:50 | Final `pnpm scan:secrets`; agent readiness/handoff/work-state checks | 0 | 605 files, 112 names, 31 links, 21 decisions, 102 task contracts, isolated handoff, and WP01-T08 routing passed |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Valid-shape but unapproved project | Reject before hosted adapter access | Approved-target interface throws the fingerprint diagnostic | PASS | Target test |
| Pull-request or non-main hosted execution | Credentialed job is skipped | Exact event/ref policy is audited and mutation-tested | PASS configuration | External scheduler proof pending |
| Secret at job scope or alternative expression spacing | Static audit rejects | Both forms produce `HOSTED_SECRET_SCOPE_UNSAFE` | PASS | Workflow-policy test |
| Job-level `write-all` | Static audit rejects | Produces `WRITE_PERMISSION` | PASS | Workflow-policy test |
| Missing dependency review/install/browser/application gate or configured cache | Static audit rejects each contract loss | Named violations asserted | PASS | Workflow-policy tests |
| Credential beside synthetic/example prose | Still detect without printing value | Token and database cases return path/line/code only | PASS | Scanner tests |
| Forged Auth cookie | Deny and clean temporary actor | Denied with expected SDK parser warning; cleanup passed | PASS | Hosted Auth command |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T08-R01 | Resolved | Database reset/migration/type adapters parsed the environment but did not enforce the committed approved-project fingerprint. | Codex | Resolved in `ce7750b` | No |
| WP01-T08-R02 | Resolved | Hosted credentials were at job scope and the job was eligible on same-repository pull requests, exposing secrets to candidate code and install/report steps. | Codex | Resolved in `ce7750b` | No |
| WP01-T08-R03 | Resolved | Whole-line `synthetic`/`example` markers could suppress a real-looking credential. | Codex | Resolved in `ce7750b` | No |
| WP01-T08-R04 | Resolved | WP01-T08 required an RLS leak test whose schema/matrix is created only in dependent WP02. Ownership is now explicit in WP02-T04 without weakening the future gate. | Codex | Resolved in task/runbook handoff | No |
| WP01-T08-EXT-01 | Blocking | The public GitHub repository has no authenticated CLI session in this workspace, and environment secrets/run/branch rules have not been configured or independently reviewed. | Ahmed/reviewer | Before WP01-T08 PASS | WP01-T08 and WP01-T09 |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, project reference, private raw content, ordinary chat content, or unredacted personal data.
- [x] Hosted credentials are step-scoped and unavailable to pull-request code, dependency install, and artifact actions.
- [x] Every hosted adapter verifies the environment's committed non-secret fingerprint.
- [x] Scanner output remains redacted to file, line, and rule code.
- [x] Hosted data and Auth actors are synthetic; the temporary Auth actor was deleted.
- [x] No paid provider, preview/beta target, GitHub mutation, RLS mutation, or extra reset was used.

## Rollback/disable procedure

Before publication, revert `ce7750b3744cc63710411168a8c045329e65103b` if the revision is rejected. After authorized publication, disable/revert the workflow while preserving required branch protections until an authorized owner approves a rule change. Revoke and rotate the six CI environment secrets if any first-run log or artifact review suggests exposure. The synthetic CI project remains isolated and unchanged except for the temporary Auth actor, which cleanup deleted.

## Decision

The locally implemented WP01-T08 workflow is now suitable for an authorized external clean-runner review. It is not PASS until GitHub environment configuration, the first application/hosted runs, artifacts/logs, branch protection, and independent review are complete. Once those pass, WP01-T09 may begin without waiting for WP02; the deliberate RLS-leak proof is preserved as WP02-T04 work.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | REVISED LOCAL CANDIDATE READY; EXTERNAL GATE BLOCKED | 2026-08-26 |
| UNASSIGNED | Independent reviewer | NOT REVIEWED | — |
