# Task record: WP02-T04 build actor/action/resource matrix

**Task ID:** WP02-T04

**Status:** [?]

**Outcome:** Every database table, view, and function has an explicit actor/action/resource decision, and automated database tests prove permitted operations, forbidden operations, cross-user/cohort/unit isolation, and immediate revocation from authoritative database state.

**Owner:** Codex `/root`; Ziad is the named requester in this chat

**Reviewer:** Ahmed + Ziad - protected RLS gate pending separate confirmation for the exact frozen candidate commit

**Branch:** `wp02/actor-action-resource-matrix`

**Updated (UTC):** 2026-09-01T14:15:24Z

## Execution contract

**Dependencies:** Reviewed WP02-T03 closure at `evidence/wp02-database/2026-09-01_authorization-predicates_github_f7e0f3d.md`; accepted ADR-0002; reviewed WP01-T11 foundation gate; synthetic-only WP02 migration and authorization-helper contracts. Open real-data, provider, retention, budget, queue-host, release, and beta decisions retain their exact consumer blocks.

**Inputs:** Runbook WP02-T04 and sections 5.9-5.10; master-plan authorization rules; `CONTEXT.md`; `docs/templates/rls-matrix.csv`; current public/private tables, functions, grants, RLS policies, and `supabase/fixtures/wp02-synthetic.sql`.

**Files:** `docs/security/rls-matrix.csv`; focused matrix contract checks under `tests/security/`; a new pgTAP matrix suite under `supabase/tests/`; any defect repair only through a CLI-generated forward migration; WP02-T04 runbook state; this task record; sanitized evidence under `evidence/wp02-database/`.

**Verify:** `corepack pnpm check:sql`; `corepack pnpm test:security`; focused disposable pgTAP suite through `corepack pnpm db:ci:test`; `corepack pnpm db:ci:upgrade`; two `corepack pnpm db:ci:reset` runs; `corepack pnpm db:ci:migrations`; `corepack pnpm db:ci:advisors`; `corepack pnpm db:ci:types`; `corepack pnpm db:types:check`; `corepack pnpm test:integration`; `corepack pnpm verify`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`; protected disposable-CI deliberate-leak regression only after both founders confirm the exact frozen candidate; `git diff --check`; full diff, secret, architecture, and scope review.

**Pass:** The matrix covers READ/CREATE/UPDATE/DELETE for every table, EXECUTE for every function, and every `anon`, student, Batch Leader, admin, worker, and service actor decision with `ALLOW`, `DENY`, or `SERVER_ONLY`, a predicate, and an automated test ID. Database behavior proves every permitted client action and every high-risk forbidden boundary, while metadata tests reject unreviewed exposed objects, broad grants, missing RLS/policies, mutable metadata authorization, or incomplete update policies. A separately confirmed test-only leaking policy makes the disposable CI database/security gate fail and is then reverted before the green run.

**Evidence:** `evidence/wp02-database/2026-09-01_actor-action-resource-matrix_github_6133a54.md`

**Rollback:** This task must not rewrite applied migration history. Revert documentation/test-only changes before merge when no database state changed. If a forward repair migration becomes necessary and is later promoted, keep affected capabilities disabled and apply a new reviewed forward repair; never migrate a shared database backward.

**Hard stop:** Do not run the deliberate leaking-policy regression, merge or promote an RLS/grant change, or claim T04 complete without separate named Ahmed and Ziad confirmations for the exact frozen candidate commit. Do not reset Preview/Beta, deploy, unlock/release a cohort, enable real data or paid providers, delete raw data, expose service credentials, weaken grants/RLS, or start WP02-T05 while T04 remains incomplete.

## Steps

- [x] Inventory every table, view, function, role, and operation into the controlled matrix.
- [x] Add executable matrix completeness and ALLOW/DENY behavior tests.
- [x] Prove cross-user, cross-cohort, cross-unit, role/state, and immediate membership/assignment/role revocation boundaries.
- [x] Run credential-free checks and the guarded disposable database gate; record exact results.
- [?] Freeze the candidate SHA and obtain separate Ahmed and Ziad confirmations. Exact green implementation candidate: `6133a54c6a9b54bea954ea7f5947e26f9e240250`; both named confirmations remain pending.
- [ ] Run and revert the test-only leaking-policy regression, rerun the green database gate, and complete protected review evidence.

## Handoff

**Changed:** Added the controlled 1,470-row matrix for all 55 tables and 25 functions across six actors; added a 121-assertion pgTAP suite and a Vitest completeness/grant contract; added a forward migration that prevents invalid source metadata reads through a private, caller-scoped `auth.uid()` helper backed by authoritative role, membership, release, publication, rights, version, and curriculum-edition rows. The established authorization/availability separation remains intact: cohort members can read authorized catalog metadata while derived availability and source access enforce release/publication/source validity.

**Commands:** Workstation preflight passed; `scripts/show-work-state.ps1` selected WP02-T04; local `corepack pnpm check:sql`, `corepack pnpm test:security`, `git diff --check`, and `corepack pnpm verify` passed. GitHub run `33514355193` passed dependency audit, the exact full application gate, populated upgrade, two resets, migration parity, all pgTAP tests including the 121-assertion T04 suite, advisors, type generation/parity, database Auth integration, and security tests on exact candidate `6133a54c6a9b54bea954ea7f5947e26f9e240250`.

**Remaining:** Obtain separate named Ahmed and Ziad confirmations for exact candidate `6133a54c6a9b54bea954ea7f5947e26f9e240250`; only then run and revert the protected test-only leaking-policy regression, rerun the normal green database gate, and close protected review evidence.

**Next safe action:** Record Ziad's and Ahmed's separate exact-SHA confirmations. Do not run the deliberate-leak regression before both are present.

**Reviewer action:** Ahmed and Ziad must separately confirm the exact frozen candidate before the deliberate-leak run and protected gate completion.
