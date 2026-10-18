# UniMind design contract

This is the canonical first-party visual and interaction contract. Product/security authority remains in the [master plan](docs/plans/poc-master-plan.md); acceptance and delivery remain in the [runbook](docs/runbooks/poc-execution-runbook.md). Surface briefs describe particular jobs and refer here for system rules.

**Current approved baseline:** Direction B "Cobalt" (WP03-T18, approved by Ahmed on 17 October 2026) for every product screen. Its [static mockup](planning/design/premium-overhaul/direction-b.html) is the visual source, its [brief](planning/design/premium-overhaul/README.md) holds the reasoning and content pack, and the [task record](planning/tasks/wp03-t18-premium-direction.md) holds the diagnosis and choice. The public landing follows variant L1 (see Public landing).

**History:** the earlier Open Folio refinement ([refined direction](docs/reviews/uiux-2026-10-04/refinement/refined-direction.md), [visual/motion system](docs/reviews/uiux-2026-10-04/refinement/design-system.md), [roadmap](docs/reviews/uiux-2026-10-04/refinement/roadmap-and-acceptance.md) and its [approval](planning/design/open-folio/approval.md)) and earlier contracts no longer govern visuals; existing behavior and safety remain binding as restated here. The rebuilds have landed: WP03-T19 (student), WP03-T20 (landing and access) and WP03-T21 (Batch Leader and admin). Product code uses the Cobalt tokens, and the Open Folio names survive only as aliases in `src/app/globals.css`. New work targets this file.

Dated approvals, receipts, candidates and audit-batch acceptances live in the [design approval history](evidence/wp03-product-shell/design-approval-history.md); accepted refinements recorded there remain binding where they refine a rule here.

## Principles

Make the next study action clear, keep academic context stable, and let material carry the page. Students study on 360–430px phones; larger screens support longer reading. Batch Leaders need reliable intake; admins need exact targets and consequences.

- The logo's two pages become the two planes of the interface: Night for orientation, Cobalt for the one next action, paper for everything else.
- Type works at extremes: very large titles against compact interface text, with real weight contrast.
- Boldness is spent on the Night and Cobalt planes and the folio curve, not on ornament.
- The answer is the largest thing in Chat and its evidence is one tap away. Evidence sits beside answers and artifacts; format and professor insight remain metadata in one authorized unit pool.
- One identity layer, persistent role navigation and one current subject context.
- Lists, forms and reading areas separate meaningful jobs. Containers do not decorate every label.
- Every control works through an existing seam or explains its specific prerequisite.
- Mobile-first student/leader flows and an admin list/detail layout that reflows.
- Size follows importance. No gradients, decorative glows, identical-card kits, generic grey shadows, invented metrics, repeated icon tiles or purposeless ornament. Content-specific delivery and evidence transitions follow the motion rules below.

## Brand and copy

The fixed fingerprint is the name UniMind, the Open Folio logo, the slogan and the blue family. Use exactly these two lines:

```text
Study deeper
Go further.
```

Keep this exact slogan in English; translate surrounding copy. Replace historical app taglines. Use it in the public hero.

Brand dependency: `planning/design/unimind-logo/open-folio-kit/` (Night `#0c1823`, Paper `#ecf3f9`, Cobalt `#3977f7`; lettering drawn from Manrope 650). Read `usage-guide.md` and `integration.md` before integration. One shared `Brand` component uses supplied full/compact/small and Light/Dark variants: the dark variant on Night planes, the light variant on paper or white. Preserve aspect ratio, palette and intrinsic proportions. Reserve dimensions; never mirror the logo in RTL (`dir="ltr"`, book left of the lettering). Wire supplied favicons/app icons through Next metadata and existing icon surfaces; no PWA functionality is implied.

Selected production files and guides are preserved under the canonical kit path; runtime copies live in `public/brand/unimind/`. Verify their hashes against the supplied manifest. Unrelated logo concepts remain untouched.

Use sentence case and concrete verbs: Open Module, Resume Anatomy, Upload files, Retry upload, View supporting material. Show metadata as structured fields, not middle-dot strings. No all-caps eyebrows, arrows appended to button text, monospace labels or decorative numbering; a real sequence such as onboarding may be numbered. Keep task IDs, provider internals and decision codes out of ordinary product flows.

