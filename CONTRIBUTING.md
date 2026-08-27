# Contributing to UniMind

This is the operating tutorial for both human contributors and coding agents. Use repository state—not chat history—as the handoff authority.

## 1. Read and select before editing

From the repository root:

```powershell
git status --short --branch
pwsh -NoProfile -File scripts/show-work-state.ps1
```

Then read, in order:

1. `AGENTS.md` for non-negotiable repository rules.
2. `README.md` for the repository map.
3. `docs/agents/agent-workflow.md` for selection, execution, verification, and handoff.
4. The selected task in `docs/runbooks/poc-execution-runbook.md`.
5. Its record in `planning/tasks/`, or create one from `docs/templates/task-record.md` before editing.
6. Only the relevant master-plan, domain, decision, policy, or design section triggered by the task.

Never cross a dependency because a later task looks easier. When a human or machine prerequisite blocks a task, record the blocker and its downstream effects, then rerun the selector.

## 2. Workstation setup

Required tools:

- Git.
- PowerShell 7 (`pwsh`).
- Corepack. The repository pins Node 24.19.0 and pnpm 10.34.5; invoke pnpm through Corepack so a global pnpm cannot override the contract.
- Network access for package installation and, after WP01-T04 is authorized, the approved hosted synthetic Supabase development/CI target.

Check the machine without changing it:

```powershell
git --version
pwsh --version
corepack pnpm --version
corepack pnpm supabase --version
```

Expected repository versions are also recorded in `.nvmrc`, `package.json`, and `pnpm-lock.yaml`. Do not install Docker, WSL2, or a local database runtime for UniMind. If approved hosted development/CI resources or scoped credentials are unavailable, do not start database/Auth/integration work; run the work-state command and follow the recorded WP01-T04 prerequisite.

## 3. Clone and install

```powershell
git clone https://github.com/unimind989-sys/UniMind-Project.git
Set-Location UniMind-Project
corepack pnpm install --frozen-lockfile
pwsh -NoProfile -File scripts/verify-agent-readiness.ps1
```

Do not replace the committed lockfile, relax engine checks, or use an unpinned global package manager to “fix” installation. If installation fails, first compare `corepack pnpm --version` with `package.json#packageManager`.

### Ziad workstation parity checklist

Ahmed and Ziad intentionally use the approved shared GitHub/Supabase/Google service identity; Ahmed may also contribute through his separate GitHub contributor account. Git or provider account identity does not establish which founder is acting, so the task record must name the explicitly identified chat speaker and human checkpoint. To match the project runtime and Ahmed's approved development setup:

1. Install Git, PowerShell 7, and exactly Node 24.19.0. Do not install Docker, WSL2, Supabase locally, or a global pnpm for this repository.
2. Use the approved shared GitHub identity, clone `https://github.com/unimind989-sys/UniMind-Project.git`, and work from an up-to-date `main` before creating a task branch. Ahmed's personal contributor identity is also approved. Treat Git authorship as service-account metadata, not proof of which founder supplied a decision.
3. Run `corepack enable`, confirm `node --version` is `v24.19.0`, and confirm `corepack pnpm --version` is `10.34.5`.
4. Run `corepack pnpm install --frozen-lockfile` and `corepack pnpm exec playwright install chromium`. The Supabase CLI is already pinned as a project dependency; do not install another copy.
5. Create the ignored `.env.local` from `.env.example`. Keep mock mode enabled, every real-provider flag false, and the provider budget at zero. Transfer any real local values through the approved private channel, never Git or chat.
6. Obtain the ignored `.local/supabase/development.env` profile through the approved private channel. It must define `UNIMIND_DB_ENVIRONMENT`, `UNIMIND_SUPABASE_PROJECT_REF`, `UNIMIND_DB_RESET_CONFIRMATION`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Do not copy or use the protected CI profile on a workstation.
7. Confirm `git status --short` shows neither local environment file, then run `corepack pnpm db:metadata --environment development` and verify the sanitized development fingerprint matches the approved evidence. Stop if it differs.
8. After explicit approval for the destructive development reset, run `corepack pnpm db:push:dry-run --environment development`, `corepack pnpm db:reset --environment development`, `corepack pnpm db:migrations --environment development`, `corepack pnpm db:types --environment development`, and `corepack pnpm db:types:check`. The reset applies the committed migrations and synthetic seed; no separate seed command or manual dashboard edit is needed.
9. Run `corepack pnpm test:integration:hosted` and `corepack pnpm verify`. Both must pass before Ziad begins a work-package task.

