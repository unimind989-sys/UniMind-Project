# Task record: WP00-T01 create planning workspace

**Task ID:** WP00-T01

**Status:** [?]

**Outcome:** A fresh agent can locate every controlled WP00 input and identify every approved or unresolved decision, owner, missing deadline, record, and blocked task.

**Owner:** Codex `/root`

**Reviewer:** Ahmed or Ziad — ordinary human checkpoint pending

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-09-09

## Execution contract

**Dependencies:** None. WP00-T00 controls are implemented and awaiting review; WP00-T01 does not depend on that review result.

**Inputs:** Master-plan decision log; runbook sections 0.6 and 3.0; controlled templates under `docs/templates/`.

**Files:** `docs/decisions/README.md`, `docs/policies/README.md`, `docs/policies/raw-data-lifecycle.md`, `evals/`, `evidence/wp00-pilot/README.md`, the controlled files under `planning/`, `planning/decision-register.md`, `planning/agent-operability-audit.md`, `planning/decision-workshop.html`, `planning/d-17-hosting-options-discussion.html`, this task record, the synchronized master-plan/runbook entries, and the readiness verifier.

**Verify:** `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; compare staged inputs with their templates; verify D-01 through D-22 appear once in both the master plan and register; exercise the decision workshop in a real browser for both profiles, persistence, validation, import, and all export formats; `corepack pnpm verify`; `git diff --check`; inspect the complete diff and scan changed files for credentials/private data.

**Pass:** One register exposes all decisions, owners, deadlines or explicit missing-deadline blockers, status, record location, resolution path, and exact blocked tasks; every staged input has one named template and owning task; all focused checks pass.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_decision-register_local_<short-sha>.md` after the candidate commit exists.

**Rollback:** Revert the workspace files and synchronized planning entries; no product, database, provider, real-data, or external state changed.

**Hard stop:** Do not invent decision outcomes, deadlines, owners, approvals, private fixtures, provider calls, or real-source content. A reviewer must not mark the task complete while decision deadlines or reviewer identity remain unresolved.

## Steps

- [~] Create durable scoped directories and exact template-routing instructions; implementation is ready for review.
- [~] Stage the controlled cohort, rights, policy, provider, and load inputs; placeholders remain intentionally unresolved.
- [~] Synchronize D-17 through D-22 and build the D-01 through D-22 register with exact task blockers.
- [~] Provide a bilingual, local-only workshop that captures Ahmed's English and Ziad's Egyptian-Arabic answers separately and exports structured discussion files without treating them as approvals.
- [?] Obtain decision deadlines and an Ahmed-or-Ziad human checkpoint; owners must supply the missing values.
- [ ] Create commit-specific evidence after a candidate commit exists.

## Handoff

**Changed:** Created the WP00 planning workspace, explicit template routing, controlled input copies, decision/policy/evaluation/evidence maps, four missing decision IDs, a machine-checked decision register, a bilingual D-17 hosting discussion brief, and a local bilingual decision workshop that keeps Ahmed's and Ziad's answers separate and exportable while leaving every decision open until formal review.

**Commands:** `corepack pnpm verify` passed after the workshop was added. Browser verification covered Ahmed LTR and Ziad RTL rendering, required-field validation, local draft restore, JSON import, individual JSON/Markdown export, and combined JSON export without console errors. After correcting the WP02-T09 task-record header to the required singular `Branch`, `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` passed with 163 names, 46 local links, 22 synchronized decisions, and 102 task contracts; `pwsh -NoProfile -File scripts/test-agent-handoff.ps1` passed from an isolated committed snapshot.

**Remaining:** Obtain owner deadlines and reviewer assignment, then create commit-specific evidence after a candidate commit exists.

**Next safe action:** Ahmed and Ziad can complete and export their separate workshop files for comparison while an owner provides decision deadlines.

**Reviewer action:** Compare the two founder exports, close each decision through its governed record and review path, confirm D-17 through D-20 are true unresolved choices, and ensure no workshop answer or placeholder is mistaken for approval.
