# Task record: WP00-T19 Revise the execution runbook against the master plan

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP00-T19

**Status:** [~]

**Outcome:** The runbook covers every master-plan deliverable with an executable, correctly ordered task, and every open task states its dependencies, decision gates, protected-path and material-UI flags, proof and pass condition.

**Acceptance:** [WP00-T19](../../docs/runbooks/poc-execution-runbook.md#wp00-t19--revise-the-execution-runbook-against-the-master-plan)

**Owner:** Claude Code; selected checkpoint Ahmed (request of 19 October 2026: "do an in depth revision … understand what is missing and further improve on it")

**Branch:** claude/wp00-t19-runbook-revision

**Updated (UTC):** 2026-10-19

## Contract

**Dependencies:** WP00-T18 (agent workflow v2). No product task is started.

**Inputs:** `docs/plans/poc-master-plan.md`, the runbook at `74bd340`, `planning/decision-register.md`, decision records, `scripts/agent/status.ts` (heading and checkbox format), the code tree at `74bd340`.

**Files:** `docs/runbooks/poc-execution-runbook.md`, `docs/reviews/runbook-revision-2026-10/findings.md`, `planning/decision-register.md`, `docs/plans/poc-master-plan.md` (decision log rows only), decision records whose resolution path moved (D-04, D-17, D-18 register row), this record.

**Protected paths:** none. Documentation only; no code, migration, workflow or configuration change.

**Verify:** `corepack pnpm lint:agents`; `corepack pnpm agent:status` (task parsing, no lost task, sensible next task); `corepack pnpm format:check`; `git diff --check`; full diff review; every existing `#### WPxx-Tyy — title` heading still present with the same text.

**Pass:** no task heading lost or renamed; every master-plan deliverable maps to a task (findings §F); no open decision is shown as approved; no completed task is shown as incomplete or the reverse, except the two corrections the findings name; agent lint passes.

**Rollback:** revert the PR; the previous runbook is `74bd340`.

**Hard stop:** deciding a product question inside the runbook (enrollment model, Batch Leader links, providers, budgets, retention) instead of recording it as an open decision.

## Steps

- [x] Read the master plan, the whole runbook, the workflow and the status parser.
- [x] Check runbook claims against the code (memberships, campaigns, vector dimension, SMTP, workers, observability, routes).
- [x] Write the findings report.
- [x] Rewrite the runbook as revision 3.0.
- [x] Sync the decision register, the master-plan decision log (new open D-25, D-26) and the moved resolution paths.
- [x] Run agent lint, status, format check and the diff review.
- [ ] Founder review of the revised runbook, then PR, required CI and merge.

## Decisions

- Existing task IDs and heading texts stay unchanged (decision records, reviews and task records link to them). New tasks get new IDs; document order is the execution order.
- Completed tasks keep their heading, one checked line and their record/evidence links. Their delivery history stays in task records, evidence and git, as WP00-T18 already required for authority documents.
- Product questions found during the audit become open decisions (D-25 student membership, D-26 transactional email) or decision-gate items. None is answered here.
- WP03-T13's last item becomes `[?]` (waiting on Ahmed's hands-on review) instead of `[~]`; WP00-T03 and WP00-T05 items that need founder input become `[?]`. These are status corrections, not completions.

## Current state

**Changed:** runbook revision 3.0 (3046 → 2429 lines); findings report; decision register (D-25, D-26 added; resolution paths and blocked tasks updated); master-plan decision log (D-25, D-26 as Open); `Blocks` lines in the D-02, D-04, D-05, D-17, D-19 records and the raw-data policy; WP03-T13 record status `[?]`.

**Proof:** heading comparison against `74bd340` → 0 lost or renamed, 15 added. State comparison with the status parser → 63 done unchanged; only intended changes (decision gates now `[?]`, WP03-T13 `[~]`→`[?]`). `pnpm lint:agents` → pass (65 documents, every link resolves). `pnpm agent:status` → next WP00-T05. `git diff --check` → clean. `pnpm check` → format, boundaries, SQL, typecheck, lint, agent lint and secret scan pass; `test:unit` failed once inside the parallel run and passed 1046/1046 when rerun alone (no test reads the changed documents' content). `pnpm verify` not run: documentation-only change; required CI on the PR is the gate.

**Review:** self-review. Documentation-only change; no protected path.

**Approved commit:** NOT REQUIRED: no UI change.

**Remaining:** Ahmed's review of the revised task order and the two new open decisions; PR and merge.

## Next action

Present the findings and the revised runbook to Ahmed; on his go-ahead, open the PR, wait for required CI and merge.
