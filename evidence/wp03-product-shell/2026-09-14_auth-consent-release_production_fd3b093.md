# Gate report: WP03-T02 auth and consent protected release

**Status:** PASS

**Environment:** Supabase Preview and Vercel Production; deterministic synthetic data and mock providers only

**Commit SHA:** merged `main` commit `fd3b0936cd9a9472dd50af26fc99bfcde1f1c6e6`; reviewed PR head `5e8860121b45273d70741cb3e4fb48d9e1b95250`; both resolve to Git tree `93c7c00789219d67d6c00feba04eed301ac36749`

**Release/config fingerprint:** `wp03-t02-fd3b093-preview`; Vercel Production deployment `dpl_2JoV9xgDnxWoPpCVf6XrkfyHPSCN`; Next.js `16.3.4`; synthetic-only; provider mode `mock`; provider budget `0`; generation, embedding, and transcription disabled

**Migrations:** `20260913063500_activate_verified_auth_profiles.sql`; SHA-256 `F7279D78585784FADFAD69B11692C3565292ED79ADA100E6035F43DB9A775066`; Supabase Preview project `ynlaejacnakvinlpthnb`

**Dataset/fixture versions:** rollback-only synthetic Auth/profile probe; no retained synthetic account rows

**Agent executor:** Codex `/root`

**Human reviewers:** Ahmed + Ziad — separate named protected-gate confirmations recorded under D-22; Ahmed also completed the ordinary manual task checkpoint

