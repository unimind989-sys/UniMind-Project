# Integration tests

- **Interface:** Tests across application interfaces and local mock adapters, including a complete disposable Supabase stack on a standard GitHub-hosted runner when database/Auth behavior is required.
- **Allowed dependencies:** Synthetic seed data, runner-local disposable Supabase services, process-local adapters, and deterministic provider mocks.
- **Prohibited dependencies:** Beta/production endpoints, real private data, paid providers, and order-dependent state.
- **Owner:** The current integration task agent.

`pnpm test:integration` is the credential-free mock project and reports the database/Auth case as skipped. `pnpm test:integration:hosted` is the transitional reviewed hosted seam; WP01-T08 must replace or rename it so the revised CI path uses the disposable runner stack without persistent Supabase credentials. Neither command may target Preview or Beta.
