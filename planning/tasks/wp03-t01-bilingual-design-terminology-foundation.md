# Task record: WP03-T01 bilingual design and terminology foundation

**Task ID:** WP03-T01

**Status:** [x]

**Outcome:** UniMind has one founder-approved bilingual visual direction, configuration-driven Module/Subject terminology, validated English/Arabic localization, and the smallest accessible reusable UI foundation needed by WP03.

**Owner:** Codex `/root`; Ahmed is the requester and named human checkpoint

**Reviewer:** Ahmed for the ordinary visual-direction and task-completion checkpoints

**Branch:** `wp03/approved-study-shelf`, targeting protected `main`; Ahmed explicitly authorized committing and pushing the complete current worktree to `main` after approval, and GitHub requires the delivery to pass through a pull request

**Updated (UTC):** 2026-09-12T15:05:03Z

## Execution contract

**Dependencies:** Reviewed WP02-T09 `PASS` evidence at `evidence/wp02-database/2026-09-09_database-gate_github_dd9ece4.md`; all WP02 tasks are complete; open real-data, storage, provider, rights, retention, budget, release, and beta decisions retain their exact consumer blocks.

**Inputs:** Runbook WP03-T01 and sections 6.0-6.7; master-plan product rules, journeys, application architecture, and availability model; `PRODUCT.md`; `CONTEXT.md`; `docs/agents/ui-design-stack.md`; synthetic catalog and role fixtures only; Ahmed's direction inputs that phone and desktop have equal priority, no existing brand assets are binding, and UniMind should avoid a generic LMS, hospital-system, chatbot-first, or gamified exam-app identity.

**Files:** Founder-approved visual-decision artifacts and surface brief under `.impeccable/`; root `DESIGN.md` after implementation is visually verified; `src/lib/catalog/terminology.ts`; typed English and Arabic dictionaries and locale utilities; root layout and logical-property styling; the smallest shared WP03 primitives; focused unit, accessibility, localization, and rendered-flow tests; synchronized runbook/task record; sanitized evidence under `evidence/wp03-product-shell/`.

**Verify:** Focused terminology, dictionary-completeness, locale/direction, component-state, accessibility, and responsive tests after each slice; project-pinned Playwright CLI rendered inspection; Impeccable detector and integrated audit after UI completion; `corepack pnpm verify`; `git diff --check`; `git diff --stat`; full diff and secret/scope scan.

**Pass:** Ahmed selects and approves one direction; English, Arabic, mixed-direction, long-content, keyboard, screen-reader, reduced-motion, touch, mobile, and desktop requirements pass; Module/Subject labels derive only from program data; required copy cannot silently fall back; reusable primitives expose every required interaction/status state; no real data, private source, live provider, paid service, or protected transition is enabled.

**Evidence:** Expected commit-specific report `evidence/wp03-product-shell/YYYY-MM-DD_bilingual-design-foundation_<environment>_<short-sha>.md`, plus sanitized decision and rendered evidence where allowed.

**Rollback:** Remove the unapproved UI slice and localization additions before merge; after merge, revert the application commit while retaining the prior foundation page. No database rollback or shared-environment mutation is part of this task.

**Hard stop:** Do not implement UI before Ahmed selects the visual direction. Do not create `DESIGN.md` from unapproved intent. Do not use real student/source data, private uploads, external component services, paid providers, remote runtime assets, publish/unlock actions, or any protected transition. Do not mix or overwrite the pre-existing uncommitted planning changes.

## Steps

- [x] Complete Impeccable `shape` discovery and the new-world direction choice for representative student catalog/workspace surfaces with enough Batch Leader and admin structure to prove cross-role reach. Ahmed selected **The Study Shelf** through decision key `736d7ffb` and explicitly confirmed the compact brief on 2026-09-12 Cairo time.
- [x] Run the required comp-led composition round using the selected decision comp plus two materially different Study Shelf compositions. Ahmed approved **Focused Rail** through comp-round key `f1fe101e`; `.impeccable/mocks/decision/wp03-study-shelf.webp` is the approved comp.
- [x] Record the confirmed surface brief, approved-comp inventory, sampled visual values, and implementation contract without inventing global tokens before the build exists.
- [x] Implement configuration-driven terminology, typed bilingual dictionaries, locale validation, root `lang`/`dir`, mixed-direction handling, and formatting behavior test-first.
- [x] Implement the approved accessible tokens and minimum local primitives across required states without adding a UI dependency.
- [x] Run focused and complete verification, bounded production-mode rendered inspection, the one permitted detector pass, independent Impeccable finish review, and reconcile final `DESIGN.md` with the shipped system.
- [x] Assemble sanitized evidence and obtain Ahmed's ordinary completion checkpoint. Ahmed inspected the corrected preview and recorded `PASS` on 2026-09-12 Cairo time.

## Handoff

