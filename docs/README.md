# UniMind documentation

This directory separates authoritative plans, executable procedures, and reusable working templates. Keep decisions and implementation evidence linked from the execution runbook instead of adding unrelated documents at the repository root.

## Plans

- [PoC master plan](plans/poc-master-plan.md) — authoritative scope, product rules, architecture, roadmap, gates, and decision log.
- [Egyptian-Arabic plan](plans/poc-master-plan-ar-eg.html) — rendered Arabic companion for project communication. The English Markdown master plan remains authoritative.

## Runbooks

- [PoC execution runbook](runbooks/poc-execution-runbook.md) — dependency-ordered task list with each task's gates, proof and pass line, the values still to set, real-data and money boundaries, troubleshooting and the PoC acceptance checklist.
- [Environment promotion](runbooks/environment-promotion.md) — guarded Preview smoke, exact-commit locked Beta candidate, and forward-only rollback procedure.

## Agent guidance

The always-on rules for coding agents (Codex, Claude Code) are in [`AGENTS.md`](../AGENTS.md); Claude Code loads them through [`CLAUDE.md`](../CLAUDE.md).

- [Workflow](agents/workflow.md) — the single task lifecycle: status, pick, plan, build, verify, review, deliver.
- [Frontend](agents/frontend.md) — frontend quality floor and UI design workflow.
- [Communication](agents/communication.md) — speaker selection and chat preferences for Ahmed and Ziad.
- [Module boundaries](agents/module-boundaries.md) — file naming, dependency directions, ownership, and the automated architecture check.
- [Repository skills](../.agents/skills/README.md) — skill index for Codex (`.agents/skills/`) and Claude Code (generated copies in `.claude/skills/`).

## Decisions

- [Decision records](decisions/README.md) — one file per reviewed decision; status lives only in the master-plan decision log.
- [Architecture decision records](adr/README.md) — accepted architecture decisions.

## Templates

- [Template index](templates/README.md) — decision, cohort, rights, raw-data, provider, RLS, load, gate, and incident templates.

## Working state

- [Canonical design contract](../DESIGN.md) — current visual and interaction rules. Dated approvals are in the [design approval history](../evidence/wp03-product-shell/design-approval-history.md).
- [Frontend overhaul audit](reviews/wp03-frontend-overhaul.md) — role flows, preserved capabilities, concrete findings and design checkpoints.
- [WP03 refinement](reviews/wp03-refinement/README.md) — October 2026 platform audit, plan, CI and testing report and final verification (WP03-T24 to T30).
- [Runbook revision](reviews/runbook-revision-2026-10/second-review.md) — October 2026 first and second reviews of the execution runbook against the master plan, the code and the platform (WP00-T19).
- [Planning workspace](../planning/README.md) — in-progress task records, the decision register, and controlled planning inputs. Approved direction moves to its owning document under `docs/`.

## Placement rules

- Put approved product and architecture direction in `plans/`.
- Put repeatable execution, recovery, and operating procedures in `runbooks/`.
- Keep blank reusable forms in `templates/`; copy them to the destination named by the runbook before filling them.
- Keep current execution state and filled planning inputs under root `planning/`; do not use chat history as the task tracker.
- Store sanitized gate output under root `evidence/`, following the naming and content rules in [`evidence/README.md`](../evidence/README.md). Private source material, student data, secrets, and unredacted logs must never be committed.
- Use lowercase kebab-case for authored filenames and descriptive singular directory names.
- Use a conventional uppercase filename only for a recognized entry point: `README.md`, `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, `CONTRIBUTING.md`, `DESIGN.md`, or `PRODUCT.md`.
- Name a document for its durable subject and type, such as `raw-data-lifecycle.md` or `provider-selection.md`. Avoid ambiguous names such as `notes.md`, `misc.md`, `new.md`, or `final-v2.md`.
- Decision filenames use a lowercase stable ID followed by the subject, such as `d-01-human-medicine-cohort.md`; the decision ID inside the file remains `D-01`.
