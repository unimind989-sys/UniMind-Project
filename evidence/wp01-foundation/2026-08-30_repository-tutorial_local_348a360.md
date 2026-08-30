# Gate report: WP01-T10 repository operation tutorial

**Status:** IN PROGRESS — EXECUTOR CHECKS PASS; INDEPENDENT REHEARSAL AND HUMAN CHECKPOINT PENDING

**Environment:** local workstation and isolated clean clone

**Commit SHA:** `348a36087e4eab619c236dd45c3dab2c15c547d0`

**Release/config fingerprint:** `wp01-t10-348a360`; mock-only workstation; disposable database/Auth CI; protected synthetic Preview; locked empty Beta

**Migrations:** No migration change; existing versioned foundation migrations only

**Dataset/fixture versions:** Existing committed synthetic foundation fixtures; load profile `unimind-100-student-v1` validated without execution

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed — pending review of this candidate and report

**Started/finished (UTC):** 2026-08-30T04:04:25Z / executor checks finished 2026-08-30T04:13:52Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Deterministic task selection | Clean repository state recommends dependency-valid WP01-T10 | Source and isolated committed snapshot both selected WP01-T10 through the reviewed WP00 mock bridge | PASS | `scripts/show-work-state.ps1`; `scripts/test-agent-handoff.ps1` |
| Current environment workflow | Tutorial names mock workstations, disposable database/Auth CI, protected synthetic Preview, and locked empty Beta without transitional claims | Active tutorial and test-layer guidance match D-21, ADR-0001, the environment matrix, and completed WP01-T08/T09 evidence | PASS | `CONTRIBUTING.md`; `tests/README.md`; `tests/integration/README.md` |
| Command parity | Every `package.json` script is discoverable with purpose and safety context | All 34 package scripts are present; retired hosted seams have no approved target and are explicitly non-runnable | PASS | PowerShell command-parity check; `CONTRIBUTING.md` section 7 |
| Clean-clone setup | Frozen install succeeds without repository credentials or private configuration | Local clone of candidate `348a360` installed all 649 locked packages with pnpm `10.34.5`; no `.env.local` or hosted profile was used | PASS | Clean-clone command output |
| Credential-free merge gate | Full zero-cost verification passes from the clean clone | Formatting, lint, types, boundaries, CI policy, 631-file secret scan, 230 unit tests, integration/security/evaluation/load gates, two Chromium tests, production build, and client-artifact scan passed | PASS | `corepack pnpm verify`, exit 0 |
| Disposable database/Auth path | A fresh reader can identify the exact runner-only lifecycle and prior reviewed proof | Tutorial points to `.github/workflows/ci.yml`; application precedes `database-ci`, which starts, resets twice, checks migrations/types/Auth/security, and always cleans up | PASS | `CONTRIBUTING.md` section 5.1; `evidence/wp01-foundation/2026-08-28_ci-disposable-database_github_c1428f2.md` |
| Preview/Beta boundaries | Tutorial reaches approved smoke, isolation, lock, promotion, and rollback rules without exposing credentials | Preview remains protected synthetic/mock-only; Beta remains protected, empty, Git-disconnected, and unreleased; protected gates remain explicit | PASS | `CONTRIBUTING.md` section 5.2; `planning/environment-matrix.md`; final WP01-T09 Preview/Beta evidence |
| Independent fresh-agent walkthrough | A separate agent follows the tutorial without chat history and records ambiguities | Deterministic no-chat handoff script and same-agent clean clone passed; a separate agent walkthrough is still required by the task wording | PENDING | Reviewer/fresh-agent action |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-30 | `pwsh -NoProfile -File scripts/show-work-state.ps1` | 0 | WP01-T10 selected as `IN_PROGRESS`; stale `NONE` routing defect closed |
| 2026-08-30 | `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | 0 | 129 names, 37 local links, 22 synchronized decisions, and 102 task contracts passed |
| 2026-08-30 | package-script parity check | 0 | All 34 package scripts appear in the tutorial |
| 2026-08-30 | `corepack pnpm verify` in source checkout | 0 | Complete credential-free zero-paid gate passed |
| 2026-08-30 | `git show --check --stat --oneline 348a360` | 0 | Candidate commit has no whitespace defect |
| 2026-08-30 | `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | 0 | Isolated committed snapshot stayed clean and selected WP01-T10 |
| 2026-08-30 | clean clone, `corepack pnpm install --frozen-lockfile` | 0 | Frozen graph reproduced with 649 packages and pnpm `10.34.5` |
| 2026-08-30 | clean clone, `corepack pnpm verify` | 0 | Full local gate passed; hosted Auth case skipped by design and disposable database/Auth CI remains runner-only |
| 2026-08-30 | clean-clone status/parity/stale-language checks | 0 | Clean branch; 34-script parity; no active WP01-T08 transitional wording |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Historical hosted commands | Tutorial must not invite reuse of retired profiles or Preview/Beta credentials | Commands are labeled retired, without an approved target, and routed to disposable CI or the promotion runbook | PASS | WP01-T10-RETIRED-SEAMS |
| Unquoted Windows path in orchestration | A path containing spaces must be quoted or used as the working directory | One `pnpm --dir` invocation failed before project execution; rerunning from the clone directory exactly as documented passed | PASS | WP01-T10-WINDOWS-PATH |
| Nested clean clone | A clone under the source repository must not change build behavior | Next.js emitted a non-fatal outer-workspace warning; all E2E and build checks passed. A normal external clone will not see the outer workspace | PASS | WP01-T10-NESTED-CLONE |
| Rehearsal cleanup | Temporary work must remain ignored and must not be removed by bypassing host safety controls | Host policy rejected recursive deletion after path verification; the ignored `.local/wp01-t10-clean-clone-348a360` clone remains local and contains no configured secret | PASS | WP01-T10-CLEANUP-GUARD |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T10-INDEPENDENT | Required checkpoint | A separate fresh agent has not yet performed the walkthrough; deterministic no-chat and clean-clone rehearsals passed | Ahmed / delegated fresh agent | Before WP01-T10 PASS | WP01-T10 completion and WP01-T11 |
| WP01-T10-REVIEW | Required checkpoint | Ahmed has not yet inspected the candidate diff and this evidence report | Ahmed | Before WP01-T10 PASS | WP01-T10 completion and WP01-T11 |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden scopes were tested where applicable: workstation and verification remain mock-only; disposable CI rejects non-runner execution; retired hosted seams have no approved target; Preview/Beta destructive use remains forbidden.
- [x] Local logs and generated browser/build output were inspected; the repository and client-artifact secret scans passed.

## Rollback/disable procedure

Revert commit `348a360` and the later evidence/task-state commit. This restores the prior tutorial only; it does not modify application behavior, database state, credentials, Preview/Beta deployments, or provider configuration. Keep Preview protected and Beta locked throughout rollback.

## Decision

Executor checks pass. The tutorial is synchronized with the completed environment topology, all 34 package commands are discoverable, and both the source checkout and isolated clean clone pass the zero-cost gate. WP01-T10 remains in progress until a separate fresh-agent walkthrough and Ahmed's evidence review are recorded; WP01-T11 remains blocked.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | EXECUTOR PASS | 2026-08-30 |
| Ahmed | Human checkpoint | PENDING | — |
