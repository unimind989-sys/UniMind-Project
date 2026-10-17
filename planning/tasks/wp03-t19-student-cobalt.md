# Task record: WP03-T19 rebuild the student flow in Cobalt

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T19

**Status:** [~]

**Outcome:** Every student screen (shell, onboarding, Study Shelf, Subjects, Materials, Chat, Studio, Quiz, evidence, report, Settings) renders in the approved Cobalt direction with believable invented fixtures, in real and synthetic modes alike.

**Acceptance:** [WP03-T19](../../docs/runbooks/poc-execution-runbook.md#wp03-t19--rebuild-the-student-flow-in-the-approved-direction)

**Owner:** Claude Code (overseeing session); Ahmed delegated approval

**Branch:** claude/wp03-t19-student-cobalt

**Updated (UTC):** 2026-10-17T19:30Z

## Contract

**Dependencies:** WP03-T18 delivered (`81c624b`, PR #81).

**Inputs:** `DESIGN.md` (Cobalt); `planning/design/premium-overhaul/direction-b.html` and its brief/content pack; WP03-T17 shared real/synthetic screens.

**Files:** `src/app/globals.css`, shell (`app-shell`, `frontend-system`), shared kit (`product.module.css`, `choice-group`), student screens under `src/app/learn/**` and `src/app/_components/{academic-settings,account-*,appearance}*`, theme colour, student fixtures in `src/lib/{demo,study,studio,quiz}`, `public/demo-files/`, affected tests.

**Protected paths:** none changed. No auth, authorization, RLS, migration, storage, CI workflow or production configuration edits; real-route guards untouched.

**Verify:** `corepack pnpm` steps of `check`; `test:unit`; demo e2e (`UNIMIND_DEMO_REUSE=1`) for chat, shelf, student entry, studio/quiz, sources/evidence, settings, layout matrices; required CI including `database-ci` and real e2e; rendered review at 1440, 820, 390, 320px, light/dark, EN/AR.

**Pass:** the rendered student flow matches the Cobalt contract; tests updated only where they pinned old presentation; required CI green; overseer approval recorded.

**Rollback:** revert the PR; no data or schema change.

**Hard stop:** auth/RLS/storage logic change, new runtime dependency, paid service.

## Steps

- [x] Tokens remapped to the logo palette with legacy aliases; theme-color follows Night.
- [x] Night top bar and phone bottom bar; Night subject band with segmented tools.
- [x] Study Shelf (band, blue folio resume page, covers) and Subjects index.
- [x] Chat: toolbar, inline citation help, blue question bubble, answer card, docked composer.
- [x] Student fixtures: Lecture 6 handout, Practical 3 recording, brachial plexus answers; demo pack regenerated.
- [~] Materials, Studio, Quiz, evidence/report, Settings and onboarding (helper sub-agent, same worktree).
- [ ] Studio and Quiz fixture content in the new theme.
- [ ] Full demo e2e and layout matrices green; `check`; PR; CI; overseer review; merge; production proof.

## Decisions

- 2026-10-17, Ahmed: delegated approval and end-to-end responsibility for WP03-T18 to T21 to this session while he is away. Approvals below are the overseer's under that delegation, not founder review.
- Blue planes that carry small text (resume page, question bubble) use the AA-safe action blue in light theme and Cobalt with Night text in dark.
- Shelf covers show material count only: the catalog carries no freshness value, so it is omitted per `DESIGN.md`.
- The privacy line reads "Visible to UniMind's founders" (same meaning as "Founder-visible by default").

## Current state

**Changed:** see Steps; commits `eea7745` onward.

**Proof:** `tsc --noEmit` clean; `test:unit` 917/917; chat specs 17/17 after expectation updates; rendered captures reviewed.

**Review:** self-review so far.

**Approved commit:** PENDING (overseer review under Ahmed's 17 Oct delegation).

**Remaining:** helper screens, Studio/Quiz fixtures, full e2e, PR.

## Next action

Review the helper's screens, then run the full demo suite and fix expectations.
