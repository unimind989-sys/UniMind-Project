# Gate evidence: WP02-T07 transactional jobs and usage

**Task:** WP02-T07

**Status:** PASS

**Exact implementation candidate:** `576f1d6184c85589ed21b8e57cf44f4551ca367a`

**Implementation merge:** `558dc2ba65f4bedd767718a951a0e91ab9e74bdc`

**Review surface:** GitHub PR `#20`, `wp02/transactional-jobs-usage` into protected `main`

**Release/config fingerprint:** migration `20260907210213`, repository LF SHA-256 `1b3a0cf4c7cb5ca316fd03380e1206bf83a8a9c4c72cfdad5f753662729cdc71`; guarded five-migration promotion bundle SHA-256 `826ecb7f7825d71bdc662aa508af6080b715e3ce5df1cae163d6d54fac53edf6`; Vercel deployment `6uMepeBP1G5bapL9mCt2AbEn5wC3`; public release marker `wp02-t07-576f1d6-preview`

**Migrations:** `20260901064853_harden_student_catalog_rls`, `20260901232104_derived_student_catalog_availability`, `20260907123954_restrict_student_release_metadata`, `20260907124502_harden_server_only_retrieval_scope`, `20260907210213_transactional_jobs_usage_state_machines`

**Dataset/fixture versions:** deterministic `supabase/fixtures/wp02-synthetic.sql`; hosted smoke executed inside an explicit transaction and rolled back

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed for the ordinary task; Ahmed and Ziad for the authorized shared Preview promotion

**Started/finished (UTC):** 2026-09-07T21:02:11Z / 2026-09-08T10:34:00Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Job state machine | Atomic claim, heartbeat, success, retry, and failure with current lease ownership | Five private transition functions lock the job, enforce owner/expiry/state, append immutable attempts/events, and replay only identical input | PASS | pgTAP `20_transactional_processing_jobs.sql`; real two-session claim race |
| Usage state machine | Atomic reserve, settle, release, and expiry with exact ledger accounting | Four private transition functions lock row/idempotency namespaces, prevent negative/over/double settlement, and record settled plus unused units exactly once | PASS | pgTAP `21_transactional_usage.sql`; real reserve/settle races |
| Replay safety | Identical replay returns the canonical row; conflicting or cross-transition reuse fails | Positive replay, changed-input collision, and `:unused` cross-transition collision cases passed | PASS | final self-review correction at `576f1d6`; PR run `34192310589` |
| READY integrity | A source cannot enter or remain READY without durable processed, active-segment, active-config embedding prerequisites | Transition and dependency-loss triggers reject each invalid state | PASS | pgTAP `22_ready_source_prerequisites.sql`; four hosted guard triggers |
| Least privilege | Private tables/functions unavailable to browser roles | All nine state functions executable by `service_role`; zero executable by `public`, `anon`, or `authenticated`; private-schema/table access denied to browser roles | PASS | hosted invariant query; security advisor 0 errors/0 warnings |
| Delivery | Reviewed, merged, promoted, deployed, and production-smoked | PR `#20` approved and merged; merged-main CI green; Supabase Preview promoted; Vercel production alias points at the exact reviewed build and release marker; public smoke passed | PASS | runs `34192310589`, `34193197926`; deployment `6uMepeBP1G5bapL9mCt2AbEn5wC3` |

## Implementation

- `unimind_private.job_events` is append-only and records claim, heartbeat, retry, success, and failure evidence independently from mutable current job state.
- Claim selection uses row locking with skip-locked semantics. Heartbeat and terminal transitions require the current, unexpired lease owner. Attempts and events are committed with the state transition.
- Usage reserve and terminal transitions serialize both row and idempotency namespaces. Settlement writes actual usage and unused release evidence atomically, while identical replays return the original terminal reservation.
- READY prerequisites are checked on the source transition and when a processed document, segment, quality report, or embedding configuration change could invalidate a READY source.
- All entry points stay in `unimind_private`, use an empty search path, revoke default/public/browser access, and grant only the required server role.

## Commands and platform checks

