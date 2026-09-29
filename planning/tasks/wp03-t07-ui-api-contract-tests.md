# Task record: WP03-T07 UI and API contract tests

**Task ID:** WP03-T07

**Status:** [x]

**Outcome:** Repeatable mock-only product-shell contracts reject unauthorized navigation/API access and browser-data leakage, and prove bilingual accessibility and responsive critical flows.

**Owner:** Codex `/root`; Ahmed is the selected chat profile

**Reviewer:** Ahmed checkpoint; D-22 standing non-financial delivery authorization

**Branch:** Implementation `wp03/ui-api-contract-tests` merged and removed; documentation closure `codex/wp03-t07-closure`

**Updated (UTC):** 2026-09-29T00:40:21Z

## Derived execution envelope

**Policy version:** 8

**Surfaces:** docs, frontend, runtime, auth, delivery, tooling

**Risk:** R3

**Planning:** Protected

**Worker budget:** 0 used; maximum 1; nested workers prohibited. Ahmed requested one agent throughout.

**Capabilities:** frontend-quality-floor, trust-boundaries

**Procedural skills:** Impeccable audit; trust-boundaries; writing-for-agents for controlled record; finalize for delivery

**Routing reason:** Cross-role public-seam privacy/access proof and bilingual critical-screen verification; runtime changes only for demonstrated defects.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | Map runbook WP03-T07 and 6.6/6.7 to current WP03-T01–T06 contracts and proof; implement missing reusable test coverage and repair demonstrated defects. | Each role has allowed/denied public-seam proof; browser requests and RSC payloads exclude privileged/private data; EN/AR critical screens pass accessibility, focus, motion, touch, reflow and semantic smoke checks. | Ahmed requested one Sol owner; integrated fixtures and trust evidence benefit from contiguous judgment. | Complete; executed local and exact-head CI proof. |
| 2 | Sol High | Bounded rendered inspection, integrated Impeccable audit, provenance review, candidate review, stable proof, protected delivery, affected external proof, closure and cleanup. | No false PASS, material findings resolved or explicitly recorded; exact-head CI and branch protection pass; affected runtime deployment proven or precise no-runtime-impact reason recorded. | Same executor retains acceptance/evidence context through delivery. | Source delivery and production proof complete; protected documentation closure and its branch cleanup follow under finalize. |

**Next model:** Sol High

**Current block:** 2

## Execution contract

**Dependencies:** WP03-T01–T06 complete; WP03-T06 release evidence `evidence/wp03-product-shell/2026-09-24_audited-admin-actions-release_production_8110ab0.md` and task records bind earlier approved surfaces.

**Inputs:** Runbook WP03-T07 and 6.6/6.7; master-plan 6.7/7/8.1/8.2; existing synthetic fixtures and mocks; DESIGN.md and approved surface briefs; D-22.

**Files:** `tests/e2e/product-shell-contracts.spec.ts`, test-only helpers and accessibility dependency pins; focused role/API tests; demonstrated product fixes only; this record and WP03 evidence/runbook closure.

**Verify:** `corepack pnpm exec playwright test tests/e2e/product-shell-contracts.spec.ts --workers=1`; `corepack pnpm test:security`; `corepack pnpm typecheck`; `corepack pnpm scan:secrets`; `corepack pnpm verify`; bounded side-browser inspection; Impeccable detector/audit; diff integrity/full review; exact-head required CI; actual EN/AR screen-reader smoke before merge.

**Pass:** Runbook WP03-T07 requirements have direct executed proof with declared limitations. All execution uses synthetic data, local mock providers/storage, and zero paid capacity. Existing production role checks remain authoritative; preview fixtures never establish actual authorization.

**Evidence:** Local candidate `evidence/wp03-product-shell/2026-09-27_ui-api-contract-tests_local_7f89ed8.md`; protected release `evidence/wp03-product-shell/2026-09-29_ui-api-contract-tests-release_production_ced163e.md`.

**Rollback:** Revert task-scoped tests/dependency changes; if a demonstrated runtime fix is needed, restore last-known-good deployment while preserving database/audit history.

**Hard stop:** No real/private data, paid resource/provider/cap change, weakening of authorization/branch protection, or task closure without executed required proof. No unrelated changes were present at entry.

## Trust map

Verified Auth claims and server/database role/membership/assignment govern access. URL/query/form/role labels and preview states are untrusted. Existing server page/actions and upload handler rederive caller, scope and readiness. Allowed student workspace, assigned leader upload, and authorized admin containment must work; forged scope, expired assignment, non-admin mutation and another user's chat must reject. Replay/revocation/stale behavior reuses earlier direct checks unless changed. Browser proof inspects outbound requests, HTML/RSC/action/API responses for synthetic secret/private canaries and forbidden field names without storing raw payloads.

