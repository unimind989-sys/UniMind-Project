# Task record: WP03-T13 student entry and navigation

**Task ID:** WP03-T13

**Status:** [?]

**Outcome:** Progressive student entry, distinct Study/Subjects, a named profile, independent settings views, spacious product layouts, scoped unit switching, persistent chat preferences and configurable fixture quizzes.

**Owner:** Codex `/root`; selected speaker Ahmed; one separately executing read-only reviewer.

**Reviewer:** Ahmed for current checkpoint release acceptance; /root/audit_reconciliation for independent technical review; executor-controlled distinct-account GitHub approval remains separate.

**Branch:** codex/frontend-refinements

**Updated (UTC):** 2026-10-16T12:00:00Z

## Authorized scope

Ahmed requested this slice after accepting and locally committing WP03-T12. Keep landing and the entire login/access flow unchanged. Language control changes apply to the shared product shell for all roles. Student setup asks one academic question at a time using native radio choices; previous choices remain editable. Study is a start/resume destination; Subjects owns the searchable authorized catalog. Student replaces both the Account navigation label and the separate noninteractive Student identity item. Settings capabilities and route remain intact. No backend, membership, availability, account identity, provider or storage rule changes.

Implement and verify locally for review. Do not commit until Ahmed instructs it. Push, PR creation/update, merge and deployment each require his explicit instruction; this overrides D-22 and automatic finalization for every continuing agent. Later frontend work stays on this branch.

## Derived execution envelope

**Policy version:** 10

**Surfaces:** docs, frontend, runtime, auth, data, storage, delivery, tooling

**Risk:** R3

**Planning:** Protected

**Worker budget:** 1 used; maximum 1; no nested workers.

**Capabilities:** frontend-quality-floor

**Procedural skills:** impeccable (onboard/distill); browser:control-in-app-browser; diagnosing-bugs (earlier resume assertion); vercel:react-best-practices (inline review)

**Routing reason:** The implemented frontend checkpoint and necessary security dependency corrections reach the protected delivery envelope. No new product scope or persistent service mutation.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs                                                                                       | Independent acceptance checks, including failure cases                                                                                                                                                                                                                                                                                                                                            | Assignment reason                                                     | Status and evidence                                                                                        |
| ----- | -------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1     | Sol High       | Ahmed's requested slice and approved voice-note revisions; DESIGN; caller-scoped authority; WP03-T12 branch hold | Progressive choices and dependent reset; distinct Study/catalog; caller name and initial; independent settings/draft retention; current-cohort choices and scope isolation; shared locale and header output-language retention; citation dialog/first-visit tip; count/difficulty/timer/invalid/expired quiz; EN/AR, both themes, keyboard and 320px/200% reflow; landing/access source untouched | Shared navigation and student workspace interactions require judgment | Revised local implementation and technical review complete; founder acceptance pending; see fresh evidence |

**Next model:** Sol High

**Current block:** 1; manual assignment, not certification of the Desktop model.

## Execution contract

**Dependencies:** Delivered WP03-T10/T11; WP03-T12 locally accepted/committed; clean starting branch head 98bcaef.

**Inputs:** Current shared components and tokens; authorized catalog rows; synthetic fixtures and deterministic mock services only.

**Files:** Changed shared components/styles under src/app/_components/; src/app/settings/page.tsx; src/app/learn/page.tsx; src/app/learn/[cohortId]/[unitId]/layout.tsx; changed workspace components/styles under src/app/learn/; src/lib/demo/synthetic-account.application.ts; src/lib/quiz/quiz-fixture.application.ts; affected E2E and quiz unit tests; DESIGN.md; related surface briefs; runbook; task record; sanitized evidence. The fresh evidence's source binding enumerates implementation/test paths and hashes.

**Verify:** Focused current native/ordinary role, locale, continuity, upload and permission-denial evidence; corepack pnpm verify through the unchanged full CI chain; exact-head required GitHub CI and protected review; affected synthetic Preview production release fingerprint and smoke. Reuse valid bounded rendering/detector evidence; no extra visual-polish cycle. No paid-provider or persistent database mutation.

