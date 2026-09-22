# Agent workflow

Use this lifecycle for every repository task. Product truth stays in the master plan, requirements and order stay in the runbook, durable task state stays in the task record, and derived execution mechanics stay in `agent-execution-policy.yaml`.

## 1. Orient and select

1. Run `git status --short`, preserve every unrelated change, and read the root `README.md` map.
2. Run `pwsh -NoProfile -File scripts/show-work-state.ps1`. Continue the earliest executable in-progress task, otherwise select the earliest executable task in runbook dependency order. A user-named outcome still maps to exactly one runbook task.
3. Read only the selected task, its direct dependencies/evidence, and the product/domain/design authority triggered by the request.
4. Create or update `planning/tasks/wpNN-tyy-short-outcome.md` from the controlled template. Record the selected speaker/checkpoint, files, acceptance, proof, evidence, rollback, and hard stops.

**Complete when:** one task is claimed, its readiness is proven, unrelated work is known, and no required context branch remains unread.

## 2. Derive the intent envelope

Give the central router a compact semantic classification:

```powershell
pnpm agent:route -- --task WP03-T04 --pass intent --surface frontend --surface runtime
```

Record its policy version, surfaces, risk, planning/model floor, worker budget, capabilities, procedural skills, and reason in the task record. Read the router's model-runtime action before implementation: proceed when a verified active model satisfies the floor, request a switch only when a verified active model is below it, and record `unverified` as a runtime limitation when the active model cannot be established. Never mutate shared Codex configuration and treat that as proof that the live session changed. The router applies deterministic floors and widening; it does not define acceptance criteria.

**Complete when:** the task record contains one small execution envelope and every selected capability/skill has a concrete trigger.

## 3. Execute recoverable slices

1. Implement one end-to-end behavior through an established public seam. Keep domain/application rules behind small interfaces and external systems behind adapters.
2. Use synthetic fixtures, deterministic mocks, and zero paid capacity unless the task records approved real inputs and the financial boundary.
3. Run the smallest check able to reject the current slice. Fix recoverable failures proportionally; heavyweight diagnosis starts only for hard, unclear, reproduction-dependent, performance, or non-converging failures.
4. Persist decisions, commands, blockers, and resumable state in repository artifacts. Chat is coordination, not project memory.

**Complete when:** the observable allowed path works, applicable failure/forbidden paths are covered, and another agent can reproduce it from version control.

## 4. Reclassify the actual diff

Before candidate proof, run the actual-diff pass with semantic surfaces and any protected or uncertainty flags:

```powershell
pnpm agent:route -- --task WP03-T04 --pass actual-diff --surface frontend --surface runtime
```

Widen only for actual changed behavior, paths, or external mutations. Protected classification cannot be downgraded. Update the task record when the final envelope differs from intent.

**Complete when:** every changed path is covered by the final semantic envelope and no protected mutation or uncertainty is hidden.

## 5. Resolve material design judgment and proof completeness

The central route uses the existing `designJudgment` and `humanVisualDecision` flags. Set `designJudgment` only when the frontend diff contains unresolved subjective judgment about layout, hierarchy, typography/readability, navigation or interaction presentation, density, responsive presentation, copy/presentation, or overall product feel. Backend-only work, nonvisual refactors, objective accessibility fixes, tiny corrections that preserve approved intent, routine responsive repairs that preserve an approved design, and faithful implementation of an explicitly approved reference keep it false unless a material unresolved choice appears.

When the route reports `HUMAN_DESIGN_ACCEPTANCE_REQUIRED`, first make a technically safe coherent rendered candidate: focused types/lint/tests pass, obvious runtime/console/render failures are fixed, and basic accessibility, responsive, and RTL/LTR behavior are checked. Present that candidate for one founder hands-on subjective product/design decision. The founder decides whether the layout, hierarchy, readability, density, navigation, interaction presentation, copy, and UniMind feel are acceptable; the agent remains responsible for correctness, security, accessibility mechanics, automated proof, CI, and delivery. A material visual change after acceptance makes the existing design receipt stale and requires the candidate to be shown again. A nonvisual repair retains the accepted design receipt.

After the candidate is technically safe and any required founder design acceptance is recorded, run the bounded proof-completeness pass once:

```powershell
corepack pnpm agent:route -- --task WPXX-TYY --pass proof-preflight --surface <surface> --path <changed-path> --format json
```

The preflight inventories every applicable proof obligation through the central selector: application/type/lint, security/Auth/RLS, database and generated-artifact parity, rendered behavior, accessibility, RTL/LTR, responsive behavior, fresh-checkout assumptions, release fingerprint, task/readiness, and task-selected hosted-service proof. It identifies obligations; it does not run every expensive check. Do not begin stable broad verification until the result is `COMPLETE` and no design gate is pending. Unknown paths, malformed policy, and high-risk omissions remain conservative and block stable-candidate status.

For large policy, runbook, or reference files, inspect headings/index or search targeted concepts first, then read bounded ranges. A truncated output triggers narrower retrieval; it is not a reason to repeat the same oversized read. Reuse unchanged complete reads unless a relevant section may have changed or a new question requires it.

**Complete when:** a coherent candidate has passed focused rejection checks, any required founder design acceptance is current, and the proof inventory is complete before expensive stable verification.

## 6. Verify and persist evidence

1. Add explicit runbook/task checks to the router's selected checks. Map each acceptance criterion, changed public seam, and material risk to one rejecting proof.
2. Reuse an exact-match passing receipt until a relevant surface/input changes. Malformed, missing, mismatched, or contradicted evidence means proof is missing.
3. Run focused stable-candidate checks once. Run local `pnpm verify` when the task or policy selects it; exact-head required GitHub CI remains the broad delivery gate.
4. While conditional CI is `SHADOW` or `READY`, keep broad CI unchanged, retain the router's per-job run/would-skip predictions, and compare them with outcomes from that same broad run. READY requires the policy's complete regression coverage, run and would-skip observations for every job, and zero unsafe skip contradictions; a contradiction falls back only the affected job. ENFORCED requires a separate governed policy and CI workflow change.
5. Inspect `git diff --check`, `git diff --stat`, the full diff, and changed-file secret/scope risk. Record results, invalidation/reuse, deviations, rollback, and unaffected checks/services in sanitized evidence.

**Complete when:** every acceptance criterion has direct green proof and every unrun check has an impact-based reason.

## 7. Deliver or honor the opt-out

For ordinary selected tasks, enter the terminal `finalize` workflow automatically: push one reviewable branch, create/update one PR, wait for exact-head required CI, repair invalidated proof, satisfy branch protection, merge the reviewed candidate, verify only affected external/production state, close task/runbook evidence, synchronize clean `main`, and delete task-created branch/temp state. D-22 supplies standing non-financial authorization; stop only immediately before real-money exposure or a genuine access/external/safety blocker.

If the request explicitly narrowed delivery, update the task record handoff with the exact remaining action and stop at that boundary. `$finalize` can manually enter or resume terminal delivery later.

**Complete when:** the requested lifecycle boundary is proven from repository state and a fresh agent needs no prior-chat context.
