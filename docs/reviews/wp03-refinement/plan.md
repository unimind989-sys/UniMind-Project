# WP03 refinement: implementation plan

**Task:** [WP03-T24](../../runbooks/poc-execution-runbook.md#wp03-t24--audit-the-platform-and-plan-the-wp03-refinement). **Inputs:** the [findings](findings.md) and their five area reports. **Delegation:** Ahmed's WP03 manager brief of 18 October 2026 hands every decision below to the overseeing Claude Code session; each is recorded here and in the owning task record, and none is a founder review.

## Order and dependencies

```text
T24 audit and plan (docs)
 ├─ T30 verification and CI speed ............ independent (CI, scripts, test configs)
 └─ T25 Cobalt primitives and legacy cleanup . foundation for every UI task
      ├─ T26 phone space and declutter ......... shell, unit band, Chat, bands, Shelf, Subjects
      ├─ T27 profile onboarding and access gate  auth gate, migration, /welcome, Settings, demo
      │    └─ T28 interface language and demo parity
      └─ T29 interactions and input semantics ... after T26 (shares Chat, Shelf and intake files)
```

- T25 lands first because T26, T27 and T29 build on its `Button`, `Field`, `Notice`, `PageState`, `SegmentedControl` and `LanguageSwitch`.
- T30 touches only CI, scripts, test configuration and one test, so it runs beside T25.
- T26 and T27 can overlap: T26 owns the shell, band, Chat and role bands; T27 owns the access gate, `/welcome`, Settings and the account seams. Settings declutter (MD-22) moves into T27 so only one task edits Settings.
- T28 needs T27's profile seam (account language). T29 runs after T26 because both edit Chat, the Shelf and Batch Leader intake.
- Each task is one branch and one PR with required CI. Rendered changes are checked at 360, 390, 768 and 1440px (plus 320px and 200% text where layout changes), in English and Arabic, light and dark.

## Tasks

### T25 — Consolidate the Cobalt design system and shared primitives

- **Findings:** DS-01 to DS-16, DS-18, DS-21 to DS-23, DS-25 to DS-34 (DS-24 and DS-19 move to T26), IX-02, IX-03, IX-07, IX-17, IX-30.
- **Work:**
  - One `LanguageSwitch` (segmented "EN | ع" in the Night bar, full labels on access pages, text link on the landing) and a `localizedHref` helper for the hand-built `?lang=` links.
  - Rebuild `Button` and the action link to DESIGN's variants (primary, secondary, quiet, destructive; paper, Night and Cobalt tones; pending state) and migrate the role-specific copies onto them.
  - Add `SubmitButton` (pending label through `useFormStatus`), `Field` (label, hint and error wiring), `Notice` with icon, `PageState`, `SegmentedControl`, `MetaList` and icon sizes.
  - Replace Open Folio alias tokens with Cobalt tokens, delete the aliases and add a guard against them.
  - Fix avatar contrast, the Materials pill, the font stacks, focus rings and disabled styles.
  - Move error and loading pages onto `PageState` with `retry()` and a safe exit.
  - Move Report, Evidence, the Quiz states and the campaign invitation onto the primitives, and delete dead CSS and code.
- **Protected paths:** none. **Material UI:** yes.
- **Proof:** unit tests for `localizedHref` and the alias guard; demo e2e (layout matrix, RTL, admin, leader, study); a draft-preservation test across a language switch; rendered review.

### T26 — Give content the screen on phones and declutter screens

- **Findings:** MD-01 to MD-21, MD-23 to MD-29 (MD-22 moves to T27), DS-17, DS-19, DS-20, DS-24, IX-06, IX-20 to IX-23, IX-33, IX-34, IX-36.
- **Work:**
  - The phone unit header DESIGN describes: back, a title button with the session line opening one menu, and the segmented tools. No logo or language row inside a unit.
  - On desktop, the session switcher moves into the band. The answer-language menu moves into the composer.
  - A compact composer: one auto-growing line, an icon Send button on phones, a smaller privacy line.
  - Keyboard-aware Chat: the `viewport` export with `interactive-widget=resizes-content`, a keyboard state that hides the bottom bar and the tools row, and no flip to page flow.
  - Hide the bottom bar inside unit workspaces on phones (DESIGN edit). Materials, Studio and Quiz scroll the document on phones.
  - A shared band slot in the shell. A phone bottom sheet for sources. One `Disclosure` primitive for floating menus (outside click, focus-out, Escape).
  - Declutter Chat answers, the Shelf, Subjects, Materials, Studio, Quiz, the Batch Leader band and the admin header. Hide non-safety captions in the hosted demo.
- **Protected paths:** none (the viewport export is presentation). **Material UI:** yes, with a DESIGN.md update for the bottom bar, keyboard state and language location inside units.
- **Proof:** a keyboard-state e2e test; the T23 compact-chat journey kept green at the same floor; layout matrices; rendered numbers against the targets below.

### T27 — Add first-run profile onboarding and one shared access gate

- **Findings:** PJ-01 to PJ-06, PJ-10 to PJ-15, PJ-27 to PJ-29, IX-05, IX-10, IX-18, IX-19, MD-22, DS-30.
- **Work:**
  - A pure `accessDestination(gate, { locale, next })` and one server guard `requireReadyAccess`, used by every authenticated page. This includes both Batch Leader pages, the upload route and the finalize action (PJ-04).
  - A `PROFILE_REQUIRED` gate after consent, derived from a non-empty trimmed `display_name` (no new flag).
  - A `/welcome` step (fourth item of the access stepper) for every role: full name (required), interface language (preselected), appearance (optional, device-local). It hands students on to the existing academic setup.
  - A profile domain, application and adapter seam shared by `/welcome` and a new Settings → Profile view (email read-only, name, language).
  - Settings declutter. Privacy shown to students only. A local error state when the catalog fails.
  - Sign-out on consent and welcome. An honest no-membership state with a next action.
  - One additive migration: a `display_name` format check added `NOT VALID`, so existing rows are not touched.
  - Demo: a fifth pair `new-student@example.invalid` with an empty profile, no fixture-name fallback, per-account profiles in the loopback document, and `/welcome` in the demo route table.
- **Protected paths:** auth gate and routing, migration, Batch Leader upload authorization. Needs a written plan in the task record, an independent review of the exact diff, pgTAP coverage and a rollback (`drop constraint`; revert the PR).
- **Proof:** unit tests (gate order, destinations, profile rules); pgTAP for the constraint and own-row updates; demo onboarding e2e (new account, validation, language switch keeps the name, returning user skips); database browser e2e (real user gated to `/welcome`, leader gate).

### T28 — Remember the interface language and align demo journeys

- **Findings:** PJ-07, PJ-08, PJ-09, PJ-16 (record only), PJ-18 to PJ-20, PJ-22 to PJ-24, PJ-26, PJ-30, IX-28.
- **Work:**
  - Locale precedence: `?lang=`, then a `unimind-locale` cookie, then the account language (`profiles.preferred_language`), then English.
  - Write the cookie from the proxy, onboarding and Settings. Carry `lang` through email links, the callback, sign-out and guard redirects. Render `lang` and `dir` on the server.
  - Demo parity: register exit, password-reset exit, privacy and admin-resource labels. Intercept known demo emails on hosted registration.
  - Copy fixes for the leader empty state and Reset password.
- **Protected paths:** proxy and auth callback. Needs an independent review.
- **Proof:** unit precedence matrix; e2e that an Arabic sign-out and an email-link return stay Arabic; demo parity journeys.

### T29 — Repair interactions and input semantics

- **Findings:** IX-01, IX-04, IX-08, IX-09, IX-11 to IX-16, IX-24 to IX-27, IX-29, IX-31, IX-32, IX-35, and the input inventory.
- **Work:**
  - Keep the email after a failed auth action.
  - Pending and disabled states on New session and Sign out.
  - A "to submit" checklist, `beforeunload` and state-only live text in Batch Leader intake.
  - A live result count on Subjects search. Quiz numbers that accept Arabic-Indic digits and validate on blur.
  - Correct `type`, `inputMode`, `enterKeyHint`, `autoComplete`, `spellCheck`, `maxLength` and `aria-describedby` on every input.
  - Focus after Cancel. Studio controls locked while generating. Admin inline errors and empty-state copy.
- **Protected paths:** none (auth form presentation only; actions unchanged). **Material UI:** small.
- **Proof:** real-mode e2e that a wrong password keeps the email; demo e2e for each repaired control; unit tests for digit parsing.

### T30 — Speed up local verification and CI without losing coverage

- **Findings:** TC-01 to TC-06, TC-08 to TC-12, TC-19 to TC-22.
- **Work:**
  - Fix the quiz fake-clock race first.
  - Two Playwright workers per demo shard (five shards), a single main e2e shard, `--only-shell` Chromium for the e2e jobs.
  - The selector runs every job (instead of failing) when only the base moved.
  - Drop the duplicate plain `typecheck` from `verify:ci` (kept in `check`), guarded by a unit test that the build still type-checks.
  - A local verify runner: no bare `pnpm`, parallel static checks, build before the browser suites, a timing table.
  - Worker count from the CPU count, ESLint and Prettier caches, Next telemetry off, and corrected docs.
- **Protected paths:** CI workflow and selector. Needs a written plan, an independent review, two green PR CI runs and a `--repeat-each=2` demo run before merge.
- **Proof:** before and after measurements in the [CI and testing report](ci-testing-report.md).

## Decisions taken under the delegation

| # | Decision | Why |
| --- | --- | --- |
| D1 | Language switch: one compact segmented control "EN \| ع" in the Night bar (full names as accessible names), the same primitive with full labels on access pages, and the landing's text link. | Matches DESIGN's "native buttons, an accessible name and a visible current state … compact control". The mockup's single `ع` button would hide the current state. |
| D2 | Inside a unit on phones, the bottom bar is hidden and the back button is the exit. DESIGN lines 124 and 183 are updated. | 76px more reading space in every unit tool; native apps hide tab bars on detail screens; with D3, the CSS model gives about 416px of conversation at 360x640 in the docked layout. |
| D3 | Session switcher in the band (desktop) or the title menu (phone); answer language in the composer; sources open in a phone bottom sheet. | These are DESIGN's own placements; the build had drifted from them. |
| D4 | Hosted demo screens drop explanatory captions that are not safety labels. "Sample question", the sample-answer label and the local service line stay. | DESIGN line 42: the hosted simulation uses ordinary presentation with no extra explanation. |
| D5 | Subjective visual calls: no hover elevation on non-floating cards, no grey shadow on selected choices, a flat 14px access form page, a neutral scrollbar, exact admin IDs in Manrope tabular numerals instead of monospace, no decorative book tile on Subjects rows, Settings stays on paper without a Night band. | Each follows a DESIGN rule (elevation only for what floats, no monospace labels, no repeated icon tiles) or reduces chrome on a utility page. |
| D6 | Onboarding is a `/welcome` profile step after consent for every role, with completion derived from a non-empty name. No `onboarded_at` flag. | Existing accounts get the step once without backfill; nothing can drift; it follows the derived-state rule used for availability and academic setup. |
| D7 | The account language reuses `profiles.preferred_language` (`EN`, `AR_EG`; `MIXED` means no interface preference). Appearance stays device-local. | Already granted, RLS-tested and unused; DESIGN forbids a settings table for appearance. |
| D8 | The `display_name` format check is added `NOT VALID`, so existing hosted rows are never scanned or rejected; new writes are checked. | No hosted data was inspected, and the brief forbids production data actions. |
| D9 | The Batch Leader account gate is enforced in the server pages, upload route and finalize action; the database predicate `has_campaign_assignment` is unchanged. | Closes the gap with a reviewed application seam; changing a reviewed RLS predicate is recorded as a follow-up for the security review. |
| D10 | A fifth demo login pair, `new-student@example.invalid`, starts with an empty profile. | The brief asks for a genuinely new demo account; WP03-T11 approved four pairs, and this amends that list. |
| D11 | CI: two workers per demo shard, one main e2e shard, `--only-shell`, a selector that runs everything when only the base moved, and no duplicate plain `typecheck` in `verify:ci`. Rejected: caching, a production-build demo, build reuse, narrowing the layout matrix, trimming the database stack. | Measured savings against policy and coverage; see the CI report. |
| D12 | Full local `pnpm verify` stays the pre-PR rule; T30 makes it faster instead of skipping it. | The rule is in AGENTS.md and the workflow; the brief asks not to weaken gates. |
| D13 | No Preview, Beta, production or hosted Supabase action. Merging to `main` does not deploy (`vercel.json` disables `main` deployments); promotion stays a founder action. | The brief's safe-route rule. |
| D14 | At most one code-writing sub-agent at a time, beside the overseeing session. | AGENTS.md is stricter than the brief's allowance; the 4-CPU machine also limits parallel dev servers. |

## Rendered baseline and targets

Measured on `bcab083` in the loopback demo with `.local/wp03-refinement/capture.mjs` (Chromium, device scale 1). "Hosted-like" removes the local service line and dismisses the first-visit citation tip, which is what a returning student sees on the live site; the raw local numbers include both. At 360x640 and 320x720 Chat already falls back to page flow, so the conversation is whatever is left below the header at the top of the page. Every task measures again with the same script.

| Measure | Baseline, hosted-like (raw local) | Target |
| --- | --- | --- |
| Chat conversation, 390x844 EN / AR | 388 / 388px (205 / 197) | ≥ 600px |
| Chat conversation, 360x640 EN / AR | 265 / 217px, page flow (82 / 26) | ≥ 400px, docked composer |
| Chat conversation, 320x720 EN / AR | 293 / 268px, page flow (90 / 55) | ≥ 450px, docked composer |
| Chat conversation, 1280x720 EN / AR | 291 / 270px (184 / 181) | ≥ 400px |
| Chat conversation, 1440x900 EN | 471px (364) | ≥ 560px |
| Desktop Night bar | 73px | 64px |
| Phone top bar | 59px | ≤ 52px |
| CI wall time (main push) | 7.4 to 8.0 min | ≤ 6.8 min |
| CI compute per run | about 42.5 min | ≤ 32 min |
| Local `pnpm verify` | 48.4 min | at least 35% faster |

Screens captured at the same commit (all English light unless noted): landing, sign-in, registration, Study Shelf, Subjects, Materials, Chat, Studio, Quiz, Settings, Batch Leader home and campaign, admin queue at 390x844 and 1440x900; Shelf, Chat, Materials, Settings, campaign, admin and sign-in in Arabic dark at 390x844; Chat at 360x640, 320x720, 768x1024 and 1280x720 in both languages. The images stay in the local scratch folder; the rendered review of each task records what it checked.
