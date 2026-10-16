# UniMind design contract

This is the canonical first-party visual and interaction contract. Product/security authority remains in the [master plan](docs/plans/poc-master-plan.md); acceptance and delivery remain in the [runbook](docs/runbooks/poc-execution-runbook.md). Surface briefs describe particular jobs and refer here for system rules.

**Current approval: Open Folio refinement, 5 October 2026.** Ahmed's explicit “I approve” authorizes the [refined direction](docs/reviews/uiux-2026-10-04/refinement/refined-direction.md), [visual/motion system](docs/reviews/uiux-2026-10-04/refinement/design-system.md) and [roadmap](docs/reviews/uiux-2026-10-04/refinement/roadmap-and-acceptance.md). The exact approved interactive reference SHA-256 is `f9a7d9a4f4bf75fd9e51eb4660249efce4253a11811647a2e577c35321543ef4`; see [approval](planning/design/open-folio/approval.md). This contract now governs implementation. The following receipts preserve earlier accepted work; they do not prove this candidate.

**Historical delivery:** **Status: Phase 1, student, Batch Leader and Admin implementation approved; final consistency approved.** Ahmed approved Phase 1 `ab568b6` and student candidate `3a2a95d`; see the [Phase 1 receipt](planning/design/frontend-overhaul/phase-1-approval.md) and [student receipt](planning/design/frontend-overhaul/student-approval.md). The [student record](planning/design/frontend-overhaul/phase-2-student.md) owns retained proof; the [Batch Leader record](planning/design/frontend-overhaul/phase-2-batch-leader.md) owns the current slice. Ahmed accepted Batch Leader candidate `4c03b80`; see the [Batch Leader receipt](planning/design/frontend-overhaul/batch-leader-approval.md). The [Admin record](planning/design/frontend-overhaul/phase-2-admin.md) owns its focused proof and rendered checkpoint. Ahmed accepted Admin candidate `ec00466`; see the [Admin receipt](planning/design/frontend-overhaul/admin-approval.md). The [final consistency record](planning/design/frontend-overhaul/phase-2-final.md) retains its source-bound checkpoint. Ahmed accepted final candidate `8ad3a9b`; see the [final receipt](planning/design/frontend-overhaul/final-approval.md). The [delivery record](planning/design/frontend-overhaul/phase-2-delivery.md) owns delivered technical proof. See the [audit, flows and rollout](docs/reviews/wp03-frontend-overhaul.md) and [proposal](planning/design/frontend-overhaul/README.md).

The [previous design contract](planning/design/frontend-overhaul/previous-design-contract.md) preserves the implemented dark Study Shelf and historical approval. Its navy-only palette, six-item mobile bar, expanding auth rail and mandatory imagery no longer govern this overhaul. Existing behavior and safety remain binding.

## Principles

Make the next study action clear, keep academic context stable, and let material carry the page. Students study on 360–430px phones; larger screens support longer reading. Batch Leaders need reliable intake; admins need exact targets and consequences.

- One identity layer, persistent role navigation and one current subject context.
- Evidence beside answers/artifacts. Format and professor insight remain metadata in one authorized unit pool.
- Lists, forms and reading areas separate meaningful jobs. Containers do not decorate every label.
- Layered neutral greys, quiet separators, one restrained blue interaction accent. Chrome themes and NotebookLM's quiet surfaces guide the brief; the composition is a UniMind interpretation.
- Every control works through an existing seam or explains its specific prerequisite.
- Mobile-first student/leader flows and an admin list/detail layout that reflows.
- No gradients, glows, heavy shadows, oversized decorative cards, invented metrics, repeated icon tiles or purposeless ornament. Content-specific delivery and evidence transitions follow the motion contract below.

## Brand and copy

Use exactly these two lines:

```text
Study deeper
Go further.
```

Keep this exact slogan in English; translate surrounding copy. Replace historical app taglines. Use it in the public hero and optionally quietly in the desktop rail.

Brand dependency: `planning/design/unimind-logo/open-folio-kit/`. Read `usage-guide.md` and `integration.md` before integration. One shared `Brand` component uses supplied full/compact/small and Light/Dark variants. Preserve aspect ratio, palette and intrinsic proportions. Reserve dimensions; never mirror the logo in RTL. Wire supplied favicons/app icons through Next metadata and existing icon surfaces; no PWA functionality is implied.

