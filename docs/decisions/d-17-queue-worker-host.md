# Decision D-17: Queue transport and worker host

**Status:** OPEN

**Owner:** Ahmed + Ziad

**Reviewers:** Ahmed or Ziad — operations, security/data, and cost roles must be explicitly assigned; protected budget/release gates require both founders

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** NOT RECORDED

**Owner constraint recorded:** Ahmed, 2026-08-23 — founder computers are development workstations only and are not hosting options.

**Blocks:** WP08-T03; WP08-T08; WP11-T01

## Context

UniMind needs durable background execution for ingestion, generation, retries, reconciliation, metering, and verified deletion. The queue transport and external worker host have not been selected. Workstation development and CI may use the database job table and in-process deterministic dispatcher, but no shared preview or beta component may run from or depend on Ahmed's or Ziad's computer. Database-backed development and CI follow approved D-21 hosted isolation.

## Non-negotiable requirements

- Every preview and beta web, API, database/Auth, storage, queue, worker, scheduler, monitoring, notification, and optional orchestration component uses approved external infrastructure.
- Turning off both founder computers does not interrupt accepted work, routine processing, recovery, health checks, or schedules.
- PostgreSQL remains authoritative for durable job state, leases, idempotency, retries, budgets, usage, and audit even if an external queue or n8n is used.
- The selected host supports the required Node.js runtime, workload isolation, bounded concurrency, health checks, logs, secrets, rollback, and cost controls.
- Selection prefers the lowest practical total cost but may use paid capacity when required correctness, safety, reliability, or usability justifies it.
- Unit/contract execution remains synthetic, mock-only, credential-free, and zero-cost by default; database-backed development and CI use only approved hosted synthetic targets and no paid AI provider.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Founder computer hosting | Rejected; development-only | Cannot satisfy shared-environment boundary | Stops or degrades with personal-machine state | Low direct cost, unacceptable operational risk | High personal dependency | Ahmed constraint, 2026-08-23 |
| Database job table plus in-process dispatcher | Suitable for workstation contracts and deterministic CI tests only | Synthetic data only | Not a shared hosting solution | Zero | Low | Current approved mock boundary |
| Managed/serverless external worker host | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | Adapter-bound | Required benchmark pending |
| Externally hosted VM/container service | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | Adapter-bound | Required benchmark pending |

## Decision

OPEN — no queue transport or external worker host is approved. Founder computers are permanently excluded as worker-host candidates. Until a reviewed selection exists, only the database job table plus in-process deterministic dispatcher may be used for workstation/CI mock execution; always-on and beta deployment remain blocked.

## Consequences

### Benefits

- Shared operation cannot silently depend on a founder being online or maintaining a personal machine.
- Hosting candidates will be compared on the complete security, reliability, runtime, and cost contract rather than direct price alone.

### Costs and risks

- External hosting must be provisioned and may introduce a justified recurring cost.
- The final queue/host choice and 100-student capacity remain unproven until benchmark and load evidence exist.

## Implementation contract

- Configuration keys: queue mode, worker host/environment identity, concurrency, lease/heartbeat, retry, health, and cost-limit settings.
- Adapter/interface: provider-neutral job dispatcher and worker composition roots; optional external queue/n8n cannot own business state.
- Affected migrations/files: durable job tables, worker deployment configuration, environment matrix, operations topology, health checks, and evidence.
- Tests/evaluation required: duplicate delivery, timeout, worker death, lease expiry, retry, dead-letter/replay, both-founder-computers-off proof, and the frozen 100-student workload.
- Observability required: queue age/depth, claims, leases, attempts, outcomes, worker health, deployment identity, usage, and cost.
- Rollback/disable action: stop new claims on the affected external host, preserve durable PostgreSQL state, deploy the prior tested worker artifact or approved alternate host, and reconcile accepted work.

## Revisit triggers

- Approved hosting candidates and regions, measured workload, provider/runtime compatibility, budget input, host pricing change, capacity failure, unacceptable idle/reclamation behavior, or recovery-test failure.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
