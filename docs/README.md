# UniMind documentation

This directory separates authoritative plans, executable procedures, and reusable working templates. Keep decisions and implementation evidence linked from the execution runbook instead of adding unrelated documents at the repository root.

## Plans

- [PoC master plan](plans/poc-master-plan.md) — authoritative scope, product rules, architecture, roadmap, gates, and decision log.
- [Egyptian-Arabic plan](plans/poc-master-plan-ar-eg.html) — rendered Arabic companion for project communication. The English Markdown master plan remains authoritative.

## Runbooks

- [PoC execution runbook](runbooks/poc-execution-runbook.md) — dependency-ordered build tutorial, atomic task list, verification gates, rollback guidance, troubleshooting, and final release checks.
- [Environment promotion](runbooks/environment-promotion.md) — guarded Preview smoke, exact-commit locked Beta candidate, and forward-only rollback procedure.

## Agent guidance

- [Agent workflow](agents/agent-workflow.md) — the short path from repository orientation through task selection, execution, verification, and handoff.
- [Skills guide](agents/skills-guide.md) — skill routing and copy-ready invocation examples.
- [UI design stack](agents/ui-design-stack.md) — the approved UI design workflow and its authority boundaries.
- [Communication profiles](agents/communication-profiles.md) — speaker selection and chat-experience boundaries for Ahmed and Ziad.
- [Ahmed's English profile](agents/english-profile.md) — Ahmed's default communication preferences and optional vocabulary notes.

## Templates

- [Template index](templates/README.md) — decision, cohort, rights, raw-data, provider, RLS, load, gate, and incident templates.

## Working state

- [Planning workspace](../planning/README.md) — in-progress task records, the decision register, and controlled planning inputs. Approved direction moves to its owning document under `docs/`.

## Placement rules

- Put approved product and architecture direction in `plans/`.
- Put repeatable execution, recovery, and operating procedures in `runbooks/`.
- Keep blank reusable forms in `templates/`; copy them to the destination named by the runbook before filling them.
- Keep current execution state and filled planning inputs under root `planning/`; do not use chat history as the task tracker.
- Store sanitized gate output under root `evidence/`. Private source material, student data, secrets, and unredacted logs must never be committed.
- Use lowercase kebab-case for authored filenames and descriptive singular directory names.
- Use a conventional uppercase filename only for a recognized entry point: `README.md`, `AGENTS.md`, `CONTEXT.md`, `CONTRIBUTING.md`, `DESIGN.md`, or `PRODUCT.md`.
- Name a document for its durable subject and type, such as `raw-data-lifecycle.md` or `provider-selection.md`. Avoid ambiguous names such as `notes.md`, `misc.md`, `new.md`, or `final-v2.md`.
- Decision filenames use a lowercase stable ID followed by the subject, such as `d-01-human-medicine-cohort.md`; the decision ID inside the file remains `D-01`.
- Evidence reports are the intentional exception and use `YYYY-MM-DD_<gate>_<environment>_<short-sha>.md`.
