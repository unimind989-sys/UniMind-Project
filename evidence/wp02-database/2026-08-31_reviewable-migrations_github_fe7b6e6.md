# Gate report: WP02-T02 reviewable migrations

**Status:** PASS

**Environment:** Local disposable database, GitHub Actions, hosted Preview deployment, and read-only hosted Supabase inspection

**Commit SHA:** `fe7b6e6f80b146c4ad35a8fa65ab84a5288135c2`

**Release/config fingerprint:** GitHub Actions run `33370678166`; database report artifact `database-ci-test-reports-33370678166-1` (`sha256:fd599f71a22eee8f82ee661bcedb29a34d47fb43fdd6eac722308f87e5d1b1c3`); Vercel deployment `dpl_AM4JdwdpLj2KtXu3b1b4RZuf61Yj`

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql` followed by the 14 generated migrations from `20260831064406_common_enums_and_functions.sql` through `20260831064458_rls_grants_indexes.sql`

**Dataset/fixture versions:** `supabase/fixtures/foundation-bridge.sql`; `supabase/fixtures/wp02-synthetic.sql`; `.invalid` identities and deterministic mock vectors only

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed — ordinary completion checkpoint authorized in the task request on 2026-08-31; protected RLS, rights, raw-deletion, budget, release/unlock, and beta-go-live gates are excluded

**Started/finished (UTC):** 2026-08-31 05:41 / 2026-08-31 08:03

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Reviewable dependency order | All 15 runbook slices remain independently reviewable and ordered | Existing applied row 01 was preserved; rows 02–15 were generated separately and implement the required invariant per slice | PASS | Migration files and `supabase/tests/00_upgrade_path_test.sql` through `supabase/tests/15_rls_grants_indexes_test.sql` |
| Clean recreation and idempotence | Clean reset succeeds twice from the committed history | Both guarded resets passed in GitHub Actions | PASS | Run `33370678166`, database job `99421195914` |
| Populated upgrade safety | Synthetic foundation rows and evidence remain after applying rows 02–15 | Populated row-01-to-row-15 upgrade and retention assertions passed | PASS | `00_upgrade_path_test.sql`; run `33370678166` |
| Focused database proof | Every slice has a focused SQL proof and the full suite passes | All 16 pgTAP files passed | PASS | `database-ci-test-reports-33370678166-1` |
| Generated public types | Generation is deterministic and committed output has zero diff | Types were generated from the disposable schema and the zero-diff check passed | PASS | `src/types/database.generated.ts`; run `33370678166` |
| Advisors and security | No unresolved database advisor warning; applicable allow/deny and integration checks pass | Advisors passed with fail-on-warning; 2 database/Auth integration and 8 security tests passed | PASS | Run `33370678166` |
| Repository verification | Complete zero-cost repository verification passes | 23 unit files/242 tests, integration, security, evaluation, load-profile checks, 2 Chromium E2E tests, production build, and artifact secret scan passed | PASS | Local `corepack pnpm verify` at the recorded commit |
| Hosted Preview build and smoke | Exact commit is READY and safe public seams behave as specified | Preview deployment was READY; live/ready GET returned 200 with `no-store`, POST returned 405, and the home page exposed only synthetic/mock indicators | PASS | Vercel deployment `dpl_AM4JdwdpLj2KtXu3b1b4RZuf61Yj` |
| Hosted control-plane health | Existing hosted services remain healthy without bypassing promotion policy | Preview and Beta Supabase projects were Healthy and had no task-related advisor error; their migration state remained at the approved foundation row | PASS | Read-only Supabase dashboard inspection on 2026-08-31 |
| Forward repair | Shared databases are never assumed safe to migrate backward | Task contract requires capability disable plus narrowly scoped forward repair migration | PASS | Task record rollback contract |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 07:59–08:03 | GitHub Actions run `33370678166` | 0 | Dependency audit, application, disposable database upgrade/reset/tests/advisors/types, integration/security, and shutdown all passed. |
| 08:08 | `corepack pnpm verify` | 0 | Full zero-cost repository verification passed, including build and browser E2E. |
| 08:13 | `git diff origin/main...HEAD --check` and full-diff review | 0 | No whitespace error; migration, fixture, test, generated-type, CI, and task-record scope reviewed. |
| 08:20 | Authenticated Vercel inspection and exact-deployment smoke | 0 | Deployment READY; endpoint method/cache contracts and synthetic-only landing content passed. Temporary deployment bypass was revoked and the bypass count returned to zero. |
| 08:25 | Read-only Supabase Preview/Beta inspection | 0 | Both projects Healthy; no task-related schema mutation was attempted because no approved promotion guard or protected-gate confirmations exist. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Metadata role escalation | Auth metadata cannot grant an application role | Synthetic malicious metadata retained the default student role | PASS | Profile/role pgTAP and database/Auth integration report |
| Invalid state transitions | Direct or prohibited transitions fail | Source, raw lifecycle, processing job, and usage constraints rejected invalid moves | PASS | Rows 02, 07, 08, and 12 pgTAP reports |
| Forged retrieval scope | Caller input cannot authorize cross-scope retrieval | Service-only retrieval recomputed scope and rejected canary access | PASS | Rows 14–15 pgTAP and security reports |
| Retry/idempotency | Repeated requests settle on canonical state without duplicate durable effects | Campaign, job, tutor/studio, and usage idempotency proofs passed | PASS | Rows 06, 08, 10–12 pgTAP reports |
| Populated upgrade retry | A second clean recreation remains deterministic | Two resets and type regeneration completed without drift | PASS | Run `33370678166` |
| Failed CI diagnostics | A database failure remains sanitized but actionable | Harness emitted the failing sanitized report, enabling fixture-path, SQL-context, operator, volatility, and type-drift fixes | PASS | Superseded runs `33363055604` through `33369392894`; final run `33370678166` |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| Closed-01 | Medium | CI fixture include path was not mounted in the disposable runner; fixtures now load through the guarded reset path. | Codex | Closed 2026-08-31 | No |
| Closed-02 | High | Audit context and vector operators required explicit qualification; both were repaired and covered by tests. | Codex | Closed 2026-08-31 | No |
| Closed-03 | Medium | A transition assertion was incorrectly declared immutable; corrected volatility cleared the advisor. | Codex | Closed 2026-08-31 | No |
| Closed-04 | Medium | Generated public types initially drifted; regenerated output was committed and the zero-diff gate passed. | Codex | Closed 2026-08-31 | No |

No open defect or WP02-T02 TODO remained at the reviewed commit.

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden roles/scopes were tested where applicable.
- [x] Logs and browser output were inspected where applicable.

The public schema has explicit grants and row security where client access is intended. Private raw, provider-call, processing, vector, usage, and audit state remains outside direct client access. Security-definer routines are private, have explicit safe search paths, and do not receive broad `PUBLIC` execution. No real learner data, source material, provider payload, signed URL, credential, paid call, or production schema mutation was used.

## Rollback/disable procedure

No hosted database received these migrations during WP02-T02. Before promotion, disable the consuming capability if a defect is found and add a narrowly scoped, reviewed forward-repair migration; never edit applied history or reset/migrate a shared database backward. Application, CI, documentation, or test-orchestration changes may be reverted independently only when doing so does not erase durable database history. The last known-good hosted database version remains `20260824235549_extensions_and_schemas.sql`.

## Decision

PASS for the ordinary WP02-T02 gate. The complete 15-slice history recreates a clean PostgreSQL database, upgrades retained synthetic foundation data, generates deterministic types, and passes database, application, integration, security, advisor, CI, build, and exact-Preview checks. The hosted Supabase projects were intentionally not promoted: the runbook requires a future guarded promotion path, and the RLS/rights/raw-deletion/budget/release/beta gates still require separate named confirmations from Ahmed and Ziad. Those protected gates are not acceptance criteria for this migration-authoring task and remain blocked for their dependent tasks.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | PASS | 2026-08-31 |
| Ahmed | Human checkpoint | PASS under the standing ordinary-task completion and service-operation authority in the task request | 2026-08-31 |
