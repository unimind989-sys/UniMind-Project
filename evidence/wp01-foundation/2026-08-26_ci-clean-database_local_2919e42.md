# Gate report: WP01-T08 clean-database CI local rehearsal

**Status:** IN PROGRESS

**Environment:** Exact-runtime local credential-free application gate plus guarded synthetic-only hosted Supabase `ci` target rehearsal; no GitHub workflow or branch-setting change was made

**Commit SHA:** `2919e42be4b53fa3054f6f592168e16fdbcdbc02` (candidate series starts at `2c14cda73003ff9e99dfeb8aaaa0cfb0550046e7`)

**Release/config fingerprint:** Hosted CI `sha256:6ad364ad022a`; PostgreSQL 17.6; vector 0.8.2; pgcrypto 1.3; pinned Node 24.19.0; pnpm 10.34.5; Supabase CLI 2.115.0

**Migrations:** `supabase/migrations/20260824235549_extensions_and_schemas.sql`

**Dataset/fixture versions:** Hosted synthetic `wp01-foundation-v1`; 3 fixtures/canaries; local versioned foundation evaluation and load-profile fixtures

**Executor:** Codex `/root`

**Independent reviewer:** UNASSIGNED — GATE BLOCKED

**Started/finished (UTC):** 2026-08-26T04:00Z / local executor rehearsal finished 2026-08-26T09:08Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Least-privilege workflow | Read-only default permissions, no `pull_request_target`, immutable action revisions, no persisted checkout credential | `contents: read` is the only permission; all four actions use 40-character SHAs; checkout persistence is disabled | PASS locally | `.github/workflows/ci.yml`; `pnpm verify:ci-workflow` |
| Safe concurrency and target | Superseded application runs cancel; shared CI database operations serialize and can select only the approved CI profile | Application concurrency keys by ref; hosted group is fixed with cancellation disabled; the job uses GitHub environment `ci` and `UNIMIND_CI_*` secrets | PASS locally | Workflow-policy unit tests and audit; hosted profile/target tests |
| Reproducible install | Immutable lockfile install succeeds from a fresh runner without dashboard state | `pnpm install --frozen-lockfile` passes in the existing worktree and is declared in both jobs; no fresh GitHub runner has executed it | IN PROGRESS | Command result below; external run required |
| Clean hosted database gate | Dry-run, guarded reset, migrations, generated types/no-diff, hosted Auth, and security suite pass on isolated CI | Local orchestration passed against the reviewed CI fingerprint; types were generated twice with zero second diff; the temporary Auth user was deleted | PASS rehearsal | Command results below |
| Credential-free application gate | Format, lint, types, boundaries, local tests, evaluation/load guards, Chromium smoke, production build, and client scan pass | Complete `pnpm verify` passed | PASS locally | `test-results/` reproducible ignored reports; command result below |
| Secret/dependency controls | Repository scan redacts values; pull-request dependency review runs with immutable code | 603 files scanned without exposing matches; synthetic fixture tests prove redaction; dependency-review job is present and pinned | PASS locally | Secret-scan tests/audit; workflow source |
| Sanitized failure reports | Application and hosted reports upload on failure without environment/config/private inputs | Both jobs upload only `test-results/`, use `if: always()`, and retain for 7 days | PASS locally | Workflow-policy audit; workflow source |
| Deliberately unsafe RLS rejection | A leaking database policy makes CI fail | WP01 implements identity/availability security seams only; the database RLS matrix arrives in WP02, so this criterion cannot yet be executed or claimed | BLOCKED | `tests/security/README.md`; WP02 ownership |
| External CI and branch protection | Candidate passes on GitHub and `main` requires CI plus independent review | Not run or configured; external authorization and a named independent reviewer are absent | BLOCKED | `planning/tasks/wp01-t08-create-ci.md` |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-26 resume session | Official `git ls-remote` checks for checkout/setup-node/upload-artifact/dependency-review version tags | 0 | Resolved the exact four immutable SHAs recorded in the workflow; no credential used |
| 2026-08-26 resume session | Focused red/green unit tests for CI profile adapter, hosted Auth command guard, repository secret scan, workflow policy, and generated-type formatter | expected 1 then 0 | Each seam first failed for the missing contract and passed after implementation |
| 2026-08-26 resume session | `corepack pnpm db:metadata --environment ci` | 0 | Fingerprint `sha256:6ad364ad022a`; PostgreSQL/extensions/3 fixtures verified; private schema access denied |
| 2026-08-26 resume session | `corepack pnpm db:push:dry-run --environment ci` | 0 | Guarded target was already up to date |
| 2026-08-26 resume session | `corepack pnpm db:reset --environment ci` | 0 | Applied the versioned migration and synthetic seed to the approved isolated CI target |
| 2026-08-26 resume session | `corepack pnpm db:migrations --environment ci` | 0 | Local and remote migration history matched |
| 2026-08-26 resume session | Two runs of `corepack pnpm db:types --environment ci`, followed by `corepack pnpm db:types:check` | 0 | First run exposed formatting-only drift; formatter fix `371717e` made the second generation deterministic and no-diff |
| 2026-08-26 resume session | Environment-backed `corepack pnpm test:integration:hosted:ci` | 0 | Provider mock plus hosted synthetic Auth create/sign-in/refresh/verified guard/forged-cookie denial/cleanup passed |
| 2026-08-26 08:57 | First final `corepack pnpm verify` | 1 | Prettier named exactly four new files; no behavioral suite ran after the formatting gate stopped |
| 2026-08-26 08:58 | Prettier on the four named files; full diff inspection | 0 | Formatting-only diff, 18 insertions and 21 deletions |
| 2026-08-26 08:59 | Final `corepack pnpm verify` | 0 | Formatting/lint/types/boundaries/policy passed; 603 files scanned; 202 unit, 1 local integration with hosted skip, 8 security, 3 evaluation, 5 load-profile, and 1 Chromium test passed; production build and client scan passed |
| 2026-08-26 09:01 | `corepack pnpm install --frozen-lockfile` | 0 | Lockfile current; install already up to date |
| 2026-08-26 09:02 | `git diff --check`; version/final worktree checks | 0 | No whitespace error; pnpm/Supabase versions recorded above; worktree clean before evidence updates |
| 2026-08-26 09:07 | Full `pnpm verify` invoked through bundled Node 24.19.0 and Corepack/pnpm 10.34.5 | 0 | Exact `.nvmrc`/`package.json` runtime repeated the complete green gate, including 604-file scan, Chromium, production build, and client-artifact scan |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Floating action, write permission, or unsafe trigger | Static audit rejects workflow before publication | Unit fixture produced the named policy violations | PASS | `tests/unit/ci-workflow-policy.test.ts` |
| Secret pattern in repository | Fail with path/line/rule but never copy the credential | Synthetic negative fixture returned only `src/unsafe.ts`, line, and `SUPABASE_SECRET_KEY` | PASS | `tests/unit/repository-secret-scan.test.ts` |
| Environment-backed development profile | Reject environment-source credentials outside CI | Command/profile guards reject this combination | PASS | Hosted command/profile unit tests |
| Wrong target or reset confirmation | Reject before database mutation | Existing target/reset guards passed; selected CI metadata matched the reviewed fingerprint before reset | PASS | Hosted target tests and metadata command |
| Forged Auth cookie | Deny authority and clean temporary user | Deliberately forged cookie was denied; expected parser warnings contained no credential; cleanup passed | PASS | Hosted Auth integration command |
| Generated type drift | Fail the Git diff gate | Raw generated formatting initially failed; deterministic formatting now yields no second-run diff | PASS | `371717e`; generated-type test/check |
| Parallel reset attempts | Do not cancel an in-flight reset or overlap the shared target | Workflow fixes one hosted concurrency group with `cancel-in-progress: false` | PASS configuration | Workflow audit; external scheduling remains unproven |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T08-D01 | Resolved | The interrupted part-one commit contained raw generated-type formatting. Commit `371717e` added deterministic Prettier normalization and proved a second generation has zero diff. | Codex | Resolved 2026-08-26 | No |
| WP01-T08-D02 | Resolved | The first complete gate named four unformatted new TypeScript files. Commit `2919e42` contains formatting-only normalization and the full gate then passed. | Codex | Resolved 2026-08-26 | No |
| WP01-T08-BLOCK-01 | Blocking | No explicit authorization exists to publish/configure/run the workflow or change branch protection; no independent reviewer is assigned. | Repository owner/reviewer | Before external execution | WP01-T08 and WP01-T09 |
| WP01-T08-BLOCK-02 | Blocking | There is no WP01 database RLS matrix to mutate deliberately; the security README assigns database grants/RLS matrices to WP02. | WP02 executor and independent reviewer | WP02 RLS implementation | RLS-leak acceptance claim |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden roles/scopes were tested at the implemented identity, availability, target-selection, and hosted Auth seams.
- [x] Logs and browser output were inspected; expected forged-cookie parser warnings contained no credential value.
- [x] Repository scan reports only file, line, and rule code; its negative test proves the matched value is omitted.
- [x] CI uses only the isolated synthetic target, makes no paid-provider call, and configures no cache.

## Rollback/disable procedure

No GitHub workflow, environment secret, or branch setting has been published or changed. Before publication, revert candidate commits `2919e42`, `371717e`, and `2c14cda` in reverse order if the approach is rejected. After a future authorized publication, disable or revert `.github/workflows/ci.yml` while preserving required branch protections until an authorized owner approves any branch-rule change. The hosted reset contains only reviewed synthetic fixtures, and the Auth test deleted its temporary user.

## Decision

The candidate is ready for independent review and an authorized first GitHub run. It is not a task PASS: a fresh runner, uploaded artifacts, branch protection, and the future deliberate RLS-leak rejection remain unproven. WP01-T09 stays blocked.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | LOCAL CANDIDATE READY; EXTERNAL GATE BLOCKED | 2026-08-26 |
| UNASSIGNED | Independent reviewer | NOT REVIEWED | — |
