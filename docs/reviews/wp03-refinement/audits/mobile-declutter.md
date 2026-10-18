# WP03 refinement audit: mobile screen real estate and interface clutter

Area 4 of 6. Code-level analysis on `main` at `bcab083` (read-only; no build, test or server was run). A rendered measurement pass follows; section 8 lists what it must confirm.

## 0. Method and assumptions

- Heights are computed from the CSS Modules and the JSX that renders them, with `box-sizing: border-box` (`src/app/globals.css:1-5`), root `line-height: 1.6`, Manrope at the stated sizes.
- **Production presentation:** real routes and the hosted simulation. The loopback demo adds the `.simulation` service line (`app-shell.tsx:324-334`, 2–3 lines, about 56–74px) that is **not** in these numbers.
- English, light theme, `env(safe-area-inset-bottom) = 0` (see V-4), a one-line unit title ("Anatomy"), and a returning student (no first-visit citation tip) unless stated.
- **Calibration:** with the simulation line added back, the model gives 332px of Chat reading at 390x844. WP03-T23 measured 329px (`planning/tasks/wp03-t23-settled-chat-layout.md:51`). The model also predicts T23's 320x720 flip to `page` flow (227 − 74 = 153 < 160). Expect about ±4px per figure.

## 1. Viewport and mobile-browser behaviour

