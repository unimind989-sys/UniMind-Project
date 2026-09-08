# Task record: WP02-T07 transactional jobs and usage

**Task ID:** WP02-T07

**Status:** [~]

**Outcome:** Private PostgreSQL transition functions make every durable-job lease transition and usage reservation outcome atomic, replay-safe, and race-safe while rejecting inconsistent READY source state.

**Owner:** Codex `/root`; Ahmed is the named requester and signed-in operator authorizer in this chat

**Reviewer:** Ahmed for the ordinary WP02-T07 checkpoint; Ahmed + Ziad only if review discovers a protected RLS, rights, raw-deletion, budget-kill-switch, release/unlock, or beta-go-live change

**Branch:** `wp02/transactional-jobs-usage`

**Updated (UTC):** 2026-09-07T21:02:11Z

## Execution contract

**Dependencies:** WP02-T06 implementation/evidence at `12b50cdbf8bd3b93ecf994b2a8dde62105ceedf7` is merged into `main` at `5b09933970414ed0e639756cae22eb9f32b84546`; earlier WP02 migration, authorization, availability, and retrieval contracts remain valid.

**Inputs:** Runbook WP02-T07 and sections 5.4, 5.7, 7.1-7.2; master-plan sections 8.4-8.8; ADR-0002; existing private processing-job, attempt, usage-reservation, and usage-ledger tables; deterministic WP02 synthetic fixture; pgTAP and disposable Supabase harness.

**Files:** CLI-generated forward migration `supabase/migrations/20260907210213_transactional_jobs_usage_state_machines.sql`; focused pgTAP transition contract; credential-free concurrent-session test and disposable harness integration; generated database types; runbook/task documentation; sanitized evidence under `evidence/wp02-database/`.

**Verify:** red/green focused pgTAP and concurrent-session tests; `corepack pnpm check:sql`; complete disposable `db:ci:upgrade`, two `db:ci:reset` runs, `db:ci:migrations`, pgTAP including races, advisors, generated types/parity, and database Auth integration; `corepack pnpm test:integration`; `corepack pnpm test:security`; `corepack pnpm verify`; GitHub CI; Preview Supabase forward migration validation; Vercel preview/production deployment and application smoke; `git diff --check`; full diff, secret, architecture, and scope review.

**Pass:** only one worker wins each claim; heartbeat and terminal transitions require the current unexpired lease owner; retry/fail/success append one immutable attempt outcome and return the same canonical job on identical replay; usage reserve/settle/release/expire lock one reservation, append one immutable ledger event, return the same canonical reservation on replay, and reject conflicting replays, negative/over-settlement, and double settlement; a source cannot enter or remain READY without its durable processed document, active segment, and active-config embedding prerequisites.

**Evidence:** expected `evidence/wp02-database/2026-09-08_transactional-jobs-usage_github_<short-sha>.md` after the exact candidate and GitHub run exist.

**Rollback:** Never rewrite an applied migration or reset Preview/Beta. Before shared promotion, revert the unshared migration and tests. After promotion, disable callers and apply a reviewed forward repair that preserves append-only attempts/ledger rows and durable reservations/jobs.

**Hard stop:** Do not use real student/source data, enable providers or nonzero budgets, publish/unlock content, reset Preview/Beta, mutate Beta, weaken grants/RLS, delete append-only evidence, or apply a destructive migration. Any protected gate change requires separate named Ahmed and Ziad confirmations for the exact candidate.

## Steps

- [~] Audit the existing job/usage tables, transition helpers, tests, migration order, fixtures, and shared environment state.
- [ ] Add failing public-seam tests for every transition, replay conflict, ownership/expiry denial, READY prerequisite, and two-session race.
- [ ] Implement the smallest forward migration that makes each vertical slice pass while preserving private-schema least privilege.
- [ ] Run the focused and complete local/disposable gates, regenerate types, and correct all findings.
- [ ] Review the final diff, freeze evidence, obtain the ordinary Ahmed checkpoint recorded by this request, and complete GitHub PR/check/merge delivery.
- [ ] Promote the exact migration to synthetic Preview, deploy the merged application, verify GitHub→Supabase→Vercel production behavior, and remove task-specific branches/previews/artifacts.

## Handoff

**Changed:** Task claimed; no behavior change yet.

**Commands:** `git status --short --branch`, work-state routing, repository/platform discovery, governing-document review, and pinned CLI migration generation passed. GitHub/Vercel/Supabase CLIs are intentionally unauthenticated/unlinked; authenticated in-app browser sessions are available for all three platforms.

**Remaining:** Every WP02-T07 implementation, verification, delivery, promotion, production-validation, and cleanup step.

**Next safe action:** Add the first failing transition test at the private database-function seam.

**Reviewer action:** Ahmed's initial prompt supplies standing ordinary-task authorization and checkpoint intent; final acceptance must still be recorded against the exact reviewed evidence.
