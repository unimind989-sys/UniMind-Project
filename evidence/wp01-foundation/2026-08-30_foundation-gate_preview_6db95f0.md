# Gate report: WP01-T11 foundation package gate

**Status:** IN PROGRESS

**Environment:** Local clean candidate, disposable GitHub CI, protected synthetic Vercel Preview, and locked empty Beta

**Commit SHA:** Baseline `6db95f0b9ac4734a948b76c32bf1511367b1d883`; final candidate pending

**Release/config fingerprint:** `wp01-t11-foundation-gate`; provider mode `mock`; approved provider budget `0`; Preview protected; Beta locked

**Migrations:** Existing ordered WP01 foundation migrations; exact inventory pending gate run

**Dataset/fixture versions:** Existing committed synthetic foundation fixtures; load profile `unimind-100-student-v1`

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed — ordinary package checkpoint authorized in chat; no protected Beta unlock, release, or go-live action is in scope

**Started/finished (UTC):** 2026-08-30 / in progress

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Upstream readiness | WP01-T01 through WP01-T10 have reviewed PASS evidence | All task records are complete and link evidence | PASS | `planning/tasks/wp01-*.md` |
| Vercel target correctness | Reviewed commits deploy only as protected synthetic Preview until an explicit production promotion | Preview is healthy; merged `main` was incorrectly treated as Production and failed closed on missing Production-scoped variables | FAIL — CORRECTION IN PROGRESS | Vercel browser inspection |
| Clean reproducibility | Frozen clean clone passes the complete credential-free gate with provider endpoints blocked | Pending | PENDING | — |
| Disposable database repeatability | CI resets the disposable Supabase stack twice and generated types remain stable | Pending | PENDING | — |
| Protected Preview | Exact candidate deploys as Preview and passes six protected smoke checks | Pending | PENDING | — |
| Secret hygiene | Repository, build output, logs, and evidence contain no secret patterns | Pending | PENDING | — |
| Compatibility/version review | Supabase breaking changes and exact runtime/framework/database/extension versions are recorded | Pending | PENDING | — |
| Cleanup | Every disposable clone, toolchain, server, and temporary access artifact is removed | Pending | PENDING | — |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-30 | Vercel deployment inventory in signed-in browser | 0 | Preview `0a09653` READY; merged-main Production `6db95f0` ERROR |
| 2026-08-30 | Preview application and runtime-log inspection | 0 | UniMind rendered synthetic/mock-only; recent `GET /` requests returned `200` with no runtime error rows |
| 2026-08-30 | Vercel environment-scope inspection | 0 | Required names exist only in Preview; values were not revealed |
| 2026-08-30 | Vercel Git/environment inspection | 0 | `main` tracks Production and auto-assigns Production domains despite the current Preview-only policy |
| 2026-08-30 | Repository deployment-policy correction | 0 | Added `vercel.json` with `git.deploymentEnabled.main=false` and a unit regression test; verification pending |
| 2026-08-30 | Vercel Production-domain safeguard | 0 | Disabled automatic Production-domain assignment; Vercel confirmed the saved setting and no Production variables or target were added |
| 2026-08-30 | Source-tree `pnpm verify` | 0 | Formatting, lint, typecheck, boundaries, CI policy, secret scan, 232 unit tests, integration/security/evaluation/load layers, two Chromium tests, production build, and client-artifact scan passed |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Missing Production variables | Fail closed without exposing values | Build reported variable names only and exited before deployment | PASS | Vercel deployment `6db95f0` |
| Preview protection | Unauthenticated tooling cannot access protected deployment | Direct smoke failed `REQUEST_FAILED`; signed-in browser access succeeded; no bypass exists | PASS | WP01-T11-PREVIEW-PROTECTION |
| Production shortcut | Do not copy Preview secrets into Production or create a Production alias merely to silence the failure | No variable scope or deployment protection change made during diagnosis | PASS | WP01-T11-NO-PRODUCTION-SHORTCUT |
| Domain auto-assignment | A future explicit Production deployment must not automatically acquire a user-facing domain | Setting saved as Disabled; manual promotion is now required | PASS | Vercel Production environment settings |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T11-VERCEL-TARGET | Gate blocker | Vercel maps `main` to Production although the approved current target is protected Preview only; Production has intentionally no variables, so every merge fails | Codex `/root` | Before package PASS | WP01-T11 and WP02 |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Variable names and scopes were inspected without revealing values.
- [x] Preview remained protected; Beta, Production variables, domains, provider flags, and paid resources were not enabled.

## Rollback/disable procedure

Restore the prior Vercel Production-branch mapping only after an explicit production-promotion gate approves a protected target, required environment scopes, exact candidate, and domain behavior. Until then, retain Preview-only variables and Standard Protection; never point Preview at Beta or copy Beta credentials.

## Decision

Gate remains in progress. Upstream evidence and protected Preview are healthy, but the Vercel Git target mapping must be corrected and fully rehearsed before WP01-T11 can pass.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | IN PROGRESS | 2026-08-30 |
| Ahmed | Human checkpoint | Authorized execution; final decision pending | 2026-08-30 |
