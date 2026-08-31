# Agent workflow

Use this workflow for every repository change. It is a routing document: product truth remains in the master plan, task contracts remain in the execution runbook, and domain language remains in `CONTEXT.md`.

## 1. Orient

1. Run `git status --short` and identify every existing change before editing.
2. Read the root `README.md` map and the always-on `AGENTS.md` rules.
3. Classify the request as product/architecture, implementation, domain behavior, UI, diagnosis, or documentation.
4. Load only the authority triggered by that class: the relevant master-plan section, runbook task, `CONTEXT.md`, design records, or an applicable skill.

**Complete when:** the request has one named authority, unrelated user work is identified, and no required context branch remains unread.

## 2. Select one executable task

1. Run `pwsh -NoProfile -File scripts/show-work-state.ps1` to see active records, human-only blockers, and the earliest task not blocked by a decision or failed dependency.
2. Map a user-named outcome to one work package and task; otherwise inspect the command's recommendation and apply the selection order in runbook section 0.1.
3. Prove the definition of ready from runbook section 0.3. Treat missing or unreviewed evidence as incomplete; the work-state command is routing evidence, not proof of readiness.
4. Copy `docs/templates/task-record.md` to `planning/tasks/wpNN-tyy-short-outcome.md` and fill every field. For ordinary work, name Ahmed or Ziad as the human checkpoint; that founder may also be the requester, authorizer, and signed-in operator. Use `AHMED + ZIAD — TWO-PERSON GATE BLOCKED` only when a protected gate still lacks both named confirmations.
5. Mark the selected checklist item `[~]`; mark a blocking item `[?]` with a linked decision or dependency.

After reviewed WP00-T08 `PASS`, the work-state command may use the runbook's **WP00 mock bridge** to select WP01 while real-choice tasks remain blocked. Treat this as permission for synthetic data, deterministic mocks, local sinks, and zero paid capacity only.

After every WP01 task and the reviewed WP01-T11 package gate pass, the command may use the **WP01 foundation bridge** to select the earliest eligible WP02 task. Preserve every open decision's exact consumer block and stop at protected rights, RLS, raw-deletion, budget, release, or live-provider gates until their named confirmations exist.

**Complete when:** exactly one task is claimed and its dependencies, files, verification, evidence, rollback, and hard stops are explicit.

## 3. Execute a recoverable slice

1. Implement the smallest end-to-end outcome that satisfies the task rather than a disconnected layer.
2. Keep business rules in domain/application modules and external systems behind adapters. Follow the file conventions and per-module contracts in [module-boundaries.md](module-boundaries.md); `pnpm check:boundaries` enforces the main forbidden directions.
3. Use synthetic fixtures and deterministic mocks unless the task records approved real-data and paid-call gates.
4. Encode repeatable work in repository scripts, tests, migrations, or runbooks. Document unavoidable signed-in, consent, credential, payment, or approval steps in the handoff; route them through `$wizard` only after an explicit user request.
5. Run the narrowest relevant check after each meaningful change and record any deviation immediately.

**Complete when:** the observable outcome works through its public seam, failure and forbidden paths are covered where applicable, and another agent can reproduce the result from version control.

## 4. Verify the claimed scope

1. Run the task's exact focused checks.
2. Run `pnpm verify` once work package 1 provides it; before then, run every available applicable check and name the missing infrastructure.
3. For agent-facing documentation, task-state, or repository navigation changes, run `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` and `pwsh -NoProfile -File scripts/test-agent-handoff.ps1`.
4. Run `git diff --check`, `git diff --stat`, inspect the full diff, and scan changed files for secrets and accidental scope.
5. Update the evidence bundle with commands, exit codes, results, deviations, and rollback.

**Complete when:** every acceptance criterion has direct evidence, every applicable check is green, and every unrun check is explicitly reported.

## 5. Hand off from repository state

1. Update the task record status and handoff section with changed files, commands/results, remaining work, and the next safe action.
2. Link the evidence bundle and identify any restricted evidence without copying sensitive content.
3. Leave protected gates unapproved until both founders' named confirmations exist. For ordinary work, record which founder inspected the evidence and the resulting decision.
4. Summarize the outcome, verification, and open risks to the user without relying on earlier progress messages.

**Complete when:** a fresh agent can resume safely from the task record, authorities, diff, and evidence without access to the prior chat.

## Fresh-agent rule

Chat is coordination, not durable project state. Persist every implementation choice, task status, command contract, blocker, and handoff fact in its authoritative repository artifact. If a fresh agent must ask what happened, the handoff is incomplete.
