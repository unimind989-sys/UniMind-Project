# Gate report: WP03-T03 server-first catalog journey

**Status:** APPROVED CANDIDATE — replacement disposable database CI remains open

**Environment:** Windows PowerShell, local synthetic-only browser and production-safe build

**Commit SHA:** `12c0ece` is the clean pre-delivery base identified by this evidence filename; delivery candidate commits are tracked on `wp03/catalog-journey` through PR #32 and final merge evidence will use the exact merged SHA

**Release/config fingerprint:** `node=24.19.0; pnpm=10.34.5; next=16.3.4; supabase-js=2.112.3; provider-mode=mock; provider-budget-minor=0; generation=false; embedding=false; transcription=false`

**Migrations:** one forward-only unapplied candidate, `20260914112000_student_catalog_journey.sql`; no local, preview, or production database was mutated

**Dataset/fixture versions:** repository WP02 synthetic database fixture; Study Shelf synthetic catalog with University Student and Thanaweya Amma stages, three illustrative university choices, Human Medicine and Veterinary Medicine pilot programs, three academic years, two terms, and minimum 1, typical 8, and PoC maximum 12 option-count tests; no real student or source data

**Agent executor:** Codex `/root`

**Human reviewer:** Ahmed — external-Chrome candidate approved 2026-09-15; explicit `$finalize` invocation relays Ahmed + Ziad standing authorization for task-scoped non-financial delivery under D-22

**Started/finished (UTC):** 2026-09-14 / technical candidate assembled 2026-09-14T14:52:21Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Caller-scoped catalog | Every visible row originates from current caller authorization | `available_catalog_entries()` begins with `available_curriculum_units(false)`, uses security-invoker/RLS semantics, and returns the configured path only for AVAILABLE units | PASS pending disposable pgTAP | Migration; `supabase/tests/25_student_catalog_journey.sql` |
| Safe access state | Empty/error state reveals no private labels, IDs, or diagnostics | A second security-invoker RPC returns one of six fixed safe codes; the adapter rejects unknown codes, unknown progression modes, and row/state disagreement | PASS pending disposable pgTAP | Adapter unit tests 4/4; security matrix 1,584 decisions |
| Query hints are non-authoritative | Validate each hint against authorized upstream options and canonicalize | Forged, stale, duplicated, oversized, and downstream hints are dropped; canonical URL preserves only authorized selection | PASS | Domain unit tests; Playwright forged/deep-link cases |
| Cascading hierarchy and pilots | Education level -> university/system -> faculty/program/track -> academic year/level -> configured period -> unit | English and Arabic labels adapt to University or Thanaweya Amma; Human Medicine renders Modules and Veterinary Medicine renders Subjects through configuration | PASS | Revised synthetic fixture; catalog Playwright cases |
| Flexible-credit extension | Avoid a faculty-name branch or rigid semester assumption | Programs carry validated `TERM_BASED` or `FLEXIBLE_CREDIT`; flexible programs may hide a redundant fixed-semester control and expose only caller-authorized individually eligible units | PASS for contract; future Pharmacy configuration not in pilot scope | Migration, adapter, UI contract, D-23 |
| Upstream change and history | Clear downstream state; refresh/back/forward remain stable | Server navigation clears downstream query keys and survives reload plus browser history | PASS | `tests/e2e/study-shelf.spec.ts` |
| Safe UX states | Localized loading, no-result, membership, locked, no-catalog, unpublished, no-source, and generic error states | Each state has distinct English/Arabic copy and exposes no hidden option controls | PASS | Copy contract, preview fixtures, Playwright safe-state case |
| Accessible responsive controls | Native labels, keyboard/focus, announcements, touch, reduced motion, skip path, RTL/LTR, no page overflow | 44px mobile targets, focus restoration, live pending/results status, skip link, logical layout, and reduced-motion behavior pass | PASS | E2E; project-pinned browser inspection |
| Count and content hardening | Minimum/typical/maximum PoC option counts plus long English/Arabic/mixed labels | Resolver preserves 1, 8, and 12 authorized rows and long mixed `OSCE 1` labels without changing authority | PASS | Domain unit test |
| Architecture boundary | UI depends on application interfaces; provider/database logic stays server-side | Pure domain, application facade, caller-session adapter, and Client Component boundaries pass the repository graph audit | PASS | `pnpm check:boundaries` |
| Zero-cost repository gate | Full `pnpm verify` exits 0 | All local layers, E2E, production-safe build, and client-artifact scan pass | PASS | Command table |
| Ordinary human checkpoint | Ahmed reviews this candidate and records PASS or a defect | Ahmed approved the external-Chrome candidate on 2026-09-15 | PASS | Decision table |

