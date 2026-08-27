# Contributing to UniMind

This is the operating tutorial for both human contributors and coding agents. Use repository state—not chat history—as the handoff authority.

> **Architecture transition (2026-08-27):** Revised D-21 replaces persistent hosted development/CI with mock-only workstation development and a disposable full Supabase stack on standard GitHub-hosted CI. The candidate workflow is implemented but WP01-T08 remains open until a real GitHub run passes. The two existing Supabase Free projects are reserved for separate Preview and locked Beta only afterward; do not repurpose either project yet.

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
- Network access for package installation and repository operations. The database/Auth gate runs on a standard GitHub-hosted CI runner, not the workstation.

Check the machine without changing it:

```powershell
git --version
pwsh --version
corepack pnpm --version
corepack pnpm supabase --version
```

Expected repository versions are also recorded in `.nvmrc`, `package.json`, and `pnpm-lock.yaml`. Do not install Docker, WSL2, or a local database runtime for UniMind. Workstation work stays mock-only. Until the external WP01-T08 run passes, do not retire the transitional hosted gate or repurpose either project.

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
6. Do not obtain or use a persistent development/CI database profile for ordinary workstation work. Existing `.local/supabase/development.env` and `.local/supabase/ci.env` files are transitional credentials and must not be copied to another workstation or relabeled as Preview/Beta.
7. Run `corepack pnpm verify`. Database/Auth changes wait for the WP01-T08 disposable-CI workflow and its reviewed external run; do not reproduce that infrastructure on a founder computer.

Do not send credential values, profile files, or `.env.local` through a pull request, issue, evidence report, terminal transcript, or chat. Preview/Beta access is not a workstation-development prerequisite.

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

The normal workstation loop is mock-only:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Keep the Next.js development server on the workstation and do not expose it to an external network. Database/Auth verification runs in disposable GitHub-hosted CI. Preview is only for approved synthetic smoke/promotion checks and Beta is never a development target.

## 6. End-of-session loop

Stop any development server, then run:

```powershell
corepack pnpm verify
git diff --check
git diff --stat
git status --short
```

Before handoff, inspect the full diff, scan changed files for credentials/private data, update the task record, and link sanitized evidence to the candidate commit.

## 7. Command reference

Duration classes are workstation estimates: **instant** is normally under 10 seconds, **short** under one minute, **medium** one to five minutes, and **long** more than five minutes. CI and a cold install may be slower.

