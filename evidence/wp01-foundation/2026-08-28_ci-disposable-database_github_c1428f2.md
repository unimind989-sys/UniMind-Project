# Gate report: WP01-T08 disposable database CI external proof

**Status:** PASS — implementation proof; external-settings retirement and human review remain follow-up checkpoints

**Environment:** GitHub Actions PR #6, standard GitHub-hosted `ubuntu-24.04`

**Commit SHA:** `c1428f29be57fe00d7729af65fe68a9daa5bf85a`

**Release/config fingerprint:** run `33122706939`; runner image `20260823.283.1`; Node 24.19.0; pnpm 10.34.5; Supabase CLI 2.115.0

**Migrations:** versioned `supabase/migrations/`; applied from empty twice through `supabase db reset --local`

**Dataset/fixture versions:** `supabase/seed.sql`; synthetic Auth fixture marker `wp01-t05-synthetic-auth`

**Agent executor:** Codex `/root`

**Human reviewer:** Ahmed authorized the run and read-only provider inventory; final evidence review pending

**Started/finished (UTC):** 2026-08-27T22:29 / 2026-08-27T22:34

## Scope and acceptance criteria

| Criterion | Result | Status | Evidence |
| --- | --- | --- | --- |
| Credential-free application gate | Complete `pnpm verify` job passed | PASS | Job `98693304678` |
| Zero-cost dependency audit | Production audit passed | PASS | Job `98693304493` |
| Disposable database lifecycle | Start, two resets, migration parity, public-schema type drift, Auth/database tests, security tests, and cleanup passed | PASS | Job `98693716921` |
| Persistent-project isolation | Workflow contains no Supabase project secret, protected environment, project ref, or remote flag; runner guard and loopback parser remained active | PASS | Candidate source and passing job |
| Sanitized version evidence | Runtime report contains only runner/runtime/image/extension versions and run ID | PASS | Artifact `9667211781` |
| Cleanup and report durability | `db:ci:stop --no-backup` and report upload passed under `if: always()` | PASS | Job steps 7-8 |

## Commands and results

| Command/gate | Result |
| --- | --- |
| `db:ci:start` | Passed; runtime metadata report created |
| `db:ci:reset` (first) | Passed |
| `db:ci:reset` (second) | Passed |
| `db:ci:migrations` | Passed |
| `db:ci:types` + `db:types:check` | Passed after environment-only generator metadata was normalized |
| `test:integration:database` | 2 tests passed |
| `test:security` | 8 tests passed |
| `db:ci:stop` | Passed; stack and volumes removed |

## Recorded runtime

| Component | Version/image |
| --- | --- |
| Ubuntu runner image | `ubuntu24` / `20260823.283.1` |
| Docker server | 28.0.4 |
| Node.js | 24.19.0 |
| Supabase CLI | 2.115.0 |
| PostgreSQL | 17.6 (`ghcr.io/supabase/postgres:17.6.1.159`) |
| PostgREST | `public.ecr.aws/supabase/postgrest:v16.1` |
| Extensions | `pg_stat_statements` 1.11; `pgcrypto` 1.3; `plpgsql` 1.0; `supabase_vault` 0.3.1; `uuid-ossp` 1.1; `vector` 0.8.2 |

## Failure and recovery evidence

- Run `33120854376` proved stack start, two resets, migrations, types, and cleanup, then failed closed because raw local type output included formatting and an extra exposed schema.
- Fix `a0365c2` constrained generation to `public` and reused the repository formatter.
- Run `33121576946` reached the type check and failed closed only because hosted generation includes a runtime PostgREST marker that local generation omits.
- Fix `2ec7118` removes that environment-only marker from both paths while preserving schema types.
- Run `33122096132` passed the complete lifecycle. Commit `c1428f2` then added the required sanitized runtime-version artifact, and final run `33122706939` passed all three jobs.

## Artifacts

| Artifact | ID | Digest | Retention |
| --- | --- | --- | --- |
| Database CI reports | `9667211781` | `sha256:e32f9dc756f2bc5b7197180e71f0ca631bb7838be9fda327ab277af439a3e3db` | 7 days |
| Application reports | `9667123083` | `sha256:69e7dd8adb7fc882028e71c555566a153823ec6916636b4d40cc1f61dc55f646` | 7 days |

## Security and privacy review

- The database job used read-only repository permission and no persistent Supabase credentials.
- The status command output remained captured and was not printed; transient local credentials were passed only to the child Auth test process.
- The artifact contains no database URL, key, password, token, signed URL, private content, or ordinary chat content.
- A read-only dashboard inventory confirmed the two existing Free projects remained unchanged during all runs.

## Remaining external settings

The obsolete GitHub `ci` environment still contains six hosted-CI secrets and its historical reviewer/branch restrictions. They are no longer referenced by the candidate workflow. Delete them and retire the environment only after explicit action-time confirmation, then add `database-ci` to the protected `main` required checks. Do not repurpose or rotate either Supabase project before that checkpoint is recorded.

## Decision

The disposable CI implementation satisfies its external behavior, isolation, cleanup, and evidence criteria at `c1428f2`. WP01-T08 remains administratively in progress until the obsolete external GitHub settings are retired, branch protection includes the new database gate, and Ahmed records the ordinary human review.