| UTC time | Command/test ID | Exit code | Sanitized result |
| --- | --- | --- | --- |
| 2026-09-08 | `corepack pnpm verify` at `576f1d6` | 0 | Format, lint, typecheck, boundaries, 21-migration SQL audit, CI audit, 706-file secret scan, 242 unit tests, integration 7 pass + 1 hosted skip, security 19, evaluation 3, load contract 5, browser E2E 2, Next.js production build, and client-artifact scan passed |
| 2026-09-08T05:52:29Z | GitHub run `34192310589` | 0 | Dependency audit, application gate, and disposable database/Auth gate all passed; database gate included populated upgrade, two resets, migration parity, all pgTAP suites, 512-unit plan, real concurrency checks, advisors, generated-type parity, hosted-style Auth integration, security, and cleanup |
| 2026-09-08T06:05:43Z | merged-main run `34193197926` | 0 | Application and disposable database/Auth jobs passed; dependency audit was intentionally skipped by the push policy after passing on the exact PR head |
| 2026-09-08 | guarded Supabase Preview promotion | 0 | Exact-head guard required `20260831220554`; all five pending forward migrations committed together; final ledger head `20260907210213` |
| 2026-09-08 | hosted object/security invariant query | 0 | Nine state functions, nine service-role grants, zero public/anon/authenticated execute grants, append-only event trigger, four READY guards, and no browser schema/table access |
| 2026-09-08 | hosted rollback-only state-machine smoke | 0 | Synthetic claim → heartbeat → success/replay and reserve → settle/replay/accounting passed; rollback left zero users, source versions, jobs, job events, reservations, and ledger rows |
| 2026-09-08 | Supabase security and performance advisors | 0 | Both reported 0 errors and 0 warnings after promotion |
| 2026-09-08T10:28:34Z | Vercel production build `6uMepeBP1G5bapL9mCt2AbEn5wC3` | 0 | Ready in 45 seconds from exact reviewed commit `576f1d6`; promoted to `project-xwrez.vercel.app` with release marker `wp02-t07-576f1d6-preview` |
| 2026-09-08 | Vercel environment/config inspection | 0 | Required Supabase public/server variables were present for Production and Preview; public URL routed to Preview ref `ynlaejacnakvinlpthnb`; provider mode `mock`; approved provider budget `0`; generation, embedding, transcription, and telemetry switches `false` |
| 2026-09-08 | `corepack pnpm smoke:deployment -- --base-url https://project-xwrez.vercel.app --target preview` | 0 | Six checks passed: live/ready GET bodies and no-store headers, POST 405 denials, application identity, synthetic/mock-only guard |
| 2026-09-08 | production browser and deployment-scoped logs | 0 | Browser title `UniMind`; `Synthetic only` and `Mock only` visible; no approved-real marker; logs showed expected 200/405 requests and 0 warning/error/fatal messages |

GitHub artifacts for the exact candidate:

- Database report `database-ci-test-reports-34192310589-1`, artifact `10042759426`, SHA-256 `7e368194846838674a280e5d015faddbd4c58f1615e1cea026ab4e3e19e41e7d`.
- Local report `local-test-reports-34192310589-1`, artifact `10042658654`, SHA-256 `18887147daf3fd001796dc80450ea15de5dcb284c337d55affa4fb3a404855af`.

The hosted migration ledger stores SQL entered by the dashboard with CRLF normalization. Its T07 statement is 41,009 bytes and hashes to `b54d6cb4866ce8527a1c8337ddc6a60c1f3e376e0d6d305a3cc926306c3636f7`; converting those line endings to the repository's LF form produces the release fingerprint above. The executed SQL is otherwise identical.

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Evidence |
| --- | --- | --- | --- | --- |
| Two workers claim one job | Exactly one job/worker ownership result | Independent sessions serialized correctly | PASS | `test-results/transactional-concurrency.json` in database artifact |
| Wrong or stale lease owner completes a job | Denied without terminal mutation | Denied for heartbeat/success/failure paths | PASS | pgTAP 20 |
| Retry becomes due | New worker can claim; old owner cannot finish | Canonical retry schedule and renewed ownership enforced | PASS | pgTAP 20 |
| Two reservations use one key | One canonical reservation and one reserved ledger event | Both sessions received the same row with one ledger result | PASS | concurrency report |
| Two settlements race | One terminal accounting result, no duplicate ledger units | Settlement serialized and replay returned the canonical row | PASS | concurrency report |
| Negative, over-, second, or cross-transition settlement | Rejected without ledger drift | All rejected with exact ledger counts unchanged | PASS | pgTAP 21 |
| READY prerequisite/dependency loss | Transition or invalidating dependency mutation rejected | Processed document, segment, quality, and embedding-config guards passed | PASS | pgTAP 22 |
| Hosted smoke residue | No synthetic rows remain | All seven post-rollback counts were zero | PASS | hosted final verification row |

