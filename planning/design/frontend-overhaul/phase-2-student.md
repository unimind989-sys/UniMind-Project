# Phase 2 student implementation

Status: ready for the student rendered checkpoint; explicit approval pending.
Direction: [DESIGN.md](../../../DESIGN.md), approved candidate `ab568b6`.

Task: WP03-T09, `codex/wp03-complete-synthetic-frontend`, single executor.
No merge, deployment, task closure or WP04 continuation is claimed. Batch Leader,
Admin and final consistency implementation/checkpoints follow student approval.

## Trust map before implementation

- Authority: verified Supabase identity, ACTIVE profile/current consent, unrevoked
  database roles and caller-scoped catalog RPCs. Client role, academic selection
  and appearance never confer authority.
- Untrusted inputs: return destinations, catalog identifiers, profile form fields,
  local theme value and route/locale queries.
- Recompute: validate internal destinations; obtain roles for the verified caller;
  validate the complete academic hierarchy against authorized catalog rows;
  profile updates target only the verified caller and retain RLS. Availability
  is rechecked on every workspace entry.
- Allow proof: eligible callers save their catalog preference, reload and reuse
  it; theme bootstraps and controls use only System/Light/Dark.
- Deny proof: anonymous/suspended/nonconsenting callers, forged foreign profile
  IDs and mismatched/revoked catalog selections cannot save or gain access.
- Staleness: re-resolve saved hints against current catalog; invalid preferences
  prompt correction. Revocation remains effective despite old saved selections.
  Theme storage denial falls back to System and keeps controls usable.
- Exposure: no profile IDs, provider payloads, private inputs or signed URLs in
  screenshots/logs. Local appearance stores only a validated preference; synthetic
  profile selections remain document memory and are not real persistence proof.
- Resume links reuse existing open chat sessions, never chat content. Read only
  the verified caller's current cohort and authorized units under RLS; recheck
  the returned scope and UUID before constructing an internal destination. A
  failed read or revoked scope omits the link. This is the most recently created
  open session, not a new progress or last-visited tracker. Subject switching
  receives only current authorized catalog names/IDs and rechecks access on entry.

## Implementation and verification budget

Shared brand/tokens/appearance; public/auth entry; account academic settings;
Study/Subjects; continuous Materials/Chat/Studio/Quiz/viewer. Preserve current
deterministic generation boundaries. Add only a profile preference field if
required; no provider, worker, storage service or dependency changes.

Focused rejecting checks during edits: TypeScript/module boundaries, affected
domain and auth/security tests, caller-scoped persistence/denial proof, synthetic
student flow checks and bounded rendered inspection. Broad verification is run
once on the accepted stable product-wide candidate. Passing proof is invalidated
only by changes to its inputs. Required migration proof remains pending until
executed; source inspection is not a PASS.

## Implemented scope and preserved behavior

| Surface | Change | Capability retained |
| --- | --- | --- |
| `/` | Anonymous landing with exact slogan, actual Studio screenshots, steps, CTA/footer; verified role default home | Current verification/consent gates and validated deep links |
| Auth routes/callback | Compact identity form, native labels/autocomplete, current-step status | Registration, verification/replay, reset/recovery, generic provider errors, locale and return validation |
| Shared shell | Supplied Open Folio Brand; semantic Light/Dark tokens; System/Light/Dark; student Study/Subjects/Account | Auth remains server-owned; locale changes preserve document-local inputs/output language; logo remains LTR |
| `/learn` | One-time academic setup, focused current-period Shelf and searchable Subjects | Caller catalog hierarchy, Medicine Module naming, availability and safe denied/error/empty recovery |
| `/settings` | Real Account with Appearance, academic settings and sign-out | Own-profile model; synthetic privacy/retention/account controls and return to study remain available |
| Unit workspace | One context, native unit switch, Materials/Chat/Studio/Quiz navigation | Authorized workspace guards, unit/session separation and existing planned-tool boundaries |
| Chat/Studio/viewer/report/quiz | Reading hierarchy, plain copy, contextual returns, native six-type selection | First Send creates a session, drafts/history/cancel, seven outcomes, all six fixed artifacts, flashcard flip, MCQ progression, attempt review and exact evidence/report exchange binding |
| Metadata/static assets | Supplied favicon/app icons and exact allowlisted brand/screenshot files | Synthetic API/server-action/write rejection and normal Auth refresh behavior |

