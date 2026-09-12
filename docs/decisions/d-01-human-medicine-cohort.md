# Decision D-01: First Human Medicine cohort

**Status:** APPROVED

**Owner:** Ahmed

**Reviewers:** Ziad; Ahmed is the accountable academic reviewer

**Decision deadline:** N/A — APPROVED 2026-09-10

**Last reviewed:** 2026-09-10

**Blocks:** NONE — downstream work must conform; D-02, D-03, and per-source rights gates remain independent

## Context

Select one exact Human Medicine cohort and curriculum edition for the PoC. Ahmed selected the cohort from direct field access and academic familiarity, and reported Ziad's separate confirmation under D-22's relayed-confirmation rule.

## Non-negotiable requirements

- The complete catalog path, ordered curriculum units, expected testers, Batch Leader authority, and accountable academic reviewer are defined.
- Rights are a pass/fail eligibility gate for every source before upload; they are not a comparative factor that can reopen this cohort choice.
- Rolling source collection is expected as lectures are released. A curriculum unit cannot become available until it has sufficient accepted READY sources.
- Batch Leaders remain campaign-scoped contributors with submission and status access only. A person may be assigned or replaced per campaign without changing this decision.
- Ahmed is the accountable Human Medicine academic reviewer. Ahmed and Ziad retain founder access to cohort administration, sources, processing, and operational state; access to student chat content is governed separately by D-08.

## Options evaluated

| Option | Quality/fit | Security/rights | Reliability | Cost | Migration/lock-in | Evidence |
| --- | --- | --- | --- | --- | --- | --- |
| Zagazig University MBBCh, Year 5, Term 1, 2026/2027, Integrated 5+2 Bylaw | Direct founder access to the cohort and up to 50 expected testers; rolling lecture availability accepted | Every uploaded source must pass the separate pre-upload rights gate | Ahmed is academic reviewer; Batch Leader assignment is campaign-scoped | Fits the constrained PoC | Catalog configuration only | Ahmed workshop dated 2026-09-10; Ziad confirmation relayed by Ahmed on 2026-09-10 |

## Decision

APPROVED — use this catalog path:

`Undergraduate -> Zagazig University -> MBBCh -> Year 5 -> Term 1 -> 2026/2027 cohort -> Integrated 5+2 Bylaw`

Use the ordered Human Medicine Module labels `Child Health / Pediatrics`, `GIT`, `Nutrition`, and `Professional Practice`. Begin with up to 50 expected testers. Ahmed is the accountable academic reviewer. Assign each Batch Leader only through a bounded collection campaign, with upload/submission and status access but no publication, release, role-management, or student-learning-data authority.

The founders confirmed that source rights are checked before anything is uploaded. This decision does not authorize a specific source: WP00-T03 must still record the pass/fail rights result for each source candidate before processing. Source availability may grow with the academic term, but no unit is released before its own accepted source material is sufficient.

## Consequences

### Benefits

- Later source, evaluation, catalog, and beta tasks have one exact Human Medicine scope.
- Rolling collection reflects how lectures become available during the term without reopening the cohort decision.

### Costs and risks

- D-02 and D-03 still block completion of the combined pilot-selection task.
- Every real source remains blocked until its own rights and processing-eligibility record passes.
- Campaign staffing can change, so each Batch Leader assignment requires its own bounded record.

## Implementation contract

- Configuration keys: stable ASCII catalog codes generated from the approved path before real catalog seeding.
- Adapter/interface: retain synthetic catalog fixtures until D-02/D-03 close and the real catalog-seeding task is authorized.
- Affected migrations/files: controlled planning and decision records first; real catalog seed/config only in its authorized downstream task.
- Tests/evaluation required: catalog-path validation, ordered unit list, campaign-scoped Batch Leader authorization, and per-unit source/evaluation readiness review.
- Observability required: decision ID and catalog edition in later release/evidence records.
- Rollback/disable action: disable the Human Medicine cohort release and retain synthetic fixtures without deleting the approval history.

## Revisit triggers

- The curriculum edition or ordered Module scope changes, Ahmed becomes unavailable as academic reviewer, direct tester access materially changes, or the cohort no longer fits the constrained PoC.

## Approval

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Ahmed | Product owner and Human Medicine academic reviewer | Approved the cohort, rolling-source model, founder administrative access, and per-source pre-upload rights gate | 2026-09-10 |
| Ziad | Founder reviewer | Confirmed the D-01 direction; confirmation relayed by Ahmed under D-22 | 2026-09-10 |
