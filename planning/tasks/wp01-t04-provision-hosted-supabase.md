# Task record: WP01-T04 provision hosted Supabase development and CI

**Task ID:** WP01-T04

**Status:** [?]

**Outcome:** Approved synthetic-only hosted Supabase development and isolated CI targets reset twice from versioned migrations/seed and generate stable database types without dashboard state or local infrastructure.

**Owner:** Codex `/root` after provisioning authority and scoped access are available

**Reviewer:** Codex `/root` for the ordinary foundation slice; independent review remains required for later RLS/grant changes

**Branch:** main (user requested direct commit/push)

**Updated (UTC):** 2026-08-25

## Execution contract

**Dependencies:** WP01-T03 PASS with evidence `evidence/wp01-foundation/2026-08-20_environment-contract_local_3d1228e.md`; approved D-21; explicit authority and signed-in/scoped access for a synthetic hosted development project plus an isolated hosted CI project or disposable branch; pinned Supabase CLI 2.115.0.

**Inputs:** Runbook WP01-T04; D-21 hosted development/test decision; master-plan PostgreSQL/Supabase architecture; synthetic-only fixture rule; approved safe project fingerprints and owners; hosted PostgreSQL/extension versions after provisioning.

**Files:** `supabase/config.toml`, CLI-named initial migration, `supabase/seed.sql`, generated `src/types/database.generated.ts`, guarded hosted reset/type automation, environment matrix, task/runbook state, and WP01 evidence.

**Verify:** hosted-target guard unit tests; pinned CLI help/version; two consecutive guarded hosted resets; hosted migration list; stable generated types; database/Auth/security tests; `pnpm verify`; readiness/handoff checks; diff and credential review.

**Pass:** approved development/CI target isolation is documented; two hosted resets pass; local/preview/beta target names are rejected; `vector` and `pgcrypto` versions are recorded; only synthetic seed data exists; generated types are stable.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_hosted-supabase_<environment>_<short-sha>.md`

**Rollback:** Revoke the affected development/CI credentials, dispose an ephemeral CI branch when applicable, preserve versioned migrations, and provision/replay into a new isolated hosted target. Never point development or CI at preview/beta to recover.

**Hard stop:** Do not create an external project, write credentials, run a hosted reset, expose connection details, use preview/beta as a test target, add real data, or proceed to dependent database/Auth claims without explicit provisioning authority, scoped access, two clean resets, and sanitized evidence.

## Steps

- [?] Obtain approval for the exact hosted development/CI resources, owners, region/capacity, and signed-in provisioning path.
- [x] Replace the Docker/local runtime contract with approved D-21 and guarded hosted database commands.
- [ ] Initialize versioned Supabase configuration and the first CLI-named migration against the approved development target.
- [ ] Add required extensions and synthetic seed data.
- [ ] Configure isolated CI targeting and secret scope without committing linked state or credentials.
- [ ] Prove two guarded hosted resets, migration parity, database/Auth/security tests, stable types, full verification, and ordinary review.

## Handoff

**Changed:** Approved D-21 and synchronized the plan/runbook/tooling around externally hosted synthetic development and isolated hosted CI. Added a target guard that accepts only `development` or `ci` and requires exact reset confirmation. No external resource was provisioned and no hosted database was changed.

**Commands:** Pinned Supabase CLI 2.115.0 help confirmed remote `--project-ref` reset/migration/type commands. Hosted-target guard unit coverage passed inside the 144-test unit suite. `pnpm db:reset` with target variables removed exited 1 as expected before any network call. `pnpm typecheck`, `pnpm verify`, `scripts/verify-agent-readiness.ps1` (85 names, 31 links, 21 decisions, 102 task contracts), `scripts/show-work-state.ps1`, and the isolated committed-snapshot agent handoff rehearsal passed. Hosted reset, migration, Auth, RLS, and type-generation commands were NOT RUN because no approved project reference or scoped credentials were supplied.

**Remaining:** External development/CI provisioning, versioned Supabase configuration/migration/seed, two hosted resets, generated types, database/Auth/security evidence, and review.

**Next safe action:** Ahmed supplies or authorizes creation of the exact synthetic hosted development target and isolated CI target/branch through the approved credentialed setup path; then Codex executes the guarded WP01-T04 verification.

**Reviewer action:** Confirm D-21/environment isolation and target-guard behavior now; after provisioning, independently inspect project separation, versioned migrations/seed, extension versions, two resets, generated types, and credential-free evidence.
