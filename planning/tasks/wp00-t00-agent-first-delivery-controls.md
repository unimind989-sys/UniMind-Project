# Task record: WP00-T00 agent-first delivery controls

**Task ID:** WP00-T00

**Status:** [?]

**Outcome:** A fresh coding agent can select, execute, verify, and hand off UniMind work from repository state without relying on prior chat.

**Owner:** Codex `/root`

**Reviewer:** Ahmed or Ziad — ordinary human checkpoint pending

**Branch:** `main` (no delivery branch requested)

**Updated (UTC):** 2026-08-24

## Execution contract

**Dependencies:** None.

**Inputs:** Ahmed's agent-first repository goal and explicit visual-tool integration request; `AGENTS.md`; the PoC master plan; the execution runbook; `CONTEXT.md`; the `writing-for-agents` skill; pinned Taste Skill, Awesome DESIGN.md, Agency OS Image to Code, Microsoft Playwright CLI, and Vercel Web Interface Guidelines sources.

**Files:** `AGENTS.md`, `README.md`, `package.json`, `pnpm-lock.yaml`, `.gitignore`, `.agents/skills/README.md`, `.agents/skills/ADAPTATIONS.md`, `.agents/skills/EVALS.md`, `.agents/skills/taste/`, `.agents/skills/awesome-design-md/`, `.agents/skills/image-to-code/`, `.agents/skills/playwright-cli/`, their four root license files, `docs/README.md`, `docs/agents/agent-workflow.md`, `docs/agents/skills-guide.md`, `docs/agents/ui-design-stack.md`, `docs/runbooks/poc-execution-runbook.md`, `docs/templates/README.md`, `docs/templates/task-record.md`, `planning/README.md`, `planning/decision-register.md`, this task record, `scripts/run-playwright-cli.mjs`, `scripts/show-work-state.ps1`, `scripts/test-agent-handoff.ps1`, and `scripts/verify-agent-readiness.ps1`.

**Verify:** Run the repository skill validator; run the local Playwright CLI version/help commands; run `pnpm verify`; run `scripts/show-work-state.ps1` in text and JSON modes; run `scripts/verify-agent-readiness.ps1`; run `scripts/test-agent-handoff.ps1`; run `git diff --check`; inspect `git diff --stat`, the full diff, and changed files for secrets.

**Pass:** The readiness script exits 0; one deterministic rule selects the next task; agent and human responsibilities are explicit; task state and handoff fields are durable; local documentation links resolve; governed names are consistent.

**Evidence:** Create `evidence/wp00-pilot/YYYY-MM-DD_agent-readiness_local_<short-sha>.md` from `docs/templates/gate-report.md` after the candidate commit exists.

**Rollback:** Revert this documentation-and-script slice; it changes no application, database, provider, environment, or external state.

**Hard stop:** A human reviewer must not mark the task or WP00 gate complete without personally inspecting the workflow, running the readiness script, and confirming that agent-first execution does not weaken human governance or the protected two-person rule.

## Steps

- [~] Audit entry points, task selection, naming, verification, and handoff coverage; implementation is ready for review.
- [~] Add the agent-first operating workflow and task-selection rule; implementation is ready for review.
- [~] Add the task-record template and planning location; implementation is ready for review.
- [~] Add the readiness verifier and make its focused checks pass; implementation is ready for review.
- [~] Add and machine-check the read-only work-state recommendation; implementation is ready for review.
- [~] Rehearse the repository-only handoff in an isolated committed snapshot; implementation is ready for review.
- [~] Pin and scope the requested visual reference, image-to-code, browser, and review toolchain; implementation is ready for review.
- [?] Obtain an Ahmed-or-Ziad human checkpoint and create commit-specific evidence.

## Handoff

**Changed:** Added the short agent workflow, deterministic and machine-readable task selection, agent/human role split, task record template, planning map, naming rules, `WP00-T00`, zero-cost work-state/readiness commands, and an isolated handoff rehearsal. Added a pinned visual workflow with manual Taste and Awesome DESIGN.md branches, automatic Image to Code and Playwright CLI branches, preserved Vercel review integration, exact licenses/commits, local package execution, artifact isolation, routing docs, and behavior cases.

**Commands:** On 2026-08-24, the repository skill validator passed all 20 skills; Playwright CLI `0.1.18` passed version/help plus open/snapshot/close browser smoke; `pnpm verify` passed formatting, lint, strict type checking, module boundaries, 136 unit tests, and the safe production build; agent readiness passed 81 governed names, 31 local links, 20 decisions, and 102 task contracts; the isolated handoff rehearsal and text/JSON work-state checks passed; source comparisons, whitespace checks, `git diff --check`, and a credential-shape scan passed. The current recommendation remains computed from live decision and task records.

**Remaining:** Create commit-specific evidence after a candidate commit exists and obtain an ordinary founder human checkpoint.

**Next safe action:** Ahmed or Ziad can verify this task while the agent executor advances WP00-T01, which does not depend on that review outcome.

**Reviewer action:** Verify the fresh-agent flow from `README.md`, run the readiness script, inspect naming and authority boundaries, and confirm the human governance gates remain intact.
