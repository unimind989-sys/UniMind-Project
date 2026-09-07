# Task record: WP02-T05 derived catalog availability

**Task ID:** WP02-T05

**Status:** [x]

**Outcome:** One caller-scoped, security-invoker database interface derives Student Catalog Availability from current authoritative membership, release, publication, source readiness/activation/rights, and curriculum-edition state; students receive only a generic locked/unavailable state while authorized admins may receive safe reason codes.

**Owner:** Codex `/root`; Ziad is the named requester in this chat

**Reviewer:** Ziad (ordinary human checkpoint; any rights or release/unlock action remains outside this task and retains its protected gate)

**Branch:** `wp02/derived-catalog-availability`

**Updated (UTC):** 2026-09-07T03:04:23Z

## Execution contract

**Dependencies:** WP02-T04 is complete and merged into `main` by PR #17 at `06e0def5c4859a08303834fbbb053a0a11d802b0`; implementation candidate `6133a54c6a9b54bea954ea7f5947e26f9e240250` is an ancestor of current `main`. Reviewed WP02-T03 authorization helpers, ADR-0002, and the WP01 foundation gate remain valid. Open real-data, provider, retention, budget, queue-host, release, and beta decisions retain their exact consumer blocks.

**Inputs:** Runbook WP02-T05 and sections 5.8-5.11; master-plan availability/authorization rules; `CONTEXT.md`; existing forward migrations, RLS/grants, and `supabase/fixtures/wp02-synthetic.sql`; synthetic data only.

**Files:** One CLI-generated forward migration under `supabase/migrations/`; focused pgTAP availability and query-plan tests under `supabase/tests/`; credential-free contract coverage under `tests/integration/` and/or `tests/security/`; generated database types if changed; `docs/security/rls-matrix.csv`; raw JSON query-plan evidence under `evidence/wp02-database/query-plans/`; a sanitized WP02-T05 gate report under `evidence/wp02-database/`; this task record; WP02-T05 runbook state.

**Verify:** Workstation preflight; `corepack pnpm check:sql`; focused credential-free tests; `corepack pnpm test:integration`; `corepack pnpm test:security`; `corepack pnpm verify`; disposable database lifecycle using the repository's exact `db:ci:*` commands on an approved standard GitHub-hosted Ubuntu runner, including populated upgrade, two clean resets, migration parity, pgTAP, advisors, type generation/parity, and database Auth integration; `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` on representative synthetic seeded data before any index decision; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; `git diff --check`; full diff, secret, architecture, and scope review.

**Pass:** Every availability predicate has an isolated failing test plus multi-failure coverage; membership/source/unit state changes affect the next call immediately; students cannot obtain diagnostic details or private configuration; authorized admin diagnostics return only safe reason codes; the interface is security invoker and caller scoped; no editable availability boolean exists; indexes are added only if measured plans demonstrate need; plan-shape assertions avoid volatile costs; all exact application/database gates pass from clean and populated synthetic states.

**Evidence:** `evidence/wp02-database/2026-09-02_catalog-availability_github_59ce324.md` and its two raw JSON measurements under `evidence/wp02-database/query-plans/`. Implementation candidate `59ce324b9648ffa1876b924238bfc78167b8ce0a`; full green CI run `33591109224`; Draft PR #18.

**Rollback:** Never rewrite applied migration history. Before promotion, revert the unshared forward migration and dependent tests/docs. After any promotion, keep catalog consumption disabled if needed and apply a new reviewed forward repair migration; never reset Preview/Beta or migrate a shared database backward.

**Hard stop:** Do not start WP02-T06; do not use real student/source data, paid APIs, AI providers, Preview/Beta resets, deployment/security-setting changes, speculative indexes, broad grants, service-role client paths, rights approval, source publication/activation, or cohort release/unlock actions. Do not claim COMPLETE without the exact database reset/tests, query-plan evidence, `pnpm verify`, committed reviewable candidate, and Ziad's ordinary human checkpoint.

## Steps

- [x] Inventory the current schema, RLS/grants, fixtures, types, and test harness; define the smallest single security-invoker availability interface.
- [x] Create the forward migration with caller-scoped student output and authorized safe admin reason codes.
- [x] Add isolated predicate failures, combined failures, immediate revocation/state-change tests, and diagnostic non-disclosure coverage; all 36 assertions pass in CI.
- [x] Capture representative pre-index invocation and installed-body query plans and add stable plan-shape integration assertions. Existing source indexes serve the measured probes; no additional index is justified or added.
- [x] Complete credential-free and disposable database gates, types/evidence/task/runbook, and the ordinary review checkpoint. Ziad accepted the checkpoint in the task chat on 2026-09-07 after receiving the final implementation and evidence report.

## Handoff

**Changed:** Forward migration `20260901232104_derived_student_catalog_availability.sql` replaces the catalog function with one security-invoker interface, preserves execute grants, and reconnects the two existing consumer policies. Added predicate/diagnostic/revocation tests, representative synthetic measurement, and cost-independent plan-shape tests. No index added. Draft PR #18 is open; no merge or shared database promotion performed.

**Commands:** Preflight, `check:sql`, focused tests, `pnpm build`, readiness, and handoff passed. Full `pnpm verify` passed locally on `59ce324`; all GitHub jobs passed in run `33591109224`, including populated upgrade, two resets, migration parity, all 19 pgTAP files with the 36-assertion T05 suite, live invocation/body EXPLAIN validation, advisors, generated types/parity, 8 database/Auth integration tests, and 15 security tests. Earlier stale synthetic JWT audit context was corrected without altering grants/policies; a local development-chunk E2E timeout was diagnosed from its trace, then the unchanged focused E2E and complete local gate passed. See the gate report for exact commands and closed failures.

**Remaining:** None. WP02-T05 is COMPLETE; no merge or shared database promotion was performed by this task.

**Next safe action:** WP02-T06 may be opened only as a separate user-authorized task; it was not started here.

**Reviewer action:** Ziad accepted the ordinary checkpoint in the task chat on 2026-09-07. No rights or release/unlock action was authorized by this task.
