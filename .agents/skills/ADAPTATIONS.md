# Skill adaptations

## 2026-09-22 — Review provenance accuracy

### `finalize`

- **Evidence:** WP00-T11's executing Codex agent switched from the author account to `aboayman-oss` and submitted the approving review itself. The delivery workflow and closure evidence called this independent review even though only the GitHub account changed.
- **Change:** Finalization now distinguishes executor-controlled distinct-account approval from review by a separate human or separately executing agent/process. It satisfies only the review provenance the task or protected gate actually requires and does not add a reviewer merely to strengthen the label.
- **Validation:** Central review-provenance regressions, explicit trigger/non-trigger behavior cases in `EVALS.md`, repository skill validation, and corrected WP00-T11 evidence terminology.
- **Upstream:** UniMind-owned skill; no third-party source changed.

## 2026-09-21 — GitHub delivery capability probe and confirmation accuracy

### `finalize`

- **Evidence:** WP00-T09 had authenticated GitHub connector, CLI, and side-browser paths, but finalization moved directly to the side browser and described the completed protected delivery as fully autonomous even though the Codex host required human action-time confirmations for PR creation and review submission.
- **Change:** Finalization now probes structured GitHub and `gh` identity/permission mechanics before browser mutation, uses the browser only when those paths cannot satisfy distinct roles, and records host-mandated confirmation as a runtime limitation rather than zero-human completion.
- **Validation:** Repository skill validator, the new behavior case in `EVALS.md`, protected GitHub identity trust map, and WP00-T09 delivery evidence.
- **Upstream:** UniMind-owned skill; no third-party source changed.

## 2026-09-16 — WP00-T09 central execution policy cutover

### `tdd`

- **Evidence:** The established-seam rule required user confirmation even when the runbook, public interface, and repository tests already fixed the seam, creating a routine approval round trip.
- **Change:** Established/documented public seams now proceed autonomously; only consequential unresolved seam placement enters codebase design or founder choice. Removed the stale nonexistent `code-review` skill reference.
- **Validation:** Agent-policy regressions, skill validator, and behavior cases in `EVALS.md`.
- **Upstream:** Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`; UniMind adaptation only.

### `diagnosing-bugs`

- **Evidence:** The broad description activated a heavyweight six-phase diagnosis for any failing or throwing behavior, including routine single-test failures with direct causes.
- **Change:** Automatic activation is limited to hard, unclear, reproduction-dependent, performance, non-converging, or explicitly requested diagnosis; routine failures stay in the ordinary edit loop.
- **Validation:** Skill validator and trigger/non-trigger cases in `EVALS.md`.
- **Upstream:** Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`; UniMind adaptation only.

### `codebase-design`

