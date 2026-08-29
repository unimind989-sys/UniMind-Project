# Gate report: WP01-T09 local health and deployment-smoke slice

**Status:** CONDITIONAL PASS

**Environment:** local synthetic

**Commit SHA:** `a7c9d6be5d925cd4d2f6feb2a6cdecbbb428a546`

**Release/config fingerprint:** `NEXT_PUBLIC_RELEASE_ID=wp01-t09-local-smoke`; mock provider mode; zero approved provider budget; synthetic placeholder services only

**Migrations:** None

**Dataset/fixture versions:** Foundation synthetic fixtures; no hosted or private data

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed — ordinary checkpoint pending; paid provisioning remains separately unapproved

**Started/finished (UTC):** 2026-08-27 / 2026-08-27T17:46:20Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Process liveness | Respond without Auth/database/provider dependency | `/api/health/live` bypasses the Auth proxy and returns only `{"status":"live"}` | PASS | Unit matcher test, Playwright public-seam test, local smoke |
| Configuration readiness | Fail closed with no variable names, values, or topology | Valid synthetic configuration returned `ready`; injected failure returned only `not_ready` with HTTP 503 | PASS | `tests/unit/runtime-health.test.ts`, Playwright |
| Probe transport safety | No caching; writes forbidden | Both routes returned `no-store`; POST returned 405 | PASS | Playwright and local smoke |
| Preview smoke guard | Only approved remote HTTPS Preview or loopback local target; mock/synthetic output required | Unsafe URLs and real-mode content rejected; local six-check smoke passed | PASS | `tests/unit/deployment-smoke.test.ts`, local smoke command |
| Promotion and rollback contract | Exact tested commit, environment-scoped configuration, locked Beta, forward-only recovery | Provider-neutral procedure committed | PASS (documentation) | `docs/runbooks/environment-promotion.md` |
| External environment isolation | Separate provisioned Preview/Beta projects and external runtime proof | Not executed; `$55/month` base proposal remains unapproved | PENDING / BLOCKING | `planning/environment-matrix.md` |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | ---: | --- |
| 2026-08-27 | Focused runtime-health/Auth-proxy/deployment-smoke unit tests | 0 | 3 files, 9 tests passed |
| 2026-08-27 | `corepack pnpm test:e2e` | 0 | 2 Chromium tests passed |
| 2026-08-27 | `corepack pnpm smoke:deployment -- --base-url http://127.0.0.1:3101 --target local` | 0 | 6 checks passed against an explicitly synthetic process |
| 2026-08-27 | `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | 0 | 117 names, 32 local links, 22 decisions, 102 task contracts |
| 2026-08-27 | `corepack pnpm verify` | 0 | Format/lint/types/boundaries/CI policy; 617-file secret scan; 221 unit tests; integration/security/evaluation/load; 2 E2E; production build; client-artifact scan |
| 2026-08-27 | `git diff --check` and staged diff review | 0 | No whitespace errors; 19-file candidate reviewed |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Auth outage affects liveness | Health paths do not enter Auth proxy | Matcher excludes both health paths; dashboard remains matched | PASS | `tests/unit/auth-session-proxy.test.ts` |
| Invalid server configuration | Readiness returns generic failure only | `not_ready`, HTTP 503; injected private detail absent | PASS | `tests/unit/runtime-health.test.ts` |
| Health write attempt | Unsupported method denied | POST returned 405 for both routes | PASS | Playwright/local smoke |
| Preview over HTTP or local host | Command rejects target before request | `PREVIEW_TARGET_REQUIRES_REMOTE_HTTPS` | PASS | `tests/unit/deployment-smoke.test.ts` |
| URL contains path/query/credentials | Command rejects target before request | `UNSAFE_BASE_URL` | PASS | Unit test covers path/query; parser applies the same credential guard |
| Preview renders real-provider mode | Smoke fails without printing page body | `NON_SYNTHETIC_RUNTIME` | PASS | `tests/unit/deployment-smoke.test.ts` |
| Unsafe promotion carries Preview configuration into Beta | Do not promote that artifact; deploy the same reviewed commit under Beta scope | Procedure recorded; external rehearsal pending | CONDITIONAL | `docs/runbooks/environment-promotion.md` |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T09-LOCAL-01 | Resolved | First local CLI invocation rejected pnpm's conventional `--` separator. Parser support and a regression test were added; the exact command then passed. | Codex `/root` | Resolved in candidate | None |
| WP01-T09-EXT-01 | Blocking | Two additional active Supabase projects and a commercial deployment plan exceed the current approved zero-cost envelope. The bounded proposal is `$55/month` base before tax with no overage. | Ahmed / named budget checkpoint | Before provisioning | External Preview/Beta proof and WP01-T09 PASS |
| WP01-T09-EXT-02 | Blocking | Login/role routes do not yet exist, so the post-deploy smoke currently proves health, write denial, application identity, and mock mode but not login plus role authorization. | WP01-T09/WP02 executor | Before full environment gate | Complete external smoke claim |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Health writes, unsafe target scopes, invalid readiness, and real-mode Preview output were denied.
- [x] Logs, browser output, repository files, and built client artifacts were scanned; no secret value or topology detail was accepted into health responses.

## Rollback/disable procedure

Before merge, revert candidate `a7c9d6b`. After deployment, keep Beta locked, repoint the web target to the recorded prior known-good exact deployment, and use only forward database repair migrations. Never recover by pointing Preview at Beta or copying Preview data/configuration into Beta.

## Decision

CONDITIONAL PASS for the local WP01-T09 slice only. The candidate proves minimal redacted health routes, Auth independence, guarded local/Preview smoke behavior, and a safe promotion/rollback contract. It does not prove external Preview/Beta isolation and does not authorize the `$55/month` proposal, a trial, a payment method, provisioning, deployment, real data, or Beta release.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | Local slice CONDITIONAL PASS; external gate remains blocked | 2026-08-27 |
| Ahmed | Human checkpoint | Pending | Pending |
