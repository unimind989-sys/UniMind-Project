# Gate checkpoint: WP02-T04 actor/action/resource matrix

**Task:** WP02-T04

**Status:** IN PROGRESS; implementation and normal green database verification are complete, both protected confirmations are recorded, and the deliberate-leak negative run is authorized but not yet executed

**Environment:** Local zero-cost verification and GitHub-hosted disposable Supabase CI only; no shared Supabase target, deployment, beta launch, paid provider, or real data

**Implementation candidate:** `6133a54c6a9b54bea954ea7f5947e26f9e240250`

**Review surface:** Draft PR #17; GitHub Actions run `33514355193`; database artifact `database-ci-test-reports-33514355193-1` (`sha256:8ae3eb288bdb4a5f180834f5f1823366d5d2ab6f6b6d8bffb8d45146507f84bb`)

**Agent executor:** Codex `/root`

**Human checkpoint:** Ziad confirmed exact implementation candidate `6133a54c6a9b54bea954ea7f5947e26f9e240250` in this chat at `2026-09-01T14:36:30Z`; Ziad separately relayed Ahmed's confirmation by name at `2026-09-01T17:51:50Z`, as permitted by D-22

## Implemented scope

| Criterion | Evidence | Result |
| --- | --- | --- |
| Complete matrix | `docs/security/rls-matrix.csv` contains 1,470 unique decisions: 55 tables x 6 actors x 4 CRUD actions plus 25 functions x 6 actors | PASS |
| Actor coverage | `anon`, student, Batch Leader, admin, worker, and service role are explicit for every resource/action | PASS |
| Decision coverage | Every row is `ALLOW`, `DENY`, or `SERVER_ONLY` and names a predicate/function plus an automated test ID | PASS |
| Metadata guard | Vitest and pgTAP inventory public/private relations, functions, policies, grants, column grants, RLS enablement, update policy completeness, and forbidden mutable metadata authorization | PASS |
| Positive behavior | Synthetic tests prove own-row reads and reviewed writes, assigned Batch Leader reads/submission creation, authoritative admin reads, service-role CRUD, and authorized source reads | PASS |
| Negative behavior | Synthetic tests prove anonymous CRUD denial, cross-user/cohort/unit denial, forbidden direct admin/Batch Leader mutations, private-schema denial, invalid-source denial, and absent broad grants | PASS |
| Immediate revocation | Membership, Batch Leader assignment, and administrator role revocation take effect immediately despite stale synthetic JWT metadata | PASS |
| Authoritative identity | Policies/helpers use `(select auth.uid())` and database roles/memberships/assignments/states; no policy trusts `auth.role()`, `auth.jwt()`, `app_metadata`, or `user_metadata` | PASS |
| Forward-only schema change | CLI-generated migration `20260901064853_harden_student_catalog_rls.sql` adds a private source-read helper and replaces only the source asset/version policies; no applied migration was edited | PASS |
| Authorization boundary | Existing T03 tests remain unchanged and pass: authorized cohort metadata is distinct from derived availability, which still enforces release, publication, rights, active version, and curriculum edition | PASS |

## Verification results

| Command or check | Result | Evidence |
| --- | --- | --- |
| `corepack pnpm check:sql` | PASS | SQL convention audit passed for 17 migrations |
| `corepack pnpm test:security` | PASS | 3 files and 10 tests passed locally and in GitHub CI |
| `corepack pnpm verify` | PASS | Exact candidate passed the GitHub application job; local full gate also passed before the final SQL-fixture-only correction |
| `corepack pnpm db:ci:upgrade` | PASS | Populated upgrade passed in run `33514355193` |
| `corepack pnpm db:ci:reset` x2 | PASS | Both consecutive empty resets passed in run `33514355193` |
| `corepack pnpm db:ci:migrations` | PASS | Migration parity passed |
| `corepack pnpm db:ci:test` | PASS | All 18 pgTAP files passed, including the 121-assertion actor/action/resource suite and unchanged 34-assertion T03 suite |
| `corepack pnpm db:ci:advisors` | PASS | Disposable database advisors passed |
| `corepack pnpm db:ci:types` and `corepack pnpm db:types:check` | PASS | Generated types matched the committed artifact |
| `corepack pnpm test:integration:database` | PASS | 2 database/Auth integration tests passed and the guarded Auth action completed |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | PASS | Readiness passed before checkpoint documentation |
| `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | PASS | Isolated committed-snapshot handoff selected WP02-T04 |
| `git diff --check` | PASS | No whitespace errors on the implementation candidate |

## Closed failures

| Run | Finding | Resolution |
| --- | --- | --- |
| `33482026044` | The first database run exposed policy ordering, inherited column-grant accounting, and invalid nested data-modifying CTE assertions. | Created the private helper before dependent policies, inspected direct column ACLs, and converted synthetic mutations to valid top-level statements with behavioral assertions. |
| `33513522617` | The second database run proved the initial catalog hardening broke the completed T03 authorization/availability separation, and audit-trigger context remained stale during governed revocation fixtures. | Preserved T03 behavior without editing its migration or tests, restricted the forward migration to invalid source visibility, and supplied authoritative synthetic admin context before governed revocations. |
| Local rerun | One local full gate timed out waiting for the Next dev server after 120 seconds. | Confirmed no lingering port/process, reran E2E successfully (2/2), reran the production build successfully, then reran the complete local gate successfully before the final SQL-fixture-only correction. Exact candidate subsequently passed GitHub's full application gate. |

## Protected gate

Ziad's separate confirmation is recorded from the current chat: `انا ك زياد موافق`, given in direct response to the request to confirm exact candidate `6133a54c6a9b54bea954ea7f5947e26f9e240250` at `2026-09-01T14:36:30Z`.

Ahmed's separate confirmation is recorded from Ziad's D-22-permitted relay in the current chat: `احمد وافق`, given in direct response to the question about the remaining confirmation for that exact candidate at `2026-09-01T17:51:50Z`.

The deliberate test-only leaking-policy regression is now authorized but not yet executed. Create only a disposable test candidate that leaks a cross-user or cross-cohort row, prove the database/security gate fails, revert the unsafe fixture, rerun the normal green gate, and update this report to a final PASS. Do not merge, promote, or start WP02-T05 before that sequence completes.

## Gate decision

IN PROGRESS. Normal implementation verification is green and both founders' separate confirmations are recorded, but WP02-T04 is not COMPLETE until the deliberate-leak negative run and its post-revert green rerun pass the documented contract. WP02-T05 and WP03 have not started.
