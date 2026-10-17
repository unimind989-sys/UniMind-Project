# Task record: WP03-T19 rebuild the student flow in Cobalt

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T19

**Status:** [x]

**Outcome:** Every student screen (shell, onboarding, Study Shelf, Subjects, Materials, Chat, Studio, Quiz, evidence, report, Settings) renders in the approved Cobalt direction with believable invented fixtures, in real and synthetic modes alike.

**Acceptance:** [WP03-T19](../../docs/runbooks/poc-execution-runbook.md#wp03-t19--rebuild-the-student-flow-in-the-approved-direction)

**Owner:** Claude Code (overseeing session); Ahmed delegated approval

**Branch:** claude/wp03-t19-student-cobalt

**Updated (UTC):** 2026-10-17T17:29Z

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
- [x] Materials, Studio, Quiz, evidence/report, Settings and onboarding (helper sub-agent, same worktree, reviewed by the lead).
- [x] Studio and Quiz fixture content in the new theme.
- [x] Full demo e2e and layout matrices green locally (192/192).
- [x] Real e2e, PR, required CI, overseer approval, merge, production proof.

## Decisions

- 2026-10-17, Ahmed: delegated approval and end-to-end responsibility for WP03-T18 to T21 to this session while he is away. Approvals below are the overseer's under that delegation, not founder review.
- Blue planes that carry small text (resume page, question bubble) use the AA-safe action blue in light theme and Cobalt with Night text in dark.
- Shelf covers show material count only: the catalog carries no freshness value, so it is omitted per `DESIGN.md`.
- The privacy line reads "Visible to UniMind's founders" (same meaning as "Founder-visible by default").

## Current state

**Changed:** see Steps; commits `eea7745` to `d530056`. Tests changed only where they pinned the old presentation (old rail landmark, old sample text, centred quiz Start, middle-dot academic line, always-visible Chat heading, bordered Sessions control, header-label alignment, visible profile caption, Shelf card padding).

**Proof:** `format:check`, `lint`, `tsc`, `test:unit` 917/917; demo e2e 192/192 (`UNIMIND_DEMO_REUSE=1`, 21.6 min); real e2e 39/39; rendered review at 1440, 820, 390 and 320px (200% text), light and dark, EN and AR. PR [#82](https://github.com/unimind989-sys/UniMind-Project/pull/82) squash-merged as `4849cf0` with 15/15 checks green. Production artifact `dpl_3DVUTtJUuTJTL5QDQzmVfW94vtZG` promoted and verified on `unimind.space` and `project-xwrez.vercel.app` ([evidence](../../evidence/wp03-product-shell/2026-10-17_wp03-t19-student-cobalt_production_4849cf0.md)); rollback `dpl_42tzJXb7utNR2te7gcJh7idZfnhU`.

**Review:** self-review by the overseeing session, including the helper's screens; no protected path changed.

**Approved commit:** `2166c3d`, approved by the overseeing Claude Code session under Ahmed's 17 October 2026 delegation after its rendered review (not a founder review). Later record-only commits keep this approval.

**Remaining:** none. Recommended founder action: rotate the Vercel deployment-protection bypass token (see the evidence limits).

## Next action

None; WP03-T19 is closed. WP03-T20 and WP03-T21 continue the overhaul.