## Commands executed

| UTC date | Command/test ID | Exit code | Sanitized result |
| --- | --- | --- | --- |
| 2026-09-14 | Focused resolver test before implementation | non-zero | Expected red state: catalog domain module did not exist. |
| 2026-09-14 | `corepack pnpm exec vitest run tests/unit/catalog-journey.test.ts tests/unit/catalog-journey-supabase.test.ts` | 0 | 10/10 canonical selection, count/label, caller-adapter, progression-mode, and fail-closed tests passed. |
| 2026-09-14 | `corepack pnpm check:sql` | 0 | SQL convention audit passed for 24 migrations; an initially exposed security-definer design was rejected and replaced with caller-RLS security-invoker functions. |
| 2026-09-14 | `corepack pnpm test:integration:database` | 1 | Expected platform guard: disposable Supabase commands require a GitHub-hosted Linux runner; no database process or mutation started. |
| 2026-09-14 | `corepack pnpm test:security` | 0 | 22/22 tests passed after the actor/action/resource matrix was extended from 38 to 40 functions and 1,572 to 1,584 reviewed decisions. |
| 2026-09-14 | `corepack pnpm exec playwright test tests/e2e/study-shelf.spec.ts` | 0 | 10/10 catalog cases passed: University hierarchy, Human/Veterinary pilots, Thanaweya Amma adaptation, canonical route, refresh/history, forged hint, interrupted navigation, deep link/locale/search, safe access changes, mobile, and reduced motion. |
| 2026-09-14 | Project-pinned `corepack pnpm browser:cli` inspection | 0 | 1280px English Veterinary Medicine and 390×844 Arabic inspected; dynamic Arabic labels were `المستوى التعليمي، الجامعة، الكلية، السنة الدراسية، الترم الدراسي`; zero console errors/warnings and mobile document width equaled 390px. |
| 2026-09-14 | One `impeccable` detector pass | advisory exit | 24 advisory token findings: 19 were incumbent file values, 2 new type-ramp drifts and 1 new border drift were corrected, and 2 retained values are explicitly documented component tokens in `DESIGN.md`. Per workflow, no second detector ran. |
| 2026-09-14 | Integrated Impeccable technical audit | 0 | 20/20: accessibility 4, performance 4, theming 4, responsive 4, implementation integrity 4; no unresolved P0-P2 finding. |
| 2026-09-15 | Final `corepack pnpm verify` after power-loss recovery | 0 | Formatting, lint, strict types, boundaries, SQL/CI policy, secret scan, 307 unit, 15 integration with 2 intentional hosted skips, 22 security, 3 evaluation, 5 load-contract, 19 E2E, production build, and client-artifact secret scan passed. |
| 2026-09-15 | `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | 0 | 173 names, 46 local links, 23 synchronized decisions, and 102 task contracts passed. |
| 2026-09-15 | `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | 0 | Isolated committed-snapshot rehearsal passed with a clean reconstructed worktree, 6 durable active records, and readiness verification. |
| 2026-09-15 | External Google Chrome review handoff | 0 | Launched `http://127.0.0.1:3000/preview/learn` in the installed external Chrome executable; the persistent synthetic preview server returned HTTP 200. |
| 2026-09-15 | GitHub Actions run `34953965803` | 1 | Dependency audit, application gate, Vercel Preview, upgrade, two clean resets, and migration parity passed; pgTAP then rejected two missing public-function allowlist entries and governed fixture mutations without audit correlation. The disposable stack and volumes were removed and no shared environment changed. |
| 2026-09-15 | Post-CI fixture repair: `corepack pnpm check:sql`; `corepack pnpm test:security`; diff and secret scans | 0 | Added the two caller-scoped RPCs to the database matrix's explicit allowlist and supplied synthetic actor/reason/correlation context to the mutation tests; 24 migrations and 22/22 security tests pass locally before the replacement disposable run. |
| 2026-09-15 | GitHub Actions run `34954938957` | 1 | Dependency/application gates, Vercel Preview, upgrade, two clean resets, migration parity, and the corrected public-function matrix passed. The new journey pgTAP file then exposed a test-only stale JWT caller claim after `reset role`; the disposable environment was cleaned and no shared environment changed. |
| 2026-09-15 | Stale-claim fixture repair: `corepack pnpm check:sql`; `corepack pnpm test:security`; diff and secret scans | 0 | Cleared the synthetic JWT role/subject before owner-governed setup mutations so the audit trigger uses the explicit founder actor. SQL conventions, 22/22 security tests, diff check, and the 882-file secret scan pass locally before the next disposable run. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status |
| --- | --- | --- | --- |
| Forged/oversized query ID | Never broadens access or confirms hidden existence | Resolver removes invalid and downstream hints, then redirects to the authorized canonical prefix | PASS |
| Expired membership | No catalog identifiers; generic safe state only | Database contract returns no rows and `NO_MEMBERSHIP`; preview payload contains no option controls | PASS pending pgTAP execution |
| Cohort locks while browsing | Next server operation removes visible catalog | Safe-state preview replaces all identifiers with `COHORT_LOCKED`; pgTAP mutates and rolls back the synthetic release | PASS pending pgTAP execution |
| Published unit loses READY source | Unit disappears and safe cause remains bounded | RPC state allowlist returns `READY_SOURCE_MISSING`; browser sees only localized generic copy | PASS pending pgTAP execution |
| No catalog / all units unpublished | Distinct safe state without identifiers | Database test constructs an empty cohort and withdraws the published synthetic unit inside savepoints | PASS pending pgTAP execution |
| Interrupted navigation | No duplicate/stale selection becomes authoritative | Pending shell disables path controls until the server response updates the canonical route | PASS |
| Database/provider failure | No diagnostics or partial rows reach UI | Adapter throws one generic application error; UI exposes localized retry only | PASS |
| External browser request | Preview remains local, synthetic, and zero-cost | Test harness aborts all non-local requests and all browser cases pass | PASS |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP03-T03-D01 | Environment | The guarded disposable Supabase/pgTAP runner refuses Windows and requires GitHub-hosted Linux. The 19-check database file is written but not represented as locally executed. | Delivery agent / GitHub CI | Before technical completion | Database migration acceptance |
| WP03-T03-D02 | Closed delivery setup | `$finalize` created `wp03/catalog-journey`, pushed the candidate, and opened protected PR #32. | Delivery agent | Closed 2026-09-15 | None |
| WP03-T03-D03 | Advisory | Next development mode emitted an LCP hint for a card that already renders with eager loading and high fetch priority when first visible; production build and rendered inspection were clean. | WP03-T07 performance review | Product-shell gate | None for T03 |
| WP03-T03-D04 | Closed CI fixture defect | First disposable run found that the pgTAP harness had not listed the two new public RPCs and had not supplied required audit context for governed synthetic mutations. The allowlist and test-local actor/reason/correlation settings were added without changing production grants or behavior. | Delivery agent | Closed 2026-09-15 | Replacement database CI |
| WP03-T03-D05 | Closed CI fixture defect | The replacement disposable run showed that PostgreSQL `reset role` did not clear the synthetic authenticated JWT claim, so the audit helper correctly rejected a database-owner setup mutation whose explicit founder actor differed from the stale student caller. The harness now clears those claims before its governed savepoint mutations; production SQL and grants are unchanged. | Delivery agent | Closed 2026-09-15 | Replacement database CI |

