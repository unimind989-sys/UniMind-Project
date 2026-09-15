# Task record: WP03-T03 catalog journey server-first

**Task ID:** WP03-T03

**Status:** [~]

**Outcome:** An authenticated student can traverse only their server-authorized education level -> institution/system -> faculty/program/track -> academic year/level -> configured period -> curriculum-unit path, preserve a canonical selection in the URL, and recover safely from forged, stale, empty, loading, and error states in English or Arabic.

**Owner:** Codex `/root`; Ahmed is the requester and named human checkpoint

**Reviewer:** Ahmed approved the ordinary WP03-T03 completion checkpoint on 2026-09-15; Ahmed's explicit `$finalize` invocation relays Ahmed + Ziad standing authorization for this task's protected non-financial database and production delivery under D-22

**Branch:** `wp03/catalog-journey`; protected delivery PR #32 targets `main`

**Updated (UTC):** 2026-09-15T10:01:25Z

## Execution contract

**Dependencies:** Reviewed WP02-T09 database gate at `evidence/wp02-database/2026-09-09_database-gate_github_dd9ece4.md`; completed WP03-T01 Study Shelf visual/localization foundation and WP03-T02 auth/consent flows with their reviewed evidence under `evidence/wp03-product-shell/`.

**Inputs:** Runbook WP03-T03 and sections 6.0-6.2; master-plan student journey, application architecture, availability model, and catalog/release rules; `CONTEXT.md`; `PRODUCT.md`; `DESIGN.md`; approved `/learn` surface brief; current caller-scoped availability function; synthetic catalog fixtures only.

**Files:** Catalog selection domain/application contracts and caller-scoped Supabase adapter under `src/lib/catalog/`; the `/learn` Server Component, progressive catalog controls, loading/error/empty states, and existing Study Shelf components under `src/app/learn/`; any forward-only caller-scoped catalog migration and synchronized generated types; focused unit, integration, security, and Playwright coverage; this task record and sanitized evidence under `evidence/wp03-product-shell/`.

**Verify:** Focused catalog-selection, caller-scope, authorization, and Playwright tests; project-pinned Playwright CLI rendered inspection; one Impeccable detector pass and integrated audit after UI completion; `corepack pnpm verify`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; `git diff --check`; `git diff --stat`; full diff and secret/scope scan.

**Pass:** Every visible option originates from the current caller-scoped authorized result; the cascade names education level, university/system, faculty/program/track, academic year/level, and semester/term when required; Human Medicine and Veterinary Medicine share the same data-driven path and terminology seam; `FLEXIBLE_CREDIT` remains a program configuration rather than a faculty-name branch; query parameters are hints only and canonical invalid/downstream values are removed; upstream changes clear downstream selections; refresh and history preserve only authorized state; safe localized loading, no-result, no-membership, locked, unpublished, no-READY-source, and generic error behavior does not reveal hidden labels or IDs; keyboard, focus announcements, touch, responsive, RTL/LTR, long-label, and minimum/typical/maximum synthetic-count checks pass without a client authorization cache becoming authoritative.

**Evidence:** Expected candidate report `evidence/wp03-product-shell/2026-09-14_catalog-journey_local_<short-sha>.md`; sanitized rendered artifacts are supplemental only.

**Rollback:** Remove the WP03-T03 application/UI/tests before review; if a forward-only migration is added, revert it with a new migration rather than rewriting applied history. No shared-environment mutation or production promotion is authorized by this task start.

**Hard stop:** Do not use real student/source data, trust query parameters or client cache for authorization, expose hidden option labels/IDs or reason details, weaken RLS/grants, enable providers or paid calls, apply a migration to a shared environment, publish/unlock, or promote/release without the required named confirmations.

## Steps

