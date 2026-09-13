# Gate report: WP03-T02 auth and consent flows

**Status:** PASS

**Environment:** Local zero-cost verification, GitHub-hosted disposable Supabase/Auth CI, and Vercel Preview with synthetic data and mock providers only

**Commit SHA:** `2777eb21f3fb9944cbdcf6f4aeb1c68fae0aa875`

**Release/config fingerprint:** Vercel preview `dpl_3QkAgZbPHYcYbHCdoSXwzZaEpFUp`; target `preview`; canonical `APP_ORIGIN=https://project-xwrez.vercel.app`; provider mode `mock`; approved provider budget `0`; generation, embedding, and transcription disabled

**Migrations:** `20260913063500_activate_verified_auth_profiles.sql`

**Dataset/fixture versions:** Deterministic synthetic auth-state fixtures; disposable CI seed and Auth stack; public synthetic Access Shelf preview

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed — completed the manual checklist, requested removal of search from access flows, confirmed the correction, and invoked `$finalize`

**Started/finished (UTC):** 2026-09-13 / 2026-09-13T19:54:08Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Complete student access flow | Registration, verification/resend, login, recovery/reset, logout, suspended, rate-limited, expired/replayed-link, and recovery states have safe public seams | Domain/application and route coverage passes; no admin workaround is encoded | PASS | 297 unit tests and 12 Playwright tests in the final local gate |
| Consent gate | Current terms, privacy, and educational-boundary acceptance is required before learning access | Missing or outdated consent resolves to `CONSENT_REQUIRED`; protected learning renders the access gate without a valid READY identity | PASS | `auth-access`, `auth-flow`, security, and rendered preview checks |
| Enumeration and redirect safety | Public failures remain generic and return paths remain internal | Forged return paths, unknown identity state, callback failures, and public error summaries pass | PASS | Unit and security suites; `tests/e2e/auth-flows.spec.ts` |
| Verified-profile activation | Email confirmation activates only the matching PENDING profile | Clean migration reset and pgTAP contract pass in a runner-local disposable stack | PASS | GitHub Actions run `34768159913`, job `database-ci` |
| Localized accessible UI | English and Arabic forms, focus/error behavior, pending states, RTL/mobile layout, and autocomplete behavior pass | English and Arabic routes render; Arabic reports `lang=ar`, `dir=rtl`; document and viewport widths match; no search role exists in the access flow | PASS | Local and Vercel rendered checks; Ahmed manual checklist; fresh Impeccable reviewer `ship` |
| Preview configuration | Exact candidate builds with a canonical server-owned Auth origin | Initial build failed closed when `APP_ORIGIN` was absent; the non-secret Preview/Production binding was added and the exact source rebuilt Ready | PASS | Vercel deployment `dpl_3QkAgZbPHYcYbHCdoSXwzZaEpFUp` |
| Preview health and privacy | Health routes respond, auth routes render, and no client/runtime error or secret signal appears | `/api/health/live` and `/api/health/ready` return healthy JSON; `/login` returns 200 with private/no-store headers; browser console and Vercel error/warning scans are empty | PASS | Authenticated Vercel CLI and in-app browser inspection |
| Required candidate checks | Application, dependency audit, database CI, and Vercel must be green | All four contexts are green for `2777eb2` | PASS | GitHub Actions run `34768159913`; GitHub Vercel status points to `3QkAgZbPHYcYbHCdoSXwzZaEpFUp` |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-09-13 | `corepack pnpm verify` after the Vercel-origin correction | 0 | Formatting, lint, strict typing, boundaries, SQL policy, CI policy, secret scan, 297 unit, 15 mock integration, 22 security, 3 evaluation, 5 load-contract, 12 Playwright, production build, and client-artifact secret checks passed; 2 retired hosted tests skipped by contract. |
| 2026-09-13 | `scripts/verify-agent-readiness.ps1` | 0 | 168 names, 46 local links, 22 synchronized decisions, and 102 task contracts passed. |
| 2026-09-13 | `scripts/test-agent-handoff.ps1` | 0 | Isolated committed-snapshot rehearsal passed with 7 durable active records. |
| 2026-09-13 | GitHub Actions run `34768159913` | 0 | `dependency-audit`, `application`, and `database-ci` passed; the disposable stack and volumes were removed after sanitized reports uploaded. |
| 2026-09-13 | `vercel inspect` for `unimind-preview-a6hnyyksu-unimind2.vercel.app` | 0 | Deployment `dpl_3QkAgZbPHYcYbHCdoSXwzZaEpFUp` is Ready, target Preview, and sourced from `2777eb2`. |
| 2026-09-13 | `vercel curl` for live, ready, and login routes | 0 | Health routes returned `live`/`ready`; login returned 200 with private/no-store and HSTS headers. |
| 2026-09-13 | Vercel Preview English/Arabic rendered inspection | 0 | Correct localized access content, zero search roles, Arabic RTL, zero overflow, and zero browser console errors or warnings. |
| 2026-09-13 | Vercel runtime `error` and `warning` log scans | 0 | No runtime logs found for the exact Ready preview deployment. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Missing Vercel canonical origin | Build must fail closed rather than derive redirects from an untrusted request host | Initial deployments failed with only the invalid variable name `APP_ORIGIN`; no value or secret was disclosed | PASS | `BsqM2y2SzvtqSx1kE48hd1a4icqo`, `2LwhhDTT3zkdzm7ZxkYkrArjXzQu` |
| Corrected deployment binding | A non-secret canonical origin must allow the same source to build without weakening validation | Preview and Production config received the established canonical domain; exact source redeployed Ready | PASS | `dpl_3QkAgZbPHYcYbHCdoSXwzZaEpFUp` |
| Unauthenticated learning access | Shelf content must not render without a READY identity and current consent | `/learn` renders the sign-in access gate; no shelf controls or data are exposed | PASS | Fresh Vercel browser session |
| Forged return path | External or malformed destinations must be replaced by a safe internal destination | Unit, security, and Playwright cases pass | PASS | Final local gate |
| Account discovery | Public errors must not reveal whether an account exists | Generic failure contracts and rendered error focus pass | PASS | Final local gate |
| Search in access flow | Catalog search must not appear before authorized shelf entry | Search removed from auth/consent; preview contains zero search roles | PASS | Ahmed correction and preview DOM inspection |
| Workstation database command | Shared or founder-hosted database execution must be refused | Local database integration command refused by its GitHub-hosted Linux guard; CI used a disposable runner-local stack | PASS | Task handoff and CI run `34768159913` |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP03-T02-D01 | Closed deployment defect | Vercel lacked the new `APP_ORIGIN` binding. Two previews failed safely; non-secret Preview/Production configuration was added and exact source redeployed Ready. | Codex `/root` | Closed 2026-09-13 | None |
| WP03-T02-D02 | Verification note | The first focused post-search Playwright attempt encountered the existing local Next dev-server lock; after stopping that review server, all 7 focused cases and the later 12-case full suite passed. | Codex `/root` | Closed 2026-09-13 | None |
| WP03-T02-D03 | Environment boundary | Hosted Preview Supabase was not reset or mutated during candidate verification. The migration and Auth stack were verified only in disposable GitHub CI, as current runbook guards require. | Operations | At later approved environment promotion | Protected environment promotion, not candidate acceptance |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden roles/scopes were tested where applicable.
- [x] Logs and browser output were inspected where applicable.
- [x] Service-role and provider credentials remain server-only; browser payload checks and client artifact scanning pass.
- [x] No real student account, private source, paid provider, shared Supabase mutation, release, unlock, or beta action occurred.

## Rollback/disable procedure

Before any shared migration is applied, revert the WP03-T02 commits and redeploy the last known-good source. Remove the `APP_ORIGIN` Vercel binding only when the reverted application no longer requires it. If the activation trigger has later reached a shared environment, use a reviewed forward migration to disable or replace `zz_activate_profile_after_email_confirmation`; do not destructively rewrite migration history. For a preview regression, redeploy the last known-good Preview artifact and verify both health routes and the public access gate.

## Decision

WP03-T02 satisfies its implementation and candidate acceptance criteria with synthetic data and zero paid-provider cost. The exact candidate is green locally, in required GitHub checks, and in Vercel Preview. Ahmed's manual checklist correction is incorporated, and his `$finalize` invocation records the ordinary task approval. Protected-main review/merge and any later Supabase or production promotion remain separate delivery actions; production release still requires fresh, artifact-specific confirmations from both Ahmed and Ziad.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-13 |
| Ahmed | Human checkpoint and `$finalize` invoker | APPROVED | 2026-09-13 |
