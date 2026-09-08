# Task record: WP02-T08 RLS application boundaries

**Task ID:** WP02-T08

**Status:** [x]

**Outcome:** Every application data path preserves caller-scoped RLS, while privileged Auth operations are isolated, durably audited, and unable to leak service credentials into student or browser code.

**Owner:** Codex `/root`; Ahmed is the named requester and signed-in operator authorizer in this chat

**Reviewer:** Ahmed + Ziad for the protected RLS/grant candidate and its Preview promotion, under the standing authorization recorded in the initiating request

**Branch:** implementation merged from `wp02/rls-application-boundaries`; final state `main`

**Updated (UTC):** 2026-09-08T16:19:15Z

## Execution contract

**Dependencies:** WP02-T07 and its prior migration/authorization chain are merged and production-closed on `main` at `957223ed725a91a17d1e3e9cdbe1a3446c1fff18`; exact T07 evidence is `evidence/wp02-database/2026-09-08_transactional-jobs-usage_github_576f1d6.md`.

**Inputs:** Runbook WP02-T08; master-plan sections 8.3-8.4 and 11; ADR-0002; Next.js 16.3.1 server/data-security guidance; Supabase publishable/service client seams; Auth expiry/refresh configuration; existing grants, RLS, audit events, synthetic fixture, and disposable Auth/database harness; open D-18 mock-only storage boundary.

**Files:** Caller-scoped student DAL; server-only privileged Auth module; forward migration for a narrow service-only audit RPC; focused application, security, pgTAP, Auth/session, Storage-denial, view-safety, and generated-type proofs; session-revocation policy; synchronized runbook/task/evidence records.

**Verify:** Focused unit/security/integration tests; `corepack pnpm check:sql`; complete disposable `db:ci:upgrade`, two `db:ci:reset` runs, migrations, pgTAP, advisors, generated types/parity, and Auth/database integration in GitHub CI; `corepack pnpm verify`; Preview forward migration validation; Vercel preview/production deploy and six-check smoke; real browser/runtime-log checks; full diff, secret, scope, and cleanup review.

**Pass:** Student reads use the publishable-key authenticated session and cannot accept a caller ID or service client; the raw service client exists only in one `server-only` module whose marker-protected Auth mutations emit immutable audit events; every exposed view is `security_invoker`; authenticated Storage signed-upload and upsert paths remain denied while D-18 is open; deletion/revocation prevents refresh immediately, removes database access immediately, and permits already-issued JWT verification only until the configured one-hour expiry.

**Evidence:** `evidence/wp02-database/2026-09-08_rls-application-boundaries_github_b624426.md`; exact implementation candidate `b624426ca5c30e7a8dd28f1676abd4e24beab9ba`; implementation merge `f015d3a68ec9ce74b05f01c8c6ff80dd5bba49e4`.

**Rollback:** Before shared promotion, revert the unshared migration and application/tests. After Preview promotion, disable privileged callers, revert the application, and apply a reviewed forward migration that revokes the audit RPC; never rewrite the applied migration or reset Preview/Beta.

**Hard stop:** Do not select or enable a real object-storage provider, upload private material, create production storage buckets, mutate Beta, reset Preview/Beta, enable paid providers or nonzero budgets, publish/unlock content, delete raw data, or weaken grants/RLS. The exact RLS/grant candidate and Preview promotion require the separately named Ahmed and Ziad confirmations already supplied in the initiating request.

## Steps

- [x] Establish the authoritative task contract and current GitHub, Supabase Preview, Vercel, branch, migration, client, Auth, Storage, and production state.
- [x] Add failing public-seam and architecture tests, then implement the smallest caller-scoped and audited privileged boundaries.
- [x] Run focused and complete local/disposable checks, regenerate types, and resolve every finding.
- [x] Review the exact diff, freeze evidence, complete PR/check/review/merge delivery, and verify merged `main`.
- [x] Promote the forward migration to synthetic Preview, deploy the exact reviewed build to Vercel Production, production-smoke the GitHub→Supabase→Vercel path, and remove task-specific branches/PR leftovers.

## Handoff

**Changed:** Student reads now use the authenticated publishable-key client; the raw service client is confined to one server-only synthetic Auth module with durable STARTED/terminal audit events; exposed-view, Storage-denial, and one-hour revocation contracts are executable. PR `#22` was approved at exact `b624426`, merged as `f015d3a`, promoted through Supabase migration `20260908122500`, and deployed to Vercel Production as `dpl_9qZPCzBoTUE2iCokboUCHPU8uFkc`.

**Commands:** Focused red/green unit/security checks; `corepack pnpm verify`; GitHub runs `34246359346` and `34247852416`; guarded Supabase Preview migration/invariant queries; rollback-only privileged-audit smoke; advisor inspection; Vercel environment, exact-Git metadata, promotion, six-check public smoke, browser, and deployment-log inspection; final diff/secret/scope checks.

**Remaining:** None for WP02-T08. D-18 intentionally keeps real Storage unselected and fail-closed; later authorized provider work must add and separately test object policies before uploads are enabled.

**Next safe action:** Continue with WP02-T09 using the merged T08 boundaries and evidence.

**Reviewer action:** Complete. Repository owner review `5144013891` approved exact candidate `b624426`; Ahmed and Ziad's standing authorization covered the protected Preview promotion. No Beta, raw deletion, rights, budget, or release/unlock action occurred.
