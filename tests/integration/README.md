# Integration tests

- **Interface:** Tests across application interfaces and local mock adapters, including an isolated reset hosted Supabase development/CI target when database behavior is required.
- **Allowed dependencies:** Synthetic seed data, isolated hosted development/CI services, process-local adapters, and deterministic provider mocks.
- **Prohibited dependencies:** Beta/production endpoints, real private data, paid providers, and order-dependent state.
- **Owner:** The current integration task agent.
