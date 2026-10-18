# Contributing to UniMind

This guide covers workstation setup, the command reference, and troubleshooting for human contributors and coding agents (Codex, Claude Code). How work is picked, planned, built, verified, reviewed, and delivered is defined only in [`AGENTS.md`](AGENTS.md) and [`docs/agents/workflow.md`](docs/agents/workflow.md), including worktree/branch naming (`<agent>/<task-id>-<slug>`).

**Environment topology.** Workstations are mock-only. Database/Auth CI creates a disposable full Supabase stack on a standard GitHub-hosted runner. The two persistent Supabase Free projects are isolated as protected synthetic Preview and locked empty Beta. Historical development/CI profiles are retired and must not be recreated or used against Preview/Beta.

## 1. Workstation setup

Required tools:

- Git.
- PowerShell 7 (`pwsh`).
- Node 24.19.0 with Corepack. The repository pins pnpm 10.34.5; invoke pnpm through Corepack so a global pnpm cannot override the contract.
- Network access for package installation and repository operations.

Do not install Docker, WSL2, or a local database runtime for UniMind. A local Supabase stack needs Docker, so database/Auth proof runs only in the CI `database-ci` job on a GitHub-hosted runner.

Check the machine without changing it:

```powershell
git --version
pwsh --version
node --version
corepack pnpm --version
```

Expected versions are also recorded in `.nvmrc`, `package.json`, and `pnpm-lock.yaml`.

### Clone and install

```powershell
git clone https://github.com/unimind989-sys/UniMind-Project.git
Set-Location UniMind-Project
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm supabase --version
corepack pnpm exec playwright install chromium
```

Do not replace the committed lockfile, relax engine checks, or use an unpinned global package manager to “fix” installation. If installation fails, first compare `corepack pnpm --version` with `package.json#packageManager`.

### Founder workstation parity checklist

Ahmed and Ziad intentionally use the approved shared GitHub/Supabase/Google service identity; Ahmed may also contribute through his separate GitHub contributor account. Git or provider account identity does not establish which founder is acting, so the task record must name the explicitly identified chat speaker and human checkpoint.

