# Task record: WP02-T05 derived catalog availability

**Task ID:** WP02-T05

**Status:** [~]

**Outcome:** One caller-scoped, security-invoker database interface derives Student Catalog Availability from current authoritative membership, release, publication, source readiness/activation/rights, and curriculum-edition state; students receive only a generic locked/unavailable state while authorized admins may receive safe reason codes.

**Owner:** Codex `/root`; Ziad is the named requester in this chat

**Reviewer:** Ziad (ordinary human checkpoint; any rights or release/unlock action remains outside this task and retains its protected gate)

**Branch:** `wp02/derived-catalog-availability`

**Updated (UTC):** 2026-09-01T21:21:45Z

## Execution contract

**Dependencies:** WP02-T04 is complete and merged into `main` by PR #17 at `06e0def5c4859a08303834fbbb053a0a11d802b0`; implementation candidate `6133a54c6a9b54bea954ea7f5947e26f9e240250` is an ancestor of current `main`. Reviewed WP02-T03 authorization helpers, ADR-0002, and the WP01 foundation gate remain valid. Open real-data, provider, retention, budget, queue-host, release, and beta decisions retain their exact consumer blocks.

**Inputs:** Runbook WP02-T05 and sections 5.8-5.11; master-plan availability/authorization rules; `CONTEXT.md`; existing forward migrations, RLS/grants, and `supabase/fixtures/wp02-synthetic.sql`; synthetic data only.

**Files:** One CLI-generated forward migration under `supabase/migrations/`; focused pgTAP availability and query-plan tests under `supabase/tests/`; credential-free contract coverage under `tests/integration/` and/or `tests/security/`; generated database types if changed; `docs/security/rls-matrix.csv`; raw JSON query-plan evidence under `evidence/wp02-database/query-plans/`; a sanitized WP02-T05 gate report under `evidence/wp02-database/`; this task record; WP02-T05 runbook state.

**Verify:** Workstation preflight; `corepack pnpm check:sql`; focused credential-free tests; `corepack pnpm test:integration`; `corepack pnpm test:security`; `corepack pnpm verify`; disposable database lifecycle using the repository's exact `db:ci:*` commands on an approved standard GitHub-hosted Ubuntu runner, including populated upgrade, two clean resets, migration parity, pgTAP, advisors, type generation/parity, and database Auth integration; `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` on representative synthetic seeded data before any index decision; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; `git diff --check`; full diff, secret, architecture, and scope review.

**Pass:** Every availability predicate has an isolated failing test plus multi-failure coverage; membership/source/unit state changes affect the next call immediately; students cannot obtain diagnostic details or private configuration; authorized admin diagnostics return only safe reason codes; the interface is security invoker and caller scoped; no editable availability boolean exists; indexes are added only if measured plans demonstrate need; plan-shape assertions avoid volatile costs; all exact application/database gates pass from clean and populated synthetic states.

**Evidence:** `evidence/wp02-database/query-plans/` plus `evidence/wp02-database/<date>_catalog-availability_<environment>_<short-sha>.md` after the candidate SHA and verification environment exist.

**Rollback:** Never rewrite applied migration history. Before promotion, revert the unshared forward migration and dependent tests/docs. After any promotion, keep catalog consumption disabled if needed and apply a new reviewed forward repair migration; never reset Preview/Beta or migrate a shared database backward.

**Hard stop:** Do not start WP02-T06; do not use real student/source data, paid APIs, AI providers, Preview/Beta resets, deployment/security-setting changes, speculative indexes, broad grants, service-role client paths, rights approval, source publication/activation, or cohort release/unlock actions. Do not claim COMPLETE without the exact database reset/tests, query-plan evidence, `pnpm verify`, committed reviewable candidate, and Ziad's ordinary human checkpoint.

## Steps

- [~] Inventory the current schema, RLS/grants, fixtures, types, and test harness; define the smallest single security-invoker availability interface.
- [ ] Create the forward migration with caller-scoped student output and authorized safe admin reason codes.
- [ ] Add isolated predicate failures, combined failures, immediate revocation/state-change tests, and diagnostic non-disclosure coverage.
- [ ] Capture representative pre-index query plans, add an index only if measurement proves the need, and add stable plan-shape integration assertions.
- [ ] Run the complete credential-free and disposable database gates, update types/evidence/task/runbook, and prepare the ordinary review checkpoint.

## Handoff

**Changed:** Task claimed on a clean branch after proving WP02-T04 complete and merged; implementation not yet started.

**Commands:** `git status --short --branch`, T04 ancestry/history checks, `pwsh -NoProfile -File scripts/show-work-state.ps1`, and the section 0.8 workstation preflight all passed. No database or application test has run yet.

**Remaining:** All WP02-T05 implementation, measurement, verification, evidence, commit, and review work.

**Next safe action:** Inventory the merged schema/RLS/test seams and design the single caller-scoped security-invoker availability contract without starting WP02-T06.

**Reviewer action:** Ziad reviews the frozen candidate and evidence after all gates pass; no rights or release/unlock action is authorized by this task.
