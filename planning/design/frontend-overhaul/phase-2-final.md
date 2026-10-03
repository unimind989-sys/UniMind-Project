# Final product consistency checkpoint

Status: ready for explicit final product-wide approval. Admin candidate `ec00466` is accepted; see the
[direct receipt](admin-approval.md). This is WP03-T09 P2-F on the existing branch,
single executor, zero workers. [DESIGN](../../../DESIGN.md) remains canonical.

## Review contract

Preserve the accepted Phase 1, student, Batch Leader and Admin direction. Inspect
the connected normal product journeys, shared brand/theme/locale/navigation,
reading/form hierarchy, narrow reflow and honest service/state boundaries.
Use only supplied fictional accounts, files and fixed examples. No new capability,
dependency, infrastructure, provider, worker or paid exposure is authorized.

The accepted role packets retain their executed security, behavior, accessibility
and failure-state proof where relevant runtime inputs are unchanged. This bounded
cross-product review checks the joins and renders representative desktop/phone
surfaces in both themes and languages. Classify any observed drift and correct only
its narrow cause. Replay only affected proof. No additional detector is needed
without an owned UI change; earlier one-pass detector findings retain their
recorded resolutions.

## Verification budget and stop

Use the existing cross-role responsive/navigation and role sign-out checks to
reject shared-frame regressions. Inspect actual renders and interactions, with
captured geometry and source hashes. Reuse unchanged feature-level proof in the
accepted role packets. Documentation/readiness/secret/diff checks cover the final
packet and receipt updates. No compilation alone is visual proof.

Present the concrete final consistency candidate and stop for explicit approval.
Only after that acceptance run the guarded broad stable-candidate gate, safe build,
Linux disposable database reset/upgrade/pgTAP/type parity, exact-head CI and normal
protected delivery lifecycle. Keep PR #64 draft/unmerged and WP03-T09 in progress.
WP04 remains after the separate WP03-T10 review gate.

Rollback: revert only new final-review corrections if any; preserve all accepted
role work, branch history and unrelated supplied kit/logo exploration files.

## Final candidate and audit disposition

The accepted neutral system now covers public/identity, Student, Batch Leader and
Admin. The original audit is retained in the [overhaul review](../../../docs/reviews/wp03-frontend-overhaul.md);
its predecessor findings are not presented as current defects.

| Audit finding                                                              | Result in this candidate                                                                                       | Capability retained                                                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Technical home page, competing taglines and weak first visit               | Public hero, actual product preview, how it works, CTA/footer and exact two-line slogan                        | Normal registration, verification, consent, recovery and verified-role entry                                           |
| Repeated academic setup and missing real Account                           | One-time academic selection with editable Account → Academic settings                                          | Caller-authorized catalog hierarchy, Module/Subject terminology and availability                                       |
| Forced dark theme and disconnected role shells                             | Paired semantic neutral tokens; System/Light/Dark before paint; one Brand, shell and shared control vocabulary | English/Arabic direction, device preference fallback and role-specific access                                          |
| Repeated workspace preamble and lost context                               | Study/Subjects/Account; subject-local Materials/Chat/Studio/Quiz and contextual return links                   | Existing sessions, seven answer outcomes, six Studio types, quiz, evidence/report and privacy limits                   |
| Picker/drop losing all but the first file; repeated classification         | Visible mixed-file queue, unique inferred request, per-file progress/cancel/retry/receipt                      | Existing byte/size/checksum/rights validation, stable request keys and separate upload/finalize/processing             |
| Admin resources leaving their shell and ambiguous simulated capabilities   | Overview/Content/Academics/Users/Operations; compact phone controls, exact target and review                   | Existing eight resources, guarded unavailable states, stale/version/readiness checks and distinct-founder confirmation |
| Generic panels, duplicated identity controls and stale review instructions | Useful rows, restrained reading/form hierarchy, supplied Open Folio variants and current all-role walkthrough  | Existing useful filtering, authorized scope switches and document-local demo isolation                                 |

## Changes in this final slice

1. Session metadata now reads `Replies · 1` / `الإجابات · ١`, fixing the observed
   `1 replies` copy without changing session counts, selection, content or streaming.
2. The walkthrough, generator metadata and downloadable pack describe the current
   all-role product rather than an earlier Chat/Studio-only proposal. The generated
   walkthrough's local audit link resolves to the audit filename inside the pack.
3. Recorded the direct Admin receipt and reconciled current status in DESIGN,
   the Admin surface brief, design-stack guidance, review records and task handoff.

No new route, backend, schema, durable persistence, dependency or provider was
added in this final slice. Accepted runtime components retain their role receipts;
the final packet binds current relevant source hashes and new actual captures.

## Changed routes and shared system across Phase 2