**Started/finished (UTC):** 2026-09-13 / 2026-09-13T21:20:53Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Risk classification | Release must be treated as R3 because it changes Auth-triggered durable profile state | Protected migration and production promotion used the R3 confirmation and verification path | PASS | Runbook WP03-T02 and D-22 |
| Protected authorization | One separately named confirmation from Ahmed and one from Ziad for the exact pending release action | Ahmed named Ahmed's confirmation and relayed Ziad's separate confirmation for commit `fd3b093`, the corrected T02 deployment, and its migration | PASS | Recorded founder checkpoints; D-22 permits relayed confirmation |
| Reviewed source identity | Reviewed head and merged source must resolve to the same Git tree | `5e88601^{tree}` and `fd3b093^{tree}` both equal `93c7c00789219d67d6c00feba04eed301ac36749` | PASS | Local Git object verification |
| Protected-main delivery | Required review and exact-head checks must pass before merge | PR `#29` approved by `aboayman-oss`, merged by `unimind989-sys`, and all four delivery commits remain in history | PASS | GitHub PR `#29`, runs `34779319502` and `34781885493` |
| Migration preflight | Preview ledger must have the expected prior head and no conflicting objects | Prior head was exactly `20260908122500`; target ledger row, function, and trigger were absent | PASS | Signed-in Supabase metadata queries |
| Atomic migration | Guarded transaction must install one exact ledger row and the intended function/trigger or change nothing | Ledger head became `20260913063500`; one statement recorded; function and trigger exist | PASS | Supabase transaction result and postflight metadata |
| Auth state behavior | Verification activates eligible pending profiles without bypassing suspension | Unverified remained PENDING; email confirmation activated PENDING; confirmed insert became ACTIVE; SUSPENDED remained SUSPENDED | PASS | Rollback-only hosted synthetic probe |
| Function privilege | Browser-facing roles must not execute the trigger function | Public, anon, and authenticated execute denied; function remains `security definer` with empty search path | PASS | Hosted ACL and `pg_proc` metadata checks |
| Database hygiene | Synthetic probe data must be removed and advisors must be clean at warning/error level | Zero probe rows remained; Security, Performance, and Health reported zero errors and zero warnings | PASS | Rollback verification and Supabase advisors |
| Production routing | Established public alias must resolve to a Ready production deployment | `project-xwrez.vercel.app` resolves to `dpl_2JoV9xgDnxWoPpCVf6XrkfyHPSCN`, target Production, status Ready | PASS | Authenticated Vercel inspection |
| Release identity and safe mode | Public page must expose the T02 fingerprint while remaining synthetic/mock only | `wp03-t02-fd3b093-preview`, `Synthetic only`, and `Mock only` rendered publicly | PASS | Deployment smoke, Vercel curl, and browser inspection |
| Auth-flow rendering | English/Arabic direction, protected-route redirect, no-search correction, and layout containment must hold | EN `lang=en`/`dir=ltr`; AR `lang=ar`/`dir=rtl`; `/learn` redirected to the login access gate; zero search controls and zero horizontal overflow | PASS | Fresh production browser checks |
| Early runtime health | Health contracts pass and no deployment error/warning signal appears | Seven deployment-smoke checks passed; error- and warning-level log scans returned no logs | PASS | Public smoke and Vercel logs |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-09-13 | `corepack pnpm verify` on final delivery candidate and release-evidence branch | 0 | Both runs passed formatting, lint, strict typing, boundaries, SQL/CI policy, secret scan, 297 unit tests, 15 mock integration tests with 2 hosted skips, 22 security tests, 3 evaluations, 5 load checks, 12 Playwright tests, production build, and client-artifact scan. |
| 2026-09-13 | GitHub Actions PR run `34779319502` | 0 | `dependency-audit`, `application`, and disposable `database-ci` passed on exact PR head. |
| 2026-09-13 | PR `#29` review and merge | 0 | `aboayman-oss` approved exact head `5e88601`; `unimind989-sys` merged as `fd3b093`; four delivery commits were preserved. |
| 2026-09-13 | GitHub Actions merged-main run `34781885493` | 0 | `application` and disposable `database-ci` passed; dependency audit was skipped by push policy. |
| 2026-09-13 | Supabase guarded migration transaction | 0 | Exact ledger precondition held; transaction installed the verified-profile function/trigger and one ledger row at head `20260913063500`. |
| 2026-09-13 | Hosted rollback-only Auth/profile probe | 0 | All intended activation/suspension and privilege cases passed; rollback left zero synthetic rows. |
| 2026-09-13 | Supabase advisors | 0 | Security, Performance, and Health each reported zero errors and zero warnings. |
| 2026-09-13 | Vercel corrected Preview deployment | 0 | `dpl_5rbpx2P7g7rJ8xfUvwdRNKRiEXQm` became Ready with the T02 fingerprint and passed protected preview probes. |
| 2026-09-13 | Vercel production deployment | 0 | Explicit clean-main production build `dpl_2JoV9xgDnxWoPpCVf6XrkfyHPSCN` became Ready and received the established public alias. |
| 2026-09-13 | `corepack pnpm smoke:deployment -- --base-url https://project-xwrez.vercel.app --target preview` | 0 | Seven public checks passed: live/ready GET bodies and no-store headers, POST denials, application identity, and synthetic/mock guard. |
| 2026-09-13 | Fresh production browser verification | 0 | Correct release marker, English/Arabic `lang` and `dir`, unauthenticated `/learn` redirect, access gate, zero search controls, and zero overflow passed. |
| 2026-09-13 | Vercel deployment-scoped error/warning scans | 0 | No runtime error or warning logs found for the final production deployment. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Missing Vercel canonical origin | Build must fail instead of inventing or trusting an unsafe origin | First branch preview failed safely; bounded server-owned Vercel origin derivation was added and fully reverified | PASS | Candidate report; failed preview `BsqM2y2SzvtqSx1kE48hd1a4icqo` |
| Direct SQL-editor corruption | No partial database state may remain after a malformed editor submission | Parse failed before mutation; post-check confirmed prior ledger/object state unchanged; exact clipboard round-trip was verified before retry | PASS | Supabase preflight and post-failure metadata |
| Protected preview smoke | Public fetch should not be mistaken for a product failure when Vercel protection rejects it | Normal smoke reported `REQUEST_FAILED`; the same six relevant probes passed through authenticated `vercel curl` | PASS | Corrected preview `dpl_5rbpx2P7g7rJ8xfUvwdRNKRiEXQm` |
| Stale preview release label | Promotion must stop when the candidate exposes an older release identity | First clean-main preview retained the WP02 marker; corrected preview was rebuilt with the exact T02 public fingerprint before approval | PASS | Superseded preview `dpl_HRc1xVT3KWm1vv3WMnPcQmwHGiFm` |
| Promote inherited stale Production value | Public routing must not remain on a deployment with the old T01 fingerprint | Browser check caught `wp03-t01-12c60d6-preview`; an explicit clean-main Production build with the T02 fingerprint replaced it and all public checks were repeated | PASS | Superseded production `dpl_2Ybm4cRTpmeJF3o9kKhhye7yW7jf`; final `dpl_2JoV9xgDnxWoPpCVf6XrkfyHPSCN` |
| Automatic custom-domain assignment | Established public alias must identify the final deployment | Default project alias moved automatically; `project-xwrez.vercel.app` was explicitly assigned and re-inspected before PASS | PASS | Vercel alias inspection |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP03-T02-R01 | Closed release defect | Two superseded Vercel attempts exposed stale public release identifiers. The exact source was rebuilt with an explicit T02 identifier, public routing was corrected, and verification was repeated. | Codex `/root` | Closed 2026-09-13 | None |
| WP03-T02-R02 | Observability gap | The Hobby project has no external log drain, Web Analytics, or Speed Insights; deployment-scoped CLI and browser checks are available and clean. | Operations owner | Before beta go-live | Beta observability review, not this synthetic release |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private source content, ordinary chat content, or unredacted personal data.
- [x] Synthetic fixtures only were used; rollback left zero probe users and profiles.
- [x] Browser-facing execution of the new trigger function is denied; the security-definer function uses an empty search path.
- [x] The application remains synthetic-only, mock-only, provider-disabled, and zero-budget.
- [x] Generic auth failures, internal-return validation, protected-route gating, client-artifact scanning, and browser payload boundaries passed the reviewed test suite.
- [x] Supabase advisors and Vercel runtime logs were inspected at error and warning levels.

## Rollback/disable procedure

For the application, reassign the production aliases to last-known-good pre-WP03-T02 deployment `dpl_8DuxtrDanzY9WLe5i7iqahXHWDKC`, restore the prior public release identifier, verify both health endpoints and the public browser route, and repeat error/warning scans. The database migration is forward-only: disable the trigger capability or ship a reviewed forward repair; never delete the migration ledger row or migrate Preview backward. No provider, paid-call, or real-user rollback is required.

## Decision

WP03-T02 is an R3 release because it changes Auth-triggered durable profile state. Its exact reviewed source was merged with required checks and cross-account approval; Ahmed and Ziad separately approved the protected migration and production action; the guarded Preview migration, rollback-only behavior proof, production deployment, public routing, bilingual flows, search removal, access gate, health checks, and runtime scans all passed. The protected synthetic release is `PASS`.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-14 |
| Ahmed | Ordinary task reviewer and protected-gate reviewer | APPROVED | 2026-09-14 |
| Ziad | Protected-gate reviewer | APPROVED; confirmation relayed by Ahmed under D-22 | 2026-09-14 |
