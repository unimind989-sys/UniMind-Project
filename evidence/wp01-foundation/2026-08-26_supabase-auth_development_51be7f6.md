# Gate report: WP01-T05 safe Supabase clients and Auth refresh

**Status:** PASS — INDEPENDENT REVIEW APPROVED

**Environment:** Windows, project-managed Node 24.19.0 with system CA enabled for the hosted child, Next.js 16.3.1, synthetic local configuration, guarded hosted development

**Commit SHA:** `51be7f659bf4afc859dc5177179a7ec738454b91`

**Release/config fingerprint:** `next=16.3.1; supabase-ssr=0.12.4; supabase-js=2.112.3; proxy=nodejs; auth-verification=getClaims; management-key-lookup=cli+https-fallback; target-guard=confirmation+sha256-prefix; curl-default-config=disabled; node-ca=system; service-role-canary=v1`

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql`

**Dataset/fixture versions:** One random synthetic Auth user ending in `@auth-fixture.unimind.invalid` was created and marker-protected deletion completed; no hosted fixture remains. Build and negative fixtures are synthetic only.

**Executor:** Codex `/root`

**Independent reviewer:** Ahmed

**Started/finished (UTC):** 2026-08-25 / 2026-08-26

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Public and request-scoped clients | Browser uses publishable configuration only; server client uses the current cookie API per request | Factories, boundaries, and tests pass | EXECUTOR PASS | `browser.ts`, `server.ts`, client tests |
| Privileged boundary | Raw service-role client is not exported; only narrow synthetic fixture operations are available | Marker/domain checks and hosted create/delete pass | EXECUTOR PASS | `admin.ts`, admin and hosted tests |
| Verified authorization identity | Trust only verified token subject; reject forged/unverifiable state and editable role/cohort input | `getClaims()` verifies the hosted user; forged state returns no identity | EXECUTOR PASS | Auth forgery and hosted tests |
| Request refresh | Refresh request/response cookies and preserve Supabase cache headers | Local tests and the real hosted `refreshSupabaseSession()` path pass with refreshed request/response cookies and private/no-store headers | EXECUTOR PASS | Proxy/session and hosted tests |
| Client artifact isolation | No service-role value or canary in browser/static or serialized App Router output | Scanner negative tests and safe production scan pass | EXECUTOR PASS | Artifact scanner tests and build output |
| Hosted Auth lifecycle | Create synthetic user, sign in, refresh through the proxy, verify, reject tamper, then delete fixture | Confirmation- and fingerprint-guarded hosted development test passed 1/1; cleanup completed | EXECUTOR PASS | Hosted integration output |
| Independent security review | A reviewer other than the executor reproduces sensitive evidence | Ahmed approved the commit-specific sensitive-gate reproduction for candidate `51be7f6` | PASS | Task record and decision below |

## Commands executed

| UTC date | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-25 | Initial focused Supabase admin/proxy/forgery Vitest | 0 | 3 files and 9 tests passed. |
| 2026-08-26 | Management parser focused Vitest | 0 | 1 file and 8 tests passed, including malformed JSON non-disclosure. |
| 2026-08-26 | Admin focused Vitest | 0 | 1 file and 5 tests passed, including bounded provider status diagnostics. |
| 2026-08-26 | `corepack pnpm verify` | 0 | Formatting, ESLint, strict TypeScript, module boundaries, 13 files/193 unit tests, production build, and client-artifact scan passed. |
| 2026-08-26 | Full security Vitest | 0 | 1 file and 3 tests passed. |
| 2026-08-26 | Default integration Vitest | 0 | Hosted-only file/test skipped because the explicit hosted gate was absent. |
| 2026-08-26 | Focused target/curl/server-client regressions | 0 | Approved-fingerprint rejection, curl `-q`/stdin isolation, unsafe input rejection, Auth response-header propagation, and fail-closed missing-sink cases passed. |
| 2026-08-26 | Node TLS probe | 0 | Reported `UNABLE_TO_VERIFY_LEAF_SIGNATURE` without URL, message, or credential output; resolved with Node system CA support. |
| 2026-08-26 | Guarded hosted Auth lifecycle at candidate `51be7f6` | 0 | 1 file/1 test passed: approved fingerprint, create, sign-in, verified identity, real proxy near-expiry refresh, request/response cookie update, private/no-store headers, forged-cookie denial, and cleanup. Expected decode warnings came only from the deliberately corrupted cookie. |
| 2026-08-26 | Synthetic safe-environment production build | 0 | Next.js 16.3.1 build passed; Proxy was emitted and client artifact secret scan passed. |
| 2026-08-26 | Agent readiness | 0 | 95 names, 31 local links, 21 synchronized decisions, and 102 task contracts passed. |
| 2026-08-26 | Isolated agent handoff rehearsal | 0 | Clean committed snapshot, WP01-T05 recommendation, 12 durable active records, and readiness passed. |
| 2026-08-25/26 | Initial hosted attempts | 1 | CLI transport and Node CA trust stopped execution before creation or exposed only sanitized code/status; no user was created during failed attempts. |
| 2026-08-26 | Literal package-manager wrapper retry | 0 | `corepack pnpm verify` ran successfully with the repository-pinned pnpm and project-managed Node runtime. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Unverifiable or tampered Auth cookie | No authenticated identity | Local and hosted `getClaims()` paths returned no identity | EXECUTOR PASS | Auth forgery, proxy, and hosted tests |
| Client-supplied role/cohort metadata | Never become authorization proof | Verified identity exposes only validated `sub` as `userId` | EXECUTOR PASS | Auth forgery tests |
| Non-synthetic admin user request | Reject before privileged call | Invalid domain/marker input is rejected | EXECUTOR PASS | Admin tests |
| Service-role canary in client artifact | Build gate fails without printing the value | Scanner reports label and file only | EXECUTOR PASS | Artifact scanner tests |
| Hosted fixture cleanup | Delete only marker-protected synthetic user in `afterAll` | Hosted test passed and cleanup completed | EXECUTOR PASS | Hosted integration test |
| CLI transport unavailable | Use a non-disclosing HTTPS fallback without a token in process arguments | Curl config was passed through stdin; response parsed by a non-disclosing seam | EXECUTOR PASS | Runner and parser tests |
| Ambient curl configuration | Default `.curlrc` cannot alter token-bearing fallback behavior | Curl receives `-q`/`--disable` as its first argument; regression test locks argv and stdin separation | EXECUTOR PASS | Management API tests |
| Wrong hosted project reference | Reject a profile not matching the approved development fingerprint | Runner requires the exact confirmation and recorded SHA-256 prefix before any key lookup or Auth mutation | EXECUTOR PASS | Target guard tests and hosted pass |
| Intercepting CA on workstation | Preserve TLS validation | Hosted child used `--use-system-ca`; TLS verification was never disabled | EXECUTOR PASS | Node probe and hosted pass |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T05-NET-01 | Resolved | Supabase CLI transport failed and Node reported an untrusted leaf signature. The runner now falls back to Management HTTPS with the access token in stdin and runs the hosted child with the Windows system CA. The final lifecycle passed and cleanup completed; TLS validation stayed enabled. | Resolved in task | Resolved 2026-08-26 | None |
| WP01-T05-TOOL-01 | Resolved | The earlier wrapper attempt could not start; the candidate review reran the literal `corepack pnpm verify` command successfully without dependency changes. | Resolved in review | Resolved 2026-08-26 | None |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden identity/admin/artifact cases were tested with synthetic values.
- [x] Local and hosted output was inspected; credential-shaped matches were synthetic database URLs only.
- [x] The Management access token is supplied to the HTTPS fallback through stdin, never a command argument or report.
- [x] Curl default configuration is disabled before the token-bearing stdin configuration is parsed.
- [x] The hosted runner verifies the target-specific confirmation and recorded development-project fingerprint before external access.
- [x] TLS verification remains enabled; Node uses the workstation system CA.
- [x] Hosted synthetic create/sign-in/refresh/forgery/cleanup passed and no fixture remains.
- [x] Ahmed independently reviewed the candidate and commit-specific reproduction evidence and approved WP01-T05 on 2026-08-26.

## Rollback/disable procedure

Revert candidate hardening commit `51be7f659bf4afc859dc5177179a7ec738454b91`, then revert initial implementation commit `40214e485a9057ab838618c415ae06baa7dd436b`, and restore the prior task/runbook records. Removing `src/proxy.ts` disables automatic request refresh; removing the Supabase/Auth modules and package script restores the previous foundation. Hosted synthetic users created by both executor runs were marker-protected and deleted; no migration, deployment, hosted user, or other external state remains to roll back.

## Decision

The executor passes candidate `51be7f6`: 193 unit tests, 3 security tests, the approved-target real-proxy hosted lifecycle, forged-state denial, cleanup, static checks, production build, and client-artifact isolation pass. Ahmed independently reviewed the candidate and commit-specific evidence and approved WP01-T05 on 2026-08-26.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | PASS — INDEPENDENT REVIEW REQUIRED | 2026-08-26 |
| Ahmed | Independent reviewer | PASS | 2026-08-26 |
