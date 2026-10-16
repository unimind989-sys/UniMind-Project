# WP03-T13 audit fixes — batch 02 and original font restoration

Prepared 10 October 2026 for Ahmed's review. Ahmed accepted batch 01's five fixes and requested the next five plus correction of the font regression. This is a local review candidate on `codex/frontend-refinements`, base HEAD `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`. No commit or external delivery is authorized.

## Scope and baseline

[WP03-T13](../../planning/tasks/wp03-t13-student-entry-navigation.md) remains the only selected task. Worker budget: one inline executor, zero delegated workers. The existing dirty frontend candidate is preserved. Eight files were copied before this batch to `E:/Unimind audits/analysis/fix-batch-02-baseline/`; its manifest records hashes, branch and HEAD. Five implementation/test files differ from that baseline, plus DESIGN documentation. Root layout and global font configuration are unchanged.

Font restoration is OBJECTIVE_PRESERVING against the existing DESIGN typography. The five new layout refinements are MATERIAL and await Ahmed's rendered acceptance. Actual-diff routing retains policy 10, R2 and the founder-review gate. The task remains open; no broad stable PASS, exact-head CI, production proof or delivery is claimed.

## Font diagnosis and correction

The normal live login rendered Times New Roman. Both `--font-unimind-latin` and `--font-unimind-arabic` were empty. The HTML contained `__variable_f524cf __variable_4c91dd`, while generated CSS declared `__variable_73ee6c` and `__variable_35258b`. That mismatch left the root font declaration unresolved. The source still used `next/font/google` with Manrope and Noto Sans Arabic, in accordance with the installed Next font guide.

The owned normal server was stopped and its generated `.next` directory moved to the recoverable, ignored `.local/wp03-t13/font-cache-2026-10-10` backup. A fresh normal build restored the intended font variables and Manrope. Final checks also confirm Noto Sans Arabic in the Arabic interface. The normal server was then restarted after the E2E run without clearing the cache again; both original families still resolve. New regression assertions load both self-hosted font faces and reject missing variables or the wrong interface family. No replacement font or typography source edit was needed.

Transient hot-reload stylesheet loss and stale tabs during server restarts were excluded from passing evidence. A fresh document confirmed the frozen source layout. Chrome's Grammarly extension can add a development hydration warning; the isolated test browser has no page errors. This does not change the font diagnosis.

## Five changes

| Finding | Before, normal live UI | After, normal live UI |
| --- | --- | --- |
| F268 — active progress | Completed/current segments were both 3px with identical fill. | Current segment is 6px; completed segments remain 3px. Existing step text remains. F291 repeats this problem. |
| F306 — mobile setup grouping | 48px welcome/setup heading gap at 390px width. | 24px gap, scoped to onboarding on phones. Settings spacing is retained. |
| F322 — Edit/value association | At 820px, the first value ended at x255.8 while Edit began at x710.8: a 455px gap. | Value column and Edit are 24px apart; Edit targets remain 44px tall. Arabic mirrors the arrangement. |
| F326 — mobile review density | Five rows: 519px; completion began at y973. | Five rows: 377px at 390px; completion begins at y810. Arabic at 320px is 399px, with no horizontal overflow and all five targets 44px. The shorter summary still requires some scrolling on short screens. |
| F345 — source-entry composition | 1148px-wide, left-stacked entries; first two titles 221px apart. | Desktop/tablet identity and status share a row; the native excerpt follows. The first title interval is 135px, ordinary appendix rows 83px. Phones stack naturally. F351/F357/F362 repeat this source-density issue. |

The source list retains all eight fixture materials, format/locator metadata, status conditions and disclosures. Catalog choices, upstream reset, save behavior, source availability and return destinations are unchanged. Audit recommendations were not treated as implementation requirements. Original finding verdicts remain historical in the audit ledger; implementation status is separate in [the batch tracker](<E:/Unimind audits/fix-batches.md>).

## Verification

- Final command: `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm test:e2e:demo --grep 'audit batch 02|student entry .*progressive'`: **6 passed**, zero failures, skipped or flaky cases. It covers EN/AR, both themes, 1440/820/390/320px, 200% text, axe accessibility, upstream reset, retained selections, keyboard Edit, save-to-shelf, actual font loading, source rows, native disclosure and Studio/Chat return paths.
- The initial run had four passes and two source-test failures. The test queried the previous Studio page before Chat and its first-visit tip settled. Waiting for the Chat field and dismissing the visible tip corrected the harness. The final six-case run supersedes that report. An initial test-only TypeScript error on `Node.remove()` was corrected to `parentNode.removeChild()` before the final run.
- `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm typecheck:fresh`: passed. Final changed-TSX/test ESLint and fresh types passed after the test wait correction.
- `corepack pnpm check:boundaries`, `corepack pnpm scan:secrets`, `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`: passed. Final documentation is checked again at handoff.
- Changed-file Prettier, `git diff --check`, stat and full incremental diff against the saved baseline: passed/reviewed. The final Impeccable layout detector returned `[]`.
- Inline React review confirms no new effects, hooks, data fetching, dependencies or authorization logic. The source markup retains stable keys and native articles/details. Review keeps its definition list, field-specific Edit names and existing focus behavior. Unaffected prior role and batch 01 proof is retained only for unchanged seams.

The normal live development UI on port 3000 supplies the before/after proof through DOM geometry, computed styles, accessibility state and keyboard interaction. Original audit screenshots were not used. Fresh screenshots are presentation aids: [mobile review](<E:/Unimind audits/analysis/fix-batch-02-review-mobile.jpg>) and [desktop sources](<E:/Unimind audits/analysis/fix-batch-02-sources-desktop.jpg>).

## Binding and handoff

[Source binding](2026-10-10-audit-fixes-batch-02-source-binding.json) records current candidate hashes, before/after batch hashes, unchanged font source and final report hashes. [Live ledger](<E:/Unimind audits/analysis/fix-batch-02-live-ui.json>) records the normal-server measurements. Reports live outside the repository; the initial nonpassing report is retained with its superseded disposition.

The normal dev server remains running on port 3000, owned session 48990, with temporary process-local mock configuration, disabled paid providers and zero budget. No environment file was edited. The approved public student fixture and sample consent notices operate only in browser memory; this proof does not certify real authentication, backend saving or production behavior. Reload clears the fixture document.

Chrome's “🧭 Batch 02 review” contains separate live tabs for the academic review summary and Studio's Sources view, both entered through the approved public fixture. The setup tab can return to any step with Edit. Default viewports are restored. The side browser also retains the Sources view. These are review outputs, not founder acceptance receipts.

Ahmed reviews these five changes before batch 03. The existing branch and user delivery hold remain in force.

## Scoped founder acceptance

Recorded 2026-10-10T12:41:26.669Z. Actor: Ahmed, from his direct chat instruction “approved tackle the next 5”. This accepts batch 02’s presented five fixes and original-font recovery, bound by its existing source-binding artifact (aggregate 1896dce301bbc50ac369620c0c3ff64cb0256e5a4e451da19d90d6fe3a5e5bd6). Scope: setup progress, mobile setup spacing, review Edit proximity/density and source-list composition on the presented EN/AR responsive surfaces. It authorizes batch 03 locally. It does not approve the entire WP03-T13 candidate or commit/external delivery. The earlier pending-review wording is historical.