Ahmed supplied the kit in `unimind-open-folio-kit/` for Phase 2. Selected production files and guides are preserved under the canonical kit path; runtime copies live in `public/brand/unimind/`. Verify their hashes against the supplied manifest. The Phase 1 sample used a temporary plain wordmark. Unrelated logo concepts remain untouched.

Use sentence case and concrete verbs: Open Module, Resume Anatomy, Upload files, Retry upload, View supporting material. Keep task IDs, provider internals and decision codes out of ordinary product flows. Local synthetic review retains its service-boundary label. Ahmed's 4 October brief requires the hosted browser simulation to use identical ordinary presentation, with no mode button, banner, extra explanation or credential prefill; its exact approved login pairs select fixture services and ordinary sign-out discards the document-local state.

## Semantic color system

Components use semantic tokens; brand artwork keeps its supplied palette. Success/danger are status roles, not decorative accents.

| Token                                           | Light     | Dark      |
| ----------------------------------------------- | --------- | --------- |
| `--canvas`                                      | `#f6f7f8` | `#1b1c1f` |
| `--surface`                                     | `#ffffff` | `#23272f` |
| `--subtle`                                      | `#eef0f2` | `#2c313a` |
| `--hover`                                       | `#e6e9ed` | `#353d48` |
| `--ink`                                         | `#202124` | `#eef0f3` |
| `--secondary`                                   | `#535861` | `#bdc2cb` |
| `--muted`                                       | `#626873` | `#a6acb7` |
| `--border` / decorative separator               | `#d9dde3` | `#434b57` |
| `--control-border` / necessary control boundary | `#777f8b` | `#858d9a` |
| `--accent` / primary action, focus              | `#2458b8` | `#adc7ff` |
| `--accent-hover`                                | `#194794` | `#c6d7ff` |
| `--accent-soft` / current navigation            | `#e8effb` | `#2b3c59` |
| `--accent-ink` / links, selected labels         | `#214f9f` | `#b9d0ff` |
| `--on-accent`                                   | `#ffffff` | `#152646` |
| `--success`                                     | `#236746` | `#91d2ad` |
| `--danger`                                      | `#a32723` | `#ffb4ab` |

Normal/placeholder text ≥4.5:1; large text ≥3:1; focus and necessary non-text boundaries ≥3:1. Quiet separators need not carry interactive-boundary contrast. Measure actual pairs in both themes: tokens alone are not AA proof.

## Theme and academic persistence

The named student profile → Appearance (Account for other roles) offers **System / Light / Dark**, default System. System follows OS changes; explicit Light/Dark overrides them. Set root theme, `color-scheme` and `theme-color` consistently. Current profiles have no theme field: use a validated, versioned local key and tolerate storage denial. Apply a minimal pre-paint bootstrap with a safe System fallback and scoped hydration handling. Do not add a settings table for appearance.

