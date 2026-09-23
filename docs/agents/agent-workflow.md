# Agent workflow

Use this lifecycle for every repository task. Product truth stays in the master plan, requirements and order stay in the runbook, durable task state stays in the task record, and derived execution mechanics stay in `agent-execution-policy.yaml`.

## 1. Orient and select

1. Run `git status --short`, preserve every unrelated change, and read the root `README.md` map.
2. Run `pwsh -NoProfile -File scripts/show-work-state.ps1`. Continue the earliest executable in-progress task, otherwise select the earliest executable task in runbook dependency order. A user-named outcome still maps to exactly one runbook task.
3. Read only the selected task, its direct dependencies/evidence, and the product/domain/design authority triggered by the request.
4. Create or update `planning/tasks/wpNN-tyy-short-outcome.md` from the controlled template. Record the selected speaker/checkpoint, files, acceptance, proof, evidence, rollback, and hard stops. For a new task, the user opens a fresh GPT-6 Sol High chat. Sol reads the applicable authority, resolves governing behavior and boundaries, and plans the fewest useful ordered work blocks in that record before implementation. Use [the manual Sol/Luna guide](model-work-blocks.md) for assignments and handoffs.

**Complete when:** one task is claimed, its readiness is proven, unrelated work is known, and no required context branch remains unread.

## 2. Derive the intent envelope

Give the central router a compact semantic classification:

```powershell
pnpm agent:route -- --task WP03-T04 --pass intent --surface frontend --surface runtime
```

Record its policy version, surfaces, risk, planning floor, worker budget, capabilities, procedural skills, and reason in the task record. The router classifies risk and checks; it neither selects nor verifies the Codex Desktop model. Model assignments are Sol's manual plan in the task record, independent of this envelope. A model assignment does not change required verification or approval.

**Complete when:** the task record contains one small execution envelope, ordered work blocks with independent acceptance checks, and every selected capability/skill has a concrete trigger.

## 3. Execute recoverable slices

1. Implement one end-to-end behavior through an established public seam. Keep domain/application rules behind small interfaces and external systems behind adapters.
2. Use synthetic fixtures, deterministic mocks, and zero paid capacity unless the task records approved real inputs and the financial boundary.
3. Run the smallest check able to reject the current slice. Fix recoverable failures proportionally; heavyweight diagnosis starts only for hard, unclear, reproduction-dependent, performance, or non-converging failures.
4. Persist decisions, commands, blockers, and resumable state in repository artifacts. Chat is coordination, not project memory.
5. Finish contiguous blocks assigned to the current model in the current chat. At a model boundary, record completed checks, current diff, remaining criteria, and the next assigned model, then tell the user which model to select in a fresh chat. Luna keeps a routine failure with a clear fix. For unresolved invariants, contradictory behavior, unclear protected rules, repeated acceptance failure, or growing repair effort, Luna records evidence and hands the same coherent block to Sol High; Sol revises the plan only from the task's governing requirements.

**Complete when:** the observable allowed path works, applicable failure/forbidden paths are covered, and another chat can reproduce the state from version control.

## 4. Reclassify the actual diff

Before candidate proof, run the actual-diff pass with semantic surfaces and any protected or uncertainty flags:

```powershell
pnpm agent:route -- --task WP03-T04 --pass actual-diff --surface frontend --surface runtime
```

Widen only for actual changed behavior, paths, or external mutations. Protected classification cannot be downgraded. Update the task record when the final envelope differs from intent.

**Complete when:** every changed path is covered by the final semantic envelope and no protected mutation or uncertainty is hidden.

## 5. Prepare and review the candidate

Record one explicit design disposition in the active task record. Non-frontend work derives `NOT_APPLICABLE`; frontend omission becomes `UNKNOWN` and blocks. Use `NONVISUAL` only when no rendered or interaction effect exists, with a concise rationale. `OBJECTIVE_PRESERVING` names the approved baseline and rationale; `APPROVED_REFERENCE` names the exact approved reference. Tokens or an agent-selected design do not establish either exemption. `MATERIAL` requires a founder-authored decision reference, accepted commit, actor, timestamp, and `routes:...; surfaces:...; states:...` scope in the existing evidence receipt. D-22 authorizes non-financial execution, not founder design acceptance.

