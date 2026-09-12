# Gate report: WP03-T01 bilingual design and terminology foundation

**Status:** PASS

**Environment:** Windows PowerShell, local synthetic-only Playwright and production-safe build

**Commit SHA:** `7957a1061cde2d2b4fecd1cc237bcc6df0128b9e` is the pre-delivery base commit identified by this evidence filename; candidate commit `79561c0` contains the complete approved worktree and is delivered from `wp03/approved-study-shelf` through the required pull-request path to protected `main`

**Release/config fingerprint:** `node=24.19.0; pnpm=10.34.5; next=16.3.4; provider-mode=mock; provider-budget-minor=0; generation=false; embedding=false; transcription=false`

**Migrations:** NONE — this task changes no database schema, grants, policies, or data

**Dataset/fixture versions:** deterministic synthetic Study Shelf fixture v1; 3 shelves; 17 unit tiles; 16 provenance-tracked synthetic raster plates

**Agent executor:** Codex `/root`

**Human reviewer:** Ahmed — ordinary completion checkpoint `PASS`

**Started/finished (UTC):** 2026-09-11 / approved and finished 2026-09-12T14:55:41Z

## Scope and acceptance criteria

| Criterion | Threshold | Result | Status | Evidence |
| --- | --- | --- | --- | --- |
| Visual direction is human-approved | One attended direction and composition choice before UI code | Ahmed selected **The Study Shelf**, confirmed the compact brief, and approved **Focused Rail** | PASS | `.impeccable/mocks/decision/wp03-study-shelf.webp`; `.impeccable/surfaces/src-app-learn-page-tsx.md` |
| Independent finish review is clear | Every material finding resolved and disposition is `ship` | Six of six requested fixes resolved; no material regression | PASS | `.impeccable/review/desktop.png`; `.impeccable/review/mobile.png`; reviewer verdict recorded in task handoff |
| Terminology is configuration-driven | Module/Subject never derives from faculty-name conditionals | Typed program terminology configuration returns English and Arabic labels | PASS | `src/lib/catalog/terminology.ts`; `tests/unit/catalog-terminology.test.ts` |
| Required bilingual copy is complete | English/Arabic key parity, non-empty values, no same-language fallback | Typed dictionaries include UI, validation, state, safety, status, and accessible-name copy; the selected locale renders alone throughout the surface; completeness tests pass | PASS | `src/lib/i18n/dictionaries.ts`; 6 focused unit tests; `tests/e2e/study-shelf.spec.ts` |
| Locale and bidi behavior are explicit | Validated locale, root language/direction, isolated mixed text, logical CSS | English and Arabic direction changes pass E2E; one active interface language is rendered at a time; `lang`, `dir`, and `bdi` boundaries are explicit | PASS | `src/lib/i18n/locale.ts`; `src/app/layout.tsx`; `tests/e2e/study-shelf.spec.ts` |
| Responsive accessible surface works | Keyboard/touch focus, semantic roles, contrast, reduced motion, no mobile page overflow | Five Playwright cases pass; Arabic search uses a dedicated icon cell with 12 px separation; six equal mobile navigation columns have zero icon-center offset; focused mobile card is wholly visible at 390 px; computed core contrast is at least 4.5:1; transitions resolve to 0 s under reduced motion | PASS | `tests/e2e/study-shelf.spec.ts`; production captures under `.impeccable/review/`; in-app browser inspection |
| Visual system is durable | Shipped tokens and components documented after render review | Root design authority and schema-v2 extension sidecar exist and validate | PASS | `DESIGN.md`; `.impeccable/design.json` |
| Shipping rasters have provenance | Every referenced local raster has an embedded exact generation prompt and manifest row | Scan reports `16 rasters, 0 missing` | PASS | `.impeccable/work/wp03-study-shelf-asset-manifest.md`; `.impeccable/review/assets-contact-sheet.png` |
| Repository gate stays zero-cost | Full `pnpm verify` exits 0 with mock-only safe build | Formatting, lint, typecheck, policy/scans, unit/integration/security/eval/load/E2E, and production build pass | PASS | Command table |
| Ordinary human completion checkpoint | Ahmed inspects this packet and records PASS or a defect | Ahmed inspected the corrected preview and explicitly approved it | PASS | Decision table |

## Commands executed

