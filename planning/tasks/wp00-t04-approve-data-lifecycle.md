# Task record: WP00-T04 approve data lifecycle

**Task ID:** WP00-T04

**Status:** [?]

**Outcome:** A source-state executor can determine whether raw and temporary data must be retained, deleted, retried, quarantined, or held; real-data behavior is impossible until D-10/D-19 and rights/provider inputs are approved.

**Owner:** Codex `/root` for preparation; security/data owner UNASSIGNED for real policy

**Reviewer:** Ahmed + Ziad — protected raw-deletion gate blocked pending both confirmations

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-08-20

## Execution contract

**Dependencies:** D-09 approved direction; D-10 proposed format; D-19 open values; D-04/D-18/D-20 and real rights rows remain unavailable.

**Inputs:** Master-plan sections 6, 15, and 16; runbook WP00-T04 and sections 3.2/3.3; `CONTEXT.md`; controlled policy template; owner-supplied review inputs.

**Files:** `docs/policies/raw-data-lifecycle.md`, D-10, D-19, `planning/raw-data-policy-review.md`, decision register, runbook checklist, readiness verifier, and this record.

**Verify:** Run readiness and isolated handoff checks; compare lifecycle terms with `CONTEXT.md`; validate exact synthetic durations/start events, production blockers, D-10/D-19 status agreement, data-flow locations, deletion preconditions, retry/incident rules, and rights/provider hard stops.

**Pass:** Synthetic behavior is deterministic and production startup cannot use it; real profile values, thresholds, rights paths, provider verification, owner/reviewer, and approval are complete; both founders confirm the re-run raw-deletion gate.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_data-lifecycle_local_<short-sha>.md` only after a candidate commit and separate Ahmed/Ziad protected-gate confirmations exist.

**Rollback:** Remove the unapproved real profile, disable real upload/provider/storage paths, and retain the synthetic fixtures and append-only decision history.

**Hard stop:** Do not treat synthetic durations as real policy, enable real sources/providers, infer owner approval, delete real data, or let the executor approve its own raw-deletion gate.

## Steps

- [~] Encode the approved D-09 direction and deterministic synthetic-only lifecycle; implementation is ready for review.
- [~] Create the D-10 processed-format proposal and exact acceptance thresholds; approval remains open.
- [~] Create the D-19 record and one concise owner-input packet; real values remain open.
- [?] Name Ahmed or Ziad as security/data owner and receive both founders' protected-gate confirmations, deadlines, real durations, hold authority, and incident recipients.
- [?] Validate representative rights-approved fixtures and provider-specific absence semantics.
- [?] Approve D-10/D-19 and create candidate-SHA evidence with separate Ahmed/Ziad raw-deletion confirmations.

## Handoff

**Changed:** Added a deterministic synthetic lifecycle, exact proposal thresholds, explicit real-data rejection boundary, D-10/D-19 records, and a single human review packet.

**Commands:** `scripts/verify-agent-readiness.ps1` passed after checking 49 governed names, 26 local links, 20 synchronized decisions, and 102 task contracts. `scripts/show-work-state.ps1` reports WP00-T04 record-blocked and recommends WP00-T06.

**Remaining:** All real-data policy values, rights/provider checks, owner/reviewer assignment, approval, implementation tests, and commit-specific evidence.

**Next safe action:** The security/data owner can fill or authorize `planning/raw-data-policy-review.md`; meanwhile an agent can advance the next selector-recommended task that does not depend on real-data approval.

**Reviewer action:** Confirm synthetic values cannot reach a production profile, thresholds prevent premature deletion, holds are auditable, absence verification is independent, and no real provider/storage path is implied.