**Pass:** Merge the currently presented frontend refinement checkpoint through protected main with required green checks and affected synthetic Preview production proof. Keep the merged audit at55/75 locally verified;20 remaining findings and WP03-T13 follow-up stay open. This is not completion of the whole audit or readiness for real users/providers.

**Evidence:** evidence/wp03-product-shell/2026-10-16_frontend-refinements_delivery_98bcaef.md; evidence/wp03-product-shell/2026-10-16_frontend-refinements_production_45a8c8c.md

**Rollback:** Revert the checkpoint merge through a protected pull request; retain public deployment dpl_7vzJmYUCUkCQZN1hCwJFsHuuqc2V until its replacement passes production proof.

**Hard stop:** Real-money exposure; private data or secret disclosure; lost unrelated work; protection bypass; false PASS or false claim that all75 findings are complete.

## Candidate preparation

**Design disposition:** MATERIAL

**Design evidence:** receipt:evidence/wp03-product-shell/2026-10-16-frontend-refinements-founder-receipt-c2.json

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** 9aec2caf71b756b1627d012f5118c30e1a677d7ff6380251efa985803ec367cf

**Unresolved findings:** NONE

**Established facts:** NONE

## Approved revision (2026-10-06)

Ahmed approved implementation of the voice-note review, expanding reduced margins to all product sections. Remove Study guidance and Subjects academic-settings links; show the caller account name and circular initial; independent settings panels; authorized current-cohort unit choices; remove redundant material-details navigation; expand Chat, move output language to its header and show a first-visit citation tip; centered configurable quiz timing/count/difficulty. Studio capabilities remain unchanged. Real chat/quiz generation remains unavailable; working synthetic services stay deterministic, document-local and zero cost. The earlier evidence proves its earlier source snapshot only and is invalidated for this revision. No commit or external delivery is authorized.

## Steps

- [x] Implement progressive setup and preserve academic validation/save behavior.
- [x] Separate Study/Subjects and merge Student settings navigation.
- [x] Replace the shared product language select, retaining landing/access controls.
- [x] Verify and present the local candidate with source-bound evidence.
- [x] Record Ahmed's requested revisions; retain commit/delivery hold.
- [x] Implement the approved student workspace revisions.
- [x] Verify and present the revised local candidate with fresh source-bound evidence.
- [ ] Record material acceptance; await separate commit instruction.

## Handoff

**Changed:** Progressive entry and distinct Study/Subjects remain; Study guidance and Subjects settings links are removed. The profile uses the caller's account name and circular initial. Settings panels are independently visible, deep-linkable and retain drafts. Shared product width and desktop gutters improve space use. Unit switching retains the active tool and only lists current authorized cohort subjects. Chat uses full width, header output-language choices, on-demand citation excerpts and a dismissible first-visit tip. Quiz choices drive fixture difficulty, question count, attempts, scoring and user-selected deadlines; Start is centered. Studio capabilities and landing/access source remain intact.

**Commands:** Pinned production dependency audit (zero advisories); hosted e2e 146/146; first full guarded chain stopped at the demo suite (261 passed, 23 failed: stale drivers plus four layout budgets). After the corrections below, the 23 failing demo cases pass in focused reruns; format, lint and typecheck exit 0. Fresh full guarded `pnpm verify` and exact-head required CI follow for the corrected candidate and are recorded in the delivery evidence.

**Remaining:** Checkpoint delivered: PR #73 merged as 45a8c8c and production serves release wp03-t13-frontend-refinements-45a8c8c-production (rollback dpl_7vzJmYUCUkCQZN1hCwJFsHuuqc2V). Ahmed's hands-on look at the corrected Chat, Studio, Quiz, Sources and Settings screens remains open. Twenty audit findings remain after this release; no blanket audit completion or production-service readiness claim.

**Next safe action:** Checkpoint delivery is complete (PR #73, `45a8c8c`). Next: Ahmed's hands-on review of the corrected Chat, Studio, Quiz, Sources and Settings screens, then the remaining audit findings as later frontend slices. Session history: [wp03-t13-session-log.md](../../evidence/wp03-product-shell/wp03-t13-session-log.md).

**Reviewer action:** Review the exact delivery candidate technically. Ahmed's direct merge instruction accepts release of the already presented checkpoint; formal receipt binds that scope and preserves the remaining20 findings.
