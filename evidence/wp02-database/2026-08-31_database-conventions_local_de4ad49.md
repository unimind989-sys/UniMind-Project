# Gate report: WP02-T01 database conventions

**Status:** PASS

**Environment:** Local synthetic/migration-static verification

**Commit SHA:** `de4ad497c69c5cff838e1f2bb8e24ae8fcb30eef`

**Release/config fingerprint:** Node.js `24.19.0`; pnpm `10.34.5`; Supabase CLI `2.115.0`; no deployment, shared database, credential, provider, or paid configuration used

**Migrations:** Existing `20260824235549_extensions_and_schemas.sql`; WP02-T01 added no migration or database state

**Dataset/fixture versions:** Existing synthetic foundation fixtures only; no private source or student data

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed — ordinary completion and full-review authorization supplied in chat on 2026-08-31; protected gates excluded

**Started/finished (UTC):** 2026-08-31T02:09:23Z / 2026-08-31T02:32:27Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Durable database-boundary decision | Schema exposure, grants/RLS, IDs, UTC time, constraints, state/history, indexes, and forward migration direction are explicit | ADR-0002 records the selected direction, rejected alternatives, and consequences | PASS | `docs/adr/0002-database-boundaries.md` |
| Repeatable semantic review | Every WP02-T01 convention has a migration-review checkpoint | Checklist covers readiness, schema/data, access/functions, indexing/safety, verification, evidence, and protected-gate stops | PASS | `docs/runbooks/database-migration-checklist.md` |
| Automated mechanical rules | Current migrations pass and unsafe fixtures fail with stable violations | `check:sql` audits filename, schema qualification, `created_at`, timezone, public UUID keys, serial types, grants, and privileged functions | PASS | `scripts/lib/sql-conventions.ts`; `scripts/check-sql-conventions.ts` |
| Negative and false-positive coverage | Every automated rule has a representative forbidden or safe case | 10 focused tests pass, including a comment-spoof regression and masked comments/string bodies | PASS | `tests/unit/sql-conventions.test.ts` |
| Zero-cost merge-gate integration | The checker runs in normal local/PR verification with no external service | `pnpm verify` includes `pnpm check:sql` and exits 0 | PASS | `package.json`; full gate output |
| Fresh-agent handoff | A clean committed snapshot discovers and resumes the task without chat | Isolated rehearsal identifies WP02-T01, seven active records, and passes readiness | PASS | Handoff command output |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-31 session | `corepack pnpm install --frozen-lockfile` | 0 | Reproduced 649 pinned packages; lockfile unchanged |
| 2026-08-31 session | `corepack pnpm test:unit -- tests/unit/sql-conventions.test.ts` | 0 | 10/10 final focused cases passed |
| 2026-08-31 session | `corepack pnpm check:sql` | 0 | One current versioned migration passed |
| 2026-08-31 session | `corepack pnpm verify` against final candidate | 0 | Format, lint, strict types, boundaries, SQL/CI/secret audits, 242 unit tests, credential-free integration, 8 security tests, 3 evaluation cases, 5 guarded load-profile tests, 2 Chromium tests, production build, and client-artifact secret scan passed |
| 2026-08-31 session | `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | 0 | 136 governed names, 43 local links, 22 synchronized decisions, and 102 task contracts passed |
| 2026-08-31 session | `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` | 0 | Isolated committed snapshot and clean-worktree handoff passed |
| 2026-08-31 session | `git diff --cached --check` plus full 12-file candidate diff review | 0 | No whitespace error, unrelated change, secret, private data, migration, or external-state change remained |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Invalid filename or unqualified table | Stable violation | `INVALID_MIGRATION_FILENAME` and `UNQUALIFIED_TABLE` returned | PASS | Focused unit report |
| Missing/unsafe time metadata | Stable violation | Missing `created_at` and timezone-naive `timestamp` rejected | PASS | Focused unit report |
| Non-UUID exposed identity | Stable violation | Public text primary key rejected; inline/composite UUID keys accepted | PASS | Focused unit report |
| Broad capability grant | Stable violation | Legacy serial, `GRANT ALL`, `TO PUBLIC`, and default privilege grants rejected | PASS | Focused unit report |
| Unsafe privileged function | Stable violation despite misleading comment | Exposed function, missing/unsafe empty search path, and missing `PUBLIC` revoke rejected | PASS | Comment-spoof regression |
| Deterministic replay | Same migration set returns the same result | Focused suite, direct checker, and two complete verify runs accepted the same repository migration | PASS | Command outputs |
| Recovery | Remove only this task's conventions/checker integration | Revert `de4ad49`; no shared database or external state requires rollback | PASS | Git history |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| CLOSED-01 | None | Initial focused command found missing `node_modules`; frozen install restored the exact lockfile graph | Codex `/root` | Closed | No |
| CLOSED-02 | None | First complete gate stopped on the new command-table row's formatting; one-file formatting fixed it before later checks ran | Codex `/root` | Closed | No |
| CLOSED-03 | Medium during review | Initial privileged-function rule could be spoofed by safe text in a comment; a red regression reproduced it and position-bound validation fixed it | Codex `/root` | Closed | No |

No open defect or accepted deviation remains.

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden SQL forms were tested where applicable; this task does not implement application RLS policies or claim the protected RLS gate.
- [x] Repository, build, browser, and evidence outputs were inspected where applicable.

## Rollback/disable procedure

Revert implementation commit `de4ad49`. This removes ADR-0002, the checklist, `check:sql`, its tests, and command documentation. No migration, deployment, provider, shared database, or runtime capability changed, so no external rollback is required.

## Decision

PASS. WP02-T01 establishes the database conventions and enforces the mechanical subset in the zero-cost gate. Ahmed's ordinary authorization covers completion and full review of this task only. WP02-T04's RLS gate and all rights, raw-deletion, budget, release/unlock, and beta gates still require their documented separate confirmations.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | PASS — implementation, negative cases, full gate, diff, and handoff reviewed | 2026-08-31 |
| Ahmed | Ordinary human checkpoint | PASS — completion and full-review authority granted in chat; protected gates excluded | 2026-08-31 |