| Area                                                    | Implemented presentation and owning components                                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`, identity routes and callbacks                      | Landing; shared AuthShell/AuthForm; verified role routing; consent/recovery states                                                            |
| `/learn` and `/settings`                                | StudyShelf, Account and academic settings; current subject/resume and searchable Subjects                                                     |
| `/learn/[cohortSlug]/[unitSlug]` and local study routes | WorkspaceFrame, ProductChat/ProductStudy/ProductStudio; Materials and contextual supporting viewer/evidence/report/quiz                       |
| `/batch-leader`, campaign and invitation                | CollectionFlow, assigned campaign entry, History, queue and receipts                                                                          |
| `/admin` and eight resource routes                      | AdminWorkspace, AdminDecisionQueue and existing resource presentations within five groups                                                     |
| Shared                                                  | Brand, AppShell, PageState, semantic controls, global/product styles, theme bootstrap/provider, favicon/app icons and supplied preview assets |

DESIGN remains the canonical contract for Manrope/Noto Sans Arabic, paired neutral
surfaces and one restrained accent, widths/breakpoints, spacing/type, borders,
focus/state styling, reduced motion and logical RTL layout. Role briefs and current
guides refer to it; historical approvals/evidence retain their original scope.
No gradients, glows, decorative statistics or repeated decorative icon tiles were
introduced. The supplied logo palette/proportions and unmirrored Arabic behavior
are retained through one shared Brand component.

## Backend and persistence reasons across Phase 2

The student slice adds only nullable versioned `profiles.academic_context` to the
existing profile, with a column-specific grant, caller-scoped validation/trigger
and rejecting tests. This is necessary to retain the student's academic selection
across real refreshes/sessions; the saved hierarchy never grants access. The
verified-caller role read removes repeated role selection; existing own-session
reads support truthful resume where available. The existing account model has no
theme field, so appearance uses only a validated local device preference, applied
before first paint with System/storage-denial fallback. See the
[student trust map and implementation record](phase-2-student.md).

Batch Leader composes the existing per-file transport/finalize seams; Admin
preserves existing domain/server authority. Neither slice adds backend/schema
behavior. The profile migration has **not** been applied to hosted data. Linux
disposable reset/upgrade, twelve new pgTAP assertions and generated-type parity
remain required before deployment; mocks/screenshots are not database proof.

## Focused checks and rendered review

The [checks](final-checkpoint/checks.json), [source/capture manifest](final-checkpoint/manifest.json)
and [inline finish review](final-checkpoint/finish-review.md) bind this presentation.

- Existing cross-role browser matrix: **3/3 PASS**, covering 23 destinations per
  language at 1440/768/390/320px, WCAG A/AA, direction, keyboard focus, reduced
  motion/enlarged text and normal sign-out/role change. These unchanged navigation
  inputs retain that proof after the final session-label correction.
- Affected populated study/interruption/reflow proof after that correction:
  **4/4 PASS**, English/Arabic with both themes, enlarged text, accessible controls,
  preserved drafts/history/output language and Studio interruption.
- Fresh TypeScript and changed-file lint passed after the final script edit.
  Policy v8 and module boundaries passed; readiness checked 522 names, 136 links,
  23 synchronized decisions and 113 task contracts. Secret scanning passed for
  3,004 files. Nine allowlisted ZIP entries match their source hashes; account and
  upload-fixture bytes are unchanged. Formatting, full diff/scope and
  source/capture bindings are checked before committing the presentation.
- One owned Impeccable detector pass on the tiny UI change returned zero findings.
  No repeat detector pass or independent review is claimed.
- **29 new inspected viewport JPEGs** connect landing/auth/onboarding/Shelf,
  Materials/populated Chat/Studio/viewer/evidence/report/quiz/Account, campaign
  entry/History and Admin. Desktop 1440×1000 and phone 390×900 CSS viewports cover
  both themes and relevant RTL/LTR joins, with no horizontal overflow. Scrolled
  frames and actual JPEG dimensions are explicit in the manifest.

The accepted [student](student-checkpoint/manifest.json),
[Batch Leader](batch-leader-checkpoint/manifest.json) and
[Admin](admin-checkpoint/manifest.json) packets retain their feature, contrast,
responsive and loading/error/empty/retry/stale/uncertain-state proof where relevant
inputs are unchanged. This final pass rechecks shared joins and affected populated
text rather than claiming a fresh complete rerun of every historical state.
Synthetic fixtures establish frontend behavior only, with no real credentials,
source data, uploads, generations, invitations, audit writes or paid services.

## Approval boundary, limitations and follow-ups

The final product candidate is ready for founder review; explicit product-wide
approval is still required by the user's milestone instruction and the frontend
quality floor. All three role checkpoints are accepted; this record does not
invent final acceptance. T09 remains `[~]`, PR #64 draft/unmerged, and the local
review remains available at `http://127.0.0.1:3101/?lang=en`.

After explicit final approval, run the guarded broad stable-candidate gate once,
safe build and required Linux database proof, then exact-head CI/protected delivery
and affected production proof. Rerun only checks invalidated by later changes.
WP03-T10 remains the separate reviewed mock gate before WP04.

Out-of-scope follow-ups remain with their runbook owners: live model/generation,
artifact/report durability, source processing/original file viewer, broader Admin
resource CRUD/invitations/membership and undecided retention/provider policy.
Do not reopen WP00, add Telegram, workers, providers or speculative functionality.
Preserve the unrelated supplied kit/concept exploration and existing branch work.
