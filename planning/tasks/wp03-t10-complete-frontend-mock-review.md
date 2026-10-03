# Task record: WP03-T10 complete frontend mock review

**Task ID:** WP03-T10

**Status:** [~]

**Outcome:** Review the delivered frontend; this block implements Ahmed's premium public landing-page correction before the complete review gate.

**Owner:** Codex executor; selected speaker Ahmed.

**Reviewer:** Ahmed; current rendered landing candidate needs founder design acceptance.

**Branch:** codex/premium-landing

**Updated (UTC):** 2026-10-03T21:04:27Z

## Derived execution envelope

**Policy version:** 9

**Surfaces:** docs, frontend, tooling

**Risk:** R1

**Planning:** Short

**Worker budget:** 0 used; maximum 1; no nesting; no worker allocated.

**Capabilities:** frontend-quality-floor; impeccable

**Procedural skills:** impeccable; browser:control-in-app-browser

**Routing reason:** Public landing presentation and local demonstration interactions; no changed protected or paid-capacity semantics.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs                                                                               | Independent acceptance checks, including failure cases                                                                                                | Assignment reason                                                          | Status and evidence                                                                                                          |
| ----- | -------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1     | Sol High       | Landing request 3 October; DESIGN brand/type/themes; master-plan 6–8; WP03-T10                           | EN/AR desktop/mobile/320px, keyboard, reduced motion, local controls, account destinations, no provider request, accessibility, lint/types/boundaries | Material composition and motion need design judgment in one coherent block | Complete implementation and inline review; focused proof and safe production build pass; rendered founder acceptance pending |
| 2     | Sol High       | Founder acceptance, remaining complete review coverage, protected delivery and affected production proof | Current receipt; complete gate evidence; guarded verify; exact-head CI; smoke; synchronized main                                                      | Full gate and local landing proof are separate                             | Pending                                                                                                                      |

**Next model:** Sol High

**Current block:** 2; awaiting the presented founder checkpoint, with the same planned model. The model assignment is a manual plan, not a claim about Desktop model selection.

## Execution contract

**Dependencies:** Delivered WP03-T09 at f107e41, verified closure on clean starting main 7f88ff8; earlier functional proof retained for unchanged seams.

**Inputs:** Premium landing request; confirmed answer "Use your strongest creative direction"; Open Folio kit; DESIGN.md; PRODUCT.md; master plan 6–8; synthetic preview contracts.

**Files:** src/app/_components/landing.tsx; src/app/_components/landing.module.css; src/app/_components/landing-experience.tsx; src/app/_components/landing-icons.tsx; tests/e2e/landing-experience.spec.ts; DESIGN.md marketing scope; landing surface brief; this record and sanitized evidence.

**Verify:** UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm exec playwright test tests/e2e/foundation.spec.ts tests/e2e/landing-experience.spec.ts; corepack pnpm exec eslint . --max-warnings=0 --ignore-pattern '.local/**'; corepack pnpm typecheck:fresh; corepack pnpm check:boundaries; corepack pnpm scan:secrets; corepack pnpm test:env-build; changed-file Prettier; bounded in-app EN/AR desktop/mobile review; detector and inline finish review. Standard corepack pnpm lint exposed pre-existing ignored .local artifacts; this candidate's source lint passes with that cache excluded. Full mock/regression suites, guarded corepack pnpm verify, exact-head CI and affected production proof remain required for full WP03-T10 closure.

**Pass:** Premium landing, truthful product copy, supplied brand, exact slogan, sculptural folio, purposeful motion, paired themes, local preview controls, real account links, no provider request or dependency. Landing proof does not close the full gate.

**Evidence:** evidence/wp03-product-shell/2026-10-03_premium-landing_local_3f841ed.md

**Rollback:** Revert task-scoped landing correction commit.

**Hard stop:** Missing founder acceptance before material delivery; real-money exposure; private inputs; incomplete full gate must not become PASS.

## Candidate preparation

**Design disposition:** MATERIAL

**Design evidence:** PENDING

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** NOT_READY

**Unresolved findings:** NONE

**Established facts:** NONE

The explicit premium animation/3D request permits a scoped marketing motion exception. Product motion retains its existing floor. Brand facts come from DESIGN.md and the supplied kit guides.

## Steps

- [x] Orient, select WP03-T10, preserve clean baseline, derive envelope and create branch.
- [x] Implement landing and local workspace preview.
- [x] Complete focused and rendered/inline review.
- [x] Present exact candidate for founder acceptance; approval is still pending.
- [ ] Complete remaining full gate and delivery before closing task.

## Handoff

**Changed:** Public landing composition, authored CSS3D folio and purposeful motion; working local Chat/Studio/Quiz demonstration; EN/AR responsive paired-theme styling; focused interaction/accessibility proof; marketing exception documented in DESIGN.md. No app-domain, auth, provider, package or paid-capacity change.

**Commands:** Actual-diff router policy 9, frontend/docs/tooling R1, zero workers, material acceptance required. Focused Playwright 8/8 PASS (55.9s final); fresh TypeScript PASS; repository ESLint excluding ignored local cache and final changed-source ESLint PASS; module boundaries PASS; final repository secrets PASS (2869 files); safe production build/client-artifact secret scan PASS; detector once returned []; final matched-file formatting PASS; readiness PASS (493 names, 158 links, 23 decisions, 113 contracts). The implementation is committed as 3f841ed; remaining record/evidence changes are nonvisual. Detailed provenance and limitations are in the evidence file.

**Remaining:** Founder receipt bound to this candidate; complete WP03-T10 route/journey/state coverage and named checkpoints; current proof preflight/fingerprint; guarded verify; exact-head CI; protected delivery; affected production proof and task closure.

**Next safe action:** Review http://127.0.0.1:3101/?lang=en and the committed candidate evidence. After founder acceptance, record the actor/time/accepted commit/route-surface-state scope, then complete the remaining gate. Do not convert landing-only proof into full WP03-T10 PASS.

**Reviewer action:** Accept the actual landing appearance and interactions, or name a concrete correction. Local preview is running via the synthetic-only demo; restart with UNIMIND_E2E_USE_WEBPACK=1 corepack pnpm demo if needed.
