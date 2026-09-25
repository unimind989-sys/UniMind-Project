# Task record: WP00-T15 verification feedback

**Task ID:** WP00-T15

**Status:** [~]

**Outcome:** Broad local proof fails when its candidate changes during execution, proof preflight uses the active task's checks, and database work can receive guarded disposable feedback before a PR without weakening required CI.

**Owner:** Codex `/root`; Ahmed is the selected chat profile

**Reviewer:** Ahmed; D-22 standing non-financial authorization applies

**Branch:** `codex/verification-feedback`

**Updated (UTC):** 2026-09-25T12:45:00Z

## Derived execution envelope

**Policy version:** 7

**Surfaces:** docs, delivery, tooling

**Risk:** R2

**Planning:** Short

**Worker budget:** 0 used; maximum 1; nesting prohibited

**Capabilities:** release-safety

**Procedural skills:** writing-for-agents

**Routing reason:** The local verification gate and protected CI workflow change; product runtime, Auth, and database schemas do not.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | Implement one guarded local completion check, task-bound proof preflight, and a manual database-only dispatch using the existing CI job; document and deliver. | A code edit during broad verification invalidates its result; a stable exit-zero result remains green; preflight includes the active task's `Verify` checks and rejects a missing task; manual feedback runs only the existing disposable database job; PR/push still run full required jobs; exact-head CI and protected delivery pass. | Verification and CI trust semantics need one coherent review; another chat would repeat the audit context. | Implementation complete; focused checks passed; broad and protected proof pending. |

**Next model:** NONE

**Current block:** 1

## Execution contract

**Dependencies:** Completed WP00-T09 through T14 workflow controls; T04–T06 execution evidence.

**Inputs:** `docs/agents/agent-workflow.md`, `.github/workflows/ci.yml`, current policy and verification scripts, T04–T06 transcript audit.

**Files:** `scripts/derive-agent-execution.ts`, `scripts/lib/agent-execution-policy.ts`, `scripts/lib/ci-workflow-policy.ts`, `.github/workflows/ci.yml`, focused unit tests, `CONTRIBUTING.md`, workflow/runbook, this record, sanitized evidence.

**Verify:** Focused agent-execution tests for fingerprint completion and task-bound preflight; focused CI workflow tests for safe database feedback dispatch.

**Pass:** A final fingerprint mismatch rejects local broad proof even after a green chain; standalone preflight includes the active task checks and rejects an absent record; manual feedback cannot skip application proof on PR/push and cannot reach Preview/Beta; required CI and clean protected delivery pass.

**Evidence:** Sanitized WP00-T15 report under `evidence/wp00-pilot/` bound to the reviewed commit.

**Rollback:** Revert the workflow and verifier change together; no product schema, live data, or hosted resource is mutated.

**Hard stop:** Preserve required PR checks, branch protection, synthetic-only database CI, and unrelated user work; no paid resource or financial exposure without fresh Ahmed-and-Ziad confirmation.

## Candidate preparation

**Design disposition:** NOT_APPLICABLE

**Design evidence:** NOT_REQUIRED

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** 892abece93b97e98af6d0d4626617bbc7611a9d12a1120cadfa08359302c5d55

**Unresolved findings:** NONE

**Established facts:** The new dispatch is opt-in and keeps `database-ci` unchanged; PR and push application jobs stay enabled. The local gate and standalone preflight both read the active task's `Verify` field. Focused tests cover success and rejection paths.

## Steps

- [x] Implement and test end-of-run candidate fingerprint validation.
- [x] Bind standalone proof preflight to the active task record's `Verify` checks.
- [x] Add manual guarded database feedback with normal PR/push jobs intact.
- [~] Review the final diff, verify, deliver, record evidence, and clean the branch.

## Handoff

**Changed:** Local broad verification checks its fingerprint again at completion; standalone preflight reads task `Verify`; CI has an opt-in database feedback dispatch; policy tests and workflow documentation cover the behavior.

**Commands:** Focused policy and CI workflow tests 61/61 exit 0; CI workflow and agent policy audits exit 0; fresh TypeScript exit 0; readiness and handoff rehearsal exit 0; lint, format, and secret scan exit 0.

**Remaining:** Preflight, guarded broad verification, exact-head CI, protected delivery, evidence, cleanup.

**Next safe action:** Freeze this candidate and run proof preflight, then guarded broad verification.

**Reviewer action:** NONE