Changed implementations live under `src/app/_components/`, `src/app/learn/`,
`src/app/(auth)/`, `src/app/settings/`, `src/lib/account/`, `src/lib/theme/`, root
layout/styles/entry and `src/proxy.ts`. Current source hashes are in the
[manifest](student-checkpoint/manifest.json). Shared token aliases keep other
existing role surfaces functional; this does not accept their design or finish
their task-oriented overhaul. No product functionality was removed to fit the UI.

## Minimal backend and persistence changes

The existing profile has no academic-context field. The required persistence
therefore adds nullable versioned `profiles.academic_context` in migration
`20260930220000_profile_academic_context.sql`, a column-specific update grant and
an invoker trigger. The application and database independently validate the
complete hierarchy against the caller's available catalog. Cross-user RLS and
current consent/account gates remain in place. Generated types include the new
nullable field; regeneration parity is pending. There is no new table, membership,
provider, queue, worker, source-storage behavior or dependency.

Appearance uses only local `unimind.appearance.v1`, because the profile has no
theme field. It validates System/Light/Dark, applies before first paint, updates
`theme-color`, follows OS changes and stays usable if storage is denied. Academic
settings are durable account data; appearance is a device preference. Synthetic
academic state intentionally resets per document and is not persistence proof.

Real default-role routing reads the verified caller's unrevoked roles. Resume
reads an existing own open chat session in the current cohort/authorized units;
it does not introduce a progress model. Workspace switching reuses authorized
catalog DTOs and rechecks access on entry. These small adapter changes connect
the requested flows without building WP06/WP07 services.

**Database proof is pending.** This checkout is Windows; the repository permits
ephemeral Supabase migration/reset/upgrade/pgTAP/type generation only on its
GitHub-hosted Linux runner. The 12 new SQL assertions have not executed. No hosted
migration was applied. Apply and prove the migration before deploying the new
profile readers. Unit mocks, static SQL checks and demo screenshots cannot prove
durability or RLS execution.

## Focused checks

The [checks record](student-checkpoint/checks.json) retains names, timestamps,
counts, report hashes, failures/replays and measured contrast pairs. Raw reports
remain in ignored `.local/phase2-student/proof/`; they contain only fixed fixtures.

| Check | Observed result and boundary |
| --- | --- |
| Focused unit | 110/110, nine files: academic validation/role entry/resume, caller-scoped account adapter, theme bootstrap, Auth actions/callback/access/proxy, synthetic isolation and workspace scope |
| Authenticated entry adapters | 13/13 after correcting dropped exchange fragments: verified role defaults, explicit session/anchor return, consent/verification/suspension/disabled gates, lookup failure and forged return |
| Normal focused browser | 24/24: auth, landing/foundation, catalog/shelf and guarded workspace; affected auth style replay 7/7 |
| Initial native student | 13/13: EN/AR student flows, all six Studio outputs, deterministic outcomes/cancel and appearance/storage denial |
| Native public/auth AA | Both locale tests passed: 60 cases across EN/AR, Light/Dark, 1440/390/320 and landing/login/register/verify/recovery; zero axe violations |
| Supporting native run | 6 passed, 1 Arabic setup failure from reading document title before navigation finished; preserved as a failed run, not 7/7 |
| Affected replay | Arabic setup and EN/AR student/report replay 3/3 after waiting for destination heading/title; final EN/AR setup plus denied-storage appearance replay 3/3 |
| Chat/Studio geometry and AA | 48 locale/theme/viewport cases at 1440/768/430/390/360/320, including 200% text reflow at 320; initial unaffected proof reused |
| Static checks | Changed TypeScript ESLint, TypeScript, module boundaries, SQL conventions (28 migrations), one owned-style Impeccable detector pass all passed |
| Computed contrast | Minimum tested normal-text pair: Light 4.60:1, Dark 5.15:1; necessary control/focus pair: Light 3.54:1, Dark 4.06:1 |
| Asset integrity | 31 selected supplied dependency hashes and 22 runtime copies match the supplied manifest; four public preview JPEGs match inspected Studio captures |
| Scope/secrets | Changed source/diff and credential exposure reviewed inline; repository secret scan passed for 2,883 files; diff whitespace check passed |
| Pending | Database execution/type parity; broad stable product-wide verification; required exact-head CI; affected production proof; named design receipts |