- **Evidence:** `DESIGN-IT-TWICE.md` required a 3+ agent swarm, conflicting with the project-wide default-zero, maximum-one, no-nesting worker policy.
- **Change:** The primary agent generates alternatives; at most one bounded challenger may be used when central policy and user-authorized delegation both allow it.
- **Validation:** Skill validator, worker-ceiling policy regressions, and behavior cases in `EVALS.md`.
- **Upstream:** Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`; UniMind adaptation only.

### `image-to-code`

- **Evidence:** Ordinary screenshot comparison mandated Playwright CLI although UniMind already owns ordinary rendered inspection in the side browser and reserves the CLI for trace/test debugging.
- **Change:** Ordinary same-viewport/mobile comparison uses the side browser; Playwright CLI remains an explicit specialist.
- **Validation:** Skill validator and browser-routing policy regressions.
- **Upstream:** Agency OS commit `87d202e56939ad9889960a96796fc33bb76c5de0`; UniMind adaptation only.

### `impeccable`

- **Evidence:** Its broad automatic trigger and helper roles could turn tiny UI corrections into the full design workflow and appear to add worker budget.
- **Change:** Automatic activation now targets material design/UX judgment; every frontend task keeps a separate light quality floor, and helper roles are subordinate to the central worker ceiling.
- **Validation:** Skill validator, selective-activation regressions, and behavior cases in `EVALS.md`.
- **Upstream:** Impeccable commit `f88b2837a7d7c3182e46307bbbb091a1ed547571`; UniMind adaptation only.

### `finalize` and `trust-boundaries`

- **Evidence:** `$finalize` duplicated R0-R3 routing and required a second explicit ceremony after implementation; material auth/storage work lacked one compact reusable trust checklist.
- **Change:** Finalization now consumes the central actual-diff envelope and starts automatically for full-lifecycle selected tasks while retaining `$finalize` for manual/recovery entry. Added the small UniMind-owned `trust-boundaries` capability.
- **Validation:** Agent-policy historical regressions, evidence-invalidation cases, skill validator, agent readiness, isolated handoff rehearsal, and `EVALS.md`.
- **Upstream:** UniMind-owned behavior; no third-party source changed.

This log records evidence-based changes to repo-scoped skills. It is not a record of ordinary task corrections.

## 2026-09-15 — Lean verification and side-browser ownership

### `finalize`

- **Evidence:** Ahmed reported that Codex consumes too much rate-limit capacity through unnecessary work and testing. The governing workflow and `$finalize` combined mandatory skill validation, agent readiness, handoff rehearsal, and local `pnpm verify` even when a small documentation/skill diff could not affect every contract; the same passing behavior could also be checked again in GitHub CI.
- **Change:** Added a verification map and non-overlap rule, made R0 checks conditional on the affected contract, permitted exact-commit CI to be the full merge gate for documentation/skill-only candidates, and required internal browser work to use the in-app side browser with Chrome reserved for the completed review handoff.
- **Validation:** Repository skill validator, focused agent-readiness checks, behavior cases for R0 check selection and invalidation, and diff/secret review. The isolated handoff rehearsal and local `pnpm verify` are required only if this change affects their contracts.
- **Upstream:** UniMind-owned skill and workflow; no upstream source change.

### `playwright-cli`

- **Evidence:** Ahmed explicitly assigned ordinary internal browser work to Codex's in-app side browser and external Chrome to founder-facing review. Automatic Playwright CLI invocation created a competing internal browser path and additional browser sessions/artifacts.
- **Change:** Kept Microsoft's pinned skill content byte-compatible, changed only Codex metadata to manual invocation, and routed ordinary rendered inspection to the in-app side browser. Playwright Test remains the repeatable E2E/CI gate; `$playwright-cli` remains available for explicit tracing, locator discovery, and test debugging.
- **Validation:** Repository skill validator plus explicit-invocation and ordinary-rendered-inspection behavior cases.
- **Upstream:** Invocation-only UniMind adaptation of Microsoft Playwright CLI commit `2f85a94b7b885dbf4a5d34462f253a8746a690c9`; upstream skill content unchanged.

## 2026-09-14 — Autonomous non-financial finalization

### `finalize`

- **Evidence:** Ahmed reported that `$finalize` asked for protected-gate approval during an unattended workflow, halting delivery even though explicit invocation was intended to authorize complete finalization. Ahmed relayed that both founders approve autonomous verification, protected mutations, merge to `main`, affected-service promotion, evidence, and branch cleanup; only real-money exposure remains outside that standing authorization.
- **Change:** Made invocation the recorded Ahmed-and-Ziad authorization for all selected-task non-financial delivery actions, removed artifact-specific approval pauses, added an exact real-money boundary, required recovery through failed checks, and made verified local/remote task-branch deletion part of completion. Synchronized D-22 and the governing workflow documentation.
- **Validation:** Repository skill validation, local-reference resolution, agent-readiness and isolated handoff checks, focused formatter checks, and behavior cases for R0, R1, R3, real-money exposure, recovery, and cleanup.
- **Upstream:** UniMind-owned skill and authorization policy; no upstream source change.

## 2026-09-13 — Resilient skill-validator dependency cache

### `skill-maintainer`

- **Evidence:** While validating the new `$finalize` skill, the repository validator found its expected temporary `yaml` directory but Python loaded an incomplete namespace package without `safe_load` or `YAMLError`. The validator then failed every skill instead of repairing its bootstrap dependency.
- **Change:** The validator now tests the cached module's required PyYAML API and force-reinstalls pinned `PyYAML==6.0.2` into the system-temp cache when the module is missing or invalid.
- **Validation:** Reproduce the invalid-cache condition, confirm automatic repair, then validate the complete repository skill inventory and supporting script syntax.
- **Upstream:** UniMind-owned validator bootstrap; no upstream skill source change.

## 2026-08-25 — Explicit Wizard invocation

### `wizard`

- **Evidence:** Ahmed requested that the Wizard skill run only when the user asks. The skill metadata and routing docs currently classified human-only setup as an automatic trigger, so ordinary setup work could generate an interactive script without an explicit request.
- **Change:** Made Wizard user-invoked in Codex metadata, narrowed its description and entry condition to explicit requests, and synchronized the skill inventory, guide, agent workflow, and trigger/non-trigger evaluations.
- **Validation:** Repository skill validation, explicit `$wizard` trigger case, and nearby manual-setup non-trigger case.
- **Upstream:** Local UniMind adaptation of Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`; no upstream source change.

