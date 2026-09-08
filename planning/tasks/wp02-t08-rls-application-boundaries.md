# Task record: WP02-T08 RLS application boundaries

**Task ID:** WP02-T08

**Status:** [~]

**Outcome:** Every application data path preserves caller-scoped RLS, while privileged Auth operations are isolated, durably audited, and unable to leak service credentials into student or browser code.

**Owner:** Codex `/root`; Ahmed is the named requester and signed-in operator authorizer in this chat

**Reviewer:** Ahmed + Ziad for the protected RLS/grant candidate and its Preview promotion, under the standing authorization recorded in the initiating request

**Branch:** `wp02/rls-application-boundaries`

**Updated (UTC):** 2026-09-08T12:16:28Z

## Execution contract

**Dependencies:** WP02-T07 and its prior migration/authorization chain are merged and production-closed on `main` at `957223ed725a91a17d1e3e9cdbe1a3446c1fff18`; exact T07 evidence is `evidence/wp02-database/2026-09-08_transactional-jobs-usage_github_576f1d6.md`.

**Inputs:** Runbook WP02-T08; master-plan sections 8.3-8.4 and 11; ADR-0002; Next.js 16.3.1 server/data-security guidance; Supabase publishable/service client seams; Auth expiry/refresh configuration; existing grants, RLS, audit events, synthetic fixture, and disposable Auth/database harness; open D-18 mock-only storage boundary.

**Files:** Caller-scoped student DAL; server-only privileged Auth module; forward migration for a narrow service-only audit RPC; focused application, security, pgTAP, Auth/session, Storage-denial, view-safety, and generated-type proofs; session-revocation policy; synchronized runbook/task/evidence records.

**Verify:** Focused unit/security/integration tests; `corepack pnpm check:sql`; complete disposable `db:ci:upgrade`, two `db:ci:reset` runs, migrations, pgTAP, advisors, generated types/parity, and Auth/database integration in GitHub CI; `corepack pnpm verify`; Preview forward migration validation; Vercel preview/production deploy and six-check smoke; real browser/runtime-log checks; full diff, secret, scope, and cleanup review.

**Pass:** Student reads use the publishable-key authenticated session and cannot accept a caller ID or service client; the raw service client exists only in one `server-only` module whose marker-protected Auth mutations emit immutable audit events; every exposed view is `security_invoker`; authenticated Storage signed-upload and upsert paths remain denied while D-18 is open; deletion/revocation prevents refresh immediately, removes database access immediately, and permits already-issued JWT verification only until the configured one-hour expiry.

**Evidence:** Expected at `evidence/wp02-database/2026-09-08_rls-application-boundaries_github_<short-sha>.md` after an exact reviewed candidate exists.

**Rollback:** Before shared promotion, revert the unshared migration and application/tests. After Preview promotion, disable privileged callers, revert the application, and apply a reviewed forward migration that revokes the audit RPC; never rewrite the applied migration or reset Preview/Beta.

**Hard stop:** Do not select or enable a real object-storage provider, upload private material, create production storage buckets, mutate Beta, reset Preview/Beta, enable paid providers or nonzero budgets, publish/unlock content, delete raw data, or weaken grants/RLS. The exact RLS/grant candidate and Preview promotion require the separately named Ahmed and Ziad confirmations already supplied in the initiating request.

## Steps

- [x] Establish the authoritative task contract and current GitHub, Supabase Preview, Vercel, branch, migration, client, Auth, Storage, and production state.
- [~] Add failing public-seam and architecture tests, then implement the smallest caller-scoped and audited privileged boundaries.
- [ ] Run focused and complete local/disposable checks, regenerate types, and resolve every finding.
- [ ] Review the exact diff, freeze evidence, complete PR/check/review/merge delivery, and verify merged `main`.
- [ ] Promote the forward migration to synthetic Preview, deploy the exact reviewed build to Vercel Production, production-smoke the GitHub→Supabase→Vercel path, and remove task-specific branches/PR leftovers.

## Handoff

**Changed:** Task claimed after live-state inspection; implementation not yet complete.

**Commands:** `git fetch --prune origin`; `scripts/show-work-state.ps1`; repository/client/migration/test inspection; authenticated GitHub Actions, Supabase Preview, and Vercel inventory. Current `main` CI run `34217210999` is green; Supabase Preview is healthy at migration `transactional_jobs_usage_state_machines` with no Storage activity/advisor issues; Vercel Production currently serves T07 candidate `576f1d6` at `project-xwrez.vercel.app`.

**Remaining:** Implementation, verification, protected exact-candidate review, merge, Preview promotion, production deploy/smoke, evidence, and cleanup.

**Next safe action:** Add focused failing tests for caller-scoped reads, privileged-client containment/audit, view safety, Storage denial, and Auth deletion/revocation semantics.

**Reviewer action:** Ahmed and Ziad have supplied standing authorization; freeze their protected approval against the exact candidate only after the final diff and checks are complete.
