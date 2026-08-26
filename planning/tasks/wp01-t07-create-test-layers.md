# Task record: WP01-T07 create test layers

**Task ID:** WP01-T07

**Status:** [~]

**Outcome:** Unit, integration, security, end-to-end, evaluation, and load suites have explicit boundaries, safe defaults, actionable timeouts, and stable machine-readable outputs.

**Owner:** Codex `/root`

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** main (no delivery branch requested); candidate `1783d7e`

**Updated (UTC):** 2026-08-26

## Execution contract

**Dependencies:** WP01-T04 reviewed PASS for an isolated resettable hosted development/CI PostgreSQL/Supabase target; WP01-T05 for Auth/security seams; WP01-T06 PASS for deterministic provider mocks.

**Inputs:** Runbook WP01-T07; existing test directories/scripts; synthetic fixtures only; frozen evaluation/load schemas.

**Files:** Test-runner configuration, layer-specific helpers/fixtures/tests, report outputs, package scripts, task/runbook state, and evidence.

**Verify:** Deliberately fail one rule per layer; run unit/integration/security/E2E/eval/load commands under their safe profiles; `pnpm verify`; readiness/handoff; diff/credential review.

**Pass:** Each layer fails at its intended seam with an actionable message; ordinary local verification stays mock-only and zero-cost.

**Evidence:** `evidence/wp01-foundation/YYYY-MM-DD_test-layers_<environment>_<short-sha>.md`

**Rollback:** Revert the future WP01-T07 candidate; no real user, source, provider, deployment, or shared environment may be involved.

**Hard stop:** Do not claim integration/security coverage without a twice-reset isolated hosted target and synthetic Auth/data, point development/CI/load tests at preview or beta, call paid providers, or hide hangs with unbounded timeouts.

## Steps

- [x] WP01-T04 and WP01-T05 have reviewed PASS evidence; the test-layer implementation is unblocked.
- [~] Configure explicit unit/integration/security/E2E/eval/load projects and timeouts. Candidate `1783d7e`; executor verification passed; reviewer pending.
- [~] Add synthetic layer fixtures and deliberately failing seam checks. Candidate `1783d7e`; executor verification passed; reviewer pending.
- [~] Add stable machine-readable and Markdown reports where required. Candidate `1783d7e`; executor verification passed; reviewer pending.
- [~] Run the full gate and complete review. The full executor gate passed; independent review remains unassigned.

## Handoff

**Changed:** Candidate `1783d7e` adds bounded Vitest projects and JSON reports; a guarded local Playwright project; synthetic integration/security fixtures; a versioned foundation JSONL runner with fingerprinted JSON/Markdown output; and a guarded YAML load-profile dry run marked `NOT_EXECUTED`. `pnpm verify` now exercises every credential-free layer and preserves all machine reports.

**Commands:** `pnpm verify` PASS (193 unit, 1 local integration plus 1 hosted skip, 8 security, 3 evaluation, 5 load, 1 Chromium E2E, build/secret scan); `pnpm test:integration:hosted` PASS (2 tests including synthetic hosted Auth and cleanup); `pnpm db:metadata --environment development` PASS for approved fingerprint; readiness and isolated handoff PASS. Full sanitized command/deviation detail: `evidence/wp01-foundation/2026-08-26_test-layers_local_1783d7e.md`.

**Remaining:** Assign an independent reviewer to inspect/rerun candidate `1783d7e` and its evidence. Only that reviewer may mark the runbook/task items complete and unblock WP01-T08.

**Next safe action:** Review candidate `1783d7e`; do not begin WP01-T08 until WP01-T07 receives reviewed PASS evidence.

**Reviewer action:** Rerun `pnpm verify`, inspect the hosted Auth result and safe development fingerprint, confirm every output remains synthetic/mock/zero-cost, verify the RLS/evaluation/load non-claims, then record PASS or defects in the evidence and task/runbook state.
