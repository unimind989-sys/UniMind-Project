# Gate report: WP01-T11 foundation package gate

**Status:** PASS

**Environment:** Local clean candidate, disposable GitHub CI, protected synthetic Vercel Preview, and locked empty Beta

**Commit SHA:** Candidate `d7997eb4f89638f5c10e3a70ed8c9419a2f39717`

**Release/config fingerprint:** `wp01-t11-foundation-gate`; provider mode `mock`; approved provider budget `0`; Preview protected; Beta locked

**Migrations:** `20260824235549_extensions_and_schemas.sql`; applied twice from empty by disposable CI with stable generated types

**Dataset/fixture versions:** Existing committed synthetic foundation fixtures; load profile `unimind-100-student-v1`

**Agent executor:** Codex `/root`

**Human reviewer(s):** Ahmed — ordinary package checkpoint authorized in chat; no protected Beta unlock, release, or go-live action is in scope

**Started/finished (UTC):** 2026-08-30 / 2026-08-30

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Upstream readiness | WP01-T01 through WP01-T10 have reviewed PASS evidence | All task records are complete and link evidence | PASS | `planning/tasks/wp01-*.md` |
| Vercel target correctness | Reviewed commits deploy only as protected synthetic Preview until an explicit production promotion | Candidate deployed as protected Preview; repository policy disables `main`; automatic Production-domain assignment is disabled; fresh inventories after merge showed no deployment for `b1f34d4` | PASS | `vercel.json`; unit test; Vercel settings and deployments inventory |
| Clean reproducibility | Frozen clean clone passes the complete credential-free gate with provider endpoints blocked | Exact candidate installed 649 locked packages and passed `pnpm verify` with outbound HTTP/HTTPS directed to a closed loopback port | PASS | Clean-clone transcript; provider mock rejects attempted fetch |
| Disposable database repeatability | CI resets the disposable Supabase stack twice and generated types remain stable | Run `33323913701` passed both resets, migration parity, type drift, Auth/database integration, security, and cleanup | PASS | Job `99290748620`; artifact `9735729912` |
| Protected Preview | Exact candidate deploys as Preview and passes six protected smoke checks | READY; live/ready GET `200` with `no-store`, both POSTs `405`, application identity and synthetic/mock-only markers present | PASS | Deployment `8cQQwEHwBicq4jCm6PqMcYpz1nBC`; signed-in browser and authenticated CLI smoke |
| Secret hygiene | Repository, build output, logs, and evidence contain no secret patterns | Repository and client-artifact scans passed; Vercel values were never revealed; sanitized artifact digest matched | PASS | `pnpm scan:secrets`; `pnpm test:env-build`; Vercel logs/settings; artifact SHA-256 |
| Compatibility/version review | Supabase breaking changes and exact runtime/framework/database/extension versions are recorded | Current breaking-change feed reviewed; relevant changes are already handled or not used; exact inventory recorded below | PASS | Supabase changelog; runtime artifact |
| Cleanup | Every disposable clone, toolchain, server, and temporary access artifact is removed | Clean clone and failed artifact temp were deleted; downloaded artifact ZIP was deleted after verification; CLI-created bypass was revoked; no local `.vercel` directory remains | PASS | Cleanup read-backs; Vercel “Automation Bypass removed” confirmation |

## Commands executed