Tests retain Auth/consent, access/scope and isolation assertions. Changed labels,
native step markup and student layout required corresponding selectors; the
reported Arabic title failure was corrected with destination readiness, without
disabling any axe rule. Passing unaffected proof is reused. No clean broad,
whole-platform WCAG, screen-reader, database or production PASS is asserted.

## Rendered review and corrections

Thirty inspected in-app browser JPEGs are retained under
`student-checkpoint/`. The manifest records nominal CSS viewport, actual raster
dimensions, route, direction, theme, scroll position and SHA-256. In-app capture
scaling produces some 1430×993 and 380×822 rasters for nominal 1440×1000 and
390×844 viewports; these are not mislabeled pixel-exact captures. One obsolete
viewer diagnostic is excluded. Output captures deliberately show the scrolled
artifact; they do not claim a full-page view. This is a representative manual
review, separate from the automated geometry/axe matrix.

| Rendered surface | Inspected scope |
| --- | --- |
| Public | Light EN desktop/AR phone; Dark EN full page/AR phone, exact slogan and actual preview |
| Identity/setup | Dark AR phone login/consent/unconfigured and configured onboarding, disabled dependent fields |
| Shelf/Account | Light EN desktop Shelf/Subjects/Account and phone Account; Dark AR phone Shelf; search and editing |
| Materials/Chat | Light EN desktop eight source rows, empty Chat, streaming status and populated exchange |
| Studio | EN/AR desktop in both themes; Dark AR phone selector, populated/flipped flashcard and keyboard focus |
| Contextual reading | Light EN exchange evidence with processed excerpt/Return to Chat/report; Dark AR source pool/Return to Studio |
| Degraded/quiz states | Dark AR error/retry and denied Shelf; Light EN empty Shelf; Dark AR initial quiz ready state |

The bounded review corrected quiet-control contrast/placeholder styling,
repeated Studio icon/preamble treatments, viewer return placement, artifact focus,
touch geometry, generic student failure titles, report decision-code copy, auth
type scaling and before-paint browser theme color. Clipped or mistimed navigation
captures were rejected and replaced with valid destination captures. No more
visual polish is queued before this checkpoint. The
[inline finish review](student-checkpoint/finish-review.md) covers presentation
only and is explicitly non-independent.

Final source review also corrected Auth redirect fragment loss, preserving the
originating exchange after sign-in/consent. Thirteen focused entry adapter checks passed;
the correction does not change rendered appearance.

## Audit resolution and remaining work

F01–F07, F11–F12, F14 and the student portion of F04/F05/F13 now have implemented
corrections and focused proof; F02/F11 durability remains pending database
execution. F15 current design headers now agree with DESIGN and preserve prior
receipts as historical. F08/F09 mixed upload intake and F10 admin console follow
their required role milestones. Shared-role consistency and the full state
matrix remain for final review.

Existing model generation/source playback, artifact durability, retention/report
policy D-08, storage decision D-18, provider/cap decisions, invitation delivery,
full admin editors and historical ordinary-runtime timeout issues remain separate
follow-ups. Real workspace tools retain honest planned/unavailable states where
the corresponding service is not implemented. The rendered review uses only
invented synthetic material, not real accounts or uploaded sources.

## Student checkpoint

Review the live public page at **http://127.0.0.1:3101/?lang=en** or the connected
student flow at **http://127.0.0.1:3101/login?lang=en**. Continue with the prefilled
fictional account, accept the sample commitments and set academic context. Product
links preserve it until reload; Account switches theme and edits context. The
ordinary runtime's real account persistence awaits database proof above.

Required next action: present this student implementation and request explicit
approval before starting Batch Leader. No current student approval receipt is
invented. Keep the loopback review server and existing branch/draft PR available.
