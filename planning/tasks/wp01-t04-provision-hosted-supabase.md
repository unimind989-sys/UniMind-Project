# Task record: WP01-T04 provision hosted Supabase development and CI

**Task ID:** WP01-T04

**Status:** [x]

**Outcome:** Approved synthetic-only hosted Supabase development and isolated CI targets reset twice from versioned migrations/seed and generate stable database types without dashboard state or local infrastructure.

**Owner:** Codex `/root`; Ahmed controls signed-in provisioning and local credential entry

**Reviewer:** Ahmed — PASS (2026-08-25)

**Branch:** main (user requested direct commit/push)

**Updated (UTC):** 2026-08-25

## Execution contract

**Dependencies:** WP01-T03 PASS with evidence `evidence/wp01-foundation/2026-08-20_environment-contract_local_3d1228e.md`; approved D-21; explicit authority and signed-in/scoped access for a synthetic hosted development project plus an isolated hosted CI project or disposable branch; pinned Supabase CLI 2.115.0.

**Inputs:** Runbook WP01-T04; D-21 hosted development/test decision; master-plan PostgreSQL/Supabase architecture; synthetic-only fixture rule; approved safe project fingerprints and owners; hosted PostgreSQL/extension versions after provisioning.

**Files:** `supabase/config.toml`, CLI-named initial migration, `supabase/seed.sql`, generated `src/types/database.generated.ts`, guarded hosted reset/type automation, environment matrix, task/runbook state, and WP01 evidence.

**Verify:** hosted-target guard unit tests; pinned CLI help/version; two consecutive guarded hosted resets; hosted migration list; stable generated types; database/Auth/security tests; `pnpm verify`; readiness/handoff checks; diff and credential review.

**Pass:** approved development/CI target isolation is documented; two hosted resets pass; local/preview/beta target names are rejected; `vector` and `pgcrypto` versions are recorded; only synthetic seed data exists; generated types are stable.

**Evidence:** `evidence/wp01-foundation/2026-08-25_hosted-supabase_development-ci_b444a5d.md`

**Rollback:** Revoke the affected development/CI credentials, dispose an ephemeral CI branch when applicable, preserve versioned migrations, and provision/replay into a new isolated hosted target. Never point development or CI at preview/beta to recover.

**Hard stop:** Do not create an external project, write credentials, run a hosted reset, expose connection details, use preview/beta as a test target, add real data, or proceed to dependent database/Auth claims without explicit provisioning authority, scoped access, two clean resets, and sanitized evidence.

## Steps

- [x] Ahmed authorized two separate hosted Supabase projects, the nearest available region to Cairo, zero-charge provisioning only, synthetic data only, and the signed-in setup path on 2026-08-25.
- [x] Create the zero-charge synthetic development project in Central EU (Frankfurt); its safe project reference is recorded locally, and the project is connected to the shared GitHub repository pending integration review.
- [x] Rotate the development database password before any hosted command because the initial password was exposed in chat; update only the ignored local credential file and never send the replacement through chat.
- [x] Complete the equivalent manual signed-in path for the separate zero-charge CI project and local credential files; leave CI GitHub integration unselected until WP01-T08.
- [x] Replace the Docker/local runtime contract with approved D-21 and guarded hosted database commands.
- [x] Initialize versioned Supabase configuration and the first CLI-named migration against the approved development target.
- [x] Add required extensions and synthetic seed data.
- [x] Configure isolated CI targeting and secret scope without committing linked state or credentials.
- [x] Prove two guarded hosted resets, migration parity, synthetic fixture/private-schema checks, stable types, full verification, and ordinary review. Ahmed reviewed the candidate evidence and recorded PASS on 2026-08-25.

## Handoff

**Changed:** Provisioned separate zero-charge synthetic development and CI Supabase projects in Central EU (Frankfurt), rotated the initially exposed development password before any hosted command, and stored credentials only in ignored per-environment profiles. Added versioned Supabase configuration, a CLI-named foundation migration, private synthetic fixtures/canaries, generated public types, safe hashed environment fingerprints, guarded profile loading, read-only metadata evidence, and regression tests. Development remains connected to GitHub pending integration review; CI has no GitHub connection. The temporary provisioning wizard was removed after the recorded manual path succeeded so it cannot create duplicate projects.

**Commands:** Both profiles passed `db:migrations` and `db:push:dry-run`. The first development reset exposed the pinned CLI requirement for `--linked`; no database change occurred, the wrapper was fixed, and a regression test locks the exact command. Development and CI then each passed two consecutive guarded resets, migration/seed application, migration parity, and stable type generation. Both produced type hash `sha256:abb811213bde78031b8fc3731a5041c9118f3f5898fd9e759cc29656b5985f22`. `db:metadata` reports PostgreSQL 17.6, vector 0.8.2, pgcrypto 1.3, three fixtures, three canaries, and denied private-schema usage for `anon`/`authenticated` on both safe target fingerprints. `pnpm verify` passed formatting, lint, strict types, boundaries, 159 unit tests, and the synthetic production build; agent readiness and isolated handoff passed. Auth/RLS integration tests remain WP01-T05/T07 work after this foundation review.

**Remaining:** None for WP01-T04. Ahmed disconnected the development repository integration and stored the CI publishable key locally before recording PASS.

**Next safe action:** Select and claim WP01-T05 to implement safe Supabase browser/server/admin clients and authenticated session refresh against the reviewed hosted development target.

**Reviewer action:** PASS — confirmed separate zero-charge synthetic targets, password rotation, versioned migration/seed, extension versions, two resets per target, stable types, private-schema denial, credential hygiene, development GitHub disconnection, and local CI publishable-key completion.
