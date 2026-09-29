# Task record: WP00-T17 add manual logo design skill

**Task ID:** WP00-T17

**Status:** [~]

**Outcome:** A pinned `$logo-design` skill is available only by explicit user invocation, with working local tools and documented UniMind use.

**Owner:** Codex executor; no signed-in human operation required

**Reviewer:** Ahmed or Ziad for any future logo direction; D-22 applies to this non-financial tooling delivery

**Branch:** codex/manual-logo-design-skill

**Updated (UTC):** 2026-09-29 20:44 UTC

## Derived execution envelope

**Policy version:** 8

**Surfaces:** docs, tooling

**Risk:** R0

**Planning:** minimal

**Worker budget:** 0 used, 1 maximum, no nested workers

**Capabilities:** NONE

**Procedural skills:** skill-creator, writing-for-agents for authoring; logo-design itself is manual only

**Routing reason:** Adds a repository skill and use documentation without changing product UI or runtime.

## Manual model work blocks

| Block | Assigned model | Scope and governing inputs | Independent acceptance checks, including failure cases | Assignment reason | Status and evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol High | Pin and adapt upstream skill, source policy, manual invocation, UniMind guide and task contract | Full copied skill has valid metadata and notices; `allow_implicit_invocation: false`; reference search, SVG audit and preview work; no product logo selected | One bounded task with source/licensing and project-policy judgment | In progress; source commit `5a02a1a` |
| 2 | Sol High | Verify candidate and deliver through protected main | Focused and selected policy checks pass; exact-head required CI passes; merged main is clean | Same compact review and delivery block | Pending |

**Next model:** Sol High

**Current block:** 1

## Execution contract

**Dependencies:** WP00-T00 agent workflow; existing skill source policy and validator

**Inputs:** Upstream commit `5a02a1ab650e7dfd0d1d06f4fd303e730311ce80`, `PRODUCT.md`, `DESIGN.md`, skill guidance

**Files:** `.agents/skills/logo-design/`, `.agents/skills/README.md`, `.agents/skills/ADAPTATIONS.md`, `.agents/skills/EVALS.md`, `docs/agents/skills-guide.md`, this record, runbook task entry

**Verify:** repository skill validator; Python syntax and local script smoke checks; `scripts/verify-agent-readiness.ps1`; policy-selected lint, typecheck, fresh typecheck, secret scan, diff integrity; exact-head CI

**Pass:** Explicit invocation loads the working skill; ordinary logo-adjacent requests do not; trademark references remain reference-only; no UniMind logo or product UI is changed.

**Evidence:** This record plus exact-head GitHub checks and sanitized closure evidence if delivered

**Rollback:** Revert this skill and documentation change through protected Git history.

**Hard stop:** Do not publish a new UniMind mark without a founder direction decision; do not copy third-party library SVGs into product assets.

## Candidate preparation

**Design disposition:** NOT_APPLICABLE

**Design evidence:** NOT_REQUIRED

**Preparation review:** PENDING

**Preparation fingerprint:** NOT_READY

**Unresolved findings:** NONE

**Established facts:** NONE

## Steps

- [~] Copy and adapt the complete pinned skill, preserving licenses and manual invocation.
- [ ] Validate skill metadata, references, Python syntax, and key tools.
- [ ] Review the full change, run selected checks, and deliver through protected main.

## Handoff

**Changed:** Skill copy, manual invocation metadata, source and use docs, runbook entry; verification pending.

**Commands:** `git ls-remote` and clone pinned HEAD; intent router R0 docs/tooling; further checks pending.

**Remaining:** Validation, review, exact-head CI, protected delivery, closure.

**Next safe action:** Run focused skill and script validation.

**Reviewer action:** NONE for this tooling task; future logo selection is a separate founder decision.
