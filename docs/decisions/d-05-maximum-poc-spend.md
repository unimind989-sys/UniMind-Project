# Decision D-05: Maximum PoC spend and paid enablement

**Status:** OPEN

**Owner:** Ahmed + Ziad

**Reviewers:** Independent cost reviewer UNASSIGNED; security/data reviewer UNASSIGNED

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** NOT RECORDED

**Owner guidance recorded:** Ahmed, 2026-08-23 — minimize total PoC cost, but do not treat zero spend as a hard requirement.

**Blocks:** WP04-T05 (paid), WP04-T06 (paid), WP04-T10 (paid), WP06-T05 (paid), WP07-T03 (paid), WP09-T01, WP09-T03, WP11-T01

## Context

PostgreSQL is authoritative for budgets, reservations, provider attempts, usage, and settlement. Exact nonzero caps, canonical currency, conversion evidence, enablement approvers, and alert recipients are not approved. The safe profile therefore has zero paid capacity.

Ahmed's current cost direction is to prefer free tiers and the lowest practical cost while preserving the required correctness, safety, reliability, and usability. A paid service may be proposed when it has a clear benefit over the free alternative. This direction is not an approved amount, provider, purchase, or live-enablement decision; the exact caps and two-person approvals below remain open.

## Non-negotiable requirements

- `PROVIDER_MODE=mock` is the default in development, test, CI, preview, and every unspecified environment.
- Every real provider/action flag defaults false; missing or malformed live configuration fails closed.
- `pnpm verify` and ordinary smoke/evaluation commands remain zero-cost and credential-free.
- One atomic reservation must fit every applicable hard scope: total PoC, weekly, provider/action, source preflight, per-user daily, and single request.
- Cap increases and paid enablement require two accountable people; the executor cannot approve its own budget kill switch.

## Zero-cost profile

- All hard caps equal zero; real reservations are rejected before adapter initialization.
- Canonical real currency and exchange-rate source are `UNSET`; mixed-currency comparison is invalid without ISO currency, dated rate, and evidence URI.
- Deterministic mocks are enabled and record zero units/cost in the same reservation/settlement interfaces.
- Threshold notifications use a local test sink; no external notification is sent.

## Reservation and settlement contract

1. Preflight validates environment, rights, provider/action flag, input limits, estimated maximum units, and every budget scope.
2. One PostgreSQL transaction reserves the maximum cost or rejects the request before a real adapter call.
3. Accepted calls carry one idempotency key and append attempt state.
4. A confirmed result settles actual cost and releases unused reservation; a confirmed rejection releases it.
5. Timeout or uncertain acceptance leaves the reservation pending for provider-specific reconciliation. Blind retry is forbidden when duplicate charge or duplicate work is possible.
6. Reconciliation appends the provider result and settles or releases exactly once.

At 50%, 75%, and 90% of a nonzero scope, append one threshold event per scope/period and notify the approved sink. At 100%, reject new optional paid reservations atomically. Already accepted work may finish and settle so durable state is not corrupted; disabling the provider stops new claims and reservations immediately. Raising a cap or re-enabling work requires a new audited two-person governance action.

## Live enablement gate

A real adapter may initialize only when all conditions are true: an explicitly approved live environment profile, approved D-04 provider/config, approved D-05 caps/currency, nonzero applicable scopes, global and provider/action enable flags, server-only credentials, rights-compatible input, passing evaluation, budget preflight, explicit live-command confirmation guard, and linked two-person approval evidence.

## Decision

OPEN — zero paid capacity is the only authorized profile. No currency, nonzero cap, enablement approver set, alert recipient, or real provider call is approved.

## Implementation contract

- Configuration keys: provider mode, environment profile, canonical currency/rate metadata, enable flags, and hard scopes.
- Adapter/interface: budget authorizer surrounds every real provider adapter; provider SDKs never become business-state authorities.
- Affected migrations/files: budget counters, reservations, provider attempts/costs, usage ledger, governance actions, and incident events.
- Tests/evaluation required: each scope boundary, concurrent reservation, cap change, timeout/uncertainty, exactly-once settlement, kill switch, accepted-job completion, and zero-cost smoke story.
- Observability required: scope usage, reserved/settled/released amounts, thresholds, block reason, attempt status, and correlation ID.
- Rollback/disable action: set global/provider action flags false and hard caps zero; reconcile accepted work without starting new calls.

## Revisit triggers

- Owner-supplied values, provider benchmark, exchange-rate source, pricing/version change, unexplained cost, duplicate settlement, or threshold/kill-switch failure.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
