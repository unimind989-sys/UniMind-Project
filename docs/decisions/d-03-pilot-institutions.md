# Decision D-03: Pilot institutions

**Status:** OPEN

**Owner:** Ahmed + Ziad

**Reviewers:** Ahmed or Ziad — security/data and academic roles must be explicitly assigned before approval

**Decision deadline:** UNSCHEDULED — OWNER INPUT REQUIRED

**Last reviewed:** NOT RECORDED

**Blocks:** WP00-T03, WP00-T08, WP11-T01

## Context

Confirm the institution or education-system scope attached to the selected Human and Veterinary cohorts. Institution choice follows candidate evidence for rights, complete sources, reviewers, tester access, and Batch Leader readiness.

## Non-negotiable requirements

- Each selected institution is part of a complete catalog path and has an exact cohort/curriculum edition.
- Source permissions and student-use boundaries are verifiable for the pilot scope.
- Academic reviewers and Batch Leaders are accountable for the selected cohorts.
- The selection can be represented through shared catalog configuration rather than institution-specific code.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Institutions referenced by candidate rows | NOT EVALUATED — no candidate rows supplied | NOT EVALUATED | NOT EVALUATED | NOT EVALUATED | Catalog configuration only | `planning/cohort-candidates.csv` |

## Decision

OPEN — no pilot institution or education system has been proposed or approved.

## Consequences

### Benefits

- A reviewed scope will align catalog codes, rights inventory, source collection, evaluation, and beta onboarding.

### Costs and risks

- Real source collection and beta readiness remain blocked until institution and cohort evidence are reviewed together.

## Implementation contract

- Configuration keys: stable institution/system and downstream catalog codes after selection.
- Adapter/interface: synthetic institutions until approval.
- Affected migrations/files: controlled planning records first; real catalog seed/config only after approval.
- Tests/evaluation required: shared catalog-path validation and cross-institution/cohort isolation.
- Observability required: institution/system and decision IDs in later release evidence.
- Rollback/disable action: keep real institutions absent from release configuration.

## Revisit triggers

- Candidate scope, rights, academic reviewers, source completeness, tester access, or institution participation changes.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
|  |  |  |  |