| UTC date | Command/test ID | Exit code | Sanitized result |
| --- | --- | --- | --- |
| 2026-09-12 | Focused terminology unit test before implementation | non-zero | Expected red state: terminology module did not yet exist. |
| 2026-09-12 | `corepack pnpm exec vitest run tests/unit/catalog-terminology.test.ts` | 0 | 6/6 terminology, locale, formatting, and dictionary-contract tests passed. |
| 2026-09-12 | `corepack pnpm typecheck` | 0 | Strict TypeScript check passed. |
| 2026-09-12 | `corepack pnpm lint` | 0 | ESLint passed with zero warnings. |
| 2026-09-12 | `corepack pnpm test:e2e` | 0 | 5/5 Chromium cases passed, including keyboard focus, search, bilingual direction, mobile geometry, accessible roles, core contrast, reduced motion, and touch-target minimums. |
| 2026-09-12 | `corepack pnpm build` without the synthetic safe environment | 1 | Expected fail-closed environment validation rejected missing/invalid runtime variables; no code/build defect was inferred. |
| 2026-09-12 | `corepack pnpm test:env-build` | 0 | Next.js 16.3.4 production-safe build passed; `/learn` built as a dynamic route; client artifact secret scan passed. |
| 2026-09-12 | Project-pinned `pnpm browser:cli` production inspection | 0 | 1536×1024 and 390×844 captures inspected; zero console warnings/errors; document width equals 390 px; focused card x=10.8 px and width=368 px. |
| 2026-09-12 | One Impeccable detector pass | 0 | Returned `[]`; per workflow, the detector was not run a second time. |
| 2026-09-12 | Independent Impeccable finish review and follow-up verdict | 0 | Initial six-item fix list resolved in one batch; final disposition `ship`. |
| 2026-09-12 | `node .agents/skills/impeccable/scripts/embed-prompt.mjs --scan public/images/study-shelf` | 0 | `16 rasters, 0 missing`. |
| 2026-09-12 | `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | 0 | 165 names, 46 local links, 22 synchronized decisions, and 102 task contracts passed. |
| 2026-09-12 | First `corepack pnpm verify` attempt after artifact generation | 1 | Formatting gate named 17 new WP03 files; only those files were formatted. No unrelated file was rewritten. |
| 2026-09-12 | Penultimate `corepack pnpm verify` after adding the contrast audit | 1 | Strict TypeScript rejected unchecked color-channel indexing; tuple defaults were added and the focused `typecheck` passed. No runtime or UI behavior changed. |
| 2026-09-12 | Final `corepack pnpm verify` | 0 | Full credential-free, mock-only repository suite passed; hosted integration tests remained skipped by contract. |
| 2026-09-12 | `git diff --check` | 0 | No whitespace errors. |
| 2026-09-12 | Focused review-feedback verification: direct TypeScript, ESLint, JSON parse, and scoped `git diff --check` | 0 | Single-active-language implementation and synchronized design records passed static validation. |
| 2026-09-12 | Study Shelf Playwright suite against retained synthetic preview on port 3101 | 0 | 3/3 cases passed: one active language, RTL search separation, centered/equal mobile tabs and icons, focus/search, accessibility, contrast, reduced motion, and no page overflow. |
| 2026-09-12 | In-app browser desktop/mobile inspection | 0 | Arabic mode contained one Arabic heading and zero English headings; English mode contained one English heading and zero Arabic headings/navigation labels; RTL search gap measured 12 px; six mobile columns measured about 60.7 px each with 0 px icon-center offsets. |
| 2026-09-12 | Post-feedback `corepack pnpm verify` | 0 | Full zero-cost repository gate passed after the language, RTL search, and mobile navigation corrections: formatting, lint, strict typing, boundaries, SQL and CI policy, secret scan, 252 unit, 15 local integration, 22 security, 3 evaluation plus 3 synthetic evaluation, 5 load-contract, 5 E2E cases, and the production-safe build/client scan. |
| 2026-09-12 | Post-approval `scripts/verify-agent-readiness.ps1` | 0 | 166 names, 46 local links, 22 synchronized decisions, and 102 task contracts passed. |
| 2026-09-12 | Post-approval `scripts/test-agent-handoff.ps1` | 0 | Isolated committed-snapshot rehearsal passed with a clean reconstructed worktree and truthful blocked-work routing. |
| 2026-09-12 | `git push origin main` | 1 | GitHub rejected the direct update with protected-branch rule GH006: changes must use a pull request and three required checks. No remote branch changed; delivery moved to `wp03/approved-study-shelf`. |

## Negative, retry, and recovery cases

| Case | Expected | Actual | Status | Correlation ID/report |
| --- | --- | --- | --- | --- |
| Unsupported locale query | Resolve to the safe English default | `resolveLocale` rejects `en-US` and `fr`; `/learn` defaults safely | PASS | Focused unit test |
| Required copy accidentally falls back | Test fails if an Arabic required value is empty or identical to English | Every typed key is non-empty and distinct across dictionaries | PASS | Focused unit test |
| Unavailable synthetic unit | Action cannot focus/select an unavailable destination and state is explicit | Disabled unit control plus lock and active-language unavailable copy | PASS | `/learn` rendered inspection |
| Workspace route is not implemented | Foundation must not imply a working destination | Cobalt boundary remains disabled and names WP03-T03 in the selected locale | PASS | E2E and captures |
| Arabic search layout | Leading search icon must not overlap localized placeholder or input text | Icon and input occupy separate logical grid cells; measured separation is 12 px in RTL | PASS | Focused E2E geometry assertion and in-app browser inspection |
| Mobile navigation centering | Six tabs and their icons must be evenly centered without horizontal scrolling | Equal columns differ by at most 0.1 px; all measured icon-center offsets are 0 px | PASS | Focused E2E geometry assertion and in-app browser inspection |
| Mobile focus begins off-screen | Focused card must auto-center without page overflow | Focused card is wholly within 390 px viewport after initial render and focus change | PASS | Mobile E2E geometry assertion |
| Reduced-motion preference | Width and image transitions must be removed; focus scrolling is immediate | Computed transition duration is `0s`; scroll behavior selects `auto` | PASS | Accessibility E2E case |
| External browser request | Synthetic E2E must not depend on remote runtime content | Non-local requests are aborted by the test harness; all cases pass | PASS | Playwright route guard |

## Deviations and defects

| ID | Severity | Description | Owner | Due | Blocks |
| --- | --- | --- | --- | --- | --- |
| WP03-T01-D01 | Process | The worktree already contained unrelated founder planning edits, so no branch or commit was created. The evidence filename uses the current base SHA and explicitly scopes the uncommitted WP03 files. | Ahmed / next delivery agent | Before review commit | Task completion record, not technical review |
| WP03-T01-D02 | Framework | Next.js inserts a hidden metadata node before the first authored body child. The required direction contract remains the first authored child and is present in production server output under seed `30b1cf13`. | Codex | Closed with evidence | None |
| WP03-T01-D03 | Intentional boundary | `/learn` uses deterministic synthetic fixture state and a disabled workspace action because WP03-T03 does not yet provide an authorized catalog destination. | WP03-T03 owner | WP03-T03 | Live catalog behavior only |
| WP03-T01-D04 | Delivery control | GitHub branch protection rejected the explicitly requested direct push to `main`; the same approved commit must pass through a pull request and three required status checks. | Codex / GitHub checks | Before merge | Direct delivery only; technical task remains PASS |

## Security and privacy review

- [x] Repository secret scan passed for the full worktree; the production-safe build separately passed the client artifact secret scan.
- [x] All catalog content and imagery are explicitly synthetic; no student data, private source, patient data, provider payload, signed URL, or real availability state is present.
- [x] No paid provider call, remote runtime asset, live database operation, release action, unlock, deployment, or protected transition occurred.
- [x] Browser console and output were inspected; no errors or warnings remained in the production captures.
- [x] Component code uses semantic local controls and keeps the client boundary at the interactive shelf rather than making server state authoritative in the browser.

## Rollback/disable procedure

Before merge, remove the uncommitted WP03-T01 source, test, asset, design, and evidence files and restore the three scoped existing app files from their prior content. After a future merge, revert the outcome-oriented WP03-T01 application commit. No database, storage, provider, queue, release, or shared-environment rollback is required.

## Decision

The technical and visual gates are green. The build remains synthetic-only and keeps the future workspace destination truthfully disabled. Ahmed inspected the corrected preview and explicitly approved it on 2026-09-12 Cairo time. WP03-T01 is complete; later work must still follow normal task selection and every open decision or protected-gate block.

| Name | Role | Decision | Date |
| --- | --- | --- | --- |
| Codex `/root` | Agent executor | TECHNICAL PASS | 2026-09-12 |
| Independent Impeccable reviewer | Visual finish reviewer | SHIP | 2026-09-12 |
| Ahmed | Ordinary human checkpoint | PASS | 2026-09-12 |
