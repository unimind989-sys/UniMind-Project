# Decision D-04: AI providers

**Status:** OPEN

**Owner:** Ahmed + Ziad

**Reviewers:** Ahmed or Ziad — security/data, academic, and cost roles must be explicitly assigned; protected budget/live-enablement gates require both founders

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** NOT RECORDED

**Blocks:** WP04-T05 (real OCR), WP04-T06 (real transcription), WP04-T10 (real embeddings), WP06-T05 (real generation), WP07-T03 (real generation), WP11-T01

## Context

OCR, transcription, embedding, chat, and Studio generation need provider adapters, but no real provider has passed project-specific quality, rights, reliability, latency, and cost evaluation. Deterministic mocks are the only current execution profile.

## Non-negotiable requirements

- Selection uses frozen rights-approved evaluation data and recorded provider/model/config versions.
- Provider processing rights, region, retention, training, and deletion terms match the source inventory.
- Every action remains behind a provider-neutral adapter, per-action flag, budget reservation, timeout, retry limit, and kill switch.
- Default development, CI, and `pnpm verify` use deterministic mocks and make zero paid calls.
- A cheaper provider cannot compensate for leakage, unsupported factual output, incomplete processing, or unreliable accounting.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Deterministic mock adapters | Suitable for contracts, failures, and accounting tests; not quality evidence | Synthetic data only | Deterministic | Zero | Low | Current approved implementation boundary |
| Real provider candidates | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | Adapter-bound | Empty `planning/provider-benchmark.csv` |

## Decision

OPEN — no real provider/model/config is proposed or approved. Mock adapters remain the only enabled providers until WP09-T01 produces a reviewed benchmark and D-05 supplies approved nonzero budgets.

## Consequences

### Benefits

- Agents can build the complete application and failure paths without credentials, private data, network dependency, or cost.

### Costs and risks

- Real quality and latency remain unproven until frozen evaluation data, rights, and budgets exist.

## Implementation contract

- Configuration keys: global provider mode plus provider/action-specific enable flags; every real flag defaults to false.
- Adapter/interface: OCR, transcription, embedding, generation, and notification interfaces accept deterministic mocks first.
- Affected migrations/files: provider action/config registry, job payloads, reservations, attempts, usage/cost ledger, and evaluation reports.
- Tests/evaluation required: disabled provider, timeout, malformed response, retry, uncertain acceptance, kill switch, rights denial, and zero-network verification.
- Observability required: action, adapter/config version, attempts, units, latency, result, reservation, settlement, and cost without source text.
- Rollback/disable action: atomically disable the provider/action and route eligible synthetic work to its mock; preserve accepted-work reconciliation.

## Revisit triggers

- Frozen evaluation dataset, rights inventory, D-05 budget, representative benchmark, provider terms, model/config, or region changes.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
