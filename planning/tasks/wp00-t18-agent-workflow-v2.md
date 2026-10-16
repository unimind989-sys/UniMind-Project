# Task record: WP00-T18 agent workflow v2

**Task ID:** WP00-T18

**Status:** [x]

**Outcome:** Codex and Claude Code share one short rule set, one lifecycle, one skill source and lightweight checks, with no pasted routing fields and no duplicated or contradictory process rules.

**Acceptance:** [runbook WP00-T18](../../docs/runbooks/poc-execution-runbook.md#wp00-t18--simplify-the-agent-workflow-for-codex-and-claude-code)

**Owner:** Claude Code; selected speaker Ahmed

**Branch:** claude/wp00-t18-agent-workflow-v2

**Updated (UTC):** 2026-10-16T18:00:00Z

## Contract

**Dependencies:** WP00-T09 to WP00-T17 (superseded mechanics); clean `main` at `e252c9c`.

**Inputs:** Ahmed's approved rework plan (2026-10-16 chat): remove Sol/Luna, the router, preflight, fingerprints and receipts; one shared skill source; Anthropic `frontend-design`; required PR without a required approving review.

**Files:** `AGENTS.md`, `CLAUDE.md`, `docs/agents/**`, `docs/templates/task-record.md`, runbook §0 and WP00-T18, `.agents/skills/**`, `.claude/**`, `.codex/agents/**`, `scripts/agent/**`, CI selector and workflow audit, `package.json`, README, CONTRIBUTING, DESIGN, PRODUCT, decision register, evidence README.

**Protected paths:** `.github/workflows/ci.yml` (selector and docs-only steps only; required job names unchanged). Allowed: docs-only PR skips heavy jobs. Forbidden: code, database, dependency, workflow or unknown paths skipping required jobs.

**Verify:** `pnpm lint:agents`; `pnpm test:unit -- conditional-ci-selector ci-workflow-policy`; `pnpm typecheck`; `pnpm format:check`; `pnpm agent:status`; exact-head required CI.

**Pass:** lint, unit, typecheck and format exit 0; CI green on the PR head; no hard rule weakened.

**Rollback:** revert the squash-merge commit; restore branch protection's approving-review count if it was changed.

**Hard stop:** any change to product code, required CI job names, D-22 or data-safety rules; any paid action.

## Steps

- [x] Shared rules: `AGENTS.md`, `CLAUDE.md`, `docs/agents/workflow.md`, `frontend.md`, `communication.md`.
- [x] Task template v2 and runbook §0 cleanup; WP03-T13 logs moved to evidence.
- [x] Skills: 23 to 16, `frontend-design` (Apache-2.0, `anthropics/skills@41bbe19`), `skills:sync`, sub-agents.
- [x] Tooling: `agent:status`, `lint:agents`, `check`, `verify`; selector config; old scripts removed.
- [x] Docs dedupe: README, CONTRIBUTING, DESIGN, PRODUCT, decision register.
- [x] Checks, review, commit; PR #76 with squash auto-merge; `main` protection set to a required PR and green checks with 0 approvals; repository auto-merge enabled (Ahmed, 2026-10-16).

## Decisions

- Historical task records and evidence keep their original wording; only live instructions are rewritten (Ahmed, 2026-10-16).
- `.claude/skills` holds generated `SKILL.md` files only; supporting files stay in `.agents/skills` to avoid duplicating about 20 MB.
- `docs/reviews/` and `planning/design/` stay in place; moving them would break many historical links for little gain.

## Current state

**Changed:** see Steps; 293 files, about 4.3k lines added and 51.8k removed (mostly retired skills and policy tooling).

**Proof:** `lint:agents` pass (64 documents, 7 active records, 16 skills, Claude copies in sync); `format:check`, `lint`, `typecheck`, `check:boundaries`, `check:sql`, `scan:secrets`, `verify:ci-workflow` exit 0; `test:unit` 1011/1011. Not run locally: integration, security, eval, load, e2e, demo e2e and build (no product code changed); CI runs them on the PR head.

**Review:** self-review of the full diff; independent review (separate Claude Code sub-agent) of the CI workflow, selector, scripts and package scripts: no high or medium findings. Two low findings fixed (selector config validation; Impeccable context shortcut tied to the retired policy).

**Approved commit:** NOT REQUIRED: no rendered UI change.

**Remaining:** NONE once PR #76 merges. These closure markers become authoritative only when PR #76's required checks pass and it merges.

## Next action

After merge: delete the task branch and worktree; the next task follows `pnpm agent:status`.
