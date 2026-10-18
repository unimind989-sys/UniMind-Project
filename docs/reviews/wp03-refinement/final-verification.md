# WP03 refinement: final verification

**Task:** [WP03-T31](../../runbooks/poc-execution-runbook.md#wp03-t31--verify-the-wp03-refinement-end-to-end-and-publish-the-reports). **Checked on:** `main` at `529296c` (WP03-T25 to T30 merged, 18 October 2026). Nothing was checked against hosted Supabase, Preview or production (plan D13).

## Result

All six areas of the brief are delivered and verified on merged `main`. Every task merged through one PR with green required CI. The protected-path tasks (T27, T28, T30) and T26 and T29 passed an independent review before merge. Open items are listed at the end with their reason.

| Area | Task and PR | Findings closed |
| --- | --- | --- |
| Design-system consistency and legacy UI, including the language switch | WP03-T25, [#91](https://github.com/unimind989-sys/UniMind-Project/pull/91) | DS-01 to DS-34 except the T26 items; six partials below |
| Phone space and declutter | WP03-T26, [#94](https://github.com/unimind989-sys/UniMind-Project/pull/94) | MD-01 to MD-29 (MD-22 in T27, MD-10 finished in T29, MD-27 sample labels kept as safety labels by D4), DS-17, DS-19, DS-20, DS-24, IX-06, IX-20 to IX-23, IX-33, IX-34, IX-36 |
| Journeys, onboarding and demo parity | WP03-T27, [#92](https://github.com/unimind989-sys/UniMind-Project/pull/92); WP03-T28, [#93](https://github.com/unimind989-sys/UniMind-Project/pull/93) | PJ-01 to PJ-15, PJ-18, PJ-20, PJ-22 to PJ-30, IX-05, IX-10, IX-18, IX-19, IX-28, MD-22, DS-30; PJ-16, PJ-19 and PJ-21 open |
| Interactions, buttons and input semantics | WP03-T29, [#95](https://github.com/unimind989-sys/UniMind-Project/pull/95) | IX-01, IX-04, IX-08, IX-09, IX-11 to IX-16, IX-24 to IX-27, IX-29, IX-31, IX-32, the input inventory; IX-35 partial |
| Tests, local verify and CI | WP03-T30, [#90](https://github.com/unimind989-sys/UniMind-Project/pull/90) | TC-01 to TC-06, TC-08 to TC-12, TC-19 to TC-22 |
| Integration and final verification | WP03-T31 (this page) | — |

## Validated on merged `main`

### Local `pnpm verify`

`corepack pnpm verify` on `529296c`, on the founder machine (Windows, 4 logical CPUs) with nothing else running: **every step passed in 31.0 min** (1,861.6 s). The baseline on `bcab083` was 48.4 min.

- Node layers: 1,080 passed, 2 skipped.
- Main e2e: 44/44 on 1 worker.
- Demo e2e: 209/209 on 2 workers.
- Production build with the client secret scan, and every static check: passed.

Step times are in the [CI and testing report](ci-testing-report.md#after-the-refinement-merged-main).

### CI on `main`

Every WP03 merge passed CI on `main`: [39088319029](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39088319029) (T30), [39094816887](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39094816887) (T25), [39098462032](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39098462032) (T27), [39104211964](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39104211964) (T28), [39115858531](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39115858531) (T26) and [39123365373](https://github.com/unimind989-sys/UniMind-Project/actions/runs/39123365373) (T29, the head checked here).

Each pull request also passed its required checks on the exact head before the squash merge. CI caught four problems that local runs could not see, and each was fixed before merge:

- **T28: database test fixture.** `database-ci` showed that the new database test used a language value the column rejects (`'AR'` instead of `'AR_EG'`).
- **T28: missing `Sec-Fetch` headers.** The database suite's inspection route drops `Sec-Fetch` headers, so the test was rewritten to prove what that page can see.
- **T26: real-mode Chat.** `database-ci` ran axe on real-mode Chat, where answers are not launched and every control is disabled. That state needed a keyboard-scrollable conversation and an Arabic line-box fix.
- **T26: Linux fonts.** On Linux fonts, the Arabic keyboard test also needed the local service line counted, as the resting check already did.

### Rendered review

The capture ran on `529296c` in the loopback demo, in the hosted presentation. It covered 71 screens:

- 13 screens at 1440 px in English light: landing, sign-in, registration, Shelf, Subjects, Materials, Chat, Studio, Quiz, Settings, Batch Leader home, campaign and admin. The same screens except the landing page at 390 px.
- 7 of those at 390 px in Arabic dark.
- Chat at 320, 360, 768 and 1280 px in English and Arabic.
- Materials, Studio, Quiz, Subjects, Settings, campaign and admin at 360 px.
- `/welcome`, Settings and Batch Leader Settings at 390 and 1440 px in English and Arabic, light and dark.

No screen scrolls sideways. The overseeing session reviewed them.

Chat conversation height in px, hosted presentation, English / Arabic:

| Viewport | Before (`bcab083`) | After (`529296c`) | Target (plan) |
| --- | --- | --- | --- |
| 390x844 | 388 / 388 | 619 / 605 | ≥ 600 |
| 360x640 | 265 / 217 | 415 / 401 | ≥ 400 |
| 320x720 | 293 / 268 | 495 / 481 | ≥ 450 |
| 768x1024 | 475 / 455 | 685 / 665 | — |
| 1280x720 | 291 / 270 | 445 / 425 | ≥ 400 |
| 1440x900 | 471 | 625 | ≥ 560 |

**Bars:**
- On phones, the top bar is 52 px outside units. Inside a unit the band is the whole header: no top bar and no bottom bar.
- On desktop, the top bar is 64 px.

**Not checked:** a real iOS device (keyboard placement), a manual screen-reader pass (axe and accessible-name checks are automated), and any hosted environment.

## Per area: found, changed, verified

### 1. Design-system consistency and legacy UI (WP03-T25)

- **Found:**
  - three language switches with two semantic models;
  - two button systems;
  - Open Folio alias tokens;
  - colour-only notices;
  - no shared field, page-state or segmented control;
  - icons off the 16/20/24 scale;
  - error pages calling `reset()`, which Next 16 replaced with `retry()`.
- **Changed:**
  - one `LanguageSwitch` (plan D1): segmented "EN | ع" in the bar, full labels on access pages, a text link on the landing page;
  - one `Button` / `SubmitButton` / `ProductLink` on `buttonLook`;
  - `Field`, `Notice` with icon and tone, `PageState`, `SegmentedControl` and `MetaList`;
  - `localizedHref`;
  - alias tokens removed, with a guard test (`tests/unit/design-tokens.test.ts`);
  - error, loading and not-found pages on `PageState`, with `retry()` and a safe exit.
- **Verified:**
  - unit tests 938/938, full demo suite 194/194, main e2e 39/39;
  - rendered review in EN/AR, light/dark, 320 to 1440 px and 200% text, approved at `d6dbd43`.
- **Partial:** DS-08, DS-09, DS-15, DS-18, DS-27 and DS-28 were narrowed rather than closed. The T25 record lists what it left for later:
  - return-link labels such as "Return to Chat · Anatomy" kept as action labels;
  - the Shelf recent-study line and composer radii, done in WP03-T26;
  - pending Sign out and New session, and the hand-built field hints in intake and admin forms, done in WP03-T29.

### 2. Phone space and declutter (WP03-T26)

- **Found:** at 360x640 the hosted Chat showed 265 px of conversation in English and 217 px in Arabic, under a 52 px bar, a 134 px band and a 50 px tool row, plus a 76 px bottom bar inside units. Explanatory captions, duplicated status lines and repeated metadata crowded every tool.
- **Changed:**
  - one phone unit header: back, plus the title as the menu for sessions, privacy, unit details and language;
  - no top or bottom bar inside units on phones (plan D2);
  - the session switcher in the band on desktop (D3);
  - answer language and Send in a compact docked composer;
  - a keyboard-aware Chat;
  - a phone source sheet;
  - a shared `Disclosure`;
  - document scroll for the other unit tools;
  - declutter of Chat, Studio, Quiz, Materials, Shelf, Subjects, the Batch Leader band and the admin header, which gets a phone Menu;
  - hosted captions dropped, safety labels kept (D4);
  - DESIGN.md updated.
- **Verified:**
  - full demo suite 201/201 after the review fixes (earlier 400/400 with `--repeat-each=2`); main e2e 42/42;
  - new keyboard and sheet tests;
  - an independent review (one major finding: the admin Menu ran off-screen at 320 px and at 200% text; three minor; all fixed and re-reviewed);
  - two CI-only fixes found by `database-ci` and Linux fonts: a keyboard-scrollable conversation in real mode, and an Arabic line box;
  - approved at `1e39968`.
- **Numbers:** in the table under Rendered review.

### 3. Journeys, onboarding and demo parity (WP03-T27, WP03-T28)

- **Found:**
  - no step ever asked for a name (every real profile had `display_name = ''`);
  - the Batch Leader pages and upload route skipped the account gate (verification, consent, suspension);
  - no remembered interface language, so email links, sign-out and guards sent Arabic users back to English;
  - demo exits that differed from the real flow.
- **Changed in T27:**
  - one `accessDestination` and server guard for every authenticated page, including the Batch Leader pages, the upload route and the finalize action;
  - a `PROFILE_REQUIRED` gate derived from a non-empty name (D6);
  - `/welcome` for every role: name, interface language, appearance;
  - Settings → Profile on the same seam;
  - an additive, change-only name-format trigger with pgTAP (D8). Existing accounts stay valid; no data was changed;
  - account language in `profiles.preferred_language` (D7);
  - sign-out on consent and welcome;
  - a fifth demo pair, `new-student@example.invalid`, with an empty profile (D10).
- **Changed in T28:**
  - a functional HttpOnly language memory, written by the proxy on page loads and on same-origin client navigations that name another language;
  - a page load without `?lang=` returns in the remembered language;
  - `lang` on email links and through the callback;
  - sign-out keeps the page language;
  - a new device signs in in the account language and remembers it;
  - `lang` and `dir` rendered on the server;
  - registration continues on the verification page;
  - reserved test domains refused before Auth;
  - the demo password reset ends signed in, as in the real flow.
- **Verified:**
  - **T27:** unit tests 1,019; demo onboarding and settings specs; main e2e 40/40; `database-ci` (pgTAP 30 and a real welcome flow); an independent review (request changes, all addressed); approved at `765dc5e`.
  - **T28:** unit tests 1,027; new proxy, callback-route and synthetic-runtime tests; main e2e 42/42; demo 197/197; a `database-ci` test for the new-device path; two independent reviews (request changes, all addressed).

### 4. Interactions, buttons and input semantics (WP03-T29, with parts in T25 to T27)

- **Found:**
  - React 19's form reset wiped the email after a failed sign-in;
  - Sign out and New session could be pressed twice;
  - Batch Leader intake disabled Submit without saying why and lost the queue on leave;
  - live regions announced every percentage;
  - quiz numbers rejected Arabic-Indic digits and raised an alert on every keystroke;
  - wrong or missing `type`, `autocomplete`, `inputmode` and error wiring across forms.
- **Changed:**
  - a failed sign-in, registration, resend or reset keeps the email (never the password);
  - one pending `SignOutForm` and a pending New session;
  - a "To submit" checklist;
  - a cleared-permission announcement;
  - a leave-page guard;
  - state-only announcements;
  - a live Subjects count in a search landmark;
  - quiz numbers accept Arabic-Indic digits and validate on blur and Start;
  - Studio locks while preparing and Cancel returns focus;
  - inline localized admin errors with a `min` and the time zone on the hold expiry;
  - the full input inventory (`autocomplete` `username` / `current-password` / `new-password`, keyboard hints, `passwordrules`, `aria-describedby`).
- **Verified:**
  - new `interactions.spec.ts`;
  - main e2e 44/44, including "a failed sign-in keeps the email";
  - 19 parser unit tests;
  - `database-ci` checks for the pending Sign out and New session;
  - the full demo suite in CI;
  - an independent review (approve with nits; the quiz error timing fix added with a regression step);
  - approved at `f324d39`.

### 5. Tests, local verify and CI (WP03-T30)

- **Found:**
  - a quiz fake-clock flake;
  - one Playwright worker per demo shard;
  - two main e2e shards;
  - the full Chromium install;
  - a selector that failed closed when only the base moved;
  - a duplicate plain `typecheck`;
  - a local verify that ran every step in sequence through bare `pnpm`.
- **Changed:**
  - the flake fixed (old pattern failed 3 of 3, the helper passed 3 of 3);
  - two workers per demo shard;
  - one main e2e shard;
  - headless-shell Chromium;
  - run everything when only the base moved;
  - no duplicate typecheck;
  - a local runner with parallel static checks and the build first;
  - CPU-based local workers, lint and format caches, telemetry off.
- **Not changed, by policy:** caching, a production-build demo, narrowing the layout matrix, trimming the database stack.
- **Verified:** an independent review; demo `--repeat-each=2` 384/384; two green PR runs; the numbers in the [CI and testing report](ci-testing-report.md#after-the-refinement-merged-main).

## Demo reproduction

Start the loopback demo with `corepack pnpm demo 3101` and sign in with the published pairs (`public/demo-files/accounts.csv`, password `Synthetic-study-2026!`). Each flow below was reproduced on merged `main`; the right column names the automated check that repeats it in every CI run.

| Flow | In the demo | Repeated automatically by |
| --- | --- | --- |
| First-run profile | Sign in as `new-student@example.invalid`, accept the commitments, and `/welcome` asks for a name, the interface language and the appearance, then the academic setup follows. Sign in again: no profile step. Reproduced by hand on `529296c`: choosing Arabic switched the page and kept the typed name, and Save opened the Arabic study setup with the name in the bar. | `onboarding.spec.ts` |
| Profile later | Settings → Profile: change the name or the account language. | `onboarding.spec.ts`, `settings-account.spec.ts` |
| Registration and email return | `/register` → Create account → the verification page → `/auth/callback?code=sample-verification&type=signup` → commitments → `/welcome`. | `auth.spec.ts` |
| Password recovery | Forgot password → `/auth/callback?code=sample-recovery&next=%2Freset-password` → new password → signed in, commitments next. | `auth.spec.ts` |
| Language switch | Type in Chat, then switch EN / ع: the route, query, fragment and draft stay. | `rtl.spec.ts` |
| Phone unit header and docked Chat | At 360x640, open a unit's Chat. The title is the menu (sessions, privacy, details, language), and the composer stays docked. With the keyboard open, the tools hide. | `chat.spec.ts`, `study.layout-matrix.spec.ts` |
| Phone source sheet | Answer → citation: a bottom sheet that keeps focus; Escape returns focus. | `chat.spec.ts` |
| Batch Leader intake | `leader@example.invalid` → campaign → add files: the "To submit" list, the cleared-permission line and the leave warning. | `interactions.spec.ts`, `leader-collection.spec.ts` |
| Quiz numbers | Quiz → Number of questions `٤` → Start. | `interactions.spec.ts`, `studio-quiz.spec.ts` |
| Subjects search | Subjects → search: "{n} subjects shown". | `interactions.spec.ts` |
| Admin decisions | `admin@example.invalid` → a decision → Hold without a date: an inline error. | `interactions.spec.ts`, `admin.spec.ts` |
| Remembered language, failed sign-in keeps the email, pending Sign out and New session | Real runtime only: the demo sets no cookie and calls no Auth. | main e2e `auth-flows.spec.ts`; database e2e in `database-ci` |

The full demo suite (209 tests) passed on `529296c` in the local verify above and in CI.

The demo still differs from the real product where it must: document-local state, no cookies and no email. The [walkthrough](../wp03-synthetic-frontend-review.md) lists every remaining difference ("Where the demo and the real product differ").

## Open items and risks

**Founder actions** (not taken, by plan D13):

1. **Production promotion.** Merging does not deploy (`vercel.json` disables `main` deployments). WP03-T25 to T29 reach production only through a founder promotion. That release applies the WP03-T27 migration `20261018001935_profile_display_name_format.sql` to hosted Supabase. It is an additive trigger that checks a name only when it changes; existing rows and data are untouched.
2. **Vercel bypass secret.** If not already done, revoke the Vercel Protection Bypass for Automation secret that `vercel curl --debug` printed during WP03-T19. This was recorded in [#88](https://github.com/unimind989-sys/UniMind-Project/pull/88), before this work.
3. **Founder review of the UI.** The material-UI approvals (`Approved commit:` in T25, T26, T27 and T29) were given by the overseeing session under Ahmed's delegation, not by a founder. A founder look at the rendered result before promotion is advisable.

**Open, with reasons:**

- **PJ-19.** "Change password" for a signed-in user still goes through the recovery email. A direct change would skip reauthentication while `secure_password_change = false` (local config; the hosted setting was not read). It needs a decision.
- **PJ-21.** Email links opened on a different device (PKCE) need a hosted check.
- **PJ-16.** A Batch Leader who is also a cohort student is unsupported in the PoC. No provisioning path creates one ([findings](findings.md#not-planned-with-reasons)).
- **TC-07.** Trimming services in `database-ci` needs a reading of D-21.
- **D9 follow-up.** The Batch Leader account gate is enforced in the application seam. The reviewed RLS predicate `has_campaign_assignment` is unchanged and is listed for the security review.
- **IX-35, partial.** The synthetic admin band keeps its Sign out: a demo-versus-real parity question, not an interaction defect.
- **DS-08, DS-09, DS-15, DS-18, DS-27 and DS-28, partial.** Listed in the WP03-T25 record.
- **iOS keyboard placement.** Not verified on a device. The shell sizes Chat to the visual viewport but does not use its scroll offset.

## Decisions

The fourteen decisions D1 to D14 are in the [plan](plan.md#decisions-taken-under-the-delegation). Decisions taken during implementation are recorded in each task record:

- **T26:**
  - One `<details>` menu serves both widths.
  - Enter sends only with a fine pointer, because on touch keyboards Enter adds a line.
  - Chat's source sheet links the library.
  - The dates disclosure shows at every width.
  - The conversation takes keyboard focus only while it scrolls with nothing focusable inside.
- **T27:**
  - A change-only name trigger instead of a `NOT VALID` check (D8).
  - The Settings email is read from the verified token for display only; the verified identity is unchanged.
  - The Batch Leader gate lives in the application seam (D9).
- **T28:**
  - The URL stays the single source of the interface language.
  - Next removes its router headers before the proxy, so a client navigation is recognised as a same-origin script request, and links to another language never prefetch.
  - English links on a device without a memory write nothing.
  - Reserved test domains are refused in the Server Action, because the demo registers them.
  - `lang` and `dir` come from a validated proxy header, which makes every route dynamic; all already were except `/_not-found`.
- **T29:**
  - The email survives through the uncontrolled field's default value; a controlled field would drop text typed before hydration.
  - No blur error on the intake description.
  - Quiz Start validates instead of being disabled.
  - The hold-expiry `min` uses the demo clock in the demo.
  - The auth form UI is treated as a protected path.
- **Process:**
  - At most one code-writing sub-agent at a time (D14).
  - Every protected-path task, plus T26 and T29, had an independent review of the exact diff before merge.
  - Material-UI approvals are recorded as the overseeing session's, not a founder's.
