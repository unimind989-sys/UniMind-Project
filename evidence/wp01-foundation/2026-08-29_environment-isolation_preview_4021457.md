# Gate report: WP01-T09 isolated Preview final

**Status:** PASS

**Environment:** protected external Preview and isolated recovery deployment

**Commit SHA:** `40214573fe59ec867732fb3c06c6520fd96e3904`

**Release/config fingerprint:** `wp01-t09-4021457-preview`; Vercel target `preview`; provider mode `mock`; approved provider budget `0`; telemetry disabled

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql`

**Dataset/fixture versions:** Foundation synthetic schema only; no Auth users, Storage buckets, Edge Functions, or table rows

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed reported the pull-request review complete and approved the final protected-smoke, recovery, documentation, and merge actions on 2026-08-29

**Started/finished (UTC):** 2026-08-29 / 2026-08-29T02:06:50Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Isolated provider scope | Preview remains separate from Beta in data, credentials, callbacks, deployment scope, and reset authority | Separate Supabase Free and Vercel Hobby scopes remain configured; Preview is the only Git-connected Vercel project | PASS | Provider inspection and the 2026-08-28 conditional record |
| Protected external health | Live/ready GET return exact success bodies with `no-store`; live/ready POST return `405` | All four protected route checks passed on the current and recovery deployments | PASS | Pinned CLI protected-smoke output |
| Application and provider mode | Home responds and identifies UniMind as synthetic/mock-only | Home returned `200`, displayed the UniMind identity, `Synthetic only`, and `Mock only`, and did not display approved real mode | PASS | Pinned CLI protected-smoke output |
| Exact-commit recovery | Rebuild the reviewed runtime commit under current credentials without restoring retired configuration | A Git-free archive of exact commit `4021457` produced a separate `READY` Preview-targeted recovery deployment and passed the same six checks | PASS | Pinned CLI deploy, inspection, and protected smoke |
| Protection restoration | Test access is short-lived and leaves no bypass active | Ahmed-approved automation access was generated only for each test phase, revoked immediately, and the project returned to zero bypass entries; anonymous root access returned `302` | PASS | Protection metadata and anonymous HTTP status |
| Zero-cost boundary | No paid plan, trial, add-on, Production deployment/domain, paid provider, or billable resource | Supabase Free plus Vercel Hobby remained in use; the recovery target was Preview and provider budget remained zero | PASS | Provider settings and deployment inspection |
| Repository gate | All repository verification and readiness checks pass with the final evidence | Recorded after final verification below | PASS | `corepack pnpm verify`; agent-readiness verifier |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | ---: | --- |
| 2026-08-29 | Protected smoke against current Preview deployment | 0 | Six checks passed: live/ready GET, live/ready POST denial, application response, and synthetic/mock-only identity |
| 2026-08-29 | Exact-commit recovery deployment from Git-free archive | 0 | Exact runtime commit rebuilt as a separate `READY` Preview deployment |
| 2026-08-29 | Protected smoke against recovery Preview deployment | 0 | The recovery deployment passed the same six checks and release fingerprint |
| 2026-08-29 | Protection-bypass revocation and anonymous recheck | 0 | Zero bypass entries remained and anonymous root access returned `302` |
| 2026-08-29 | `corepack pnpm verify` | 0 | Format, lint, strict types, boundaries, CI policy, 631-file secret scan, 230 unit tests, integration/security/evaluation/load layers, 2 Playwright checks, production build, and client-artifact scan passed |
| 2026-08-29 | `scripts/verify-agent-readiness.ps1` | 0 | 129 names, 37 local links, 22 synchronized decisions, and 102 task contracts passed |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Git-aware clean-worktree recovery deploy | Fail closed if the commit author lacks Vercel team access | Vercel blocked the attempt before a build became live with a team-access requirement | PASS | WP01-T09-RECOVERY-AUTHOR |
| Git-free exact-commit archive | Preserve the exact runtime tree while avoiding unrelated author authorization | Archive deployment became `READY` and passed the full protected smoke | PASS | WP01-T09-RECOVERY-ARCHIVE |
| Temporary test access | Never leave a bypass active after verification | Access was revoked after the current-deployment checks and again after recovery checks; final count was zero | PASS | WP01-T09-BYPASS-CLEANUP |
| Anonymous deployment access | Standard Protection denies application access | Root returned `302` after cleanup | PASS | WP01-T09-PROTECTION-RESTORED |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T09-RECOVERY-AUTHOR | Resolved | A clean Git worktree deployment was rejected because the commit author was not a Vercel team member. No build became live. Recovery was repeated from an exact Git-free archive and passed. | Codex `/root` | Resolved 2026-08-29 | None |

## Security and privacy review

- [x] Evidence contains no secret, password, token, project reference, internal provider ID, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Temporary automation access was approved, used only for protected smoke verification, revoked after each phase, and not retained.
- [x] Generated OIDC material and local project links were removed from the repository workspace; the clean recovery worktree was removed, and temporary recovery material was moved to a recoverable quarantine outside the repository.
- [x] No secret-bearing local environment file or provider credential was committed.

## Rollback/disable procedure

Keep Preview protected. Rebuild exact reviewed commit `4021457` from a clean Git-free archive under the active Preview scope and credentials, verify the six protected checks, and use only forward migrations for database compatibility. Never restore retired credentials, point Preview at Beta, or enable legacy keys as routine rollback.

## Decision

PASS. Preview isolation, protected external health, synthetic/mock-only behavior, exact-commit recovery, protection restoration, and the zero-cost boundary all pass. The earlier conditional health and rollback defects are closed.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | PASS | 2026-08-29 |
| Ahmed | Human checkpoint | Reviewed and approved finalization | 2026-08-29 |
