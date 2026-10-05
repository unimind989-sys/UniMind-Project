# Open Folio: reading and annotation

Proposed design contract, 5 October 2026. **Unapproved.** This extends the first “serious study desk” proposal. It does not replace canonical `DESIGN.md` or authorize production changes.

## Identity and composition

UniMind should be recognizable through the relationship between its navigation spine, subject index, reading surface and evidence margin. Recognition must survive removal of the logo. A blue button alone is insufficient brand identity.

Keep the supplied Open Folio mark unaltered and unmirrored, the UniMind wordmark, **Study deeper / Go further.**, the existing blue interaction accent and the Manrope/Noto Sans Arabic pairing. The slogan remains English in Arabic layouts. Use the folio geometry at meaningful boundaries: a small subject marker, a selected navigation notch and a source annotation. Do not repeat a book illustration on every panel.

The proposed dark navigation spine gives the application a deliberate edge and separates persistent identity from the task. Reading and operational content remain neutral. Dark mode retains that separation through two different dark planes rather than merely inverting light-mode colors. This is a change to the current shell and surface contract and requires founder approval.

| Composition             | Purpose                                      | Structure                                                                                                                     | Forbidden shortcut                                                                |
| ----------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Subject index           | Find an eligible unit                        | Typographic collection, small folio markers, meaningful readiness, canonical title/row navigation; academic context secondary | A grid of equal promotional cards or fabricated progress                          |
| Reading with annotation | Understand and inspect support               | Bounded transcript, persistent composer, claim-linked citation tokens, adjacent evidence margin                               | A generic chat bubble stream with detached source cards                           |
| Artifact workspace      | Configure and evaluate a result              | Compact configuration beside a document-shaped result; output language explicit; evidence attached to the result              | Showing a generated result by default to make an empty screen look richer         |
| Intake ledger           | Submit the right source to the right request | Effective deadline, visible request coverage, per-file destination/details/rights, truthful receipt stages                    | Large dropzone preceding hidden requirements                                      |
| Decision ledger         | Review an exact governed change              | Status-filtered queue, deliberate selection, target/scope/version, before/proposed state, reason and consequence              | Decorative metrics, initial destructive selection or a generic confirmation toast |
| Settings and forms      | Configure and recover                        | Section navigation and aligned field rows; helpers at the field; errors preserve drafts                                       | Making ordinary settings resemble a dashboard                                     |

## Color and surfaces

Existing brand and semantic colors stay. New values are confined to explicit structural roles. All values below are proposals, not edits to the production token file.

| Role                   | Light                 | Dark                  | Intended use                                                          |
| ---------------------- | --------------------- | --------------------- | --------------------------------------------------------------------- |
| Canvas                 | `#f6f7f8`             | `#1b1c1f`             | Task background; no gradient                                          |
| Reading paper          | `#ffffff`             | `#23272f`             | Chat, artifacts, selected record; dark changes from current `#232529` |
| Subtle surface         | `#eef0f2`             | `#2c313a`             | Secondary grouping and selected information                           |
| Hover                  | `#e6e9ed`             | `#353d48`             | A visible, local interaction response                                 |
| Navigation spine       | `#1d2939`             | `#141b25`             | Persistent role and navigation; new structural role                   |
| Spine text / secondary | `#eef2f8` / `#bdc8d6` | Same                  | Navigation remains legible in either theme                            |
| Annotation margin      | `#f1f4fa`             | `#202c40`             | Evidence outside the claim’s reading plane                            |
| Main text              | `#202124`             | `#eef0f3`             | Reading and headings                                                  |
| Secondary / muted      | `#535861` / `#626873` | `#bdc2cb` / `#a6acb7` | Metadata must remain readable                                         |
| Divider                | `#d9dde3`             | `#434b57`             | Noninteractive separation, not a control boundary                     |
| Control border         | `#777f8b`             | `#858d9a`             | Inputs and secondary action boundaries                                |
| Action blue / on blue  | `#2458b8` / white     | `#adc7ff` / `#152646` | Primary action and focus                                              |
| Annotation blue        | `#e8effb` / `#214f9f` | `#2b3c59` / `#b9d0ff` | Citations and selected control context                                |
| Success                | `#236746`             | `#91d2ad`             | Actual completion of the named stage                                  |
| Error                  | `#a32723`             | `#ffb4ab`             | Specific failure plus recovery                                        |

