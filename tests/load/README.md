# Load tests

- **Interface:** Reproducible synthetic workload runners and threshold assertions.
- **Allowed dependencies:** Explicit local/approved test targets, deterministic mocks, and versioned load profiles.
- **Prohibited dependencies:** Beta targets by default, real users/content, uncontrolled spend, and missing abort thresholds.
- **Owner:** The current load task agent; environment/budget owners approve non-local runs.

`pnpm test:load` validates the versioned YAML guard contract and emits a `NOT_EXECUTED` JSON/Markdown dry-run report. It rejects preview/beta/production, real providers, nonzero cost, missing abort thresholds, and malformed phases. Actual workload execution and threshold claims remain WP09 work and require the named safe environment/budget approvals.
