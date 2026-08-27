# Gate report: WP01-T08 clean-database CI

**Status:** PASS

**Environment:** GitHub Actions plus protected isolated `ci` Supabase target

**Commit SHA:** `ee18f702e99131f5307de50bdbf9a799b2d92120`

**Release/config fingerprint:** committed CI target fingerprint `sha256:6ad364ad022a`; GitHub environment `ci`; deployment branch restricted to `main`

**Migrations:** committed `supabase/migrations/` sequence at the commit above; corrected hosted run reset, applied, seeded, and matched migration `20260824235549`

**Dataset/fixture versions:** repository synthetic CI seed and versioned synthetic evaluation/load fixtures at the commit above

**Executor:** Codex `/root`

**Human reviewer:** Ahmed through GitHub account `unimind989-sys`; PR #3 approval review `5037570445`

**Started/finished (UTC):** 2026-08-26 / 2026-08-27

## Governing-span revision

The revision covered the repository authorities and committed evidence from the runbook start through WP01-T08, not only the corrective diff.

| Span | Revision result | Status |
| --- | --- | --- |
| WP00 decisions and readiness | Reviewed artifacts remain truthful: unresolved product, academic, rights, privacy, and provider decisions remain blocked or mock-only; WP00-T08 remains the reviewed mock-only bridge. No blocked decision was silently treated as approved. | PASS |
| WP01-T01 through WP01-T07 | Each task has reviewed PASS evidence. Repository/runtime pinning, strict TypeScript/Next.js foundation, boundary enforcement, hosted Supabase migration seam, safe Auth clients, provider contracts/mocks, and the layered test gate remain consistent. | PASS |
| WP01-T08 ordering | Dependencies WP01-T04 through WP01-T07 were reviewed before the external CI gate. No WP01-T09 implementation was started. | PASS |
| Repository hygiene and disclosure | Full changed-file review, `git diff --check`, repository secret scan, client-artifact scan, and branch inventory found no secret disclosure or unrelated scope. | PASS |

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Pull-request application gate | Fresh GitHub runner passes the complete zero-paid application gate | Corrective PR run `33042421895` passed; application and dependency gates were required before merge | PASS | GitHub CI #7, PR #3 |
| Private-repository dependency gate | No paid GitHub Code Security requirement; reject known high/critical production vulnerabilities | Pinned `corepack pnpm audit --audit-level high --prod` passed | PASS | GitHub CI #7, `dependency-audit` |
| Human review | One human approval for this ordinary CI implementation | `unimind989-sys` approved PR #3 at head `911e8a7` after reviewing the exact hosted type correction and bounded timeout fixes | PASS | PR #3 review `5037570445` |
| Merge to `main` | Reviewed green commit merged by repository owner | PR #3 merged as `ee18f702e99131f5307de50bdbf9a799b2d92120` | PASS | PR #3 and `origin/main` |
| Main application gate | Fresh runner passes before credentials are released | Run `33043240893` application passed in 1m 17s and uploaded local report artifact `9634668004` | PASS | Job `98421346149`; digest `sha256:1f6a75259746ff302e174c3d21e1f2b1951938d1426f2573d8c71318364f32d4` |
| Protected hosted database/Auth gate | Approved reviewer releases only the isolated `ci` job; target guard, dry run, reset, migrations, types, hosted Auth, security, and sanitized report all pass | Run `33043240893` completed successfully. Hosted job passed in 33s after approval by `aboayman-oss`; the guarded database/Auth step passed in 21s, security in 1s, and artifact upload in 1s | PASS | Job `98421571535`; hosted artifact `9634839025`; digest `sha256:f81f692ed45bc15746020694d2b2e7adf03d92becb1df5a6f0327eb3ac599598` |
| `main` protection | Require a pull request, one human approval, and successful `application` plus `dependency-audit`; prevent force pushes and deletion | Classic branch protection applies to `main` and was behaviorally verified on PR #3: merge remained blocked until approval and both required checks passed | PASS | Repository Settings → Branches; PR #3 |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-26 | `corepack pnpm audit --audit-level high --prod` | 0 | `No known vulnerabilities found` |
| 2026-08-26 | focused `tests/unit/ci-workflow-policy.test.ts` red/green regression | 0 after intended red | 12/12 policy tests passed |
| 2026-08-26 | `corepack pnpm verify` | 0 | 214 unit tests plus integration, security, evaluation, load, Chromium smoke, production build, workflow audit, repository scan, and client-artifact scan passed |
| 2026-08-26 | GitHub CI #5, PR head `a1c7edb` | 0 | Two successful checks, one intentionally skipped hosted job, sanitized artifact uploaded |
| 2026-08-26 | GitHub CI #6 application, merge `06b6a76` | 0 | Application passed; hosted job waiting for protected environment approval |
| 2026-08-27 | GitHub CI #6 hosted attempt 1, job `98352561534` | 1 | Approved CI reset, migration, seed, history, and type generation passed; `db:types:check` rejected PostgREST `14.15` to `14.17` drift before hosted Auth/security |
| 2026-08-27 | Exact-runtime `corepack pnpm install --frozen-lockfile` | 0 | Node 24.19.0 and pnpm 10.34.5 reproduced the immutable install |
| 2026-08-27 | Final-candidate `corepack pnpm verify` | 0 | Format, lint, typecheck, boundaries/workflow policy, 606-file secret scan, 214 unit tests, local integration, 8 security, 3 evaluation, 5 load-profile, Chromium E2E, Next.js production build, and client-artifact scan passed |
| 2026-08-27 | `corepack pnpm db:types:check` | 0 | Generated database types match the hosted PostgREST 14.17 output |
| 2026-08-27 | Agent readiness and isolated handoff rehearsal | 0 | 113 task names, 31 links, 21 decisions, and 102 task contracts passed; clean-clone handoff rehearsal passed |
| 2026-08-27 | GitHub CI #7, corrective PR head `911e8a7` | 0 | Required `application` and `dependency-audit` checks passed; hosted credentials remained unavailable on PR code |
| 2026-08-27 | GitHub CI #8, merge `ee18f70` | 0 | Application passed; protected hosted database/Auth and security job passed after environment approval; both sanitized artifacts uploaded |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Fresh runner lacks an enabled Corepack shim | Policy and implementation must fail until the pinned package manager is activated | Earlier run failed with `pnpm: not found`; both execution jobs now run `corepack enable`, and subsequent application jobs pass | PASS | CI #2, then CI #5/#6 |
| GitHub dependency-review action on a private repository without paid Code Security | The gate must not require an unavailable paid feature | Earlier PR runs failed as unsupported; replaced with pinned zero-cost pnpm production audit and policy regression | PASS | CI #3/#4, then CI #5 |
| Hosted job on pull-request code | Credentials and reset capability must remain unavailable | `hosted-ci` skipped on PR and becomes eligible only after the reviewed merge to `main` | PASS | CI #5 and workflow policy tests |
| Hosted job before human environment approval | Secrets and reset must remain unavailable | CI #6 remained blocked until `aboayman-oss` approved environment `ci` | PASS | Job `98352561534` deployment review |
| Hosted PostgREST version changes after provider maintenance | Generated type drift must fail closed before later hosted checks | Attempt 1 stopped at `db:types:check`; the exact one-line change was reviewed, and attempt 2 passed types, hosted Auth, security, and artifact upload | PASS | Jobs `98352561534` and `98421571535` |
| Cold filesystem/runtime variance | Preserve bounded tests without hiding hangs | Unit cold-import timeout is 5s; Playwright assertions remain 15s while web-server startup is 120s; repeated regressions and full verification passed | PASS | PR #3 diff and local verification |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T08-D1 | Closed | Hosted PostgREST drift was reconciled exactly in `src/types/database.generated.ts`; the corrected protected run passed the full hosted gate | Ahmed / Codex `/root` | 2026-08-27 | NONE |
| WP01-T08-D2 | Closed | `main` protection now requires PR review plus `application` and `dependency-audit`, with force pushes and deletion disabled | Codex `/root` | 2026-08-27 | NONE |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Credential-free and credentialed scopes are separated; the hosted job is restricted to reviewed `main` code and protected environment secrets.
- [x] Pull-request and main application logs plus artifact names/digests were inspected.
- [x] Corrected hosted logs were inspected through target validation, dry run, reset, migration/seed/parity, stable generated types, hosted Auth integration, implemented security project, and sanitized artifact upload.
- [x] Branch protection behavior was verified using a real PR: approval and both required checks were necessary before merge.

## Rollback/disable procedure

Cancel a future main run before environment approval to prevent a hosted mutation. To disable new runs, disable or revert `.github/workflows/ci.yml` through a reviewed PR. Preserve the `ci` environment protection and its environment-scoped secrets while investigating; never redirect this workflow to development, preview, or beta. Revert an application change through a new protected PR rather than rewriting `main`.

## Decision

PASS. A fresh GitHub runner reproduced the zero-paid application gate and, after explicit protected-environment approval, reset only the fingerprinted isolated synthetic `ci` target and completed migrations, stable type generation, hosted Auth integration, implemented security tests, and sanitized report upload. `main` now requires a pull request, one human approval, and both required checks. WP01-T08 is complete. WP01-T09 remains intentionally unstarted for Ziad.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | PASS | 2026-08-27 |
| Ahmed (`unimind989-sys`) | Human reviewer | PASS via implementation PR #3 approval. Completion evidence PR #4 passed three checks and used the permitted owner bypass after GitHub rejected repeated additional-approval submissions. | 2026-08-27 |
