# Gate report: WP03-T03 server-first catalog journey protected release

**Status:** PASS

**Environment:** Supabase Preview and Vercel Production; deterministic synthetic catalog and mock providers only

**Commit SHA:** merged `main` commit `1ee95932348224b5503edb37f88591fbe5fdf433`; reviewed PR head `742e61e33246406b99932120b5deb320da130ce7`; both resolve to Git tree `9a1a97022798956194ba514bca8b0430c67b92d1`

**Release/config fingerprint:** `wp03-t03-1ee9593-preview`; Vercel Production deployment `dpl_3tLLtfqMwoLt1zzJqfc6t7pLysWo`; Next.js `16.3.4`; synthetic-only; provider mode `mock`; provider budget `0`; generation, embedding, and transcription disabled

**Migrations:** `20260914112000_student_catalog_journey.sql`; SHA-256 `A90728F404D1F3C6E49508FE868A30BA75613ED099954B0831B77510F89BBD2B`; Supabase Preview project `ynlaejacnakvinlpthnb`

**Dataset/fixture versions:** repository synthetic catalog: University Student and Thanaweya Amma stages, three illustrative universities, Human Medicine and Veterinary Medicine pilots, three academic years, two terms, and individually selectable authorized curriculum units; no real student or source data

**Agent executor:** Codex `/root`

**Human reviewers:** Ahmed approved the rendered candidate and invoked `$finalize`; that invocation records Ahmed + Ziad standing authorization for task-scoped non-financial protected delivery under D-22

**Started/finished (UTC):** 2026-09-14 / 2026-09-15T14:40:41Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Protected source identity | Reviewed head and merged source resolve to the same Git tree | `742e61e^{tree}` and `1ee9593^{tree}` both equal `9a1a97022798956194ba514bca8b0430c67b92d1` | PASS | Local Git object verification |
| Protected-main delivery | Exact-head review and required checks pass before merge | PR #32 received owner approval on exact head `742e61e`; final PR run `34957861352` passed; merged as `1ee9593`; merged-main run `34979935225` passed | PASS | GitHub PR and Actions |
| Migration preflight | Hosted ledger has expected prior head and no conflicting target state | Prior head was exactly `20260913063500`; target ledger row, functions, and `progression_mode` column were absent | PASS | Signed-in Supabase read-only metadata queries |
| Atomic migration | Exact repository SQL and one ledger row commit together or not at all | Guarded transaction committed; ledger head is `20260914112000`, name is `student_catalog_journey`, and statement count is one | PASS | Supabase SQL result and postflight |
| Caller-scoped catalog | Identifier-bearing catalog remains security-invoker/RLS scoped | `available_catalog_entries()` exists, is security invoker with empty search path, is executable by authenticated only, and executes successfully | PASS | Hosted `pg_proc`, privilege, and operational query |
| Safe-state boundary | Public state exposes fixed non-identifying codes without granting private schema access | Public state is security invoker; private evaluator is security definer; both have empty search paths; authenticated lacks private-schema usage; unauthenticated execution returns `NO_MEMBERSHIP` | PASS | Hosted metadata and behavior query |
| Database hygiene | Security, Performance, and Health advisors have no warning/error finding | All three categories reported zero errors and zero warnings after migration | PASS | Supabase Advisors |
| Production routing | Established public domain resolves to the new Ready production deployment | `project-xwrez.vercel.app` resolves to `dpl_3tLLtfqMwoLt1zzJqfc6t7pLysWo`, target Production, status Ready | PASS | `vercel alias set` and `vercel inspect` |
| Release identity and safe mode | Production exposes exact fingerprint and remains mock-only/zero-budget | Release is `wp03-t03-1ee9593-preview`; seven deployment-smoke checks passed | PASS | Vercel environment and public smoke |
| Catalog journey | University -> Faculty -> Year -> Semester cascades server-first and selects authorized units | Ain Shams -> Faculty of Medicine -> First year -> Term 1 rendered five modules; Anatomy selection revealed eight approved sources and edition `synthetic-2026-2027` | PASS | Fresh Codex side-browser production check |
| Protected route | Anonymous `/learn` access must reach the account gate | `/learn?lang=en` redirected to `/login?lang=en&next=%2Flearn` and rendered the four-step access path | PASS | Fresh Codex side-browser production check |
| Runtime health | Public contracts and early error/warning scans remain clean | Seven smoke checks passed; page consoles and deployment-scoped error/warning scans were clean | PASS | Browser logs and Vercel logs |
| Human review handoff | Approved UI must open automatically in external Chrome for manual review | The exact verified production catalog URL was opened in external Google Chrome after production verification | PASS | External-Chrome handoff |

## Commands executed

