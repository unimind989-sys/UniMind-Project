# Task record: WP03-T18 choose the premium overhaul direction

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T18

**Status:** [x]

**Outcome:** Ahmed picks one of two premium directions from static mockups, and `DESIGN.md` is rewritten so the rebuild tasks (WP03-T19 to T21) can implement it.

**Acceptance:** [WP03-T18](../../docs/runbooks/poc-execution-runbook.md#wp03-t18--choose-the-premium-overhaul-direction-and-rewrite-the-design-contract)

**Owner:** Claude Code; Ahmed checkpoint

**Branch:** claude/wp03-t18-premium-direction

**Updated (UTC):** 2026-10-17T14:30Z

## Contract

**Dependencies:** WP03-T17 delivered (`0ba30cc`).

**Inputs:** Ahmed's 17 October 2026 request and decisions (runbook entry); Open Folio logo kit (`planning/design/unimind-logo/open-folio-kit/`, palette Night `#0c1823`, Paper `#ecf3f9`, Cobalt `#3977f7`); current `DESIGN.md`; `frontend-design` skill (Anthropic, pinned `41bbe19`, latest upstream) and `impeccable` for critique.

**Files:** `planning/design/premium-overhaul/**` (mockups and choice), `DESIGN.md`, `docs/agents/frontend.md`, this record, the runbook entry.

**Protected paths:** none. No product code, auth, RLS, storage, CI or production configuration.

**Verify:** mockups inspected in the browser pane at 1440px and 390px in both themes; `pnpm check` on the final candidate; required CI on the PR.

**Pass:** Ahmed's recorded choice; `DESIGN.md` states tokens, type, surfaces, shell, components and motion for the chosen direction while keeping behaviour, safety, accessibility, RTL and theme rules.

**Rollback:** revert the PR; the product code is unchanged.

**Hard stop:** any paid provider, new runtime dependency, or product behaviour change.

## Steps

- [x] Capture every role at 1440px and 390px (light, dark) from the local synthetic demo and diagnose.
- [x] Plan two directions (tokens, type, layout) and review them against generic defaults.
- [x] Build both as clickable static mockups: landing hero, Study Shelf, Chat with evidence (desktop, phone, Arabic phone), admin decision queue.
- [x] Present; record Ahmed's choice.
- [x] Rewrite `DESIGN.md` for the chosen direction.
- [x] `pnpm check`; PR with required CI; merge and close.

## Decisions

- 2026-10-17, Ahmed: fixed fingerprint is the name, Open Folio logo, slogan and blue family; fonts, surfaces, shell and landing illustration may change.
- 2026-10-17, Ahmed: mockups first, two directions, then the contract, then flow-by-flow rebuilds.
- 2026-10-17, Ahmed: fixtures become realistic invented content; "sample" labels stay only where safety needs them.
- 2026-10-17, Ahmed: the student flow is rebuilt first (WP03-T19), then landing (T20), then leader and admin (T21).
- 2026-10-17, Ahmed, after reviewing both mockups: "B: Cobalt is better in everything except the landing page. A: Margin landing page is better but honestly not the best either." Direction B governs the product (shell, shelf, Chat, phone, admin). The landing gets new variants in B's system that build on A's real-page evidence idea.
- 2026-10-17, Ahmed: "L1 only". The landing hero is variant L1 "The page answers", without L2's question bar below; the sections under the hero keep their jobs and are composed in WP03-T20. Claude added a visible "Sample answer from invented lecture notes" label to L1 because the existing landing rule requires sample content to be labelled, and decided that the folio curve mirrors with the layout in RTL (only the logo never mirrors).

## Diagnosis (captures of `0ba30cc`, synthetic demo)

1. The contract forces the neutral look: grey canvas, white box, 1px border, one muted blue, no elevation, "NotebookLM quiet surfaces". Only the landing has an exception, and it is the only surface with energy. Four earlier rounds refined inside these rules.
2. Flat hierarchy: titles 26px, everything else 14 to 16px at one weight and grey. Chat gives the answer about 150px of a 900px desktop; on phone the answer is hidden under settings and overlays.
3. Core study surfaces are forms: Chat is a settings panel, Studio is native selects then three sentences, Quiz is a centred form with a number spinner, the Study Shelf is one blue box on an empty page.
4. Fixture content reads as test data ("Synthetic appendix 1", "Tracking example 3", "Simulated artifact", "Founder-visible by default").
5. Chrome stacks about 320px before content (spine, top bar, large language toggle, demo banner, back link, title, tabs); the language toggle is the most prominent control on every screen.
6. Raw HTML leaks: `<details>` triangles (Sessions, Depth and size, campaign dates, an orphan triangle above every leader submission), native spinners and selects; four button styles and three tab styles.
7. Leader and admin explain the workflow instead of doing it: "Source lifecycle example", a flat 12-item decision list with counts that disagree (9 vs 12), an empty detail pane, a deadline without time left or progress.
8. The brand is under-used: the product accent `#2458b8` is not the logo's cobalt `#3977f7`; the folio metaphor appears only as a dark rail, which merges with the canvas in dark mode.
9. Landing uses generated-page tells: floating isometric cards with orbit rings, grey second heading lines, 01/02/03 steps, a blue CTA band with an icon.
10. Defects: Studio helper text clipped under the sticky Generate button; the phone citation tip covers and clips Chat; orphan triangles in leader history; a focus ring drawn around the Studio result heading.

## Current state

**Changed:** runbook entries WP03-T18 to T21; this record; `planning/design/premium-overhaul/` with the brief, review harness, Direction A (Margin), Direction B (Cobalt, built by a sub-agent from the brief) and `landing.html` (L1 chosen; L2 and L3 kept as the record). `DESIGN.md` rewritten for Direction B with the L1 landing (drafted by a sub-agent, reviewed line by line against the old contract); `docs/agents/frontend.md`, the `frontend-design` skill note and the approval history point to Cobalt.

**Proof:** every mockup and landing screen captured at 1440px and 390px in light and dark and inspected; local `format:check`, `lint`, `typecheck`, `check:boundaries`, `check:sql`, `scan:secrets`, `lint:agents`, `test:unit` passed; e2e not rerun locally because no runtime input changed. PR [#81](https://github.com/unimind989-sys/UniMind-Project/pull/81): one flaky demo shard (quiz clock) passed on rerun; all 15 checks green; squash-merged as `81c624b`. No Supabase or Vercel runtime change to prove.

**Review:** self-review.

**Approved commit:** NOT REQUIRED: no rendered product change in this task. Ahmed's direction and landing choices are recorded under Decisions; WP03-T19 to T21 need their own `Approved commit:`.

**Remaining:** NONE. Branch and worktree removed.

## Next action

None for this task. WP03-T19 (student rebuild) is in progress on `claude/wp03-t19-student-cobalt`.
