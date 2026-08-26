# Integration tests

- **Interface:** Tests across application interfaces and local mock adapters, including an isolated reset hosted Supabase development/CI target when database behavior is required.
- **Allowed dependencies:** Synthetic seed data, isolated hosted development/CI services, process-local adapters, and deterministic provider mocks.
- **Prohibited dependencies:** Beta/production endpoints, real private data, paid providers, and order-dependent state.
- **Owner:** The current integration task agent.

`pnpm test:integration` is the credential-free mock project and reports the hosted Auth case as skipped. `pnpm test:integration:hosted` uses the reviewed development fingerprint, explicit reset confirmation, synthetic Auth fixtures, and mock providers; the command name makes its external dependency visible.
