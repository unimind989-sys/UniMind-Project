# UniMind design contract

This is the canonical first-party visual and interaction contract. Product/security authority remains in the [master plan](docs/plans/poc-master-plan.md); acceptance and delivery remain in the [runbook](docs/runbooks/poc-execution-runbook.md). Surface briefs describe particular jobs and refer here for system rules.

**Status: Phase 1, student, Batch Leader and Admin implementation approved; final consistency approved.** Ahmed approved Phase 1 `ab568b6` and student candidate `3a2a95d`; see the [Phase 1 receipt](planning/design/frontend-overhaul/phase-1-approval.md) and [student receipt](planning/design/frontend-overhaul/student-approval.md). The [student record](planning/design/frontend-overhaul/phase-2-student.md) owns retained proof; the [Batch Leader record](planning/design/frontend-overhaul/phase-2-batch-leader.md) owns the current slice. Ahmed accepted Batch Leader candidate `4c03b80`; see the [Batch Leader receipt](planning/design/frontend-overhaul/batch-leader-approval.md). The [Admin record](planning/design/frontend-overhaul/phase-2-admin.md) owns its focused proof and rendered checkpoint. Ahmed accepted Admin candidate `ec00466`; see the [Admin receipt](planning/design/frontend-overhaul/admin-approval.md). The [final consistency record](planning/design/frontend-overhaul/phase-2-final.md) retains its source-bound checkpoint. Ahmed accepted final candidate `8ad3a9b`; see the [final receipt](planning/design/frontend-overhaul/final-approval.md). The [delivery record](planning/design/frontend-overhaul/phase-2-delivery.md) owns delivered technical proof. See the [audit, flows and rollout](docs/reviews/wp03-frontend-overhaul.md) and [proposal](planning/design/frontend-overhaul/README.md).

The [previous design contract](planning/design/frontend-overhaul/previous-design-contract.md) preserves the implemented dark Study Shelf and historical approval. Its navy-only palette, six-item mobile bar, expanding auth rail and mandatory imagery no longer govern this overhaul. Existing behavior and safety remain binding.

## Principles

Make the next study action clear, keep academic context stable, and let material carry the page. Students study on 360–430px phones; larger screens support longer reading. Batch Leaders need reliable intake; admins need exact targets and consequences.

- One identity layer, persistent role navigation and one current subject context.
- Evidence beside answers/artifacts. Format and professor insight remain metadata in one authorized unit pool.
- Lists, forms and reading areas separate meaningful jobs. Containers do not decorate every label.
- Layered neutral greys, quiet separators, one restrained blue interaction accent. Chrome themes and NotebookLM's quiet surfaces guide the brief; the composition is a UniMind interpretation.
- Every control works through an existing seam or explains its specific prerequisite.
- Mobile-first student/leader flows and an admin list/detail layout that reflows.
- No gradients, glows, heavy shadows, oversized decorative cards, invented metrics, repeated icon tiles, animated entrances or purposeless ornament.

## Brand and copy

Use exactly these two lines:

```text
Study deeper
Go further.
```

Keep this exact slogan in English; translate surrounding copy. Replace historical app taglines. Use it in the public hero and optionally quietly in the desktop rail.

Brand dependency: `planning/design/unimind-logo/open-folio-kit/`. Read `usage-guide.md` and `integration.md` before integration. One shared `Brand` component uses supplied full/compact/small and Light/Dark variants. Preserve aspect ratio, palette and intrinsic proportions. Reserve dimensions; never mirror the logo in RTL. Wire supplied favicons/app icons through Next metadata and existing icon surfaces; no PWA functionality is implied.

Ahmed supplied the kit in `unimind-open-folio-kit/` for Phase 2. Selected production files and guides are preserved under the canonical kit path; runtime copies live in `public/brand/unimind/`. Verify their hashes against the supplied manifest. The Phase 1 sample used a temporary plain wordmark. Unrelated logo concepts remain untouched.

Use sentence case and concrete verbs: Open Module, Resume Anatomy, Upload files, Retry upload, View supporting material. Keep task IDs, provider internals and decision codes out of ordinary product flows. Synthetic review has one clear service-boundary label.