## Candidate preparation

**Design disposition:** OBJECTIVE_PRESERVING

**Design evidence:** rationale:rejecting checks demonstrated contrast, normal-size touch, keyboard-scroll and text-zoom defects; targeted repairs retain palette, copy and composition; baseline:Ahmed-approved Access Shelf/Focused Rail/collection desk/decision queue in .impeccable/surfaces and WP03-T02–T06 evidence, DESIGN.md

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** 07dd54895f56b94f8bd51e2cd3b323adbdc959960b3bc926a826ed1f18b83d96

**Unresolved findings:** NONE

**Established facts:** NONE

## Steps

- [x] Select WP03-T07, inspect clean tree, derive intent and record contract.
- [x] Map existing proof and implement missing role/privacy/accessibility checks.
- [x] Execute automated bilingual critical-screen checks and bounded rendered inspection; Ahmed reported EN/AR spoken-smoke PASS on 2026-09-29.
- [x] Complete integrated audit/provenance and resolve demonstrated defects.
- [x] Review, verify, merge the implementation and prove affected production; record closure.
- [x] Remove the merged implementation branch locally and remotely.

## Handoff

**Changed:** Added pinned dev-only axe tooling, bilingual Playwright contracts and production route/upload denial tests; repaired demonstrated contrast, text reflow and admin keyboard-scroll defects. Power interruption recovered; frozen dependency install completed with pinned Node 24.19.0.

**Commands:** Focused unit 10/10, security 13/13, affected collection/RSC 3/3 and cross-spec privacy/session 2/2 exit 0. Guarded `corepack pnpm verify` exit 0 on frozen fingerprint `fef81d7e75b5c8852a6850a5dc4439f67a1a97c70125d2cc001df546b83664ab`: unit 455, integration 15 (2 hosted opt-in skips), security 44, evaluation 3 plus 3 synthetic cases, load-profile validation 5, browser 51/51, production build and client-artifact secret scan passed. All 12 new contracts pass. Full candidate inline review, formatting, diff integrity, secret scan and readiness passed. Final detector exit 1: 34 inherited advisories explicitly dispositioned. Subsequent proof-record/contract clarification edits change no executable input; reuse runtime proof and check final documentation/readiness/secret scope plus exact-head CI.

**Delivery:** PR #58 head `1ee02de2d90c399acc74267499866f2e0d7bae22` passed all four required checks in run `36285184754`. Authorized account `aboayman-oss` approved that exact head (review `5346244366`); the same executor controlled the distinct account, so this is not independent review. Author/merger `unimind989-sys` merged without bypass as `ced163e869c66a8c427fe200a152208b3ebff75d`; reviewed and merged trees both equal `aeb22c3ba33c87ccbd892f6f3df3e8f6971755f9`. Merged-main run `36502851660` passed application, database and selector; dependency audit was intentionally skipped on main after passing on the exact PR head.

**Production:** Hobby project `unimind-preview`; READY deployment `dpl_GWCQ2YxfubZxVsdeRigw4QXUQ5Kw` has exact source SHA/tree, production target and release `wp03-t07-ced163e-production`. Protected and public smoke each passed seven checks and all six release/configuration fingerprint checks. Public alias `project-xwrez.vercel.app` resolves to that artifact. EN desktop auth and AR mobile catalog/workspace/submission/admin rendered with loaded fonts, correct language/direction and no document overflow; five forged-role URLs reached sign-in in the real browser. Console warning/error lists and runtime warning/error/HTTP 500 samples were empty. No Supabase runtime/schema change; disposable CI owns database/role proof. Rollback: `dpl_41HGBsNRN5tM2MMoRdozeRRjLgpa`.

**Remaining:** No WP03-T07 implementation or acceptance gate remains. Deliver only this documentation closure and clean its branch. Production source remains `ced163e`; these Markdown-only edits require no redeployment. D-04/D-05/D-18/D-19 still block real provider, financial, storage and retention choices.

**Next safe action:** Deliver this documentation-only closure with exact-head protected CI and distinct-account approval, synchronize clean main and remove the closure branch. After that, WP03-T08 is the next runbook task; it is not started here.

**Reviewer action:** Ahmed's task-conversation message on 2026-09-29, “English/Arabic results: pass,” resolves the requested five-screen smoke on unchanged candidate `1ee02de`. This is human-reported verification; reader/version and exact execution time were not supplied, and the executor did not hear speech. Targeted objective-preserving repairs retain the approved direction. D-22 authorized the non-financial lifecycle, not an in-product founder confirmation.
