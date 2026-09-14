# Task record: WP03-T02 auth and consent flows

**Task ID:** WP03-T02

**Status:** [x]

**Outcome:** Students can complete localized email/password authentication, recovery, session exit, and current consent acceptance through safe server-controlled flows without an admin workaround.

**Owner:** Codex `/root`; Ahmed is the requester and named human checkpoint

**Reviewer:** Ahmed for the ordinary WP03-T02 completion checkpoint

**Branch:** `wp03/auth-consent-flows` (merged by PR `#29`); release evidence follow-up `wp03/auth-consent-release-evidence`

**Updated (UTC):** 2026-09-13T21:20:53Z

## Execution contract

**Dependencies:** Reviewed WP02-T09 database gate at `evidence/wp02-database/2026-09-09_database-gate_github_dd9ece4.md`; completed WP03-T01 visual/localization foundation and production evidence under `evidence/wp03-product-shell/`; approved auth-session revocation baseline at `docs/policies/auth-session-revocation.md`.

**Inputs:** Runbook WP03-T02 and sections 6.0-6.7; master-plan student journey, application architecture, identity schema, and authorization rules; `CONTEXT.md`; `DESIGN.md`; current Supabase Auth/session seams; synthetic Auth fixtures only.

**Files:** Auth domain, application, caller-scoped Supabase, and consent-access helpers under `src/lib/auth/`; localized auth, callback, consent, protected learning, and synthetic-preview routes under `src/app/`; `src/lib/i18n/auth-copy.ts`; the verified-profile activation migration and pgTAP contract; focused unit, application, security, and Playwright coverage; the approved Access Shelf artifacts and reconciled `DESIGN.md`; this task record and later sanitized evidence under `evidence/wp03-product-shell/`.

**Verify:** Focused auth/consent unit, integration, security, and Playwright tests; project-pinned Playwright CLI rendered inspection; one Impeccable detector pass and finish review after UI completion; `corepack pnpm verify`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; `git diff --check`; `git diff --stat`; full diff and secret/scope scan.

**Pass:** New, verified, unverified, suspended, revoked-session, stale-cookie, expired/replayed recovery-link, outdated-consent, rate-limited, and forged-return-path states fail or advance safely; current terms, privacy, and educational-boundary acceptance gates learning routes; localized accessible forms prevent account discovery, duplicate submission, and open redirects; browser payloads contain no auth secrets or private membership state.

**Evidence:** Candidate report `evidence/wp03-product-shell/2026-09-13_auth-consent_preview_2777eb2.md`; protected release report `evidence/wp03-product-shell/2026-09-14_auth-consent-release_production_fd3b093.md`.

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

**Commands:** The post-search-correction `corepack pnpm verify` passed the zero-cost full suite and was repeated successfully on the release-evidence branch. GitHub Actions exact-head run `34779319502` passed `dependency-audit`, `application`, and `database-ci`; its disposable Supabase/Auth stack applied and tested the migration, removed the temporary stack and volumes, and uploaded sanitized reports without touching a shared environment. PR `#29` received the required approval from `aboayman-oss` and was merged by `unimind989-sys` as `fd3b0936cd9a9472dd50af26fc99bfcde1f1c6e6`; merged-main run `34781885493` passed `application` and `database-ci`. The four delivery commits remain ancestors of the merge commit. The guarded Preview Supabase transaction advanced the ledger from `20260908122500` to `20260913063500`, installed the verified-profile function/trigger with denied public/anon/authenticated execution, and passed rollback-only hosted behavior probes, metadata checks, cleanup checks, and zero-error/zero-warning advisor scans. Vercel deployment `dpl_2JoV9xgDnxWoPpCVf6XrkfyHPSCN` is Ready in Production and serves `wp03-t02-fd3b093-preview` at `https://project-xwrez.vercel.app`. Public deployment smoke passed 7 checks; fresh English, Arabic, and unauthenticated `/learn` browser checks passed localization, direction, access-gate, search-removal, and overflow assertions; deployment-scoped error and warning scans returned no logs.

**Remaining:** None for WP03-T02. The environment remains synthetic-only, mock-only, provider-disabled, and zero-budget.

**Next safe action:** Start WP03-T03 from the reviewed `main` branch and its runbook contract.

**Reviewer action:** Ahmed completed the full manual checklist, requested only removal of catalog search from the access flow, confirmed the corrected search-free working tree, and invoked `$finalize` on 2026-09-13. `aboayman-oss` approved the exact PR head and `unimind989-sys` merged it. Ahmed separately named both Ahmed's and Ziad's confirmation for the exact corrected T02 release action; D-22 permits the relayed named confirmation. Both founders therefore approved the protected Supabase migration and production promotion recorded in the release report.
