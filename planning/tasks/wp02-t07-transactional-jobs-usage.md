# Task record: WP02-T07 transactional jobs and usage

**Task ID:** WP02-T07

**Status:** [x]

**Outcome:** Private PostgreSQL transition functions make every durable-job lease transition and usage reservation outcome atomic, replay-safe, and race-safe while rejecting inconsistent READY source state.

**Owner:** Codex `/root`; Ahmed is the named requester and signed-in operator authorizer in this chat

**Reviewer:** Ahmed for the ordinary WP02-T07 checkpoint; Ahmed and Ziad for the authorized shared Preview promotion that also carried the already-approved WP02-T04/WP02-T06 RLS migrations

**Branch:** implementation merged from `wp02/transactional-jobs-usage`; final state `main`

**Updated (UTC):** 2026-09-08T10:34:00Z

## Execution contract

**Dependencies:** WP02-T06 implementation/evidence at `12b50cdbf8bd3b93ecf994b2a8dde62105ceedf7` is merged into `main` at `5b09933970414ed0e639756cae22eb9f32b84546`; earlier WP02 migration, authorization, availability, and retrieval contracts remain valid.

**Inputs:** Runbook WP02-T07 and sections 5.4, 5.7, 7.1-7.2; master-plan sections 8.4-8.8; ADR-0002; existing private processing-job, attempt, usage-reservation, and usage-ledger tables; deterministic WP02 synthetic fixture; pgTAP and disposable Supabase harness.

**Files:** CLI-generated forward migration `supabase/migrations/20260907210213_transactional_jobs_usage_state_machines.sql`; focused pgTAP transition contract; credential-free concurrent-session test and disposable harness integration; generated database types; runbook/task documentation; sanitized evidence under `evidence/wp02-database/`.

**Verify:** red/green focused pgTAP and concurrent-session tests; `corepack pnpm check:sql`; complete disposable `db:ci:upgrade`, two `db:ci:reset` runs, `db:ci:migrations`, pgTAP including races, advisors, generated types/parity, and database Auth integration; `corepack pnpm test:integration`; `corepack pnpm test:security`; `corepack pnpm verify`; GitHub CI; Preview Supabase forward migration validation; Vercel preview/production deployment and application smoke; `git diff --check`; full diff, secret, architecture, and scope review.

**Pass:** only one worker wins each claim; heartbeat and terminal transitions require the current unexpired lease owner; retry/fail/success append one immutable attempt outcome and return the same canonical job on identical replay; usage reserve/settle/release/expire lock one reservation, append one immutable ledger event, return the same canonical reservation on replay, and reject conflicting replays, negative/over-settlement, and double settlement; a source cannot enter or remain READY without its durable processed document, active segment, and active-config embedding prerequisites.

**Evidence:** `evidence/wp02-database/2026-09-08_transactional-jobs-usage_github_576f1d6.md`; exact implementation candidate `576f1d6184c85589ed21b8e57cf44f4551ca367a`; implementation merge `558dc2ba65f4bedd767718a951a0e91ab9e74bdc`.

**Rollback:** Never rewrite an applied migration or reset Preview/Beta. Before shared promotion, revert the unshared migration and tests. After promotion, disable callers and apply a reviewed forward repair that preserves append-only attempts/ledger rows and durable reservations/jobs.

**Hard stop:** Do not use real student/source data, enable providers or nonzero budgets, publish/unlock content, reset Preview/Beta, mutate Beta, weaken grants/RLS, delete append-only evidence, or apply a destructive migration. Any protected gate change requires separate named Ahmed and Ziad confirmations for the exact candidate.

## Steps

- [x] Audit the existing job/usage tables, transition helpers, tests, migration order, fixtures, and shared environment state.
- [x] Add failing public-seam tests for every transition, replay conflict, ownership/expiry denial, READY prerequisite, and two-session race.
- [x] Implement the smallest forward migration that makes each vertical slice pass while preserving private-schema least privilege.
- [x] Run the focused and complete local/disposable gates, regenerate types, and correct all findings.
- [x] Review the final diff, freeze evidence, record the exact-head technical approval, and complete GitHub PR/check/merge delivery.
- [x] Promote the guarded migration chain to synthetic Preview, deploy the exact reviewed application build, verify the relevant GitHub→Supabase→Vercel production path, and remove task-specific branches and open PR state.

## Handoff

**Changed:** Added atomic private job and usage transition APIs, immutable job events, lease/idempotency guards, READY dependency guards, 55 focused pgTAP assertions, and real two-session race coverage. PR `#20` was approved at exact head `576f1d6`, merged as `558dc2b`, promoted to Supabase Preview through migration `20260907210213`, and deployed to Vercel Production as `6uMepeBP1G5bapL9mCt2AbEn5wC3` with release marker `wp02-t07-576f1d6-preview`.

**Commands:** Focused red/green pgTAP and concurrency runs; `corepack pnpm verify`; GitHub PR run `34192310589`; merged-main run `34193197926`; guarded Supabase SQL promotion and invariant queries; rollback-only hosted job/usage smoke; Supabase security/performance advisors; `corepack pnpm smoke:deployment -- --base-url https://project-xwrez.vercel.app --target preview`; live browser and deployment-scoped runtime-log inspection; final diff/secret/scope checks.

**Remaining:** None for WP02-T07. Later work packages must adopt the private APIs when they add live workers or non-mock application callers; this is an intentional downstream dependency, not incomplete T07 behavior.

**Next safe action:** Continue with WP02-T08, preserving the service-role-only boundary established here.

**Reviewer action:** Complete. The repository owner recorded a technical `APPROVED` review on PR `#20` at exact candidate `576f1d6`; Ahmed's standing authorization and named relay of Ziad's approval cover the shared Preview promotion. No Beta go-live, raw deletion, rights, budget-kill-switch, or release/unlock action occurred.
