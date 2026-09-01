# Task record: WP02-T03 implement authorization predicates

**Task ID:** WP02-T03

**Status:** [~]

**Outcome:** Authenticated database callers use four stable, caller-scoped authorization predicates backed by authoritative database rows, and affected RLS policies apply the same immediately revocable role, membership, campaign-assignment, and curriculum-unit rules.

**Owner:** Codex `/root`; authenticated service actions may use the shared founder service identity but are recorded as Ahmed-authorized in this chat

**Reviewer:** Ahmed + Ziad — protected RLS gate confirmed separately in the task chat for exact reviewed commit `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f` on 2026-09-01 UTC

**Branch:** `wp02/reusable-authorization-predicates`

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
- [~] Promote the guarded migration, merge, validate production, and clean task artifacts.

## Handoff

**Changed:** Added the forward authorization migration, four stable caller-scoped predicates, focused RLS policy reuse, a 34-assertion pgTAP security proof, and deterministic generated public types.

**Commands:** `corepack pnpm verify` passed; final PR-head GitHub Actions run `33460679200` passed dependency-audit, application, and disposable database jobs; populated upgrade, two resets, 17 pgTAP files, advisors, type parity, Auth integration, and security passed; protected Vercel Preview passed endpoint, browser, and error-log checks; Supabase Preview atomically applied migration `20260831220554`, then passed ledger, helper metadata, grant, policy-reuse, caller-denial, and refreshed advisor checks.

**Remaining:** PR merge; main CI and production deployment; end-to-end production validation; closure evidence and task-branch cleanup.

**Next safe action:** Merge the approved and green PR at its unchanged head, wait for main CI and production deployment, then validate the final hosted flow before closure and cleanup.

**Reviewer action:** SATISFIED — Ahmed confirmed `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f`; Ziad separately confirmed `f7e0f3d8c7920e987ddffa9bd1f44c1edaec716f` in the task chat on 2026-09-01 UTC.
