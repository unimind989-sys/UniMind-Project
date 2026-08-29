# Task record: WP00-T07 freeze load profile

**Task ID:** WP00-T07

**Status:** [?]

**Outcome:** A coding agent can implement one deterministic 100-student load runner without asking for phases, traffic, failures, payloads, canaries, thresholds, or abort conditions.

**Owner:** Codex `/root` for profile preparation

**Reviewer:** Ahmed or Ziad — ordinary load-profile human checkpoint pending

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-08-20

## Execution contract

**Dependencies:** D-13 approved capacity direction; D-05 authorizes only zero-cost mocks; application/load runner does not yet exist.

**Inputs:** Runbook WP00-T07 and section 3.5; controlled load-profile template; synthetic fixtures only.

**Files:** `planning/load-profile-100-students.yaml`, runbook checklist, readiness verifier, and this record.

**Verify:** Parse YAML; reject `FILL_ME`; validate unique phase/canary names, exact fields for every phase, required minimum action counts, threshold/abort coverage, mock provider mode, zero maximum cost, fixed seed, and dataset version. Later run the profile twice from reset state and compare reconciliation results.

**Pass:** A second executor reproduces the scenario and both runs meet every threshold with zero leakage, duplicates, lost work, unsettled reservations, and provider cost.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_load-profile_<environment>_<short-sha>.md` only after the runner, candidate commit, two clean runs, and an Ahmed-or-Ziad human checkpoint exist.

**Rollback:** Keep provider mode mock, stop the load runner, reset synthetic state, and retain the failed report for comparison.

**Hard stop:** Do not target beta/production, enable real providers, use real users/sources, exceed environment abort limits, or claim the gate from YAML inspection alone.

## Steps

- [~] Freeze exact synthetic population, phases, traffic, failures, payloads, canaries, thresholds, aborts, seed, and fixture version; ready for review.
- [?] Implement schema validation and the load runner in WP09.
- [?] Execute twice from reset state and obtain an Ahmed-or-Ziad human checkpoint/evidence.

## Handoff

**Changed:** Replaced every placeholder with an exact local-mock workload and preserved runner/execution/review as explicit blockers.

**Commands:** Dependency-free structural validation passed through `scripts/verify-agent-readiness.ps1`: no placeholders, eight required phases/field sets, unique canaries, minimum action totals, mock-only mode, and zero-cost limits. The isolated committed-snapshot handoff passed with six durable active records and no eligible WP00 task. A full YAML parser was not available and remains a named WP01 validation dependency; `git diff --check` passed.

**Remaining:** YAML parser validation, runner implementation, two reset-state executions, environment evidence, and an ordinary founder human checkpoint.

**Next safe action:** Run WP00-T08 to verify this draft remains mock-only and that runner/execution/review blockers are explicit; the gate must not approve the load result itself.

**Reviewer action:** Confirm total action counts meet the master-plan minimums, failure phases are separate, aborts protect cost/environment, canaries are unique, and no real target/provider/data is implied.
