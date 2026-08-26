# Gate report: WP01-T07 test layers

**Status:** PASS

**Environment:** Credential-free local synthetic/mock suites plus the reviewed synthetic-only hosted Supabase development Auth seam

**Commit SHA:** `1783d7eac56cc35f1d46ec81eb94347c082844f1`

**Release/config fingerprint:** Development Supabase `sha256:5575d1c3d806`; Vitest projects `unit`, `integration`, `security`, `evaluation`, `load`; Playwright Chromium 1.62.1; Node 24.19.0; pnpm 10.34.5

**Migrations:** None; this task relies on reviewed WP01-T04 migration/reset evidence at `evidence/wp01-foundation/2026-08-25_hosted-supabase_development-ci_b444a5d.md`

**Dataset/fixture versions:** `foundation-availability-v1` (`sha256:4b54ff7b2e2ca90059ddf427b467a87fa59cad50bf1b4e765e39e97f6913e651`); `synthetic-load-fixtures-v1`; hosted `wp01-foundation-v1`

**Executor:** Codex `/root`

**Independent reviewer:** Ahmed — PASS (2026-08-26)

**Started/finished (UTC):** 2026-08-26T03:12Z / executor verification finished 2026-08-26T03:36Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Explicit bounded projects | Unit, integration, security, E2E, evaluation, and load have visible timeouts and no retries that hide hangs | Vitest projects use 2–30 second test/hook bounds; Playwright uses a 15-second test and 5-second expectation timeout, one worker, zero retries | PASS | `vitest.config.ts`; `playwright.config.ts` |
| Unit seam | Pure rules/validators execute without network/database/Next.js boot | 13 files, 193 tests passed | PASS | `test-results/vitest/unit.json` (ignored reproducible output) |
| Integration seam | Deterministic mock integration is local; hosted Auth is explicit and guarded | Local provider seam passed with hosted case visibly skipped; explicit hosted command passed synthetic create/sign-in/refresh/forgery denial/cleanup | PASS | `provider-mock.integration.test.ts`; `supabase-auth-hosted.test.ts`; command results below |
| Security seam | Multiple users/cohorts/roles/source states cover allowed and forbidden outcomes at implemented WP01 seams | 8 identity/availability tests passed; forged authority and cross-cohort/non-READY cases denied | PASS | `test-results/vitest/security.json` |
| Browser seam | Public app works under synthetic local state and external browser requests are blocked | Chromium journey passed; page showed `Synthetic only` and `Mock only`, with no real-mode indicator | PASS | `test-results/e2e/results.json` |
| Evaluation seam | Versioned JSONL produces fingerprinted machine-readable and Markdown reports | 3/3 synthetic foundation cases passed; malformed/mismatched cases identify line/path/case | PASS | `test-results/evaluation/` (ignored reproducible output) |
| Load seam | Safe default rejects shared/live/paid targets and cannot claim workload execution | 5 guard tests passed; 8 phases, 100 maximum virtual users, 1,111 declared actions, cost 0; report says `NOT_EXECUTED` | PASS | `test-results/load/` (ignored reproducible output) |
| Complete merge gate | `pnpm verify` remains credential-free for required execution and zero-paid-call | Format, lint, types, boundaries, five Vitest projects, E2E, build, and client-secret scan passed | PASS | Command results below |
| Stable report coexistence | Later suites do not erase earlier machine output | Vitest JSON for all five projects plus E2E, evaluation, and load outputs coexist after the full gate | PASS | Post-gate `test-results/` inventory |
| Independent review | Reviewer inspects the evidence and records PASS or defects | Ahmed approved the submitted candidate and evidence on 2026-08-26 | PASS | Reviewer decision below |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-26 03:12 | Baseline `corepack pnpm verify` | 0 | Existing format/lint/types/boundaries/193 unit/build/secret-scan gate passed before edits |
| 2026-08-26 03:15 | Red load test before implementation | 1 expected | Failed because `scripts/lib/load-profile` did not yet exist |
| 2026-08-26 03:16 | Load unit plus dry-run CLI | 0 | 5 guard tests passed; local-mock profile validated without workload execution |
| 2026-08-26 03:17 | Red evaluation test before implementation | 1 expected | Failed because the evaluation runner did not yet exist |
| 2026-08-26 03:18 | Evaluation unit plus report CLI | 0 | 3 synthetic JSONL cases passed and reports emitted |
| 2026-08-26 03:19 | Red E2E run before browser runtime installation | 1 expected | Actionable Playwright diagnostic named the missing pinned Chromium binary |
| 2026-08-26 03:21 | Unit/integration/security/evaluation/load layer commands | 0 | 193 unit; 1 local integration with 1 hosted skip; 8 security; 3 evaluation; 5 load tests passed |
| 2026-08-26 03:25 | `corepack pnpm exec playwright install chromium` | 0 | Pinned Chromium and headless shell installed; no repository credential or paid provider involved |
| 2026-08-26 03:26 | `corepack pnpm test:e2e` | 0 | 1 Chromium synthetic/mock browser journey passed |
| 2026-08-26 03:26 | Incorrect `corepack pnpm db:metadata -- --environment development` | 1 | Wrapper rejected the extra separator before any request; command typo corrected below |
| 2026-08-26 03:26 | `corepack pnpm test:integration:hosted` | 0 | 2 integration tests passed, including synthetic hosted Auth create/sign-in/refresh/forgery denial/cleanup; forged-cookie parser warnings were expected diagnostics |
| 2026-08-26 03:27 | `corepack pnpm db:metadata --environment development` | 0 | Approved fingerprint; PostgreSQL 17.6; vector 0.8.2; pgcrypto 1.3; 3 fixtures/canaries; private schema denied |
| 2026-08-26 03:29 | Focused `corepack pnpm test:unit -- env` | 0 | Exactly 1 file and 9 environment tests passed |
| 2026-08-26 03:30 | First complete `corepack pnpm verify` | 0 | Full gate passed; inspection found Playwright artifact cleanup had removed some earlier JSON reports |
| 2026-08-26 03:33 | Evaluation plus readiness/handoff verification | 0 | Renamed evaluation test to project kebab-case; 103 names, 31 links, 21 decisions, 102 task contracts, and isolated handoff passed |
| 2026-08-26 03:35 | Final complete `corepack pnpm verify` | 0 | Full gate passed after narrowing Playwright output cleanup; all layer outputs coexist |
| 2026-08-26 03:36 | `git diff --check` and post-gate report inventory | 0 | No whitespace errors; five Vitest JSON files and E2E/evaluation/load reports present |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Unit invalid configuration/domain facts | Validator/rule fails with stable field/reason | Existing env/availability negative matrices passed | PASS | Unit JSON report |
| Integration network attempt | Deterministic provider remains offline and zero-cost | Fetch remained unused; cost was zero | PASS | `provider-mock.integration.test.ts` |
| Forged Auth authority | Signature failure or user-editable role/cohort cannot authorize | Local security and hosted forged-cookie checks denied access | PASS | Security JSON; hosted command |
| Cross-cohort/non-READY access | Derived availability denies with exact reason | `membership_missing` and `ready_source_missing` returned | PASS | Security JSON report |
| Malformed evaluation JSONL | Name line and failing schema path | Line/path diagnostic asserted | PASS | Evaluation test/report |
| Wrong evaluation expectation | Name exact case and actual/expected boundary | `deny-missing-membership` mismatch diagnostic asserted | PASS | Evaluation test/report |
| Preview/beta/production load target | Reject before execution | All three names rejected by default profile | PASS | Load test/report |
| Real provider or nonzero load cost | Reject before execution | Both profiles rejected with explicit message | PASS | Load test/report |
| Browser external request | Abort instead of reaching external service | Route guard blocks non-local hostnames | PASS | E2E test/report |
| Hanging/flaky code | Bounded timeout and no automatic retry | Explicit 2–30 second test/hook bounds; zero retries | PASS | Runner configs |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T07-D01 | Resolved | First metadata command included an extra PowerShell separator; wrapper rejected it before a request. The documented command then passed. | Codex | Resolved in session | No |
| WP01-T07-D02 | Resolved | Initial Playwright output used the default `test-results/` artifact root and removed earlier layer JSON during cleanup. Output is now isolated to `test-results/e2e/artifacts`. | Codex | Resolved in candidate | No |
| WP01-T07-LIMIT-01 | Informational | WP01 security covers verified identity and derived availability, not future WP02 grants/RLS matrices. | WP02 executor/reviewer | WP02 | No for WP01-T07; blocks any RLS-complete claim |
| WP01-T07-LIMIT-02 | Informational | Foundation JSONL proves the runner contract only; academically reviewed tutor/Studio data remains blocked by WP00 cohort decisions. | Product/academic owners | WP00-T05 | No for WP01-T07; blocks academic quality claims |
| WP01-T07-LIMIT-03 | Informational | Load output is profile validation marked `NOT_EXECUTED`; WP09 owns workload execution, thresholds, reconciliation, and independent load review. | WP09 executor/reviewer | WP09 | No for WP01-T07; blocks capacity/performance claims |
| WP01-T07-REVIEW-01 | Resolved | Ahmed independently approved candidate `1783d7e` and the submitted evidence. | Ahmed | Resolved 2026-08-26 | No |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden roles/scopes were tested where applicable.
- [x] Logs and browser output were inspected; credential-pattern matches were limited to synthetic fixtures, environment variable names, and the literal Supabase key type under test.
- [x] Local/preview/beta/production load targets and real providers are rejected by the ordinary profiles.
- [x] Hosted development metadata matched the reviewed safe fingerprint, and the temporary synthetic Auth user was deleted by cleanup.

## Rollback/disable procedure

Revert candidate `1783d7eac56cc35f1d46ec81eb94347c082844f1`. The generated `test-results/`, Playwright browser runtime, and local credentials are ignored workstation state and may be removed independently. No migration, provider enablement, preview/beta target, real data, or durable shared-environment change was introduced; the hosted Auth fixture was deleted by the test cleanup.

## Decision

Executor verification and Ahmed's independent approval satisfy the implemented WP01-T07 contract while preserving explicit non-claims for RLS, academic evaluation, and load execution. WP01-T08 may now proceed through the reviewed mock-only foundation path.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | READY FOR REVIEW | 2026-08-26 |
| Ahmed | Independent reviewer | PASS | 2026-08-26 |
