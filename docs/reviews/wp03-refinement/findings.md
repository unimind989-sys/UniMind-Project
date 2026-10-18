# WP03 refinement: platform audit findings

**Task:** [WP03-T24](../../runbooks/poc-execution-runbook.md#wp03-t24--audit-the-platform-and-plan-the-wp03-refinement). **Base:** `main` at `bcab083` (18 October 2026). **Authority:** [DESIGN](../../../DESIGN.md) for visuals, the [master plan](../../plans/poc-master-plan.md) for product rules.

This is the consolidated, prioritized inventory. Each line points to the area report that holds its file and line evidence, the reason it happens and the detailed fix:

| Area | Report | Findings |
| --- | --- | --- |
| Design-system consistency and legacy UI | [design-system](audits/design-system.md) | DS-01 to DS-34 |
| Mobile viewport and decluttering | [mobile-declutter](audits/mobile-declutter.md) | MD-01 to MD-29 |
| Product logic, journeys, onboarding and demo | [journeys](audits/journeys.md) | PJ-01 to PJ-30 |
| Interactions and input semantics | [interactions](audits/interactions.md) | IX-01 to IX-36 |
| Tests, local verification and CI | [testing-ci](audits/testing-ci.md) | TC-01 to TC-22 |

## Method and limits

- Five read-only audits ran in parallel against the same commit. Each read the code, migrations and tests behind its area. The test and CI audit also read the job, step and per-test timings of the three latest `main` runs and 100 recent runs through `gh`.
- A local baseline of `pnpm verify` was timed step by step on the founder machine during the audits (see the [CI and testing report](ci-testing-report.md)).
- Rendered checks: the screen-space numbers in MD were computed from the CSS and then measured in the rendered demo at 360x640, 390x844, 320x720, 768x1024, 1280x720 and 1440x900 (see [rendered baseline](#rendered-baseline)).
- Nothing here was checked against hosted Supabase, Preview or production. Two journey risks (PJ-21, PJ-30) are inferred from code and stay open for a hosted check.

## Classes

| Class | Count | Meaning |
| --- | --- | --- |
| Confirmed defect | 57 | Behaviour or presentation contradicts DESIGN, accessibility rules or the product contract. |
| Missing functionality | 16 | A journey step, state or primitive that the product needs and does not have. |
| UX opportunity | 26 | Works, but costs space, attention or steps without a matching benefit. |
| Technical inefficiency | 28 | Duplicate code, dead code, slow checks or fragile structure. |
| Subjective design call | 22 | A judgment, decided in the [plan](plan.md#decisions-taken-under-the-delegation). |
| Needs verification | 2 | Inferred from code; needs a hosted check (PJ-21, PJ-30). |

151 findings in total. A finding that spans two classes is counted under its first class; each report gives the exact class per item.

## P1: fix first

| ID | Class | Finding | Planned in |
| --- | --- | --- | --- |
| PJ-01, PJ-02, PJ-03 | Missing functionality | No step ever asks for a name. Every real profile keeps `display_name = ''`, so the shell says "Your profile" with the initial "Y", and Settings shows no name, language or email. | T27 |
| PJ-04 | Confirmed defect | Batch Leader pages and the upload route never run the account gate (verification, consent, suspension). Only the campaign assignment is checked. | T27 |
| PJ-06 | Confirmed defect | The demo falls back to fixture names even when the profile name is empty, so even a "new" demo account looks complete and hides PJ-01. | T27 |
| IX-01 | Confirmed defect | A failed sign-in or registration clears the typed email (React 19 resets the form after every action). The demo pre-fills the email, which hides it. | T29 |
| IX-02 | Confirmed defect | Every error page calls `reset()`, which re-renders without fetching again in Next 16.3, so "Try again" cannot recover from a server failure. Two error states have no exit. | T25 |
| DS-01 | Confirmed defect | The product-shell language switch is the pre-Cobalt component with new colours: two full-word buttons with check icons. It stretches the 64px Night bar to 70px (58px on phones). | T25 |
| DS-04 | Confirmed defect | The profile avatar puts small white text on Cobalt (about 4.1:1 light, 3.1:1 dark): an AA failure. | T25 |
| DS-05 | Confirmed defect | Materials shows "Inactive" in success green. | T25 |
| DS-06 | Technical inefficiency, visible | Two button systems. The shared `Button`/`ProductLink` still use the old grey-filled look on 75 call sites while each rebuilt role wrote its own Cobalt copy. | T25 |
| MD-01, MD-02, MD-29 | Confirmed defect | Chat stacks the global top bar, the subject band and a separate toolbar. Measured for a returning student: 388px of an 844px phone screen and 291px of a 1280x720 laptop are left for the conversation; at 360x640 the shell gives up the docked layout and falls back to page flow. On a first visit in the local demo it is 205px at 390x844. DESIGN already asks for one phone header and the session switcher in the band. | T26 |
| MD-03 | Confirmed defect | The composer is 117px of permanent chrome (two-row field, labelled Send, padded privacy line). | T26 |
| MD-04 | Missing functionality | When the phone keyboard opens in Chat, the shell flips to page flow: the bottom bar jumps into the header and only about 120px of conversation stays visible. | T26 |
| MD-24 | UX opportunity | On a phone, the Batch Leader campaign band (about 534px) pushes the first request below the fold. | T26 |
| TC-01 | Technical inefficiency | Each CI demo shard runs one Playwright worker on a 4-vCPU runner; demo tests are 81% of CI wall time. | T30 |
| TC-02 | Confirmed defect (test) | The one known open demo flake: a fake-clock race in the Quiz layout test. | T30 |

## P2: fix in the same refinement

| ID | Class | Finding | Planned in |
| --- | --- | --- | --- |
| DS-02, DS-28 | Technical inefficiency | Three language switches with two semantic models; 58 hand-built `?lang=` links. | T25 |
| DS-03 | Confirmed defect | Mixed-script text falls back to a system face: the font stacks do not chain Manrope and Noto Sans Arabic. | T25 |
| DS-07, DS-08, DS-09, DS-10, IX-03, IX-07 | Missing functionality | No shared `SegmentedControl`, `Notice` (with icon), `PageState`, `SubmitButton` or `Field`; notices signal state by colour only. | T25 |
| DS-11, DS-12 | Technical inefficiency | 97 references to Open Folio alias tokens; `--accent-ink` is not a DESIGN token but is used 32 times; hard-coded colours. | T25 |
| DS-14, DS-15 | Confirmed defect | Icons at 14/18/22/28px instead of 16/20/24; middle-dot metadata strings in about 14 places. | T25 |
| DS-29 | Confirmed defect | Report, Evidence, Quiz states and the campaign invitation still compose Open Folio panels. | T25 |
| DS-17, DS-20, IX-33 | Missing functionality | The Night band is re-implemented four times with negative margins; the phone bottom sheet for sources was never built. | T26 |
| MD-05, MD-06 | UX opportunity | Inside a unit the bottom bar repeats destinations the back button already reaches; Materials, Studio and Quiz pin a 193px header that never scrolls away. | T26 |
| MD-07 to MD-11, IX-06, IX-20, IX-21, IX-22, IX-23, IX-34, IX-36 | Mixed | Chat clutter: duplicate evidence links per answer, a first-visit tip in the chrome before any answer exists, a session menu positioned by a magic number, floating menus that ignore outside clicks, Enter that cannot add a newline on touch keyboards. | T26 |
| MD-15, MD-17, MD-19, MD-20, MD-26 | UX opportunity | Header stacks push the first content of Subjects, Shelf, Materials, Studio and the admin queue far down the phone screen. | T26 |
| MD-27 | Subjective design call | Hosted demo screens carry explanatory captions that DESIGN says the hosted simulation should not show. | T26 |
| PJ-05 | Missing functionality | A new real student without a cohort lands on a dead end with no next action. | T27 |
| PJ-10, PJ-11, PJ-12 | Technical inefficiency | Gate-to-redirect mapping is copied across nine files and differs between them; the access snapshot is not request-cached. | T27 |
| PJ-13, IX-10, PJ-14 | Confirmed defect | If the catalog fails, Settings (the only sign-out entry) becomes the generic error page; consent has no sign-out. | T27 |
| PJ-28 | Missing functionality | The database accepts control and bidi-override characters in `display_name`. | T27 |
| PJ-08, PJ-09, PJ-26 | Confirmed defect | The interface language lives only in the URL: email links, sign-out and guard redirects send Arabic users back to English, and nothing remembers the preference. | T28 |
| PJ-07, PJ-20, PJ-22, PJ-23, PJ-24 | Confirmed defect (demo vs real) | Demo shortcuts that differ from the real flow: register exit, password-reset exit, working privacy toggle, populated admin resources. | T28 |
| IX-04, IX-05, IX-08, IX-09, IX-11, IX-12, IX-13 | Mixed | No pending state on New session and Sign out (a double tap creates two sessions); Settings tabs refetch the page; Batch Leader Submit disables without a reason and loses the queue on reload; progress floods screen readers; Subjects search never announces its count; Quiz number fields reject Arabic-Indic digits. | T29 (IX-05 in T27) |
| TC-03, TC-08, TC-09, TC-10 | Technical inefficiency | A moved `main` turns `ci-selector` red; local `pnpm verify` is serial, fails without `pnpm` on PATH, builds last and takes about 45 to 50 minutes. | T30 |

## P3: polish and cleanup

Planned in the same tasks as their area: DS-13, DS-16, DS-18, DS-19, DS-21 to DS-27, DS-30 to DS-34 (T25, with DS-19 and DS-24 in T26); MD-12 to MD-14, MD-16, MD-18, MD-21, MD-25 (T26); PJ-15, PJ-18, PJ-19, PJ-27, PJ-29, PJ-30 (T27 and T28); IX-14 to IX-19, IX-24 to IX-32, IX-35 (T29, with IX-18 and IX-19 in T27); TC-04 to TC-06, TC-11, TC-12, TC-21, TC-22 (T30).

## Not planned, with reasons

| ID | Reason |
| --- | --- |
| PJ-17 | Invitations, membership grants and role grants are blocked by D-01 and D-03 and planned in WP08-T04 and WP11-T02. T27 makes the dead end honest (PJ-05) instead. |
| PJ-16 | A Batch Leader who is also a cohort student: no provisioning path creates such an account today. Recorded as unsupported in the PoC rather than building a speculative role switch. |
| PJ-21, PJ-30 | Inferred from code; both need a hosted check that this refinement does not run (no hosted or production actions). PJ-30's code-level guard ships in T28; PJ-21 stays a recorded risk. |
| PJ-25 | The hosted demo asks for consent on every sign-in because its state is per document. The loopback demo shows the returning-user path after T27. Accepted. |
| TC-07 | Trimming Supabase services in `database-ci` needs a reading of D-21's "complete stack". Recorded for the founders. |
| TC-13 | Relying on CI for the full demo instead of local `pnpm verify` changes the agreed workflow. Kept; T30 makes local verify faster instead. |
| TC-14, TC-15, TC-16, TC-17, TC-18 | Rejected on measured cost and policy grounds: caching is forbidden by the CI policy and saves under 1.5 compute-minutes; a production-build demo would weaken the T15 demo gate for a 1 to 2% gain; build reuse crosses jobs with different public values; the duplicate workflow check is required by coverage; narrowing the layout matrix weakens T15 scope. |

## Rendered baseline

Captured from the loopback demo on `bcab083` with `.local/wp03-refinement/capture.mjs`, both raw and hosted-like (no local service line, citation tip dismissed). The measured Chat numbers match the CSS model in the phone-space report within 3px. See the [plan](plan.md#rendered-baseline-and-targets) for the numbers and the targets each task must meet.