Depth has three jobs: the shell frames work; paper contains a reading or decision task; an overlay occludes the current task. Page sections and collections have no shadows. Dialog/toast elevation uses one soft shadow (`0 12px 40px` at low alpha) plus a boundary. Evidence uses placement and an annotation plane, not a glowing card. The margin’s 2 px top rule identifies a document annotation; do not spread accent borders to unrelated components.

## Typography, spacing and geometry

| Type role                | Desktop                           | Mobile                               | Treatment                                        |
| ------------------------ | --------------------------------- | ------------------------------------ | ------------------------------------------------ |
| Collection title         | 34 px / 1.18                      | 28 px / 1.18                         | Manrope 700; at most −0.035 em tracking          |
| Operational page title   | 30 px                             | 25–27 px                             | Less dominant than a public hero                 |
| Unit context             | 26 px                             | 22 px                                | Unit is visible without becoming a second hero   |
| Section / result heading | 20–24 px                          | 18–22 px                             | Task hierarchy, not arbitrary template sizes     |
| Reading text             | 16 px / 1.75–1.8                  | 15–16 px / 1.7–1.8                   | Approximately 60–68 characters per line          |
| Controls / dense rows    | 14–15 px                          | 14 px                                | 600–650 weight only for labels/actions           |
| Metadata                 | 13 px / 1.6                       | 12–13 px for short supporting labels | No tiny uppercase ornamental labels              |
| Arabic                   | Same role scale; Noto Sans Arabic | Same                                 | Normal tracking, headings 1.55, reading 1.75–1.8 |

The larger collection title is an intentional change from v1’s uniformly compact 28 px plan. Expression belongs at collection orientation; working context and controls remain economical. Typography should not make every page look like a landing page.

Spacing tokens: **4, 8, 12, 16, 24, 32, 48 px**. Use 24–32 between related work regions; 40 px desktop inset is an explicit composition value, not a new general spacing scale. Repeated row baselines and aligned field starts are more important than giving every panel equal padding.

Corners: 2–5 px folio/filter/status geometry, 8 px controls, 10 px contained reading/decision surfaces, 12 px dialogs. Pills are reserved for short state labels; primary buttons remain recognizably rectangular. Do not apply one large radius to every object.

Icons use a 24-unit viewBox, 1.75-unit stroke, round caps/joins, typically 22 px rendered. The prototype includes coordinated authored SVGs. Directional arrows mirror; file, account, source and brand marks do not. Icons must add recognition or direction, not decorate every text label.

## Navigation and responsive architecture

| Width / situation                    | Shell                                                           | Task adaptation                                                                                            |
| ------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Wide desktop                         | 192 px role-aware spine; main max 1140 px                       | Collection/context columns; reading/evidence split; configuration/result split; queue/detail split         |
| Narrow laptop                        | Same spine with 28 px inset and narrower auxiliary panels       | Preserve the main reading width and primary action; avoid three competing columns                          |
| 601–900 px tablet                    | 72 px compact rail with accessible full labels                  | Evidence becomes a controlled dialog; operations retain master/detail only while both are readable         |
| ≤600 px phone                        | 52 px identity/navigation bar and 60 px primary task navigation | One task column; evidence in modal; queue and details become separate views with an explicit Back action   |
| Phone Studio                         | Unit name and tool tabs; redundant breadcrumb omitted           | Generate appears in the first viewport; result follows configuration in normal scroll order                |
| Phone Intake                         | Effective deadline and all three request names remain visible   | Compact request grid before file selection; never hide requirements just to fit the action                 |
| Physical keyboard / zoom / landscape | Content scroll remains available                                | Viewport constraints must relax when keyboard/zoom leaves insufficient space; do not clip focused controls |

The prototype’s review toolbar consumes an additional 64 px desktop / 100 px phone. It is outside the proposed product UI. Measurements include it; screenshots do not conceal it.