Academic context must survive future account sessions. Reuse the existing profile with the smallest validated catalog-preference extension, because no current field persists it. Stored preference is a hint; caller-scoped catalog and availability remain authority. Never create membership or release from a saved selection. The [persistence plan](docs/reviews/wp03-frontend-overhaul.md#persistence-and-backend-budget) owns proposed changes and denial proof. Demo account data still resets per document; neither sample nor demo proves real persistence.

The student candidate adds nullable `profiles.academic_context`, with own-caller catalog validation, column-specific grant and an invoker trigger. Its database execution/type-generation proof remains pending on Linux CI; apply the reviewed migration before deploying account readers. Real Shelf resume reuses the most recently created open chat session in the caller's current authorized cohort. It does not imply last-visited tracking or saved artifact progress. Failed/revoked reads omit the link. The synthetic runtime retains its existing document-local last study destination.

## Typography and geometry

Keep self-hosted **Manrope** (English) and **Noto Sans Arabic** (Arabic). Interface locale and output language stay independent. Arabic has neutral tracking; Latin technical text is isolated with `bdi` or explicit direction. Use `Intl` dates/numbers.

| Role                     | Size / weight / leading                               |
| ------------------------ | ----------------------------------------------------- |
| Public hero              | `clamp(2.25rem, 4.2vw, 3.75rem)` / 700 / 1.15–1.35    |
| Collection title         | 34px desktop, 28px phone / 700 / 1.35                 |
| Unit title               | 26px desktop, 22px phone / 700 / 1.35                 |
| Section title            | 20px standard, 18px compact form/history / 650 / 1.35 |
| Row/subsection title     | 16px / 650 / 1.4                                      |
| Reading                  | 16px target, 15px compact preview / 400–450 / 1.6     |
| Controls                 | 14–16px / 400 or 600 / 1.5                            |
| Metadata                 | 13px / 400 / 1.6                                      |
| Mobile navigation labels | 11–12px / 500 / 1.5, inside 60px targets              |

Arabic reading leading 1.7–1.8 and heading leading 1.5–1.55 use locale tokens, not scattered overrides. English tracking never below −0.04em.

Spacing steps: **4, 8, 12, 16, 24, 32, 48px**. Controls radius 8px; useful panels 10px; dialogs 12px. Default elevation none; overlays may use one restrained neutral shadow when layering needs it. Reading measure about 60–68ch. Main canvas maximum 1220px including desktop insets; navigation spine 192px/compact 72px; Studio configuration 264px and source annotation 252px. The solid spine uses #1d2939 / #141b25; annotation #f1f4fa / #202c40. Intrinsic wrapping and `min-width: 0` protect important text.

## Shared components

| Component              | Variants and behavior                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `Brand`                | Full/compact/small; supplied theme assets; never mirrored                                |
| `AppShell`             | Role rail/mobile bar, one identity utility, locale, current location                     |
| `Button` / action link | Primary/secondary/quiet/destructive; pending label, disabled; anchors for navigation     |
| `Field`                | Native input/select/textarea/checkbox/radio; label/helper/error and proper relationships |
| `Status` / `Notice`    | Neutral/success/warning/error; text plus non-color cue; polite updates                   |
| `ListRow`              | Subject/material/submission/decision identity, useful metadata and next action           |
| `ReadingSurface`       | Answer/artifact/processed material with evidence footer; no nested panel stack           |
| `PageState`            | Loading/empty/error/forbidden/stale/capacity/interrupted with specific recovery          |
| `ConfirmAction`        | Exact target/state/consequence/reason/cancel/pending/stale/result where necessary        |

Consolidate overlapping `product-ui`, `frontend-system` and role controls incrementally using project CSS modules and native semantics. Domain/application rules stay outside primitives. No new UI dependency or parallel preview-only product. Local 20–24px line icons use a consistent 1.7–1.8 stroke for navigation/file/action identification; directional arrows may reflect RTL, the brand must not.

## Information architecture and flows

| Role         | Global navigation                                                  | Local experience                                                                                                                                  |
| ------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Student      | **Study, Subjects, named profile**                                 | Start/resume study; searchable authorized units in Subjects; Materials, Chat, Studio, Quiz; scoped evidence/report/viewer; profile opens settings |
| Batch Leader | **Source intake, History, Account**                                | Assigned campaigns/invitation; mixed-file queue; upload/finalize progress; statuses/retry                                                         |
| Admin        | **Decision queue, Content, Academics, Access context, Operations** | Decisions; Sources/Campaigns; Catalog/Cohorts; existing assignment/access context; Jobs/Quality/Usage/Incidents                                   |

“Subjects” is the requested global destination. Inside it, configuration still renders **Modules** for Medicine and **Subjects** elsewhere. Do not rename the domain.

Anonymous first-time entry sees the landing page. Authenticated entry routes by verified database-backed role after account/consent checks. Invitation/deep-link destinations remain validated. No repeated role chooser or client role as authority.

Ahmed's 6 October WP03-T13 request governs the local student entry/navigation candidate, which awaits rendered acceptance. Student onboarding presents one academic question at a time as native radio choices, followed by an editable summary before saving through the existing authorized seam. Back retains choices; changing a parent clears dependent choices. A single named profile opens settings and replaces the separate Account destination and Student identity item. Settings retain existing academic editing in an independent view. Study offers a start action or an available recent-study destination; Subjects owns the searchable current-period catalog. No progress or additional history is invented. Unit→Materials→Studio→Viewer retains title, navigation and contextual return. Preserve scoped Chat history/drafts, six Studio types, quiz attempts/review and exact evidence/report binding.

The shared product shell uses a direct English / العربية segmented language switch with native buttons, an accessible group name and a visible pressed state. It preserves route, query, fragment, draft and academic selection. Landing and the entire login/access flow retain their existing language controls. The candidate stays local on codex/frontend-refinements; commit and external delivery await Ahmed's explicit instruction.

Batch intake uses a native multiple-file picker and matching drop path. Infer format from bytes; infer requested item only when authorized scope/type uniquely match. Ask when ambiguous. Retain required source description/title and rights declaration. Each file owns state/key/progress/retry. **Uploaded/received is not processed/accepted/READY.** Add neither new formats nor processing infrastructure.

The implemented intake prefers a unique outstanding compatible request; a unique
compatible replacement is the fallback. Multiple candidates require a choice.
One active file uploads and finalizes at a time through the existing endpoint and
action, without waiting for processing. A failed finalizer retains its receipt;
Retry submission does not upload again. Adding files clears the rights checkbox.
Queue drafts stay in document memory. History shows only the existing latest
submission per request in currently assigned active campaigns; it does not claim
to be an archive. Uploads, History, campaign and Account share the role shell,
semantic tokens and unmirrored brand; campaign workspace maximum is 78rem.

Admin Decision queue leads with decisions; Content groups Sources/Campaigns; Academics groups Catalog/Cohorts; Operations groups Jobs/Quality/Usage/Incidents. Access context exposes only existing assignment/membership context through authorized seams: no invented user directory/editor. Preserve consequences, stale checks, readiness predicates, audit and distinct-principal confirmation. Financial/provider boundaries remain fail-closed.

## Responsive, accessible and state rules

- Prioritize 360–430px student/leader screens; retain the existing 320px reflow floor. Also review 768px and 1440px.
- Below 768px use three equal student/leader bottom targets with safe-area padding. Admin uses a labeled compact menu, not five tiny targets. Compact desktop rail applies from 768–1050px.
- Local unit navigation is separate from global navigation. Four destinations fit a text row; wrap/stack under enlarged text. On mobile Materials is an explicit view; Studio/Chat/viewer use the full reading width and return to it.
- Use ≥44px touch targets, visible focus, skip links, landmarks, meaningful headings and native labels. No essential hover, drag or gesture-only action. Dialog focus returns to trigger; disclosures close with Escape; sticky controls never cover focused content.
- Theme/locale changes preserve input, selection and separate output language. Unit changes never mix sessions/artifacts across scopes.
- Routine control transitions use 120ms. Source annotation reveals use 300ms, ≤10px and cubic-bezier(.22,1,.36,1); result delivery 280ms, ≤7px with the same easing. Native dialog enters in 180ms and closes in 140ms with noncommitting focus and focus restoration. Keep the existing user-triggered 240ms flashcard flip. Indeterminate feedback conveys actual work, never invented percentages; the loading-line specimen settles after two 1200ms passes. Reduced motion exposes identical states instantly. No forced smooth scrolling or whole-page entrance choreography.
- Navigation text and its background change as one immediate palette when the rail becomes bottom navigation or appearance changes. Do not interpolate through unreadable color pairs; preserve panel, source, result and press feedback.
- Loading keeps known context and announces status. Empty explains absence and allowed next action. Retry only when retryable; forbidden/expired states offer safe role-home exits. Interruption retains correct retry identity/draft. Stale admin actions refresh authority. Success uses text plus a non-color cue.
- Check long Arabic/English labels, mixed technical text, keyboard, 200% text and 320px reflow in both themes. Visual review, automated accessibility and security proof remain separate obligations.

## Approval and evidence

### Public landing candidate — 3 October 2026

Ahmed requested a premium landing page with modern animation and optional 3D, then confirmed "Use your strongest creative direction." The candidate retains the supplied Open Folio, exact English slogan, Manrope/Noto Sans Arabic, existing account routes and paired neutral themes. Ahmed accepted landing candidate `569c467` on 4 October 2026; the [landing receipt](planning/design/premium-product/landing-approval.md) owns this checkpoint and rollback tag. The previous approved product surfaces retain their existing status while the requested refinement of all remaining screens is prepared.

The public `/` surface has a scoped marketing exception to the product's display-size, elevation and motion limits: a large two-line slogan, a dimensional folio, a blue-backed interactive workspace demonstration, an evidence diagram, an ordered study path and a blue closing field. Hero display caps at 96px, with 600 weight and −0.04em tracking; headings use 600 weight and −0.035em, with neutral Arabic tracking. The illustration uses fixed white paper, blue `#2458b8`, pale blue `#e8effb`, physical page-fold shading and offset shadows. Dark chrome uses existing semantic tokens with a `#233550` demonstration surround. These local materials do not redefine product tokens or alter supplied logo artwork.

The historical accepted folio assembled once, tilted with a fine pointer and expanded through an explicit layer control. Ahmed's 6 October 2026 WP03-T12 refinement supersedes that interaction: a slow 16-second passive drift moves the folio and its floating source layers, with no pointer tracking or layer button. Decorative animation pauses offscreen or in a hidden document; reduced motion renders the static composition. Sample-tool transitions retain their 300ms timing and existing easing. No scroll interception or animation dependency is added. Ahmed approved the presented landing refinement and instructed a local branch commit on 6 October; the [approval evidence](evidence/wp03-product-shell/2026-10-06_landing-refinements_local_b4cac79.md#founder-approval-and-local-commit) binds the reviewed source. External delivery remains held under the task record.

Chat/Studio/Quiz demonstrate local sample interactions without generation, saving, private data or provider requests. The preview labels its sample content and limitations beside the working controls. Tabs wrap intrinsically under enlarged English/Arabic text. Below 850px the hero becomes a vertical composition; below 600px the material rail becomes a compact source row. Preserve 320px reflow, 200% text, roving tab focus, source disclosure, flashcard state and quiz feedback. Existing shared product rules remain unchanged outside this landing scope.

Phase 1 approval covers this proposed system, role flows and sequence after the shell/student sample is shown. Phase 2 pauses at student, Batch Leader, Admin and final consistency rendered checkpoints. Record actual actor/time/candidate/route/state scope. An “okay” about missing assets is not design acceptance.

### Remaining-screen refinement candidate — 4 October 2026

Ahmed approved the landing and requested the same care across all remaining screens. The separate `codex/premium-product-screens` candidate extends the established identity; Ahmed accepted exact candidate `f0a237f` and invoked `$finalize` on 4 October 2026. The [product receipt](planning/design/premium-product/product-approval.md) owns this material checkpoint. Landing sources and root theme/brand tokens remain unchanged. The [candidate review](planning/design/premium-product/remaining-screens-review.md) owns the bounded inline finish review and limitations.

The candidate uses a 232px desktop role rail (184px below 1100px), a generous working canvas, explicit rem page titles, white/neutral reading surfaces and restrained solid blue selection. Subject navigation has four labeled icon links; nested Quiz attempts and review retain their selected destination. A single Materials library uses divided source rows. Shelf subject identities are literal geometric books; recent study uses its actual stored destination. Account sections stay divided and its native theme chooser previews the real current theme. Admin keeps its split queue/detail review and exact decision context.

Access pairs the existing form with a CSS geometric folio and the exact English slogan “Study deeper / Go further.” The decorative aside recedes at 1000px. Below 768px subject context is compact, content uses the available width, and existing native bottom navigation/admin menu remains. Campaign workspace expands to 64rem; intake hides its decorative upload mark and compacts context margins below 600px to prioritize the native picker. All product copy continues to distinguish sample state from real functionality.

This accepted candidate has a scoped product-motion extension: 180ms color, border and press feedback; drag feedback only during an actual drag; a 240ms CSS perspective flip only after explicit flashcard activation. The named live region exposes only the active face, and keyboard focus stays on the native flip button. Reduced motion removes these transitions immediately. No entrance, looping animation, dependency or raster asset is added. Its receipt approves this bounded extension of the earlier 120–160ms baseline.

The standalone proposal performs no real identity, upload, source, generation, account persistence or protected action. Its review toolbar is outside the proposed product flow. It neither replaces the full synthetic pack nor proves platform-wide WCAG/production PASS. Phase 1 evidence belongs in the [proposal README](planning/design/frontend-overhaul/README.md); implementation evidence belongs in the [student record](planning/design/frontend-overhaul/phase-2-student.md) and WP03-T09 record.

### Student workspace revision — 6 October 2026 (local candidate)

Ahmed approved implementing the voice-note review and applying better space use throughout product sections. Shared content uses the rail's remaining width with 24px desktop gutters, responsive mobile gutters and readable paragraph measures. Subjects keeps its search and source counts without a permanent instructional sidebar. The profile entry shows the caller's existing account name and a circular initial. Settings uses independently visible, deep-linkable panels; hidden panels retain in-progress edits. Short preference choices use native radio groups.

Chat receives the full working width, keeps output language in its header across sessions and opens source excerpts in the existing accessible dialog. A dismissible first-visit citation tip records only an anonymous help-seen flag; chat content is never persisted by this change. Synthetic quiz configuration selects 1–6 fixture questions per difficulty and untimed or 1–240 minute attempts; the fixture limit does not define future production quiz policy. Studio behavior and landing/access presentation remain intact. This material candidate still requires Ahmed's rendered acceptance; prior receipts do not cover these revisions.

### Audit fixes, batch 01 — 9 October 2026 (local candidate)

Ahmed authorized five verified navigation/settings problems for the first review batch. The existing study return action has 24px separation from settings categories. Mobile settings uses a two-column category grid with every label visible. The academic category, panel and save action consistently use Academic settings / الإعدادات الدراسية; its route ID and authorized save behavior are retained. The 768–1050px rail widens to 96px to show destination and profile names below their existing icons; other sizes retain their current navigation. On phones, Switch unit / تغيير الوحدة stays visible and the subject header wraps when needed. Its open menu anchors to the header and fits inside the viewport in both directions. Ahmed's 10 October statement, “the 5 fixes are done,” accepts this bounded batch; it does not approve the whole student workspace revision or external delivery.

### Audit fixes, batch 02 — 10 October 2026 (local candidate)

The next five findings concern academic setup and source lists. Current setup progress is 6px tall against 3px completed segments, so the active stage has a distinct shape as well as its text label. Mobile welcome/setup spacing is 24px. Review labels and values share a compact column with the Edit action immediately beside it; 12px row padding and a 4px label/value gap reduce the summary's height while retaining 44px buttons. Source rows place identity and status side by side on larger screens, with native excerpt disclosures below; phones stack those elements and keep all material details. This batch preserves the existing fonts, tokens, source/availability rules, catalog choices and save behavior. Ahmed’s 10 October “approved tackle the next 5” accepts this bounded batch and font recovery; broader student-workspace acceptance and external delivery remain separate.

### Audit fixes, batch 03 — 10 October 2026 (local candidate)

Study names the authorized subject and Chat/Studio destination in its resume summary and action. The Subjects destination names its page, searched collection and input from the program’s configured singular/plural unit labels; Medicine therefore says Your modules, Modules and Search modules. The global Subjects destination retains its approved name. Subject readiness sits beside the title, with material counts below and the navigation arrow at the trailing edge; the grid keeps these relationships on phones. Ahmed subsequently requested removal of the visible Interface language / لغة الواجهة label; the accessible group name, native buttons and route/draft behavior remain. Chat groups Sessions and Unit sources on the heading row and places Study language below; phones keep the two actions together and stack the groups. Ahmed’s 10 October “everything else approved move on to the next 5” accepts the four resume/catalog/row/Chat changes. The visible language label is superseded by his explicit removal request.

### Audit fixes, batch 04 — 10 October 2026 (local candidate)

Materials gives the known synthetic edition a readable sample label and names missing verified page/timestamp references plainly, preserving the underlying edition and sample disclosure. Studio uses Study focus / محور المذاكرة for its existing sequence/comparison selector and result; Depth and size gains foreground 14px/600 emphasis while retaining its native disclosure. Quiz configuration follows one centered column, capped at 32rem, above the already-approved centered Start action. Timing, Difficulty, count and conditional duration labels use the same foreground 1rem emphasis. Shared language buttons retain their accessible scope name while the visible label is removed at Ahmed’s request. Original fonts, tokens, options, drafts, sources, generation and quiz behavior remain. Ahmed accepted the presented batch 04 snapshot on 10 October 2026 and authorized 5–10 findings for the next batch.

### Audit fixes, batch 05 — 10 October 2026 (local candidate)

Student settings names the task in its header and H1, retaining assigned-role metadata. Appearance puts theme choices before a captioned preview with readable existing interface vocabulary and actual theme tokens; the preview is not interactive and claims no account data. Three labelled privacy explanations preserve the original sentences and pending qualifications. Chat Sessions gains a surfaced native disclosure; sharing status and keyboard help become separately wrapping 14px spans, with foreground emphasis for the status. Disabled setup actions use a neutral surface, restoring the original primary fill when valid. Open Folio, original fonts, native controls and all existing persistence/scope/draft/source behavior remain. Ahmed accepted the six presented batch 05 problems on 10 October 2026 and authorized the next batch.

### Audit fixes, batch 06 — 10 October 2026 (local candidate)

Academic setup uses a 24px parent heading and 20px current-step/review headings, preserving the semantic H2/H3 order and native focus. The university category reads Faculty or program in choices, review and editable settings; configured catalog names and options remain. The helper names the academic path, including its institution, and groups the profile-to-settings reference without blocking narrow or enlarged text wrapping. The onboarding section and its ending rule follow the existing 640px form width. Original fonts, radio/select controls, progress, dependent reset, save behavior and configured high-school/flexible-credit paths remain. Ahmed accepted these five problems on 10 October 2026 and authorized the next batch.

### Audit fixes, batch 07 — 10 October 2026 (local candidate)

The Study resume action follows its context in a panel capped at the existing 640px form measure. Source formats sit beside titles as plain foreground metadata; locators remain below. Excerpt disclosures gain a surfaced boundary while retaining their native marker, focus and expanded content. Only Studio's empty-output heading becomes subordinate to configuration; generated artifacts keep their existing hierarchy. Quiz count exposes its existing 1–6 range beside the native input through a visible accessible description. Original fonts, targets, catalog/source truth and all existing behavior remain. Ahmed accepted these five on 10 October 2026 and requested the next batch with matching screenshots.

### Audit fixes, batch 08 — 10 October 2026 (local candidate)

Settings categories retain their tabs and keyboard model, with existing surfaced boundaries for inactive targets. Subject links show a plain Open cue beside the existing arrow. Shared product language choices reserve a small check slot and use the existing accent-soft selected surface in both device classes; accessible names and pressed states remain. Desktop/tablet utility and main content share the 24px inset. The utility row wraps when enlarged text needs more room. Standalone source pages group Return and the unchanged sample notice with wrapping rather than stacking unrelated large rows. Original fonts and all route, source, draft and selection behavior remain. Ahmed accepted these five on 11 October 2026 and authorized the next local batch.

### Audit fixes, batch 09 — 11 October 2026 (local candidate)

Setup owns one task-specific H1 and one current decision/review H2, using the existing 24px/20px scale. The generic welcome layer is removed. Review adds a completed-choice count and the existing check icon; all input segments continue to represent completed choices. Mobile profile navigation keeps the avatar and caller name, with a Settings caption beside the avatar and a destination description. Sign out uses the existing quiet variant; its behavior and reset route remain. Materials keeps its semantic heading with a visually hidden phone treatment, retaining the visible desktop heading, edition metadata and source notice. Original fonts and all field, source, route, draft, account and policy behavior remain. Ahmed accepted these five on 11 October 2026.

### Audit fixes, batch 10 — 11 October 2026 (local candidate)

Identity and Appearance use the existing 640px measure for their compact section boundaries; Academic settings and Privacy keep their existing layout. Phone unit context becomes 14px with unchanged wording and palette. Chat keeps its semantic H2 and visible desktop heading, removing the repeated visible phone label above its unchanged tools. Period choices alone use a 56px minimum and 12px block padding, with intrinsic growth for long configured labels; other setup choices retain their approved size. Ahmed accepted these five on 11 October 2026, including the shown phone context wrapping. Original fonts and interaction/domain/trust semantics remain.

### Audit fixes, batch 11 — 11 October 2026 (local candidate)

Retain incomplete Study Shelf choices and the current setup step while navigating within Study and Settings in the same document. This is temporary UI state; explicit Open Study Shelf remains the save boundary. Access-entry routes, leaving the workspace, document reload and successful academic save discard it. Current authorized catalog rows still normalize every retained choice. Geometry, copy, native controls and font sources remain the accepted batch 10 presentation. Ahmed accepted this one interruption fix on 11 October 2026 against source aggregate a8db0b1143004c1017637116400e3ab24bcf9f5e9a2d9c165c8b38bec1f2a47b, including the matching live protocol screenshots, and requested the dev server stop.
