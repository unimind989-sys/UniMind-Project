# Task record: WP01-T07 create test layers

**Task ID:** WP01-T07

**Status:** [?]

**Outcome:** Unit, integration, security, end-to-end, evaluation, and load suites have explicit boundaries, safe defaults, actionable timeouts, and stable machine-readable outputs.

**Owner:** Codex `/root` after WP01-T05 PASS

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** main (no delivery branch requested)

**Updated (UTC):** 2026-08-20T17:48:00Z

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

- [?] Wait for WP01-T05 reviewed PASS; WP01-T04 passed on 2026-08-25.
- [ ] Configure explicit unit/integration/security/E2E/eval/load projects and timeouts.
- [ ] Add synthetic layer fixtures and deliberately failing seam checks.
- [ ] Add stable machine-readable and Markdown reports where required.
- [ ] Run the full gate and complete review.

## Handoff

**Changed:** No test-layer implementation started; existing unit/provider/environment checks continue to run through `pnpm verify`.

**Commands:** NOT RUN for WP01-T07. The resettable hosted development/CI database now exists and is reviewed; the WP01-T05 Auth/security seam does not yet exist.

**Remaining:** Entire WP01-T07 outcome after WP01-T05 PASS.

**Next safe action:** Complete WP01-T05, then implement all test layers as one verified contract against the reviewed hosted targets.

**Reviewer action:** Assign after dependencies pass; database/security layer claims require independent review where RLS/grants become involved.
