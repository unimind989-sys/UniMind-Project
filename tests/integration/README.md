# Integration tests

- **Interface:** Tests across application interfaces and local mock adapters, including a complete disposable Supabase stack on a standard GitHub-hosted runner when database/Auth behavior is required.
- **Allowed dependencies:** Synthetic seed data, runner-local disposable Supabase services, process-local adapters, and deterministic provider mocks.
- **Prohibited dependencies:** Beta/production endpoints, real private data, paid providers, and order-dependent state.
- **Owner:** The current integration task agent.

`pnpm test:integration` is the credential-free mock project and reports the database/Auth case as skipped. `pnpm test:integration:database` is enabled only by the guarded GitHub-hosted disposable-stack wrapper and uses runner-local URL, publishable key, service-role key, and database URL values without printing them. `pnpm test:integration:hosted` remains a transitional explicit development seam until external WP01-T08 proof permits its retirement. None may target Preview or Beta.
