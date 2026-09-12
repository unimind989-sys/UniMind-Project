# Decision D-03: Pilot institutions

**Status:** APPROVED

**Owner:** Ahmed + Ziad

**Reviewers:** Ahmed — ordinary founder checkpoint under D-22

**Decision deadline:** N/A — APPROVED 2026-09-10

**Last reviewed:** 2026-09-10

**Blocks:** NONE — D-02 and every per-source rights/release gate remain independent

## Context

Confirm the institution scope attached to the Human and Veterinary pilot programs. Ahmed and Ziad are both physically present at Zagazig University in the relevant faculties, giving the PoC direct access to testers, rolling curriculum material, and operational feedback. The institution choice is separate from the exact Veterinary cohort still required by D-02.

## Non-negotiable requirements

- Zagazig University is used as configurable catalog data for both programs, not as institution-specific application logic.
- The exact Human Medicine path is governed by D-01; D-02 must still define the Veterinary cohort and curriculum edition.
- Rights are checked as a pass/fail gate for each source before upload and do not reopen the institution choice.
- Academic reviewers and campaign-scoped Batch Leaders remain accountable under each cohort decision.
- The selection can be represented through shared catalog configuration rather than institution-specific code.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Zagazig University for Human and Veterinary Medicine | Strong direct founder/tester access in both faculties | Per-source rights eligibility remains mandatory | Rolling field access supports collection and feedback | No institution-specific cost identified | Catalog configuration only | Ahmed workshop and confirmation dated 2026-09-10 |

## Decision

APPROVED — use Zagazig University as the pilot institution for both Human Medicine and Veterinary Medicine. D-01 owns the exact Human Medicine cohort. D-02 remains open for the exact Veterinary cohort, ordered Subjects, testers, academic reviewer, and campaign staffing.

## Consequences

### Benefits

- Catalog codes, source collection, evaluation, and beta onboarding can share one confirmed institution scope.
- Direct founder presence supports faster feedback and rolling source collection in both programs.

### Costs and risks

- D-02 still blocks the exact Veterinary scope.
- No source becomes processing-eligible merely because its institution is approved.

## Implementation contract

- Configuration keys: stable institution/system and downstream catalog codes after selection.
- Adapter/interface: retain synthetic institutions until D-02 closes and the real catalog-seeding task is authorized.
- Affected migrations/files: controlled planning records first; real catalog seed/config only in its authorized downstream task.
- Tests/evaluation required: shared catalog-path validation and cross-institution/cohort isolation.
- Observability required: institution/system and decision IDs in later release evidence.
- Rollback/disable action: disable Zagazig catalog release and retain synthetic fixtures without deleting the approval history.

## Revisit triggers

- Direct tester access materially changes, either program moves outside Zagazig University, or shared catalog configuration cannot represent the institution without custom code.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Ahmed | Shared founder authority | Approved Zagazig University for the Human and Veterinary Medicine pilot programs | 2026-09-10 |
