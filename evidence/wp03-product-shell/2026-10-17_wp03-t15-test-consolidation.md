# WP03-T15: test consolidation gate report

Sanitized gate record for WP03-T15 (consolidate tests, CI and the synthetic render paths). It records what the browser suites prove before and after the consolidation, where every removed or merged test now lives, and which properties are weaker than before. Task record: [`planning/tasks/wp03-t15-consolidate-tests-render-paths.md`](../../planning/tasks/wp03-t15-consolidate-tests-render-paths.md).

## Identity

| Field | Value |
| --- | --- |
| Scope | Test layers (`tests/e2e`, `tests/e2e/demo`, `tests/e2e-database`, `tests/unit`, `tests/security`, `tests/integration`) after wave 1 (`33a3dc5`), the collection pgTAP addition (`9682730`), wave 2 (`204fb6a`) and the uncommitted wave 3 working tree (file splits, layout-matrix split, `src/proxy.ts` rewrite fix). |
| Commit | Branch `claude/wp03-t15-consolidate-tests-render-path`, pre-merge (working tree on top of `204fb6a`). Baseline: main `af8d1fb`. |
| Environment | Local: Windows 10 Pro, Node via `corepack pnpm`, Playwright 1.62.1 Chromium, Next dev server on `127.0.0.1` with synthetic configuration only (`PROVIDER_MODE=mock`, zero provider budget, invented Supabase URL). CI: GitHub-hosted Linux runners (`static`, `node-tests`, sharded `e2e`, sharded `e2e-demo`, `database-ci` with an ephemeral local Supabase). |
| Dataset | Synthetic fixtures only (`src/lib/demo`, `supabase/seed`); no real student data, sources or credentials. |
| Executor | Claude Code sub-agents orchestrated by Claude Code. |
| Review provenance | Independent review sub-agents (separately running, read-only) examined the branch for coverage gaps; their findings drove the additions below and the gap list in this report. Mapping tables were derived by read-only sub-agents from the specs and spot-checked against `playwright test --list`. |
| Rollback | Revert the squash commit. No data, schema or external state is involved. |

## Results

| Command | Result |
| --- | --- |
| `corepack pnpm test:e2e` (main suite, 1 worker) | Final run: 39 passed in 4.7 min (exit 0). An earlier full run on the same tree had 38 passed and 1 failed (see deviations); `auth-flows.spec.ts` then passed 9/9 alone and the full rerun passed. |
| `PW_WORKERS=2 corepack pnpm test:e2e:demo` (demo suite) | 183 passed in 23.4 min (exit 0); one run, no retries. |
| `corepack pnpm exec eslint tests --max-warnings=0` | Exit 0. |
| `corepack pnpm typecheck` | Exit 0. |
| `corepack pnpm exec prettier --check` (changed test files and this report) | Exit 0. |
| `tests/e2e-database` (`database-ci`) | Not runnable locally (it asserts a GitHub-hosted Linux runner and an ephemeral Supabase). Proof is the required `database-ci` check on the PR head. |

### Counts per layer

| Layer | Before (`af8d1fb`) | After (this branch) | Source of the count |
| --- | --- | --- | --- |
| Main browser suite (`playwright.config.ts`) | 146 runs, 9 files | 39 runs, 5 files | `playwright test --list` before (scratch capture at `af8d1fb`) and now. |
| Demo browser suite (`playwright.demo.config.ts`) | 284 runs, 1 file (`native-product-demo.spec.ts`) | 183 runs, 16 files | Baseline CI log (284 passed); `--list` now. |
| Database browser gate (`tests/e2e-database`) | 8 tests | 10 tests | Spec source. |
| Unit (`tests/unit`) | 972 tests, 68 files | 917 tests, 72 files (includes the two query-plan files moved from integration) | Local Vitest JSON at `af8d1fb`; run now. |
| Integration (`tests/integration`) | 15 passed + 2 skipped, 4 files | 0 passed + 2 skipped, 1 file (the credential-gated hosted Auth test) | CI log before `af8d1fb` (integration files unchanged by `af8d1fb`); run now. |
| Security (`tests/security`) | 44 tests, 10 files | 24 tests, 5 files | CI log and local Vitest JSON; run now. |

Wall time: the baseline main suite took 9.7 min in CI and 15.2 min locally; the baseline demo took 48.5 min in CI on one worker. The after times are in the results table above (local) and in the PR's CI run.

## What this pass added

