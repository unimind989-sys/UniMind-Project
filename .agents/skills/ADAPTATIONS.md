# Skill adaptations

This log records evidence-based changes to repo-scoped skills. It is not a record of ordinary task corrections.

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
