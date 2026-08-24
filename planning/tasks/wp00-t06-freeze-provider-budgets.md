# Task record: WP00-T06 freeze provider budgets

**Task ID:** WP00-T06

**Status:** [?]

**Outcome:** Real provider initialization is impossible by default; future agents can implement and test reservation, settlement, thresholds, and kill switches without credentials or paid calls.

**Owner:** Codex `/root` for preparation; Ahmed + Ziad for D-04/D-05

**Reviewer:** UNASSIGNED — TWO-PERSON BUDGET GATE BLOCKED

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-08-23

## Execution contract

**Dependencies:** Deterministic mocks are approved; D-04/D-05, real rights, evaluation data, and D-20 channels remain open.

**Inputs:** Master-plan cost policy and D-04/D-05; runbook WP00-T06 and section 3.5; provider benchmark; owner-supplied review inputs.

**Files:** D-04, D-05, `planning/provider-budget-review.md`, provider benchmark, decision register, runbook checklist, readiness verifier, and this record.

**Verify:** Run readiness and isolated handoff; validate zero defaults, all live-gate predicates, budget scopes, threshold semantics, uncertain settlement, accepted-job behavior, two-person cap change, and zero-cost smoke expectations.

**Pass:** A reviewer can trace reservation through settlement at every threshold; all real adapters fail closed until approved nonzero configuration and two-person evidence exist; zero-cost smoke produces no provider traffic and zero ledger cost.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_provider-budget_local_<short-sha>.md` after a candidate commit and independent review exist.

**Rollback:** Set provider mode to mock, every real flag false, and all paid caps zero; preserve attempts, reservations, settlements, and governance history.

**Hard stop:** Use no provider credentials/calls, nonzero guessed caps, mixed-currency comparison, or executor-only enablement approval.

## Steps

- [~] Create truthful OPEN D-04/D-05 records and the zero-cost-by-default contract; ready for review.
- [~] Define reservation, settlement, thresholds, kill-switch, and zero-cost smoke behavior; ready for review.
- [~] Record Ahmed's partial cost direction: minimize cost, but do not treat zero spend as a hard requirement; exact caps remain open.
- [?] Receive canonical currency, every nonzero cap, approvers/reviewer, alert channels, and live confirmation profile.
- [?] Benchmark rights-approved provider candidates against frozen evaluation data.
- [?] Approve D-04/D-05 and create candidate-SHA evidence with independent budget review.

## Handoff

**Changed:** Added fail-closed provider gates, zero-cost mocks, budget state-machine rules, D-04/D-05 records, one owner-input packet, and Ahmed's partial direction to minimize cost without making zero spend mandatory.

**Commands:** Agent readiness passed with 79 governed names, 31 local links, 20 synchronized decisions, and 102 task contracts. The isolated committed-snapshot handoff passed with 13 durable active records; `git diff --check` passed, and the three changed Markdown files contained no secret-like value.

**Remaining:** Exact human budget/provider values, benchmark evidence, implementation, two-person review, and commit-specific evidence. The cost preference is recorded but is not a numeric cap or paid-enablement approval.

**Next safe action:** Owners can fill `planning/provider-budget-review.md`; an agent can advance the next selector-recommended task without enabling paid work.

**Reviewer action:** Trace concurrent reservation through uncertain settlement, confirm 100% blocks new optional work while preserving accepted work, and prove every real adapter fails closed.
