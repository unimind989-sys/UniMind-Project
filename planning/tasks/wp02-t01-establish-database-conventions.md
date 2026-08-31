# Task record: WP02-T01 establish database conventions

**Task ID:** WP02-T01

**Status:** [~]

**Outcome:** Every versioned SQL migration is governed by one accepted database-boundary decision, a repeatable review checklist, and automated convention checks in the zero-cost verification gate.

**Owner:** Codex `/root`

**Reviewer:** Ahmed — ordinary human checkpoint authorized in chat on 2026-08-31; no protected gate is included

**Branch:** `wp02/database-conventions`

**Updated (UTC):** 2026-08-31

## Execution contract

**Dependencies:** Reviewed WP01-T11 `PASS` evidence and the WP01 foundation bridge; open real-data, provider, rights, retention, budget, and release decisions retain their exact blocks.

**Inputs:** Runbook WP02-T01; master-plan database and authorization rules; `CONTEXT.md`; ADR-0001; the existing synthetic foundation migration; package verification contract.

**Files:** `README.md`, `CONTRIBUTING.md`, `docs/adr/0002-database-boundaries.md`, `docs/adr/README.md`, `docs/runbooks/database-migration-checklist.md`, `supabase/migrations/README.md`, `scripts/check-sql-conventions.ts`, `scripts/lib/sql-conventions.ts`, `tests/unit/sql-conventions.test.ts`, `package.json`, the WP02-T01 runbook state, this task record, and sanitized evidence under `evidence/wp02-database/`.

**Verify:** Focused SQL-convention unit tests; `pnpm check:sql`; `pnpm verify`; agent-readiness and isolated handoff checks; `git diff --check`; full diff, secret, and scope review.

**Pass:** The current migration set passes; unsafe fixture migrations fail with stable violations; the ADR and checklist cover schema exposure, RLS/grants, identifiers, UTC timestamps, constraints, indexing, soft deactivation, append-only evidence, and forward-only repair.

**Evidence:** `evidence/wp02-database/2026-08-31_database-conventions_local_<short-sha>.md`

**Rollback:** Revert the documentation, checker, test, and package-script changes. No shared database, deployment, provider, or external state is changed.

**Hard stop:** Do not create application-domain migrations, use real/private data, contact paid providers, alter Preview/Beta, weaken explicit grants or RLS, approve a protected gate, or encode an unresolved product/provider choice as a database default.

## Steps

- [~] Confirm the task boundaries and record the accepted database convention trade-offs.
- [ ] Write the database-boundary ADR and forward-migration review checklist.
- [ ] Add failing convention cases, implement the SQL checker, and integrate it into `pnpm verify`.
- [ ] Run focused and complete zero-cost verification plus repository handoff checks.
- [ ] Record sanitized evidence and close the ordinary human checkpoint.

## Handoff

**Changed:** Task claimed; implementation not yet started.

**Commands:** `scripts/show-work-state.ps1` selected WP02-T01 from clean `main`; governing material and current migration/tooling were inspected; `git switch -c wp02/database-conventions` exited 0.

**Remaining:** All implementation, verification, evidence, and review criteria.

**Next safe action:** Write ADR-0002 and the migration checklist, then add the SQL-convention tests before the checker implementation.

**Reviewer action:** Ahmed authorized completion and ordinary review in chat on 2026-08-31. Inspect the final evidence before the task is marked complete.
