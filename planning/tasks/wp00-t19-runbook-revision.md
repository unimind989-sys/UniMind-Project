# Task record: WP00-T19 Revise the execution runbook against the master plan

<!-- Keep this record at or under 120 lines (checked by `pnpm lint:agents`). It holds the CURRENT state of one task. Overwrite "Current state" and "Next action"; never append session logs. History lives in commits and the PR. -->

**Task ID:** WP00-T19

**Status:** [~]

**Outcome:** The runbook covers every master-plan deliverable with an executable, correctly ordered task, and every open task states its dependencies, decision gates, protected-path and material-UI flags, proof and pass condition.

**Acceptance:** [WP00-T19](../../docs/runbooks/poc-execution-runbook.md#wp00-t19--revise-the-execution-runbook-against-the-master-plan)

**Owner:** Claude Code; selected checkpoint Ahmed (request of 19 October 2026: "do an in depth revision … understand what is missing and further improve on it")

**Branch:** claude/wp00-t19-runbook-revision

**Updated (UTC):** 2026-10-20 (third review)

## Contract

**Dependencies:** WP00-T18 (agent workflow v2). No product task is started.

**Inputs:** `docs/plans/poc-master-plan.md`, the runbook at `74bd340`, `planning/decision-register.md`, decision records, `scripts/agent/status.ts` (heading and checkbox format), the code tree at `74bd340`.

**Files:** `docs/runbooks/poc-execution-runbook.md`; `docs/reviews/runbook-revision-2026-10/` (findings, second review); `planning/decision-register.md`; `docs/plans/poc-master-plan.md` (decision log rows only); the D-02, D-04, D-05, D-10, D-17, D-19 and D-24 records and the raw-data policy (`Blocks` lines); `scripts/agent/status.ts` and `tests/unit/agent-status.test.ts`; small stale-reference fixes in `docs/README.md`, `docs/agents/workflow.md`, `docs/templates/task-record.md`, `docs/runbooks/environment-promotion.md`, `planning/decision-workshop.html` and two task records; this record.

**Protected paths:** none. Documentation plus the read-only `agent:status` tool; no migration, workflow, auth, storage or production configuration change.

**Verify:** `corepack pnpm lint:agents`; `corepack pnpm agent:status`; `tests/unit/agent-status.test.ts`; `corepack pnpm check`; `git diff --check`; full diff review; every `#### WPxx-Tyy — title` heading on `main` still present with the same text; a dependency audit with no unknown or forward dependency.

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
- [x] Second review in five independent passes; every finding verified against its source; revision 3.1, `agent:status` dependency awareness, register and record sync, second review report.
- [x] Third review in six passes (fact-check, two fresh-agent dry runs, delivery realism, product/UX, master-plan critique); revision 3.2; proposed master-plan amendments; third review report.
- [ ] Founder review of the revised runbook and the master-plan amendments, then PR, required CI and merge.

## Decisions

- Existing task IDs and heading texts stay unchanged (decision records, reviews and task records link to them). New tasks get new IDs; document order is the execution order.
- Completed tasks keep their heading, one checked line and their record/evidence links. Their delivery history stays in task records, evidence and git, as WP00-T18 already required for authority documents.
- Product questions found during the audits become open decisions (D-25 student membership, D-26 transactional email, D-27 backup and key custody, D-28 data protection, and a D-21 revision for real sources in locked Beta) or decision-gate items. None is answered here.
- New WP04 tasks from revision 3.0 were renumbered in 3.1 (they never reached `main`): host T14, storage T15, backup T16, email T17, gate T18, benchmark T19, embeddings T20, corpus T21.
- WP03-T13's last item becomes `[?]` (waiting on Ahmed's hands-on review) instead of `[~]`; WP00-T03 and WP00-T05 items that need founder input become `[?]`. These are status corrections, not completions.

## Current state

**Changed:** runbook revision 3.2 (new WP00-T22, WP04-T22 to T24, WP08-T12/T13; fact corrections; founder questions inside tasks); proposed master-plan amendments (not applied); third review report; earlier: runbook revision 3.1; first findings corrected and second review published; decision register (D-25 to D-28, moved resolution paths); master-plan decision log (D-25 to D-28 as Open); `Blocks` lines in decision records and the raw-data policy; `agent:status` reads `Depends on`; stale references fixed.

**Proof:** headings vs `main` → 0 lost, 20 added; status parser → 63 done unchanged, only intended state changes; dependency audit → no unknown or forward dependency; `pnpm agent:status` → next executable WP00-T05; other results in the PR body.

**Review:** five independent read-only review agents on revision 3.0; findings verified by the executor against code, migrations, decision records and provider documentation. Revision 3.1 itself is self-reviewed.

**Approved commit:** NOT REQUIRED: no UI change.

**Remaining:** Ahmed's review of the revised order, the open decisions (urgent: D-28) and the master-plan amendments A1–A16; PR and merge.

## Next action

Present the second review to Ahmed; on his go-ahead, open the PR, wait for required CI and merge.