| UTC time | Command/test ID | Exit code | Sanitized report |
| --- | --- | --- | --- |
| 2026-08-30 | Vercel deployment inventory in signed-in browser | 0 | Preview `0a09653` READY; merged-main Production `6db95f0` ERROR |
| 2026-08-30 | Preview application and runtime-log inspection | 0 | UniMind rendered synthetic/mock-only; recent `GET /` requests returned `200` with no runtime error rows |
| 2026-08-30 | Vercel environment-scope inspection | 0 | Required names exist only in Preview; values were not revealed |
| 2026-08-30 | Vercel Git/environment inspection | 0 | `main` tracks Production and auto-assigns Production domains despite the current Preview-only policy |
| 2026-08-30 | Repository deployment-policy correction | 0 | Added `vercel.json` with `git.deploymentEnabled.main=false`; unit and branch-Preview verification passed, with the `main` merge event still pending |
| 2026-08-30 | Vercel Production-domain safeguard | 0 | Disabled automatic Production-domain assignment; Vercel confirmed the saved setting and no Production variables or target were added |
| 2026-08-30 | Source-tree `pnpm verify` | 0 | Formatting, lint, typecheck, boundaries, CI policy, secret scan, 232 unit tests, integration/security/evaluation/load layers, two Chromium tests, production build, and client-artifact scan passed |
| 2026-08-30 | Exact-candidate frozen clean install | 0 | Commit `d7997eb`; 649 packages reproduced with pnpm `10.34.5` |
| 2026-08-30 | Provider-network-blocked clean-clone `pnpm verify` | 0 | Complete gate passed with HTTP/HTTPS/ALL proxy directed to closed loopback port 9 and localhost excluded for the test server |
| 2026-08-30 | GitHub Actions run `33323913701` | 0 | Dependency audit, application, and disposable database CI passed; database job reset twice and removed stack/volumes |
| 2026-08-30 | Protected Preview deployment and smoke | 0 | Deployment `8cQQwEHwBicq4jCm6PqMcYpz1nBC` READY; six smoke checks passed against exact candidate |
| 2026-08-30 | Sanitized database artifact verification | 0 | Artifact `9735729912`; SHA-256 `7d11e17f7da633ec4af2b9887d04181bef9dfcbcf055aa4cf4fa92a27f2e769b`; local ZIP deleted |
| 2026-08-30 | Supabase breaking-change review | 0 | Reviewed current official feed and repository call sites; conclusions recorded below |
| 2026-08-30 | Final-head review and merge | 0 | `unimind989-sys` approved `3da3497`; all five required checks passed; PR #8 merged as `b1f34d4` |
| 2026-08-30 | Post-merge GitHub CI run `33325532189` | 0 | Application and disposable database jobs passed; dependency audit skipped by its documented pull-request-only guard |
| 2026-08-30 | Post-merge Vercel inventory | 0 | No deployment or commit entry for `b1f34d4` after CI completed; latest entries remained protected READY Previews `3da3497` and `d7997eb` |
| 2026-08-30 | Agent readiness and isolated handoff | 0 | Readiness passed 131 names, 37 links, 22 decisions, and 102 task contracts; handoff passed with no eligible next task and six durable active WP00 records |
| 2026-08-31 | Documentation closure and final suppression proof | 0 | PR #9 merged as `684d560`; post-merge run `33328863455` passed; refreshed signed-in Vercel inventory contained READY Preview `a93100f` and no deployment for `684d560` |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Missing Production variables | Fail closed without exposing values | Build reported variable names only and exited before deployment | PASS | Vercel deployment `6db95f0` |
| Preview protection | Unauthenticated tooling cannot access protected deployment | Initial direct smoke failed `REQUEST_FAILED`; signed-in browser access succeeded; after authenticated CLI smoke the generated bypass was revoked back to none | PASS | WP01-T11-PREVIEW-PROTECTION |
| Production shortcut | Do not copy Preview secrets into Production or create a Production alias merely to silence the failure | No variable scope or deployment protection change made during diagnosis | PASS | WP01-T11-NO-PRODUCTION-SHORTCUT |
| Domain auto-assignment | A future explicit Production deployment must not automatically acquire a user-facing domain | Setting saved as Disabled; manual promotion is now required | PASS | Vercel Production environment settings |
| Temporary protection bypass | Smoke tooling must not leave a durable bypass credential | Authenticated Vercel CLI generated one automatically; it was revoked immediately and the dashboard returned to “Add Secret” | PASS | Vercel “Automation Bypass removed” confirmation |
| Provider network block | Any unexpected provider HTTP request must fail closed | Complete clean-clone gate passed with outbound proxy pointed at closed loopback port; provider integration explicitly rejects attempted fetch | PASS | WP01-T11-NETWORK-BLOCK |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP01-T11-VERCEL-TARGET | Closed | Repository and dashboard corrections are complete; merge `b1f34d4` produced no Vercel deployment | Codex `/root` | Closed 2026-08-30 | None |

## Recorded runtime

| Component | Exact version/image |
| --- | --- |
| Node.js project/CI runtime | `24.19.0` |
| pnpm | `10.34.5` |
| Next.js | `16.3.1` |
| Supabase CLI | `2.115.0` |
| Vercel CLI | `59.9.1` |
| GitHub runner | `ubuntu24` image `20260823.283.1` |
| Docker server | `28.0.4` |
| PostgreSQL | `17.6` (`public.ecr.aws/supabase/postgres:17.6.1.159`) |
| PostgREST | `ghcr.io/supabase/postgrest:v16.1` |
| Extensions | `pg_stat_statements` 1.11; `pgcrypto` 1.3; `plpgsql` 1.0; `supabase_vault` 0.3.1; `uuid-ossp` 1.1; `vector` 0.8.2 |

The workstation's ambient `node` command is `22.21.0`, but project commands invoked through the pinned pnpm runtime select Node `24.19.0`; clean clone, GitHub CI, and Vercel all used the approved project runtime.

## Supabase breaking-change review

- [Current breaking-change feed](https://supabase.com/changelog?types=breaking-change) reviewed on 2026-08-30.
- [Extension version pinning is deprecated](https://supabase.com/changelog/extension-version-pinning-ignored): relevant. UniMind migrations already use bare `create extension` statements and record installed versions instead of pinning them.
- Self-hosted PostgreSQL 17, Envoy default-gateway, and Studio ownership changes: relevant to disposable CLI-stack compatibility, but no manual upgrade path or custom Kong/Studio ownership is used. The pinned complete stack passed twice-reset CI on PostgreSQL 17.6.
- `logs.all` Management API removal on 2026-09-23, OAuth token status change, and `pg_graphql` introspection/default enablement: not used by repository code.
- Public-table automatic Data API exposure removal: already handled. `supabase/config.toml` leaves legacy auto-exposure disabled and migrations apply explicit grants plus RLS.

## Security and privacy review

- [x] Evidence contains no secret, signed URL, private raw content, ordinary chat content, or unredacted personal data.
- [x] Variable names and scopes were inspected without revealing values.
- [x] Preview remained protected; Beta, Production variables, domains, provider flags, and paid resources were not enabled.

## Rollback/disable procedure

Remove `git.deploymentEnabled.main=false` and reconsider automatic Production-domain assignment only after an explicit production-promotion gate approves a protected target, required environment scopes, exact candidate, and domain behavior. Until then, retain Preview-only variables and Standard Protection; never point Preview at Beta or copy Beta credentials.

## Decision

PASS. Candidate-local, clean-clone, disposable database, protected Preview, secret, compatibility, version, review, merge, post-merge CI, Vercel suppression, and cleanup criteria all pass. The selector's post-gate `NONE` result is intentional: the reviewed WP00 mock bridge unlocks WP01 only, so WP02 remains behind unresolved WP00 owner inputs. Protected Beta/release gates remain locked and unchanged.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | PASS | 2026-08-30 |
| Ahmed via `unimind989-sys` | Human checkpoint | APPROVED final head `3da3497` | 2026-08-30 |
