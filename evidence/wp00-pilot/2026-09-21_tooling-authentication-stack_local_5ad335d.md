# WP00-T10 tooling and authentication stack evidence

**Task:** WP00-T10 — Revalidate actual Codex tooling and authentication stack
**Candidate implementation:** `5ad335d` (`chore(ops): revalidate Codex tooling stack`)
**Reviewed exact head:** `9ccda5b81d3dde1ea98ddc772bcab4be2ce01e59` (PR #37)
**Protected merge/main:** `72beaea44f5e478e59513457939049c4ec4944cc`
**Base:** `6afcfd49bdeeebe2ea12797ec46b30873ffc95f5`
**Environment:** Windows workstation; repository root `E:\UniMind Project`; no provider-side mutation during local revalidation
**Agent executor:** Codex `/root`
**Selected checkpoint:** Ahmed
**Policy:** version 2; final local envelope `docs, tooling`, R0, Minimal, Luna Max floor, active model runtime unverified
**D-22:** standing Ahmed-and-Ziad authorization applies to selected non-financial protected delivery; no real-money action occurred

## Acceptance and outcome

The current operational stack is classified below from live read-only checks, protected delivery proof, and sanitized cross-chat connector evidence. The task retains existing repository-native/official tooling, adds justified two-account GitHub CLI support for recurring independent review, and adds no MCP, browser automation stack, credential infrastructure, or paid provider.

| System | Primary interface | Fallback | Verified identity | Scope | Status | Human-only dependency |
| --- | --- | --- | --- | --- | --- | --- |
| Local/Git | PowerShell 7, Git, repository-pinned Corepack/pnpm, Git Credential Manager | None | Git provider actor intentionally not inspected | `origin` → `unimind989-sys/UniMind-Project.git` | `WORKING` | None for ordinary transport; credentials remain in the native helper |
| GitHub connector/API | Existing GitHub connector in the working Codex chat | `gh` CLI; side browser for independent review | `unimind989-sys` from sanitized structured result | `UniMind-Project`; pull/push/admin/maintain true | `WORKING_WITH_LIMITATION` | Current task thread returns `Unknown tool`; connector operations require a working chat binding |
| GitHub CLI | Pinned/installed `gh 2.87.2`; owner operations via `unimind989-sys` | Explicit `gh auth switch` to `aboayman-oss`; side browser only for CLI gaps or Codex platform confirmation | Both accounts verified in native keyring; owner active after delivery | `unimind989-sys/UniMind-Project`; owner `ADMIN`, reviewer `WRITE`; HTTPS; `repo`, `workflow` scopes | `WORKING` | Reviewer login/approval is an explicit human checkpoint; return to owner account after review |
| Supabase CLI | Repository-pinned Supabase `2.115.0` | Side browser for dashboard-only work | Approved UniMind service identity; token not recorded | Project listing reaches `unimind-preview` and `unimind-beta`; checkout intentionally unlinked | `WORKING_WITH_LIMITATION` | Human login completed; hosted linking/reset/mutation remains task-selected only |
| Vercel CLI | Repository-pinned Vercel `59.9.1` | Side browser for UI-only settings | `unimind989-sys`; team `unimind2` | Linked `unimind-preview`, project `prj_pVmnuEUakL8R5ap78cAalBjwymbO` | `WORKING_WITH_LIMITATION` | Connector is not connected; logs/promote/rollback require a selected target and safe proof |
| Codex side browser | In-app side browser | Official CLI/connector | Not used for this setup task | GitHub operations unavailable through connector/CLI or Codex platform confirmation; authenticated dashboards otherwise | `NOT_NEEDED` | Human account challenges or UI-only/platform-confirmation actions |
| Playwright Test | Pinned Playwright Test `1.62.1` | Side browser for exploration | Local synthetic/mock mode | Repeatable E2E only when task impact selects it | `WORKING` | None for this task; E2E intentionally not selected |
| Playwright CLI | Pinned `@playwright/cli 0.1.18` and repository wrapper | Playwright Test / side browser | Local specialist tooling | Explicit tracing, locator, and test-debugging only | `WORKING_WITH_LIMITATION` | Explicit specialist request required |
| Chrome | Founder-facing Chrome | Side browser | Not used | Presentation or genuine visual/product decision only | `NOT_NEEDED` | Ahmed/Ziad request or visual decision |
| GitHub Actions/CI | GitHub Actions through `gh` and existing connector read paths | GitHub UI | Repository owner delivery identity | Exact reviewed head `9ccda5b81d3dde1ea98ddc772bcab4be2ce01e59`; run `35633503150` passed dependency-audit, application, database-ci, Vercel, and Vercel Preview Comments | `WORKING` | Conditional CI remains SHADOW; no manual promotion was performed |

## Installed / connected

- Local Git, Git Credential Manager, Corepack/pnpm, pinned Supabase CLI, pinned Vercel CLI, `gh`, Playwright Test, and the manual Playwright CLI wrapper already existed and were retained.
- GitHub app/connector remains connected at the Codex UI level; sanitized structured proof from the working chat confirms the owner account and repository permissions.
- GitHub CLI is authenticated through the official web/OAuth flow as both `unimind989-sys` and `aboayman-oss` in the native keyring. Owner operations use `unimind989-sys`; recurring independent protected review uses an explicit switch to `aboayman-oss`; neither token was printed or copied.
- Supabase CLI is authenticated through its official browser flow; the token and one-time link/code were not retained.
- No new tool, connector, MCP, browser runtime, or credential store was installed.

## Deliberately not installed or connected

- Supabase MCP: rejected because versioned migrations/configuration plus the official CLI and side browser cover the required path; it would add a second database trust path.
- Vercel MCP/connector: not connected because the authenticated pinned CLI covers identity, linkage, deployment inspection, and supported release controls.
- Additional GitHub MCP: not added; the existing connector is comprehensive when its thread binding works, and `gh` is now the repository-native fallback.
- Additional browser MCP, supervisor/orchestrator, telemetry, or credential-management infrastructure: no demonstrated missing capability.

## Remaining limitations and human dependencies

- The current task thread cannot invoke the GitHub connector methods even though the app is shown connected and the same connector works in another chat; calls fail before GitHub with `Unknown tool`. This is recorded as a Codex thread-runtime limitation, not a GitHub permission failure.
- Both `unimind989-sys` and `aboayman-oss` are configured in `gh`; explicit switching removes the recurring browser-only review dependency. The side browser remains a fallback for operations unavailable through connector/CLI or Codex platform confirmation.
- The repository checkout is not linked to Preview or Beta. This is intentional; do not run `supabase link`, hosted reset, or hosted mutation for convenience.
- Supabase and Vercel runtime logs were not fetched because raw logs are unnecessary exposure for a docs/tooling setup task.
- Exact-head CI, protected independent review, merge, main synchronization, and branch cleanup are complete for this candidate.

## Rate-limit impact

No measured token or credit savings are claimed. The revalidation avoided duplicate browser checks, a second GitHub/Supabase/Vercel MCP, Playwright CLI debugging, E2E runs, hosted database operations, and raw deployment-log retrieval. The second native-keyring GitHub account removes the recurring browser-only review path, but no numeric savings are inferred.

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
| `gh auth status --hostname github.com` (without `--show-token`) | PASS; both `unimind989-sys` and `aboayman-oss` present in the native keyring; owner restored active; token values not exposed |
| `gh auth switch --hostname github.com --user aboayman-oss` and switch back | PASS; explicit reviewer/owner account switching |
| `gh repo view unimind989-sys/UniMind-Project --json ...` under reviewer | PASS; public `main`, reviewer `WRITE`; owner recheck reports `ADMIN` |
| `gh pr view 37 ...` | PASS; PR #37 remained open at exact head `9ccda5b81d3dde1ea98ddc772bcab4be2ce01e59`, then recorded approval by `aboayman-oss` |
| `gh run view 35633503150 ...` | PASS on reviewed exact head; dependency-audit, application, and database-ci succeeded; Vercel checks succeeded |
| `corepack pnpm exec playwright --version` | PASS; `1.62.1` |
| `pwsh -NoProfile -File scripts/verify-agent-readiness.ps1` | PASS; 185 names, 46 links, 23 decisions, 104 task contracts |
| `corepack pnpm scan:secrets` | PASS; 899 files |
| `git diff --check` | PASS |

The base-main CI result was evidence reuse during initial revalidation. Delivery proof is the exact-head run `35633503150`, independent approval by `aboayman-oss`, and protected merge PR #37 as `72beaea44f5e478e59513457939049c4ec4944cc`.

## Trust-boundary proof

- Authoritative identity/scope sources were the GitHub CLI repository response, sanitized structured GitHub connector result, Supabase project-list response, Vercel CLI identity/project/deployment responses, and the local Git remote.
- Allowed path: read-only account, repository/project, deployment, CI, and CLI capability checks; explicit two-account switching for the named review seam; protected review and exact-head merge after actor/target/head/check validation.
- Forbidden path: no credentials, browser storage, raw provider payloads, source text, signed URLs, wrong-target mutations, hosted link/reset, new integration authorization, paid resource, or real-money action.
- Stale-state rule: account/session changes invalidate earlier results; exact-head identity, approval, and checks were re-probed immediately before merge.

## Rollback

Revert the task's repository commits through a new protected PR if needed. No hosted provider rollback is required because no hosted project, deployment, billing setting, or database state was mutated; the merged GitHub docs/evidence delivery remains auditable.

## Protected delivery addendum — 2026-09-21

- `gh auth status --hostname github.com` initially showed only `unimind989-sys`. Ahmed completed the official secure web flow for `aboayman-oss`; follow-up status showed both accounts without `--show-token`.
- Under `aboayman-oss`, repository access was `WRITE`; PR #37 exact head was `9ccda5b81d3dde1ea98ddc772bcab4be2ce01e59`; all required checks were green. The PR diff was inspected and approved through `gh pr review`.
- GitHub recorded `reviewDecision: APPROVED` with review author `aboayman-oss`. The active account was switched back to `unimind989-sys` before merge.
- `gh pr merge --merge --delete-branch --match-head-commit 9ccda5b81d3dde1ea98ddc772bcab4be2ce01e59` merged PR #37 as `72beaea44f5e478e59513457939049c4ec4944cc`; the remote task branch was deleted and local `main` fast-forwarded to that SHA.
