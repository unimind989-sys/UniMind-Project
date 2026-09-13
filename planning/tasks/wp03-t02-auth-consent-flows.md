# Task record: WP03-T02 auth and consent flows

**Task ID:** WP03-T02

**Status:** [~]

**Outcome:** Students can complete localized email/password authentication, recovery, session exit, and current consent acceptance through safe server-controlled flows without an admin workaround.

**Owner:** Codex `/root`; Ahmed is the requester and named human checkpoint

**Reviewer:** Ahmed for the ordinary WP03-T02 completion checkpoint

**Branch:** `wp03/auth-consent-flows`

**Updated (UTC):** 2026-09-13T15:49:06Z

## Execution contract

**Dependencies:** Reviewed WP02-T09 database gate at `evidence/wp02-database/2026-09-09_database-gate_github_dd9ece4.md`; completed WP03-T01 visual/localization foundation and production evidence under `evidence/wp03-product-shell/`; approved auth-session revocation baseline at `docs/policies/auth-session-revocation.md`.

**Inputs:** Runbook WP03-T02 and sections 6.0-6.7; master-plan student journey, application architecture, identity schema, and authorization rules; `CONTEXT.md`; `DESIGN.md`; current Supabase Auth/session seams; synthetic Auth fixtures only.

**Files:** Auth domain, application, caller-scoped Supabase, and consent-access helpers under `src/lib/auth/`; localized auth, callback, consent, protected learning, and synthetic-preview routes under `src/app/`; `src/lib/i18n/auth-copy.ts`; the verified-profile activation migration and pgTAP contract; focused unit, application, security, and Playwright coverage; the approved Access Shelf artifacts and reconciled `DESIGN.md`; this task record and later sanitized evidence under `evidence/wp03-product-shell/`.

**Verify:** Focused auth/consent unit, integration, security, and Playwright tests; project-pinned Playwright CLI rendered inspection; one Impeccable detector pass and finish review after UI completion; `corepack pnpm verify`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; `git diff --check`; `git diff --stat`; full diff and secret/scope scan.

**Pass:** New, verified, unverified, suspended, revoked-session, stale-cookie, expired/replayed recovery-link, outdated-consent, rate-limited, and forged-return-path states fail or advance safely; current terms, privacy, and educational-boundary acceptance gates learning routes; localized accessible forms prevent account discovery, duplicate submission, and open redirects; browser payloads contain no auth secrets or private membership state.

**Evidence:** Expected at `evidence/wp03-product-shell/2026-09-13_auth-consent_<environment>_<short-sha>.md` after a candidate SHA exists.

**Rollback:** Remove the WP03-T02 routes, helpers, tests, and forward-only schema additions before review; after delivery, revert the task commit while retaining WP03-T01. Do not rewrite or destructively roll back an applied migration.

**Hard stop:** Do not use real student accounts or private data; expose service-role credentials; trust client metadata, query parameters, or `getSession()` as authorization; reveal account existence; enable a live provider or paid call; weaken RLS/grants; promote, release, unlock, or perform any protected transition without its required confirmations.

## Steps

- [x] Establish failing public-seam contracts for redirect safety, generic errors, auth state transitions, consent gating, and localized accessible form behavior.
- [x] Implement the smallest server-controlled Supabase Auth and current-consent application seams needed by those contracts.
- [x] Build the complete English/Arabic auth and consent routes in the approved Study Shelf visual system.
- [x] Exercise the required user, recovery, session, consent, responsive, accessibility, and browser-payload states with synthetic fixtures.
- [x] Complete bounded rendered inspection, the one Impeccable detector pass, independent finish review, and full zero-cost verification.
- [~] Assemble sanitized evidence and obtain Ahmed's ordinary completion checkpoint.

## Handoff

**Changed:** Implemented server-controlled login, registration, verification/resend, recovery/reset, logout, current-consent gating, canonical callback redirects, and protected learning access. Added a forward-only verified-profile activation trigger, caller-scoped consent reads, generic public failures, English/Arabic accessible forms, the Ahmed-approved Access Shelf composition, synthetic public preview, and focused unit/application/security/browser coverage. Ahmed completed the full manual checklist with one correction: catalog search does not belong in authentication or consent. Search was removed from every access route, the locale control was retained, and the surface/design records now state that search begins only after authorized shelf entry.

**Commands:** The final post-correction `corepack pnpm verify` passed the zero-cost full suite: formatting, lint, strict typing, boundaries, SQL conventions, CI policy, secret scan, 294 unit tests, 15 mock integration tests with 2 hosted tests skipped by contract, 22 security tests, 3 evaluation cases, 5 load-contract checks, 12 Playwright tests, a production build, and client-artifact secret scanning. Project-pinned Playwright CLI inspection produced valid desktop and mobile English/Arabic captures with zero console errors. The one Impeccable detector pass completed; the original independent finish reviewer scored all eight requested fixes resolved and returned `ship`. Raster provenance reports 12 decision rasters and 0 missing prompts. `scripts/verify-agent-readiness.ps1` passed 168 names, 46 local links, 22 synchronized decisions, and 102 task contracts; `scripts/test-agent-handoff.ps1` passed its isolated rehearsal. A post-audit logout truthfulness correction passed its 6 focused unit tests, strict typecheck, and full lint. After Ahmed's manual checklist feedback, the search-free refinement passed formatting, strict typing, lint, 7 focused Playwright cases, desktop/mobile rendered inspection with zero search roles, zero page overflow, Arabic `lang`/`dir`, and zero console errors or warnings. A fresh full Impeccable reviewer found no material fixes and returned `disposition: ship`. Local `pnpm test:integration:database` correctly refused because disposable Supabase commands are restricted to a GitHub-hosted Linux runner; no shared environment was touched.

**Remaining:** Run the disposable database reset/pgTAP contract in GitHub-hosted Linux, freeze the reviewable candidate SHA and sanitized commit-specific evidence report, and obtain Ahmed's ordinary completion checkpoint against that exact evidence. No live provider, deployment, release, protected gate, or shared environment was changed.

**Next safe action:** Commit the WP03-T02 diff on the current branch while retaining the existing `cc223fc` finalize-skill commit, as Ahmed explicitly instructed, then open the pull request and let the required application, dependency, and disposable-database checks run.

**Reviewer action:** Ahmed completed the full manual checklist, requested only the removal of catalog search from the access flow, confirmed the corrected search-free working tree, and authorized reviewable-candidate preparation on 2026-09-13. Ahmed still inspects the later candidate-SHA evidence before recording the ordinary WP03-T02 completion checkpoint.