## Security and privacy review

- [x] Catalog queries use the authenticated caller client; no service-role credential enters the application or browser path.
- [x] Public RPCs are stable security-invoker functions with empty search paths and exact authenticated EXECUTE grants; anonymous execution is revoked.
- [x] Safe-state output is a fixed non-identifying allowlist; row/state mismatches and unknown values fail closed.
- [x] Actor/action/resource coverage includes both new functions for anonymous, student, Batch Leader, admin, worker, and service-role actors.
- [x] Unknown program progression modes fail closed; flexible-credit display changes only the selection experience and never broadens unit authorization.
- [x] Repository and production client-artifact secret scans passed; no real user/source data, signed URL, private source text, or provider payload was used.
- [x] No paid call, shared migration, deployment, unlock, publication, or protected release action occurred.

## Rollback/disable procedure

Before merge, remove the scoped WP03-T03 source, migration, pgTAP, test, task, matrix, and evidence diff and restore the existing Study Shelf files to `12c0ece`. After a future merge, revert the outcome-oriented application commit and add a new forward migration to remove the two functions and their grants; never rewrite applied migration history. No current database, storage, provider, or release rollback is required because none was changed.

## Decision

The revised local technical and UX candidate is green. Ahmed approved the external-Chrome preview and explicitly invoked `$finalize` on 2026-09-15. Under D-22, that invocation supplies Ahmed + Ziad standing authorization for this task's non-financial protected GitHub, Supabase, and Vercel delivery; it does not authorize real-money exposure. Database behavior is specified by a 19-check pgTAP contract and must still pass in the guarded GitHub-hosted Linux environment before technical completion.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL CANDIDATE PASS | 2026-09-14 |
| Ahmed | Ordinary human checkpoint and `$finalize` invoker | APPROVED; relays Ahmed + Ziad standing non-financial delivery authorization under D-22 | 2026-09-15 |
