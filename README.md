# UniMind PoC

This repository contains the source-of-truth plan, executable delivery runbook, and strict TypeScript application foundation for the UniMind proof of concept.

## Contents

- [PoC master plan](docs/plans/poc-master-plan.md) — source-of-truth product, scope, and architecture plan.
- [Execution runbook](docs/runbooks/poc-execution-runbook.md) — tutorial-style implementation checklist, verification gates, rollback guidance, and delivery sequence.
- [Agent instructions](AGENTS.md) — always-on repository rules for Codex and compatible coding agents.
- [Agent workflow](docs/agents/agent-workflow.md) — deterministic path for selecting, executing, verifying, and handing off work.
- [Contributing and operation tutorial](CONTRIBUTING.md) — workstation setup, daily commands, migrations, verification, troubleshooting, and handoff for humans and agents.
- [Domain context](CONTEXT.md) — shared UniMind vocabulary and relationships for discussion, code, tests, and decisions.
- [Product context](PRODUCT.md) — compact confirmed product truth for implementation and UI workflows.
- [Module boundaries](docs/agents/module-boundaries.md) — file naming, dependency directions, ownership, and the automated architecture check.
- [Repository skills](.agents/skills/README.md) — audited, pinned workflows available to Codex in this repository.
- [Skills guide](docs/agents/skills-guide.md) — which skills run automatically, which to call, and copy-ready examples.
- [UI design stack](docs/agents/ui-design-stack.md) — why Impeccable was selected, how DESIGN.md and the Vercel review fit, and the UI workflow.
- [Communication profiles](docs/agents/communication-profiles.md) — chat-language and intent-support routing for Ahmed and Ziad; core execution remains shared.
- [Planning workspace](planning/README.md) — durable in-progress task records, decision status, and controlled planning inputs.
- [Evaluation assets](evals/README.md) — versioned synthetic datasets, manifests, schemas, and safe reports.
- [Egyptian-Arabic plan](docs/plans/poc-master-plan-ar-eg.html) — rendered Arabic companion for easier project communication.
- [Documentation index](docs/README.md) — map of plans, runbooks, and reusable templates.
- [Evidence index](evidence/README.md) — rules for sanitized gate evidence organized by work package.

## Repository structure

```text
.
├── docs/
│   ├── plans/        # Authoritative scope and architecture plans.
│   ├── agents/       # Agent workflow and scoped guidance.
│   ├── runbooks/     # Executable delivery and operational procedures.
│   └── templates/    # Copy-ready controlled project artifacts.
├── planning/         # In-progress task records, decision register, and planning inputs.
├── evals/            # Versioned evaluation schemas, fixtures, manifests, and reports.
├── evidence/         # Sanitized gate reports and restricted-evidence links.
├── scripts/          # Zero-cost repository checks and local automation.
├── src/              # Next.js routes plus domain/application/adapter modules.
├── workers/          # Durable worker composition roots.
├── supabase/         # Versioned hosted Supabase configuration and migrations.
├── tests/            # Unit, integration, security, E2E, load, and synthetic fixtures.
├── package.json      # Exact toolchain, commands, and dependency contract.
├── CONTRIBUTING.md   # Human/agent setup, operation, troubleshooting, and handoff.
├── .gitignore
└── README.md
```

## Status

The project has a reviewed mock-only WP00 constraints gate. Open real-world decisions retain exact downstream blocks, while the synthetic/mock WP01 foundation may proceed through the runbook's WP00 mock bridge. Follow later packages in dependency order; a package is complete only after its independent gate review passes.

For agent-led work, use the [agent workflow](docs/agents/agent-workflow.md). When a request does not name a task, it provides the rule for choosing the next executable task without guessing.

## Agent commands

```powershell
# Show current blockers and the next executable task.
pwsh -NoProfile -File scripts/show-work-state.ps1

# Verify agent entry points, links, names, decisions, task records, and selection output.
pwsh -NoProfile -File scripts/verify-agent-readiness.ps1

# Rehearse discovery, selection, and handoff from an isolated committed snapshot.
pwsh -NoProfile -File scripts/test-agent-handoff.ps1

# Run the zero-cost application, architecture, test, and production-build gate.
corepack pnpm verify

# Run only the UI/application/domain/adapter/server dependency check.
corepack pnpm check:boundaries
```

## Notes

This repository is intended to be used as the canonical project home for collaboration, versioning, and publication to GitHub.
