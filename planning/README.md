# Planning workspace

This directory holds structured work in progress. It is durable coordination state for agents and reviewers, not an alternative source of product truth.

## Contents

- `tasks/` — one filled task record per claimed atomic runbook task.
- `decision-register.md` — decision status, owner, due date, record, resolution path, and blocked tasks.
- `cohort-selection-review.md` — the exact human inputs and scoring contract needed to finish D-01, D-02, and D-03.
- `raw-data-policy-review.md` — the exact human inputs needed to approve D-10, D-19, and real-data lifecycle values.
- `provider-budget-review.md` — the exact human inputs needed to approve D-04/D-05 and any paid-provider profile.
- `d-17-hosting-options-discussion.html` — a bilingual discussion brief comparing n8n and external queue/worker-host candidates; it does not approve D-17.
- `agent-operability-audit.md` — current proof and remaining gaps against the agent-first repository goal.
- Controlled CSV/YAML inputs copied from `docs/templates/`; their owning task replaces placeholders with reviewed values.

Approved product or architecture direction belongs in the master plan and linked decision/ADR. Approved policies belong under `docs/policies/`. Gate proof belongs under `evidence/`.

Use lowercase kebab-case. Task records use `wpNN-tyy-short-outcome.md`; temporary names such as `notes.md`, `misc.md`, and `final-v2.md` are invalid.
