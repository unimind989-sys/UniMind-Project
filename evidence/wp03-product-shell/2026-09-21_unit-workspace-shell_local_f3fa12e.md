# Gate report: WP03-T04 authorized unit workspace shell

**Status:** PASS — local technical candidate; protected delivery and affected-service proof pending

**Environment:** Windows PowerShell; local synthetic-only browser fixtures; mock providers; production-safe build

**Commit SHA:** `f3fa12e` is the clean pre-delivery base identified by this evidence filename; the exact delivery candidate and merged commit will be recorded in the protected release report

**Release/config fingerprint:** `node=22.21.0; pnpm=10.34.5; next=16.3.4; provider-mode=mock; provider-budget-minor=0; generation=false; embedding=false; transcription=false`

**Migration:** candidate `20260921190508_unit_workspace_scope.sql`; SHA-256 `16427548664D931F6BF13FFBDDBC34D505C8FDDA84EE559E0BAA453FF1915CC7`; not applied to a shared environment during candidate work

**Dataset/fixtures:** existing deterministic synthetic Study Shelf catalog and disposable PostgreSQL fixture only; no real student, source, chat, or provider data

**Agent executor:** Codex `/root`

**Human authorization:** Ahmed is the selected chat speaker; D-22 records Ahmed and Ziad's standing authorization for task-scoped non-financial protected delivery

**Started/finished (UTC):** 2026-09-21 / technical candidate assembled 2026-09-21T20:42:41Z

## Scope and acceptance

| Criterion | Result | Status | Evidence |
| --- | --- | --- | --- |
| Canonical workspace authority | The production route validates UUIDs, rechecks verified auth/consent, and resolves the cohort/unit pair only through the caller-scoped `current_student_workspace` security-invoker RPC | PASS | Application/adapter tests; migration; trust-boundary review |
| Child-route reauthorization | Overview, chat, Studio, quiz, and the chat action resolve scope on the server; forged, inactive, and release-stale scope reaches one non-identifying boundary | PASS | Route review; focused Playwright denial case |
| Scoped mocked chat | Start persists caller ID, cohort, unit, language mode, and `MINIMAL` retention in `chat_sessions`; selection accepts only open caller-visible sessions from the exact scope | PASS | Domain/adapter tests; focused Playwright persistence/switch case; existing RLS matrix |
| Truthful product shell | Overview, chat, Studio, quiz, evidence, reporting, source/material/quota, edition, breadcrumb, and navigation states distinguish working scope persistence from unavailable future capability | PASS | Rendered desktop/narrow inspection; copy and component review |
| Arabic font resolution | The prior `Manrope, Manrope Fallback` expansion intercepted Arabic and Chromium resolved it as Arial; locale-root tokens now select the already-loaded Noto Sans Arabic custom face before fallback | PASS | Chrome DevTools Protocol platform-font assertion |
| Arabic/English balance | Arabic uses measured role-token adjustments (body 1.0625rem/450/1.65, neutral tracking, `font-size-adjust: 0.56`) while English keeps its existing Manrope metrics | PASS | `DESIGN.md`; computed-style and rendered comparison |
| Reflow and controls | 390px RTL and 640px effective 200% geometry have no horizontal overflow or clipped controls; visible narrow controls are at least 44px; skip navigation moves focus to main | PASS | Focused Playwright 5/5 |
| Database behavior | A focused pgTAP contract covers function metadata/grants, authorized scope, READY source facts, forged unit, inactive membership, and release lock on a clean disposable database | PENDING REMOTE | `supabase/tests/26_unit_workspace_shell.sql`; exact-head database CI required |
| Repository gate | Formatting, lint, types, boundaries, migration/policy/secret checks, all test layers, full E2E, production build, and client-artifact scan pass | PASS | `pnpm verify` |

## Commands and results

| Command/check | Result |
| --- | --- |
| Focused workspace unit/adapter contracts | 7/7 passed |
| `pnpm test:security` | 24/24 passed, including 1,596 reviewed actor/action/resource decisions across 42 functions |
| `pnpm check:sql` | 25 migrations passed convention review |
| Focused `tests/e2e/workspace-shell.spec.ts` | 5/5 passed after the final 44px, skip-link, and localized first-paint refinements |
| Bounded rendered inspection | English overview/chat and Arabic narrow overview had exact viewport width, no relevant console errors/warnings, no clipping, Manrope for English, and custom Noto Sans Arabic for Arabic |
| One Impeccable detector pass | New brand/color token drift was corrected; documented component radii were retained. Per the selected workflow, the detector was not rerun. |
| `pnpm verify` | Passed: 344 unit; 15 integration with 2 intentional hosted-only skips; 24 security; 3 evaluation; 5 load-contract; 24 E2E; optimized production build; client-artifact secret scan |
| GitHub Actions run `35653565111` | Dependency audit passed; application rejected fresh-checkout use of generated `PageProps`/`LayoutProps` before database CI. Explicit checked-in async route-prop types replaced that assumption, and the complete local gate reran green. |
| GitHub Actions run `35654391802` | Dependency audit and application passed; disposable start/upgrade/two resets/migration parity/all pgTAP assertions/advisors/type generation passed. Final generated-type parity rejected only RPC argument formatting and the generator's non-null timestamp declaration; the checked-in type was synchronized exactly. |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | Passed: 187 names, 46 local links, 23 synchronized decisions, and 104 task contracts |
| Actual-diff router | Policy v2; R3/protected; docs/frontend/runtime/auth/data/storage/delivery/tooling; broad CI; Sol High floor required; active primary model not externally verifiable; zero workers used |
| Diff and secret review | `git diff --check`, staged stat/full-diff review, repository secret scan, and client-artifact scan passed; no unrelated work was present |