**Changed:** Implemented the reviewed `/learn` Study Shelf foundation with a 254 px desktop product rail, responsive bottom navigation, three locale-switchable curriculum shelves, in-place keyboard/touch focus, search, locale/direction switching, truthful synthetic state, and an intentionally disabled WP03-T03 workspace boundary. Following Ahmed's review feedback, the surface now renders exactly one active interface language at a time, reserves a separate logical grid cell for the RTL/LTR search icon, and centers all six mobile navigation tabs in equal-width columns. Added configuration-driven Module/Subject terminology, validated locale utilities, typed complete English/Arabic dictionaries, local semantic components, generated synthetic subject plates with embedded provenance, root `DESIGN.md`, and the schema-v2 Impeccable sidecar. No real data, live provider, paid service, remote runtime asset, release, or protected transition was used.

### Approved-comp implementation analysis

- **Frame and grid:** the approved source is 1536×1024. A 254 px fixed desktop navigation rail leaves an approximately 1282 px work area. The content begins near x=294 with a 40 px inline margin; the top utility row is about 46 px high. Three curriculum rails are visible in the first viewport. The focused tile is about twice a neighboring tile's width.
- **Rhythm:** the interface follows an 8 px base rhythm. Desktop content uses approximately 40 px outer spacing, 12–16 px card gaps, 16 px card padding, and 40–48 px separation between rail headings. Density is compact and operational, not airy marketing composition.
- **Sampled palette:** full-image palette extraction and 24×24 interior-patch averages yielded page ground `#0c1823`, navigation ground `#0c1821`, utility field `#1a293d`, focused surface `#2a3b51`, active navigation `#1e3557`, ready field `#10292a`, primary action `#3977f7`, and bright focus blue `#336ae2`. Dominant extracted text colors are `#ecf3f9`, `#c8d1d8`, and `#b5b8c5`.
- **Type:** six practical levels: 40 px page title, 20 px shelf title, 16–18 px unit title, 14–16 px body, 12–14 px metadata, and 12 px status. Lettering is a tight workhorse sans; the implementation will use a self-hosted Next font that supports Latin and Arabic rather than a platform display face.
- **Inventory:** wordmark; six-item product rail; search, locale, divider, avatar, and identity utilities; active-language page title and description; view-all action; three shelf headings with year/count metadata; seventeen unit tiles; one focused unit with localized readiness, source count, cohort scope, description, and workspace boundary; two unavailable tiles.
- **Effects:** matte fields, one-pixel cool separators, 12–14 px card radii, low/absent shadow, cobalt focus outline, clipped edge-to-edge subject imagery, and no gradients or glass. Focus selection must work by keyboard and touch.
- **Approved deviation for this task slice:** the route uses deterministic synthetic fixture state and a disabled workspace action because WP03-T03 does not yet provide a real unit destination. Copy explicitly marks the data as a synthetic foundation preview and does not imply release, progress, source, or authorization state from a live system.

**Commands:** The terminology unit slice was observed red before implementation and now passes 6/6 tests. The post-feedback `corepack pnpm verify` passes the zero-cost full suite: formatting, lint, strict typing, boundaries, SQL conventions, CI policy, secret scan, 252 unit tests, 15 local integration tests with 2 hosted tests skipped by contract, 22 security tests, 3 evaluation tests plus 3 synthetic cases, 5 load-contract tests, 5 Playwright tests, and a production-safe Next 16.3.4 build with client secret scan. The one Impeccable detector pass returned `[]`. Focused typecheck, lint, JSON validation, diff check, and 3/3 Study Shelf Playwright tests pass against the retained synthetic preview. In-app browser inspection confirms Arabic search icon-to-input spacing of 12 px, zero English headings in Arabic mode, zero Arabic headings/navigation labels in English mode, six equal mobile tab columns of about 60.7 px, zero icon-center offset, and no page overflow at 390×844. Production Playwright captures at 1536×1024 and 390×844 have no console warnings, no development overlay, and no page overflow; the focused mobile unit measures x=10.8 px and width=368 px in a 390 px viewport. The independent finish reviewer scored all six initial requested fixes resolved and returned `disposition: ship`; Ahmed inspected the corrected preview and approved it. Raster provenance scan reports 16 assets and 0 missing prompts. Post-approval agent-readiness checks pass 166 names, 46 local links, 22 synchronized decisions, and 102 task contracts; the isolated handoff rehearsal also passes. `git diff --check` passes.

**Remaining:** No WP03-T01 implementation or review work remains. Delivery is proceeding through the required pull-request path because GitHub rejected a direct protected-branch update; the evidence filename identifies the pre-delivery base SHA and candidate commit `79561c0` contains the approved worktree.

**Next safe action:** Complete the required checks and merge the approved delivery pull request into `main`, then run the work-state selector before beginning another task; preserve all still-open decision and protected-gate blocks.

**Reviewer action:** Complete. Ahmed selected The Study Shelf, confirmed its compact brief, approved Focused Rail, reviewed the corrected English/Arabic, RTL search, and mobile navigation behavior, and recorded the ordinary `PASS` checkpoint on 2026-09-12 Cairo time.
