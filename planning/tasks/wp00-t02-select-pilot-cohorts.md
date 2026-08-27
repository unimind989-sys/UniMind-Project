# Task record: WP00-T02 select pilot cohorts

**Task ID:** WP00-T02

**Status:** [?]

**Outcome:** D-01, D-02, and D-03 select exact evidence-backed pilot cohorts and institutions with reproducible scores, stable catalog codes, accountable people, and no mandatory rights/source blocker.

**Owner:** Codex `/root` for preparation; Ahmed and Ziad for candidate facts and governance decisions

**Reviewer:** Ahmed or Ziad — ordinary human checkpoint pending; task-specific dual scoring remains required

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-08-20

## Execution contract

**Dependencies:** WP00-T01 controlled workspace exists; its reviewer/deadline gate does not block safe decision-packet preparation.

**Inputs:** `planning/cohort-candidates.csv`, `planning/cohort-selection-review.md`, master-plan D-01/D-02/D-03, and owner-supplied candidate facts/evidence.

**Files:** `docs/decisions/d-01-human-medicine-cohort.md`, `docs/decisions/d-02-veterinary-medicine-cohort.md`, `docs/decisions/d-03-pilot-institutions.md`, `planning/cohort-candidates.csv`, `planning/cohort-selection-review.md`, `planning/decision-register.md`, this record, and synchronized runbook/work-state checks.

**Verify:** Run the readiness and isolated handoff scripts; validate CSV headers, IDs, required fields, score ranges, evidence/remediation rules, independent scores, totals, rejection rules, catalog codes, and decision/register status agreement once candidate rows exist.

**Pass:** Each selected cohort has a reproducible score, complete catalog path and ordered units, expected testers, named Batch Leader and academic reviewer, reviewed evidence, no mandatory blocker, stable codes, and owner/reviewer sign-off.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_cohort-selection_local_<short-sha>.md` after a candidate commit and completed decision review exist.

**Rollback:** Return D-01/D-02/D-03 to `OPEN`, remove any unapproved real catalog configuration, and continue with synthetic fixtures; preserve the scoring and review history.

**Hard stop:** Do not invent candidates, people, evidence, rights, scores, deadlines, catalog facts, or approval. Do not process real sources or invite students while these decisions remain open.

## Steps

- [~] Create the OPEN decision packets and exact owner-input/scoring contract; implementation is ready for review.
- [?] Receive the complete candidate list, catalog facts, accountable people, evidence references, and deadlines.
- [?] Receive independent Ahmed/Ziad scores and reconcile material differences.
- [?] Validate, rank, apply rejection rules, generate catalog codes, and draft the selected proposals.
- [?] Obtain owner and reviewer sign-off and create commit-specific evidence.

## Handoff

**Changed:** Added truthful OPEN D-01/D-02/D-03 records, a single cohort-selection review packet, decision-state validation, and explicit agent-versus-human responsibilities.

**Commands:** Readiness and isolated-handoff checks passed with WP00-T02 truthfully excluded as record-blocked. Use the live work-state script for the next recommendation because later records intentionally advance it.

**Remaining:** All candidate facts, evidence, scores, deadlines, accountable people, selection, and approval.

**Next safe action:** Ahmed and Ziad can fill or authorize the inputs listed in `planning/cohort-selection-review.md`; an agent can then validate and calculate the complete selection without further implementation help.

**Reviewer action:** Confirm the candidate list was frozen before scoring, recheck mandatory blockers and large score differences, and sign D-01/D-02/D-03 only when evidence is sufficient.
