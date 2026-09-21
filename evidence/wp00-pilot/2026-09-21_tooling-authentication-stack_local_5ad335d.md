# WP00-T10 tooling and authentication stack evidence

**Task:** WP00-T10 — Revalidate actual Codex tooling and authentication stack
**Candidate:** `5ad335d` (`chore(ops): revalidate Codex tooling stack`)
**Base:** `6afcfd49bdeeebe2ea12797ec46b30873ffc95f5`
**Environment:** Windows workstation; repository root `E:\UniMind Project`; no provider-side mutation during local revalidation
**Agent executor:** Codex `/root`
**Selected checkpoint:** Ahmed
**Policy:** version 2; final local envelope `docs, tooling`, R0, Minimal, Luna Max floor, active model runtime unverified
**D-22:** standing Ahmed-and-Ziad authorization applies to selected non-financial protected delivery; no real-money action occurred

## Acceptance and outcome

The current operational stack is classified below from live read-only checks and sanitized cross-chat connector evidence. The task retains existing repository-native/official tooling, fixes only the stale post-foundation task routing label, and adds no MCP, browser automation stack, credential infrastructure, or paid provider.

| System | Primary interface | Fallback | Verified identity | Scope | Status | Human-only dependency |
| --- | --- | --- | --- | --- | --- | --- |
| Local/Git | PowerShell 7, Git, repository-pinned Corepack/pnpm, Git Credential Manager | None | Git provider actor intentionally not inspected | `origin` → `unimind989-sys/UniMind-Project.git` | `WORKING` | None for ordinary transport; credentials remain in the native helper |
| GitHub connector/API | Existing GitHub connector in the working Codex chat | `gh` CLI; side browser for independent review | `unimind989-sys` from sanitized structured result | `UniMind-Project`; pull/push/admin/maintain true | `WORKING_WITH_LIMITATION` | Current task thread returns `Unknown tool`; connector operations require a working chat binding |
| GitHub CLI | Pinned/installed `gh 2.87.2` | Side browser | `unimind989-sys`, active in OS keyring | `unimind989-sys/UniMind-Project`; viewer `ADMIN`; HTTPS; `repo`, `workflow` scopes | `WORKING_WITH_LIMITATION` | `aboayman-oss` independent review is not configured in CLI and remains browser/human-only |
| Supabase CLI | Repository-pinned Supabase `2.115.0` | Side browser for dashboard-only work | Approved UniMind service identity; token not recorded | Project listing reaches `unimind-preview` and `unimind-beta`; checkout intentionally unlinked | `WORKING_WITH_LIMITATION` | Human login completed; hosted linking/reset/mutation remains task-selected only |
| Vercel CLI | Repository-pinned Vercel `59.9.1` | Side browser for UI-only settings | `unimind989-sys`; team `unimind2` | Linked `unimind-preview`, project `prj_pVmnuEUakL8R5ap78cAalBjwymbO` | `WORKING_WITH_LIMITATION` | Connector is not connected; logs/promote/rollback require a selected target and safe proof |
| Codex side browser | In-app side browser | Official CLI/connector | Not used for this setup task | Authenticated dashboards when structured paths cannot answer | `NOT_NEEDED` | Human account challenges or UI-only actions |
| Playwright Test | Pinned Playwright Test `1.62.1` | Side browser for exploration | Local synthetic/mock mode | Repeatable E2E only when task impact selects it | `WORKING` | None for this task; E2E intentionally not selected |
| Playwright CLI | Pinned `@playwright/cli 0.1.18` and repository wrapper | Playwright Test / side browser | Local specialist tooling | Explicit tracing, locator, and test-debugging only | `WORKING_WITH_LIMITATION` | Explicit specialist request required |
| Chrome | Founder-facing Chrome | Side browser | Not used | Presentation or genuine visual/product decision only | `NOT_NEEDED` | Ahmed/Ziad request or visual decision |
| GitHub Actions/CI | GitHub Actions through `gh` and existing connector read paths | GitHub UI | Repository owner delivery identity | Exact commit checks; current base run `35620750742` passed application/database jobs and skipped dependency audit | `WORKING_WITH_LIMITATION` | Exact-head candidate CI remains required before merge; conditional CI remains SHADOW |

## Installed / connected

- Local Git, Git Credential Manager, Corepack/pnpm, pinned Supabase CLI, pinned Vercel CLI, `gh`, Playwright Test, and the manual Playwright CLI wrapper already existed and were retained.
- GitHub app/connector remains connected at the Codex UI level; sanitized structured proof from the working chat confirms the owner account and repository permissions.
- GitHub CLI is authenticated through the official web/OAuth flow as `unimind989-sys`; the token was not printed or copied.
- Supabase CLI is authenticated through its official browser flow; the token and one-time link/code were not retained.
- No new tool, connector, MCP, browser runtime, or credential store was installed.

