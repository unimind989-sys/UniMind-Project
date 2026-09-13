# Task record: WP03-T02 auth and consent flows

**Task ID:** WP03-T02

**Status:** [~]

**Outcome:** Students can complete localized email/password authentication, recovery, session exit, and current consent acceptance through safe server-controlled flows without an admin workaround.

**Owner:** Codex `/root`; Ahmed is the requester and named human checkpoint

**Reviewer:** Ahmed for the ordinary WP03-T02 completion checkpoint

**Branch:** `wp03/auth-consent-flows`

**Updated (UTC):** 2026-09-13T19:56:52Z

## Execution contract

**Dependencies:** Reviewed WP02-T09 database gate at `evidence/wp02-database/2026-09-09_database-gate_github_dd9ece4.md`; completed WP03-T01 visual/localization foundation and production evidence under `evidence/wp03-product-shell/`; approved auth-session revocation baseline at `docs/policies/auth-session-revocation.md`.

**Inputs:** Runbook WP03-T02 and sections 6.0-6.7; master-plan student journey, application architecture, identity schema, and authorization rules; `CONTEXT.md`; `DESIGN.md`; current Supabase Auth/session seams; synthetic Auth fixtures only.

**Files:** Auth domain, application, caller-scoped Supabase, and consent-access helpers under `src/lib/auth/`; localized auth, callback, consent, protected learning, and synthetic-preview routes under `src/app/`; `src/lib/i18n/auth-copy.ts`; the verified-profile activation migration and pgTAP contract; focused unit, application, security, and Playwright coverage; the approved Access Shelf artifacts and reconciled `DESIGN.md`; this task record and later sanitized evidence under `evidence/wp03-product-shell/`.

**Verify:** Focused auth/consent unit, integration, security, and Playwright tests; project-pinned Playwright CLI rendered inspection; one Impeccable detector pass and finish review after UI completion; `corepack pnpm verify`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; `git diff --check`; `git diff --stat`; full diff and secret/scope scan.

**Pass:** New, verified, unverified, suspended, revoked-session, stale-cookie, expired/replayed recovery-link, outdated-consent, rate-limited, and forged-return-path states fail or advance safely; current terms, privacy, and educational-boundary acceptance gates learning routes; localized accessible forms prevent account discovery, duplicate submission, and open redirects; browser payloads contain no auth secrets or private membership state.

**Evidence:** Candidate report `evidence/wp03-product-shell/2026-09-13_auth-consent_preview_2777eb2.md`; later protected production-release evidence remains separate.

**Rollback:** Remove the WP03-T02 routes, helpers, tests, and forward-only schema additions before review; after delivery, revert the task commit while retaining WP03-T01. Do not rewrite or destructively roll back an applied migration.

**Hard stop:** Do not use real student accounts or private data; expose service-role credentials; trust client metadata, query parameters, or `getSession()` as authorization; reveal account existence; enable a live provider or paid call; weaken RLS/grants; promote, release, unlock, or perform any protected transition without its required confirmations.

## Steps

- [x] Establish failing public-seam contracts for redirect safety, generic errors, auth state transitions, consent gating, and localized accessible form behavior.
- [x] Implement the smallest server-controlled Supabase Auth and current-consent application seams needed by those contracts.
- [x] Build the complete English/Arabic auth and consent routes in the approved Study Shelf visual system.
- [x] Exercise the required user, recovery, session, consent, responsive, accessibility, and browser-payload states with synthetic fixtures.
- [x] Complete bounded rendered inspection, the one Impeccable detector pass, independent finish review, and full zero-cost verification.
- [x] Assemble sanitized evidence and obtain Ahmed's ordinary completion checkpoint. Ahmed's manual checklist passed after the search correction, and his explicit `$finalize` invocation records the ordinary task approval.

## Handoff

**Changed:** Implemented server-controlled login, registration, verification/resend, recovery/reset, logout, current-consent gating, canonical callback redirects, and protected learning access. Added a forward-only verified-profile activation trigger, caller-scoped consent reads, generic public failures, English/Arabic accessible forms, the Ahmed-approved Access Shelf composition, synthetic public preview, and focused unit/application/security/browser coverage. Ahmed completed the full manual checklist with one correction: catalog search does not belong in authentication or consent. Search was removed from every access route, the locale control was retained, and the surface/design records now state that search begins only after authorized shelf entry. During `$finalize`, the first Vercel branch preview exposed a missing deployment binding for `APP_ORIGIN`; explicit configured origins remain authoritative, while Vercel deployments now derive the canonical HTTPS origin from Vercel's server-owned production, branch, or deployment URL variables.

**Commands:** The post-search-correction `corepack pnpm verify` passed the zero-cost full suite. GitHub Actions run `34767111323` passed `dependency-audit`, `application`, and `database-ci`; its disposable Supabase/Auth stack applied and tested the migration, removed the temporary stack and volumes, and uploaded sanitized reports without touching a shared environment. The first Vercel branch preview `BsqM2y2SzvtqSx1kE48hd1a4icqo` then failed safely at build time because `APP_ORIGIN` was absent. The bounded deployment fix passed 14 focused environment tests, strict typecheck, full lint, and a fresh `corepack pnpm verify`: formatting, lint, strict typing, boundaries, SQL conventions, CI policy, secret scan, 297 unit tests, 15 mock integration tests with 2 hosted tests skipped by contract, 22 security tests, 3 evaluation cases, 5 load-contract checks, 12 Playwright tests, a production build, and client-artifact secret scanning. Project-pinned Playwright CLI inspection produced valid desktop and mobile English/Arabic captures with zero console errors. The one Impeccable detector pass completed; the original independent finish reviewer scored all eight requested fixes resolved and returned `ship`. Raster provenance reports 12 decision rasters and 0 missing prompts. `scripts/verify-agent-readiness.ps1` passed 168 names, 46 local links, 22 synchronized decisions, and 102 task contracts; `scripts/test-agent-handoff.ps1` passed its isolated rehearsal. A fresh full Impeccable reviewer found no material fixes and returned `disposition: ship`. Local `pnpm test:integration:database` correctly refused because disposable Supabase commands are restricted to a GitHub-hosted Linux runner; no shared environment was touched.

**Remaining:** Commit and push the sanitized candidate report, obtain green checks for the documentation head, satisfy the protected-main cross-account review rule, and merge. The migration has been exercised only in disposable CI; no shared Supabase environment, live provider, release, or protected gate has been changed.

**Next safe action:** Commit and push the candidate evidence on PR `#29`, wait for its exact-head checks, then record the required formal approval from the non-author GitHub account and merge the reviewed candidate.

**Reviewer action:** Ahmed completed the full manual checklist, requested only the removal of catalog search from the access flow, confirmed the corrected search-free working tree, and invoked `$finalize` on 2026-09-13, recording the ordinary WP03-T02 completion approval. Protected-main approval still comes from the non-author GitHub account; protected production release remains a separate Ahmed-and-Ziad gate.
