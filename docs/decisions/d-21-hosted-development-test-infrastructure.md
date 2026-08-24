# Decision D-21: Hosted development and test infrastructure

**Status:** APPROVED

**Owner:** Ahmed

**Reviewers:** Ziad (project awareness); database/security reviewer required for later RLS and grant gates

**Decision deadline:** N/A — APPROVED 2026-08-25

**Last reviewed:** 2026-08-25

**Blocks:** NONE — WP01-T04 and downstream tasks must conform

## Context

The original WP01 workflow required Docker, WSL2, hardware virtualization, and a local Supabase stack. The approved workstations cannot provide that runtime, and founder computers must not become infrastructure dependencies. Supabase Auth and PostgreSQL remain the approved database architecture, so the development and CI database/Auth workflow needs an externally hosted replacement without weakening migration, reset, RLS, or isolation evidence.

The computers may still run editors, the Next.js development process, unit tests, browser tests, and deterministic in-process mocks. A future Telegram bot may run on a founder computer only as noncritical development/test tooling: the PoC must not depend on it, it must not process real student or private source data, and it cannot satisfy a preview, beta, operations, or release gate.

## Non-negotiable requirements

- Development database/Auth uses an approved externally hosted Supabase target containing synthetic data only.
- Database-backed CI uses an isolated hosted Supabase project or disposable branch that cannot reach development, preview, or beta data.
- Destructive reset automation accepts only an explicitly named `development` or `ci` target and requires an exact target-specific confirmation value.
- Preview and beta keep separate projects, secrets, callbacks, storage, jobs, budgets, and deployment controls.
- No founder computer hosts a database, Auth service, storage service, queue, required worker, scheduler, monitoring service, or other shared/runtime dependency.
- `pnpm verify` remains credential-free, mock-only, and zero paid-provider cost. Hosted database gates are named separately and run only when an approved synthetic target and secret scope are available.
- Migrations, seed data, generated types, and database/security evidence remain reproducible from version control; dashboard-only schema repair is prohibited.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Docker-based local Supabase | Matches Supabase locally but is unavailable on the approved workstations | Synthetic-only when configured correctly | Blocked by machine virtualization/runtime constraints | No service charge; significant workstation setup burden | Low | WP01-T04 machine preflight |
| Hosted Supabase development target plus isolated hosted CI target | Matches the approved Auth/PostgreSQL/RLS platform and removes workstation hosting | Synthetic-only targets with explicit environment isolation | Available independently of founder-computer runtime state | Must fit the approved hosting envelope | Low; migrations and adapters remain portable | Ahmed approval, 2026-08-25 |
| Replace Supabase with another database/Auth platform | Could remove the local tooling constraint | Requires a new Auth, grants, RLS, migration, and security evaluation | Unknown | Unknown | High architecture change | Not justified by the hosting constraint |

## Decision

Use externally hosted Supabase infrastructure for development database/Auth and database-backed CI. Development uses a synthetic-only hosted target. CI uses a separate project or disposable branch with an isolated secret scope and reset lifecycle. Preview and beta remain separate externally hosted environments.

Local infrastructure services are not part of the UniMind workflow. Workstations may run application development processes and deterministic mocks only. The optional future Telegram bot exception is development/test-only and must remain noncritical and free of real pilot data.

## Consequences

### Benefits

- Removes Docker, WSL2, and firmware virtualization from the project prerequisite chain.
- Exercises migrations, Auth, PostgreSQL, extensions, grants, and RLS against the hosted platform that the PoC will actually use.
- Keeps every database/Auth environment available independently of either founder computer.

### Costs and risks

- Development and database-backed CI require network access, scoped credentials, and externally provisioned capacity.
- A mistaken remote reset would be destructive; repository commands therefore deny preview/beta targets and require explicit target confirmation.
- CI isolation may require a dedicated project, disposable branch, serialization, or approved capacity depending on the selected Supabase plan.

## Implementation contract

- Configuration keys: `UNIMIND_DB_ENVIRONMENT`, `UNIMIND_SUPABASE_PROJECT_REF`, `UNIMIND_DB_RESET_CONFIRMATION`, `SUPABASE_ACCESS_TOKEN`, and `SUPABASE_DB_PASSWORD`; secret values stay in approved ignored workstation-session or CI secret stores.
- Adapter/interface: existing Supabase clients and PostgreSQL migrations remain authoritative; no provider-specific business logic enters domain modules.
- Affected migrations/files: WP01-T04 through WP01-T11 contracts, environment matrix, contributor tutorial, database command wrapper, CI workflow, migrations, synthetic seed, generated types, and evidence.
- Tests/evaluation required: target-guard unit tests, two clean hosted resets, populated upgrade, migration-list parity, stable generated types, Auth/RLS integration tests, forbidden-target tests, and CI isolation proof.
- Observability required: environment name, safe project identity/fingerprint, migration version, reset/run identity, result, and correlation ID without credentials or connection strings.
- Rollback/disable action: revoke the affected development/CI credentials, stop database-backed jobs, preserve versioned migrations, provision a clean isolated hosted target, replay migrations/seed, and regenerate types. Never recover by pointing development or CI at preview/beta.

## Revisit triggers

- Supabase plan/capability change, hosted development or CI cost exceeding the approved envelope, inability to isolate/reset safely, repeated network unreliability, security review failure, or an approved replacement for the Supabase architecture.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Ahmed | Product/architecture owner | Approved hosted Supabase development and isolated hosted CI; rejected local infrastructure | 2026-08-25 |