1. Install Git, PowerShell 7, and exactly Node 24.19.0. Do not install Docker, WSL2, Supabase locally, or a global pnpm for this repository.
2. Clone `https://github.com/unimind989-sys/UniMind-Project.git` with the approved shared GitHub identity (Ahmed's personal contributor identity is also approved) and work from an up-to-date `main`. Treat Git authorship as service-account metadata, not proof of which founder supplied a decision.
3. Run `corepack enable`, confirm `node --version` is `v24.19.0`, and confirm `corepack pnpm --version` is `10.34.5`.
4. Run `corepack pnpm install --frozen-lockfile`, confirm `corepack pnpm supabase --version` is `2.115.0`, and run `corepack pnpm exec playwright install chromium`. The Supabase CLI is a project dependency and is unavailable before installation; do not install another copy.
5. Create the ignored `.env.local` from `.env.example` (section 2). The committed synthetic values are sufficient for the mock workstation app; do not replace them with Preview, Beta, or provider credentials.
6. Do not obtain or use a persistent development/CI database profile. The retired `.local/supabase/development.env` and `.local/supabase/ci.env` profiles must remain absent and must never be recreated or relabeled as Preview/Beta.
7. Run `corepack pnpm verify` to confirm the workstation. Database/Auth changes are proved by disposable CI after a branch is pushed; do not reproduce that infrastructure on a founder computer.

Do not send credential values, profile files, or `.env.local` through a pull request, issue, evidence report, terminal transcript, or chat. Preview/Beta access is not a workstation-development prerequisite.

## 2. Configure the local environment safely

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
- The copied template is a complete mock-workstation configuration. `/api/health/ready` must return `200` without any real credential.
- Only the four documented `NEXT_PUBLIC_` values are browser-safe. Never add a public secret-shaped variable.
- Keep `PROVIDER_MODE=mock`, every provider flag false, and the approved provider budget zero unless all documented live gates have approved evidence.
- Do not paste environment values into chat, logs, issues, evidence, or command-line arguments.
- Standalone scripts do not automatically load `.env.local`; use a repository-provided wrapper instead of inventing a secret-bearing shell command.

The application fails with variable names—not values—when configuration is missing or malformed. Compare names with `.env.example`; never print the suspect value while debugging.

## 3. Run the application locally

The workstation loop is mock-only:

```powershell
corepack pnpm dev
```

With the development server running, open a second terminal in the repository and prove the local application seam:

```powershell
corepack pnpm smoke:deployment -- --base-url http://127.0.0.1:3000 --target local
```

The smoke command must report six checks. It uses loopback GET/POST probes only and confirms liveness, readiness, write denial, application identity, and synthetic/mock-only mode.

Keep the Next.js development server on the workstation and do not expose it to an external network. Preview is only for approved synthetic smoke/promotion checks, and Beta is never a development target.

## 4. Verification and CI

`corepack pnpm check` is the fast loop while editing. `corepack pnpm verify` runs the full credential-free, zero-paid suite: the same components as the CI chain `verify:ci`, through `scripts/run-verify.ts`. It runs the static checks concurrently, then the production build (so a build failure shows early and the later `next dev` runs restore `next-env.d.ts`), then the Node, main browser and demo suites, stops at the first failure and prints a timing table with every unrun step. It never calls a bare `pnpm`, so it works when only corepack is on PATH. It formats nothing and makes no paid or provider call. Lint and format checks keep content-based caches in `node_modules/.cache`; delete that folder after a dependency upgrade. The demo suite uses about two workers on a 4-CPU machine by default (`PW_WORKERS` overrides it). Database tests do not run on the workstation; they run in CI.

A change to worker counts, shard layout, the shell's layout measurement or the demo proxy needs one demo run with `--repeat-each=2` (locally or on a branch) before merge. CI keeps `retries: 0`, because retries would hide exactly these timing races.

Pull-request CI selects jobs from the exact changed paths using [`docs/agents/ci-paths.yaml`](docs/agents/ci-paths.yaml) through the required `ci-selector` check. Unknown paths run every job, a selector failure runs the heavyweight jobs and blocks merge, and pushes to `main` keep the full application and database checks. When `main` moves between the pull-request event and the checkout, the selector runs every job on the newer merge commit instead of failing; a different head still fails closed.

## 5. Database and migration changes

Create migrations with the pinned CLI and edit only the CLI-created filename:

```powershell
corepack pnpm supabase migration new descriptive_outcome
```

Push the branch and let `.github/workflows/ci.yml` run in parallel: `static`, `node-tests`, sharded `e2e` and `e2e-demo` jobs (gated by the final `application` result check) and `database-ci`. `database-ci` starts a runner-local Supabase stack, upgrades the populated WP01 schema, resets twice, and checks migrations. After successful setup, pgTAP, advisors, generated types, type parity, database integration and real-mode browser contracts run as independent diagnostics. Required failures leave the job red; cleanup and report upload always run. Inspect any generated-type diff on the branch before review.

For early database feedback before opening a PR, push the branch and run `gh workflow run ci.yml --ref <branch> -f database_feedback=true`. This manual dispatch runs the same guarded `database-ci` job and skips the application jobs. It uses synthetic runner-local data and is advisory: resolve its findings before opening the PR, then require the normal exact-head PR checks. A manual dispatch without `database_feedback=true`, and every PR or push run, keeps the complete application and database jobs. Pull requests skip jobs only when every changed path is known to be safe (`docs/agents/ci-paths.yaml`).

The `db:ci:*` and `test:integration:database` commands fail closed outside the GitHub-hosted Linux lifecycle; a workstation run is not a substitute. Inspect the GitHub job result and its sanitized `database-ci-test-reports-*` artifact. The job must have no persistent database secret and no route to Preview or Beta.

Never invent a migration timestamp, reset Preview/Beta, repair a shared database in a dashboard, rewrite applied history, or add real seed data. Preview/Beta receive reviewed forward migrations only. Do not claim the database gate from workstation mocks.

## 6. Preview and locked Beta

Read `planning/environment-matrix.md` and `docs/runbooks/environment-promotion.md` before any hosted action. Preview is protected, synthetic-only, and mock-only. Beta is protected, Git-disconnected, empty, and unreleased. Neither target accepts destructive development/CI commands.

Run `smoke:deployment` against Preview only for a task-selected target and a verified zero-cost access window. It rejects credentials, query strings, paths, non-loopback local targets, and non-HTTPS Preview targets:

```powershell
corepack pnpm smoke:deployment -- --base-url https://approved-preview.example --target preview
```

Keep Beta locked; its evidence is a protected liveness/readiness and isolation check, not a public release. Use forward migrations only, preserve exact-commit promotion and recovery evidence, and stop if Vercel Hobby eligibility, target identity, or the zero-cost boundary is uncertain. Authorization for protected and real-money actions follows `AGENTS.md`.

## 7. Command reference

Invoke every package command as `corepack pnpm ...` (if pnpm is not on PATH this is required, and it always guarantees the pinned version). The shorter `pnpm ...` spelling in this table and the runbook means the same pinned project command.

Duration classes are workstation estimates: **instant** is normally under 10 seconds, **short** under one minute, **medium** one to five minutes, and **long** more than five minutes. CI and a cold install may be slower.

| Command                          | Purpose                                                                                                                | Paid/external calls                                                     | Required services                                                         | Duration     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------ |
| `pnpm agent:status`              | Show the current task, open work, and blockers                                                                         | None                                                                    | Git                                                                       | Instant      |
| `pnpm check`                     | Fast checks: format check, lint, typecheck, module boundaries, SQL conventions, secret scan, `lint:agents`, unit tests | None                                                                    | None                                                                      | Short        |
| `pnpm verify`                    | Full credential-free, zero-paid suite; the `verify:ci` components, static checks in parallel                           | None                                                                    | Installed Chromium                                                        | Medium       |
| `pnpm verify:ci`                 | The CI verification chain that `verify` runs                                                                           | None                                                                    | Installed Chromium                                                        | Medium       |
| `pnpm lint:agents`               | Check documentation links, task-record size, and skill frontmatter/parity                                              | None                                                                    | None                                                                      | Instant      |
| `pnpm skills:sync`               | Regenerate `.claude/skills/` from `.agents/skills/`                                                                    | None                                                                    | None                                                                      | Instant      |
| `pnpm install --frozen-lockfile` | Reproduce the exact dependency graph                                                                                   | Package-registry download only when cache is cold; never paid providers | Network when cache is cold                                                | Medium       |
| `pnpm dev`                       | Run the workstation Next.js development server                                                                         | Mocks only by default                                                   | Valid mock application environment                                        | Long-running |
| `pnpm demo`                      | Run the isolated synthetic frontend review runtime on port 3101                                                        | None; synthetic services only                                           | None                                                                      | Long-running |
| `pnpm start`                     | Serve an already-created production build                                                                              | None                                                                    | Valid environment and `.next` build output                                | Long-running |
| `pnpm build`                     | Build with the caller's validated environment                                                                          | None                                                                    | Valid environment                                                         | Short        |
| `pnpm test:env-build`            | Build with committed synthetic CI placeholders                                                                         | None                                                                    | None                                                                      | Short        |
| `pnpm lint`                      | Run fatal static checks                                                                                                | None                                                                    | None                                                                      | Short        |
| `pnpm typecheck`                 | Run strict TypeScript without emit                                                                                     | None                                                                    | None                                                                      | Short        |
| `pnpm typecheck:fresh`           | Typecheck without `.next` generated route/type state                                                                   | None                                                                    | None                                                                      | Short        |
| `pnpm format:check`              | Check formatting without rewriting                                                                                     | None                                                                    | None                                                                      | Instant      |
| `pnpm format`                    | Rewrite supported files to repository format                                                                           | None                                                                    | None                                                                      | Instant      |
| `pnpm check:boundaries`          | Enforce UI/application/domain/adapter/server import directions                                                         | None                                                                    | None                                                                      | Instant      |
| `pnpm check:sql`                 | Enforce mechanical naming, schema, identity, time, grant, and function SQL rules                                       | None                                                                    | Versioned migrations                                                      | Instant      |
| `pnpm verify:ci-workflow`        | Audit CI syntax, pins, permissions, lifecycle, and cleanup                                                             | None                                                                    | None                                                                      | Instant      |
| `pnpm scan:secrets`              | Scan tracked repository content for secret-like values                                                                 | None                                                                    | None                                                                      | Instant      |
| `pnpm test:node`                 | Run unit, integration, security, eval and load layers in one Vitest process plus the eval/load runners                 | None                                                                    |
| `pnpm test:unit`                 | Run pure rules, configuration, and deterministic provider contracts                                                    | None                                                                    | None                                                                      | Short        |
| `pnpm test:integration`          | Run credential-free application/mock integration tests; database Auth skips                                            | None                                                                    | None                                                                      | Short        |
| `pnpm test:security`             | Run foundation identity/availability denial matrices                                                                   | None                                                                    | None                                                                      | Short        |
| `pnpm test:e2e`                  | Run the local synthetic browser journey in pinned Chromium                                                             | Local app only; external browser requests blocked; providers mocked     | Installed Playwright Chromium                                             | Medium       |
| `pnpm test:e2e:demo`             | Run the synthetic review runtime's browser journeys                                                                    | Local app only                                                          | Installed Playwright Chromium                                             | Medium       |
| `pnpm browser:cli`               | Run the pinned Playwright CLI for explicitly requested tracing or test debugging                                       | Local app only unless a target is separately approved                   | Installed Playwright Chromium and a local app                             | Interactive  |
| `pnpm test:eval`                 | Validate versioned synthetic JSONL and emit JSON/Markdown reports                                                      | None; a future live suite must say `live-approved`                      | Versioned foundation fixture                                              | Short        |
| `pnpm test:load`                 | Validate the load profile and emit a `NOT_EXECUTED` dry-run report                                                     | None; preview/beta/production and real providers are rejected           | Versioned synthetic YAML profile                                          | Short        |
| `pnpm smoke:deployment`          | Check health, write denial, app identity, and synthetic/mock-only mode                                                 | GET/POST requests only to the explicitly supplied local or Preview URL  | `--base-url` and `--target local\|preview`; Preview requires remote HTTPS | Instant      |
| `pnpm test:integration:database` | Run synthetic Auth against the disposable runner-local stack                                                           | Runner loopback only; no provider or persistent Supabase call           | Guarded GitHub-hosted Linux lifecycle (`database-ci`)                     | Medium       |
| `pnpm test:e2e:database`         | Run browser journeys against the disposable runner-local stack                                                         | Runner loopback only                                                    | Guarded GitHub-hosted Linux lifecycle (`database-ci`)                     | Medium       |
| `pnpm db:ci:start`               | Start migrations/seed on a disposable runner-local Supabase stack                                                      | Runner-local containers only                                            | Guarded GitHub-hosted Linux lifecycle                                     | Long         |
| `pnpm db:ci:upgrade`             | Upgrade a populated WP01 fixture through pending migrations and verify retained rows                                   | Runner-local containers only; never Preview/Beta                        | Started disposable stack                                                  | Medium       |
| `pnpm db:ci:reset`               | Destroy/rebuild the disposable database from migrations and synthetic seed                                             | Runner-local containers only; never Preview/Beta                        | Started disposable stack                                                  | Medium       |
| `pnpm db:ci:migrations`          | Compare local migration files with disposable database history                                                         | Runner-local containers only                                            | Started disposable stack                                                  | Short        |
| `pnpm db:ci:test`                | Run every dependency-slice pgTAP contract against the disposable database                                              | Runner-local containers only                                            | Started, fully migrated disposable stack                                  | Medium       |
| `pnpm db:ci:advisors`            | Run the pinned database lint/advisor and fail on unresolved warnings                                                   | Runner-local containers only                                            | Started, fully migrated disposable stack                                  | Short        |
| `pnpm db:ci:types`               | Generate committed database types from the disposable stack                                                            | Runner-local containers only                                            | Started disposable stack                                                  | Short        |
| `pnpm db:ci:stop`                | Remove the disposable stack and data volumes                                                                           | Runner-local containers only                                            | Guarded GitHub-hosted Linux lifecycle                                     | Short        |
| `pnpm db:types:check`            | Reject a stale committed generated-type file                                                                           | None                                                                    | Types generated first                                                     | Instant      |

**Retired hosted commands — do not run.** `db:reset`, `db:migrations`, `db:push:dry-run`, `db:types`, `db:metadata`, and `test:integration:hosted` are retired compatibility seams for the removed hosted development/CI profiles. No approved target exists for them; they fail closed without those profiles and must never be given Preview/Beta credentials. Use the `db:ci:*` equivalents inside `database-ci`, sanitized CI artifacts, or the environment-promotion runbook instead.

## 8. Troubleshooting

### Wrong Node or pnpm

Run `corepack pnpm --version` and compare it with `package.json#packageManager`. Use `corepack pnpm`, not a global `pnpm`. Do not regenerate the lockfile merely because a different package manager rejects it.

### Development route types leak into a production build

Running `pnpm dev` changes generated Next.js state. Before a production build or typecheck, remove only the ignored output directory and restore the tracked reference file:

```powershell
git clean -dfX -- .next/
git restore --source=HEAD -- next-env.d.ts
```

Do not broaden either path. `pnpm typecheck:fresh` checks the application without `.next` generated state and remains part of the CI chain.

### Disposable Supabase CI is unavailable

Confirm the workflow uses `ubuntu-24.04`, the repository-pinned Supabase CLI, the expected container runtime, and no Preview/Beta credentials. Follow `.github/workflows/ci.yml` and `planning/tasks/wp01-t08-create-ci.md`. Retry the guarded job after diagnosing runner or registry availability; do not switch to a founder-hosted runner, fake the runner guard, bypass cleanup, or use Preview/Beta as a destructive test target.

### A port is occupied

Use the failing command's port and inspect it without killing anything:

```powershell
$portNumber = 3000
Get-NetTCPConnection -LocalPort $portNumber -ErrorAction SilentlyContinue
```

Identify the owning process before changing configuration. Do not terminate an unknown process automatically. This applies to workstation Next.js/browser tooling only; the disposable Supabase stack runs in GitHub-hosted CI.

### Generated database types are stale

Run the disposable CI type-generation path and inspect its reported diff. If the diff is expected, include it with the migration. If no migration explains it, stop and diagnose drift. Never regenerate from Beta or use a destructive Preview reset.

### Migration state differs from version control

Reproduce the mismatch from an empty disposable CI stack, then fix the first versioned migration failure. Never patch a hosted dashboard as the repair. For a migration already applied to Preview/Beta, add a forward repair migration.

### Environment validation fails

Use the variable names in the error to compare `.env.local` with `.env.example`. Do not print, echo, log, or paste values. Confirm unknown `NEXT_PUBLIC_` names are removed and mock mode remains enabled.

### A workstation or CI token/credential leaked

1. Stop the command or release action that exposed it.
2. Revoke or rotate the value at its authoritative source; deleting the local text is not sufficient.
3. Replace workstation-only values in ignored `.env.local`; replace hosted values only in the approved external secret store. Do not recreate retired development/CI profiles.
4. Search the candidate diff, logs, evidence, and Git history for the value without printing it.
5. If it entered a commit or external system, record a security incident and obtain security-owner review before continuing.

### A provider call appears during ordinary verification

Stop immediately. `pnpm verify` must be mock-only and zero-cost. Keep real flags false and budgets zero, preserve sanitized diagnostics, and treat any attempted network call as a release blocker.
