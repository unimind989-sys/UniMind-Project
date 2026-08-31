# Task record: WP02-T02 create reviewable migrations

**Task ID:** WP02-T02

**Status:** [~]

**Outcome:** A clean PostgreSQL database can recreate the complete dependency-ordered UniMind domain schema from 15 reviewable migrations, with one focused synthetic database proof per slice, deterministic generated types, retained populated fixtures, advisor review, and an explicit forward-repair plan.

**Owner:** Codex `/root`; authenticated service actions may use the shared founder service identity but are recorded as Ahmed-authorized in this chat

**Reviewer:** Ahmed — ordinary task completion and service-operation authority granted in chat on 2026-08-31; protected RLS, rights, raw-deletion, budget, release/unlock, and beta-go-live gate approvals remain excluded

**Branch:** `wp02/reviewable-migrations`

**Updated (UTC):** 2026-08-31

## Execution contract

**Dependencies:** Reviewed WP02-T01 `PASS` evidence at `evidence/wp02-database/2026-08-31_database-conventions_local_de4ad49.md`; accepted ADR-0002; reviewed WP01-T11 foundation gate; the WP01 foundation bridge; open real-data, provider, rights, retention, budget, queue-host, and release decisions retain their exact consumer blocks.

**Inputs:** Runbook WP02-T02 and sections 5.1–5.9; master-plan sections 8.1–8.9; `CONTEXT.md`; ADR-0002; the database migration checklist; the existing applied `extensions_and_schemas` foundation migration; synthetic fixtures and deterministic mock configuration only.

**Files:** The existing row-01 migration; 14 new generated SQL migrations for rows 02–15; focused database contract tests under `supabase/tests/`; synthetic upgrade fixtures and test orchestration under `supabase/fixtures/` and `scripts/`; generated `src/types/database.generated.ts`; migration/operation documentation; WP02-T02 runbook state; this task record; sanitized evidence under `evidence/wp02-database/`.

**Verify:** Per-slice database tests; `pnpm check:sql`; disposable clean reset twice; populated synthetic upgrade with retained-row/evidence assertions; `pnpm db:ci:types` and `pnpm db:types:check`; pinned database advisors; applicable integration/security suites; `pnpm verify`; agent-readiness and isolated handoff checks; `git diff --check`; full diff, secret, architecture, and scope review; GitHub CI; authorized hosted migration dry-runs/pushes and deployment smoke only where environment policy permits.

**Pass:** Every ordered slice proves the runbook invariant before the next slice; the schema recreates from empty and upgrades retained synthetic data without loss; generated public types are deterministic; no broad grant, unsafe definer, accidental Data API exposure, unresolved advisor warning, secret, real/private data, paid call, or dashboard-only schema state remains.

**Evidence:** `evidence/wp02-database/2026-08-31_reviewable-migrations_<environment>_<short-sha>.md`

**Rollback:** Do not edit applied migration history or migrate a shared database backward. Disable any affected capability and apply a narrowly scoped forward repair migration; revert application/docs/test orchestration only when it does not erase durable database history.

**Hard stop:** Do not encode unresolved provider dimensions or retention periods as production choices; activate real rights/raw deletion, paid providers, release/unlock, or beta data; reset Preview/Beta; expose private schemas; weaken grants/RLS; or claim any protected gate without separate named Ahmed and Ziad confirmations.

## Steps

- [~] Inventory and design all 15 slices against the authoritative table/function contracts and current applied migration history.
- [ ] Generate and implement each remaining migration in dependency order with a focused synthetic database test.
- [ ] Prove clean resets, populated upgrade retention, deterministic types, advisors, and complete zero-cost verification.
- [ ] Review security, maintainability, compatibility, migration safety, secrets, and accidental scope; fix all findings.
- [ ] Record sanitized evidence, close the ordinary Ahmed checkpoint, merge to `main`, validate authorized hosted targets and deployment flow, and clean task branches/artifacts.

## Handoff

**Changed:** Claimed WP02-T02 and recorded its full execution, verification, external-state, rollback, and protected-gate boundaries.

**Commands:** Initial repository, runbook, branch, GitHub, Supabase/Vercel access, configuration, and work-state inventory completed; implementation checks not yet run.

**Remaining:** All implementation, database verification, review, evidence, merge, hosted validation, deployment validation, and cleanup steps.

**Next safe action:** Design the concrete object graph and test harness, then generate the row-02 through row-15 migration files with the pinned CLI without rewriting the existing applied row-01 migration.

**Reviewer action:** Pending ordinary evidence review under Ahmed's standing completion authority; protected gates remain explicitly out of scope.