## Deliberately not installed or connected

- Supabase MCP: rejected because versioned migrations/configuration plus the official CLI and side browser cover the required path; it would add a second database trust path.
- Vercel MCP/connector: not connected because the authenticated pinned CLI covers identity, linkage, deployment inspection, and supported release controls.
- Additional GitHub MCP: not added; the existing connector is comprehensive when its thread binding works, and `gh` is now the repository-native fallback.
- Additional browser MCP, supervisor/orchestrator, telemetry, or credential-management infrastructure: no demonstrated missing capability.

## Remaining limitations and human dependencies

- The current task thread cannot invoke the GitHub connector methods even though the app is shown connected and the same connector works in another chat; calls fail before GitHub with `Unknown tool`. This is recorded as a Codex thread-runtime limitation, not a GitHub permission failure.
- Only `unimind989-sys` is configured in `gh`; independent `aboayman-oss` review remains a browser/human path when branch protection requires it.
- The repository checkout is not linked to Preview or Beta. This is intentional; do not run `supabase link`, hosted reset, or hosted mutation for convenience.
- Supabase and Vercel runtime logs were not fetched because raw logs are unnecessary exposure for a docs/tooling setup task.
- Exact-head CI, protected independent review, merge, main synchronization, and branch cleanup remain delivery steps for this candidate.

## Rate-limit impact

No measured token or credit savings are claimed. The revalidation avoided duplicate browser checks, a second GitHub/Supabase/Vercel MCP, Playwright CLI debugging, E2E runs, hosted database operations, and raw deployment-log retrieval. The task replaced repeated historical assumptions with one current read-only check per material path.

## Verification

| Check | Result |
| --- | --- |
| `corepack pnpm agent:route -- --task WP00-T10 --pass actual-diff --surface docs --surface tooling` | PASS; policy 2, docs/tooling, R0, Minimal, Luna Max floor, model runtime unverified; selected readiness, handoff, secret scan, exact-head CI |
| `corepack pnpm --version` / `corepack pnpm exec node --version` | PASS; `10.34.5` / `v24.19.0` from repository root |
| `corepack pnpm supabase --version` | PASS; `2.115.0` after a transient telemetry-file rename race on the first attempt |
| `corepack pnpm supabase projects list` | PASS; `unimind-preview` `ACTIVE_HEALTHY`, `unimind-beta` `INACTIVE`; no hosted ref linked |
| `corepack pnpm vercel whoami --json --non-interactive --no-color` | PASS; `unimind989-sys`, team `unimind2` |
| `corepack pnpm vercel project inspect unimind-preview ...` | PASS; project ID verified |
| `corepack pnpm vercel list unimind-preview ...` and `vercel inspect ...` | PASS; one `READY` deployment listed and inspected |
| `gh auth status --hostname github.com` (token line redacted) | PASS; active `unimind989-sys`, keyring, HTTPS, `repo`/`workflow` scopes |
| `gh repo view unimind989-sys/UniMind-Project --json ...` | PASS; public `main`, viewer `ADMIN` |
| `gh run view 35620750742 ...` | PASS on base SHA `6afcfd49bdeeebe2ea12797ec46b30873ffc95f5`; application and database jobs succeeded, dependency audit skipped |
| `corepack pnpm exec playwright --version` | PASS; `1.62.1` |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | PASS; 185 names, 46 links, 23 decisions, 104 task contracts |
| `corepack pnpm scan:secrets` | PASS; 899 files |
| `git diff --check` | PASS |

The current task's local candidate has not yet received exact-head CI; the base-main CI result above is evidence reuse only and is not delivery proof for `5ad335d`.

## Trust-boundary proof

- Authoritative identity/scope sources were the GitHub CLI repository response, sanitized structured GitHub connector result, Supabase project-list response, Vercel CLI identity/project/deployment responses, and the local Git remote.
- Allowed path: read-only account, repository/project, deployment, CI, and CLI capability checks; Git push was tested only with `--dry-run`.
- Forbidden path: no credentials, browser storage, raw provider payloads, source text, signed URLs, wrong-target mutations, hosted link/reset, new integration authorization, paid resource, or real-money action.
- Stale-state rule: account/session changes invalidate earlier results; exact-head identity and checks must be re-probed before consequential delivery.

## Rollback

Revert the task's repository commits and delete the task branch after protected delivery. No provider-side rollback is required because no provider resource or hosted environment was mutated by revalidation.
