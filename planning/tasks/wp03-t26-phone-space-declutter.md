# Task record: WP03-T26 give content the screen on phones and declutter screens

**Task ID:** WP03-T26

**Status:** [~]

**Outcome:** Phones and laptops give the conversation, materials and intake lists the screen: one phone unit header (back + title menu), the session switcher in the band, answer language in a compact composer, a keyboard-aware Chat, no bottom bar inside units on phones, document scroll for the other unit tools, a phone source sheet, one shared disclosure and a declutter pass over Chat, Shelf, Subjects, Materials, Studio, Quiz, Batch Leader and admin.

**Acceptance:** [runbook WP03-T26](../../docs/runbooks/poc-execution-runbook.md#wp03-t26--give-content-the-screen-on-phones-and-declutter-screens)

**Owner:** Claude Code sub-agent under the overseeing session (WP03 delegation; selected speaker Ahmed)

**Branch:** claude/wp03-t26-phone-space-declutter

**Updated (UTC):** 2026-10-18T16:00:00Z

## Contract

**Dependencies:** WP03-T25 (primitives). Findings MD-01 to MD-21, MD-23 to MD-29, DS-17, DS-19, DS-20, DS-24, IX-06, IX-20 to IX-23, IX-33, IX-34, IX-36.

**Inputs:** `DESIGN.md`; mockup `planning/design/premium-overhaul/direction-b.html`; [mobile-declutter audit](../../docs/reviews/wp03-refinement/audits/mobile-declutter.md); [plan](../../docs/reviews/wp03-refinement/plan.md) D2 to D5.

**Files:** shell (`app-shell`, `frontend-system`, new `disclosure`), `product-dialog`, `layout.tsx` viewport, Chat (`product-chat`, new `study/chat-composer` and `study/chat-sessions-menu`, `chat-exchange`), Studio, Quiz, Materials, Shelf/Subjects, Batch Leader intake and history, admin band; `DESIGN.md`; e2e helpers and specs whose structure intentionally changed (demo, hosted, database product shell).

**Protected paths:** none (the viewport export is presentation). Settings, onboarding, auth and locale persistence untouched (T27/T28).

**Verify:** `corepack pnpm check`; demo e2e on private port 3302 (affected specs, then full suite `PW_WORKERS=2`, then `--repeat-each=2` because shell measurement changed); `UNIMIND_E2E_PORT=3330 corepack pnpm test:e2e`; `corepack pnpm test:env-build`; `.local/capture.mjs` at 360x640, 390x844, 320x720, 768x1024, 1280x720, 1440x900, EN/AR, light/dark.

**Pass:** Chat ≥400px of conversation at 360x640 (docked) and at 1280x720, ≥600 at 390x844, ≥450 at 320x720, ≥560 at 1440x900; desktop bar 64px, phone bar ≤52px; compact-chat journey, layout matrices and RTL green; required CI green.

**Rollback:** revert the squash commit (presentation, tests and DESIGN.md only; no data or configuration).

**Hard stop:** any change to a Server Action, guard, authorization or demo isolation; a new dependency; any paid action.

## Steps

- [x] Shell: viewport export, band slot, keyboard state, phone unit header, no bottom bar in units, document scroll for non-Chat tools, shared disclosure.
- [x] Chat: sessions in the band menu, answer-language pill and compact composer, phone source sheet, answer declutter, inline citation tip, follow-up chips.
- [x] Studio, Quiz, Materials, Shelf, Subjects, Batch Leader and admin declutter; hosted captions; DESIGN.md.
- [ ] Tests green (affected specs, full demo, repeat-each=2, main e2e, env-build); rendered numbers and self-check; push.

## Decisions

- D2 to D5 (plan) applied. DESIGN.md updated: unit header and menu, no bottom bar in units on phones, keyboard state, band slot, composer, one evidence route, floating-menu behaviour, language switch in the title menu.
- One `<details>` menu serves both widths: on desktop its summary is the `--night-2` session pill beside the h1; on phones it is the title button (unit title shown `aria-hidden`, the h1 stays as a visually hidden heading). Chat's summary keeps the name "Sessions and privacy" with the session appended ("Sessions and privacy: …", label-in-name); other tools name "{Unit} details".
- Floating-menu behaviour (`Disclosure`): Escape closes and refocuses the summary; a press outside or focus leaving closes without stealing focus, except when focus would fall to the body (then the summary). Unit menu and admin Menu use it.
- Enter sends only with a fine pointer; `enterKeyHint="send"` is set only there, because on touch keyboards Enter adds a line and a key labelled Send would mislead (IX-34 refinement).
- The composer keeps a quiet 1px `--control` ring with `--float` (non-text boundary on paper); fully round at one line.
- Chat's source sheet adds "Browse material library" beside "Open evidence details" (as Studio's sheet), so the library with "Return to Chat" stays reachable after MD-09 removed the separate link.
- Hosted captions dropped: Chat empty-state caption, Studio sample caption, Quiz intro, Materials and library sample captions, Shelf resume note. Kept as safety/result labels: "Sample question", the source sheet's sample-excerpt line, "Simulated stream" status, "Simulated score … (illustrative only)", the local service line.
- "Received is not processed" is one line in the submissions list head (any RECEIVED row); the intake notice keeps only the count.
- The unit context in the menu is a `MetaList`; the Arabic Materials segment is "المصادر" (MD-07).

## Current state

**Changed:** see Files. Not committed yet.

**Proof:** typecheck and lint pass; chat and chat-history specs 18/18 after fixes; remaining runs pending.

**Review:** self-review pending.

**Approved commit:** PENDING (overseeing session).

**Remaining:** test runs, rendered self-check, commits, push.

## Next action

Finish the affected-spec run and fix failures.