Run focused rejecting checks and record results in `Commands`. For code, schema, CI, security, or material frontend work, perform candidate-changing review before broad verification. An inline review records `COMPLETE_INLINE`; use `COMPLETE_INDEPENDENT` only with separate reviewer provenance when a protected gate requires it. Resolve findings and repeat only affected focused checks and review. Present a technically safe material UI candidate to Ahmed or Ziad and record the founder receipt. A material presentation or interaction revision invalidates acceptance; a demonstrated nonvisual correction can retain it; unknown impact makes it missing.

After review, run the bounded proof-completeness pass:

```powershell
corepack pnpm agent:route -- --task WPXX-TYY --pass proof-preflight --surface <surface> --design-disposition <disposition> --design-evidence <reference> --format json
```

For `MATERIAL`, add `--receipt <path>` to the route. The preflight consumes the central selector's verification requirements, including the task contract's `Verify` field. Record the returned preparation fingerprint and review state in the task record. `pnpm verify` recomputes live changed paths and the fingerprint, checks the active contract, focused results, review, findings, design evidence, and complete proof preflight before starting the unchanged broad chain. Any candidate or contract change returns to preparation. Unknown paths, visual impact, and obligations fail conservatively.

For large sources, use headings or symbol search and bounded ranges. Treat truncation as a failed retrieval strategy. Reuse current source-bound facts; reopen a source when its hash is stale or the fact is insufficient.

**Complete when:** the preparation review covers the current fingerprint, findings are `NONE`, founder acceptance is current when required, and proof preflight is complete.

## 6. Verify and persist evidence

1. Add explicit runbook/task checks to the router's selected checks. Map each acceptance criterion, changed public seam, and material risk to one rejecting proof.
2. Reuse an exact-match passing receipt until one of its declared invalidating inputs changes. Generated receipts derive automated invalidators from the selected verification rule; human design acceptance is invalidated by `MATERIAL` presentation or interaction changes, retained for demonstrated `NONVISUAL` corrections and unrelated backend/docs changes, and treated as missing when visual impact is unknown. Malformed, missing, mismatched, or contradicted evidence means proof is missing.
3. Run guarded local `pnpm verify` when the task or policy selects broad stable verification; CI uses `pnpm verify:ci` at the exact candidate head.
4. While conditional CI is `SHADOW` or `READY`, keep broad CI unchanged, retain the router's per-job run/would-skip predictions, and compare them with outcomes from that same broad run. READY requires the policy's complete regression coverage, run and would-skip observations for every job, and zero unsafe skip contradictions; a contradiction falls back only the affected job. ENFORCED requires a separate governed policy and CI workflow change.
5. Inspect `git diff --check`, `git diff --stat`, the full diff, and changed-file secret/scope risk. Record results, invalidation/reuse, deviations, rollback, and unaffected checks/services in sanitized evidence.

**Complete when:** every acceptance criterion has direct green proof and every unrun check has an impact-based reason.

## 7. Deliver or honor the opt-out

For ordinary selected tasks, enter the terminal `finalize` workflow automatically: push one reviewable branch, create/update one PR, wait for exact-head required CI, perform exact-candidate delivery review, satisfy branch protection, merge the reviewed candidate, verify only affected external/production state, close task/runbook evidence, synchronize clean `main`, and delete task-created branch/temp state. A new delivery-review finding returns to preparation and invalidates affected evidence. D-22 supplies standing non-financial authorization; stop only immediately before real-money exposure or a genuine access/external/safety blocker.

Record review provenance accurately. An executor switching to another authorized GitHub account provides distinct-account approval and may satisfy account/branch-protection separation, but it is not independent review. Claim independent review only when a separate human or separately executing review agent/process examines the exact candidate. Require that stronger provenance only when the task or protected gate already requires it.

If the request explicitly narrowed delivery, update the task record handoff with the exact remaining action and stop at that boundary. `$finalize` can manually enter or resume terminal delivery later.

**Complete when:** the requested lifecycle boundary is proven from repository state and a fresh agent needs no prior-chat context.
