# Task record: WP02-T01 establish database conventions

**Task ID:** WP02-T01

**Status:** [x]

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

**Evidence:** `evidence/wp02-database/2026-08-31_database-conventions_local_de4ad49.md`

**Rollback:** Revert the documentation, checker, test, and package-script changes. No shared database, deployment, provider, or external state is changed.

**Hard stop:** Do not create application-domain migrations, use real/private data, contact paid providers, alter Preview/Beta, weaken explicit grants or RLS, approve a protected gate, or encode an unresolved product/provider choice as a database default.

## Steps

- [x] Confirm the task boundaries and record the accepted database convention trade-offs.
- [x] Write the database-boundary ADR and forward-migration review checklist.
- [x] Add failing convention cases, implement the SQL checker, and integrate it into `pnpm verify`.
- [x] Run focused and complete zero-cost verification plus repository handoff checks.
- [x] Record sanitized evidence and close the ordinary human checkpoint.

## Handoff

**Changed:** Accepted ADR-0002; added the database migration checklist; implemented the migration scanner and `check:sql`; covered safe and unsafe filename, schema, identity, timestamp, grant, comment/string, and privileged-function cases; wired the checker into the full zero-cost gate; synchronized command documentation and task state.

**Commands:** Candidate `de4ad49` passed the final `pnpm verify` gate with 242 unit tests, credential-free integration, 8 security tests, 3 evaluation cases, 5 guarded load-profile tests, 2 Chromium tests, production build, and repository/client secret scans. The focused SQL suite passed 10 cases; `pnpm check:sql`, agent readiness, `git diff --check`, full 12-file diff review, and the isolated committed-snapshot handoff all passed.

**Remaining:** None for WP02-T01. Open pilot decisions and protected gates retain their exact downstream blocks.

**Next safe action:** Run the selector from the closure commit; it should recommend WP02-T02. Claim exactly one reviewable migration slice and keep fixtures synthetic.

**Reviewer action:** Complete — Ahmed granted full ordinary completion and review authority in chat on 2026-08-31; the final evidence records PASS and explicitly excludes protected gates.
