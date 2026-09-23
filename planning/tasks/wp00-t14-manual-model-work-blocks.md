# Task record: WP00-T14 Manual model work blocks

**Task ID:** WP00-T14

**Status:** [x]

**Closure condition:** Final exact-head CI and protected merge remain pending; this record's completed state is conditional until those gates pass.

**Outcome:** New tasks use a durable manual Sol/Luna block plan, while the execution router continues to classify risk and select proof without choosing the Codex Desktop model.

**Owner:** Codex `/root`; Ahmed is the selected chat profile

**Reviewer:** D-22 standing non-financial authorization

**Branch:** `codex/manual-sol-luna-work-blocks`

**Updated (UTC):** 2026-09-23T23:28:29Z

## Derived execution envelope

**Policy version:** 7

**Surfaces:** docs, delivery, tooling

**Risk:** R2

**Planning:** Short

**Worker budget:** 0 used, maximum 1, nesting prohibited

**Capabilities:** release-safety

**Procedural skills:** writing-for-agents

**Routing reason:** Execution-policy and agent handoff behavior change.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | Replace the cross-file policy, router, workflow, template, runbook, readiness, and task-state contract using the user request and WP00-T09/T13 execution rules; review and deliver the exact candidate. | Router output has no model floor/runtime field; deprecated CLI model flags fail; R3 auth risk still selects authorization denial; policy/readiness/handoff checks pass; exact-head CI, accurate review provenance, protected merge, affected proof, clean synchronized `main`; no model assignment bypasses required approval or verification. | Removing old routing and delivering its replacement require cross-system invariant and evidence judgment; a separate Luna chat would repeat substantial context. | Implementation and local proof complete at `cbfc83c`; final closure conditional on exact-head CI and protected merge. |

**Next model:** NONE

**Current block:** NONE

## Execution contract

**Dependencies:** Completed WP00-T09 through T13 execution architecture and the user-supplied Luna research summary.

**Inputs:** `docs/agents/agent-workflow.md`, `docs/agents/agent-execution-policy.yaml`, WP00-T09/T13 records, user requirements.

**Files:** Policy/router and tests, agent workflow/guide, task template, runbook, readiness/work-state scripts, Playwright test-server port/ownership harness, finalization skill, README and AGENTS.md, this record, evidence.

**Verify:** diff-integrity; secret-scan; application-quality; fresh-checkout; agent-policy; skill-validator; agent-readiness; handoff-rehearsal; affected-production-proof; pnpm-verify; exact-head-ci

**Pass:** WP00-T14 runbook pass criteria and the four Luna-assignment conditions are represented as actionable instructions.

**Evidence:** `evidence/wp00-pilot/2026-09-24_manual-sol-luna-work-blocks_github_cbfc83c.md` (local proof; final closure conditional on exact-head CI and protected merge).

**Rollback:** Revert one reviewable policy change; no product data or hosted resource is changed.

**Hard stop:** No paid resource or financial exposure without fresh exact Ahmed-and-Ziad confirmation; do not overwrite unrelated uncommitted edits.

## Candidate preparation

**Design disposition:** NOT_APPLICABLE

**Design evidence:** NOT_REQUIRED

**Preparation review:** COMPLETE_INLINE

**Preparation fingerprint:** c1e1bf3c62c1f3a2e405b41de18d917c2d5f20f8694f06e03239b946d98f4737

**Unresolved findings:** NONE

**Established facts:** NONE

## Steps

- [x] Remove executable model routing and its claims.
- [x] Add manual Sol/Luna work-block planning and handoff rules.
- [x] Verify the stable candidate; exact-head CI and protected delivery remain the final conditional gate.

## Handoff

**Changed:** Policy v7 removes model floors, sticky escalation, worker default model, and active-model switch output/inputs; the Sol/Luna guide, workflow, template, readiness, and work-state output now use manual ordered blocks. Playwright now accepts a bounded alternate port and only cleans up a test server named by its own lock. Unrelated pre-existing changes to `docs/agents/ui-design-stack.md`, `next-env.d.ts`, and WP00-T13's completed record remain outside this task's commit.

**Commands:** Initial typecheck found stale model assertions, corrected. Focused policy tests 45/45 and port/ownership tests 2/2 exit 0; `pnpm verify:agent-policy` exit 0; TypeScript and fresh TypeScript exit 0; `pnpm verify:ci-workflow` exit 0; agent readiness exit 0; isolated handoff exit 0 after staging the new guide for its committed-snapshot fixture; skill validator exit 0; format check exit 0; lint exit 0; secret scan exit 0 for 985 files; `git diff --check HEAD` exit 0; full diff, stat, and changed-file secret/scope review complete. CLI route exit 0 without any model field; deprecated `--active-model` rejects with exit 1 as required. First guarded `pnpm verify` passed preparation and unit/integration/security/evaluation/load before Playwright refused occupied port 3100; a focused alternate-port test showed Next.js blocks a second dev server in the same checkout. The isolated checkout's first full gate reached 29/31 browser tests; trace showed deep-link HTML loaded while image requests remained pending, and a focused run found the preview route sometimes returned 404 before first compilation. Changing Playwright readiness from `/` to `/preview/learn?lang=en` passed both failing tests 2/2 in a fresh server run. Final guarded `corepack pnpm verify` in isolated checkout on port 3101 exited 0 for implementation candidate `cbfc83c`: 381 unit, 15 integration (two hosted-only expected skips), 26 security, 3 evaluation, 5 load, 31 Playwright, production build, client artifact scan, and all preflight checks. Preparation fingerprint `c1e1bf3c62c1f3a2e405b41de18d917c2d5f20f8694f06e03239b946d98f4737`. Final exact-head CI must verify this closure-doc commit. The original user dev server was preserved throughout.

**Remaining:** Final PR-head required CI, exact-candidate review, protected merge, main synchronization, and task-created temporary artifact cleanup if permitted.

**Next safe action:** Run final PR-head required checks, approve with accurate distinct-account provenance, merge through protection, then confirm main and affected proof.

**Reviewer action:** NONE
