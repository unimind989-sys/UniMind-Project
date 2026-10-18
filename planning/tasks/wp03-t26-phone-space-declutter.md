# Task record: WP03-T26 give content the screen on phones and declutter screens

**Task ID:** WP03-T26

**Status:** [x]

**Outcome:** Phones and laptops give the conversation, materials and intake lists the screen: one phone unit header (back + title menu), the session switcher in the band, answer language in a compact composer, a keyboard-aware Chat, no bottom bar inside units on phones, document scroll for the other unit tools, a phone source sheet, one shared disclosure and a declutter pass over Chat, Shelf, Subjects, Materials, Studio, Quiz, Batch Leader and admin.

**Acceptance:** [runbook WP03-T26](../../docs/runbooks/poc-execution-runbook.md#wp03-t26--give-content-the-screen-on-phones-and-declutter-screens)

**Owner:** Claude Code sub-agent under the overseeing session (WP03 delegation; selected speaker Ahmed)

**Branch:** claude/wp03-t26-phone-space-declutter

**Updated (UTC):** 2026-10-18T16:40Z

## Contract

**Dependencies:** WP03-T25 (primitives). Findings MD-01 to MD-21, MD-23 to MD-29, DS-17, DS-19, DS-20, DS-24, IX-06, IX-20 to IX-23, IX-33, IX-34, IX-36.

**Inputs:** `DESIGN.md`; mockup `planning/design/premium-overhaul/direction-b.html`; [mobile-declutter audit](../../docs/reviews/wp03-refinement/audits/mobile-declutter.md); [plan](../../docs/reviews/wp03-refinement/plan.md) D2 to D5.

**Files:** shell (`app-shell`, `frontend-system`, new `disclosure`), `product-dialog`, `layout.tsx` viewport, Chat (`product-chat`, new `study/chat-composer` and `study/chat-sessions-menu`, `chat-exchange`), Studio, Quiz, Materials, Shelf/Subjects, Batch Leader intake and history, admin band; `DESIGN.md`; e2e helpers and specs whose structure intentionally changed (demo, hosted, database product shell).

**Protected paths:** none (the viewport export is presentation). Settings, onboarding, auth and locale persistence untouched (T27/T28).

**Verify:** `corepack pnpm check`; demo e2e on private port 3302 (full suite `PW_WORKERS=2`, then `--repeat-each=2` because shell measurement changed); `UNIMIND_E2E_PORT=3330 corepack pnpm test:e2e`; `corepack pnpm test:env-build`; `.local/capture-t26.mjs` (overseer's capture plus an answered Chat and a completed Shelf) at 360x640, 390x844, 320x720, 768x1024, 1280x720, 1440x900, EN/AR, light/dark.

**Pass:** Chat ≥400px of conversation at 360x640 (docked) and at 1280x720, ≥600 at 390x844, ≥450 at 320x720, ≥560 at 1440x900; desktop bar 64px, phone bar ≤52px; compact-chat journey, layout matrices and RTL green; required CI green.

**Rollback:** revert the squash commit (presentation, tests and DESIGN.md only; no data or configuration).

**Hard stop:** any change to a Server Action, guard, authorization or demo isolation; a new dependency; any paid action.

## Steps

- [x] Shell: viewport export, band slot, keyboard state, phone unit header, no bottom bar in units, document scroll for non-Chat tools, shared disclosure.
- [x] Chat: sessions in the band menu, answer-language pill and compact composer, phone source sheet, answer declutter, inline citation tip, follow-up chips.
- [x] Studio, Quiz, Materials, Shelf, Subjects, Batch Leader and admin declutter; hosted captions; DESIGN.md.
- [x] Tests: helpers and specs follow the new structure; keyboard-state and phone-sheet tests added.
- [x] Overseeing session: independent review, rendered review, `Approved commit:`, PR with required CI.

## Decisions

- D2 to D5 (plan) applied. DESIGN.md updated: unit header and menu, no bottom bar in units on phones, keyboard state, band slot, composer, one evidence route, floating-menu behaviour, language switch in the title menu.
- One `<details>` menu serves both widths: on desktop its summary is the `--night-2` pill beside the h1; on phones it is the title button (the h1 stays a visually hidden heading). The summary's name comes from its content (WCAG 2.5.3, fixed in review): the visible unit title on phones, then the visible line, with a hidden "Sessions and privacy" in Chat ("Anatomy, Sessions and privacy: …"); other tools "Anatomy, {Unit} details". The panel opens from the band's start edge, so it stays inside the viewport in RTL and at 200% text.
- `Disclosure`: Escape closes and refocuses the summary; a press outside or focus leaving closes and never moves focus (review fix); a close from inside that hides the focused control refocuses the summary. Unit menu and admin Menu use it; on phones the admin panel hangs from the bar's 16px gutters (review fix: it ran 36px off a 320px screen).
- Dialog backdrop: closes only when both the press and the release land on it, so a text selection dragged out of a dialog keeps it open (review fix).
- Enter sends only with a fine pointer, and `enterKeyHint="send"` is set only there: on touch keyboards Enter adds a line, so a key labelled Send would mislead (IX-34 refinement).
- The composer keeps a 1px `--control` ring with `--float` (a visible field boundary on paper); fully round at one line; an empty field never grows (one-line placeholder).
- Chat's source sheet adds "Browse material library" beside "Open evidence details" (as Studio's), so the library with "Return to Chat" stays reachable after MD-09.
- Hosted captions dropped: Chat empty-state caption, Studio sample caption, Quiz intro, Materials and library sample captions, Shelf resume note. Kept as safety or result labels: "Sample question", the sheet's sample-excerpt line, "Simulated stream", "Simulated score … (illustrative only)", the local service line.
- "Received is not processed" is one line in the submissions list head; the intake notice keeps only the count. Dates disclosure under the band at every width.
- Unit context in the menu is a `MetaList`; the Arabic Materials segment is "المصادر" (MD-07); the excerpt no longer repeats the row's locator.
- Not done, by scope: Settings (MD-22, T27); a desktop sources side panel (DESIGN keeps the dialog on desktop); scroll-aware header auto-hide (audit: not recommended).

## Current state

**Changed:** see Files; commits on the branch (head in the PR). Merged `origin/main` (T27, T28); the only conflict was `layout.tsx` (T28's async layout plus this viewport export).

**Proof (after merging main):** every `verify:ci` component, run singly so the browser suites use the private ports: `pnpm check` passed (unit 1027/1027); `typecheck:fresh`, `verify:ci-workflow` passed; `test:node` 1061 passed, 2 skipped; demo e2e on 3302 `PW_WORKERS=2 --repeat-each=2` 400/400 (46.2 min); main e2e `UNIMIND_E2E_PORT=3330` 42/42 (first run 39/42: hosted admin Menu and hosted Report copy, fixed); `test:env-build` passed with the client secret scan. Before the merge the plain full demo run was 194 passed + 3 fixed and rerun 3/3. Database e2e not run locally (CI `database-ci`); its real-session assertion now expects links. After the review fixes (admin phone panel, summary name from content, backdrop press and release, no focus move on an outside press): `pnpm check` passed (unit 1027/1027); full demo `PW_WORKERS=2` 201/201 (21.8 min; includes the new outside-press test and the drag-out-of-dialog, admin panel and 200%-text unit panel checks); main e2e 42/42. Chat conversation, hosted-like (EN/AR): 390x844 395→619/610; 360x640 270/222 page flow → 415/406 docked; 320x720 298/273 page → 495/486 docked; 768x1024 482/462 → 685/667; 1280x720 300/280 → 445/427; 1440x900 480 → 625. Bars: desktop 64px; phone 52px outside units, none inside: the unit header is the band, 130/140px (EN/AR) at 360px instead of 52 + 134 + 50; desktop band 83/101px instead of 111 + 64. Rendered: `.local/shots/r3` (polish round) and `r4` (confirmation), untracked. Open: the Arabic Report action still wraps under the citation at 360px.

**Review:** self-review; `independent-reviewer` on `6c4e58d`: request changes (1 major: admin phone Menu panel off-screen at 320px and 200% text; minors: phone title label-in-name, drag-out closes dialogs, outside press refocuses the menu summary), all fixed in `d785b38` to `5d1b702`; re-review of that delta: approve.

**Approved commit:** `5d1b702`, approved by the overseeing Claude Code session under Ahmed's 18 October 2026 delegation (not a founder review). Checked: `.local/shots/r4` Chat empty and answered at 320, 360, 390, 768, 1280 and 1440 in EN/AR, light and dark; Studio and Batch Leader intake on phones; every Chat target met with no horizontal overflow.

**Remaining:** the Arabic Report action wraps under the citation at 360px (MD-10 partial); iOS keyboard placement (`visualViewport.offsetTop`) unverified on a device; MD-27 sample labels kept as safety labels.

## Next action

None after the PR merges with green required CI.
