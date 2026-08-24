# Task record: WP00-T01 create planning workspace

**Task ID:** WP00-T01

**Status:** [?]

**Outcome:** A fresh agent can locate every controlled WP00 input and identify every approved or unresolved decision, owner, missing deadline, record, and blocked task.

**Owner:** Codex `/root`

**Reviewer:** UNASSIGNED — GATE BLOCKED

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-08-24

## Execution contract

**Dependencies:** None. WP00-T00 controls are implemented and awaiting review; WP00-T01 does not depend on that review result.

**Inputs:** Master-plan decision log; runbook sections 0.6 and 3.0; controlled templates under `docs/templates/`.

**Files:** `docs/decisions/README.md`, `docs/policies/README.md`, `docs/policies/raw-data-lifecycle.md`, `evals/`, `evidence/wp00-pilot/README.md`, the controlled files under `planning/`, `planning/decision-register.md`, `planning/agent-operability-audit.md`, `planning/d-17-hosting-options-discussion.html`, this task record, the synchronized master-plan/runbook entries, and the readiness verifier.

**Verify:** `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; compare staged inputs with their templates; verify D-01 through D-21 appear once in both the master plan and register; `git diff --check`; inspect the complete diff and scan changed files for credentials/private data.

**Pass:** One register exposes all decisions, owners, deadlines or explicit missing-deadline blockers, status, record location, resolution path, and exact blocked tasks; every staged input has one named template and owning task; all focused checks pass.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_decision-register_local_<short-sha>.md` after the candidate commit exists.

**Rollback:** Revert the workspace files and synchronized planning entries; no product, database, provider, real-data, or external state changed.

**Hard stop:** Do not invent decision outcomes, deadlines, owners, approvals, private fixtures, provider calls, or real-source content. A reviewer must not mark the task complete while decision deadlines or reviewer identity remain unresolved.

## Steps

- [~] Create durable scoped directories and exact template-routing instructions; implementation is ready for review.
- [~] Stage the controlled cohort, rights, policy, provider, and load inputs; placeholders remain intentionally unresolved.
- [~] Synchronize D-17 through D-21 and build the D-01 through D-21 register with exact task blockers.
- [?] Obtain decision deadlines and independent review; owners/reviewer must supply these values.
- [ ] Create commit-specific evidence after a candidate commit exists.

## Handoff

**Changed:** Created the WP00 planning workspace, explicit template routing, controlled input copies, decision/policy/evaluation/evidence maps, four missing decision IDs, a machine-checked decision register, and a bilingual D-17 hosting discussion brief that leaves the decision open.

**Commands:** Readiness, work-state parsing, controlled-input comparison, diff hygiene, and the isolated handoff passed at handoff. Use the live scripts for current counts and task recommendation.

**Remaining:** Obtain owner deadlines and reviewer assignment, then create commit-specific evidence after a candidate commit exists.

**Next safe action:** An owner can provide decision deadlines while an independent reviewer inspects the workspace and blocker mappings.

**Reviewer action:** Confirm D-17 through D-20 are true unresolved choices, validate each blocking-task mapping, and ensure no placeholder was mistaken for approval.
