# Task record: WP03-T18 choose the premium overhaul direction

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T18

**Status:** [~]

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
- [ ] Present; record Ahmed's choice.
- [ ] Rewrite `DESIGN.md` for the chosen direction; `pnpm check`; PR with required CI.

## Decisions

- 2026-10-17, Ahmed: fixed fingerprint is the name, Open Folio logo, slogan and blue family; fonts, surfaces, shell and landing illustration may change.
- 2026-10-17, Ahmed: mockups first, two directions, then the contract, then flow-by-flow rebuilds.
- 2026-10-17, Ahmed: fixtures become realistic invented content; "sample" labels stay only where safety needs them.
- 2026-10-17, Ahmed: the student flow is rebuilt first (WP03-T19), then landing (T20), then leader and admin (T21).
- 2026-10-17, Ahmed, after reviewing both mockups: "B: Cobalt is better in everything except the landing page. A: Margin landing page is better but honestly not the best either." Direction B governs the product (shell, shelf, Chat, phone, admin). The landing gets new variants in B's system that build on A's real-page evidence idea; its section of `DESIGN.md` waits for that choice.

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

**Changed:** runbook entries WP03-T18 to T21; this record; `planning/design/premium-overhaul/` with the brief, review harness, Direction A (Margin) and Direction B (Cobalt, built by a sub-agent from the brief).

**Proof:** diagnosis captures in the session scratchpad (regenerate from `pnpm demo`). Every mockup screen captured at 1440px and 390px in light and dark from `serve.mjs` and inspected in two rounds; `pnpm lint:agents` passed.

**Review:** self-review.

**Approved commit:** PENDING (direction choice).

**Remaining:** Ahmed's choice, contract rewrite, `pnpm check`, PR.

## Next action

Record Ahmed's choice of A, B or a mix, then rewrite `DESIGN.md` for it.