Fixtures use realistic invented content (the brief's content pack), never test-like names; "sample" labels stay only where safety needs them. WP03-T19 replaces today's test-like synthetic names. Local synthetic review retains its service-boundary label. The hosted browser simulation uses identical ordinary presentation, with no mode button, banner, extra explanation or credential prefill; its exact approved login pairs select fixture services and ordinary sign-out discards the document-local state.

## Semantic color system

Components use semantic tokens; brand artwork keeps its supplied palette. Success/danger are status roles, not decorative accents.

| Token                          | Light                 | Dark                  | Role                                                                 |
| ------------------------------ | --------------------- | --------------------- | -------------------------------------------------------------------- |
| `--night`                      | `#0c1823`             | `#050b12`             | Orientation planes: top bar, bands, phone header, professor note     |
| `--night-2`                    | `#16283c`             | `#0f1d2c`             | Controls and current items on Night: segment track, session switcher |
| `--night-line`                 | `#243a51`             | `#1d3045`             | Quiet separators on Night                                            |
| `--night-control`              | `#5a7493`             | `#5a7493`             | Necessary control boundaries on Night                                |
| `--on-night`                   | `#ecf3f9`             | `#ecf3f9`             | Text on Night                                                        |
| `--on-night-2`                 | `#a6b5c7`             | `#a6b5c7`             | Secondary text on Night                                              |
| `--on-night-blue`              | `#8fb2ff`             | `#8fb2ff`             | Blue labels on Night, such as "Exam emphasis"                        |
| `--paper`                      | `#ecf3f9`             | `#0a1520`             | Canvas                                                               |
| `--surface`                    | `#ffffff`             | `#102030`             | Answer card, covers, panels, composer, chips                         |
| `--surface-2`                  | `#f3f7fb`             | `#0c1a28`             | Quotes, hover, current state in a comparison                         |
| `--cobalt`                     | `#3977f7`             | `#5a8dff`             | Brand planes and question bubbles (large text only), focus ring      |
| `--on-cobalt`                  | `#ffffff`             | `#050b12`             | Large text and focus ring on Cobalt                                  |
| `--action`                     | `#2a62e0`             | `#8fb2ff`             | Primary buttons, links, small blue text, selection                   |
| `--action-strong`              | `#2253c4`             | `#a9c4ff`             | Action hover and press                                               |
| `--on-action`                  | `#ffffff`             | `#0c1823`             | Text on action                                                       |
| `--tint`                       | `#e8effd`             | `#17294a`             | Citation and location pills, current bottom-bar item, proposed state |
| `--ink`                        | `#0c1823`             | `#ecf3f9`             | Text                                                                 |
| `--secondary`                  | `#4b5b6e`             | `#a6b5c7`             | Secondary text and metadata                                          |
| `--line`                       | `#d4dfeb`             | `#203347`             | Quiet separators                                                     |
| `--control`                    | `#7a8ca3`             | `#5d7189`             | Necessary control boundaries                                         |
| `--success` / `--success-tint` | `#236746` / `#e3f1e9` | `#91d2ad` / `#10291d` | Success status text and its background                               |
| `--danger` / `--danger-tint`   | `#a32723` / `#fbe9e7` | `#ffb4ab` / `#3a1714` | Danger status text and its background                                |
| `--mark`                       | `#d6e3fd`             | `#213a66`             | Highlight of the supporting words in a source quote                  |

Component tokens from the mockup: `--cover-current` (`#0c1823` / `#15304b`) for the current subject cover; `--seg-on` and `--seg-on-ink` (`#ecf3f9` with `#0c1823` light, `#24405e` with `#ecf3f9` dark) for the current segment and count tab; `--float` and `--float-up` for shadows (see geometry).

Normal and placeholder text ≥4.5:1; large text (≥24px, or ≥19px bold) ≥3:1; focus and necessary non-text boundaries ≥3:1. White on light Cobalt is about 4.1:1, so Cobalt carries text only at large sizes; buttons, links and small blue text use `--action` (white on it about 5.4:1). Use `--control` or `--night-control` for necessary boundaries; `--line` and `--night-line` are quiet separators and need not carry interactive-boundary contrast. The focus ring is 2px `--cobalt` with a 2px offset, switching to `--on-cobalt` on Cobalt planes. Measure actual pairs in both themes: tokens alone are not AA proof.

## Theme and academic persistence

The named student profile → Appearance (Account for other roles) offers **System / Light / Dark**, default System. System follows OS changes; explicit Light/Dark overrides them. Set root theme, `color-scheme` and `theme-color` consistently; `theme-color` is the Night plane (`#0c1823` light, `#050b12` dark) so mobile browser chrome continues the top bar. Current profiles have no theme field: use a validated, versioned local key and tolerate storage denial. Apply a minimal pre-paint bootstrap with a safe System fallback and scoped hydration handling. Do not add a settings table for appearance.

Academic context must survive future account sessions. Reuse the existing profile with the smallest validated catalog-preference extension, because no current field persists it. Stored preference is a hint; caller-scoped catalog and availability remain authority. Never create membership or release from a saved selection. The [persistence plan](docs/reviews/wp03-frontend-overhaul.md#persistence-and-backend-budget) owns proposed changes and denial proof. Demo account data still resets per document; neither sample nor demo proves real persistence.

Academic context persists in nullable `profiles.academic_context`, with own-caller catalog validation, column-specific grant and an invoker trigger. Real Shelf resume reuses the most recently created open chat session in the caller's current authorized cohort. It does not imply last-visited tracking or saved artifact progress. Failed/revoked reads omit the link. The synthetic runtime retains its existing document-local last study destination.

## Typography and geometry

Use self-hosted **Manrope** for Latin text (it is also the logo's lettering face) and **Noto Sans Arabic** for Arabic; no other faces. Interface locale and output language stay independent. Arabic has neutral tracking; Latin technical text is isolated with `bdi` or explicit direction. Use `Intl` dates/numbers.

| Role                      | Size / weight / leading / tracking                                           |
| ------------------------- | ---------------------------------------------------------------------------- |
| Landing display           | 94px desktop, 54px phone / 800 / 0.94 / −0.048em (landing slogan only)       |
| Page title (Shelf, queue) | 44–56px desktop, 40px phone / 800 / 1.0–1.05 / −0.04em                       |
| Subject band title        | 52px desktop / 800 / 1.0 / −0.04em; phone header 26px / 800 / 1.1 / −0.035em |
| Current subject cover     | 52px desktop, 34px phone / 800 / 1.0 / −0.04em                               |
| Resume question           | 34px desktop, 22px phone / 700 / 1.14–1.2 / −0.03em                          |
| Admin detail title        | 38px / 800 / 1.08 / −0.04em                                                  |
| Section title             | 26px desktop, 21px phone / 800 / −0.03em; panel heading 18px / 800           |
| Subject cover title       | 23px desktop, 19px phone / 800 / 1.1 / −0.03em                               |
| Question bubble           | 20px desktop, 19px phone / 700 / 1.3–1.35                                    |
| Row title                 | 16–17px / 700–800 / 1.3                                                      |
| Answer reading            | 17px desktop, 16px phone / 500 / 1.6 desktop, 1.5 phone                      |
| Body and controls         | 15px (16px large buttons) / 500 body, 600–700 controls / 1.5                 |
| Metadata                  | 13–14px / 500–600 / 1.4–1.5                                                  |
| Mobile navigation labels  | 13px / 600, 800 when current / inside 56px targets                           |

Arabic display uses Noto Sans Arabic 700/800. Arabic reading leading 1.7–1.8 and heading leading 1.5–1.55 use locale tokens, not scattered overrides. English tracking never below −0.04em, except the landing slogan at −0.048em.

Spacing steps: **4, 8, 12, 16, 24, 32, 48px**. Desktop page insets are at least 48px. Radius follows hierarchy: subject covers 24px (20px on phones); panels, dialogs, the answer card, professor note, list rows and admin detail 14px; buttons, fields, icon buttons and the segmented track 12px (segments 9px); quotes 10px; chips, pills, the composer, avatars and bottom-bar indicators fully round. Phone sheets round their top corners at 22px. Question bubbles use 24px (22px on phones) with a 6px corner at the bottom inline end.

**Folio curve:** the resume card and the current subject cover take the logo page's shape. The top edge slopes down toward the spine and the bottom edge curves with it; outer corners round at 24px, spine corners stay square. In the mockup the resume card is the right-hand Cobalt page and the current cover the left-hand Night page; use its `clip-path` paths as the reference. In RTL the curve mirrors with the layout, so the spine side follows the inline direction; only the logo artwork never mirrors. Never apply the curve to ordinary cards, buttons or panels.

**Elevation:** only what really floats: the docked composer, the desktop sources panel, phone sheets and other overlays. Light shadows are Night-tinted (`--float`: `0 22px 44px -20px rgb(12 24 35 / 0.42), 0 3px 10px -2px rgb(12 24 35 / 0.1)`; `--float-up` for bottom sheets); dark shadows use black plus a 1px `--line` ring. Everything else is flat: planes separate by color and list rows by `--line`.

Reading measure about 60–70ch. Night bars and bands run full width. Chat's conversation column is 760px with a 360px sources panel at the inline end; the admin queue is 560px beside a flexible detail; Studio configuration stays 264px. Intrinsic wrapping and `min-width: 0` protect important text.

## Surfaces and shell

- **Night planes** orient: top bar, subject band, Shelf and admin bands, phone header, professor note card and current subject cover. Controls on Night sit on `--night-2` or carry a `--night-control` ring.
- **Cobalt planes** hold the one next action (the Shelf's resume card) and the student's own question bubbles, with large text only. A button on a Cobalt plane is Night-filled. Where a blue plane carries small text (the resume page's note, the bubble's sample label), light theme fills it with `--action` and dark with `--cobalt` and `--on-cobalt` text, so every pair stays AA.
- **Paper and surface** carry everything else: paper is the canvas; surface holds the answer, covers, panels and composer; surface-2 holds quotes and hover; tint marks citations, locations, the current bottom-bar item and proposed states.
- **Desktop (768px and wider):** a 64px Night top bar with the logo, the role's labelled destinations (current on `--night-2` at 700 weight) and, at the inline end, the language control and one identity utility (student avatar opening the named profile; admin name and role).
- **Inside a curriculum unit:** a Night subject band under the top bar carries the large unit title, the session switcher (a `--night-2` pill naming the current chat session and opening a menu) and the segmented control for Materials, Chat, Studio and Quiz. Outside Chat the pill names the unit details. Its one menu holds the sessions, New session and privacy settings (Chat), then the institution and academic context and the unit switch. This one layer carries the current subject; do not stack a breadcrumb, title and tab row above content.
- **Phone (below 768px):** outside a unit, a 52px Night top bar with the compact logo and the language control. Inside a unit the subject band is the whole header: back (a directional arrow that mirrors in RTL), a title button (unit title and current session line, opening the same menu, which on phones also holds the interface language) and the segmented tools across the width; there is no logo row and no bottom bar, and back is the exit. Students and Batch Leaders get the three-target bottom bar on every other screen, on surface with a top `--line`, 24px icons in a pill that takes `--tint` when current, and safe-area padding; in Chat the composer docks at the bottom of the screen. Materials, Studio and Quiz scroll the document on phones, so their header scrolls away. Admin keeps a labelled compact Menu in the top bar.
- **Phone keyboard:** while a field in a unit has focus and the viewport has shrunk by more than 120px, the workspace is in its keyboard state: the segmented tools hide, the layout does not reflow into page scroll, and the composer stays docked above the keyboard (`interactive-widget=resizes-content`; iOS resizes only the visual viewport, which the shell follows).
- **Bands:** Night bands (Shelf, unit, admin, Batch Leader) sit in the shell's band slot, full width above the padded content, never through negative margins.
- **Study Shelf:** a Night band with the page title, academic line and earlier chats; the Cobalt resume card overlapping its inline end (below it on phones); then the subjects, the current one as the Night folio cover and the rest as surface covers showing only material count and freshness. Every value is real data; when one is unavailable, omit it.
- **Chat:** the question bubble at the inline end; the answer card as the widest, largest surface with inline citation chips and an evidence line (supported-by count and location pills); the professor note; follow-up chips that fill the composer; the docked composer with the answer-language menu and the privacy line under it (Enter sends only with a fine pointer; touch keyboards add a line and send with the button). Each answer has one evidence route: its citation opens the sources dialog or phone sheet, which links to the evidence details; Report is a quiet text action and the sharing mode shows only when it differs from the current setting. Sources open in the desktop panel or the phone sheet: title, format, location, Open source and the quote with its supporting words in `--mark`.
- **Admin decision queue:** a Night band with the title and count tabs whose counts are real and match the list; rows lead with the verb, then target, scope, state pill and waiting time; the detail shows verb and target, current → proposed state, consequence, readiness, the required reason and the recording action with its audit note.
- **Screens without a mockup** (onboarding, Subjects, Materials, Studio, Quiz, Settings, access pages, Batch Leader intake and history, admin resource pages) apply these surfaces and components. Their compositions are proposed and approved with the rendered candidate in WP03-T19 to T21.

## Shared components

| Component                         | Variants and behavior                                                                                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Brand`                           | Full/compact/small; supplied theme assets; dark variant on Night; never mirrored                                                                                                   |
| `AppShell` / top bar              | Night top bar or phone header plus bottom bar (none in a unit on phones); role destinations, one identity utility, locale, current location; band slot                             |
| `SubjectBand`                     | Unit title, session switcher (one menu) and unit `SegmentedControl`; on phones it is the header: back, title button, tools                                                         |
| `SegmentedControl`                | `--night-2` track; current segment on `--seg-on` with `aria-current`; wraps or stacks under enlarged text                                                                          |
| `Button` / action link            | Primary (`--action`)/secondary (`--control` ring)/quiet (action text)/destructive; Night variants on Cobalt and Night; 700 weight; pending label, disabled; anchors for navigation |
| `Field`                           | Native input/select/textarea/checkbox/radio; 1.5px `--control` border, 12px radius; label/helper/error and proper relationships                                                    |
| `Chip` / `CitationChip`           | Chip: full radius, `--line` ring, follow-ups and filters. Citation: numbered `--tint` pill, pressed fills `--action`; location pill pairs number with page or time                 |
| `Status` / `Notice` / `StatePill` | Neutral/success/warning/error; text plus icon, never color alone; status tints; polite updates                                                                                     |
| `ListRow`                         | Subject/material/submission/decision identity, useful metadata and next action; selected row on surface with a 2px `--action` ring                                                 |
| `ResumeCard`                      | Cobalt folio page: subject pill, session, last question, real time, Night button; at most one per view                                                                             |
| `SubjectCover`                    | Surface, 24px radius, title, material count and freshness; the current subject is the larger Night folio cover                                                                     |
| `ReadingSurface` / answer card    | Answer/artifact/processed material at reading size with inline citations and evidence line; no nested panel stack                                                                  |
| `SourcesPanel` / source sheet     | Desktop floating panel at the inline end, closable; phone bottom sheet; numbered sources with location, Open source and marked quote                                               |
| `ProfessorNote`                   | Night card: Cobalt play button, name, label in `--on-night-blue`, quote, duration; evidence metadata, not an answer mode                                                           |
| `Composer`                        | Docked round field with `--float`, one growing line, answer-language menu, `--action` send (an icon named Send on phones); 2px `--cobalt` focus ring; privacy line below           |
| `CountTabs`                       | Night band tabs with real counts and labels; selected on `--seg-on`; counts match the lists they filter                                                                            |
| `StatePair`                       | Current (`--surface-2`, `--line` ring) → proposed (`--tint`, `--action` ring); directional arrow mirrors in RTL                                                                    |
| `PageState`                       | Loading/empty/error/forbidden/stale/capacity/interrupted with specific recovery                                                                                                    |
| `ConfirmAction`                   | Exact target/state/consequence/reason/cancel/pending/stale/result where necessary                                                                                                  |

Consolidate overlapping `product-ui`, `frontend-system` and role controls incrementally using project CSS Modules and native semantics. Domain/application rules stay outside primitives. No new UI dependency or parallel preview-only product. Local line icons on a 24-unit grid with a 1.75 stroke (2 for check, send and back) render at 16, 20 or 24px for navigation/file/action identification; directional arrows may mirror in RTL, the brand must not. Where a visible shape is smaller than 44px, extend its hit area to 44px, as the citation chip does.

## Information architecture and flows

| Role         | Global navigation                                                  | Local experience                                                                                                                                  |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student      | **Study, Subjects, named profile**                                 | Start/resume study; searchable authorized units in Subjects; Materials, Chat, Studio, Quiz; scoped evidence/report/viewer; profile opens settings |
| Batch Leader | **Source intake, History, Account**                                | Assigned campaigns/invitation; mixed-file queue; upload/finalize progress; statuses/retry                                                         |
| Admin        | **Decision queue, Content, Academics, Access context, Operations** | Decisions; Sources/Campaigns; Catalog/Cohorts; existing assignment/access context; Jobs/Quality/Usage/Incidents                                   |

Global navigation lives in the Night top bar on desktop. Below 768px the student and Batch Leader destinations become the bottom bar and admin's become the labelled compact menu.

“Subjects” is the requested global destination. Inside it, configuration still renders **Modules** for Medicine and **Subjects** elsewhere. Do not rename the domain.

Anonymous first-time entry sees the landing page. Authenticated entry routes by verified database-backed role after account/consent checks. Invitation/deep-link destinations remain validated. No repeated role chooser or client role as authority.

Student onboarding presents one academic question at a time as native radio choices, followed by an editable summary before saving through the existing authorized seam. Back retains choices; changing a parent clears dependent choices. A single named profile opens settings and replaces the separate Account destination and Student identity item. Settings retain existing academic editing in an independent view. Study offers a start action or an available recent-study destination; Subjects owns the searchable current-period catalog. No progress or additional history is invented. Unit→Materials→Studio→Viewer retains title, navigation and contextual return. Preserve scoped Chat history/drafts, six Studio types, quiz attempts/review and exact evidence/report binding.

The shared product shell offers a direct English / العربية switch with native buttons, an accessible name and a visible current state; in this direction it is a compact control in the Night bar rather than a large toggle (on phones inside a unit, in the title menu). It preserves route, query, fragment, draft and academic selection. Landing and the entire login/access flow retain their existing language controls.

Batch intake uses a native multiple-file picker and matching drop path. Infer format from bytes; infer requested item only when authorized scope/type uniquely match. Ask when ambiguous. Retain required source description/title and rights declaration. Each file owns state/key/progress/retry. **Uploaded/received is not processed/accepted/READY.** Add neither new formats nor processing infrastructure.

The implemented intake prefers a unique outstanding compatible request; a unique compatible replacement is the fallback. Multiple candidates require a choice. One active file uploads and finalizes at a time through the existing endpoint and action, without waiting for processing. A failed finalizer retains its receipt; Retry submission does not upload again. Adding files clears the rights checkbox. Queue drafts stay in document memory. History shows only the existing latest submission per request in currently assigned active campaigns; it does not claim to be an archive. Uploads, History, campaign and Account share the role shell, semantic tokens and unmirrored brand; campaign workspace maximum is 78rem.

Admin Decision queue leads with decisions; Content groups Sources/Campaigns; Academics groups Catalog/Cohorts; Operations groups Jobs/Quality/Usage/Incidents. Access context exposes only existing assignment/membership context through authorized seams: no invented user directory/editor. Preserve consequences, stale checks, readiness predicates, audit and distinct-principal confirmation. Financial/provider boundaries remain fail-closed.

## Responsive, accessible and state rules

- Prioritize 360–430px student/leader screens; retain the existing 320px reflow floor. Also review 768px and 1440px.
- Below 768px use three equal student/leader bottom targets with safe-area padding, except inside a unit workspace, where back is the exit. Admin uses a labelled compact menu, not five tiny targets, wherever its destinations do not fit as labelled text. The compact desktop rail is retired with the rail.
- Local unit navigation is separate from global navigation. Four destinations fit one segmented row; under enlarged text they wrap or stack, never clip. On mobile Materials is an explicit view; Studio/Chat/viewer use the full reading width and return to it.
- Use ≥44px touch targets, visible focus, skip links, landmarks, meaningful headings and native labels. No essential hover, drag or gesture-only action. Dialog focus returns to trigger; floating menus close with Escape (focus back on their summary), a press outside or focus leaving them; sticky controls (phone header, composer dock, bottom bar) never cover focused content.
- Theme/locale changes preserve input, selection and separate output language. Unit changes never mix sessions/artifacts across scopes.
- Routine control transitions use 120ms. Source panel and sheet reveals use 300ms, ≤10px and cubic-bezier(.22,1,.36,1); result delivery 280ms, ≤7px with the same easing. Native dialog enters in 180ms and closes in 140ms with noncommitting focus and focus restoration. Keep the existing user-triggered 240ms flashcard flip. Indeterminate feedback conveys actual work, never invented percentages; the loading-line specimen settles after two 1200ms passes. Reduced motion exposes identical states instantly. No forced smooth scrolling or whole-page entrance choreography. Direction B adds no motion of its own: its emphasis is in planes, type and the folio curve.
- Navigation text and its background change as one immediate palette when the top bar becomes the bottom bar or appearance changes. Do not interpolate through unreadable color pairs; preserve panel, source, result and press feedback.
- Loading keeps known context and announces status. Empty explains absence and allowed next action. Retry only when retryable; forbidden/expired states offer safe role-home exits. Interruption retains correct retry identity/draft. Stale admin actions refresh authority. Success uses text plus a non-color cue.
- Check long Arabic/English labels, mixed technical text, keyboard, 200% text and 320px reflow in both themes. Visual review, automated accessibility and security proof remain separate obligations.

## Public landing

Ahmed chose landing variant **L1 "The page answers"** on 17 October 2026, on its own, without the sample question bar of L2 below it. Its [mockup](planning/design/premium-overhaul/landing.html) (screens L1 and L1 phone) is the visual source. The earlier landing visuals (dimensional folio, blue demonstration surround, passive drift, 96px hero cap) no longer govern. WP03-T20 built it; its compositions below the hero were approved with that rendered candidate.

- **Stage:** a full-bleed Night hero in both themes (`--night`, deeper in dark). The top bar sits on it with the dark logo variant, the text links, the Arabic switch and a ringed Sign in.
- **Copy column (620px):** the exact slogan in white at the landing display size; one plain lede in `--on-night-2` naming the promise (ask about your own lectures in Arabic or English; answers only from your faculty's material, with the page they came from); a Cobalt Start studying button with white 19px 800 text (large text, so Cobalt is allowed); a quiet second link; three proof lines with Cobalt ticks, each a real product rule (approved material only, a page or timestamp behind every claim, says so when the material does not cover it).
- **Evidence stage:** a fixed white handout page (book face, slight tilt, real invented lecture content and page number) with Night-tinted depth. Overlapping its lower inline-start corner: the student's question as a Cobalt bubble in Egyptian Arabic, UniMind's answer card with numbered location pills, and the professor's exam-emphasis note as a Night card. The cited sentence on the handout carries the highlighter (`--cobalt` at 30% under the lower 60% of the line) and a numbered marker in the page margin that matches the answer's first pill. A visible label reads "Sample answer from invented lecture notes", next to a Replay control.
- **The one moment:** on first view the stage plays once: question (from 300ms), answer (1100ms, its text revealed in reading direction), page marker (2300ms), highlighter sweep (2700ms over 800ms), professor note (3500ms). Each element rises at most 10px over 420ms with the shared easing. Replay restarts it. Reduced motion shows the final composition with no movement. It never loops, tracks the pointer or blocks scrolling.
- **Phone:** the slogan at the phone display size, the lede, a full-width Start studying button, then the same moment stacked: question, answer, and a handout excerpt card with the highlighted sentence, its page and the sample label. The stage switches to this stacked composition by its own width (below 35rem, so enlarged text stacks too).
- **Playback:** the moment waits until the stage is first seen in a visible document (a page opened below the hero waits), pauses while offscreen or hidden, and then settles on the final composition with no running animation.
- **Below the hero:** a sample workspace that mirrors the product (Night subject band with segmented Chat, Studio and Quiz; Materials beside a working panel; invented Anatomy material; a visible sample footnote); an evidence section (a recording source card with its timestamp and a Night reply that says what the material does not cover); How it works as a numbered three-step sequence on white; a closing Night page with the folio's curved top edge, Create your account and Sign in; a quiet footer.

These landing rules stay binding:

- The landing leads with the exact two-line slogan and uses this file's tokens, type and components. A larger display scale is allowed there; landing materials do not redefine product tokens or alter the supplied logo artwork. A depicted printed handout may use a book face (the variants use Source Serif 4) because it shows course material, not interface.
- Any sample interaction (today Chat, Studio and Quiz) runs locally without generation, saving, private data or provider requests. The preview labels its sample content and limitations beside the working controls.
- Sample tabs wrap intrinsically under enlarged English/Arabic text. Preserve roving tab focus, source disclosure, flashcard state and quiz feedback. Sample-tool transitions keep 300ms and the shared easing.
- Decorative animation pauses offscreen or in a hidden document; reduced motion renders the static composition. No pointer tracking, scroll interception or animation dependency.
- Preserve 320px reflow, 200% text and RTL (neutral Arabic tracking, unmirrored logo). Shared product rules apply unchanged outside this landing scope.

**Access pages** (sign-in, registration, verification, consent, recovery; WP03-T20): the shell's Night bar with the dark logo and a segmented language switch. Wider than 1000px, an open-folio spread: a Night page with the folio's curved top edge (slogan, promise, three product rules) beside a white form page; narrower, the form page alone. Fields, the primary action, notices and the verification/consent step track use the Cobalt kit. Behavior, messages, validation, rights and consent text and the hosted-synthetic rules are unchanged.