| Command                              | Purpose                                                                     | Paid/external calls                                                     | Required services                                                         | Duration        |
| ------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------- |
| `scripts/show-work-state.ps1`        | Select the next executable task and list blockers                           | None                                                                    | None                                                                      | Instant         |
| `scripts/verify-agent-readiness.ps1` | Check entry points, links, names, decisions, and task records               | None                                                                    | None                                                                      | Instant         |
| `scripts/test-agent-handoff.ps1`     | Rehearse discovery from an isolated committed snapshot                      | None                                                                    | Git                                                                       | Short           |
| `pnpm install --frozen-lockfile`     | Reproduce the exact dependency graph                                        | Package-registry download only when cache is cold; never paid providers | Network when cache is cold                                                | Medium          |
| `pnpm dev`                           | Run the workstation Next.js development server                              | Mocks only by default                                                   | Valid mock application environment                                        | Long-running    |
| `pnpm start`                         | Serve an already-created production build                                   | None                                                                    | Valid environment and `.next` build output                                | Long-running    |
| `pnpm build`                         | Build with the caller's validated environment                               | None                                                                    | Valid environment                                                         | Short           |
| `pnpm test:env-build`                | Build with committed synthetic CI placeholders                              | None                                                                    | None                                                                      | Short           |
| `pnpm lint`                          | Run fatal static checks                                                     | None                                                                    | None                                                                      | Short           |
| `pnpm typecheck`                     | Run strict TypeScript without emit                                          | None                                                                    | None                                                                      | Short           |
| `pnpm format:check`                  | Check formatting without rewriting                                          | None                                                                    | None                                                                      | Instant         |
| `pnpm format`                        | Rewrite supported files to repository format                                | None                                                                    | None                                                                      | Instant         |
| `pnpm check:boundaries`              | Enforce UI/application/domain/adapter/server import directions              | None                                                                    | None                                                                      | Instant         |
| `pnpm test:unit`                     | Run pure rules, configuration, and deterministic provider contracts         | None                                                                    | None                                                                      | Short           |
| `pnpm test:integration`              | Run credential-free application/mock integration tests; database Auth skips | None                                                                    | None                                                                      | Short           |
| `pnpm test:integration:database`     | Run synthetic Auth against the disposable runner-local stack                | Runner loopback only; no provider or persistent Supabase call           | Guarded GitHub-hosted Linux lifecycle                                     | Medium          |
| `pnpm test:integration:hosted`       | Transitional synthetic hosted Auth seam pending external WP01-T08 proof     | Legacy guarded target only; never Preview/Beta                          | Existing approved transitional profile; do not distribute                 | Medium          |
| `pnpm test:security`                 | Run foundation identity/availability denial matrices                        | None; hosted RLS suites are added with their migrations                 | None                                                                      | Short           |
| `pnpm test:e2e`                      | Run the local synthetic browser journey in pinned Chromium                  | Local app only; external browser requests blocked; providers mocked     | Installed Playwright Chromium                                             | Medium          |
| `pnpm test:eval`                     | Validate versioned synthetic JSONL and emit JSON/Markdown reports           | None; a future live suite must say `live-approved`                      | Versioned foundation fixture                                              | Short           |
| `pnpm test:load`                     | Validate the load profile and emit a `NOT_EXECUTED` dry-run report          | None; preview/beta/production and real providers are rejected           | Versioned synthetic YAML profile                                          | Short           |
| `pnpm smoke:deployment`              | Check health, write denial, app identity, and synthetic/mock-only mode      | GET/POST requests only to the explicitly supplied local or Preview URL  | `--base-url` and `--target local\|preview`; Preview requires remote HTTPS | Instant         |
| `pnpm db:ci:start`                   | Start migrations/seed on a disposable runner-local Supabase stack           | Runner-local containers only                                            | Guarded GitHub-hosted Linux lifecycle                                     | Long            |
| `pnpm db:ci:reset`                   | Destroy/rebuild the disposable database from migrations and synthetic seed  | Runner-local containers only; never Preview/Beta                        | Started disposable stack                                                  | Medium          |
| `pnpm db:ci:migrations`              | Compare local migration files with disposable database history              | Runner-local containers only                                            | Started disposable stack                                                  | Short           |
| `pnpm db:ci:types`                   | Generate committed database types from the disposable stack                 | Runner-local containers only                                            | Started disposable stack                                                  | Short           |
| `pnpm db:ci:stop`                    | Remove the disposable stack and data volumes                                | Runner-local containers only                                            | Guarded GitHub-hosted Linux lifecycle                                     | Short           |
| `pnpm db:reset`                      | Transitional hosted reset retained only until external WP01-T08 proof       | Never Preview/Beta; no paid provider                                    | Existing guarded legacy profile                                           | Short to medium |
| `pnpm db:migrations`                 | Transitional hosted migration comparison                                    | Never Preview/Beta in destructive test mode                             | Existing guarded legacy profile                                           | Short           |
| `pnpm db:push:dry-run`               | Preview unapplied migrations without applying them                          | Only an explicitly approved guarded environment                         | Current guarded legacy profile until promotion commands are revised       | Short           |
| `pnpm db:types`                      | Transitional hosted type generation pending external WP01-T08 proof         | Never Beta; no paid provider                                            | Existing guarded legacy profile                                           | Short           |
| `pnpm db:metadata`                   | Read sanitized PostgreSQL/extension/fixture/isolation metadata              | Transitional hosted target or future approved scope only                | Selected ignored profile or scoped CI state                               | Short           |
| `pnpm db:types:check`                | Reject a stale committed generated-type file                                | None                                                                    | Types generated first                                                     | Instant         |
| `pnpm verify`                        | Run the complete credential-free, zero-paid merge gate                      | None                                                                    | Installed Playwright Chromium                                             | Medium          |

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

Create migrations with the pinned CLI, but use the disposable database/Auth CI workflow for destructive reset, migration replay, seed, Auth/security tests, and type generation after WP01-T08 implements it:

```powershell
corepack pnpm supabase migration new descriptive_outcome
corepack pnpm verify
```

The external CI run must prove two clean disposable resets and stable generated types before review. Until the revised workflow lands, follow `planning/tasks/wp01-t08-create-ci.md` and do not claim the database gate from workstation mocks or repurpose either persistent project.

Edit only the CLI-created migration filename. Never invent a migration timestamp, reset Preview/Beta, repair a shared database in a dashboard, rewrite applied history, or add real seed data. Preview/Beta receive reviewed forward migrations only. RLS, grants, rights, deletion, release, and usage migrations require the documented protected-gate confirmations from both founders.

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

### Disposable Supabase CI is unavailable

Confirm the workflow uses `ubuntu-24.04`, the repository-pinned Supabase CLI, the expected container runtime, and no Preview/Beta credentials. Follow `planning/tasks/wp01-t08-create-ci.md`. Do not switch to a founder-hosted runner, fake the runner guard, bypass cleanup, or use a persistent Preview/Beta project as a destructive test target. Existing hosted development/CI commands remain transitional until the external WP01-T08 run passes.

### A port is occupied

Use the failing command's port and inspect it without killing anything:

```powershell
$portNumber = 54321
Get-NetTCPConnection -LocalPort $portNumber -ErrorAction SilentlyContinue
```

Identify the owning process before changing configuration. Do not terminate an unknown process automatically. This applies to workstation Next.js/browser tooling only; the disposable Supabase stack runs in GitHub-hosted CI.

### Generated database types are stale

Run the WP01-T08 disposable CI type-generation path and inspect its reported diff. If the diff is expected, include it with the migration. If no migration explains it, stop and diagnose drift. Never regenerate from Beta or use a destructive Preview reset.

### Migration state differs from version control

Reproduce the mismatch from an empty disposable CI stack, then fix the first versioned migration failure. Never patch a hosted dashboard as the repair. For a migration already applied to Preview/Beta, add a forward repair migration.

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
