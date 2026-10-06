# Task record: WP03-T12 landing refinements

**Task ID:** WP03-T12

**Status:** [~]

**Outcome:** An approved local landing page with concrete copy, passive folio motion and polished experience/entry sections, preserved on the shared frontend branch.

**Owner:** Codex `/root`; selected speaker Ahmed. No delegation.

**Reviewer:** Ahmed for material rendered acceptance; inline technical review by the executor.

**Branch:** codex/frontend-refinements

**Updated (UTC):** 2026-10-06T14:10:59Z

## Delivery scope for every continuing agent

Ahmed's 6 October request authorizes implementation and local verification of this landing slice on the shared frontend branch. His subsequent direct reply approved the presented landing and instructed a local commit. Continue approved frontend work here; committing later changes needs his instruction. Push, PR creation/update, merge, deployment/promotion and other external delivery actions each require his explicit instruction; design acceptance and local commit authorization grant none of them. This restriction supersedes D-22 and automatic finalization for this frontend task, including later areas. Preserve this branch. Do not start additional screen work until he names and approves the area.

## Derived execution envelope

**Policy version:** 10

**Surfaces:** docs, frontend, tooling

**Risk:** R1

**Planning:** Short

**Worker budget:** 0 used; maximum 1; no nested workers; delegation not authorized.

**Capabilities:** frontend-quality-floor

**Procedural skills:** impeccable; unslop; writing-for-agents; browser:control-in-app-browser

**Routing reason:** Landing copy, decorative motion and layout refinement with local review only; test and controlled handoff updates support that presentation.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | Ahmed's brief; current landing; DESIGN identity; master-plan 6–8; WP03-T12 | No pointer motion or layer control; passive motion starts without interaction and pauses hidden/offscreen; reduced motion static; truthful EN/AR copy; functioning sample controls/account links; keyboard, themes, 320px/200% reflow; source quality; local delivery hold | Copy and material section refinement need design judgment in one coherent block | Implementation/local proof and Ahmed's approval complete; local commit requested; dated evidence below |

**Next model:** Sol High

**Current block:** 1; records the manual plan, not certification of the Desktop model.

## Execution contract

**Dependencies:** Delivered WP03-T10 and WP03-T11; historical landing acceptance at 569c467; current DESIGN contract. Clean starting main b4cac79cd6a306e5d011e2d69f916c8c17dc6007.

**Inputs:** Ahmed's 6 October instruction; synthetic sample content only; incumbent folio, brand, fonts, palette and locale behavior.

**Files:** src/app/_components/landing.tsx; landing-experience.tsx; landing.module.css; tests/e2e/landing-experience.spec.ts; AGENTS.md; DESIGN.md; .impeccable/surfaces/src-app-components-landing-tsx.md; docs/runbooks/poc-execution-runbook.md; this task record; dated sanitized local evidence.

**Verify:** corepack pnpm exec playwright test tests/e2e/landing-experience.spec.ts; corepack pnpm lint; corepack pnpm typecheck; corepack pnpm typecheck:fresh; corepack pnpm check:boundaries; corepack pnpm scan:secrets; changed-file Prettier; pwsh -NoProfile -File scripts/verify-agent-readiness.ps1; git diff --check/stat/full review; one detector; bounded EN/AR desktop/mobile side-browser inspection.

**Pass:** Every landing text region audited without invented claims; exact brand slogan retained; passive folio operates without pointer/button and pauses offscreen/hidden; reduced motion is static; experience and entry sections have clear hierarchy and responsive spacing; sample controls, evidence disclosure, safety/preview boundaries, account routes and keyboard behavior remain functional. No push, PR, merge or deployment.

**Evidence:** evidence/wp03-product-shell/2026-10-06_landing-refinements_local_b4cac79.md

**Rollback:** Restore only this task's changed files to the starting main snapshot; preserve unrelated work, historical branches/tags and this local branch for review. No backend/schema/provider mutation.

**Hard stop:** External delivery without Ahmed's explicit instruction; private input, paid exposure, changed authorization/service semantics, lost unrelated work or false PASS.

## Candidate preparation

**Design disposition:** MATERIAL

**Design evidence:** evidence/wp03-product-shell/2026-10-06_landing-refinements_local_b4cac79.md#founder-approval-and-local-commit

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** NOT_READY

**Unresolved findings:** NONE

**Established facts:** NONE

## Steps

- [x] Preserve clean main, create the shared frontend branch and persist the local-only scope.
- [x] Audit/rewrite copy, implement passive motion and polish both named sections.
- [x] Run focused technical and bounded visual proof, inspect full diff and record limitations.
- [x] Prepare the running local preview and saved section captures for Ahmed; retain the delivery hold.
- [x] Record Ahmed's material acceptance and explicit local commit instruction; external delivery remains held.
- [ ] Commit the approved snapshot and persist its exact commit binding.

## Handoff

**Changed:** Literal EN/AR copy across the full landing; one invented anatomy/physiology example across Chat/Studio/Quiz; passive folio/source-layer motion with pointer/button work removed; refined experience grid/reading space and numbered entry rows; rejecting motion/preview tests; scoped DESIGN/surface/runbook/evidence and always-loaded delivery hold. No service or protected semantic change. Ahmed approved the presented source-bound candidate and requested a local branch commit.

**Commands:** corepack pnpm exec playwright test tests/e2e/landing-experience.spec.ts exit 0, final 7/7 and zero retries in 57.7s after the sample-description correction; corepack pnpm lint exit 0 plus final Landing-file ESLint exit 0; corepack pnpm typecheck exit 0; corepack pnpm typecheck:fresh exit 0; corepack pnpm check:boundaries exit 0; corepack pnpm scan:secrets exit 0 (3183 files in final run); pwsh -NoProfile -File scripts/verify-agent-readiness.ps1 exit 0 (794 names/344 links/115 contracts); changed-file Prettier exit 0; one detector exit 0 with no findings; bounded desktop/mobile EN/AR rendered inspection, full diff/whitespace/secret/scope review completed. Intent/actual-diff route remains policy 10, R1/Short, docs/frontend/tooling. Source hashes, preserved failures and proof limits are in evidence/wp03-product-shell/2026-10-06_landing-refinements_local_b4cac79.md. The earlier preflight was INCOMPLETE before human approval; no new broad proof preflight or delivery readiness is claimed. NOT_READY is retained. Broad gate/CI/production are outside the requested local boundary.

**Remaining:** Persist the authorized local commit and exact approval binding. Stable broad verification, exact-head CI and production proof are outside this local boundary and are not claimed. Push, PR, merge and deployment remain outside current authorization.

**Next safe action:** Commit this approved landing snapshot on codex/frontend-refinements. Wait for Ahmed to name the next platform area before further implementation. Restart the preview with UNIMIND_E2E_USE_WEBPACK=1 and corepack pnpm demo if needed. Stop the task-owned preview before another Playwright run to avoid the shared Next dev lock.

**Reviewer action:** NONE for the approved landing slice. Ahmed will name the next area; external delivery authorization remains separate.