- **Real-mode accessibility** (`tests/e2e-database/product-shell.spec.ts`, student workspace test): the real Workspace overview and chat page now get the contract the retired `/preview` workspace had, in both locales: WCAG 2.0/2.1/2.2 A and AA axe (same tags and `nextjs-portal` exclusion as `product-shell-contracts.spec.ts`), one `h1`, `lang`/`dir`, a visible keyboard focus indicator after Tab, reflow at 1440/640/390/320 px and at 320 px with 200% text (with a second axe pass there), and no endless animation under reduced motion. It runs only in `database-ci`; it was type-checked and linted locally but not executed.
- **Retired routes** (`tests/e2e/hosted-synthetic-login.spec.ts` › normal Auth and direct protected routes cannot acquire synthetic access): `/synthetic-runtime/admin`, `/wp03-review.html`, `/preview/learn`, `/preview/admin?state=containment`, `/api/preview/x` and a POST to the retired preview upload route each answer 404 with no `Set-Cookie`.
- **Unavailable admin queue** (`tests/e2e/demo/admin.spec.ts` › queue recheck submits nothing and low decisions reveal their details [ar]): before the recheck, the unavailable queue shows no decision list and no reason field. The baseline's *persistent* case could not be restored: the synthetic runtime's `?fixture=error-page` recovers on the first recheck (`src/app/_components/product-admin.tsx`, `queueVersion > 0`), so "still unavailable and still enabled after a recheck" is not proven by any suite now. The loader side (`loadAdminActionQueue` returns `UNAVAILABLE` for malformed rows and hides exception detail) stays proven in `tests/unit/admin-actions.test.ts`. Restoring the UI property needs a non-recovering synthetic fixture (a `src` change, out of scope here).

## Failures and deviations

- **Dev-server rewrite bug (fixed by the orchestrator in `src/proxy.ts`).** Loopback demo rewrites were built from `request.nextUrl`, which reports `127.0.0.1` as `localhost`; Next then proxied the rewrite over HTTP, and three demo runs failed with `Failed to proxy … ECONNRESET` / `socket hang up` (`demo/auth.spec.ts:5`, `demo/layout-matrix-routes.spec.ts:55` en and ar). The rewrite now starts from `request.url`.
- **One main-suite failure that did not reproduce.** The first full `test:e2e` run on this tree failed `auth-flows.spec.ts:127` › learning routes reject missing verified sessions. `toHaveURL(/\/login\?lang=en&next=%2Flearn$/u)` timed out after 5 s. The page was still at `http://127.0.0.1:3100/learn` and Playwright was "waiting for … /login?lang=en&next=%2Flearn navigation to finish", so the redirect had started. The dev server had just started and printed `Slow filesystem detected. The benchmark took 2035ms`. This is the first test that requests `/learn`, so the on-demand compile is the likely cause. The spec passed 9/9 in isolation, and the whole suite passed 39/39 on the rerun. This report records it as an unexplained single failure, not as a pass.
- The `Results` timings are local runs on a slow filesystem. The main suite ran on 1 worker and the demo on 2 (`PW_WORKERS=2`). CI shards differ.
- No test was retried, skipped or given a longer timeout to pass. No screenshot of a passing test was kept.

## 200%-text reflow defects fixed

The wave-1 layout matrix found four screens that scrolled horizontally at 320 px with 200% text and opted them out with `enlargedReflow: false`. All four are fixed and the opt-out no longer exists; every layout-matrix state now checks reflow at 320 px with 200% text in both locales and both themes.

| Screen (layout-matrix state) | Cause | Fix |
| --- | --- | --- |
| Material library opened from a quiz, Arabic (`layout-matrix-study` › the material library opened from a quiz keeps its return) | The long return link took the whole auto column and left its note a zero-width track. | `product.module.css`: `.sourceContext` is an inline-size container; below 15rem its link and notes span the full row. |
| Dense leader campaign titles (`layout-matrix-roles` › three assigned campaigns keep unclipped titles) | Long unbroken campaign titles. | `collection.module.css`: `.campaignList h3 { overflow-wrap: anywhere }`. |
| Admin campaign invitation example (`layout-matrix-roles` › the campaign invitation example stays readable before review) | Long unbroken text in the admin panel paragraphs. | `admin.module.css`: `.panel p { overflow-wrap: anywhere }`. |
| Leader expired/replayed fixture pages (`layout-matrix-roles` › a denied fixture (…) offers a readable safe exit) | Long recovery heading in the shared fixture recovery panel (`src/app/_synthetic/screen-frame.tsx`). | `product.module.css`: `.panel h2 { overflow-wrap: anywhere }`. |

## Known coverage gaps

These are weaker or missing compared with the baseline. They are recorded rather than hidden; none was reported as a pass.

