# Task record: WP02-T09 run database gate

**Task ID:** WP02-T09

**Status:** [~]

**Outcome:** One exact reviewed candidate proves the complete WP02 schema, authorization, transactional, query-plan, advisor, upgrade, and clean-reset contracts, then closes the package across merged `main`, synthetic Supabase Preview, and Vercel Production.

**Owner:** Codex `/root`; Ahmed is the named requester and signed-in operator authorizer in this chat

**Reviewer:** Ahmed + Ziad for the protected WP02 RLS/grant package gate and shared Preview verification, under the standing authorization recorded in the initiating request

**Branch:** `wp02/database-gate`

**Updated (UTC):** 2026-09-09T03:52:00Z

## Execution contract

**Dependencies:** WP02-T01 through WP02-T08 are merged and production-closed on `main` at `749743e2878bd4bbd3483c39048e01613cb927b0`; their reviewed evidence is indexed under `evidence/wp02-database/`, with the latest T08 evidence at `evidence/wp02-database/2026-09-08_rls-application-boundaries_github_b624426.md`.

**Inputs:** Runbook WP02-T09 and sections 5.1-5.11; master-plan database, authorization, availability, retrieval, durable-job, usage, privacy, and environment requirements; ADR-0002; database migration checklist; all 22 versioned migrations, synthetic fixtures, pgTAP/RLS matrix, race harness, generated types, and existing availability-plan contract.

**Files:** A representative retrieval query-plan fixture and stable plan-shape guard; disposable database harness and focused tests; current sanitized query-plan artifacts; synchronized runbook/task/evidence records; only narrow corrections discovered by the gate review.

**Verify:** Focused query-plan tests; `corepack pnpm check:sql`; `corepack pnpm verify`; GitHub dependency, application, and complete disposable database/Auth gates including populated upgrade, two clean resets, migration parity, every pgTAP/RLS assertion, two-session races, advisors, both representative query plans, generated types with zero diff, Auth/database integration, security, and cleanup; guarded Supabase Preview parity/advisor/invariant checks; Vercel exact-candidate deployment, public six-check smoke, browser, and runtime logs; full diff, migration, secret, scope, and branch/PR cleanup review.

**Pass:** Every WP02 migration replays from empty and upgrades the populated tagged WP01 schema without loss; the complete RLS/grant and concurrency suites pass; generated types are stable; advisors have no unresolved warning; representative catalog availability and filtered retrieval plans use the intended access paths without spill or forbidden broad scan; manual review finds no unsafe definer, broad grant, missing update check, unindexed foreign key, destructive statement, or accidental Data API exposure; the unchanged migration ledger is healthy in synthetic Preview and the exact reviewed application is healthy in Production.

**Evidence:** `evidence/wp02-database/2026-09-09_database-gate_github_<short-sha>.md` plus current plan artifacts under `evidence/wp02-database/query-plans/`.

**Rollback:** Query-plan and harness changes may be reverted independently before merge. No new schema behavior is planned. Never rewrite an applied migration or reset Preview/Beta; if review discovers a shared-schema defect, disable affected callers and use a separately reviewed forward repair migration before closing this gate.

**Hard stop:** Do not use real student/source data, enable paid/live providers or nonzero budgets, mutate Beta, reset Preview/Beta, publish/unlock content, approve rights, delete raw data, weaken grants/RLS, or change existing applied migration history. Stop package closure on any unresolved database warning, scope leak, race failure, unsafe migration finding, schema drift, or environment mismatch.

## Steps

- [x] Establish the authoritative task contract and current repository, GitHub, Supabase, Vercel, migration, CI, evidence, and production state.
- [x] Add the missing representative filtered-retrieval plan capture and stable plan-shape regression contract.
- [x] Run focused and complete local/disposable gates, inspect every migration and advisor/plan result, and correct all findings.
- [ ] Freeze the exact candidate evidence, complete PR/check/review/merge delivery, and verify merged `main`.
- [ ] Verify Supabase Preview parity and health, deploy the exact reviewed candidate to Vercel Production, run real production smoke/browser/log checks, and remove task-specific branches/PR leftovers.

## Handoff

**Changed:** Exact implementation candidate `dd9ece4700de5aa149dfcf01deac17f14eef1f3a` adds rollback-only filtered-retrieval plan capture from both the service-only function invocation and its installed `pg_proc` SQL body. The stable guard requires the bounded 50-row result, complete authorization joins, the cohort/unit scope index, a reviewed embedding access path, and no large sequential scan or disk spill. CI's high/critical audit also required and verified Next.js `16.3.4`, `eslint-config-next` `16.3.4`, `@types/react-dom` `19.2.7`, and transitive Sharp `0.35.4`.

**Commands:** `corepack pnpm verify` passed locally; focused plan tests passed 8/8; production dependency audit reported no known vulnerability. GitHub run `34308323932` passed dependency, application, and disposable database/Auth jobs: populated upgrade, two resets, 22-migration parity, 24 pgTAP files, races, both plans, advisors, generated-type zero diff, 17 database/Auth integration tests, 22 security tests, and cleanup. Supabase Preview is Healthy at unchanged migration head `20260908122500` with no advisor issue. No database mutation, real data, paid call, provider enablement, nonzero budget, release, rights, deletion, or Beta action occurred.

**Remaining:** Commit the exact-candidate plan/evidence index, rerun the final docs-inclusive PR head, record technical review and merge, verify merged `main`, promote and test Vercel Production, then commit and merge the closure evidence and remove task branches.

**Next safe action:** Review the frozen candidate and evidence artifacts, then merge only after the docs-inclusive PR head is green.

**Reviewer action:** Ahmed and Ziad's standing authorization covers the exact protected gate candidate once frozen; record the candidate SHA and technical findings before marking complete.