Do not send credential values, profile files, or `.env.local` through a pull request, issue, evidence report, terminal transcript, or chat. If Ziad does not have the approved development credentials, database/Auth work remains blocked while the credential-free mock gate may still run.

## 4. Configure local environment safely

Confirm the local file is ignored before creating or editing it:

```powershell
git check-ignore --no-index --verbose .env.local
if (-not (Test-Path -LiteralPath .env.local)) {
  Copy-Item -LiteralPath .env.example -Destination .env.local
}
git status --short
```

Rules:

- `.env.example` contains only blank or clearly synthetic examples and is committed.
- `.env.local` is ignored and is the only normal local destination for credentials.
- Only the four documented `NEXT_PUBLIC_` values are browser-safe. Never add a public secret-shaped variable.
- Keep `PROVIDER_MODE=mock`, every provider flag false, and the approved provider budget zero unless all documented live gates have approved evidence.
- Do not paste environment values into chat, logs, issues, evidence, or command-line arguments.
- Standalone scripts do not automatically load `.env.local`; use a repository-provided wrapper instead of inventing a secret-bearing shell command.

The application fails with variable names—not values—when configuration is missing or malformed. Compare names with `.env.example`; never print the suspect value while debugging.

## 5. Current safe loop

The zero-cost application gate works without infrastructure or provider credentials:

```powershell
corepack pnpm verify
```

`verify` formats nothing, makes no paid/provider call, runs the complete unit and architecture checks, and builds with synthetic CI configuration.

