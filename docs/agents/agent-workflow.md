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

Record its policy version, surfaces, risk, planning/model floor, worker budget, capabilities, procedural skills, and reason in the task record. The router applies deterministic floors and widening; it does not define acceptance criteria. If the runtime cannot prove it satisfies the model floor, expose that limitation rather than pretending to switch models.

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

## 5. Verify and persist evidence

1. Add explicit runbook/task checks to the router's selected checks. Map each acceptance criterion, changed public seam, and material risk to one rejecting proof.
2. Reuse an exact-match passing receipt until a relevant surface/input changes. Malformed, missing, mismatched, or contradicted evidence means proof is missing.
3. Run focused stable-candidate checks once. Run local `pnpm verify` when the task or policy selects it; exact-head required GitHub CI remains the broad delivery gate.
4. Inspect `git diff --check`, `git diff --stat`, the full diff, and changed-file secret/scope risk. Record results, invalidation/reuse, deviations, rollback, and unaffected checks/services in sanitized evidence.

**Complete when:** every acceptance criterion has direct green proof and every unrun check has an impact-based reason.

## 6. Deliver or honor the opt-out

For ordinary selected tasks, enter the terminal `finalize` workflow automatically: push one reviewable branch, create/update one PR, wait for exact-head required CI, repair invalidated proof, satisfy branch protection, merge the reviewed candidate, verify only affected external/production state, close task/runbook evidence, synchronize clean `main`, and delete task-created branch/temp state. D-22 supplies standing non-financial authorization; stop only immediately before real-money exposure or a genuine access/external/safety blocker.

If the request explicitly narrowed delivery, update the task record handoff with the exact remaining action and stop at that boundary. `$finalize` can manually enter or resume terminal delivery later.

**Complete when:** the requested lifecycle boundary is proven from repository state and a fresh agent needs no prior-chat context.