## Negative and recovery cases

| Case | Expected result | Actual | Status |
| --- | --- | --- | --- |
| Forged cohort/unit | No confirmation or hidden metadata | Generic localized unavailable boundary | PASS |
| Forged session hint | No foreign selection | Caller-visible sessions remain listed; selection is null | PASS |
| Cross-scope repository row | Fail closed | Application service throws one generic data error | PASS |
| Release lock/deactivation | Next child operation removes scope | Synthetic browser state hides workspace metadata; disposable pgTAP assertion is queued for exact-head CI | PASS LOCAL / PENDING REMOTE |
| Missing quota/provider capability | No implied working action | Quota says inactive in mock; generation/messaging/reporting controls remain unavailable | PASS |
| Arabic fallback regression | Detect platform font rather than trusting CSS family text | CDP requires a custom `Noto Sans Arabic` face for the heading | PASS |
| Locale first-paint selector | Arabic root must win base `:root` tokens | A focused test caught zero-specificity `:where()` regression; explicit locale selector fixed it and 5/5 reran green | PASS |

## Deviations and advisories

| ID | Severity | Description | Disposition |
| --- | --- | --- | --- |
| WP03-T04-A01 | Tooling limitation | The runtime did not expose a verifiable active primary model identifier; policy requires Sol High. | Reported without claiming a model switch; no worker was used. |
| WP03-T04-A02 | Design metadata | `.impeccable/design.json` predates the current `DESIGN.md`, and the login surface brief is orphaned. | Left untouched because repairing design-side metadata is outside the selected workspace slice. |
| WP03-T04-A03 | Existing development advisory | Next development mode emits an intermittent Study Shelf LCP hint; the first visible card already receives eager behavior, the production build is clean, and WP03-T07 owns broader performance review. | Does not block T04. |
| WP03-T04-A04 | Platform split | The guarded disposable PostgreSQL/pgTAP gate does not run on this Windows candidate host. | Exact-head GitHub database CI is mandatory before merge. |
| WP03-T04-A05 | Closed CI portability defect | The first exact-head application job found that local `.next` artifacts had supplied route-prop globals unavailable before generation in a clean checkout. | Replaced generated globals with explicit shared async route-prop types; formatting, lint, typecheck, 7/7 focused tests, 24/24 E2E, production build, and client scan reran green. |
| WP03-T04-A06 | Closed generated parity defect | The first disposable database run passed behavior and advisors, then found the manually synchronized RPC type used multiline arguments and a nullable timestamp while the hosted generator emits a one-line argument object and non-null string. | Matched the generator exactly; the runtime adapter keeps a defensive null check at the untrusted data boundary. |

## Security and privacy review

- [x] Route, query, form, layout, and browser state are never authorization inputs.
- [x] The new RPC is stable, security invoker, empty-search-path, authenticated-only, and derives rows from `available_catalog_entries()`.
- [x] All six actor classes have explicit matrix decisions for the new function.
- [x] Chat persistence uses the caller-session client and existing RLS; no service credential reaches the browser.
- [x] Generic errors and not-found states omit identifiers, existence, ownership, diagnostics, and source content.
- [x] Tests use synthetic data, abort non-local browser requests, keep provider budget at zero, and make no paid call.
- [x] Repository and client-artifact secret scans passed.

## Rollback

Before shared promotion, rollback is branch deletion. After release, reassign `project-xwrez.vercel.app` to the last-known-good deployment and restore its release fingerprint. The database migration is forward-only: disable the exact function grant or ship a reviewed forward repair; never rewrite shared migration history or its ledger.

## Decision

The local WP03-T04 candidate is technically ready for protected delivery. Exact-head application/database CI, distinct-account GitHub review, Supabase Preview promotion/postflight, Vercel production promotion, live behavior proof, release evidence, authoritative closure, and branch cleanup remain mandatory before the task is complete.