The database-backed daily loop below becomes executable only after `scripts/show-work-state.ps1` reports WP01-T04 complete and `.local/supabase/development.env` contains the approved hosted-development profile. The profile is ignored by Git; never print its values:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm db:reset --environment development
corepack pnpm db:metadata --environment development
corepack pnpm dev
```

`SUPABASE_ACCESS_TOKEN` and `SUPABASE_DB_PASSWORD` must come from the approved ignored profile or CI secret store; do not put them in the command, documentation, evidence, or Git. Use `.local/supabase/ci.env` only with `--environment ci`. Keep the Next.js development server on the workstation and do not expose it to an external network.

## 6. End-of-session loop

Stop any development server, then run:

```powershell
corepack pnpm verify
git diff --check
git diff --stat
git status --short
```

Close or clear the terminal session that held hosted Supabase credentials. Before handoff, inspect the full diff, scan changed files for credentials/private data, update the task record, and link sanitized evidence to the candidate commit.

## 7. Command reference

Duration classes are workstation estimates: **instant** is normally under 10 seconds, **short** under one minute, **medium** one to five minutes, and **long** more than five minutes. CI and a cold install may be slower.

| Command                              | Purpose                                                                   | Paid/external calls                                                     | Required services                                                                       | Duration        |
| ------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------- |
| `scripts/show-work-state.ps1`        | Select the next executable task and list blockers                         | None                                                                    | None                                                                                    | Instant         |
| `scripts/verify-agent-readiness.ps1` | Check entry points, links, names, decisions, and task records             | None                                                                    | None                                                                                    | Instant         |
| `scripts/test-agent-handoff.ps1`     | Rehearse discovery from an isolated committed snapshot                    | None                                                                    | Git                                                                                     | Short           |
| `pnpm install --frozen-lockfile`     | Reproduce the exact dependency graph                                      | Package-registry download only when cache is cold; never paid providers | Network when cache is cold                                                              | Medium          |
| `pnpm dev`                           | Run the workstation Next.js development server                            | Mocks only by default                                                   | Valid application environment; database flows need approved hosted development Supabase | Long-running    |
| `pnpm start`                         | Serve an already-created production build                                 | None                                                                    | Valid environment and `.next` build output                                              | Long-running    |
| `pnpm build`                         | Build with the caller's validated environment                             | None                                                                    | Valid environment                                                                       | Short           |
| `pnpm test:env-build`                | Build with committed synthetic CI placeholders                            | None                                                                    | None                                                                                    | Short           |
| `pnpm lint`                          | Run fatal static checks                                                   | None                                                                    | None                                                                                    | Short           |
| `pnpm typecheck`                     | Run strict TypeScript without emit                                        | None                                                                    | None                                                                                    | Short           |
| `pnpm format:check`                  | Check formatting without rewriting                                        | None                                                                    | None                                                                                    | Instant         |
| `pnpm format`                        | Rewrite supported files to repository format                              | None                                                                    | None                                                                                    | Instant         |
| `pnpm check:boundaries`              | Enforce UI/application/domain/adapter/server import directions            | None                                                                    | None                                                                                    | Instant         |
| `pnpm test:unit`                     | Run pure rules, configuration, and deterministic provider contracts       | None                                                                    | None                                                                                    | Short           |
| `pnpm test:integration`              | Run credential-free application/mock integration tests; hosted Auth skips | None                                                                    | None                                                                                    | Short           |
| `pnpm test:integration:hosted`       | Run the reviewed synthetic hosted Auth seam                               | Guarded hosted development Supabase only; no paid AI provider           | Approved development profile and network                                                | Medium          |
| `pnpm test:security`                 | Run foundation identity/availability denial matrices                      | None; hosted RLS suites are added with their migrations                 | None                                                                                    | Short           |
| `pnpm test:e2e`                      | Run the local synthetic browser journey in pinned Chromium                | Local app only; external browser requests blocked; providers mocked     | Installed Playwright Chromium                                                           | Medium          |
| `pnpm test:eval`                     | Validate versioned synthetic JSONL and emit JSON/Markdown reports         | None; a future live suite must say `live-approved`                      | Versioned foundation fixture                                                            | Short           |
| `pnpm test:load`                     | Validate the load profile and emit a `NOT_EXECUTED` dry-run report        | None; preview/beta/production and real providers are rejected           | Versioned synthetic YAML profile                                                        | Short           |
| `pnpm smoke:deployment`              | Check health, write denial, app identity, and synthetic/mock-only mode    | GET/POST requests only to the explicitly supplied local or Preview URL  | `--base-url` and `--target local\|preview`; Preview requires remote HTTPS               | Instant         |
| `pnpm db:reset`                      | Recreate an explicitly confirmed development/CI schema and synthetic seed | Approved hosted synthetic Supabase only; no paid AI provider            | Target variables, exact reset confirmation, scoped CLI credentials                      | Short to medium |
| `pnpm db:migrations`                 | Compare repository and selected hosted migration history                  | Approved hosted synthetic Supabase only                                 | Target variables and scoped CLI credentials                                             | Short           |
| `pnpm db:push:dry-run`               | Preview unapplied migrations without applying them                        | Approved hosted synthetic Supabase only                                 | Target variables and scoped CLI credentials                                             | Short           |
| `pnpm db:types`                      | Generate TypeScript from the selected hosted public schema                | Approved hosted synthetic Supabase only                                 | Target variables and scoped access token                                                | Short           |
| `pnpm db:metadata`                   | Read sanitized PostgreSQL/extension/fixture/isolation metadata            | Approved hosted synthetic Supabase Management API only                  | Selected ignored profile or scoped CI secrets                                           | Short           |
| `pnpm db:types:check`                | Reject a stale committed generated-type file                              | None                                                                    | Types generated first                                                                   | Instant         |
| `pnpm verify`                        | Run the complete credential-free, zero-paid merge gate                    | None                                                                    | Installed Playwright Chromium                                                           | Medium          |

In shell examples, invoke package commands as `corepack pnpm ...`. The shorter `pnpm ...` spelling in tables and the execution runbook refers to the same pinned project command.

Run the deployment smoke only against an explicitly approved target. It rejects credentials, query strings, paths, non-loopback local targets, and non-HTTPS Preview targets:

```powershell
corepack pnpm smoke:deployment -- --base-url https://approved-preview.example --target preview
```

## 8. Make a reviewable change

1. Preserve unrelated changes shown by `git status`.
2. Select exactly one task and fill its task record.
3. When a delivery branch is requested, use `wpNN/short-outcome`, for example:

```powershell
git switch -c wp01/provider-mocks
```

4. Implement the smallest observable end-to-end result. Keep business rules out of React, route handlers, provider SDKs, and workflow tools.
5. Run the narrowest focused check after each meaningful change.
6. Run the end-of-session loop and inspect the full diff.
7. Commit the coherent candidate with an outcome-oriented message.
8. Create sanitized evidence named `YYYY-MM-DD_<gate>_<environment>_<short-sha>.md` in the correct `evidence/wpNN-*` directory.
9. Obtain the required human checkpoint. Ahmed or Ziad may request, authorize, operate, and review the same ordinary agent-executed task. RLS, grants, rights, raw deletion, budgets/kill switches, release/unlock, and beta go-live keep their two-person rule and require separate named confirmations from both founders.

Do not push, open a pull request, merge, deploy, unlock, or enable a live provider unless the user explicitly authorizes that external action.

## 9. Database migration workflow

Use this only after WP01-T04 passes and the approved hosted development target is selected in the current terminal:

```powershell
corepack pnpm supabase migration new descriptive_outcome
corepack pnpm db:push:dry-run --environment development
corepack pnpm db:reset --environment development
corepack pnpm db:reset --environment development
corepack pnpm db:migrations --environment development
corepack pnpm db:types --environment development
corepack pnpm db:metadata --environment development
corepack pnpm db:types:check
```

Edit only the CLI-created migration filename. Never invent a migration timestamp, repair a shared database in a dashboard, rewrite applied history, or add real seed data. RLS, grants, rights, deletion, release, and usage migrations require the documented protected-gate confirmations from both founders.

## 10. Pull request handoff

A review request must contain:

- Task ID and observable outcome.
- Candidate commit and branch.
- Exact changed files and why they changed.
- Exact commands, exit codes, and relevant test counts.
- Evidence path and any opaque restricted-evidence link.
- Failures encountered and how they were resolved.
- Anything not run and the exact blocker.
- Rollback/disable action.
- One next safe action and the reviewer action still required.

The committed task record is authoritative. A screenshot, chat summary, or green build without the required database/security/evidence gate is not completion proof.

## 11. Troubleshooting

### Wrong Node or pnpm

Run `corepack pnpm --version` and compare it with `package.json#packageManager`. Use `corepack pnpm`, not a global `pnpm`. Do not regenerate the lockfile merely because a different package manager rejects it.

