# UniMind PoC

This repository holds the plan, the executable delivery runbook, and the strict TypeScript application for the UniMind proof of concept. This README is a map; each linked document owns its own subject.

## Where things live

Product and scope:

- [PoC master plan](docs/plans/poc-master-plan.md) — product, scope, architecture, safety, operating policy, and the decision log (section 15, the only owner of decision status).
- [Egyptian-Arabic plan](docs/plans/poc-master-plan-ar-eg.html) — rendered Arabic companion; the English master plan remains authoritative.
- [Execution runbook](docs/runbooks/poc-execution-runbook.md) — dependency-ordered tasks, acceptance, verification gates, and rollback. Its checkboxes are the only task status.
- [Domain context](CONTEXT.md) — shared UniMind vocabulary for discussion, code, tests, and decisions.
- [Product context](PRODUCT.md) — compact product summary for implementation and UI tools.
- [Design contract](DESIGN.md) — current visual and interaction rules.

Working with the repository:

- [Contributing](CONTRIBUTING.md) — workstation setup, the command reference, and troubleshooting.
- [Agent rules](AGENTS.md) — shared always-on rules for coding agents (Codex, Claude Code); [`CLAUDE.md`](CLAUDE.md) imports them for Claude Code.
- [Agent workflow](docs/agents/workflow.md) — the one task lifecycle from status check to delivery.
- [Frontend guidance](docs/agents/frontend.md) — frontend quality floor and UI design workflow.
- [Communication](docs/agents/communication.md) — speaker selection and chat preferences for Ahmed and Ziad.
- [Module boundaries](docs/agents/module-boundaries.md) — file naming, dependency directions, and the automated architecture check.
- [Repository skills](.agents/skills/README.md) — shared skill index; `pnpm skills:sync` generates the Claude Code copies.

Records:

- [Planning workspace](planning/README.md) — task records, the decision register, and controlled planning inputs.
- [Documentation index](docs/README.md) — map of plans, runbooks, agent guidance, decisions, and templates.
- [Evidence index](evidence/README.md) — rules for sanitized gate evidence organized by work package.
- [Evaluation assets](evals/README.md) — versioned synthetic datasets, manifests, schemas, and safe reports.

## Repository structure

```text
.
├── docs/
│   ├── plans/        # Authoritative scope and architecture plans.
│   ├── agents/       # Agent workflow and scoped guidance.
│   ├── decisions/    # One file per reviewed decision.
│   ├── runbooks/     # Executable delivery and operational procedures.
│   └── templates/    # Copy-ready controlled project artifacts.
├── .agents/skills/   # Shared repository skills (Claude Code copies in .claude/skills/).
├── planning/         # Task records, decision register, and planning inputs.
├── evals/            # Versioned evaluation schemas, fixtures, manifests, and reports.
├── evidence/         # Sanitized gate reports and restricted-evidence links.
├── scripts/          # Zero-cost repository checks and local automation.
├── src/              # Next.js routes plus domain/application/adapter modules.
├── workers/          # Durable worker composition roots.
├── supabase/         # Versioned Supabase configuration and migrations.
├── tests/            # Unit, integration, security, E2E, load, and synthetic fixtures.
├── package.json      # Exact toolchain, commands, and dependency contract.
├── AGENTS.md         # Shared coding-agent rules.
├── CLAUDE.md         # Claude Code entry point; imports AGENTS.md.
├── CONTRIBUTING.md   # Setup, commands, and troubleshooting.
└── README.md
```

## Quick start

Requires Git, PowerShell 7, Node 24.19.0, and Corepack. Full setup is in [CONTRIBUTING.md](CONTRIBUTING.md).

```powershell
corepack pnpm install --frozen-lockfile
Copy-Item -LiteralPath .env.example -Destination .env.local   # synthetic mock values only
corepack pnpm dev            # mock-only development server on 127.0.0.1:3000
corepack pnpm agent:status   # current task and blockers
corepack pnpm check          # fast checks while editing
corepack pnpm verify         # full credential-free suite (same as CI)
```

For current progress, read the [execution runbook](docs/runbooks/poc-execution-runbook.md) or run `corepack pnpm agent:status`.

## Synthetic frontend review

Run `corepack pnpm demo`, then open `http://127.0.0.1:3101/login?lang=en`. This isolated development runtime uses the normal product routes, forms, and shared components with synthetic services, and covers student, Batch Leader, and admin journeys in English and Arabic. It grants no real access and makes no Auth, upload, email, provider, or protected mutation calls; query parameters cannot enable demo mode.

- [Synthetic test pack](public/demo-files/README.md) — invented credentials, links, prompts, files, and prepared failure cases.
- [Screen-by-screen review guide](docs/reviews/wp03-synthetic-frontend-review.md) — expected outcomes, failure states, and isolation checks.
- [Premium screen guide](planning/design/premium-product/README.md) — design checkpoints, role previews, and production evidence.