## Review and correction loop

1. Run `34190134084` exposed a duplicated source-B embedding fixture; the fixture was corrected to reuse its baseline embedding.
2. Run `34190600717` exposed an append-only embedding mutation; the fixture was made valid at insertion time instead of weakening the append-only policy.
3. Run `34191036327` exposed retrieval canaries that bypassed the new READY prerequisites; they now build the complete processed/segment/embedding/quality chain before transitioning READY.
4. Run `34191545758` exposed the same invalid direct-READY shortcut in the 512-unit query-plan fixture; the generated fixture now creates the full processing chain first.
5. The next candidate was superseded while CI was running. Final self-review then found that a settlement's derived `:unused` ledger key could be replayed through a different transition; `576f1d6` binds terminal replay to the expected reservation state and includes the regression.
6. Final run `34192310589` passed every required check. The repository owner recorded `APPROVED` at this exact head on 2026-09-08T06:04:59Z. PR `#20` merged at 2026-09-08T06:05:40Z, and merged-main run `34193197926` passed.
7. Production inspection found that the otherwise healthy promoted build still rendered the old WP01 release identifier. `NEXT_PUBLIC_RELEASE_ID` was corrected to `wp02-t07-576f1d6-preview`, the exact reviewed commit was rebuilt without the old build cache as deployment `6uMepeBP1G5bapL9mCt2AbEn5wC3`, promoted, and revalidated through the browser, public smoke, project card, and deployment-scoped logs.

## Shared-environment promotion

- Target: active synthetic-only Supabase Preview project `ynlaejacnakvinlpthnb` in AWS `eu-central-1`.
- Preflight: migration head `20260831220554`, no READY sources, no usage reservations, no running jobs, and no user/source fixture rows.
- Guard: the promotion aborted unless the ledger head exactly matched `20260831220554`; all five pending forward migrations and their ledger rows executed in one transaction.
- Postflight: head `20260907210213`; T07 object, grant, trigger, idempotency, accounting, and rollback invariants passed; security and performance advisors each reported 0 errors and 0 warnings.
- The paused Beta project `txujaxstgjfeeugdrjte` was neither awakened nor mutated. No reset, destructive migration, real data, provider call, nonzero budget, content release/unlock, rights mutation, or raw deletion occurred.

Ahmed's 2026-09-08 standing authorization explicitly covered this task's code, PR, merge, Supabase promotion, Vercel deployment, and production verification and stated that both Ahmed and Ziad approved the work. Under decision D-22, this records Ahmed's own confirmation and Ahmed's named relay of Ziad's separate confirmation. The four pre-T07 migrations already carried their exact protected confirmations in the WP02-T04 and WP02-T06 evidence; the atomic promotion introduced no new policy change.

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden database roles/scopes were tested locally, in disposable CI, and on hosted Preview.
- [x] Migration source, generated types, full diff, logs, browser output, environment routing, and client artifacts were inspected.
- [x] No paid call, live provider, real source, student data, or durable hosted synthetic fixture was used.

## Rollback/disable procedure

No live application or worker calls these new private functions yet, so immediate disablement is to keep later callers disabled. Because the migration is promoted, do not rewrite it or reset Preview. If a defect is found, preserve `job_events`, `job_attempts`, `usage_ledger`, reservations, and jobs; apply a reviewed forward repair that revokes affected entry-point execution until corrected. Vercel can instant-roll back from deployment `6uMepeBP1G5bapL9mCt2AbEn5wC3` to the prior known-ready deployment without changing the database.

## Decision

PASS. WP02-T07 meets its transactional, replay, concurrency, READY-integrity, least-privilege, delivery, and production-verification criteria. The application remains deliberately synthetic/mock-only; later work packages may adopt these private APIs but no T07 requirement remains open.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor and technical reviewer | PASS | 2026-09-08 |
| `unimind989-sys` | Repository owner review at exact PR head | APPROVED | 2026-09-08 |
| Ahmed | Ordinary checkpoint and shared-promotion confirmation | APPROVED | 2026-09-08 |
| Ziad (named confirmation relayed by Ahmed) | Shared-promotion confirmation | APPROVED | 2026-09-08 |