| ID | Fact (code) | Consequence |
| --- | --- | --- |
| V-1 | `src/app/layout.tsx` has no `viewport` / `generateViewport` export. Next 16 therefore emits only `width=device-width, initial-scale=1`. Theme colour is a hand-written `<meta name="theme-color">` (`layout.tsx:63`). | No `interactive-widget`, so Chrome and Firefox on Android use the default `resizes-visual`: the keyboard shrinks only the visual viewport, and `100dvh` does **not** shrink. `interactiveWidget` is typed in Next 16.3.8 (`node_modules/next/dist/lib/metadata/types/extra-types.d.ts:53`). |
| V-2 | No `100vh` anywhere in `src/`. Page minimums use `100svh` (`app-shell.module.css:6`, `globals.css:179`, `product.module.css:2`, `workspace.module.css:59`, `auth.module.css:4`). The unit workspace uses `height: 100dvh` (`app-shell.module.css:196-199`). Dialogs and popovers use `dvh` caps. | Correct unit choices. `svh` minimums never jump. `dvh` follows the URL bar but, by V-1, not the keyboard. |
| V-3 | The unit workspace's "pane" flow scrolls an inner element (`.transcript` in Chat, `.workspaceBody` elsewhere), never the document. | The phone browser's own toolbar (Chrome Android URL bar of about 56px, Safari's bottom bar) collapses only when the **document** scrolls. In every unit tool it therefore stays expanded the whole time. This hidden cost is not in the px tables below. |
| V-4 | `env(safe-area-inset-bottom)` is used (`app-shell.module.css:245, 273, 351`) but there is no `viewport-fit=cover`. | On iOS the insets resolve to 0 and Safari insets the page itself, so the safe-area code is dormant but harmless. Do **not** add `viewport-fit=cover` unless the Night header also pads `safe-area-inset-top`, which no rule does today. |
| V-5 | **Keyboard opens in Chat:** `app-shell.tsx:75-101` sets `height = min(innerHeight, visualViewport.height)` and flips `data-workspace-flow` to `page` when `height − chrome − nav < 160`. | At 360x640 a ~280px keyboard leaves a visual viewport of about 360px. The check gives 360 − 368 − 73 < 160, so the layout flips to `page` on every keyboard open. In `page` flow the bottom bar becomes a static third row **inside the Night top bar** (`app-shell.module.css:335-346`), the document scrolls, and `scrollIntoView({block:"center"})` (`app-shell.tsx:102-118`) centres the composer. That leaves about 120px of transcript above the composer. The shell still reserves `padding-block-end: 76px` under the composer (`app-shell.module.css:242-246`, never reset in `page` flow). So **the bottom bar does not stay at the bottom; it jumps into the header. The composer stays visible.** iOS Safari behaves the same (it ignores `interactive-widget`; the visual-viewport branch drives it). |

## 2. Persistent chrome budget (phone)

Shared pieces:

| Piece | Height | Source |
| --- | --- | --- |
| Phone top bar (compact logo + English/العربية switch) | **59px**: 50px language track (3 + 44 + 3) + 2×4 padding + 1 border; the mockup row is 52 | `app-shell.module.css:250-255`; `frontend-system.module.css:194-217` |
| Student bottom bar | **73px** (1 + 6 + 60 + 6) + safe area; shell reserves 76 | `app-shell.module.css:241-246, 265-290` |
| Batch Leader bottom bar | **~86px**: "Latest submissions" wraps to 2 lines at 13px in a ≤125px column | `app-shell.tsx:170-176` |
| Subject band (unit) | **122px + 12px gap = 134** at 360/390. **186** at 320, where the "Module details" pill wraps to its own row (176 + 8 + ~126 > 288). +27 per extra title line. Arabic segmented row likely wraps at ≤360 (+46, estimate) | `frontend-system.module.css:250-303` |
| Chat toolbar row (Sessions, Study options) | **50px** (44 + 6) | `product-chat.module.css:617-646` |
| Composer | **117px + 8 margin = 125**: 2-row textarea is 72px; privacy line 27px | `product-chat.tsx:619-645` (`rows={2}`); `product-chat.module.css:402-449, 490-509, 704-717` |
| First-visit citation tip | +68px inside the chrome region | `product-chat.tsx:507-522`; `.evidenceTip` |

Per screen. "Persistent" means it does not scroll away. For page-scrolled screens the overhead before the primary content is given instead.

| Screen | 360x640 | 390x844 | 320x720 | Notes |
| --- | --- | --- | --- | --- |
| **Chat**, chrome / reading | **456 (71%) / 184** | **456 (54%) / 388** | **508 (71%) / 212** | 59 top bar + 134 band + 50 toolbar + 125 composer + 12 content padding + 76 bottom bar. First visit at 360x640: +68 tip, which flips to `page` flow. Arabic at 360x640 likely flips too (segment wrap, estimate). Keyboard: see V-5. |
| Materials / Studio / Quiz setup (pane flow) | **281 (44%)** | 281 (33%) | 333 (46%) | 59 + 134 + 12 + 76. The header never scrolls away, and neither does the browser toolbar (V-3). |
| Quiz attempt | **~345–365 (54–57%)** | ~345 (41%) | ~400 (56%) | + sticky progress strip, which wraps to ~68 + 16 (`quiz.module.css`, `quiz-progress.tsx:19-26,76`) |
| Study Shelf (page scroll) | persistent 73 (11%); Resume CTA bottom at ~530–553 of 567 visible | 73 (9%) | 73 (10%) | Covers start below the fold. 100px of header text is removable (MD-17). |
| Subjects (page scroll) | 73; **first row at ~415 (65%)** | 73 | 73 | Includes a 64px gap meant for the Shelf's resume overlap (MD-15). |
| Settings (page scroll) | 73; **first control at ~485 (76%)** | 73 | 73 | h1 + summary card + return link + 2×2 tabs (MD-22) |
| Batch Leader campaign intake | 86; **first request starts at ~613: below the fold** | 86; first row ~680 | 86 | Night band ≈ 534px: back, 40px name, cohort, ~200px deadline card, ~74px progress card (MD-24) |
| Admin decision queue | 0 (top bar not sticky); **first decision at ~459 (72%)** | — | — | 59 top bar + 52 Menu row + 236 band (count tabs wrap to 2 rows) + 32 + search |

**Not only mobile: desktop Chat.** The top bar is 71px (the 50px language track plus 2×10 padding, not the 64px in DESIGN.md), the band 111px + 24px gap, the toolbar ~64px and the composer 133px, plus 24px padding. That is **427px of chrome**: 293px of conversation at 1280x720 (the Playwright default and a common laptop, 41%), 341px at 1366x768 and 473px at 1440x900.

## 3. Findings

Classes: CD = Confirmed defect, MF = Missing functionality, UX = UX opportunity, TI = Technical inefficiency, SDC = Subjective design call.

| ID | Class | Sev | Screen | Evidence (file:line) | Why it matters | Recommended fix | Gain | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MD-01 | CD (deviates from DESIGN.md:124) | P1 | All unit tools, phone | `app-shell.tsx:261-292` renders the global top bar in workspaces; `app-shell.module.css:250-255`; `frontend-system.tsx:122-207` adds the band under it | DESIGN.md asks for **one** phone header: back, title button, segmented tools. The mockup's Chat phone header has no logo/language row (`direction-b.html:851-861`). Two Night layers are stacked today. | In workspaces under 768px, collapse `.topbar` to zero height while keeping its fixed `nav.globalNav` child (or move the nav out of the header element). Hide `.compactBrand` and `.utility`; move `LanguageSwitch` into the title menu (MD-02). | −59px | M |
| MD-02 | CD (deviates from DESIGN.md:123-124, 126, 148) | P1 | Chat, phone and desktop | Sessions are a pill on a paper toolbar row (`product-chat.tsx:350-458`). Study language is a radio group in "Study options" (`:459-506`). The band carries a separate "Module details" pill (`frontend-system.tsx:142-181`). | DESIGN puts the session switcher **in the band**, or on phone in the title button (unit title + session line) that opens the session menu, and the answer-language menu **in the composer**. Today that costs a whole 50px (phone) / 64px (desktop) row plus a 44px pill that wraps at 320. | Phone: make the title a `<details><summary>` containing the `<h1>` and the session line (a summary may contain one heading element), opening one menu: sessions, New session, Privacy settings, switch unit, institution and context, language (phone). Desktop: put the session pill in the band. Portal the Chat session list into a band slot, reusing the `AdminBandSlot` + `createPortal` pattern (`admin-workspace.tsx:70-98`, `decision-list-pane.tsx:75`). Move study language into the composer as a native `<select>` pill (CSS already exists at `product-chat.module.css:465-482`). | −50 to −94px phone; −64px desktop | M–L |
| MD-03 | CD (vs mockup) / TI | P1 | Chat | `textarea rows={2}` (`product-chat.tsx:624`) gives 72px; privacy row 27px (`.composerMeta`) | The composer is 117px of persistent chrome against a single-line dock of about 56px in the mockup (`direction-b.html:468`) | `rows={1}` + `field-sizing: content` (progressive) and the existing `max-height: 140px`. On phone, an icon-only Send (48px, `aria-label`) instead of an 84px labelled button. Privacy line at 13px/1.4 with no padding (stays below the composer per DESIGN). | −37px phone (117→~80); −24px desktop | S |
| MD-04 | MF | P1 | Chat (keyboard) | V-1, V-5: `layout.tsx` has no viewport export; `app-shell.tsx:75-118`; `app-shell.module.css:331-349` | Opening the keyboard re-lays out the whole shell: the bottom bar jumps to the header and the composer is centred with ~120px of transcript above it | Add `export const viewport: Viewport = { width: "device-width", initialScale: 1, interactiveWidget: "resizes-content" }` (no zoom limits). In the existing measure, set `data-keyboard="open"` when width < 768, a text field inside the workspace has focus, and the viewport shrank by more than 120px against the last no-keyboard height. While it is set, hide the bottom bar and the segmented row and **do not** flip to `page` flow for a keyboard-caused shrink. iOS ignores `interactive-widget`, so keep the visual-viewport branch. | Reading while typing ~120 → ~220px at 360x640; no layout jump | M |
| MD-05 | UX (changes DESIGN.md) | P2 | Unit tools, phone | `app-shell.module.css:265-276`; DESIGN.md:124, 183 | Inside a unit the bottom bar repeats destinations reachable through back (Subjects) and costs 76px under the composer | Hide the bottom bar when `data-layout="workspace"` on phone (or only in Chat), as native apps hide tab bars on detail screens. **Requires a DESIGN.md edit and founder approval.** | +76px for every unit tool | S (CSS) |
| MD-06 | UX | P2 | Materials, Studio, Quiz, phone | Flow choice `app-shell.tsx:98-101`; `.workspaceBody` overflow `frontend-system.module.css:169-175, 304-313` | The 193px header (281 with the bar) never scrolls away while reading excerpts, artifacts or questions, and it pins the browser toolbar (V-3) | Only Chat needs the docked pane. Choose `page` flow on phone when `data-study-tool !== "chat"`: the document scrolls, the header scrolls away and the browser toolbar can collapse. Quiz sticky progress and Studio's sticky Generate keep working with document scroll. | Up to +193px (+~56 browser toolbar) while reading | S–M |
| MD-07 | CD | P2 | Unit band, 320px and Arabic | `.subjectHeader > div { flex: 1 1 11rem }` + summary (`frontend-system.module.css:262-292`); segment labels `frontend-system.tsx:100-105` | At 320 the "Module details" pill drops to its own 44px row (band 186px). Long titles add 27px per line. The Arabic "مصادر المذاكرة" probably wraps the segmented row at ≤360 (+46px), which flips Chat to `page` flow. | Resolved by MD-02 (the pill disappears). Shorten the Arabic Materials segment label (for example "المصادر") so four segments fit at 320 (DESIGN: wrap only under enlarged text). | −52 to −98px | S |
| MD-08 | UX | P2 | Chat, first visit | `product-chat.tsx:71-80, 113-124, 507-522` | The tip says "Click a citation below an answer" while no answer exists, sits in the persistent chrome region and costs 68px; on a 360x640 phone it flips the flow | Render it once, inline, under the first answer's citation row. Use "Select" or "Tap" wording. Keep the same seen-flag. | −68px first visit | S |
| MD-09 | UX (duplicate navigation) | P2 | Chat, Studio | "Module sources" link `product-chat.tsx:449-457, 477-485`; `product-studio.tsx:666-674` → `base/sources`, the same library as the **Materials** segment one row above | Two adjacent routes to one destination. Exact evidence is already one tap away through citation chips. | Remove from Chat (the citation dialog links to evidence details). In Studio, keep "Supporting passages" (dialog) and drop the footer link. | Frees the toolbar (with MD-02); −~77px Studio footer | S |
| MD-10 | UX (duplicate functionality) | P2 | Chat answers | `chat-exchange.tsx:156-189`: citation pill (opens a dialog that has "Open evidence details", `product-chat.tsx:259-264`) + "Inspect evidence" link (same evidence page, same icon) + "Report example" + "Shared/Private" label | On phone this row wraps to 2–3 rows of 44px pills (~100–150px **per answer**). Two controls lead to the same evidence. | Keep the citation chips and the evidence line (DESIGN). Drop "Inspect evidence" (it lives in the dialog). Make "Report" a quiet text link at the row end. Show the sharing label only when the exchange's mode differs from the current setting. | −50 to −100px per answer | S |
| MD-11 | TI | P2 | Chat, phone | `.history > div { position: fixed; inset-block-start: 220px; max-height: 60dvh }` (`product-chat.module.css:672-678`) | Magic number: at 360x640 the Sessions pill spans y≈193–237, so the menu covers its lower ~17px. 220 + 384 = 604 > 567, so the menu runs under the bottom bar (z 20 < 30). It breaks with any header height change. | Anchor the menu to its summary (absolute, `inset-block-start: 100%`) and cap it with `dvh − header − bar`; moot once MD-02 moves it into the header | correctness | S |
| MD-12 | TI | P3 | Workspace, `page` flow | `app-shell.module.css:242-246` vs `331-349` | In `page` flow the nav is static in the header, but 76px of bottom padding remains as blank space (visible under the composer while typing, V-5) | `.shell[data-workspace-flow="page"] { padding-block-end: env(safe-area-inset-bottom) }` | −76px dead space | S |
| MD-13 | TI | P3 | Shell | `.topbar` padding 10 + 50px language track (`app-shell.module.css:9-21`; `frontend-system.module.css:194-217`) | The desktop bar is 71px, not DESIGN's 64px; the phone bar is 59px, not the mockup's 52px | `padding-block: 7px` on desktop and 1px on phone, or a fixed `block-size` | −7px | S |
| MD-14 | TI | P3 | Chat, Studio CSS | Unused: `.intro` (`product-chat.module.css:510-514`), `.evidenceMargin` (`:521-537, 602-606`; never rendered), `.artifactTypes` (`product-studio.module.css:59-114, 402-404`; Studio uses a `<select>`) | Dead rules hide the real layout contract from implementers | Delete | — | S |
| MD-15 | CD | P2 | Subjects | `.content { gap: 64px }` on phone (`study-shelf.module.css:450-454`) exists for the Study view's resume overlap but also applies to Subjects. `[data-view="subjects"]` keeps 48px bottom padding (`:19-22`). A visible h2 "Modules" sits under h1 "Your modules" (`study-shelf.tsx:162-166, 360-361`). | About 110px of empty or duplicate space before the search and list; only ~2 rows visible at 360x640 | Use a Subjects-specific gap of 24 and band bottom of 24 on phone. Visually hide the h2 (keep it for structure) or put the search directly under the h1. | −~110px | S |
| MD-16 | UX | P3 | Subjects | Unconditional "Ready" pill on every row (`study-shelf.tsx:414-416`) | A constant label carries no information | Remove it, or show only exceptional states | −noise | S |
| MD-17 | UX | P2 | Study Shelf | "Academic settings" link under the context line (`study-shelf.tsx:176-183`; 44 + 10px); real-mode resume note "Continue your newest open Chat conversation. Other tools are not listed here yet." (`:226-249`) | Both sit before the one next action. The note explains a system limitation, not a student need. The CTA sits at ~530–553px of the 567 visible (worst case cut off). | Make the academic context line itself the settings link (one 44px target). Drop the limitation note (the mockup shows only "Last asked …"). | −~100px | S |
| MD-18 | SDC | P3 | Study Shelf | "Browse all subjects" (`study-shelf.tsx:304-311`), with every unit already shown as a cover and Subjects in the bottom bar | Duplicate navigation, but it is in the approved mockup (`direction-b.html:727`) | Keep on desktop; hide on phone where the bottom bar has Subjects. Founder call. | −44px phone | S |
| MD-19 | UX | P2 | Materials | Every row repeats "Available for learning tools" (`material-library.tsx:83-90`; own 28px line on phone, `product.module.css:781-784`) and "Processed excerpt only. Full file reading…" inside each excerpt (`:96-100`). Synthetic caption "These are sample materials…" (`evidence.tsx:79-90`). | Status that is the norm is noise. Per-row repetition costs ~36px per row, so ~1.4 rows are visible at 360x640. | Show the pill only for the exceptional (inactive) state. Say the excerpt limitation once above the list. | −36px/row | S |
| MD-20 | UX | P2 | Studio, phone | ~650px configuration form before the result (`product-studio.tsx:213-400`) with three captions (`:292-302, 374-384, 393-400`). "Your artifact" header (`:405-416`; ~66px with border and margin) repeats the output's own title. | On phone the result, which is the point of the screen, starts about 1.8 screens down | When an artifact exists on phone, show the result first and collapse the settings into a disclosure ("Summary · English · Upper trunk injury"). Merge captions into one. Put the language pill beside the output title and visually hide "Your artifact". | Result in the first viewport | M |
| MD-21 | UX | P3 | Quiz | Strip "Answered: 0 / 6 · Unanswered: 6" + "Untimed" (`quiz-progress.tsx:19-26, 76`) duplicates "Medium · Untimed" just above it (`quiz-attempt.tsx:61-72`). "Use default setup" is a second button next to Start (`quiz-setup.tsx:186-193`). | The sticky strip wraps to ~68px; "Unanswered" is derivable | Strip: "0 of 6 answered" + timer only. Make "Use default setup" a quiet link. | −~20px sticky | S |
| MD-22 | UX | P2 | Settings, phone | h1 (`settings/page.tsx:75`) + summary card with name, role and Sign out (`account-layout.tsx:38-48`; `student-account.module.css:363-396`) + return link (`:397-406`) + 2×2 tab grid (`:486-504`). "Your account / Manage your account access." restates the tab (`account-settings.tsx:218-221`). | The first setting control sits at ~485px of 640 (76% overhead). The name also appears in the bottom bar. | Name and role as one subtitle line under the h1 (no card). Sign out inside "Identity and access" next to Reset password. Return link as a quiet inline link. Tabs as one row with short labels ("Appearance", "Academic", "Privacy", "Access"), wrapping only under enlarged text. | −~150px | M |
| MD-23 | CD (deviates from DESIGN.md:161) | P2 | Batch Leader shell | Nav label "Latest submissions" (`app-shell.tsx:172-176`); DESIGN IA says "History" | The label wraps, so the bar grows to ~86px and exceeds its 76px reserve | Nav label "History" (the page h1 may stay "Latest submissions") | −13px persistent | S |
| MD-24 | UX | P1 | Batch Leader campaign intake, phone | Band = back + h1 at 40px + cohort + deadline card (h2, value, time left, "Assignment and campaign dates" disclosure) + progress card (`collection-flow.tsx:69-97`; `collection-deadline.tsx:97-115`; `collection.module.css:18-34, 96-104, 820-829`) | ≈534px of band: at 360x640 the first request starts below the fold. Leaders work on phones (DESIGN.md:13). | Phone facts row: "Due Thu 23 Oct, 23:59 · 3 days left" plus "2 of 5 sent" with a thin bar. Move the dates disclosure under the band. Campaign name at section-title scale (≈26–30px) on phone. | −~220px | M |
| MD-25 | UX | P3 | Batch Leader history and intake | "Processing and review are separate…" appears in the received notice (`collection-flow.tsx:102-112`) **and** on every RECEIVED record (`leader-home.tsx:147-154`). History stacks h1 + intro + h2 + helper (`leader-home.tsx:103-111, 309-322`). | DESIGN requires the meaning ("received is not processed") but not its repetition | Say it once per view. Drop the band intro paragraph on History. | −40–80px | S |
| MD-26 | UX | P2 | Admin, phone | Menu as a second Night row (`app-shell.tsx:294-323`; `app-shell.module.css:208-226`, 52px). Five count tabs at `min-width: 5.25rem` wrap to 2 rows (`admin.module.css:122-150, 998-1012`, ~130px). | The first decision starts at ~459px of 640 | Put the Menu summary in the top-bar row (logo · Menu · language). Fit five compact count tabs in one row (number above a short label, `min-width: 0`, flex 1); wrap only under enlarged text. | −~115px | M |
| MD-27 | SDC (DESIGN.md:42) | P3 | Chat, Studio, Quiz, Materials (hosted) | "Try a supplied sample question. Replies are fixed examples." (`product-chat.tsx:563-573`), "Simulated stream…" (`:591-596`), "Fixed examples… cleared on reload" (`product-studio.tsx:393-400`), Quiz intro (`quiz-setup.tsx:48-53`), "Simulated score… illustrative only" (`quiz-attempt.tsx:102-107`), Materials caption (`evidence.tsx:85-88`). Only the Shelf and shell check `useHostedSynthetic`. | DESIGN: the hosted simulation uses "identical ordinary presentation… no extra explanation"; "sample" labels stay only where safety needs them | Founder decision on which labels are safety-required. Hide the rest when hosted. Keep the local service-boundary line. | 20–60px per screen | S |
| MD-28 | CD (DESIGN.md:126, 146; cross-reference) | P3 | Chat source excerpt, phone | `product-dialog.module.css:1-11, 67-76`: a centred modal with 48px margins | DESIGN says a phone bottom sheet | Hand to the evidence/interaction audit | — | M |
| MD-29 | CD + UX | P1 | Chat, **desktop** | §2 desktop paragraph: 71 + 135 + 64 + 133 + 24 = 427px | 293px of conversation at 1280x720: the founder's complaint holds on laptops | MD-02 (−64), MD-03 (−24), MD-13 (−7), band gap 24→12 (−12). Optionally move the band's context caption into the title or details menu (−22). | 293 → ~400–422px at 1280x720 | (with MD-02/03) |

## 4. Recommended changes, ranked by impact

Each item: files and selectors, expected px, risks, affected tests, DESIGN.md position. Every item is a **material UI change** and needs founder approval of the rendered candidate (`Approved commit:`).

### R1. Chat and unit phone header as DESIGN.md describes (MD-01, MD-02, MD-07, MD-29)

- **Files:**
  - `app-shell.tsx` / `.module.css`: under 768px with `[data-layout="workspace"]`, zero the `.topbar` box, hide `.compactBrand` and `.utility`, and keep the fixed `nav.globalNav`. Alternatively render the nav outside `<header>` so hiding the header cannot hide the nav.
  - `frontend-system.tsx` / `.module.css`, phone variant: row 1 = back (44) + title `<details>` whose `<summary>` holds the `<h1>` and the session line. Row 2 = segmented control. The menu holds sessions, New session, Privacy settings, switch unit, institution and context, and the language switch.
  - Desktop: the session pill replaces the "Module details" pill position in the band; details move into the same menu.
  - `product-chat.tsx`: portal the session list into a band slot (AdminBandSlot pattern). Remove `.sectionHeading` controls; keep the sr-only `h2`. Move `ChoiceGroup` "Study language" into `.composerTools` as a `<select>` named "Answer language".
- **Gain:** phone header 193 + 50 → ~124px (−119 at 360/390, −171 at 320). Desktop −64px.
- **Risks:**
  - a11y: the title button needs `aria-haspopup` semantics. A native `<details>` keeps Escape handling (already implemented) and focus return.
  - RTL: the back arrow mirrors; the logo never shows here.
  - 200% text: `page` flow must still trigger, so keep the measure; the title row must wrap, not clip.
  - The language switch moves one level deep on phone inside units.
- **Tests:**
  - Selectors are centralised: `openSessionTools` (`tests/e2e/support/session.ts:122-129`), `studyOptionsSummary` / `openStudyOptions` / `b07SourcesName` / `b07DetailsName` / `b07SwitchName` (`tests/e2e/support/demo.ts:27-52`).
  - Geometry: `study.layout-matrix.spec.ts:30-125` (Sessions and options on one row, sources visible, sessions pill styling), `chat.spec.ts:358-560` (T23 journey: Study options and Module details steps; the three assertions stay valid and get easier), `chat.spec.ts:640-660` (Study language radios).
  - `expectLanguageControl` (`tests/e2e/support/layout-matrix.ts:141-176`) at phone widths inside units.
  - The "Sessions and privacy" accessible name is referenced in 6 files; keep it to limit churn.
- **DESIGN.md:** conforms to lines 123-124, 126 and 148. One clarification is needed: line 172 places the language switch "in the Night bar"; add "on phones inside a unit, in the title menu".

### R2. Compact composer (MD-03)

- **Files:** `product-chat.tsx:619-701`. `product-chat.module.css`: `.composer textarea` adds `field-sizing: content` and keeps `max-height: 140px`; `.composerTools > button` becomes icon-only on phone with `aria-label`; `.composerMeta` gets font 0.8125rem, padding 0 and row gap 2.
- **Gain:** −37px phone, −24px desktop.
- **Risks:**
  - `field-sizing` is Chromium-first; elsewhere the field stays one row and scrolls, which is acceptable. A tiny `input` handler can grow it if wanted.
  - Keep Enter-to-send and Shift+Enter.
  - The privacy line must stay ≥4.5:1.
- **Tests:** `study.layout-matrix.spec.ts:113-122` (privacy note ≥14px and weight ≥600: relax to 13px or keep 14px), `chat.spec.ts:1680-1690` (meta text), `chat.spec.ts:1272` (send `boundingBox`).
- **DESIGN.md:** conforms (Composer row, line 148; mockup).

### R3. Keyboard-aware Chat (MD-04, MD-12)

- **Files:**
  - `src/app/layout.tsx`: add the `viewport` export (V-1).
  - `app-shell.tsx:69-146`: track the last no-keyboard height; set `data-keyboard`; exclude a keyboard-caused shrink from the `page`-flow decision.
  - `app-shell.module.css`: `[data-keyboard] .topbar .globalNav`, `[data-keyboard] .subjectNav { display: none }` (phone only), and reset `padding-block-end` in `page` flow and keyboard state.
- **Gain:** reading area while typing ~120 → ~220px at 360x640, with no layout jump.
- **Risks:**
  - `resizes-content` also resizes every other page when a field is focused (Settings, auth, intake). This is generally better but needs a pass on those forms.
  - iOS still uses `resizes-visual`, so the visual-viewport path must keep the composer visible. Verify on iOS Safari.
  - Hidden controls must not hold focus (`display: none` handles it).
  - Never hide on desktop or with a hardware keyboard: gate on width < 768 and a measured shrink.
- **Tests:** no current test simulates a keyboard. Add one that focuses `#message` and shrinks the viewport height at constant width, then asserts no `page` flip, the composer is visible, and one scroll owner. The T23 journey is unaffected.
- **DESIGN.md:** consistent with line 185 ("sticky controls never cover focused content"). Add one line describing keyboard state.

### R4. Batch Leader phone intake and nav label (MD-24, MD-23, MD-25)

- **Files:** `collection-flow.tsx:69-97`, `collection-deadline.tsx`, `collection-progress.tsx`, `collection.module.css:18-34, 96-104, 820-829` (phone facts row; dates disclosure moved below the band); `app-shell.tsx:172-176` ("History").
- **Gain:** −~220px band; −13px persistent bar. The first request moves into the first viewport.
- **Risks:**
  - The deadline must keep its accessible name and "Cairo time".
  - The time-left status must stay a live region if it is one today.
  - Arabic date strings are longer; allow wrapping.
- **Tests:** `leader.layout-matrix.spec.ts:159` and `rtl.spec.ts:419` (navigation names "Latest submissions"); `leader.layout-matrix.spec.ts` and `rtl.spec.ts` ("Assignment and campaign dates").
- **DESIGN.md:** the label fix conforms (line 161). The band composition has no mockup (line 128), so it needs founder approval only.

### R5. Non-Chat unit tools scroll the document on phone (MD-06)

- **Files:** `app-shell.tsx:98-101` chooses `page` when the tool is not Chat (pass `data-study-tool` up, or read it from the DOM) at width < 768; `frontend-system.module.css:304-313`.
- **Gain:** the 193px header scrolls away while reading, and the browser toolbar can collapse (~+56px on Android Chrome).
- **Risks:**
  - `useKeyboardScroll` region logic (`frontend-system.tsx:22-62`) expects `.workspaceBody` to scroll; keep it inert when it does not.
  - Quiz `scroll-padding-block-start: 8rem` should move to `html` in this mode.
  - Studio's sticky Generate band works against the viewport.
- **Tests:** `studio-quiz.spec.ts:700-726` already expects `page` under 200% text; `chat.spec.ts:585-637` (Studio "owners: 1" stays true with the document as sole owner).
- **DESIGN.md:** no conflict.
- **Option R5b (evaluate in the rendered pass):** Chat on document scroll with a sticky header and a sticky dock, the structure the mockup uses (`direction-b.html:435, 467`). It frees the browser toolbar in Chat too, but changes T23's model, and anchors (`#exchange-N`) need `scroll-padding-top`.

### R6. Hide the bottom bar inside unit workspaces on phone (MD-05)

- **Files:** `app-shell.module.css` phone block: `.shell[data-layout="workspace"] .topbar .globalNav { display: none }` and `padding-block-end: env(safe-area-inset-bottom)`.
- **Gain:** +76px in every unit tool. With R1+R2, Chat reading at 360x640 goes from 184 → ~416px.
- **Risks:**
  - Study and profile are reached via back → Subjects → bar, one extra step.
  - Tests that click bottom-bar links from inside a unit run at the default desktop viewport, so they are unaffected (`studio-quiz.spec.ts:412, 539, 567`; `sources-evidence.spec.ts:1443, 1618`). Phone-width chat geometry (`chat.spec.ts:456-461, 619-626`) already handles a non-fixed nav.
- **DESIGN.md:** **conflicts** with lines 124 ("in Chat the composer docks above it") and 183. Needs a DESIGN.md edit and founder approval before implementation.

### R7. Answer and Chat declutter (MD-08, MD-09, MD-10, MD-11)

- **Files:** `chat-exchange.tsx:156-189`; `product-chat.tsx:449-457, 477-485, 507-522`; `product-chat.module.css:195-221, 672-678`; `product-studio.tsx:666-674`.
- **Gain:** −50 to −100px per answer on phone; −68px on first visit; correct menu anchoring.
- **Tests:** "Inspect evidence" (`chat.spec.ts`, `chat-history.spec.ts`, `sources-evidence.spec.ts`, `hosted-synthetic-login.spec.ts`), "Report example" (`chat.spec.ts`, `sources-evidence.spec.ts`, `study.layout-matrix.spec.ts`), "Got it" (`chat.spec.ts`, `sources-evidence.spec.ts`, `student-entry.spec.ts`, `support/layout-matrix.ts:124-130`), `b07SourcesName` users.
- **DESIGN.md:** conforms (line 126: inline citation chips and an evidence line). Report has no DESIGN placement; keeping it quiet is fine.

### R8. Page-header stacks on Settings, Subjects, Shelf and Admin (MD-22, MD-15, MD-16, MD-17, MD-18, MD-26)

- **Files:**
  - Settings: `account-layout.tsx`, `account-settings.tsx`, `student-account.module.css:363-506`, `settings/page.tsx:75`.
  - Shelf and Subjects: `study-shelf.tsx:156-249, 304-311, 360-378, 414-416`; `study-shelf.module.css:19-22, 450-454`.
  - Admin: `app-shell.tsx:294-323`, `app-shell.module.css:208-226`, `admin.module.css:122-150, 998-1012`.
- **Gain:** Settings −150px; Subjects −110px; Shelf −100px; Admin −115px (first content).
- **Risks:**
  - Settings tabs keep roving focus (`account-layout.tsx:71-91`).
  - The admin count numbers must still match the list (DESIGN line 149).
  - Sign out must stay one obvious step.
- **Tests:** "Account sections" (`support/shared-screens.ts`), "Sign out" (11 files: keep the accessible name), "Academic settings" (`rtl.spec.ts`, `settings-account.spec.ts`, `student-entry.spec.ts`, `support/demo.ts`, `support/shared-screens.ts`), "Browse all subjects" (`student-entry.spec.ts`, `hosted-synthetic-login.spec.ts`, `support/demo.ts`), "Find a decision" (`admin.spec.ts`), `admin.layout-matrix.spec.ts` (menu and nav).
- **DESIGN.md:** compositions without a mockup (line 128). MD-18 touches the mockup, so it is the founder's call.

### R9. Tool-level declutter (MD-19, MD-20, MD-21, MD-27) and technical cleanups (MD-12, MD-13, MD-14)

- **Gain:** about 36px per material row; the Studio result reaches the first viewport; ~20px off the Quiz strip; 7px off the shell.
- **Tests:** "Available for learning tools" (`sources-evidence.spec.ts`), "Fixed examples" and "Your artifact" (`studio-quiz.spec.ts`, `support/shared-screens.ts`), "Unanswered" (`studio-quiz.spec.ts`), "Use default setup" (`rtl.spec.ts`), "Simulated stream" (`support/session.ts:117`).
- **DESIGN.md:** MD-27 needs a founder decision under line 42. The rest conform.

### Not recommended now

- **Scroll-aware auto-hiding header in Chat:** after R1+R2 (and R6) the static budget reaches 53–65% reading. Auto-hide adds motion that DESIGN.md:187 does not provide for, causes layout shift while reading, and risks the "sticky controls never cover focused content" rule. Revisit only if the rendered pass still shows a deficit.
- **Floating action buttons:** no screen has a single dominant repeated action that a FAB would serve better than the docked composer, the Night Resume button or the sticky Generate.

### Expected Chat reading area

| Viewport | Today | After R1+R2 (DESIGN-conformant) | + R6 (DESIGN change) |
| --- | --- | --- | --- |
| 360x640 | 184px (29%) | ~340px (53%) | ~416px (65%) |
| 390x844 | 388px (46%) | ~544px (64%) | ~620px (73%) |
| 320x720 | 212px (29%) | ~420px (58%) | ~496px (69%) |
| 1280x720 desktop | 293px (41%) | ~400–422px (56–59%) | n/a |

## 5. Element-by-element justification

The seven questions are condensed into four columns. **Need** covers why the element exists, which user need it serves and whether the workflow requires it. **Placement / component** covers whether the position and component are right. **Simpler alternative / complexity** covers what could replace it and what it costs. The last column gives the verdict.

### 5.1 Shell, phone

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| Compact logo in the phone top bar | Brand and home; needed on Shelf, Subjects and Settings | Right outside units; inside units it stacks a second Night layer | Absent inside units (mockup) | **Keep outside units; remove inside units** (MD-01) |
| English/العربية switch (50px track) | Interface language; required by DESIGN | It sets the bar to 59px | A 44px single toggle (mockup `lang-btn`) outside units; in the title menu inside units | **Shrink / move** (MD-01, MD-13) |
| Bottom bar (3 targets) | Global navigation; required by DESIGN | Right on Shelf, Subjects and Settings; redundant inside units with back | Hidden inside units | **Keep; hide in units only with a DESIGN edit** (MD-05) |
| Profile avatar + name in the bar | Identity and settings entry | Good; ellipsis for long names | — | **Keep** |
| Leader label "Latest submissions" | History destination | It wraps, so the bar grows | "History" (DESIGN) | **Shrink** (MD-23) |
| Local `.simulation` line | Service boundary for local review (DESIGN) | Local only | — | **Keep**; subtract it from measurements |

### 5.2 Unit subject band (all unit tools)

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| Back link (sr label "Subjects") | Hierarchical exit; required | Good; same destination as the bottom-bar "Subjects" | — | **Keep** (it becomes the only exit if R6 lands) |
| `h1` unit title (26px phone) | Current subject; required | Good | Inside the title `<summary>` with the session line | **Merge** into the title button (MD-02) |
| Context caption (program · level · term) | Orientation; hidden on phone, 22px on desktop | Desktop band | In the title or details menu | **Progressive-disclose on desktop** (MD-29, optional) |
| "Module details" pill + menu (institution, context, switch unit) | Unit switching and context | A separate pill that wraps at 320 | Folded into the title-button menu | **Merge** (MD-02, MD-07) |
| Segmented Materials/Chat/Studio/Quiz | Local navigation; required | Good; the Arabic label is long | Shorter Arabic Materials label | **Keep; shrink the label** (MD-07) |

### 5.3 Chat

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| sr-only `h2` "Chat" | Heading structure | Fine | — | **Keep** |
| "Sessions" pill + menu (New session, Privacy settings, session list) | Switch and start sessions; required | DESIGN wants it in the band / title button, not a paper row | Title-button menu | **Move** (MD-02) |
| "Module sources" link (desktop) / inside Study options (phone) | Open the library | Duplicates the Materials segment | Citations + Materials | **Remove** (MD-09) |
| "Study options" disclosure (phone) | Wraps the sources link and study language | Exists only to hold two misplaced items | Language in the composer | **Remove** (MD-02) |
| Study language radio group | Answer language; required | DESIGN: an answer-language menu in the composer | Native `<select>` pill in the composer | **Move** (MD-02) |
| Citation tip + "Got it" | First-run teaching | In persistent chrome, before any citation exists; "Click" on touch | Inline under the first answer | **Move** (MD-08) |
| Empty state: icon, h3, explanation, 3 suggestions, caption | First question and examples | Fine; the caption is hidden on phone already | Drop the explanation sentence in hosted mode | **Keep; trim** (MD-27) |
| Question bubble + "Sample question" label | Question; the label is a safety label (DESIGN line 120) | Good | — | **Keep** |
| Reply heading "UniMind" + kind pill | Answer status (Supported / Conflict …) | Good, compact | — | **Keep** |
| Unavailable / conflict disclosures inside the answer | Explain a gap or conflict; required by product rules | Progressive already | — | **Keep** |
| Citation pill | Evidence one tap away; required | Good | — | **Keep** |
| "Inspect evidence" link | Evidence page | Duplicates the citation → dialog → "Open evidence details" path | In the dialog only | **Remove** (MD-10) |
| "Report example" | Report an exchange; required | A full pill in the row | Quiet text link | **Shrink** (MD-10) |
| "Shared/Private" per answer | Records the mode an exchange used | Constant noise when equal to the current mode | Show only when it differs | **Progressive-disclose** (MD-10) |
| Streaming status | Feedback while waiting; required | Fine | — | **Keep** (hosted label wording: MD-27) |
| Composer: 2-row textarea | Input | 72px idle | 1 row, auto-grow | **Shrink** (MD-03) |
| Send button with label | Submit | 84px wide on phone | Icon-only + `aria-label` (mockup) | **Shrink** |
| Privacy line | Consent and transparency; required by DESIGN | Fine | Compact type | **Keep, shrink** |
| "Enter to send…" hint | Keyboard hint | Already hidden on phone | — | **Keep** |

### 5.4 Study Shelf and Subjects

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| h1 "Your Study Shelf" | Page identity | Good | — | **Keep** |
| Academic context line | Where am I studying | Good | Make it the settings link | **Merge** with the next row |
| "Academic settings" link | Change the path | A separate 44px row; Settings is in the bar | Context line as the link | **Merge** (MD-17) |
| Resume card: unit pill + tool | What to resume | Good (DESIGN) | — | **Keep** |
| Last question title, detail line | Recognition | Good | — | **Keep** |
| Resume note ("Other tools are not listed here yet") | Explains a limitation | Not a student need | — | **Remove** in real mode (MD-17) |
| "Resume Anatomy" button | The one next action; required | Good | — | **Keep** |
| "Modules" h2 + "Browse all subjects" | Section and full list | The link duplicates the bottom bar; all units are already shown | — | **Keep h2; link is the founder's call** (MD-18) |
| Covers: other-language name, title, count | Choose a subject | Good; the other-language name is `aria-hidden` decoration that costs a line per cover | Could drop on phone | **Keep** (subjective) |
| Subjects: h1 + h2 "Modules" | Duplicate headings | The visible h2 repeats the h1 | sr-only h2 | **Remove visually** (MD-15) |
| Subjects: 64px gap + 48px band padding | None (inherited from the Shelf overlap) | — | 24px | **Remove** (MD-15) |
| Search field | Find a unit; required | Good | — | **Keep** |
| Row "Ready" pill | None (constant) | — | Exceptions only | **Remove** (MD-16) |
| Row "Open" + arrow | Affordance | The word is sr-only on phone already | — | **Keep** |

### 5.5 Materials, Studio, Quiz, Evidence

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| Materials h2 (hidden on phone) + "Updated …, edition" | Freshness | Good | — | **Keep** |
| Synthetic "These are sample materials…" | Safety in the demo | Repeats the bubble and sample labels | Founder call for hosted | **SDC** (MD-27) |
| Per-row "Available for learning tools" | Availability | The norm repeated on every row | Exceptions only | **Remove except inactive** (MD-19) |
| Per-row "Show excerpt" disclosure | Read a passage | Good progressive disclosure | — | **Keep** |
| "Processed excerpt only…" per excerpt | Limitation | Repeated per row | Once above the list | **Merge** (MD-19) |
| Studio "Shape the result" form (type, purpose caption, focus, language, Depth and size, Generate) | Configure an aid; required | ~650px before the result on phone | Collapse once an artifact exists; result first | **Progressive-disclose** (MD-20) |
| Studio three captions | Explain replace rule, demo, example | Three separate notes | One line | **Merge** (MD-20, MD-27) |
| "Your artifact" header + language pill | Label the result | Duplicates the output title | Pill beside the title | **Merge** (MD-20) |
| Studio footer "Module sources" | Library | Duplicates Materials | "Supporting passages" | **Remove** (MD-09) |
| Quiz setup h2 + intro | Context | The intro is a demo caveat | Founder call | **Keep h2; intro SDC** |
| "Use default setup" button | Reset the form | Competes with Start | Quiet link | **Shrink** (MD-21) |
| Attempt h2 + "Medium · Untimed" | Context | Good | — | **Keep** |
| Sticky strip "Answered … · Unanswered … / Untimed" | Progress and timer; required | Duplicated facts | "0 of 6 answered" + timer | **Shrink** (MD-21) |
| Evidence/sources "Return to Chat" + note | Return with context; required | Good; it differs from the segment (keeps the anchor) | — | **Keep** |

### 5.6 Settings

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| h1 "Settings" | Page identity | Good | — | **Keep** |
| Account summary card (name, role, Sign out) | Identity and sign-out | A full card; the name is already in the bar | A subtitle line; Sign out in "Identity and access" | **Merge / move** (MD-22) |
| Return to Chat · unit | Resume study | Good intent; 44px + 24px margin | Quiet inline link | **Keep, shrink** |
| 2×2 section tabs | Section switching; required | 102px on phone | One row, short labels | **Shrink** (MD-22) |
| Privacy: notice + disabled choices + 3 explanations + retention notice | Transparency | Long for a feature that is not available in real mode | Explanations in one "How sharing works" disclosure | **Progressive-disclose** |
| "Your account / Manage your account access." | Restates the tab | — | Remove the sentence | **Remove** |

### 5.7 Batch Leader

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| Home band h1 + "Start with the requests that need your action." | Orientation | The sentence is mild filler | Drop it on History; keep on intake | **Keep / trim** (MD-25) |
| Campaign back link "Source intake" | Exit | Same destination as the current bar item; conventional | — | **Keep** |
| Campaign h1 at 40px | Campaign identity | Long names wrap 2–3 lines | Section-title scale on phone | **Shrink** (MD-24) |
| Deadline card (h2, value, Cairo time, time left, dates disclosure) | Deadline; required | ~200px on phone | One facts row + disclosure below | **Shrink / move** (MD-24) |
| Progress card | Requests sent; required | ~74px | Inline with the deadline | **Merge** (MD-24) |
| Received notice | Receipt is not processing; required meaning | Good once | — | **Keep** (once per view) |
| Per-record "File received. Processing and review are separate…" | Same meaning | Repeated per record | — | **Remove the repetition** (MD-25) |
| History h2 + helper "Latest submission per request…" | Scope honesty (DESIGN line 176) | Under an h1 that already says it | The helper alone | **Merge** (MD-25) |

### 5.8 Admin decision queue (phone)

| Element | Need | Placement / component | Simpler alternative / complexity | Verdict |
| --- | --- | --- | --- | --- |
| Top bar + language | Brand, language | Fine | — | **Keep** |
| Menu row (Menu + Account) | Labelled compact menu (DESIGN) | A second 52px Night row | Menu in the top-bar row | **Move** (MD-26) |
| h1 "Decision queue" | Identity | Good | — | **Keep** |
| Five count tabs (real counts) | Filter with counts; required | Wrap to 2 rows | One compact row | **Shrink** (MD-26) |
| "Find a decision" search | Find; required | Good | — | **Keep** |
| Detail back ("Back to list") | Phone list/detail; required | Good | — | **Keep** |

## 6. Tests that assert layout or copy affected by the changes

- **T23 journey** (`tests/e2e/demo/chat.spec.ts:358-560`): its three assertions (`visible >= 160`, one scroll owner, no horizontal overflow) stay valid and gain margin. Its steps that open "Study options" and "Module details" must follow R1.
- **Chat toolbar geometry and styling:** `study.layout-matrix.spec.ts:30-125`; helpers `support/demo.ts:27-52` and `support/session.ts:122-129`.
- **Composer:** `chat.spec.ts:1680-1690`, `study.layout-matrix.spec.ts:113-122`, `chat.spec.ts:1272`.
- **Language control:** `support/layout-matrix.ts:141-176`, used by the shelf, study, leader and admin matrices.
- **Studio phone geometry:** `chat.spec.ts:585-637` (`owners: 1`, sources link visible: it changes if MD-09 removes that link).
- **Quiz under 200% text:** `studio-quiz.spec.ts:700-726` (expects `page`).
- **Copy pins:** listed per recommendation in section 4.

## 7. DESIGN.md impact summary

| Change | DESIGN.md |
| --- | --- |
| R1 phone header, session switcher in band or title, language in composer | **Conforms** (lines 123-124, 126, 148). Add a clarification for the language-switch location inside units (line 172). |
| R2 composer | Conforms |
| R3 keyboard state | Conforms (line 185). Add a one-line rule. |
| R4 leader nav "History" | Conforms (line 161). The band composition needs founder approval. |
| R5 document scroll for non-Chat tools | Silent; conforms |
| R6 no bottom bar inside units | **Conflicts** with lines 124 and 183; needs an edit and approval |
| MD-27 hosted captions | Line 42 supports removal; founder decision on safety labels |
| Scroll-aware header (not recommended) | Would need a new motion rule (line 187) |

## 8. What the rendered pass must confirm

1. At 360x640, 390x844 and 320x720 with the hosted presentation (no `.simulation` line), EN and AR: measure the Chat reading region against the §2 table (184 / 388 / 212). Check whether Arabic at 360 already flips to `page` flow (MD-07).
2. The keyboard sequence on Chrome Android emulation (or a viewport-height shrink with `#message` focused): flip to `page`, nav moved into the header, 76px blank under the composer (V-5, MD-12).
3. The Sessions menu overlap at y = 220 and its run under the bottom bar (MD-11).
4. The leader bottom-bar height with "Latest submissions" (MD-23) and the position of the first request on the campaign page (MD-24).
5. Desktop at 1280x720 and 1366x768: the Chat reading height (MD-29) and the 71px top bar (MD-13).
6. Whether the pinned browser toolbar in pane flow (V-3) is noticeable on a real phone.
