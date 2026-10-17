# Task record: WP03-T16 render the same student screens in real and synthetic modes

**Task ID:** WP03-T16

**Status:** [~]

**Outcome:** Real student routes render the founder-reviewed synthetic screen components (study workspace, Study Shelf, student Settings). Real routes feed them authorized server data; the synthetic runtime feeds them `src/lib/demo` state. Only data and availability differ.

**Acceptance:** [runbook WP03-T16](../../docs/runbooks/poc-execution-runbook.md#wp03-t16--render-the-same-student-screens-in-real-and-synthetic-modes)

**Owner:** Claude Code; selected speaker Ahmed

**Branch:** claude/wp03-t16-shared-study-screens

**Updated (UTC):** 2026-10-17T15:00:00Z

## Contract

**Dependencies:** WP03-T15 (main `a6dfbae`); WP03-T11 hosted synthetic login; WP03-T12/T13 founder-reviewed synthetic screens.

**Inputs:** Ahmed's decisions of 2026-10-17 (see Decisions); existing real ports `src/lib/workspace/workspace.application.ts`, `src/lib/catalog/*`, `src/lib/account/*`.

**Files:** `src/app/learn/[cohortId]/[unitId]/**` (pages, layout, new `sources`, `evidence`, `report` routes), `src/app/learn/_components/**` (study tools, new adapter seam), `src/app/_synthetic/screens/{study,settings}-screens.tsx`, `src/app/settings/page.tsx`, `src/app/_components/product-services.tsx`, shared settings view, `src/lib/study/*`, `tests/e2e/demo/**`, `tests/e2e/support/**`, `tests/e2e-database/product-shell.spec.ts`. No migration, RLS, storage or workflow change.

**Protected paths:** auth guards on real routes (`requireAuthorizedWorkspace`, settings and learn access gates) and the chat-session Server Action. Allowed: an authorized student sees the shared screens with their own scope and sessions; New chat creates a session in that scope. Forbidden (proved): anonymous or unauthorized access to any workspace route including the new `sources`, `evidence`, `report`; real mode rendering fixture data or making fixture writes; a real module importing `src/lib/demo`; hosted synthetic mode making a server request.

**Verify:** `pnpm check`; `pnpm test:node`; `pnpm test:e2e`; `pnpm test:e2e:demo`; database feedback CI (`tests/e2e-database`); full PR CI.

**Pass:** all green; shared-screen assertions pass in both modes; layout matrix green; review findings resolved; `Approved commit:` recorded.

**Rollback:** revert the squash commit (UI and route additions only; no data change).

**Hard stop:** any weakening of auth, RLS or hosted-mode isolation; fixture data visible in real mode; any paid action.

## Steps

- [x] Inventory (see Decisions) and founder direction.
- [x] Seam: `LiveStudyProvider` (real routes: authorized chat sessions and the start-chat Server Action) beside the synthetic tab store; shared tools treat a live subtree as real and never read fixtures there.
- [x] Study tools on the seam: Materials/sources, Chat, Studio, Quiz setup, evidence, report, unit switch. Real: count and freshness, real sessions and New session (a real form, so the Server Action re-authorizes), every backend-less control disabled with one notice.
- [x] Real routes render `StudyFrame` + `ProductStudy` through `RealStudyPage`; guarded `sources`, `evidence`, `report` routes; `workspace-pages.tsx`, unused workspace CSS and copy removed.
- [x] `AccountSettings` shared by `/settings` and the synthetic Settings screen; real privacy controls disabled.
- [x] Study Shelf: dead mode props removed; remaining differences are sample disclosures and real tool availability.
- [x] Shared screen assertions (`tests/e2e/support/shared-screens.ts`) used by `tests/e2e/demo/shared-screens.spec.ts` and `tests/e2e-database/product-shell.spec.ts`; `database-ci` now also runs when that helper changes.
- [ ] Rendered inspection (EN/AR, light/dark, desktop/mobile); present to Ahmed; independent review; PR.

## Decisions

- 2026-10-17, Ahmed: the founder-reviewed synthetic screens are the canonical UI; real routes render them with real data.
- 2026-10-17, Ahmed: real tools without a backend (chat answers, Studio, Quiz, evidence, report) keep their normal layout, disabled, with one honest notice; never fixture data.
- 2026-10-17, Ahmed: real Materials shows count, edition and freshness with a "list not available yet" state; an authorized source-list function is a separate protected task.
- 2026-10-17, Ahmed: scope is the study workspace, Study Shelf and student Settings.
- Inventory (main `a6dfbae`): already shared — `FrontendShell`, `AppShell`, `StudyShelf`, `AcademicSettings`, `AccountLayout`, `Appearance`, auth (`AuthForm`), admin and leader screens. Different — workspace content (`workspace-pages.tsx` vs `ProductStudy` and `study/*`), the unit switch, the study body wrapper, Settings views (real lacks privacy and study-return), Shelf resume and material-count copy. Real lacks `sources`, `evidence`, `report` routes and quiz attempt routes (quiz attempts wait for WP07).
- Sample-content disclosures in synthetic mode ("sample materials", loopback demo banner) stay: they describe the data, not the layout.

## Current state

**Changed:** runbook task registered; this record.

**Proof:** NOT RUN yet.

**Review:** none yet.

**Approved commit:** PENDING

**Remaining:** every step after the inventory.

## Next action

Build the adapter seam and move the Materials and Chat tools onto it.
