# Gate report: WP01-T08 disposable database CI candidate

**Status:** CONDITIONAL PASS

**Environment:** local policy/tests and isolated committed snapshot

**Commit SHA:** `82d6be89d1994a298a2dabcb9643749e9007917e`

**Release/config fingerprint:** GitHub-hosted `ubuntu-24.04`; Node 24.19.0; pnpm 10.34.5; Supabase CLI 2.115.0

**Migrations:** Versioned `supabase/migrations/`; not executed locally because founder workstations are excluded from the disposable stack

**Dataset/fixture versions:** `supabase/seed.sql`; synthetic Auth fixture marker `wp01-t05-synthetic-auth`

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed pending external-run evidence

**Started/finished (UTC):** 2026-08-27 / 2026-08-27T21:54:42Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Public-PR-safe database job | No secret expression, protected environment, persistent project, or main-only gate | `database-ci` runs on PR/push/manual after `application` with read-only repository permission | PASS | Workflow policy and candidate diff |
| GitHub-hosted runner only | Exact Linux hosted-runner guard before CLI execution | Requires `GITHUB_ACTIONS=true`, `RUNNER_ENVIRONMENT=github-hosted`, `RUNNER_OS=Linux`; workstation invocation rejected | PASS | Guard unit tests and negative command |
| Disposable lifecycle | Start, two resets, migration parity, types, Auth/security, cleanup | Workflow and policy require the full lifecycle and `if: always()` stop with `--no-backup` | PASS (static) | `.github/workflows/ci.yml`; policy tests |
| Local credential containment | Status values captured without log output; API must be loopback | Strict parser requires loopback HTTP and passes values only to the child test process | PASS | Unit tests and source review |
| Actual database behavior | Two real resets, stable generated types, Auth flow, security tests, cleanup | Requires a GitHub-hosted run | PENDING | External WP01-T08 evidence |
| Existing projects preserved | No repurpose or external secret/environment deletion before replacement proof | Both projects and external settings untouched | PASS | Task/environment records |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-27 | Initial CI policy test against old workflow | 1 expected | Six new-policy cases failed before implementation |
| 2026-08-27 | Focused CI policy and ephemeral guard tests | 0 | 16 tests passed |
| 2026-08-27 | `corepack pnpm db:ci:start` on workstation | 1 expected | Rejected before Supabase invocation: GitHub-hosted Linux runner required |
| 2026-08-27 | `corepack pnpm verify` | 0 | Format, lint, types, boundaries, CI policy, 623-file secret scan, 225 unit tests, integration/security/evaluation/load, two Playwright checks, build, client scan |
| 2026-08-27 | `scripts/verify-agent-readiness.ps1` | 0 | 122 names, 37 links, 22 decisions, 102 task contracts |
| 2026-08-27 | `scripts/test-agent-handoff.ps1` after commit | 0 | Clean isolated snapshot selected WP01-T08 with 10 durable active records |
| 2026-08-27 | `git show --check --stat --oneline 82d6be8` | 0 | No whitespace error; coherent 17-file candidate |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Founder workstation invokes stack | Reject before Docker/Supabase | Rejected with exact runner requirement | PASS | Local command output |
| Pull-request code needs database gate | Run without repository secrets | Job has no `if`, environment, or secret expression | PASS (static) | Workflow policy |
| First lifecycle command fails | Cleanup and report upload still run | Both steps use `if: always()` | PASS (static) | Workflow policy |
| Generated types drift | Fail candidate | `db:ci:types` precedes `db:types:check` | PASS (static) | Workflow policy |
| Remote project access attempted | No project reference/token exists; local-only flags required | Wrapper uses `--local`; parser accepts loopback API only | PASS | Unit tests/source review |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T08-EXT | Required | No GitHub-hosted container run exists for candidate `82d6be8` | Codex executor + Ahmed authorization/review | Next external checkpoint | WP01-T08 PASS; hosted secret retirement; WP01-T09 repurposing |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Policy rejects secret expressions, protected environments, self-hosted/non-Linux execution, Preview/Beta use, and incomplete cleanup.
- [x] Repository and client-artifact secret scans passed.

## Rollback/disable procedure

Revert candidate commit `82d6be8` if the external job is unsafe or cannot be corrected narrowly. Until the external run passes, preserve the existing hosted CI project, protected environment, and secrets; do not repurpose either Supabase project.

## Decision

CONDITIONAL PASS for local implementation evidence. The only missing acceptance criterion is execution of the complete lifecycle on a standard GitHub-hosted runner. WP01-T08, hosted secret retirement, and WP01-T09 project repurposing remain blocked until that result is reviewed.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | CONDITIONAL PASS — local candidate ready for external run | 2026-08-27 |
| Ahmed | Human checkpoint | Pending review of the external GitHub run | Pending |
