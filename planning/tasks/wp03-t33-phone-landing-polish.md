# Task record: WP03-T33 polish the phone screens and the landing page with a motion layer

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP03-T33

**Status:** [~]

**Outcome:** Every phone screen and the landing page keep their approved Cobalt composition and gain one disciplined motion layer (press and state feedback, content-delivery rises, overlay entrances, a once-per-view landing reveal) plus detail polish; reduced motion shows identical end states.

**Acceptance:** [runbook WP03-T33](../../docs/runbooks/poc-execution-runbook.md#wp03-t33--polish-the-phone-screens-and-the-landing-page-with-a-motion-layer)

**Owner:** Claude Code (overseeing session); selected speaker Ahmed. Ahmed's 19 October 2026 request: "further improve the frontend platform wide, focus on all the phone screens and the landing page for all devices, add your signature refinements like the animations and polish."

**Branch:** claude/wp03-t33-phone-landing-polish

**Updated (UTC):** 2026-10-19T14:30Z

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
- [x] Landing polish at every width, both languages and themes.
- [x] Phone screen polish across every role.
- [~] Checks, rendered inspection (one round plus one confirmation), independent review, approval, PR.

## Decisions

- Motion stays inside the DESIGN.md budget (120ms controls, 280ms/≤7px delivery, 300ms/≤10px evidence, 180ms dialog, 420ms/≤10px landing rise, shared easing). The landing reveal and the first-paint delivery on the Shelf are recorded in DESIGN.md as the "Motion layer" bullet (four kinds: press, delivery, overlays, landing), amending "Direction B adds no motion of its own"; everything is once per view, transform and opacity only, never looping, never scroll-driven.
- Navigation palettes still change at once (no colour interpolation on the bottom bar or segmented control); only transform feedback is added there.
- Every entrance fills `backwards` at most and every delivery animation fills nothing, so a settled element has no animation in effect (`getAnimations()` empty): the existing landing, admin and shell motion assertions keep passing.
- Keyframes are declared per CSS Module (CSS Modules scope animation names); `globals.css` holds only the tokens and the tap rule.
- Audit result (before shots in `.local/wp03-t33/shots/before`, 51 screens, no horizontal overflow): every composition from WP03-T19 to T32 is sound, so this task adds motion and detail polish only; the one layout change is How it works on phones (number beside the title).

## Current state

**Changed:** `globals.css` (motion tokens, `--press`, tap rule on controls); press feedback in `button`, `segmented-control`, `app-shell` (bottom-bar pills 8%, admin menu), `frontend-system` (back, title menu), `product-chat` (citation, chips, history), `product` (quiz checks, source rows), `student-account` (choices, section tabs), `study-shelf` (covers, rows); delivery rises for Chat exchanges and the streaming placeholder, live notices, the Shelf's resume page and covers (staggered, `--order` on each cover); menu entrances for the unit and admin panels and a backdrop fade; landing: `landing-reveal.tsx` (`Reveal`, IntersectionObserver plus a passed-section scroll fallback, 2.5s unhide if hydration never comes), hero line-by-line entrance, section reveals with staggered evidence cards and steps, flashcard face turn, press and hover transitions, phone step rows; `DESIGN.md` motion layer and landing Reveal bullets; `tests/e2e/landing-experience.spec.ts` reveal test.

**Proof:** `corepack pnpm check` passed on the candidate (format, boundaries, sql, typecheck, secrets, lint; unit 1027/1027). Demo e2e `PW_WORKERS=2` on 3102: 209/209 (25.4 min). Main e2e on 3330: 44/45, the moment test counting a hover-out transition on the landing Replay button; after removing that transition the landing and shell contract suites passed 20/20 (the other 25 main tests are untouched by that CSS). Rendered round one in the browser pane at 375px and 1440px (hero entrance, section reveals, Shelf arrival, Chat rise, unit menu entrance; every state settles with zero animations and no overflow). Confirmation round: `.local/wp03-t33/shots/after` (51 screens: every role's phone screens at 390px EN/AR light and 360px dark, landing at 320/360/390/768/1280/1440, EN/AR, light/dark) against `before`: no horizontal overflow anywhere, identical header heights and Chat reading heights (390px 561/543 EN/AR local demo, 360px 357, 320px 416, unchanged from before), every end state identical to the approved composition except the intended phone step rows.

**Review:** independent review by the `independent-reviewer` sub-agent on the uncommitted candidate: request changes (2 major, 3 minor, all fixed); re-review of the delta at `7fd0a68`: approve. Self-review: `git diff --check` clean, full diff read, no secrets, presentation plus DESIGN.md, runbook, task record and one test only.

**Approved commit:** PENDING: candidate `7fd0a68` presented to Ahmed on 2026-10-19 (material: motion layer and the phone step rows).

**Remaining:** Ahmed's approval of `7fd0a68`; then one PR with required CI (`finalize`).

## Next action

Record `Approved commit:` once Ahmed approves `7fd0a68`, then run `finalize`: push, one PR, required CI, squash-merge, close.
