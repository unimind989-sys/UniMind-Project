# Phase 2 Admin implementation

Status: implemented and approved by Ahmed at candidate `ec00466`; see the
[direct receipt](admin-approval.md). Authority to implement came from Ahmed's
[Batch Leader approval](batch-leader-approval.md).
Authority: [DESIGN](../../../DESIGN.md), master plan §7.2, runbook WP03-T09.
Same selected task and branch; single executor; zero workers.

## Contract and sequence

Use one shared role shell and supplied brand. Overview leads with the existing
decision queue. Content groups Sources/Campaigns; Academics groups Catalog/Cohorts;
Users explains the existing cohort/assignment context, with links to those seams;
Operations groups Jobs/Quality/Usage/Incidents. Keep all eight resource routes.
Real resource routes currently expose an unavailable notice; native simulation
has catalog/cohort/campaign drafts and fixed operational examples. Preserve this
distinction, all controls and truthful service boundaries. No user directory,
membership editor, invitation delivery or live resource editor is added.

Desktop keeps a compact task list beside exact decision details. Phones use a
native decision selector and labeled navigation menu. Retain current/proposed
state, expected version, failed predicates, exact target, reason, consequences,
cancel and separate-founder confirmation. Theme, locale and Account follow the
accepted shared controls. Do not change business rules or server mutations.

## Trust map before UI changes

- Identity is the existing verified application principal and server-bound founder
  slot. Route guards, scoped queue repository and action/RLS checks remain authority.
- Client selection, target/action/version, reason, expiry, attestation and request
  keys are untrusted. Shared shell, grouping and Users view confer no access.
- Server rechecks exact target, version, readiness, distinct principal, hold expiry
  and audit before mutation. Selecting a real candidate still refreshes authority.
- Keep blocked, forbidden, unavailable, stale, applied, owner review and second
  confirmation states. Preserve request-key replay handling and feedback focus.
- Native fixed data and local injected action ports remain isolated; they reject
  unknown inputs and never call a real service, provider, email or worker.
- No source text, raw object keys, private user records or privileged diagnostics
  enter the console. Student preview preserves existing scope and availability.
- Navigation uses existing routes only. Real unavailable resources stay unavailable;
  synthetic examples remain labeled. No auth/storage/schema changes are planned.

## Verification budget and checkpoint

Rejecting proof covers existing Admin domain/form/application/repository/security
tests; normal decision review/cancel/confirm/stale/blocked/error states; native
governed actions and resource draft controls; five-section navigation and narrow
menu; theme/locale/reflow/keyboard/AA. Run type/lint/boundaries and one owned
Impeccable detector pass. Inspect desktop and phone renders, both themes and
relevant EN/AR states, fix one batch and confirm. Retain failures and source-bound
captures. Broad stable-candidate checks and the pending Linux database proof
belong after final consistency acceptance.

Rollback: revert only this Admin slice, preserving accepted student/leader work.
Required stop: present the rendered Admin candidate for explicit approval before
the final product-wide consistency milestone. A focused PASS does not close T09.

## Implemented routes and components

- `/admin`: shared `AdminWorkspace`/`AppShell`, one page title, compact decision
  list/detail composition and an initial actionable selection when available.
- All eight `/admin/[resource]` routes retain their guards and existing unavailable
  notice. They now use the same frame, correct section selection and resource links.
- Native Content has the existing source lifecycle and campaign draft/invitation
  examples. Academics retains terminology/cohort draft controls. Operations retains
  fixed job, quality, usage and incident examples and their student-preview links.
- `/admin/cohorts?view=users` presents the existing assignment context in the
  native demo; the real route retains its unavailable state. No personal records,
  membership changes or user editor are implied.
- Admin Account retains existing controls and uses the accepted section styling.
  The shared brand, System/Light/Dark control and language switch are reused.
- `AdminDecisionQueue` preserves its form/action logic, exact review, readiness,
  pending founder/owner, expiry/attestation, request keys and recovery. Only the
  native injected adapter omits server refresh on selection; real selection still
  refreshes authority, and server commit checks remain unchanged.
- Phones have a labeled native menu with Escape/focus return and a native decision
  selector. Target labels use the existing localized academic context. Known failed
  predicates have plain explanations; unknown server predicates remain visible.

No Admin backend, schema, durable persistence, service contract, dependency,
provider, worker or storage change was needed. The earlier student migration and
its guarded Linux database proof remain pending before application deployment.

## Observed focused proof

The [checks record](admin-checkpoint/checks.json) retains failed attempts and replay
limits. Passing results are combined only where their relevant inputs still hold.

- Admin domain/application/form/Supabase/copy: 4 files, 52 tests passed. The two
  copy tests were replayed after adding human predicate explanations.
- Existing Admin security boundary: 5 tests passed; no domain, server action or
  repository code changed in this slice.
- Normal Admin browser proof: 8 unique cases passed across the retained 7/8 run
  and the corrected visible-target 1/1 replay. The first server start failed on
  the demo's lock; the owned demo was stopped before these normal runs.
- Native browser proof: 9 unique affected cases passed across retained runs:
  governed actions, all twelve examples and distinct confirmations, stale/blocked/
  uncertain results, isolated resource drafts, all-role sign-out, and four theme/
  language matrices. Final matrix: 4/4; final localized-target replay: Arabic 2/2.
  Each matrix covers all eight resources, Overview/Users, 1440/390/320px,
  200% text at 320px, axe WCAG A/AA and 2.1 AA, review/cancel focus and menu Escape.
- Fresh TypeScript, changed-file ESLint, boundaries and secret scan passed.
  One owned Impeccable detector pass found a 3px status side border; it was replaced
  with a quiet full 1px border and verified by inspection. No second scan is claimed.

Earlier failures found genuine enlarged-text reflow problems, then outdated
action/Arabic cancel locators, implicit select-label targeting and transient Next
document-title sampling. Corrected layout/label relationships and stronger visible
target/title assertions were replayed. No failure was silently counted as PASS.
Broad verification, safe build, database, exact-head CI and production proof have
not been run for this milestone; they belong to the final stable accepted candidate.

## Rendered review and limits

The [capture manifest](admin-checkpoint/manifest.json) binds actual JPEGs and
runtime/test source hashes. Desktop Light covers all resources; desktop Dark covers
Overview, exact confirmation, hold review, pending founder and Account. Arabic Dark
phone review covers all five sections, menu, campaign draft and Account. English
Light 360px review covers decisions, confirmation, loading, empty, blocked,
unavailable, forbidden, stale and uncertain outcomes. Scrolled review/result frames
are named and recorded as such; these are viewport captures, not full-page claims.
The 36 retained frames include Overview in all eight desktop/phone, English/Arabic
and Light/Dark combinations. None has horizontal viewport overflow.

The [inline finish review](admin-checkpoint/finish-review.md) is non-independent
and scoped to presenting Admin. Synthetic data, draft saves and local action results
do not prove real accounts, invitations, membership, processing or deployment.
Individual users and live resource readers/editors are unavailable in current seams;
those are documented capability limits, not invented functionality in this overhaul.

## Next safe action

The Admin checkpoint is approved. Complete the final product-wide consistency
review and stop for its explicit acceptance; see [the final record](phase-2-final.md). Keep T09 in progress, PR #64 draft/unmerged and the
synthetic review available on port 3101. Preserve the supplied original kit, logo
concepts, historical capture folder and unrelated bounded-logo task block.
