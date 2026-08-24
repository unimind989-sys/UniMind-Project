# Task record: WP01-T06 implement provider mocks

**Task ID:** WP01-T06

**Status:** [x]

**Outcome:** Every AI, storage, and queue workflow can execute normalized success, retryable, terminal, latency, and uncertain outcomes through deterministic zero-network mocks.

**Owner:** Codex `/root`

**Reviewer:** Codex `/root` — PASS (ordinary mock-only task)

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-20T17:45:59Z

## Execution contract

**Dependencies:** WP01-T02 and WP01-T03 reviewed PASS; D-04/D-05 explicitly authorize deterministic mocks with zero paid capacity; no dependency on blocked WP01-T04/T05.

**Inputs:** Runbook sections 4.6 and WP01-T06; provider decisions D-04/D-05; module boundaries; deterministic synthetic fixtures only.

**Files:** Shared provider result/usage/error contracts; seven provider interface files; deterministic scenario runner and seven mock adapters; guarded real-adapter initialization seam; contract tests; module documentation; runbook/task state; evidence.

**Verify:** Focused provider contract tests with network disabled; disabled-real-initializer test; boundary scan; `pnpm verify`; readiness/handoff checks; diff and credential review.

**Pass:** Every mock produces stable normalized metadata for success, latency, rate limit, both timeout states, malformed output, and terminal rejection; all required error codes are typed; no mock/build/test makes a network call; a disabled or zero-budget real initializer is never invoked.

**Evidence:** `evidence/wp01-foundation/2026-08-20_provider-mocks_local_61622df.md`

**Rollback:** Revert the WP01-T06 commits; no provider, queue, storage, database, deployment, credential, or external state is changed.

**Hard stop:** Do not add a provider SDK, network call, credential, real adapter, nonzero budget, private fixture, or business-state authority inside a mock/provider response.

## Steps

- [x] Define normalized provider metadata, results, usage, and typed errors.
- [x] Add the seven small provider interfaces at their owning module seams.
- [x] Implement deterministic scenario handling and one mock per interface.
- [x] Prove all mock scenarios, abort handling, idempotent output, zero network, and disabled real initialization.
- [x] Run the full gate, assemble evidence, and complete ordinary review.

## Handoff

**Changed:** Added seven provider-neutral interfaces, one shared normalized result/usage/error contract, a deterministic scenario runner, seven zero-network mock adapters, a fail-closed lazy real-initialization gate, local file maps, and the reusable contract suite.

**Commands:** Focused provider suite passes 113 tests; lint, strict typecheck, and module-boundary checks pass; `pnpm verify` passes formatting, lint, strict types, boundaries, 136 unit tests, and the synthetic production build. The first focused implementation passed; review then expanded real initialization from the three minimum local facts to every D-05 live-enablement fact.

**Remaining:** NONE for WP01-T06.

**Next safe action:** Keep database-dependent WP01-T07/T08 blocked until hosted WP01-T04 passes; obtain approved development/CI provisioning or select another explicitly dependency-free task.

**Reviewer action:** PASS — interface depth, normalized metadata, full typed failure coverage, deterministic fixtures, zero-network proof, complete live gate, candidate diff, and fresh-agent handoff reviewed.