Locale belongs to the navigation state, including brand-home links, dialogs, breadcrumbs and preview return links. Use logical CSS properties. Isolate filenames and opaque identifiers with `bdi` or explicit LTR direction. Artifact output language stays independent of interface language. Actual English output within an Arabic dark workspace is demonstrated in the concept evidence.

Role differences remain real. Students see study context; leaders see campaign/deadline/receipt context; both administrators see governance context. Account identity derives from the approved session in production. An account role never establishes which human founder is acting. Student-preview mode must retain Return to Admin and current scope.

## Shared component and state language

| Primitive / pattern          | Visual rule                                            | Interaction / truth rule                                                                                                              | Prototype coverage                                                        |
| ---------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Button                       | Primary, secondary, quiet and consequential variants   | 44 px main touch targets; hover, visible focus, press and disabled states                                                             | Working specimens and workflows                                           |
| Field                        | Label, input, helper and local feedback share one grid | Preserve drafts; associate error text; required before mismatch; native/server validation both retained                               | Form error/success specimens; production error association still needs QA |
| Status                       | Label + optional icon/dot, no color-only meaning       | Received, processing, ready, blocked and applied remain different states                                                              | Receipt and queue examples                                                |
| Notice                       | One boundary; semantic surface only when warranted     | Explain event, retained work and next valid action; use an appropriate live region                                                    | Success, error and needs-information                                      |
| Empty state                  | One task-specific sentence and permitted action        | Never manufacture progress, records or historical activity                                                                            | Chat, Studio, intake and history specimen                                 |
| Loading region               | Preserve title, scope and space needed for result      | Indeterminate status; cancel/retry when permitted; no invented percentages                                                            | Chat/Studio examples, state library                                       |
| Source annotation            | Citation token binds claim to excerpt/locator          | Exact exchange identity required; route fallback remains if existing adapters cannot supply the panel                                 | Fixed supported answer and excerpt only                                   |
| Dialog                       | Task title, readable summary, clear footer             | Native modal behavior in prototype; noncommitting initial focus, Escape and focus return                                              | Evidence and exact-change review                                          |
| Table/list                   | Status and next action precede secondary provenance    | Existing data only; accessible scroll or deliberate phone list/detail                                                                 | Queue; other resource families specified in roadmap                       |
| Artifact                     | Reading hierarchy plus source footer                   | Keep actual artifact-specific structure, not one generic output template                                                              | Summary and flashcard simulated; other four formats not simulated         |
| Account sections             | Narrow local section nav; aligned field rows           | Separate appearance, academic scope, privacy and identity; role-appropriate fields                                                    | Student/leader/admin/second-admin variants                                |
| Pagination / tooltip / toast | Small control family, same type and focus              | Do not add pagination without a real collection; essential information never lives only in a tooltip; toast supplements durable state | Toast specimen; pagination/tooltip not built                              |

## Motion specification

Motion must answer either “what changed?” or “where did this information come from?”. The prototype implements the citation reveal, card content turn, local result/feedback entry, control feedback and modal transitions. Timing values below are design prescriptions; no frame-rate or latency measurement is claimed.

