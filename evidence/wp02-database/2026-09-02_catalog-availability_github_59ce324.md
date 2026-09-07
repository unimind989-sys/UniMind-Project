# Gate checkpoint: WP02-T05 derived catalog availability

**Task:** WP02-T05

**Status:** Technical verification PASS; Ziad's ordinary human checkpoint is pending

**Implementation candidate:** `59ce324b9648ffa1876b924238bfc78167b8ce0a`

**Review surface:** [Draft PR #18](https://github.com/unimind989-sys/UniMind-Project/pull/18)

**Executor / reviewer:** Codex `/root` / Ziad, explicitly identified in this chat

**Environment:** Synthetic-only local zero-cost application checks and standard GitHub-hosted Ubuntu disposable Supabase CI. No shared database reset/migration, real student data, paid API, AI provider, manual deployment, or deployment/security-setting change. The pre-existing Vercel GitHub integration generated its usual branch preview; no Vercel action or settings change was performed.

## Dependency and scope

WP02-T04 was complete and merged into clean `main` at `06e0def5c4859a08303834fbbb053a0a11d802b0` (PR #17); T04 implementation `6133a54c6a9b54bea954ea7f5947e26f9e240250` was confirmed as an ancestor before the T05 branch was created.

- New forward migration: `20260901232104_derived_student_catalog_availability.sql`. No old migration was edited.
- One public SQL `STABLE SECURITY INVOKER` function: `available_curriculum_units(admin_preview boolean default false)`, with empty `search_path`. The old no-argument overload is removed; omitted arguments still work through the default.
- No new view, table, stored availability boolean, or index. `availability_state` is computed at query time.
- Existing `chat_sessions_insert_own_available` and `studio_requests_insert_own_available` policies are recreated against the same function and explicitly require `AVAILABLE`. Other RLS policies and underlying grants are unchanged. Function execution remains authenticated-only, with no anonymous or PUBLIC execution.
- The generated database types and matrix notes reflect the new function signature/output. The reviewed T04 matrix test mapping remains intact.

## Availability predicates and tests

The focused pgTAP suite is `supabase/tests/18_derived_student_catalog_availability.sql` (36 assertions). Existing T03/T04 suites remain behavioral regression gates.

| Predicate | Isolated failure proof | Additional proof |
| --- | --- | --- |
| Authenticated caller identity | Authenticated role with no `auth.uid()` returns no rows; anonymous execute grant is absent | Caller-scoped invoker metadata; existing T04 anonymous function denial |
| Active membership | Inactive/expired member returns no rows; admin diagnostics isolate `membership_missing` | Forged `admin_preview` does not bypass student membership; revocation affects the next call |
| Cohort unlocked | Only release state is changed to `LOCKED`; admin gets `cohort_locked`, student gets no rows | Missing release configuration also fails closed |
| Unit published | Only publication is changed to `WITHDRAWN`; admin gets `unit_unpublished`, student gets no rows | Available-before/locked-after next-call test |
| At least one active READY version | Only the qualifying source processing state is changed to `NEEDS_REVIEW`; admin gets `ready_source_missing`, student gets no rows | Available-before/unavailable-after next-call test; existing schema also forbids READY with inactive activation |
| Valid current rights | Rights expiry alone produces `rights_invalid` and no student rows | Future `rights_valid_from` independently fails; existing READY constraint requires VALID rights status |
| Matching curriculum edition | Cohort current edition alone is changed; admin gets `curriculum_edition_mismatch`, student gets no rows | The qualifying active READY version must satisfy rights and edition together |

Combined failures cover membership + cohort lock + withdrawn unit + non-READY source, with safe admin reasons and generic empty student output. The credential-free security matrix also exercises each predicate and multiple/all simultaneous failures (10 cases). Students never receive diagnostic reason details; unauthorized preview flags cannot expand their scope. Authorized admin preview bypasses membership only; the other predicates remain required.

## Query-plan evidence and index decision

- Fixture: 512 generated synthetic published units, submissions, assets, and active READY versions, added to the existing synthetic cohort inside a rolled-back transaction. Relevant tables are analyzed before measurement. No shared or real data is involved.
- Exact measurement: `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` under the authenticated synthetic student.
- Invocation baseline from run `33590554923`: [raw JSON](query-plans/student-catalog-invocation-7b746d8.json), 513 rows, one Function Scan, 127.229 ms execution, 33,481 shared hits, zero shared reads, zero temporary blocks.
- A Function Scan hides internal joins. The final harness additionally extracts the installed function body from `pg_proc.prosrc`, prepares its boolean parameter, and explains it under the same caller and empty search path. This is measurement-only SQL derived from the installed authority, not a second maintained implementation.
- Six integration assertions cover a healthy invocation/body shape, repeated invocation, temporary spill, repeated full source scans, mismatched row counts, and an opaque body plan. No assertion pins planner cost estimates or execution-time numbers. Live plans are validated in `db:ci:test`, and the raw evidence is written before shape validation so failures remain inspectable.
- Final run `33591109224`: [invocation and installed-body raw JSON](query-plans/student-catalog-body-59ce324.json). Invocation: 513 rows, one Function Scan, 62.555 ms, 33,462 shared hits. Installed body: 513 rows, 58.100 ms, 32,388 shared hits; zero shared reads and zero temporary blocks in both measurements. The final sort uses in-memory quicksort (109 KB).
- Internal shape: one sequential scan over 514 synthetic curriculum-unit rows; cohort lookup is memoized; per-unit source probes use the existing `source_assets_unit_scope_idx` and `source_versions_availability_idx` (Index Only Scan), returning one row per probe. There is no repeated full scan of a source relation. RLS scope checks also use the existing source scope and cohort primary-key indexes.
- Index decision: retain existing indexes; this measurement does not demonstrate a missing index. No index was added. The faster final timing versus the initial baseline is runner/cache variability, not an optimization claim.

## Verification

| Command / gate | Result |
| --- | --- |
| Workstation preflight, clean tree and T04 ancestry | PASS |
| `corepack pnpm check:sql` | PASS, 18 forward migrations |
| Focused plan integration tests | PASS, 6 tests |
| `corepack pnpm test:integration` | PASS, 7 local tests; 1 hosted-only test intentionally skipped locally |
| `corepack pnpm test:security` | PASS, 15 tests |
| `corepack pnpm verify` | PASS locally on `59ce324`; unit 242, integration 7 + 1 hosted skip, security 15, evaluation 3, load-contract 5, E2E 2, safe build and client secret scan |
| `corepack pnpm build` | PASS independently; final `verify` also performs its guarded production build |
| `corepack pnpm db:ci:start` / `db:ci:upgrade` | PASS in final run `33591109224`, including populated upgrade |
| `corepack pnpm db:ci:reset` twice / `db:ci:migrations` | PASS in final run `33591109224`, both consecutive clean resets and migration parity |
| `corepack pnpm db:ci:test` / `db:ci:advisors` | PASS in final run `33591109224`, all 19 pgTAP files including the 36-assertion T05 suite, live invocation/body shape, and advisors |
| `corepack pnpm db:ci:types` / `db:types:check` | PASS; generator exactly matched the committed types |
| `corepack pnpm test:integration:database` / final `test:security` | PASS in final run `33591109224`, 8 integration and 15 security tests |
| `corepack pnpm db:ci:stop` | PASS; disposable stack and volumes removed |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | PASS |
| `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | PASS; isolated clean committed snapshot selects WP02-T05 |
| `git diff --check`, full diff, boundaries, secret and scope review | PASS |

Baseline database artifact: `database-ci-test-reports-33590554923-1`, digest `sha256:bd749e46ec368cf239801ec43ec2798e15e58d3e3e432f3264825ce8f5ad8f11`. Runtime: Ubuntu 24.04, PostgreSQL 17.6, Supabase CLI 2.115.0, Node v24.19.0, PostgREST v16.1. Plan timings are observations on this fixture, not a production SLA or a capacity claim.

Final database artifact: `database-ci-test-reports-33591109224-1`, digest `sha256:45fd042081dae948bca48660b44e3e7b5ffebc9ccfe07d123144e6d91f9a7149`; the downloaded ZIP SHA-256 was independently matched to this digest. [Final full CI run](https://github.com/unimind989-sys/UniMind-Project/actions/runs/33591109224) passed dependency audit, application, and database jobs. Both JSON measurements are preserved in this repository, independent of the short-lived CI artifact retention.

## Closed failures

| Finding | Cause and resolution |
| --- | --- |
| Initial local matrix-contract failure | Matrix notes had repointed the T04 `automated_test` mapping. Restored that reviewed mapping and retained the T05 coverage as an additional suite. No security expectation was weakened. |
| Run `33571779725` pgTAP exit at 25/26 assertions | `RESET ROLE` preserved the synthetic student JWT while the unit-publication audit expected the admin actor. Commit `7b746d8` explicitly aligns the synthetic mutation caller before state changes. The next complete database run passed; no grant, policy, or audit trigger was weakened. |
| Expanded local `verify` E2E timeout | Trace showed successful development JS responses taking about 11 seconds plus browser startup exhausted the 15-second test budget; the expected page and assertions were correct. The unchanged E2E rerun passed 2/2, then the unchanged full `pnpm verify` passed on `59ce324`. No timeout increase, retry setting, or assertion removal was introduced. |
| Final readiness filename check | The dated underscore exception applies to Markdown evidence reports, not raw JSON. Renamed the two JSON artifacts to lowercase kebab-case and updated their links; measurement contents are unchanged. |

## Human checkpoint and next safe action

Technical work and exact verification are complete. T05 remains `[~]`, not COMPLETE, solely pending Ziad's inspection and ordinary checkpoint on implementation candidate `59ce324b9648ffa1876b924238bfc78167b8ce0a` and this evidence. Draft PR creation was explicitly confirmed by Ziad, but that is not a substitute for evidence review. The next safe action is that T05 checkpoint. WP02-T06 has not started. No merge, shared database promotion, rights approval, or release/unlock action is authorized by this record.
