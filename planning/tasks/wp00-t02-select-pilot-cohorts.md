# Task record: WP00-T02 select pilot cohorts

**Task ID:** WP00-T02

**Status:** [?]

**Outcome:** D-01 records the founder-approved Human Medicine cohort, D-03 records Zagazig University for both programs, and D-02 selects the exact Veterinary cohort with reproducible evidence, stable catalog codes, accountable people, and no mandatory rights/source blocker.

**Owner:** Codex `/root` for preparation; Ahmed and Ziad for candidate facts and governance decisions

**Reviewer:** Ahmed approved D-01 with Ziad's confirmation relayed under D-22 and approved D-03 directly; ordinary human checkpoint and dual scoring remain required for D-02

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-09-10

## Execution contract

**Dependencies:** WP00-T01 controlled workspace exists; its reviewer/deadline gate does not block safe decision-packet preparation.

**Inputs:** `planning/cohort-candidates.csv`, `planning/cohort-selection-review.md`, master-plan D-01/D-02/D-03, and owner-supplied candidate facts/evidence.

**Files:** `docs/decisions/d-01-human-medicine-cohort.md`, `docs/decisions/d-02-veterinary-medicine-cohort.md`, `docs/decisions/d-03-pilot-institutions.md`, `planning/cohort-candidates.csv`, `planning/cohort-selection-review.md`, `planning/decision-register.md`, this record, and synchronized runbook/work-state checks.

**Verify:** Run the readiness and isolated handoff scripts; validate CSV headers, IDs, required fields, score ranges, evidence/remediation rules, independent scores, totals, rejection rules, catalog codes, and decision/register status agreement once candidate rows exist.

**Pass:** D-01 and D-03 preserve their documented founder-approved directions; D-02 has reproducible scores, complete catalog facts, accountable roles, reviewed evidence, no mandatory blocker, stable codes, and owner/reviewer sign-off.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_cohort-selection_local_<short-sha>.md` after a candidate commit and completed decision review exist.

**Rollback:** Return D-01/D-02/D-03 to `OPEN`, remove any unapproved real catalog configuration, and continue with synthetic fixtures; preserve the scoring and review history.

**Hard stop:** Do not invent candidates, people, evidence, rights, scores, deadlines, catalog facts, or approval. Do not process real sources or invite students while these decisions remain open.

## Steps

- [~] Create the OPEN decision packets and exact owner-input/scoring contract; implementation is ready for review.
- [x] Record the founder-approved D-01 scope, rolling-source model, academic reviewer, Batch Leader boundary, expected testers, and per-source rights gate.
- [x] Record Zagazig University as the founder-approved D-03 institution for both programs.
- [?] Receive the complete D-02 candidate list, catalog facts, accountable people, evidence references, and deadline.
- [?] Receive independent Ahmed/Ziad scores for the unresolved Veterinary candidates and reconcile material differences.
- [?] Validate, rank, apply rejection rules, generate catalog codes, and draft the selected proposals.
- [?] Obtain owner and reviewer sign-off and create commit-specific evidence.

## Handoff

**Changed:** Added truthful OPEN D-01/D-02/D-03 records, a single cohort-selection review packet, decision-state validation, and explicit agent-versus-human responsibilities.

**Commands:** Readiness and isolated-handoff checks passed with WP00-T02 truthfully excluded as record-blocked. Use the live work-state script for the next recommendation because later records intentionally advance it.

**Remaining:** D-02 candidate facts, evidence, scores, deadline, accountable people, selection, and approval; stable catalog codes and evidence.

**Next safe action:** Ziad can supply the D-02 Veterinary candidate facts and both founders can supply the remaining D-02 inputs listed in `planning/cohort-selection-review.md`.

**Reviewer action:** Preserve the D-01 and D-03 approvals, confirm the D-02 candidate list was frozen before scoring, recheck mandatory blockers and large score differences, and sign D-02 only when evidence is sufficient.
