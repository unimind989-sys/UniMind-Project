# Gate report: WP01-T04 hosted Supabase foundation

**Status:** PASS

**Environment:** Separate hosted Supabase development and CI projects; synthetic data only

**Commit SHA:** `b444a5d906bd03631c37c150072d55977c866f53`

**Release/config fingerprint:** Development `sha256:5575d1c3d806`; CI `sha256:6ad364ad022a`

**Migrations:** `20260824235549_extensions_and_schemas.sql`

**Dataset/fixture versions:** `wp01-foundation-v1`; three private synthetic fixtures and three unique leakage canaries

**Executor:** Codex `/root`

**Independent reviewer:** Ahmed — PASS (2026-08-25)

**Started/finished (UTC):** 2026-08-24T23:55:49Z / executor verification finished 2026-08-25T00:13:41Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Hosted isolation | Different development/CI targets; no preview/beta reuse | Different hashed fingerprints; CI has no GitHub connection | PASS | `planning/environment-matrix.md`; guarded profile results |
| Zero-charge/synthetic scope | Both targets remain free and contain synthetic fixtures only | Ahmed confirmed zero charge; seed contains only labeled synthetic catalog, identity metadata, and source text | PASS | `supabase/seed.sql`; provisioning handoff |
| Versioned database state | Config, CLI-named migration, seed, and types reproduce from Git | One migration applies cleanly with seed on both targets | PASS | `supabase/config.toml`; migration list/reset output |
| Consecutive resets | Two successful guarded resets per target | Development 2/2; CI 2/2 | PASS | Sanitized command results below |
| Generated-type stability | Same hash after each reset and across targets | `sha256:abb811213bde78031b8fc3731a5041c9118f3f5898fd9e759cc29656b5985f22` | PASS | `src/types/database.generated.ts`; hash comparison |
| Hosted versions | PostgreSQL and required extensions recorded on both targets | PostgreSQL 17.6; vector 0.8.2; pgcrypto 1.3 | PASS | `pnpm db:metadata` sanitized output |
| Fixture/isolation check | Three fixtures/canaries; private schema unavailable to exposed roles | 3 fixtures; 3 canaries; `anon` and `authenticated` usage denied on both targets | PASS | Read-only metadata query |
| Credential hygiene | No credential, full project ref, shared email, JWT, or connection string committed | Scan found no real match; full references and secrets remain under ignored `.local/` | PASS | `git check-ignore`; candidate scan; `git show --check` |
| Repository gate | Credential-free full gate passes | Format, lint, types, boundaries, 159 unit tests, and production build pass | PASS | `pnpm verify` |
| Independent review | Ahmed reviews migration, grants, isolation, and GitHub integration | PASS recorded; development repository integration disconnected and CI publishable key stored locally | PASS | Reviewer decision below |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-24 | `pnpm db:migrations --environment development` | 0 | One local migration initially pending; later local/remote histories match |
| 2026-08-24 | `pnpm db:push:dry-run --environment development` | 0 | Exactly one migration would apply; no write |
| 2026-08-24 | `pnpm db:migrations --environment ci` | 0 | One local migration initially pending; later local/remote histories match |
| 2026-08-24 | `pnpm db:push:dry-run --environment ci` | 0 | Exactly one migration would apply; no write |
| 2026-08-24 | First development `pnpm db:reset --environment development` attempt | 1 | CLI rejected missing `--linked` before database change; regression fixed wrapper |
| 2026-08-24/25 | Corrected development reset/type sequence | 0 | Two resets applied migration/seed; identical type hashes |
| 2026-08-25 | CI reset/type sequence | 0 | Two resets applied migration/seed; identical CI and development type hashes |
| 2026-08-25 | `pnpm db:metadata --environment development` | 0 | Safe fingerprint, versions, 3 fixtures/canaries, private-schema denial |
| 2026-08-25 | `pnpm db:metadata --environment ci` | 0 | Same versions/fixture/isolation facts on separate safe fingerprint |
| 2026-08-25 | `pnpm test:unit -- hosted-supabase` | 0 | 8 files and 159 tests passed |
| 2026-08-25 | `pnpm verify` | 0 | Format, lint, strict types, boundaries, 159 tests, production build passed |
| 2026-08-25 | `scripts/verify-agent-readiness.ps1` | 0 | 91 names, 31 links, 21 decisions, and 102 task contracts passed |
| 2026-08-25 | `scripts/test-agent-handoff.ps1` | 0 | Isolated committed-snapshot handoff passed |
| 2026-08-25 | `git show --check --oneline b444a5d` | 0 | Candidate commit hygiene passed |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Local/preview/beta/production target | Rejected before command | Unit guard rejects every forbidden name | PASS | `hosted-supabase-target.test.ts` |
| Missing/mismatched reset confirmation | Rejected before reset | Exact environment/reference confirmation required | PASS | `hosted-supabase-target.test.ts` |
| Missing/placeholder/duplicate profile value | Reject without echoing value | Parser rejects and names only the field or line | PASS | `hosted-supabase-profile.test.ts` |
| CLI reset command drift | Failing command must not alter database; wrapper corrected | First attempt stopped before change; regression requires `--linked` plus project reference | PASS | `hosted-supabase-command.test.ts` |
| Required extension missing | Metadata gate fails | Parser rejects `missing` version | PASS | `hosted-supabase-metadata.test.ts` |
| Fixture loss or exposed private schema | Metadata gate fails | Both targets report complete fixtures and denied exposed-role usage | PASS | Metadata unit/live results |
| Experimental pg-delta requests Docker | No Docker dependency | Optional experimental cache disabled; subsequent resets emit no Docker warning | PASS | `supabase/config.toml`; reset output |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T04-D01 | Resolved | Initial reset wrapper omitted the pinned CLI's required `--linked`; attempt failed before database change | Codex | Resolved in candidate | No |
| WP01-T04-D02 | Resolved | Initial development database password was exposed in chat; Ahmed rotated it before any hosted command and updated only the ignored local file | Ahmed | Resolved before reset | No; old value remains compromised and must never be reused |
| WP01-T04-D03 | Resolved | Development project repository integration was disconnected before review PASS; GitHub sign-in identity is unaffected | Ahmed | Resolved 2026-08-25 | No |
| WP01-T04-D04 | Resolved | CI publishable key was stored in the ignored local profile before review PASS | Ahmed | Resolved 2026-08-25 | No |

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Allowed and forbidden roles/scopes were tested where applicable.
- [x] Logs and command output were inspected; only safe fingerprints and version/count facts are retained.
- [x] The exposed development password was rotated before hosted access and is absent from the candidate.
- [x] Independent reviewer confirms the private-schema grant revocations and development GitHub integration boundary.

## Rollback/disable procedure

Revoke the affected local access token and database password, stop hosted commands, and retain the versioned migration/seed. If either synthetic target is unreliable or incorrectly scoped, provision a new isolated zero-charge target only with renewed owner authorization, replay the migration/seed, regenerate types, and compare safe metadata. Never point development or CI at preview/beta and never repair schema state through the dashboard.

## Decision

Executor checks and Ahmed's independent review satisfy the WP01-T04 hosted foundation contract. Development and CI remain separate, synthetic-only, zero-charge targets; the development repository integration is disconnected, and WP01-T05 may proceed.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Executor | READY FOR REVIEW | 2026-08-25 |
| Ahmed | Reviewer | PASS | 2026-08-25 |
