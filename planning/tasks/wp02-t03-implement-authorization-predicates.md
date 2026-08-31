# Task record: WP02-T03 implement authorization predicates

**Task ID:** WP02-T03

**Status:** [~]

**Outcome:** Authenticated database callers use four stable, caller-scoped authorization predicates backed by authoritative database rows, and affected RLS policies apply the same immediately revocable role, membership, campaign-assignment, and curriculum-unit rules.

**Owner:** Codex `/root`; authenticated service actions may use the shared founder service identity but are recorded as Ahmed-authorized in this chat

**Reviewer:** Ahmed + Ziad — protected RLS gate; separate named confirmations are required for the exact reviewed commit before hosted promotion or closure

**Branch:** `wp02/reusable-authorization-predicates`

**Updated (UTC):** 2026-08-31

## Execution contract

**Dependencies:** Reviewed WP02-T02 production closure at `evidence/wp02-database/2026-08-31_production-validation_preview_dfae84b.md`; accepted ADR-0002; reviewed WP01-T11 foundation gate; the WP01 foundation bridge. Open real-data, provider, retention, budget, queue-host, release, and beta decisions retain their exact consumer blocks.

**Inputs:** Runbook WP02-T03 and work-package 2 outcome; master-plan authorization and protected-gate rules; `CONTEXT.md`; ADR-0002; existing row-15 RLS/grant contract; synthetic WP02 fixtures only.

**Files:** One CLI-generated forward migration; one focused pgTAP authorization/security proof; deterministic generated public types if changed; runbook state; this task record; sanitized evidence under `evidence/wp02-database/`.

**Verify:** `pnpm check:sql`; focused disposable pgTAP suite through `pnpm db:ci:test`; clean reset twice; populated synthetic upgrade retention; `pnpm db:ci:types` and `pnpm db:types:check`; database advisors; applicable integration/security suites; `pnpm verify`; agent-readiness and isolated handoff checks; `git diff --check`; full diff, secret, architecture, and scope review; GitHub CI; protected hosted migration dry-run/push and deployment smoke only after both named founder confirmations for the exact reviewed commit.

**Pass:** The four predicates are stable security-invoker functions with an empty search path and authenticated-only execution; they use `auth.uid()` plus authoritative tables rather than role claims; affected policies preserve least privilege and immediate revocation; every update policy has `USING`, `WITH CHECK`, and SELECT visibility; stale JWT app metadata cannot grant or retain access.

**Evidence:** `evidence/wp02-database/2026-09-01_authorization-predicates_<environment>_<short-sha>.md`

**Rollback:** Do not edit applied migration history or migrate a shared database backward. Before hosted promotion, revert the application/test/docs slice normally. After promotion, keep the consuming capability disabled and apply a narrowly scoped reviewed forward-repair migration; move the Vercel alias only if an application regression also exists.

**Hard stop:** Do not promote the RLS/grant migration, merge the protected gate, or claim closure without separate named Ahmed and Ziad confirmations for the exact reviewed commit. Do not reset Preview/Beta, weaken grants/RLS, activate real data, release/unlock, raw deletion, paid providers, or beta access.

## Steps

- [~] Implement the four predicates and refactor only the affected RLS policies to consume them.
- [ ] Prove function metadata, grants, positive/negative authorization, stale-claim revocation, policy behavior, and update-policy completeness in the disposable database.
- [ ] Run generated-type, advisor, application, security, build, and full repository verification.
- [ ] Review the complete change, record sanitized evidence, obtain the protected review, merge, promote, validate production, and clean task artifacts.

## Handoff

**Changed:** Task claimed; forward migration and focused security proof in progress.

**Commands:** Baseline repository, GitHub, Supabase Preview, and Vercel Production inspections completed; implementation verification not yet run.

**Remaining:** Migration, focused tests, full verification, protected confirmations, PR/CI, hosted promotion, merge, production verification, and cleanup.

**Next safe action:** Complete the forward migration and focused pgTAP proof without touching hosted state.

**Reviewer action:** Ahmed and Ziad must separately confirm the exact reviewed commit before the protected RLS gate can be promoted or closed.
