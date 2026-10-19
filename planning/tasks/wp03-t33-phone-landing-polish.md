# Task record: WP03-T33 polish the phone screens and the landing page with a motion layer

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T33

**Status:** [~]

**Outcome:** Every phone screen and the landing page keep their approved Cobalt composition and gain one disciplined motion layer (press and state feedback, content-delivery rises, overlay entrances, a once-per-view landing reveal) plus detail polish; reduced motion shows identical end states.

**Acceptance:** [runbook WP03-T33](../../docs/runbooks/poc-execution-runbook.md#wp03-t33--polish-the-phone-screens-and-the-landing-page-with-a-motion-layer)

**Owner:** Claude Code (overseeing session); selected speaker Ahmed. Ahmed's 19 October 2026 request: "further improve the frontend platform wide, focus on all the phone screens and the landing page for all devices, add your signature refinements like the animations and polish."

**Branch:** claude/wp03-t33-phone-landing-polish

**Updated (UTC):** 2026-10-19T10:00Z

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
- [x] Motion layer: tokens and shared feedback; content delivery; overlays; landing reveal; `DESIGN.md`.
- [~] Landing polish at every width, both languages and themes.
- [~] Phone screen polish across every role.
- [ ] Checks, rendered inspection (one round plus one confirmation), independent review, approval, PR.

## Decisions

- Motion stays inside the DESIGN.md budget (120ms controls, 280ms/≤7px delivery, 300ms/≤10px evidence, 180ms dialog, 420ms/≤10px landing rise, shared easing). The landing reveal and the first-paint delivery on the Shelf are recorded in DESIGN.md as the "Motion layer" bullet (four kinds: press, delivery, overlays, landing), amending "Direction B adds no motion of its own"; everything is once per view, transform and opacity only, never looping, never scroll-driven.
- Navigation palettes still change at once (no colour interpolation on the bottom bar or segmented control); only transform feedback is added there.
- Every entrance fills `backwards` at most and every delivery animation fills nothing, so a settled element has no animation in effect (`getAnimations()` empty): the existing landing, admin and shell motion assertions keep passing.
- Keyframes are declared per CSS Module (CSS Modules scope animation names); `globals.css` holds only the tokens and the tap rule.
- Audit result (before shots in `.local/wp03-t33/shots/before`, 51 screens, no horizontal overflow): every composition from WP03-T19 to T32 is sound, so this task adds motion and detail polish only; the one layout change is How it works on phones (number beside the title).

## Current state

**Changed:** `globals.css` (motion tokens, `--press`, tap rule on controls); press feedback in `button`, `segmented-control`, `app-shell` (bottom-bar pills 8%, admin menu), `frontend-system` (back, title menu), `product-chat` (citation, chips, history), `product` (quiz checks, source rows), `student-account` (choices, section tabs), `study-shelf` (covers, rows); delivery rises for Chat exchanges and the streaming placeholder, live notices, the Shelf's resume page and covers (staggered, `--order` on each cover); menu entrances for the unit and admin panels and a backdrop fade; landing: `landing-reveal.tsx` (`Reveal`, IntersectionObserver plus a passed-section scroll fallback, 2.5s unhide if hydration never comes), hero line-by-line entrance, section reveals with staggered evidence cards and steps, flashcard face turn, press and hover transitions, phone step rows; `DESIGN.md` motion layer and landing Reveal bullets; `tests/e2e/landing-experience.spec.ts` reveal test.

**Proof:** `corepack pnpm check` passed after the `Reveal` ref fix (format, boundaries, sql, typecheck, secrets, lint; unit 1027/1027 in the first run). Demo e2e `PW_WORKERS=2` on 3102: 209/209 (25.4 min) on the candidate before the review fixes. Main e2e on 3330 RUNNING (includes the new reveal test). Browser pane at 375px and 1440px: hero entrance, section reveals settle to `in` with zero animations and opacity 1, no overflow; Shelf covers arrive 80 to 240ms apart and settle; Chat exchange rises and settles; unit menu panel enters (`menu-enter`) and sits inside the viewport. After-capture NOT RUN yet.

**Review:** independent review by the `independent-reviewer` sub-agent on the uncommitted candidate: request changes (2 major: reveal hidden for ever when the bundle never hydrates; wrapper div without `min-width: 0` on the sample workspace; 3 minor: stagger test not scrolling both lists, pill 8% undocumented, tap flash removed from prose links). All five fixed; the delta awaits re-review.

**Approved commit:** PENDING

**Remaining:** main e2e result; after-capture at every width (confirmation round); re-review of the fix delta; approval; PR.

## Next action

When the main e2e suite finishes, run the after-capture on the demo server, re-review the delta, commit, and open the PR.
