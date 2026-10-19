# Task record: WP03-T33 polish the phone screens and the landing page with a motion layer

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T33

**Status:** [~]

**Outcome:** Every screen of every flow (student, Batch Leader, admin, access, landing), desktop and phone, is visibly refined inside the Cobalt planes and the fixed fingerprint: the motion layer of the first candidate plus a felt visual pass over every element, with DESIGN.md recording each changed rule.

**Acceptance:** [runbook WP03-T33](../../docs/runbooks/poc-execution-runbook.md#wp03-t33--polish-the-phone-screens-and-the-landing-page-with-a-motion-layer)

**Owner:** Claude Code (overseeing session); selected speaker Ahmed. Ahmed's 19 October 2026 request: "further improve the frontend platform wide, focus on all the phone screens and the landing page for all devices, add your signature refinements like the animations and polish." His follow-up after candidate `7fd0a68`: "there is a lot of room for improvement; you didn't do the other screens in the main view; student/admin/leader flows; the landing page you just added some animations; make a change so the difference can be felt; don't be scared to change anything; treat the frontend as a whole; don't leave any element/screen without checking for improvements."

**Branch:** claude/wp03-t33-phone-landing-polish

**Updated (UTC):** 2026-10-19T16:00Z

## Contract

**Dependencies:** WP03-T32 (merged `09a8149`, promoted). The Cobalt direction (WP03-T18), landing variant L1 and the fixed fingerprint stay as approved.

**Inputs:** `DESIGN.md`; mockups `planning/design/premium-overhaul/direction-b.html` and `landing.html`; the WP03 [final verification](../../docs/reviews/wp03-refinement/final-verification.md) open items (Arabic Report wrap at 360px); rendered audit shots in `.local/wp03-t33/shots/` (untracked).

**Files:** `src/app/globals.css` (motion tokens, tap feedback), landing (`landing*.tsx`, `landing*.module.css`), shell and primitives (`app-shell`, `frontend-system`, `button`, `segmented-control`, `product-dialog`, `notice`, `page-state`, `disclosure`), study surfaces (`study-shelf`, `product-chat`, `product-studio`, `quiz`), access (`auth.module.css`, welcome), Batch Leader and admin modules; `DESIGN.md` motion rules; e2e specs only where a structural change needs it.

**Protected paths:** none. No Server Action, guard, RLS, storage, CI workflow or production configuration changes.

**Verify:** `corepack pnpm check`; demo e2e (`corepack pnpm test:e2e:demo`, 2 workers); main e2e (`UNIMIND_E2E_PORT=3330 corepack pnpm test:e2e`); `corepack pnpm test:env-build`; the capture script `.local/wp03-t33/capture.mjs` at 320, 360, 390, 768, 1280 and 1440px, EN/AR, light/dark, before and after; reduced-motion render of the landing and Chat.

**Pass:** no screen scrolls sideways at 320px; Chat reading targets from WP03-T26 still hold; every control gives press and state feedback within 120ms; answers, results, notices and lists arrive with one ≤7px/280ms rise; menus and sheets enter within 180–300ms; landing sections reveal once at ≤10px/420ms; reduced motion renders every end state instantly; demo and main e2e green; required CI green.

**Rollback:** revert the squash commit (presentation and `DESIGN.md` only; no data or configuration).

**Hard stop:** any change to a Server Action, guard, authorization or demo isolation; a new dependency; pointer-tracking, looping or scroll-hijacking motion; any paid action.

## Steps

- [x] Audit the rendered phone screens and the landing page; list the changes.
- [x] Motion layer: tokens and shared feedback; content delivery; overlays; landing reveal; `DESIGN.md` (candidate `7fd0a68`, presented; superseded by the felt pass below).
- [x] Capture every screen and state (desktop and phone, EN/AR, light/dark; `.local/wp03-t33/shots/journeys`) and write the per-screen improvement list (Decisions).
- [x] Shell and primitives: `--sheet`, the folio edge under page bands.
- [x] Student flow: book covers and rows, Subjects search in the band, Materials sheet grid and document tabs, Chat column and marked-page answer, Studio sheets, quiz marked pages and side rail, Settings and onboarding sheets.
- [x] Batch Leader and admin flows: sheets for campaign, requests, history, intake and files; admin list sheet, selected row on tint, sticky detail, resource and work sheets.
- [x] Access pages (form sheet) and the landing (sticky masthead with a stuck hairline, bilingual section, footer links).
- [~] Checks, e2e (landing spec: nine reveals), after-capture, independent review, approval, PR.

## Decisions

- Motion stays inside the DESIGN.md budget; the first candidate's motion layer (press, delivery, overlays, landing reveal) is kept as the base.
- Keyframes are declared per CSS Module; every entrance fills `backwards` at most, so settled elements have no animation in effect.
- **The felt pass, one concept: "on the desk".** The bound Night folio, paper sheets and the Cobalt highlighter. (1) Every content surface is a *sheet*: white with a Night-tinted lift (`--sheet`), replacing flat 1px rings; lists become stacks of sheets. (2) Every page band (Shelf, Subjects, Settings, Batch Leader, admin) ends in the folio's curved edge (`bandEdge`), so the band reads as the folio's top page; unit bands stay flat because the workspace measures its chrome. (3) Subject covers are books: a Cobalt spine at the inline start, the title along it, count and freshness at the foot; the current subject keeps the Night folio page. (4) Reading surfaces carry a Cobalt margin rule like a marked page: the Chat answer and each quiz question. (5) Desktop layouts use the width: Chat's conversation and composer centred at 68rem, Materials as a two-column sheet grid, the quiz with a sticky side rail (progress, timing, submit), the admin detail sticky beside the list (scrolling inside itself when taller than the window), Subjects with its search inside the band; Settings and Account keep their layout and gain sheets (a Night band there was considered and not built). (6) Landing: a masthead that stays as a compact Night bar on scroll, a bilingual section (the same answer in Arabic and English), hero stage tuned, a footer with the product links. Rules recorded in DESIGN.md (elevation, folio curve, bands, covers, reading surfaces, landing).
- Not changed: fingerprint, Cobalt planes, every seam, guard and copy that tests assert; selectors and accessible names stay stable, so specs change only where a structure moved (the chat column assertion in the demo layout matrix, the landing reveal count).

## Current state

**Changed:** candidate 1 (`7fd0a68`, motion layer) plus the felt pass: `globals.css` (`--sheet`, `--band-edge`), `app-shell` (folio edge under page bands), `study-shelf` (book covers and rows, band search), `product-chat` (68rem column, marked-page answer), `product` (sheet grid of materials, document tabs, marked-page question, panels), `quiz` (side rail from 1100px), `product-studio`, `student-account`, `collection`, `admin` (list sheet, sticky detail), `auth`, landing (`landing.tsx` bilingual section and footer nav, sticky masthead), `DESIGN.md` (elevation, folio edge, books and marked pages, layouts, landing), the landing spec.

**Proof:** candidate 1: check, demo 209/209, main e2e green after the Replay fix, review approve. Felt pass: `corepack pnpm check` RUNNING; after-capture (desktop and phone EN) RUNNING; browser pane: landing sticky masthead, nine reveals, bilingual section and footer render with no overflow. Demo and main e2e NOT RUN yet on the felt pass.

**Review:** candidate 1: independent review (sub-agent), request changes then approve at `7fd0a68`. Felt pass: independent review of `7fd0a68..95a3356`: request changes (3 major: the demo layout matrix asserted the full-width chat column; the band stacking rule reached unit bands and put the quiz rail over the open menu; the sticky admin detail had no height cap; 2 minor: landing anchors under the stuck masthead; a record line claiming a Settings band). All fixed in `752652c`; re-review: one major (the centring check must measure against the chat layout, not main, because of the scroller's stable gutter) and one minor (the sticky detail clips its sheet shadow); both fixed in `23703db`; re-review of that delta: approve.

**Approved commit:** PENDING: candidate `7fd0a68` was presented and Ahmed asked for a felt pass on every screen; the new candidate is presented after the proof below.

**Remaining:** felt-pass proof (check, demo and main e2e, after-capture review, independent review), Ahmed's approval, then one PR with required CI (`finalize`).

## Next action

Finish the felt-pass proof, present the candidate to Ahmed, record `Approved commit:`, then run `finalize`.
