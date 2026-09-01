# Task record: WP02-T03 implement authorization predicates

**Task ID:** WP02-T03

**Status:** [x]

**Outcome:** Authenticated database callers use four stable, caller-scoped authorization predicates backed by authoritative database rows, and affected RLS policies apply the same immediately revocable role, membership, campaign-assignment, and curriculum-unit rules.

**Owner:** Codex `/root`; authenticated service actions may use the shared founder service identity but are recorded as Ahmed-authorized in this chat

**Reviewer:** Ahmed + Ziad — protected RLS gate confirmed separately in the task chat for exact reviewed commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f` on 2026-09-01 UTC

**Branch:** `wp02/reusable-authorization-predicates` (merged and deleted after closure)

**Updated (UTC):** 2026-09-01

## Execution contract

**Dependencies:** Reviewed WP02-T02 production closure at `evidence/wp02-database/2026-08-31_production-validation_preview_dfae84b.md`; accepted ADR-0002; reviewed WP01-T11 foundation gate; the WP01 foundation bridge. Open real-data, provider, retention, budget, queue-host, release, and beta decisions retain their exact consumer blocks.

**Inputs:** Runbook WP02-T03 and work-package 2 outcome; master-plan authorization and protected-gate rules; `CONTEXT.md`; ADR-0002; existing row-15 RLS/grant contract; synthetic WP02 fixtures only.

**Files:** One CLI-generated forward migration; one focused pgTAP authorization/security proof; deterministic generated public types if changed; runbook state; this task record; sanitized evidence under `evidence/wp02-database/`.

**Verify:** `pnpm check:sql`; focused disposable pgTAP suite through `pnpm db:ci:test`; clean reset twice; populated synthetic upgrade retention; `pnpm db:ci:types` and `pnpm db:types:check`; database advisors; applicable integration/security suites; `pnpm verify`; agent-readiness and isolated handoff checks; `git diff --check`; full diff, secret, architecture, and scope review; GitHub CI; protected hosted migration dry-run/push and deployment smoke only after both named founder confirmations for the exact reviewed commit.

**Pass:** The four predicates are stable security-invoker functions with an empty search path and authenticated-only execution; they use `auth.uid()` plus authoritative tables rather than role claims; affected policies preserve least privilege and immediate revocation; every update policy has `USING`, `WITH CHECK`, and SELECT visibility; stale JWT app metadata cannot grant or retain access.

**Evidence:** `evidence/wp02-database/2026-09-01_authorization-predicates_github_f7e0f3d.md`

**Rollback:** Do not edit applied migration history or migrate a shared database backward. Before hosted promotion, revert the application/test/docs slice normally. After promotion, keep the consuming capability disabled and apply a narrowly scoped reviewed forward-repair migration; move the Vercel alias only if an application regression also exists.

**Hard stop:** Do not promote the RLS/grant migration, merge the protected gate, or claim closure without separate named Ahmed and Ziad confirmations for the exact reviewed commit. Do not reset Preview/Beta, weaken grants/RLS, activate real data, release/unlock, raw deletion, paid providers, or beta access.

## Steps

- [x] Implement the four predicates and refactor only the affected RLS policies to consume them.
- [x] Prove function metadata, grants, positive/negative authorization, stale-claim revocation, policy behavior, and update-policy completeness in the disposable database.
- [x] Run generated-type, advisor, application, security, build, and full repository verification.
- [x] Obtain separate named Ahmed and Ziad confirmations for exact commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f`.
- [x] Promote the guarded migration, merge, validate production, and clean task artifacts.

## Handoff

**Changed:** Added the forward authorization migration, four stable caller-scoped predicates, focused RLS policy reuse, a 34-assertion pgTAP security proof, and deterministic generated public types.

**Commands:** `corepack pnpm verify` passed; approved final PR-head run `33461447713` and merged-main run `33461971714` passed every applicable job; populated upgrade, two resets, 17 pgTAP files, advisors, type parity, Auth integration, and security passed; Supabase Preview atomically applied migration `20260831220554`, then passed ledger, helper metadata, grants, policy reuse, caller denial, and refreshed advisor checks; Vercel Production deployment `dpl_6xYZD9ocbQMg7WCJgvmEuV8nBbZb` records exact merge SHA `5334fcaf6b99e93235a31a6edd8015f688f069f1`, is READY on the production alias, returns healthy live/ready responses, renders synthetic/mock-only state, rejects anonymous database access, and has no error-level runtime logs.

**Remaining:** No WP02-T03 implementation, review, migration, deployment, validation, or cleanup work. WP02-T04 and later capabilities remain unopened and retain their own protected prerequisites.

**Next safe action:** Begin WP02-T04 from the merged authorization-helper contract. Keep the existing synthetic-only, mock-only, zero-budget environment and all later protected gates intact.

**Reviewer action:** Closed. Ahmed confirmed `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f`; Ziad separately confirmed the same exact commit; the PR then received a formal GitHub approval, merged unchanged, and passed main and production validation.
