# WP03-T07 UI and API contracts — local candidate

Task WP03-T07; Ahmed; one Sol High executor, zero workers. D-22 authorizes the non-financial lifecycle. Policy 8: docs/frontend/runtime/auth/tooling, R3, protected. Entry base `7f89ed8`; branch `wp03/ui-api-contract-tests`. No paid resource/provider/cap was enabled.

## Acceptance map

| Requirement | Rejecting proof and limit |
| --- | --- |
| Mock providers only | Playwright overrides all relevant configuration with synthetic credentials, mock mode, telemetry disabled, zero budget and disabled paid provider flags. Browser tests block external requests. |
| Role navigation and forbidden access | Existing auth, catalog, workspace, collection and admin Playwright journeys cover allowed synthetic role screens and forbidden/expired/stale routes. New contracts invoke actual protected URLs with forged role labels and actual anonymous upload API rejection. New production workspace guard tests cover seven access gates, scoped allow/deny, revocation and generic diagnostics. Upload tests prove rejection before parsing bytes/storage. Preview roles never establish actual authority. Unchanged pgTAP suites 17/25/26/27/28 own real Student/Batch Leader/Admin scope, other-user chat isolation and mutation denial; exact-head database CI remains required. |
| Browser/React privacy | Observer checks URL, headers, posted bodies and completed HTML/RSC/JSON for synthetic server keys, raw keys, diagnostics, private source/other-user canaries and serialized fields. It drains before leaving documents/finalizing uploads and rejects unavailable completed product content. Only Next's development HMR manifest (`/_next/static/webpack/*.webpack.hot-update.json`, absent in production) is excluded from response-body reads; its request is still inspected. The test executes RSC navigation, session creation, admin action, upload and finalization. New workspace/campaign adapter tests inject private upstream fields and reject them in public DTOs; existing admin tests strip raw keys/diagnostics. No raw payload body is committed. |
| EN/AR accessibility | Ten surface/locale contracts: WCAG 2.0/2.1/2.2 A/AA axe rules, focused skip links, initial visible focus, 1440/640/390/320px reflow, separate 200% text scaling, normal-size 44px main-control targets, reduced-motion endless-animation rejection, locale/direction and named semantic tree. Existing journeys prove tab/Enter, skip targets, error/review/success focus and interruption. This is not complete WCAG conformance. |
| Spoken screen reader | Accessibility-tree names/headings/forms are separately labeled. Spoken output is unavailable to tools; Ahmed was asked for five-screen EN/AR Narrator/NVDA smoke evidence. **PENDING; no spoken PASS claimed.** |
| Bounded rendered inspection | Codex side browser: five EN desktop screens (1440×900), five AR mobile screens (390×844), compared with approved briefs/DESIGN.md. Inspected hierarchy, loading/empty/disabled states, mixed long synthetic labels, direction, internal rails versus document overflow. Console errors/warnings were empty. Automated observer owns network proof. Second bounded pass updates affected final renders. Screenshots are supplemental. |
| Mandatory gates | Focused proof, guarded `pnpm verify`, exact-head CI, protected delivery and affected Vercel proof. No database/schema/auth/storage runtime semantics changed; no live Supabase write is needed. |

## Demonstrated repairs

White small-text labels on the original cobalt failed contrast. Actions and skip links use existing darker cobalt `#336ae2`; auth text links use existing readable blue `#8db4ff`. DESIGN.md records these uses. No palette replacement, new factual claim, imported UI asset or changed authority boundary.

The rem-based body minimum doubled to 640px at 200% text scaling; it now expresses the approved 320px minimum in CSS pixels. Admin narrow headings/counts/top-bar wrap and its skip link fits. Its horizontal resource nav is focusable with the existing global ring. Auth language/secondary links and catalog search/language controls meet 44px at normal text size, including the mobile width override.

Initial run rejected 11/12 (product defects plus harness issues). Subsequent runs narrowed defects; 11/12 still rejected the focused collection English skip-link contrast. Final affected submission/RSC proof passed 3/3. Harness corrections preserve rejection: drain before navigation/finalization, label hit bounds for clipped file inputs, normal-size touch measurement, compile-aware waits and explicit completed-response inspection failure. Failed runs never count as PASS.

## Integrated Impeccable audit

Implementation integrity: coherent approved Study Shelf, Access Shelf, scoped collection desk and decision queue. Native forms/navigation, explicit mock boundaries and existing Client Component inputs remain intact.

| Dimension | Score | Evidence/disposition |
| --- | --- | --- |
| Accessibility | 3/4 | Automated AA/focus/semantic proof; spoken check pending, no complete-conformance claim. |
| Performance | 4/4 | CSS and one tabindex; dev-only scanners; no new runtime import/asset/animation/measurement loop. Scoped inspection, not a benchmark. |
| Responsive | 4/4 | Rejecting reflow/text-scale/touch contracts and bounded renders. |
| Theming | 3/4 | Existing tokens reused; inherited metadata advisories explicitly retained. |
| Integrity | 4/4 | Product-specific scope/status composition and authority boundaries preserved. |
| Total | 18/20 | Scoped score does not waive any acceptance gate. |

Pinned Vercel web guidelines were read in full. Applicable native labels/semantics, focus replacement, polite status/alerts, paste/password semantics, logical CSS, Intl dates, reduced motion and truthful disabled states were inspected with existing rejecting journeys. Task-scoped P1 contrast/overflow/keyboard-scroll/touch findings were repaired. No unresolved material implementation finding remains; spoken verification is an evidence gap.

