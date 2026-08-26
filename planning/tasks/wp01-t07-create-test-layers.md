# Task record: WP01-T07 create test layers

**Task ID:** WP01-T07

**Status:** [x]

**Outcome:** Unit, integration, security, end-to-end, evaluation, and load suites have explicit boundaries, safe defaults, actionable timeouts, and stable machine-readable outputs.

**Owner:** Codex `/root`

**Reviewer:** Ahmed — PASS (2026-08-26)

**Branch:** main (no delivery branch requested); candidate `1783d7e`

**Updated (UTC):** 2026-08-26

## Execution contract

**Dependencies:** WP01-T04 reviewed PASS for an isolated resettable hosted development/CI PostgreSQL/Supabase target; WP01-T05 for Auth/security seams; WP01-T06 PASS for deterministic provider mocks.

**Inputs:** Runbook WP01-T07; existing test directories/scripts; synthetic fixtures only; frozen evaluation/load schemas.

**Files:** Test-runner configuration, layer-specific helpers/fixtures/tests, report outputs, package scripts, task/runbook state, and evidence.

**Verify:** Deliberately fail one rule per layer; run unit/integration/security/E2E/eval/load commands under their safe profiles; `pnpm verify`; readiness/handoff; diff/credential review.

**Pass:** Each layer fails at its intended seam with an actionable message; ordinary local verification stays mock-only and zero-cost.

**Evidence:** `evidence/wp01-foundation/2026-08-26_test-layers_local_1783d7e.md`

**Rollback:** Revert the future WP01-T07 candidate; no real user, source, provider, deployment, or shared environment may be involved.

**Hard stop:** Do not claim integration/security coverage without a twice-reset isolated hosted target and synthetic Auth/data, point development/CI/load tests at preview or beta, call paid providers, or hide hangs with unbounded timeouts.

## Steps

- [x] WP01-T04 and WP01-T05 have reviewed PASS evidence; the test-layer implementation is unblocked.
- [x] Configure explicit unit/integration/security/E2E/eval/load projects and timeouts. Candidate `1783d7e`; executor verification and Ahmed's review passed.
- [x] Add synthetic layer fixtures and deliberately failing seam checks. Candidate `1783d7e`; executor verification and Ahmed's review passed.
- [x] Add stable machine-readable and Markdown reports where required. Candidate `1783d7e`; executor verification and Ahmed's review passed.
- [x] Run the full gate and complete review. The full executor gate passed; Ahmed approved on 2026-08-26.

## Handoff

**Changed:** Candidate `1783d7e` adds bounded Vitest projects and JSON reports; a guarded local Playwright project; synthetic integration/security fixtures; a versioned foundation JSONL runner with fingerprinted JSON/Markdown output; and a guarded YAML load-profile dry run marked `NOT_EXECUTED`. `pnpm verify` now exercises every credential-free layer and preserves all machine reports.

**Commands:** `pnpm verify` PASS (193 unit, 1 local integration plus 1 hosted skip, 8 security, 3 evaluation, 5 load, 1 Chromium E2E, build/secret scan); `pnpm test:integration:hosted` PASS (2 tests including synthetic hosted Auth and cleanup); `pnpm db:metadata --environment development` PASS for approved fingerprint; readiness and isolated handoff PASS. Full sanitized command/deviation detail: `evidence/wp01-foundation/2026-08-26_test-layers_local_1783d7e.md`.

**Remaining:** None for WP01-T07. Later packages still own database RLS, academic evaluation quality, and executed load/capacity claims.

**Next safe action:** Select and claim WP01-T08 using the reviewed hosted development/CI database/Auth/test command contract.

**Reviewer action:** Ahmed approved candidate `1783d7e` and its evidence on 2026-08-26; no WP01-T07 review action remains.