1. **Admin queue:** a persistently unavailable queue after recheck (see above); focus moving to the success and the "could not be verified" messages; the "other verified founder" dialog notice; the two blocked-readiness messages as visible text; the Arabic second-founder confirmation button (English only).
2. **Intake mechanics:** drag-and-drop; the "Requested item" picker for an ambiguous file (unit tests only); the file input being disabled during upload; a fresh per-file key after cancel; opening the file chooser with Enter; retries now come from simulated failures (rights-field corruption, navigation detour), not network or server-action aborts. Wrong and expired campaigns now show different copy, and a real-mode expired campaign has no browser test (pgTAP `27_batch_leader_collection_flow.sql` covers the database side).
3. **Real-mode Study Shelf:** the `/preview` catalog form and its pending-navigation guard were removed with the route. The real `StudyShelf` locked / no-membership / unpublished / no-ready-source / error states have no browser test (synthetic equivalents and unit tests remain), nor does forward navigation or a unit-page reload.
4. **Real-mode surfaces without axe:** the real `/learn` catalog, the real campaign page and the real admin page (the shared components are swept in the demo with synthetic data). The workspace CDP platform-font, body-weight, `font-size-adjust` and clipped-control checks are gone.
5. **Hosted-only wording:** the copy that hosted entry substitutes for demo text is no longer asserted in a browser: the Shelf note "Only your latest work is shown here.", the missing-attempt recovery text and its "Start attempt" link, the report labels "Report answer" / "Report received.", the admin labels "Review invitation" / "Invitation reviewed." / "Review campaign invitation" / "Inspect student conflict", and the absence of demo notes on hosted campaign and admin pages. `tests/unit/product-review-copy.test.ts` covers one key of that override. Hosted entry ignoring `?fixture=corrections` is also unasserted (the hosted spec checks `fixture=dense` and the prepared campaigns).
6. **Smaller journey assertions:** leader History receipts surviving a language switch; "Incorrect" / "Correct answer" on an expired unscored review; audit batch 11's completed review across a Settings detour, theme change mid-setup and "Edit Education stage" reset.
7. **Database and unit:** no test proves the `for update` row locks in the admin and collection functions, or that retrieval applies authorization before the candidate limit under many rows; the workspace RPC's lack of a `reason_codes` column is only checked adapter-side; the literal localized founder names (Ahmed/أحمد, Ziad/زياد) are no longer asserted; `rls-matrix-contract` no longer pins the matrix size (exact sets stay pinned by `17_actor_action_resource_matrix.sql`).
8. The `reactPayloads > 0` assertion of the deleted RSC test is gone, and no browser test submits a real admin action (page/RSC/JSON privacy inspection lives in the database gate's request inspector).

## Demo suite mapping (284 → 183)

Baseline: 284 runs in `tests/e2e/native-product-demo.spec.ts`. Now: 183 runs in 16 specs under `tests/e2e/demo/`.

- **284 baseline runs:** 143 moved with behaviour intact; 104 merged as the other-locale twin of a single-locale journey; 18 merged by a documented rewrite (B08-B fixture families, public/auth matrix, admin sections, leader invitation); 19 moved wholly into the layout matrix. No run was removed without named coverage.
- **Wave 1 to now (182 → 183):** the layout matrix was split into `layout-matrix-roles` (8), `layout-matrix-routes` (6), `layout-matrix-student` (8) and `layout-matrix-study` (6) with a shared harness in `tests/e2e/support/layout-matrix.ts`; the three prepared-history journeys moved from `chat.spec.ts` to `chat-history.spec.ts`; wave 2 added `admin.spec.ts` › empty and forbidden queues fail closed; outcomes and the first founder are announced (retargeted from the deleted `/preview` admin-queue spec).
- **Locale:** each journey runs in one locale, alternating en/ar. `rtl.spec.ts` keeps 19 runs that test locale or RTL behaviour in both locales (B09 inspection links and delayed locale, B03 numbered progress and Arabic numerals, bilingual practice, demo-date formatting for receipts and invitations, tab arrow-key direction, quiz clock numerals, direct language switch for three roles). Every screen state is swept in both locales by the layout matrix.
- **Layout matrix:** per state, both locales and both colour schemes, reflow at 1440/390/320 px and at 320 px with 200% text, plus axe. It adds what the source did not always check: the dark scheme and 200% text for every state. The four wave-1 opt-outs from 200% text reflow are fixed (section above); no state is exempt.
- **Reduced:** B07-B per-program Studio reflow/axe (four programs) is covered for the human-medicine program; the other three keep label and destination assertions in the journey. B07-A per-path review reflow is covered for one path. Second-admin shell geometry is covered by the shared admin states plus a second-admin Account state. M52 axe after a two-founder confirmation is covered by the admin queue and hold-form states.
- **Removed:** `waitForTimeout(1200)` (×2) replaced by a controlled clock (`page.clock.runFor(1_200)`); 24 passing-test screenshots (the `UNIMIND_FRONTEND_AUDIT` opt-in capture is kept in the route sweep).

## Non-e2e deletions and their equivalents

From `git log af8d1fb..HEAD` and `git diff --stat af8d1fb -- tests`. Wave 1 removed tests that duplicated a unit or pgTAP proof or only grepped migration text, merged the upload-handler tests, and rewrote chain-mock adapter tests to assert behaviour. `9682730` added pgTAP proof that collection functions reject expired assignments and non-open campaigns.

| Deleted | Named equivalent now | Gap |
| --- | --- | --- |
| `tests/integration/provider-mock.integration.test.ts` | `tests/unit/provider-contracts.test.ts`: normalized zero-cost metadata per harness, "never calls fetch across the complete deterministic case matrix", "answers cite exactly the supplied evidence segments". | The literal mock answer text. |
| `tests/security/availability-matrix.test.ts` | `tests/unit/availability.test.ts` (every predicate, simultaneous catalog locks, stable reason order); `supabase/tests/18_*.sql` (each predicate fails independently). | None. |
| `tests/security/admin-actions-boundary.test.ts` | `supabase/tests/28_audited_admin_actions.sql` (no founder identities or approvals seeded, service-role-only RPCs, stale version, prerequisite revision, version increment, owner-review retry, queue return type without private keys); `tests/unit/sql-conventions.test.ts` (security-definer rules); `tests/unit/admin-actions-supabase.test.ts`. | `for update` row locks; a hold on a non-`synthetic/` object key. |
| `tests/security/collection-boundary-contract.test.ts` | `supabase/tests/27_batch_leader_collection_flow.sql` (private evidence, rights, expired/closed/draft/cancelled campaigns, registrar and finalizer grants, cross-actor finalization, draft-unit label); `17_actor_action_resource_matrix.sql` (no direct insert). | `for update` row locks; invoker status of `current_batch_leader_campaign` is implied by `sql-conventions`, not asserted. |
| `tests/security/retrieval-scope-contract.test.ts` | `supabase/tests/19_server_only_retrieval_scope.sql` (private vectors, service-role-only function, unit pool, cross-cohort and cross-program canaries, rights and readiness removal, forged user, HNSW cosine index and operator, GIN full-text); `17` and `16` (locked releases and unit metadata). | Authorization-before-limit ordering under many rows; segment-level edition mismatch. |
| `tests/security/workspace-scope-contract.test.ts` | `supabase/tests/26_unit_workspace_shell.sql` (stable security-invoker function, exact scope, forged unit, inactive member, locked release, grants); `tests/unit/workspace-supabase.test.ts` (strips private fields). | `reason_codes` absence from the DB return type. |
| `tests/unit/collection-upload-handler.test.ts` | Merged into `tests/security/product-shell-upload.test.ts` (oversized request before identity work, unverified caller before reading content, unavailable assignment before reading bytes). | No longer asserts that the campaign was loaded exactly once. |

Moved without change: `availability-query-plan` and `retrieval-query-plan` (integration → unit). Changed with net removals: `tests/security/rls-matrix-contract.test.ts` (pinned table/function/row counts replaced by a non-empty check; the exact set match stays), `tests/unit/admin-copy.test.ts` (localized first-founder names case removed), `tests/unit/auth-entry-routing.test.ts` (pass-through mocks removed, no cases). `tests/security/product-shell-upload.test.ts` gained cases and now runs the real collection modules.

## Main suite mapping (146 → 39)

Notation: `spec › title [locale]`. "demo/" specs run under `playwright.demo.config.ts`; "e2e-database" is `tests/e2e-database/product-shell.spec.ts` (CI only). "Same title" means the test still exists in the same spec with the same title.

### Unchanged (37 runs)

| Baseline | Now |
| --- | --- |
| `auth-flows.spec.ts`: all 9 tests | Same titles (unchanged spec). |
| `foundation.spec.ts`: both tests | Same titles. |
| `landing-experience.spec.ts`: all 7 runs | Same titles. |
| `product-shell-contracts.spec.ts` › public release metadata uses server configuration without private data | Same title. |
| `product-shell-contracts.spec.ts` › auth en / auth ar: accessibility, focus, reflow, motion and privacy | Same titles, same `/login` path. |
| `product-shell-contracts.spec.ts` › protected direct URLs and upload API reject anonymous and forged role inputs | Same title; also e2e-database › anonymous: protected routes and upload mutation remain unavailable. |
| `hosted-synthetic-login.spec.ts` › hosted student: study memory, locale, sign-out, refresh and new-document isolation | Same title. |
| `hosted-synthetic-login.spec.ts` › normal Auth and direct protected routes cannot acquire synthetic access | Same title, now also covering every retired route (404, no cookie). |

### Retargeted from `/preview` (8 runs)

| Baseline | Now |
| --- | --- |
| product-shell-contracts › catalog en / ar | Same titles; path `/preview/learn` → hosted `/learn` for an invented student. Real `/learn` catalog: no axe (gap 4). |
| product-shell-contracts › workspace en / ar | Same titles; hosted synthetic unit page. Real overview and chat: e2e-database › student: real workspace overview… (axe, focus, reflow, 200% text, reduced motion, en and ar). |
| product-shell-contracts › submission en / ar | Same titles; hosted `/batch-leader/campaigns/sample-campaign` (shared intake component). |
| product-shell-contracts › admin en / ar | Same titles; hosted `/admin` (shared decision queue). |

### `hosted-synthetic-login.spec.ts` (78 baseline runs)

Hosted entry runs the same browser-only runtime as the loopback demo, so behaviour journeys live in the demo suite; the hosted spec keeps one journey per role from the real login, fixture selectors staying local, document-local memory and sign-out, and real Auth denial.

| Baseline | Now |
| --- | --- |
| hosted en student / ar leader / en admin / ar second-admin: normal login and browser-only role navigation | Same titles. |
| hosted ar student / en leader / ar admin / en second-admin: normal login and browser-only role navigation | Removed other-locale twin; the role keeps its journey in the other locale (row above). |
| merged B01 M53 hosted campaigns ar: prepared assignments stay out of ordinary hosted entry | Same title. |
| merged B01 M53 hosted campaigns en | Removed twin of the ar run above. |
| merged B01 M53 hosted en: ordinary entry ignores the local density fixture | Same title. |
| merged B01 M53 hosted ar: ordinary entry ignores the local density fixture | Removed twin of the en run above. |

Hosted twins of native demo journeys (same body, hosted entry instead of demo sign-in). The behaviour lives in the demo journey; hosted entry itself is covered by the role journeys above.

| Baseline (hosted) | Now (demo) |
| --- | --- |
| merged B09 hosted en / ar: delayed inspection preserves a newer request and locale | rtl › delayed inspection preserves a newer request and locale [en] and [ar] |
| merged B09 hosted en / ar: request-first intake, three receipts, exact latest return and accessible reflow | leader-collection › request-first intake records three receipts and returns to the exact latest request [en]; layout-matrix-roles › Batch Leader intake, History, Account and fixtures |
| merged B09 hosted en / ar: named uploads reject a wrong format and retain two request bindings | leader-collection › named uploads reject a wrong format and retain two request bindings [ar] |
| merged B08-D hosted en / ar: cancellation keeps the aid and MCQ hides stale generation guidance | studio-quiz › cancellation keeps the aid and MCQ hides stale generation guidance [en] |
| merged B08-D hosted en / ar: six purpose choices use five aids and one complete MCQ flow | studio-quiz › six purpose choices use five aids and one complete MCQ flow [ar]; layout-matrix-study › Chat, Studio, Quiz and report states |
| merged B08-D hosted en / ar: MCQ navigation keeps the prior quiz identity answers and original deadline | studio-quiz › MCQ navigation keeps the prior quiz identity, answers and original deadline [en] |
| merged B08-C hosted en / ar: expired unscored corrections retain enabled passages and exact source returns | sources-evidence › expired unscored corrections retain enabled passages and exact source returns [ar] |
| merged B08-C hosted en / ar: inactive current reading preserves aid and submitted-quiz passages | sources-evidence › an inactive current reading preserves aid and submitted-quiz passages [en] |
| merged B08-C hosted en / ar: library separates tool availability and supplied processed reading | sources-evidence › the library separates tool availability from supplied processed reading [ar]; layout-matrix-student › first-run setup, Shelf, subjects and materials; layout-matrix-study › dense study history and long titles |
| merged B08-C hosted en / ar: five generated aids open their passages directly and retain one distinct full library | sources-evidence › five generated aids open their passages directly and retain one full library [en]; layout-matrix-study › Chat, Studio, Quiz and report states |
| merged B08-C hosted en / ar: every quiz explanation opens only its exact supporting passages with locked answers | sources-evidence › every quiz explanation opens only its exact supporting passages with locked answers [ar] |
| merged B08-B hosted en / ar: unsupported and conflicting replies preserve drafts sources and copyable clarification | chat › unsupported and conflicting replies preserve drafts, sources and copyable clarification [en]; layout-matrix-study › Chat, Studio, Quiz and report states |
| merged B08-B hosted en / ar: current inactive-source guidance retains history and recording-backed next steps | chat › current inactive-source guidance retains history and recording-backed next steps [ar] |
| merged B08-A hosted en / ar: explicit replacement and directional flashcards preserve cancellation and course memory | studio-quiz › explicit replacement and directional flashcards preserve cancellation and course memory [ar]; layout-matrix-study › Chat, Studio, Quiz and report states |

Hosted-only journeys (no native twin). Each row covers the en and ar runs.

| Baseline (hosted, en and ar) | Now | Not covered now |
| --- | --- | --- |
| merged B07-C: named work and direct start retain ordinary login, drafts and reload limits | student-entry › named latest work retains exact conversations, five aids, MCQ entry and quiz state [ar]; › honest named starts keep four program catalogs separate [en]; › the Shelf reflects an expired quiz without restarting its attempt [en]; hosted › hosted student: study memory… (reload returns to `/login`) | Hosted Shelf note "Only your latest work is shown here." |
| merged B07-B: four ordinary accounts retain visible identity, neutral theme and privacy access | settings-account › account identity, neutral appearance and sign-out stay visible across settings for student / leader / admin / second-admin [ar]; layout-matrix-student › student Settings tabs; layout-matrix-roles › admin Account, second-admin Account, Batch Leader intake…; hosted role journeys (Theme group) | Identity labels in en. |
| merged B07-B recovery: configured missing-attempt text retains ordinary recovery scope | layout-matrix-routes › student routes reflow, keep direction, focus and axe (visits the missing attempt; reflow and axe only) | Missing-attempt text and its "Start attempt" link (both locales). |
| merged B07-A: shortened school setup and current-path return keep ordinary study memory | student-entry › determined choices skip questions while four complete paths retain review and Back [en]; › changing path reconciles Settings and Shelf while the old quiz and draft remain intact [ar]; layout-matrix-student | Path change only in ar. |
| merged B06: normal student context and study options survive compact navigation | chat › compact context and a principal reading scroll preserve study work [en]; rtl › visible navigation, separated return and compact settings [en] and [ar]; layout-matrix-study › Chat, Studio, Quiz and report states | Study option plus draft across Sources only in en. |
| merged B05-B: catalog receipt and exact resource return survive ordinary navigation | admin › named resource action and preview detours return to the exact work [en]; › saved and unsaved catalog choices survive navigation and require fresh review [ar]; layout-matrix-roles › Admin sections and governed previews | Unsaved catalog choice across a student-preview detour. |
| merged B05-A: named containment and exact pending review retain safeguards | admin › twelve exact presentations and five clean containment receipts [ar]; › a pending hold retains its original version and exact read-only proposal [en]; › queue recheck submits nothing and low decisions reveal their details [ar] | None. |
| merged B04: first receipts, mobile status and replacement survive ordinary navigation | leader-collection › three-file detours, interruption, receipt retry and truthful replacement [ar]; › a stale retained correction receipt cannot omit its intent and finalize [en]; layout-matrix-roles › Batch Leader intake… | Hosted ignoring `?fixture=corrections`; History receipts across a language switch. |
| merged B03 finish: retained timed setup, canonical review and fresh repeat | rtl › setup draft, numbered progress, canonical review and comparable repeat [en] and [ar]; studio-quiz › quiz setup validates each field and isolates drafts by unit and account [ar] | None. |
| merged B03 M27: expired corrections survive ordinary source and Settings returns | studio-quiz › expiry preserves 0 / 2 / 6 of six answers as unscored review [ar]; settings-account › Settings detours consume the original quiz timer [en]; sources-evidence › expired unscored corrections retain enabled passages and exact source returns [ar]; layout-matrix-study › expired quiz review | "Incorrect" / "Correct answer" on an expired review. |
| merged B02 M75: named Settings return retains the exact quiz attempt and review | settings-account › Settings returns to the actual quiz attempt and review [ar]; › Settings detours consume the original quiz timer [en]; › invalid and foreign attempts never replace the recent quiz [ar]; › Quiz setup and the named Shelf resume keep the same route [en] | None. |
| merged B02 M64: attempt and review source returns preserve quiz selections | sources-evidence › a partial attempt returns from sources with its selections and locale [ar]; › submitted review and replacement returns stay exact [en] | None. |
| merged B02 M15: Studio sources cannot report the earlier Chat exchange | sources-evidence › the Studio source library never offers an old Chat report [en]; chat › explicit Chat targets retain locale and reset confirmation for another answer [ar] | Hosted labels "Report answer" / "Report received.". |
| merged B01 M67: ordinary Studio shows distinct bilingual practice and retains it through sources | rtl › extended comparison practice contains distinct bilingual questions [en] and [ar]; studio-quiz › five generated formats reflect settings and MCQ enters one setup [ar]; sources-evidence › the Studio source library never offers an old Chat report [en] | Absence of demo wording in hosted Studio. |
| merged B01 M10: ordinary entry shows the mathematics catalog | student-entry › mathematics setup opens its own subjects [en]; › obsolete and mismatched mathematics scopes are unavailable [ar]; layout-matrix-student › mathematics-track subjects | Absence of demo wording on the hosted catalog. |
| merged B01 M69: source origins remain distinct through ordinary entry and receipt | leader-collection › reference and device entry origins stay distinct [en]; › reference origin survives cancellation and retry alongside rejected device bytes [ar] | No demo note on the hosted intake page. |
| merged B01 M51: ordinary review labels and prepared conflict survive navigation | admin › the invitation action promises review [en]; › the fixed cohort control promises configuration review [ar]; › conflict preview opens its supported disagreement and keeps ordinary work [en]; › a second admin can inspect the same fixed conflict [en]; › unavailable and non-admin views cannot prepare the conflict [ar] | Hosted admin labels; conflict round-trip only in en. |
| audit batch 11: interrupted setup retains choices and review without saving | student-entry › setup interruption survives Settings and clears on same-document sign-out [en]; › progressive choices, upstream reset, review and distinct destinations [ar]; layout-matrix-student › first-run setup, Shelf, subjects and materials | Completed review across Settings; theme change mid-setup; "Edit Education stage" reset. |

### `admin-decision-queue.spec.ts` (9 runs, deleted: `/preview/admin`)

The demo renders the same `AdminDecisionQueue` component with synthetic data.

| Baseline | Now | Not covered now |
| --- | --- | --- |
| English desktop containment requires a scoped review and announces success | demo/admin › admin changes share availability… [en]; › no implicit decision, local filtering and safe modal focus [en]; › twelve exact presentations and five clean containment receipts [ar] | Focus on the success message. |
| protected and pending founder paths show distinct confirmation state | demo/admin › admin changes share availability… [en]; › empty and forbidden queues fail closed; outcomes and the first founder are announced [ar] | "Other verified founder" notice. |
| blocked readiness remains visible with the action disabled | demo/admin › stale, failed-readiness and unavailable actions never change the candidate [en] | The two readiness messages as text. |
| stale and unavailable results preserve a recoverable scoped review | demo/admin › queue recheck submits nothing… [ar]; › stale, failed-readiness and unavailable actions… [en]; › empty and forbidden queues… [ar]; › a failed hold retains the draft… [ar] | Focus on the "could not be verified" message. |
| Arabic mobile review, keyboard and direction retain the exact scope | demo/admin › admin sections keep resources, the phone menu… [ar]; › empty and forbidden queues… [ar, 390 px]; › twelve exact presentations… [ar] | A full Arabic 390 px submit as one sequence. |
| Arabic mobile pending, stale, and unavailable states stay actionable | demo/admin › empty and forbidden queues… [ar, 390 px]; › queue recheck submits nothing… [ar] | Arabic second-founder button and dialog focus (en only). |
| both locales reflow at desktop and mobile widths | layout-matrix-roles › Admin sections and governed previews [en] and [ar]; layout-matrix-routes › admin routes reflow, keep direction, focus and axe [en] and [ar] | None. |
| empty, unavailable, and forbidden queues fail closed | demo/admin › empty and forbidden queues… [ar]; › queue recheck submits nothing… [ar] (unavailable: no list, no reason field); e2e-database › student / leader: signed-in allowed and forbidden direct routes | None. |
| both locales keep a persistently unavailable queue closed after recheck | Partial: demo/admin › queue recheck submits nothing… [ar] (no list, no writes, then recovers); `tests/unit/admin-actions.test.ts` (loader) | Persistent unavailability after recheck (not reproducible in the synthetic runtime); en. |

### `batch-leader-collection.spec.ts` (12 runs, deleted: `/preview/batch-leader`)

| Baseline | Now | Not covered now |
| --- | --- | --- |
| mixed files infer requests, register separately and finish before processing | demo/leader-collection › request-first intake records three receipts… [en]; › three-file detours… [ar]; › an edited upload description… [en]; `tests/unit/collection-queue.test.ts`; `tests/security/product-shell-upload.test.ts` › returns only the public receipt… | Ambiguous-file "Requested item" picker in a browser. |
| interrupted retry preserves the same per-file key | demo/leader-collection › three-file detours, interruption, receipt retry… [ar]; `tests/unit/collection-upload-client.test.ts` | Interruption is a detour, not a network abort. |
| cancel stops the active batch, retains the next file, and retries safely | demo/leader-collection › all supplied mixed file types, private-byte rejection and cancel retry… [en]; › reference origin survives cancellation and retry… [ar] | Input disabled during upload; fresh key after cancel. |
| a failed submission retries its retained receipt without uploading twice | demo/leader-collection › a retained receipt retries after remount without uploading again [en]; › three-file detours… [ar] | Simulated failure, not an aborted server action. |
| invalid bytes do not block valid files and new files need a fresh rights declaration | demo/leader-collection › all supplied mixed file types… [en]; › reference and device entry origins stay distinct [en]; e2e-database › leader: real intake validates files in the browser… | None. |
| keyboard skip, picker and source details remain reachable | e2e-database › leader: real intake… (skip link); demo B09 helpers (`tests/e2e/support/collection-b09.ts`) | File chooser opened with Enter. |
| mobile en light / en dark / ar light / ar dark queue meets AA and reflows at 360px (4 runs) | layout-matrix-roles › Batch Leader intake, History, Account and fixtures [en] and [ar] (state: campaign intake with device and reference rows keeps 44px controls; both themes, strict reflow, axe) | Axe at 1440 and 320 px rather than 360 px. |
| wrong and expired campaigns keep the same non-identifying boundary | demo/leader-collection › unknown, unprepared and wrong-role campaigns remain unavailable [ar]; › expired and replayed fixtures deny work and offer a safe exit [ar]; e2e-database › leader: real intake… (forged campaign); › revoked leader loses campaign access…; pgTAP `27` | Same copy for wrong and expired; real-mode expired campaign in a browser. |
| mixed drop retains every file and rejects oversized content before uploading | e2e-database › leader: real intake… (10 MB limit); `tests/security/product-shell-upload.test.ts` › rejects an oversized request…; `tests/unit/collection-domain.test.ts` | Drag-and-drop. |

### `study-shelf.spec.ts` (11 runs, deleted: `/preview/learn` catalog form)

| Baseline | Now | Not covered now |
| --- | --- | --- |
| the university journey asks for faculty, academic year, then semester | demo/student-entry › progressive choices, upstream reset, review and distinct destinations [ar]; hosted › hosted student: study memory…; `tests/unit/academic-setup.test.ts` | Exact option lists. |
| the veterinary pilot uses the same hierarchy with subject terminology | demo/student-entry › configured course names agree across four paths and learning materials [ar]; › honest named starts keep four program catalogs separate [en]; `tests/unit/catalog-terminology.test.ts` | None. |
| the same catalog seam adapts the hierarchy for Thanaweya Amma | demo/student-entry › mathematics setup opens its own subjects [en]; › determined choices skip questions… [en]; `tests/unit/synthetic-catalog.test.ts` | None. |
| merged B01 M10: shared shelf keeps mathematics and science catalogs distinct | demo/student-entry › mathematics setup opens its own subjects [en]; › obsolete and mismatched mathematics scopes are unavailable [ar]; layout-matrix-student › mathematics-track subjects | Material count. |
| direct unit navigation preserves the authorized path and academic changes clear downstream choices | hosted › hosted student shelf keeps navigation geometry, touch targets and reduced motion; demo/student-entry › progressive choices… [ar]; `tests/unit/catalog-journey.test.ts` | Forward navigation; unit-page reload. |
| forged and stale deep links are reduced to the authorized canonical path | e2e-database › student: real workspace overview… (forged `/learn` hints removed); `tests/unit/catalog-journey.test.ts` | "Continue your authorized path" text. |
| a pending server navigation prevents an interrupted duplicate selection | Removed: the guarded form existed only on `/preview` and was deleted with it. | Not applicable now. |
| a valid direct deep link remains stable and locale switching preserves scope | demo/student-entry › mathematics setup opens its own subjects [en]; › named resume and grouped searchable subjects [ar]; demo/rtl › direct language switch preserves the route in both directions (three roles) | None. |
| safe empty and release-change states expose no catalog identifiers | demo/failure-recovery › Shelf failures offer a temporary retry or a safe exit, never to another role [en]; › a persistent study state hides scope metadata and offers no ineffective Retry [ar]; `tests/unit/study-recovery.test.ts`; `tests/unit/catalog-journey-supabase.test.ts` | Real-mode Shelf states in a browser. |
| the mobile catalog keeps touch targets, focus, and page width intact | hosted › hosted student shelf keeps navigation geometry, touch targets and reduced motion; layout-matrix-student › first-run setup, Shelf, subjects and materials | Focus on the removed select. |
| reduced motion removes the authored shelf and loading animation | hosted › hosted student shelf keeps navigation geometry, touch targets and reduced motion | Search box and `aria-current` there. |

### `workspace-shell.spec.ts` (5 runs, deleted: `/preview/learn/<cohort>/<unit>`)

| Baseline | Now | Not covered now |
| --- | --- | --- |
| the overview exposes canonical scope, truthful state, and real child routes | e2e-database › student: real workspace overview, chat sessions, placeholders and canonical catalog | None. |
| the mock chat creates, persists, and switches caller-scoped sessions | e2e-database › same test; `tests/unit/workspace-application.test.ts` | None. |
| forged and release-stale child routes share one non-identifying boundary | e2e-database › same test (unknown unit); › lock / deactivate / revoke: an active browser session cannot create another chat; `tests/security/product-shell-access.test.ts` | Source count hidden after a transition. |
| Arabic uses the intended face and stays aligned at a narrow viewport | e2e-database › same test [ar, 390 px] (lang, dir, reflow, 44 px controls, accessibility pass) | CDP platform font, body weight, `font-size-adjust`, clipped controls. |
| English keeps Manrope and the shell survives 200 percent zoom geometry | e2e-database › same test (accessibility pass: 640/390/320 px and 200% text, en and ar) | CDP platform font; "Workspace navigation" landmark in real mode. |

### `product-shell-contracts.spec.ts` › RSC navigation, action responses and upload receipts remain safe (1 run, deleted)

Removed with `/preview`. Its parts now live in: the e2e-database request inspector (every HTML, RSC and JSON body checked for private data), e2e-database › student: real workspace overview… (overview → chat → start session), › leader: real intake… (real upload and receipt), `tests/unit/admin-actions.test.ts` (action results strip diagnostics and private fields) and `tests/security/product-shell-upload.test.ts` › returns only the public receipt…. Not covered now: the `reactPayloads > 0` assertion and a real admin action submitted from a browser.