The first detector run was invalidated by later rejecting-check repairs. One final completed-UI invocation (`node .agents/skills/impeccable/scripts/detect.mjs src/app --json`) returned **exit 1**, with 34 advisories: 20 type-size, 7 radius, 7 color metadata discrepancies. Every corresponding source declaration was compared with entry HEAD; all 34 were inherited unchanged. Locations: auth CSS 22/101/150/416/492; catalog CSS 57/61/133/163/189/237/253/367/395/471/476/527/688/708/734/742/767/783/787/987/1016/1025/1033/1039; workspace CSS 203/296/432 (later line shifts possible). P3 disposition: documentation/token completeness debt on approved incumbent compositions; preserve styles, do not silently redesign or repair skill/context drift. No new finding; detector exit 1 is not labeled green.

## Import provenance

| Import | Exact source/version | License | Copies/modifications |
| --- | --- | --- | --- |
| `@axe-core/playwright` | npm 4.13.0, `dequelabs/axe-core-npm`, package gitHead `70dca949a4e55e2fb83e4e6896fbbf788c56b6fd`; lock integrity pinned | MPL-2.0 | Dev-only test import; no copied/patched source. |
| `axe-core` | 4.13.0, `dequelabs/axe-core`; already in entry lockfile, now also used via axe Playwright | MPL-2.0 | Test-time scanner; no copied/patched source. |
| `playwright-core` | 1.62.1, `microsoft/playwright`; existing exact Playwright version promoted to direct dev pin to avoid resolving the CLI's unrelated alpha peer | Apache-2.0 | No copied/patched source. |
| UI/media | Existing repository components and earlier approved manifests | Existing provenance retained | No imported component/image/video/font. Synthetic local screenshots generated for this task. |

No added package enters runtime modules. Source scan found no new telemetry/CDN/remote asset/browser-data boundary. Existing Manrope/Noto Sans Arabic use `next/font/google` build-time download/self-hosting, not newly introduced mutable browser CDN imports. External test requests are blocked. No `.env`, private source/log, ordinary chat or credential value is committed.

## Results and handoff

- Pinned Node 24.19.0/pnpm 10.34.5; frozen install recovered after power interruption.
- Adapter unit proof: 10/10, exit 0. Production guard/upload security: 13/13, exit 0.
- Earlier focused typecheck/targeted ESLint: exit 0; renewed broad proof covers all final executable repairs.
- Broad gate rejected 50/51 browser tests; all 12 new contracts passed. The pre-existing session-switch test assumed ordinal 1 was its own first-created session; the earlier privacy journey now creates a session for the same synthetic preview caller. Its selector now uses the exact session ID it created, preserving the persistence/switch assertion. This is test order isolation repair; no runtime session behavior changed.
- A focused rerun identified a completed development HMR manifest whose Chromium body was discarded after navigation. Its exact development-only path is excluded; unavailable completed application content still rejects. Original shared-server privacy/session scenario rerun: 2/2, exit 0 (`product-shell-contracts.spec.ts` and `workspace-shell.spec.ts`, grep `RSC|persists`). No diagnostic instrumentation remains.
- Renewed guarded `corepack pnpm verify`: **exit 0**, frozen preparation fingerprint `fef81d7e75b5c8852a6850a5dc4439f67a1a97c70125d2cc001df546b83664ab` verified unchanged at completion. Formatting, lint, both type checks, boundaries, 27-migration SQL audit, workflow/policy checks and secret scan passed. Unit 455/455; integration 15 passed with 2 hosted opt-in skips; security 44/44; evaluation 3/3 plus 3 synthetic foundation cases; load 5/5 and profile validation only; browser 51/51 including all 12 new contracts; safe-environment production build and client-artifact service-role canary scan passed. Local Windows webpack fallback applies only to the dev test server; production build used Turbopack. Broad log is ignored at `test-results/wp03-t07-verify-2.log`, not committed.
- Proof-record and contract clarification edits after that frozen run change no executable input. Runtime proof is reused; final Markdown formatting, readiness, secret scan and full diff review cover those metadata edits. Exact-head required CI is read from the branch's associated PR; source/task completion remains pending. Development logs contain inherited color-environment/Fast Refresh warnings; the separate bounded side-browser console inspection was empty.
- Exact-head review/merge/deployment/production: not delivered. Author identity `unimind989-sys`; required branch checks `application`, `dependency-audit`, `database-ci`, `ci-selector`, plus one formal approving review. No protection bypass, approval or merged result claimed.
- **Spoken check pending. Do not close WP03-T07, merge or promote until the acceptance gap is resolved.**

## Required spoken smoke handoff

Use Narrator or NVDA on the reviewed synthetic candidate, with `?lang=en` then `?lang=ar`: `/login`; `/preview/learn`; `/preview/learn/zagazig-university-human-medicine-year-1-term-1-cohort/zagazig-university-human-medicine-y1-t1-anatomy`; `/preview/batch-leader/campaigns/11111111-1111-4111-8111-111111111111`; `/preview/admin`. Check meaningful landmarks/headings/control names, reading order, keyboard focus and selected language. Exercise one error/status announcement on auth, catalog, submission and admin; inspect the workspace's scoped session and disabled messaging state. Use only generated synthetic files/mock actions. Record reader/version, candidate URL or commit, date and EN/AR result per screen, including any missed/doubled announcement or confusing focus. Missing spoken evidence is a verification limitation, not missing D-22 authorization.

Rollback: revert task-scoped code/tests/dependency pins; after any promotion restore prior verified Vercel artifact if health fails, preserving database/audit history. No migration/grant/RLS/storage change.