| UTC date | Command/test ID | Exit code | Sanitized result |
| --- | --- | --- | --- |
| 2026-09-15 | GitHub Actions exact-head run `34957861352` | 0 | Dependency audit, application gate, Vercel Preview, disposable upgrade, two resets, migration parity, all 370 pgTAP assertions including 19 journey checks, advisors, generated types/parity, integration/security, and cleanup passed. |
| 2026-09-15 | PR #32 owner review and merge | 0 | `unimind989-sys` approved exact head `742e61e` at `2026-09-15T14:09:46Z`; the PR merged at `2026-09-15T14:11:12Z` as `1ee9593`. |
| 2026-09-15 | GitHub Actions merged-main run `34979935225` | 0 | Clean merged `main` passed the application and disposable database gates. |
| 2026-09-15 | Supabase guarded migration transaction | 0 | Expected prior head and object absence held; exact migration plus one ledger statement committed atomically. |
| 2026-09-15 | Supabase hosted metadata and behavior postflight | 0 | Ledger, column/constraint, function existence, security modes, empty search paths, grants, private-schema denial, safe anonymous state, and operational catalog query passed. |
| 2026-09-15 | Supabase Advisors | 0 | Security, Performance, and Health each reported zero errors and zero warnings. |
| 2026-09-15 | `corepack pnpm exec vercel deploy --prod --yes` | 0 | Production deployment `dpl_3tLLtfqMwoLt1zzJqfc6t7pLysWo` built Next.js `16.3.4` and reached Ready. |
| 2026-09-15 | `corepack pnpm exec vercel alias set ... project-xwrez.vercel.app` | 0 | Established public domain was explicitly assigned to the new deployment and re-inspected. |
| 2026-09-15 | `corepack pnpm smoke:deployment -- --base-url https://project-xwrez.vercel.app --target preview` | 0 | Seven live/ready, method, identity, and synthetic/mock checks passed. |
| 2026-09-15 | Fresh Codex side-browser verification | 0 | Catalog cascade, canonical URL, authorized Anatomy details, protected-route redirect, and console checks passed. |
| 2026-09-15 | Vercel deployment-scoped error/warning scans | 0 | No runtime error or warning logs found for the final production deployment. |
| 2026-09-15 | `corepack pnpm verify` on the release-evidence branch | 0 | Formatting, lint, strict typing, boundaries, SQL/CI policy, secret scan, 307 unit, 15 integration with 2 intentional hosted skips, 22 security, 3 evaluation, 5 load-contract, 19 E2E, production build, and client-artifact scan passed. |
| 2026-09-15 | Agent readiness and isolated handoff rehearsal | 0 | 174 names, 46 local links, 23 synchronized decisions, and 102 task contracts passed; the committed-snapshot handoff rehearsal also passed. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status |
| --- | --- | --- | --- |
| Supabase browser-control timeout | Never assume commit state or blindly resubmit | Visible result was checked; the guarded transaction was submitted once through the signed-in window and returned success; hosted ledger/object postflight proved exactly one applied row | PASS |
| Stale/forged deep link | Invalid hints must not reveal or retain unauthorized descendants | A stale synthetic URL canonicalized to the authorized stage prefix; the cascade then accepted only visible authorized values | PASS |
| Automatic production-domain assignment | Established review domain must identify the final deployment | Default alias moved automatically; `project-xwrez.vercel.app` was explicitly assigned and inspected | PASS |
| Anonymous protected route | Catalog must not bypass account/verification/consent gates | `/learn` redirected to the localized login access path | PASS |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP03-T03-R01 | Closed operational interruption | External Chrome control timed out during the confirmed SQL submission. A visible-state check plus guarded transaction prevented double application, and complete hosted postflight passed. | Codex `/root` | Closed 2026-09-15 | None |
| WP03-T03-R02 | Advisory | Vercel build reports that a major.minor.patch Node engine is reduced to its supported major selection. The build, runtime smoke, and browser checks pass; align engine syntax in a later maintenance task. | Repository maintenance | Before beta hardening | None for T03 |
| WP03-T03-R03 | Observability gap | The Hobby project has no external log drain, Web Analytics, or Speed Insights; deployment-scoped CLI and browser checks are available and clean. | Operations owner | Before beta go-live | Beta observability review |

## Security and privacy review

- [x] No secret, signed URL, private source material, real student data, ordinary chat content, or unredacted provider payload appears in this report.
- [x] Identifier-bearing catalog access remains security-invoker/RLS scoped; anonymous execution is denied.
- [x] Safe-state output is bounded and non-identifying; authenticated callers have no private-schema usage.
- [x] Hosted migration, privilege metadata, anonymous behavior, advisors, public smoke, protected-route rendering, client console, and runtime log checks passed.
- [x] The release remains synthetic-only, mock-only, provider-disabled, zero-budget, and incurred no paid call.

## Rollback/disable procedure

Reassign `project-xwrez.vercel.app` to last-known-good deployment `dpl_2JoV9xgDnxWoPpCVf6XrkfyHPSCN`, restore release fingerprint `wp03-t02-fd3b093-preview`, and repeat health, protected-route, catalog, and error/warning checks. The database migration is forward-only: disable affected EXECUTE grants or ship a reviewed forward repair; never delete the migration ledger row or migrate Supabase Preview backward. No provider, paid-call, real-user, publication, or unlock rollback is required.

## Decision

WP03-T03 is complete. The exact reviewed source passed all local and disposable database gates, merged through protected `main`, applied atomically to Supabase Preview, and shipped as a Ready Vercel Production deployment on the established public domain. Hosted security, safe-state, advisor, smoke, catalog, auth-gate, console, and runtime-log checks are green. Ahmed's approval and explicit `$finalize` invocation supply the recorded human checkpoint and Ahmed + Ziad standing authorization for this task-scoped non-financial delivery under D-22.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-15 |
| Ahmed | Ordinary reviewer and `$finalize` invoker | APPROVED; relays Ahmed + Ziad standing non-financial delivery authorization under D-22 | 2026-09-15 |
