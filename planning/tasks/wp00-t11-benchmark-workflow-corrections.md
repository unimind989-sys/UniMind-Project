# Task record: WP00-T11 benchmarked workflow corrections

**Task ID:** WP00-T11

**Status:** [~]

**Outcome:** The first real WP03 benchmark is incorporated as a narrow self-correction of the existing WP00-T09/T10 execution architecture, preserving technical proof while avoiding redundant verification and restoring founder authority for material subjective design decisions.

**Owner:** Codex `/root`; Ahmed is the explicitly identified chat speaker and named human checkpoint

**Reviewer:** Ahmed; D-22 standing Ahmed-and-Ziad authorization applies to protected non-financial delivery

**Branch:** `wp00/benchmark-workflow-corrections`

**Updated (UTC):** 2026-09-22T12:01:30Z

## Derived execution envelope

**Policy version:** 3

**Surfaces:** docs, delivery, tooling

**Risk:** R2

**Planning:** Short

**Model floor:** Luna Max

**Model runtime:** active model unverified and limitation reported

**Worker budget:** 0 used, maximum 1, nested workers prohibited

**Capabilities:** release-safety

**Procedural skills:** tdd

**Routing reason:** Evidence-triggered maintenance of the central execution policy, proof selection/reuse, local test harness, and release validation seams; no product runtime or hosted state is changed.

## Execution contract

**Dependencies:** Merged WP00-T09/T10 execution architecture; completed WP03-T04 benchmark evidence; current agent workflow, policy, task-record, evidence, CI, Playwright, and deployment-smoke seams.

**Inputs:** User-supplied WP03-T04 benchmark evidence; `docs/agents/agent-execution-policy.yaml`; `scripts/lib/agent-execution-policy.ts`; existing evidence receipt; synthetic fixtures and deterministic mocks only.

**Files:** Central policy/router and tests; bounded context and Playwright helpers; deployment-smoke release validation; package/TypeScript configuration; agent workflow/finalization/runbook guidance; this task record and sanitized evidence.

**Verify:** Focused red-green policy/evidence/context/process/deployment tests; `corepack pnpm typecheck:fresh`; `corepack pnpm verify:agent-policy`; `corepack pnpm scan:secrets`; `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1`; `git diff --check`; `git diff --stat`; full diff and changed-file scope review; exact-head required GitHub CI.

**Pass:** All twelve named regression areas pass; stable-candidate obligations are inventoried before broad verification; unknown/high-risk proof remains conservative; fresh-checkout and task-owned Playwright failures are caught cheaply; release promotion rejects inconsistent identity; no mandatory proof is removed.

**Evidence:** `evidence/wp00-pilot/<date>_benchmark-workflow-corrections_<environment>_<short-sha>.md` plus the exact-head CI and protected-delivery records.

**Rollback:** Revert this task through one protected PR. Restore the prior policy/router, task guidance, fresh-check type proof, Playwright wrapper, and release-validation helper; no database, provider, deployment, billing, or user data state is mutated.

**Hard stop:** Do not reopen or modify WP03-T04; do not implement WP03-T05; do not weaken security, accessibility, RTL/LTR, responsive, release, branch-protection, exact-head, or evidence requirements; do not expose secrets/private payloads; do not add workers, a supervisor, another MCP/browser/evidence store, telemetry, or paid/external mutations.

## Steps

- [x] Record the benchmark and derive the bounded intent/actual-diff envelope from the central router.
- [x] Add failing regression coverage at the existing policy, receipt, context, process, and deployment seams.
- [x] Implement the smallest owning-rule corrections and update the workflow/finalization guidance.
- [x] Run affected verification once after the candidate is proof-complete; inspect scope, secrets, and invalidation/reuse.
- [~] Complete exact-head CI/review, protected merge, synchronized-main proof, evidence closure, cleanup, and WP03-T05 selection without implementing it.

## Handoff

**Changed:** The existing policy/router now carries material subjective frontend design acceptance, proof-completeness preflight, conservative unknown/high-risk handling, context-retrieval planning, evidence-aware reuse/invalidation, fresh-state type proof selection, task-owned Playwright server cleanup, and sanitized pre-promotion release-fingerprint validation. Workflow, frontend-quality, finalization, runbook, contribution, package, and E2E guidance now preserve one founder checkpoint only when required and one stable broad verification pass after the inventory is complete. WP03-T04 remains unchanged; WP03-T05 is not started.

**Commands:** Initial and actual-diff routing selected the bounded docs/delivery/tooling R2 short envelope with policy v3, Luna Max floor, zero workers, and release-safety only; active model remained unverified and was reported. The first proof preflight conservatively reported `UNKNOWN` for the new fresh type-config path; the existing tooling path widening was corrected, and the final preflight returned `COMPLETE` with no missing obligations. Focused policy/deployment/Playwright regression tests passed 47/47; skill validation passed for 22 skills; agent readiness passed 192 names, 46 links, 23 decisions, and 105 task contracts; handoff rehearsal passed. The final credential-free `corepack pnpm verify` passed formatting, lint, normal and fresh-state type checks, boundaries, SQL/CI/policy/secret audits, 358 unit, 15 integration with 2 expected hosted-only skips, 24 security, 3 evaluation, 5 load, 24 E2E, optimized production build, and client-artifact scan. No hosted database, provider, deployment, browser credential, or billable mutation was run.

**Remaining:** Push the reviewed implementation candidate, obtain exact-head required CI and independent review, merge through protected main, create the sanitized commit-specific evidence/closure update, prove synchronized clean main and selector advancement, remove task-created branch state, and leave WP03-T05 as the next eligible product task without implementing it.

**Next safe action:** Review the final diff, commit the implementation candidate, and open the single protected pull request.

**Reviewer action:** NONE for routine technical work; founder design acceptance is required only for a future product task whose final diff activates the new material-subjective-design gate.