| ID / kind                           | Trigger and purpose                                | Duration / easing                                                         | Behavior                                                                                                      | Reduced motion / interruption                                                                                     | Demonstrated or proposed                                                                        |
| ----------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| M01 · functional                    | Hover/press a control                              | 120 ms; press uses quick ease-out                                         | Surface change; press translates 1 px; no scaling button label                                                | Keep state colors and focus; remove displacement; repeated activation never queues animations                     | Implemented                                                                                     |
| M02 · functional                    | Select a subject or local tab                      | 120–180 ms                                                                | Hover arrow shifts 3 px; selected state is immediate; task navigation does not fade the whole page            | Remove arrow movement; keep selection; preserve unit/context                                                      | Arrow implemented; production route focus/title remains work                                    |
| M03 · signature: follow evidence    | Activate a specific citation                       | 300 ms, `cubic-bezier(.22,1,.36,1)`; annotation color settles over 450 ms | Excerpt reveals with opacity and ≤10 px travel; claim stays visible; locator and source heading receive focus | Instant excerpt, same focus/announcement. Repeated activation replaces the local reveal, not a queue              | Implemented, desktop and mobile dialog; reduced control tested                                  |
| M04 · signature: turn understanding | Click/Space on a flashcard                         | 240 ms, same ease-out                                                     | Contained content turn, 15° X tilt and opacity; question/answer replace each other                            | Immediate content switch, pressed state and announcement remain. One active face; repeated Space reverses content | Implemented as a content-turn specimen; retain current production inactive-face semantics       |
| M05 · functional                    | A result arrives                                   | 280 ms, same ease-out                                                     | Result content settles ≤7 px into its reserved paper region; controls do not relocate to celebrate            | Instant result; no movement. Cancel invalidates the pending local example                                         | Implemented summary/flashcard only                                                              |
| M06 · functional                    | Open/close evidence or review dialog               | Entry 180 ms ease-out; exit 140 ms ease-in                                | Opacity, ≤6 px travel, scale .985→1; background becomes inert immediately                                     | No transform or delay; preserve modal semantics. Prevent click-through during closure                             | Implemented; rapid automation revealed why subsequent input must wait for modal closure         |
| M07 · authored operational feedback | Receipt or saved details arrives                   | 180 ms, same ease-out                                                     | Local notice settles ≤4 px; receipt ledger shows completed and pending stages using text/icons                | Instant state; identical stage meanings. No confetti, count animation or triumphant destructive-action feedback   | Notice/ledger implemented; a drawn check is optional and not demonstrated                       |
| M08 · functional                    | Content is pending                                 | 1200 ms indeterminate pass, **two passes maximum** in the concept         | Small line inside the affected region; stable status persists afterward                                       | Static line and status. Production must pause any ongoing indicator offscreen and remove it on completion         | Finite prototype corrected after detector warning; no long-running performance claim            |
| M09 · functional extension          | Expand a field group, change a filter, open a menu | 140–180 ms for local opacity when it clarifies continuity                 | Immediate readable state; no animated height that delays editing or reading                                   | Instant layout and correct focus. Use existing native disclosure where animation adds little                      | Native disclosure and filter implemented; animated production expansion not proposed by default |
| M10 · public signature extension    | Visitor chooses a product example                  | Up to 320 ms, same ease-out                                               | One claim-to-source demonstration carries the Folio reading language into the existing public workspace       | Static equivalent. No automatic hero choreography, parallax or looping simulation                                 | Specified, not built in this refinement prototype                                               |

Use existing CSS Modules, CSS transitions/keyframes and, only if interruption requires it, native Web Animations. Add no motion package. Never animate font size, container width/height or large page-layout properties to make routine work appear sophisticated. A late result must not steal focus after the user leaves the task. Retain scroll position when changing filters or returning from evidence.

Honor both the OS preference and an explicit stronger reduced-motion choice. `prefers-reduced-motion` responds to the user’s platform preference; the review control additionally demonstrates the static branch. [MDN reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion). Disabling nonessential interaction motion is a project requirement; WCAG’s specific animation-from-interactions criterion is **AAA**, not an AA certification claimed here. [W3C explanation](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

## Accessibility and production boundary

WCAG 2.2 AA is the practical release benchmark: text contrast, control meaning, keyboard operation, visible/unobscured focus, labels/errors, language and status semantics must be verified in the final running implementation. Use 44 px primary touch targets as a UniMind design target; WCAG AA’s target-size minimum is a separate criterion with exceptions. [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

This prototype is not a WCAG certification. Physical mobile keyboard, screen-reader output, 200%/400% zoom, system reduced-motion emulation, every long Arabic label and every production workflow remain future validation obligations. The precise acceptance checks are in [roadmap and acceptance](roadmap-and-acceptance.md).

Font provenance: Manrope and its license reuse the first concept assets. The Arabic subset is copied from the existing Next.js build used by this repository; the included Noto license comes from [Google Fonts’ Noto Sans Arabic OFL](https://github.com/google/fonts/blob/main/ofl/notosansarabic/OFL.txt). Icons and the small orientation diagram are authored SVG geometry. No stock photography, image generation or remote runtime asset was introduced.
