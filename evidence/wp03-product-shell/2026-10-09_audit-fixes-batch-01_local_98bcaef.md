# WP03-T13 audit fixes — batch 01, local review candidate

Prepared 9 October 2026 for Ahmed's review. This is the first five-problem batch he authorized from the findings-only live audit. It records implementation and local proof; founder acceptance is pending.

## Scope and candidate

- Existing branch: `codex/frontend-refinements`; base HEAD: `98bcaefca5512817c9d18e87e7bc2e9086fa89b4`.
- [WP03-T13](../../planning/tasks/wp03-t13-student-entry-navigation.md) remains the only selected task. One inline worker; no delegation.
- Ahmed requested five problems per batch, an explicit before/after handoff, and his review before continuing. No commit, push, PR, merge or deployment is authorized.
- These edits preserve the preexisting uncommitted frontend candidate. Nine touched files were copied before editing to `E:/Unimind audits/analysis/fix-batch-01-baseline/`, with hashes, branch and HEAD in its manifest. Rollback must reverse only the incremental batch edits against those copies, preserving other work.
- MATERIAL design disposition. The existing Open Folio identity, native interaction semantics and tokens remain. Founder receipt is pending; preparation fingerprint remains NOT_READY. Actual-diff routing retains policy 10, R2 and the design-acceptance gate.

## Five changes and observed before/after

The original 438 audit verdicts remain unchanged. [The batch tracker](<E:/Unimind audits/fix-batches.md>) maps repeated reports to these five underlying problems. Recommendations were not treated as requirements.

| Finding | Before on the normal live development UI | Implemented after |
| --- | --- | --- |
| F002 — settings return grouping | Return to last study tool ended exactly where the first category began: 0px separation. | Existing conditional link moves to its own row, with 24px before the tabs. Its study-tool destination is retained. No resume-data seam was added to the real settings route. |
| F016 — tablet destination names | At 820px, Study, Subjects and profile labels were clipped to 1 × 1px. | The tablet rail is 96px wide. Labels show at 12px; destination targets are 80 × 64px or larger. Other breakpoint rules remain. |
| F061 — stacked phone settings categories | At 390px, four full-width rows took 201px; the Appearance heading began at y=416.2. | Four categories occupy two columns/two rows, 109px total. Targets retain a 44px minimum. The heading begins at y=348.2, 68px higher after allowing for the new return gap. |
| F092 — conflicting academic names | Tab/helper/fieldset said Academic context; panel/save said Academic settings. | Tab, helper reference, fieldset, panel and save action use Academic settings / الإعدادات الدراسية. The `academic` section ID, validation, dependent selections and save behavior remain. |
| F166 — unnamed phone unit switcher | The Switch unit summary had 0px font size, leaving only an icon. | The label is visible at 13px in both languages. The header can wrap; its open menu anchors to the header so it stays inside the phone viewport. Keyboard opening and same-cohort switching retain the active tool. |

All five changes were verified after implementation on normal `http://127.0.0.1:3000` routes. The settled Arabic unit menu at 320px spans x=16 to x=276, with its complete 260px width inside the viewport. Selecting Biochemistry keeps Chat active and closes the menu.

## Verification

- Initial focused student command: `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm test:e2e:demo --grep 'audit batch 01|workspace revision .*profile|workspace revision .*all student sections'`: **6 passed**. Both languages; both themes; desktop/tablet/390px/320px; 200% text; settings keyboard/deep links/draft retention; current-cohort unit switching; all seven student sections and axe accessibility checks.
- Shared-navigation role command: `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm test:e2e:demo --grep '(admin|leader) (en light|ar dark):'`: **4 passed**. Representative EN light and AR dark admin/leader reflow and accessible controls. The subsequent repair changes only mobile unit-menu positioning and its rejecting test; it does not change the shared role navigation.
- After the live inspection caught an Arabic wrapped-header menu extending past the phone edge, the menu was anchored to the mobile header. The batch test now checks the open menu's entire bounding box at 390/320px and 200% text, in both languages. Final command: `UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm test:e2e:demo --grep 'audit batch 01|workspace revision .*all student sections'`: **4 passed**. This replaces earlier batch and all-section geometry proof.
- `corepack pnpm typecheck`, `corepack pnpm typecheck:fresh`, `corepack pnpm lint`: passed. Fresh type checking and full lint were repeated after the final menu assertion and passed.
- `corepack pnpm check:boundaries`, `corepack pnpm scan:secrets`, and `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`: passed. No dependency, import or trust seam changes followed the boundary proof.
- Changed-file Prettier, `git diff --check`, stat and full incremental diff against the saved baseline: passed/reviewed. The Impeccable layout detector reported no findings on the scoped files. Inline React review found no new hooks, effects, data fetching or client authorization: the optional return slot is presentation only; retained hidden panels and existing roving focus remain.

Reports are stored outside the repository in `E:/Unimind audits/analysis/fix-batch-01-*-e2e.json`. This is ten distinct focused cases across scoped runs, with affected cases replaced by final reruns; not a full-suite claim.

## Live UI proof boundary

The normal dev server uses temporary process-local mock configuration, disabled generation/embedding/transcription providers, zero budget, and the existing browser-only synthetic student entry. No environment file was edited. Sample commitments are nonbinding fixture notices. The fixture validates the actual rendered components and local interaction; it does not prove real authentication, backend saving, provider generation or production behavior.

Read-only live DOM/accessibility state and computed geometry are the proof. Original audit screenshots and recommendation sections were excluded. Tested live states include 820 × 1180 tablet, 390 × 844 phone and 320 × 844 narrow phone, English and Arabic, dark/System themes, academic keyboard selection and return to the same Chat route. Only settled frozen-candidate states count; stale tabs and temporary HMR stylesheet transitions do not count as passing evidence.

## Binding and review handoff

The companion [source binding](2026-10-09-audit-fixes-batch-01-source-binding.json) records current implementation/test hashes, before-batch hashes and the aggregate candidate hash. Documentation is excluded to avoid self-reference. Before/after live measurements are recorded in [the live UI ledger](<E:/Unimind audits/analysis/fix-batch-01-live-ui.json>).

The normal dev server remains running on port 3000, task-owned session 65936. Chrome's “🧭 Audit fixes” review tab is open on `http://127.0.0.1:3000/settings?lang=en`, using the approved synthetic student fixture with System theme and the default viewport. The return link points to Biochemistry Chat after the demonstrated unit switch. To see all five changes, inspect settings at tablet/phone widths, open Academic settings, then use Return to last study tool and open Switch unit. Reload starts a new fixture document; the approved sample login is required again.

The original audit ledger remains historical observation, not a claim that implementation has been accepted. Local technical proof is complete for this batch. Ahmed reviews these five changes before batch 02. Founder acceptance and commit/delivery remain separate holds. Broad CI and production proof have not been run or claimed.