## Semantic color system

Components use semantic tokens; brand artwork keeps its supplied palette. Success/danger are status roles, not decorative accents.

| Token                                           | Light     | Dark      |
| ----------------------------------------------- | --------- | --------- |
| `--canvas`                                      | `#f6f7f8` | `#1b1c1f` |
| `--surface`                                     | `#ffffff` | `#232529` |
| `--subtle`                                      | `#eef0f2` | `#2c2e33` |
| `--hover`                                       | `#e6e9ed` | `#35383e` |
| `--ink`                                         | `#202124` | `#eef0f3` |
| `--secondary`                                   | `#535861` | `#bdc2cb` |
| `--muted`                                       | `#626873` | `#a6acb7` |
| `--border` / decorative separator               | `#d9dde3` | `#3e424a` |
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

Account → Appearance offers **System / Light / Dark**, default System. System follows OS changes; explicit Light/Dark overrides them. Set root theme, `color-scheme` and `theme-color` consistently. Current profiles have no theme field: use a validated, versioned local key and tolerate storage denial. Apply a minimal pre-paint bootstrap with a safe System fallback and scoped hydration handling. Do not add a settings table for appearance.

Academic context must survive future account sessions. Reuse the existing profile with the smallest validated catalog-preference extension, because no current field persists it. Stored preference is a hint; caller-scoped catalog and availability remain authority. Never create membership or release from a saved selection. The [persistence plan](docs/reviews/wp03-frontend-overhaul.md#persistence-and-backend-budget) owns proposed changes and denial proof. Demo account data still resets per document; neither sample nor demo proves real persistence.

The student candidate adds nullable `profiles.academic_context`, with own-caller catalog validation, column-specific grant and an invoker trigger. Its database execution/type-generation proof remains pending on Linux CI; apply the reviewed migration before deploying account readers. Real Shelf resume reuses the most recently created open chat session in the caller's current authorized cohort. It does not imply last-visited tracking or saved artifact progress. Failed/revoked reads omit the link. The synthetic runtime retains its existing document-local last study destination.

## Typography and geometry

Keep self-hosted **Manrope** (English) and **Noto Sans Arabic** (Arabic). Interface locale and output language stay independent. Arabic has neutral tracking; Latin technical text is isolated with `bdi` or explicit direction. Use `Intl` dates/numbers.

| Role                     | Size / weight / leading                               |
| ------------------------ | ----------------------------------------------------- |
| Public hero              | `clamp(2.25rem, 4.2vw, 3.75rem)` / 700 / 1.15–1.35    |
| Page title               | 28px desktop, 26px phone / 700 / 1.35                 |
| Section title            | 20px standard, 18px compact form/history / 650 / 1.35 |
| Row/subsection title     | 16px / 650 / 1.4                                      |
| Reading                  | 16px target, 15px compact preview / 400–450 / 1.6     |
| Controls                 | 14–16px / 400 or 600 / 1.5                            |
| Metadata                 | 13px / 400 / 1.6                                      |
| Mobile navigation labels | 11–12px / 500 / 1.5, inside 60px targets              |

Arabic reading leading 1.7–1.8 and heading leading 1.5–1.55 use locale tokens, not scattered overrides. English tracking never below −0.04em.

Spacing steps: **4, 8, 12, 16, 24, 32, 48px**. Controls radius 8px; useful panels 10px; dialogs 12px. Default elevation none; overlays may use one restrained neutral shadow when layering needs it. Reading measure about 65–75ch. Main maximum 1200px; desktop rail 216px/compact 184px; materials column 264px/compact 220px. Intrinsic wrapping and `min-width: 0` protect important text.

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

| Role         | Global navigation                                   | Local experience                                                                                                      |
| ------------ | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Student      | **Study, Subjects, Account**                        | Resume Study Shelf; authorized units; Materials, Chat, Studio, Quiz; scoped evidence/report/viewer; academic settings |
| Batch Leader | **Uploads, History, Account**                       | Assigned campaigns/invitation; mixed-file queue; upload/finalize progress; statuses/retry                             |
| Admin        | **Overview, Content, Academics, Users, Operations** | Decisions; Sources/Campaigns; Catalog/Cohorts; existing assignment/access context; Jobs/Quality/Usage/Incidents       |

“Subjects” is the requested global destination. Inside it, configuration still renders **Modules** for Medicine and **Subjects** elsewhere. Do not rename the domain.

Anonymous first-time entry sees the landing page. Authenticated entry routes by verified database-backed role after account/consent checks. Invitation/deep-link destinations remain validated. No repeated role chooser or client role as authority.

Student onboarding resolves the existing academic hierarchy once; Account edits it and resets invalid dependent choices. Shelf shows current-period units, useful readiness and an available recent-study destination; no invented progress. Unit→Materials→Studio→Viewer retains title, navigation and contextual return. Preserve scoped Chat history/drafts, six Studio types, quiz attempts/review and exact evidence/report binding.

Batch intake uses a native multiple-file picker and matching drop path. Infer format from bytes; infer requested item only when authorized scope/type uniquely match. Ask when ambiguous. Retain required source description/title and rights declaration. Each file owns state/key/progress/retry. **Uploaded/received is not processed/accepted/READY.** Add neither new formats nor processing infrastructure.

The implemented intake prefers a unique outstanding compatible request; a unique
compatible replacement is the fallback. Multiple candidates require a choice.
One active file uploads and finalizes at a time through the existing endpoint and
action, without waiting for processing. A failed finalizer retains its receipt;
Retry submission does not upload again. Adding files clears the rights checkbox.
Queue drafts stay in document memory. History shows only the existing latest
submission per request in currently assigned active campaigns; it does not claim
to be an archive. Uploads, History, campaign and Account share the role shell,
semantic tokens and unmirrored brand; campaign workspace maximum is 58rem.

Admin Overview leads with decisions; Content groups Sources/Campaigns; Academics groups Catalog/Cohorts; Operations groups Jobs/Quality/Usage/Incidents. Users exposes only existing assignment/membership context through authorized seams: no invented user directory/editor. Preserve consequences, stale checks, readiness predicates, audit and distinct-principal confirmation. Financial/provider boundaries remain fail-closed.

## Responsive, accessible and state rules

- Prioritize 360–430px student/leader screens; retain the existing 320px reflow floor. Also review 768px and 1440px.
- Below 768px use three equal student/leader bottom targets with safe-area padding. Admin uses a labeled compact menu, not five tiny targets. Compact desktop rail begins below 1100px.
- Local unit navigation is separate from global navigation. Four destinations fit a text row; wrap/stack under enlarged text. On mobile Materials is an explicit view; Studio/Chat/viewer use the full reading width and return to it.
- Use ≥44px touch targets, visible focus, skip links, landmarks, meaningful headings and native labels. No essential hover, drag or gesture-only action. Dialog focus returns to trigger; disclosures close with Escape; sticky controls never cover focused content.
- Theme/locale changes preserve input, selection and separate output language. Unit changes never mix sessions/artifacts across scopes.
- Only helpful 120–160ms color/opacity transitions; no entrances or forced smooth scrolling. Reduced motion removes optional transitions and preserves meaningful progress.
- Loading keeps known context and announces status. Empty explains absence and allowed next action. Retry only when retryable; forbidden/expired states offer safe role-home exits. Interruption retains correct retry identity/draft. Stale admin actions refresh authority. Success uses text plus a non-color cue.
- Check long Arabic/English labels, mixed technical text, keyboard, 200% text and 320px reflow in both themes. Visual review, automated accessibility and security proof remain separate obligations.

## Approval and evidence

### Public landing candidate — 3 October 2026

Ahmed requested a premium landing page with modern animation and optional 3D, then confirmed "Use your strongest creative direction." The candidate retains the supplied Open Folio, exact English slogan, Manrope/Noto Sans Arabic, existing account routes and paired neutral themes. Ahmed accepted landing candidate `569c467` on 4 October 2026; the [landing receipt](planning/design/premium-product/landing-approval.md) owns this checkpoint and rollback tag. The previous approved product surfaces retain their existing status while the requested refinement of all remaining screens is prepared.

The public `/` surface has a scoped marketing exception to the product's display-size, elevation and motion limits: a large two-line slogan, a dimensional folio, a blue-backed interactive workspace demonstration, an evidence diagram, an ordered study path and a blue closing field. Hero display caps at 96px, with 600 weight and −0.04em tracking; headings use 600 weight and −0.035em, with neutral Arabic tracking. The illustration uses fixed white paper, blue `#2458b8`, pale blue `#e8effb`, physical page-fold shading and offset shadows. Dark chrome uses existing semantic tokens with a `#233550` demonstration surround. These local materials do not redefine product tokens or alter supplied logo artwork.

Motion assembles the folio once in 1100ms, tilts it with a fine pointer, and separates its layers on an explicit keyboard-accessible action. State changes use a 300ms preview transition and a 650ms folio transition with `cubic-bezier(0.16, 1, 0.3, 1)`. No continuous animation, scroll hijacking or added animation dependency. Reduced motion presents the same states immediately; offscreen/hidden pointer work is stopped and listeners/frames are cleaned up.

Chat/Studio/Quiz demonstrate local sample interactions without generation, saving, private data or provider requests. The preview labels its sample content and limitations beside the working controls. Tabs wrap intrinsically under enlarged English/Arabic text. Below 850px the hero becomes a vertical composition; below 600px the material rail becomes a compact source row. Preserve 320px reflow, 200% text, roving tab focus, source disclosure, flashcard state and quiz feedback. Existing shared product rules remain unchanged outside this landing scope.

Phase 1 approval covers this proposed system, role flows and sequence after the shell/student sample is shown. Phase 2 pauses at student, Batch Leader, Admin and final consistency rendered checkpoints. Record actual actor/time/candidate/route/state scope. An “okay” about missing assets is not design acceptance.

### Remaining-screen refinement candidate — 4 October 2026

Ahmed approved the landing and requested the same care across all remaining screens. The separate `codex/premium-product-screens` candidate extends the established identity; its material acceptance is pending. Landing sources and root theme/brand tokens remain unchanged. The [candidate review](planning/design/premium-product/remaining-screens-review.md) owns the bounded inline finish review and limitations.

The candidate uses a 232px desktop role rail (184px below 1100px), a generous working canvas, explicit rem page titles, white/neutral reading surfaces and restrained solid blue selection. Subject navigation has four labeled icon links; nested Quiz attempts and review retain their selected destination. A single Materials library uses divided source rows. Shelf subject identities are literal geometric books; recent study uses its actual stored destination. Account sections stay divided and its native theme chooser previews the real current theme. Admin keeps its split queue/detail review and exact decision context.

Access pairs the existing form with a CSS geometric folio and the exact English slogan “Study deeper / Go further.” The decorative aside recedes at 1000px. Below 768px subject context is compact, content uses the available width, and existing native bottom navigation/admin menu remains. Campaign workspace expands to 64rem; intake hides its decorative upload mark and compacts context margins below 600px to prioritize the native picker. All product copy continues to distinguish sample state from real functionality.

This pending candidate has a scoped product-motion extension: 180ms color, border and press feedback; drag feedback only during an actual drag; a 240ms CSS perspective flip only after explicit flashcard activation. The named live region exposes only the active face, and keyboard focus stays on the native flip button. Reduced motion removes these transitions immediately. No entrance, looping animation, dependency or raster asset is added. This candidate does not revise the earlier 120–160ms approved baseline until its own receipt exists.

The standalone proposal performs no real identity, upload, source, generation, account persistence or protected action. Its review toolbar is outside the proposed product flow. It neither replaces the full synthetic pack nor proves platform-wide WCAG/production PASS. Phase 1 evidence belongs in the [proposal README](planning/design/frontend-overhaul/README.md); implementation evidence belongs in the [student record](planning/design/frontend-overhaul/phase-2-student.md) and WP03-T09 record.
