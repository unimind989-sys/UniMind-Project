# Gate report: WP01-T08 clean-database CI

**Status:** IN PROGRESS

**Environment:** GitHub Actions plus protected isolated `ci` Supabase target

**Commit SHA:** `06b6a76f2a4f3c9ea402ea0564616cdb35a93501`

**Release/config fingerprint:** committed CI target fingerprint `sha256:6ad364ad022a`; GitHub environment `ci`; deployment branch restricted to `main`

**Migrations:** committed `supabase/migrations/` sequence at the commit above; hosted execution is waiting for approval

**Dataset/fixture versions:** repository synthetic CI seed and versioned synthetic evaluation/load fixtures at the commit above

**Executor:** Codex `/root`

**Independent reviewer:** Ahmed via GitHub account `aboayman-oss` for this non-critical CI implementation review

**Started/finished (UTC):** 2026-08-26 / IN PROGRESS

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Pull-request application gate | Fresh GitHub runner passes the complete zero-paid application gate | CI run `33020995316` (`CI #5`) passed; application 1m 9s | PASS | GitHub Actions run `33020995316` |
| Private-repository dependency gate | No paid GitHub Code Security requirement; reject known high/critical production vulnerabilities | Pinned `pnpm audit --audit-level high --prod` passed in 9s | PASS | GitHub Actions run `33020995316`, job `98351041153` |
| Human review | One human approval for this ordinary CI implementation | `aboayman-oss` approved PR #2 at head `a1c7edb3269a594758f6879616fe9502c98a8c67` | PASS | PR #2 review `5035718410` |
| Merge to `main` | Reviewed green commit merged by repository owner | PR #2 merged as `06b6a76f2a4f3c9ea402ea0564616cdb35a93501` | PASS | PR #2 and `origin/main` |
| Main application gate | Fresh runner passes before credentials are released | CI run `33021371273` (`CI #6`) application passed in 1m 9s; local report artifact produced | PASS | Job `98352279615`; artifact `9626663618`, digest `sha256:ba69e50f339bad9c751fbb551ad6f6191dfad9bdc349483622e50c68511f2b1b` |
| Protected hosted database/Auth gate | Approved reviewer releases the `ci` job, which validates the approved target, resets only isolated synthetic CI data, runs migrations/types/security/Auth, and uploads sanitized reports | Job `98352561534` is waiting for the `ci` environment approval | PENDING | GitHub Actions run `33021371273` |
| `main` protection | Require PR review plus successful `application` and `dependency-audit` checks | Not configured yet | PENDING | Repository rules/branch settings |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-26 | `corepack pnpm audit --audit-level high --prod` | 0 | `No known vulnerabilities found` |
| 2026-08-26 | focused `tests/unit/ci-workflow-policy.test.ts` red/green regression | 0 after intended red | 12/12 policy tests passed |
| 2026-08-26 | `corepack pnpm verify` | 0 | 214 unit tests plus integration, security, evaluation, load, Chromium smoke, production build, workflow audit, repository scan, and client-artifact scan passed |
| 2026-08-26 | GitHub CI #5, PR head `a1c7edb` | 0 | Two successful checks, one intentionally skipped hosted job, sanitized artifact uploaded |
| 2026-08-26 | GitHub CI #6 application, merge `06b6a76` | 0 | Application passed; hosted job waiting for protected environment approval |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Fresh runner lacks an enabled Corepack shim | Policy and implementation must fail until the pinned package manager is activated | Earlier run failed with `pnpm: not found`; both execution jobs now run `corepack enable`, and subsequent application jobs pass | PASS | CI #2, then CI #5/#6 |
| GitHub dependency-review action on a private repository without paid Code Security | The gate must not require an unavailable paid feature | Earlier PR runs failed as unsupported; replaced with pinned zero-cost pnpm production audit and policy regression | PASS | CI #3/#4, then CI #5 |
| Hosted job on pull-request code | Credentials and reset capability must remain unavailable | `hosted-ci` skipped on PR and becomes eligible only after the reviewed merge to `main` | PASS | CI #5 and workflow policy tests |
| Hosted job before human environment approval | Secrets and reset must remain unavailable | CI #6 is waiting at the protected `ci` environment | PASS | Job `98352561534` |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T08-D1 | Gate | CI #6 hosted job is waiting for explicit destructive-reset approval | Ahmed / Codex `/root` | Before continuing WP01-T09 | WP01-T08 PASS and WP01-T09 |
| WP01-T08-D2 | Gate | `main` protection/rules still need required review and the final successful check names | Codex `/root` | After hosted CI proof | WP01-T08 PASS |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Credential-free and credentialed scopes are separated; the hosted job is restricted to reviewed `main` code and protected environment secrets.
- [x] Pull-request and main application logs plus artifact names/digests were inspected.
- [ ] Hosted database/Auth/security logs and hosted artifact remain to be inspected after approval.

## Rollback/disable procedure

Cancel CI run `33021371273` before approval to prevent any hosted mutation. After approval, disable the workflow or revert merge commit `06b6a76f2a4f3c9ea402ea0564616cdb35a93501` through a reviewed PR. Preserve the `ci` environment protection and secrets while investigating; do not redirect the workflow to development, preview, or beta.

## Resume point after a session or usage-limit interruption

1. Read this report and `planning/tasks/wp01-t08-create-ci.md`.
2. Confirm GitHub Actions run `33021371273` is still waiting on hosted job `98352561534` for environment `ci`.
3. Immediately before approval, obtain explicit confirmation that the job may reset the isolated synthetic `ci` Supabase database identified by the committed fingerprint `sha256:6ad364ad022a`. Never approve a different target.
4. Switch GitHub to `aboayman-oss`, open the pending deployment review, verify only environment `ci` is selected, and approve. `unimind989-sys` triggered the run, so the configured prevent-self-review rule should allow `aboayman-oss`.
5. Monitor the hosted job through approved-target validation, dry run, reset, migrations, type generation/diff, hosted Auth integration, security tests, and sanitized artifact upload. Record exact results and artifact digest here.
6. If any target/fingerprint/secret-scope check fails, do not retry blindly; preserve the log reference and diagnose before another reset.
7. Configure `main` protection to require a pull request, one human approval, and successful `application` plus `dependency-audit` checks. Preserve the separate-person rule for later RLS, deletion, rights, budget, release/unlock, and beta gates.
8. Update the WP01-T08 task record and runbook checklist, finish this report as PASS or FAIL, commit, push a reviewable evidence branch, and obtain review before starting WP01-T09.

## Decision

IN PROGRESS. The PR and merged application/dependency gates are green and reviewed. WP01-T08 cannot pass until the protected hosted job succeeds, its sanitized output is inspected, and `main` protection is verified.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | IN PROGRESS | 2026-08-27 |
| Ahmed (`aboayman-oss`) | Reviewer | PR implementation approved; final gate decision pending hosted proof | 2026-08-27 |