- [x] Establish failing public-seam contracts for authorized option derivation, canonical URL selection, and safe stale/forged-state handling.
- [x] Implement the smallest caller-scoped catalog service and server-first selection resolver.
- [x] Extend the approved Study Shelf with dependent progressive controls and safe loading, empty, no-result, and error states.
- [x] Exercise minimum, typical, maximum, long-label, English/Arabic/mixed, responsive, keyboard, screen-reader, refresh, history, interruption, forged-ID, expired-membership, and release-change cases.
- [x] Incorporate Ahmed's review: expose education level first, then university/system, faculty/track, academic year, and semester when required; add Human Medicine, Veterinary Medicine, and a bounded Thanaweya Amma architecture fixture; record flexible-credit course selection as configuration.
- [x] Run focused and complete verification, bounded rendered inspection, the one permitted detector pass, integrated Impeccable audit, evidence assembly, and Ahmed's ordinary completion checkpoint.

## Handoff

**Changed:** Added a pure canonical catalog resolver, public application contract, caller-session Supabase adapter, two RLS-scoped database functions plus pgTAP coverage, synchronized function matrix/types, localized progressive Study Shelf controls and safe states, a localized loading boundary, and minimum/typical/maximum fixtures. Ahmed's review revised the cascade to education level -> university/system -> faculty/program/track -> academic year/level -> semester/term; the synthetic preview now demonstrates three university choices, the Human Medicine and Veterinary Medicine pilots, and the reusable Thanaweya Amma seam. Program configuration now carries `TERM_BASED` or `FLEXIBLE_CREDIT`, with individually eligible unit selection retained as the authority-safe course seam. The external-Chrome review handoff is now a permanent UI workflow rule. The Impeccable audit added a skip link and removed new token drift; updated English desktop and Arabic mobile inspection found no overflow or browser errors.

**Commands:** Focused domain/adapter tests pass 10/10; revised catalog Playwright passes 10/10. Final `corepack pnpm verify` passed formatting, lint, strict types, boundaries, SQL/CI policy, secret scans, 307 unit, 15 integration with 2 intentional hosted skips, 22 security, 3 evaluation, 5 load-contract, 19 E2E, and the production build. Agent readiness passed with 173 names, 46 local links, 23 synchronized decisions, and 102 task contracts; the isolated clean-snapshot handoff rehearsal also passed. The first protected PR run `34953965803` caught two test-harness omissions; replacement run `34954938957` exposed a stale test JWT claim; run `34955820545` caught the safe-state/RLS semantic gap; run `34957051902` then passed upgrade, two resets, migration parity, all 370 pgTAP assertions, advisors, and type generation before rejecting only a three-line generated-property ordering mismatch. The public state RPC remains a security invoker and delegates through a definition-time-bound call to one private bounded security-definer evaluator; identity comes only from `auth.uid()`, output is a fixed non-identifying code, both search paths are empty, and authenticated callers retain no private-schema usage. The checked-in generated type order now matches the hosted generator. Focused SQL conventions, the 41-function/1,590-decision matrix, 22 security tests, diff check, and secret scan pass before the next disposable run. Project-pinned Playwright CLI rendered 1280px English Veterinary Medicine and 390px Arabic with zero console warnings/errors and exact viewport width. One detector pass returned advisory-only token findings on the original candidate; this focused content/hierarchy revision used the bounded browser pass without spending a second detector run.

**Remaining:** Run the 19-check pgTAP file in disposable GitHub CI, deliver through protected `main`, apply and verify the forward migration on affected Supabase environments, and verify/promote the affected Vercel runtime. Ahmed approved the external-Chrome preview and invoked `$finalize` on 2026-09-15; no further non-financial approval is required.

**Next safe action:** Run replacement disposable GitHub database CI, satisfy protected review, merge, verify affected Supabase and Vercel services, promote the verified runtime, update commit-specific evidence, and clean task-created branches.

**Reviewer action:** Ahmed reviewed the external-Chrome candidate and recorded `APPROVED` on 2026-09-15. His explicit `$finalize` invocation records Ahmed + Ziad standing authorization for every task-scoped non-financial protected action under D-22; it does not authorize real-money exposure.