### Hosted Supabase target is unavailable or rejected

Confirm `UNIMIND_DB_ENVIRONMENT` is exactly `development` or `ci`, the safe project reference matches the approved environment matrix, the network is available, and the scoped CLI credentials exist without printing them. Follow `planning/tasks/wp01-t04-provision-hosted-supabase.md`. Never bypass the guard, relabel preview/beta, or install a local database runtime as a workaround.

### A port is occupied

Use the failing command's port and inspect it without killing anything:

```powershell
$portNumber = 54321
Get-NetTCPConnection -LocalPort $portNumber -ErrorAction SilentlyContinue
```

Identify the owning process before changing configuration. Do not terminate an unknown process automatically. This applies to the workstation Next.js/browser tooling only; Supabase infrastructure is hosted.

### Generated database types are stale

Reset the approved isolated hosted target, regenerate types, and inspect the diff:

```powershell
corepack pnpm db:reset --environment development
corepack pnpm db:types --environment development
git diff -- src/types/database.generated.ts
```

If the diff is expected, include it with the migration. If no migration explains it, stop and diagnose drift.

### Migration state differs from version control

```powershell
corepack pnpm db:migrations --environment development
corepack pnpm db:reset --environment development
```

Fix the first versioned migration failure. Never patch a hosted dashboard as the repair. For an already-shared migration, add a forward repair migration.

### Environment validation fails

Use the variable names in the error to compare `.env.local` with `.env.example`. Do not print, echo, log, or paste values. Confirm unknown `NEXT_PUBLIC_` names are removed and mock mode remains enabled.

### A workstation or CI token/credential leaked

1. Stop the command or release action that exposed it.
2. Revoke or rotate the value at its authoritative source; deleting the local text is not sufficient.
3. Replace it only in the ignored `.env.local`, `.local/supabase/<environment>.env`, or approved external secret store.
4. Search the candidate diff, logs, evidence, and Git history for the value without printing it.
5. If it entered a commit or external system, record a security incident and obtain security-owner review before continuing.

### A provider call appears during ordinary verification

Stop immediately. `pnpm verify` must be mock-only and zero-cost. Keep real flags false and budgets zero, preserve sanitized diagnostics, and treat any attempted network call as a release blocker.

## 12. Final self-check

Before handing off, answer yes from repository evidence:

- Is the task selected and dependency-valid?
- Are all fixtures synthetic and all secrets absent?
- Did the focused checks and every currently applicable full gate pass?
- Are unrun checks and blockers explicit?
- Did you inspect `git diff --check`, `git diff --stat`, the full diff, and `git status --short`?
- Is the task record enough for a fresh agent to continue without this conversation?
- Is the next action safe, exact, and owned?

If any answer depends on personal memory, convert it into code, configuration, this tutorial, a runbook, or reviewed evidence before claiming completion.
