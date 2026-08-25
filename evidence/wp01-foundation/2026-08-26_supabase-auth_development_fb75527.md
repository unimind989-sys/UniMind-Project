# Gate report: WP01-T05 safe Supabase clients and Auth refresh

**Status:** IN PROGRESS — EXECUTOR PASS; INDEPENDENT REVIEW PENDING

**Environment:** Windows, project-managed Node 24.19.0 with system CA enabled for the hosted child, Next.js 16.3.1, synthetic local configuration, guarded hosted development

**Commit SHA:** `fb75527b35ca5054592c9d876ead9a6a48ae0604` is the base SHA; this report and implementation are uncommitted and must be rebound to the final candidate SHA

**Release/config fingerprint:** `next=16.3.1; supabase-ssr=0.12.4; supabase-js=2.112.3; proxy=nodejs; auth-verification=getClaims; management-key-lookup=cli+https-fallback; node-ca=system; service-role-canary=v1`

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql`

**Dataset/fixture versions:** One random synthetic Auth user ending in `@auth-fixture.unimind.invalid` was created and marker-protected deletion completed; no hosted fixture remains. Build and negative fixtures are synthetic only.

**Executor:** Codex `/root`

**Independent reviewer:** UNASSIGNED — REVIEW GATE BLOCKED

**Started/finished (UTC):** 2026-08-25 / IN PROGRESS — independent review pending

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Public and request-scoped clients | Browser uses publishable configuration only; server client uses the current cookie API per request | Factories, boundaries, and tests pass | EXECUTOR PASS | `browser.ts`, `server.ts`, client tests |
| Privileged boundary | Raw service-role client is not exported; only narrow synthetic fixture operations are available | Marker/domain checks and hosted create/delete pass | EXECUTOR PASS | `admin.ts`, admin and hosted tests |
| Verified authorization identity | Trust only verified token subject; reject forged/unverifiable state and editable role/cohort input | `getClaims()` verifies the hosted user; forged state returns no identity | EXECUTOR PASS | Auth forgery and hosted tests |
| Request refresh | Refresh request/response cookies and preserve Supabase cache headers | Local cookie/header tests and hosted refresh pass | EXECUTOR PASS | Proxy/session and hosted tests |
| Client artifact isolation | No service-role value or canary in browser/static or serialized App Router output | Scanner negative tests and safe production scan pass | EXECUTOR PASS | Artifact scanner tests and build output |
| Hosted Auth lifecycle | Create synthetic user, sign in, refresh, verify, reject tamper, then delete fixture | Guarded hosted development test passed 1/1; cleanup completed | EXECUTOR PASS | Hosted integration output |
| Independent security review | A reviewer other than the executor reproduces sensitive evidence | Reviewer unassigned | PENDING | Task record |

## Commands executed

| UTC date | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-25 | Initial focused Supabase admin/proxy/forgery Vitest | 0 | 3 files and 9 tests passed. |
| 2026-08-26 | Management parser focused Vitest | 0 | 1 file and 8 tests passed, including malformed JSON non-disclosure. |
| 2026-08-26 | Admin focused Vitest | 0 | 1 file and 5 tests passed, including bounded provider status diagnostics. |
| 2026-08-26 | Full unit Vitest | 0 | 13 files and 185 tests passed. |
| 2026-08-26 | Full security Vitest | 0 | 1 file and 3 tests passed. |
| 2026-08-26 | Default integration Vitest | 0 | Hosted-only file/test skipped because the explicit hosted gate was absent. |
| 2026-08-26 | Prettier, ESLint, strict TypeScript, module boundaries | 0 | All local static gates passed using installed local binaries. |
| 2026-08-26 | Node TLS probe | 0 | Reported `UNABLE_TO_VERIFY_LEAF_SIGNATURE` without URL, message, or credential output; resolved with Node system CA support. |
| 2026-08-26 | Guarded hosted Auth lifecycle | 0 | 1 file/1 test passed: create, sign-in, verified identity, refresh, forged-cookie denial, and cleanup. Expected decode warnings came only from the deliberately corrupted cookie. |
| 2026-08-26 | Synthetic safe-environment production build | 0 | Next.js 16.3.1 build passed; Proxy was emitted and client artifact secret scan passed. |
| 2026-08-26 | Agent readiness | 0 | 95 names, 31 local links, 21 synchronized decisions, and 102 task contracts passed. |
| 2026-08-26 | Isolated agent handoff rehearsal | 0 | Clean committed snapshot, WP01-T05 recommendation, 12 durable active records, and readiness passed. |
| 2026-08-25/26 | Initial hosted attempts | 1 | CLI transport and Node CA trust stopped execution before creation or exposed only sanitized code/status; no user was created during failed attempts. |
| 2026-08-25 | Literal package-manager wrapper | NOT STARTED | Corepack was absent; bundled pnpm declined a non-TTY dependency reinstall. Exact installed tools ran directly and dependencies were unchanged. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Unverifiable or tampered Auth cookie | No authenticated identity | Local and hosted `getClaims()` paths returned no identity | EXECUTOR PASS | Auth forgery, proxy, and hosted tests |
| Client-supplied role/cohort metadata | Never become authorization proof | Verified identity exposes only validated `sub` as `userId` | EXECUTOR PASS | Auth forgery tests |
| Non-synthetic admin user request | Reject before privileged call | Invalid domain/marker input is rejected | EXECUTOR PASS | Admin tests |
| Service-role canary in client artifact | Build gate fails without printing the value | Scanner reports label and file only | EXECUTOR PASS | Artifact scanner tests |
| Hosted fixture cleanup | Delete only marker-protected synthetic user in `afterAll` | Hosted test passed and cleanup completed | EXECUTOR PASS | Hosted integration test |
| CLI transport unavailable | Use a non-disclosing HTTPS fallback without a token in process arguments | Curl config was passed through stdin; response parsed by a non-disclosing seam | EXECUTOR PASS | Runner and parser tests |
| Intercepting CA on workstation | Preserve TLS validation | Hosted child used `--use-system-ca`; TLS verification was never disabled | EXECUTOR PASS | Node probe and hosted pass |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T05-NET-01 | Resolved | Supabase CLI transport failed and Node reported an untrusted leaf signature. The runner now falls back to Management HTTPS with the access token in stdin and runs the hosted child with the Windows system CA. The final lifecycle passed and cleanup completed; TLS validation stayed enabled. | Resolved in task | Resolved 2026-08-26 | None |
| WP01-T05-TOOL-01 | Informational | Corepack is absent and the bundled pnpm wrapper refuses an automatic non-TTY reinstall. Exact installed binaries were used; the lock and dependencies were not changed. | Workstation tooling owner | Before clean-clone rehearsal | Literal `pnpm verify` reproduction only |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden identity/admin/artifact cases were tested with synthetic values.
- [x] Local and hosted output was inspected; credential-shaped matches were synthetic database URLs only.
- [x] The Management access token is supplied to the HTTPS fallback through stdin, never a command argument or report.
- [x] TLS verification remains enabled; Node uses the workstation system CA.
- [x] Hosted synthetic create/sign-in/refresh/forgery/cleanup passed and no fixture remains.
- [ ] Independent reviewer reproduction remains required.

## Rollback/disable procedure

Revert the uncommitted WP01-T05 candidate files and restore the prior task/runbook records. Removing `src/proxy.ts` disables automatic request refresh; removing the new Supabase/Auth modules and package script restores the previous foundation. One hosted synthetic user was created and marker-protected deletion completed; no migration, deployment, hosted user, or other external state remains to roll back.

## Decision

The executor passes the implementation: 185 unit tests, 3 security tests, the guarded hosted lifecycle, forged-state denial, cleanup, static checks, production build, and client-artifact isolation pass. WP01-T05 remains in progress until the evidence is rebound to the final candidate SHA and an independent security reviewer reproduces and approves the sensitive gates.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | PASS — INDEPENDENT REVIEW REQUIRED | 2026-08-26 |
| UNASSIGNED | Independent reviewer | PENDING | — |