## 2026-08-20 — Initial UniMind fit

### `unslop`

- **Evidence:** The upstream skill says it must apply to all writing and uses absolute style bans. UniMind contains controlled evidence, policies, technical contracts, and safety language where semantic precision matters more than a universal voice.
- **Change:** Narrowed activation to human-facing prose, protected controlled text, and replaced absolute punctuation rules with a semantic-drift check.
- **Validation:** Skill structure, local references, and trigger boundaries checked.
- **Upstream:** Cursor plugins commit `fd6dd6f7276956a532bb78a748a8d2818b6eb5f4`.

### `blast-radius`

- **Evidence:** The upstream workflow depends on `how`, `why`, `arena`, and `unslop`; only unslop is present here, and its generic risk list omits UniMind's core security, provenance, job, deletion, and cost contracts.
- **Change:** Made the workflow self-contained, explicit-only, and added UniMind risk lenses plus an evidence ladder that requires executed proof or `UNPROVEN` status.
- **Validation:** Dependency references removed and invocation policy checked.
- **Upstream:** Cursor plugins commit `fd6dd6f7276956a532bb78a748a8d2818b6eb5f4`.

### `wait-what`

- **Evidence:** Ahmed works in English but wants simpler explanations without automatic Arabic translation or unsolicited grammar correction.
- **Change:** Added a clear re-pitch sequence, terminology definitions, literal phrasing, and the English-only default.
- **Validation:** Explicit-only invocation policy preserved.
- **Upstream:** Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`.

### `grill-me`

- **Evidence:** The upstream file used the unsupported `disable-model-invocation` frontmatter key. Codex stores this policy in `agents/openai.yaml`.
- **Change:** Removed the unsupported key and preserved `policy.allow_implicit_invocation: false` in the Codex metadata.
- **Validation:** Built-in Codex skill validator and invocation-policy check.
- **Upstream:** Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`.

### `wizard`

