# Decision D-02: First Veterinary Medicine cohort

**Status:** OPEN

**Owner:** Ziad

**Reviewers:** Ahmed; academic-review role must be assigned to Ahmed or Ziad before approval

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** NOT RECORDED

**Blocks:** WP00-T03, WP00-T05, WP00-T08, WP10-T01, WP10-T02, WP11-T01

## Context

Select one exact Veterinary Medicine cohort and curriculum edition using the same evidence model as Human Medicine. Candidate facts belong in `planning/cohort-candidates.csv`; scoring and owner actions are defined in `planning/cohort-selection-review.md`.

## Non-negotiable requirements

- The complete catalog path, ordered curriculum units, expected testers, Batch Leader, and accountable academic reviewer are named.
- Required provider-processing and student-use rights have no denial or unresolved mandatory blocker.
- Complete-enough source material and evaluation-question capacity exist for the constrained PoC.
- Ahmed and Ziad score independently and reconcile differences of two or more points.
- Selection does not introduce a Veterinary-specific architecture or duplicate knowledge pipeline.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Veterinary Medicine candidate rows | NOT EVALUATED — no candidate rows supplied | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | Catalog configuration only | `planning/cohort-candidates.csv` |

## Decision

OPEN — no Veterinary Medicine cohort or institution has been proposed or approved.

## Consequences

### Benefits

- A reviewed choice will give validation tasks one exact second-program scope without parallel architecture.

### Costs and risks

- Real Veterinary source and validation work remains blocked while candidate facts, rights evidence, reviewers, and scoring are missing.

## Implementation contract

- Configuration keys: stable ASCII catalog codes after selection.
- Adapter/interface: synthetic catalog fixtures until approval.
- Affected migrations/files: no real catalog migration before approval; update controlled planning and decision records first.
- Tests/evaluation required: candidate validation, scoring/rejection checks, ordered unit list, and second-program isolation review.
- Observability required: decision ID and curriculum edition in later validation/evidence records.
- Rollback/disable action: keep real Veterinary cohort release disabled and retain synthetic fixtures.

## Revisit triggers

- Candidate rows or rights evidence change, a reviewer becomes unavailable, the curriculum edition changes, or a mandatory blocker appears.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