- **Evidence:** The upstream skill generates Bash while the UniMind runbook and workstation are Windows/PowerShell-first.
- **Change:** Replaced the Bash workflow and template with PowerShell, kept secrets out of output and command-line arguments, and added current-doc verification for changing dashboards.
- **Validation:** PowerShell template syntax parsed; static safety and destination checks required for every generated wizard.
- **Upstream:** Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`.

### UniMind-owned skills

- **Evidence:** The repository needed persistent English preferences, a safe improvement loop, and one command that helps a new user choose among many skills.
- **Change:** Added `clear-english`, `skill-maintainer`, and the explicit `$unimind-skills` router.
- **Validation:** Built-in skill validation and realistic trigger/non-trigger checks required.

## 2026-08-20 — Cross-skill composition and UI design

### `grill-me`, `tdd`, and `writing-for-agents`

- **Evidence:** Imported instructions referred to a generic "Skill tool" that this Codex setup does not expose, and the skill-authoring reference prescribed the unsupported `disable-model-invocation` frontmatter field.
- **Change:** Replaced cross-skill tool calls with direct local `SKILL.md` references. Moved manual invocation guidance to `agents/openai.yaml` using `policy.allow_implicit_invocation: false`.
- **Validation:** Cross-skill link resolution, unsupported-syntax scan, invocation-policy check, and behavior cases in `EVALS.md`.
- **Upstream:** Matt Pocock skills commit `885e2ca4d842d139e9aef4e48d366c63cb1b8013`.

### `skill-maintainer`

- **Evidence:** The official Codex validator failed because PyYAML was absent, forcing an undocumented one-off setup each time skills changed.
- **Change:** Added a repository validator command that installs pinned PyYAML into the system temp folder, runs the official validator across all skills, resolves local Markdown references, rejects incompatible cross-skill syntax, parses JSON, and checks Node script syntax.
- **Validation:** The validator must pass against the complete repository inventory without adding a project dependency.

### `domain-modeling`

- **Evidence:** Its format reference rendered illustrative `src/*/CONTEXT.md` paths as live links, so repository-wide link validation correctly treated them as missing files.
- **Change:** Kept the examples but formatted their paths as literal code instead of clickable references.
- **Validation:** Complete local Markdown reference check.

### `impeccable`

- **Evidence:** UniMind needs product UI and dashboards, while Taste Skill's current default explicitly excludes dashboards and multi-step product UI. Impeccable has an Operate mode, durable product/design records, bounded visual verification, and deterministic anti-pattern checks.
- **Change:** Vendored the native Codex skill, preserved its subagents and scripts, connected it to UniMind's governing documents, pinned its DESIGN.md specification, and made its web audit consume the pinned Vercel rules. Removed the unsupported top-level `version` field; this also disables Impeccable's mutable update poll, which matches the reviewed-pin policy. The automatic edit hook remains disabled during planning.
- **Validation:** Codex skill structure, local-reference resolution, Node script syntax, context-loader smoke test, detector smoke test, and trigger boundaries.
- **Upstream:** Impeccable commit `f88b2837a7d7c3182e46307bbbb091a1ed547571`; Google DESIGN.md commit `9bf8eae67128b6cc55ad9bf86665767deb4c11cd`.

### `web-design-guidelines`

- **Evidence:** Vercel's upstream agent skill fetches mutable instructions from `main` on every run, which conflicts with UniMind's pinned and reviewable source policy. Its review scope also overlaps Impeccable's audit trigger.
- **Change:** Vendored the rules at a fixed commit, removed runtime fetching, made the standalone skill manual-only, and integrated the same snapshot into Impeccable's web audit.
- **Validation:** Manual invocation policy, local rules reference, no runtime URL fetch, and duplicate-report avoidance case in `EVALS.md`.
- **Upstream:** Vercel Web Interface Guidelines commit `e3d624baaf29dc1fc645aff3e38f03e564d2d6b1`.

## 2026-08-24 — Visual reference and browser toolchain

### `taste`

- **Evidence:** Ahmed explicitly requested Taste integration, while the upstream skill excludes dashboards and multi-step product UI and UniMind already routes those surfaces through Impeccable.
- **Change:** Vendored the full pinned skill, made invocation manual-only, limited it to visitor-facing marketing surfaces, and kept project authority plus rendered standards verification above aesthetic defaults.
- **Validation:** Manual invocation policy, product-screen non-trigger case, source license, and repository skill validation.
- **Upstream:** Taste Skill commit `72e299530e2eb31ed8da06181bc19f6c18a00821`.

### `awesome-design-md`

- **Evidence:** Ahmed requested the reference library, but automatically copying another brand's design system would invent UniMind decisions and conflict with the root `DESIGN.md` lifecycle.
- **Change:** Vendored the complete pinned library behind a manual skill that requires a selected reference, reads only that branch, separates transferable principles from brand identity, and records only confirmed UniMind decisions.
- **Validation:** Manual invocation policy, all 74 reference directories present, local references, source license, and repository skill validation.
- **Upstream:** Awesome DESIGN.md commit `8147538b4226ae41e2487a9179e3bcc1f68e8554`.

### `image-to-code`

- **Evidence:** A faithful screenshot workflow needs a selected image and rendered comparison, while Agency OS assumes sibling image-generation skills and a website-only workflow that UniMind does not install.
- **Change:** Kept the compact analysis/build/verification workflow, required an unambiguous selected image, routed written briefs to Impeccable, preserved UniMind product boundaries, and made project-pinned browser comparison part of completion.
- **Validation:** Selected-image trigger and missing-image stop cases, checklist link resolution, source license, and repository skill validation.
- **Upstream:** Agency OS commit `87d202e56939ad9889960a96796fc33bb76c5de0`.

### `playwright-cli`

- **Evidence:** Playwright Test was already pinned for repeatable E2E tests, but Ahmed requested Microsoft's separate agent CLI for interactive browser work.
- **Change:** Added exact package `@playwright/cli@0.1.18` and its byte-compatible skill/references. Always-on project rules require the local `pnpm browser:cli` wrapper, isolate credential-bearing artifacts under ignored `.playwright-cli/`, and keep Playwright Test as the automated gate without breaking the CLI's built-in skill drift check. The wrapper disables the mutable update notifier because upgrades are reviewed and pinned.
- **Validation:** Local CLI version/help, automatic browser-task trigger, storage-state safety boundary, source license, and repository skill validation.
- **Upstream:** Playwright CLI commit `2f85a94b7b885dbf4a5d34462f253a8746a690c9`.

## 2026-09-24 — Manual model work blocks

### `impeccable`

- **Evidence:** Its new-work reviewer instruction still required a central model floor and a protected Sol floor after WP00-T14 removed executable model routing.
- **Change:** The local reviewer instruction now follows the task record's manual block assignment and hands unresolved design or protected judgment to Sol High with the same block and evidence. Risk continues to select proof and approvals.
- **Validation:** Repository skill validator, local instruction search, and the manual-handoff behavior case in `EVALS.md`.
- **Upstream:** UniMind-only adaptation of Impeccable commit `f88b2837a7d7c3182e46307bbbb091a1ed547571`; upstream content and license remain pinned.
