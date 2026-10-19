# Agent workflow

The one lifecycle for every repository task, for every coding agent. `AGENTS.md` holds the rules; this page holds the order. Product truth stays in the master plan, task acceptance and status in the runbook, and working state in the task record.

## 0. Status

Run `pnpm agent:status`. It lists in-progress and blocked tasks, the next runbook task in dependency order, and active task records. It only reads.

## 1. Pick

1. Run `git status --short` and preserve every unrelated change.
2. Continue the earliest executable `[~]` task; otherwise take the earliest executable `[ ]` task in runbook dependency order (runbook §0.1). A user-named outcome still maps to exactly one runbook task. If none fits, add the task to the runbook first.
3. Work in your own worktree on a branch named `<agent>/<task-id>-<slug>`, for example `claude/wp07-t04-quiz-lifecycle` or `codex/wp04-t04-pdf-extraction`.
4. Read only the selected runbook task, its direct dependencies and the docs for the area you change: backend → `docs/agents/module-boundaries.md`; frontend → `docs/agents/frontend.md`; auth or storage → the `trust-boundaries` skill; migrations → `docs/runbooks/database-migration-checklist.md`; delivery → the `finalize` skill.

**Done when:** one task is claimed (`[~]` in the runbook) and you know its acceptance.

## 2. Plan

Copy `docs/templates/task-record.md` to `planning/tasks/wpNN-tyy-short-outcome.md` and fill in the contract: outcome, acceptance link, files, verify, pass, rollback, hard stop, and steps.

- **Protected path** (auth and authorization, RLS and migrations, storage, `.github/workflows/`, production configuration): plan before editing. Name the allowed path and at least one forbidden path you will prove, and the rollback.
- **Material UI** (a visible presentation or interaction change to an approved surface): plan which routes, states, locales and themes the founder will review.
- Resolve open product questions with the founder before building; never decide them inside code.

**Done when:** a fresh agent could start from the record alone.

## 3. Build

1. Implement one end-to-end slice through an established public seam. Domain and application rules stay behind small interfaces; external systems behind adapters.
2. Use synthetic fixtures, deterministic mocks and zero paid capacity unless the task records an approved real input and its financial boundary.
3. Run the narrowest check that can reject the slice, then `pnpm check`.
4. Commit the slice. The commit message states what changed, why, and the proof you ran.
5. Overwrite the record's **Current state** and **Next action**. Never append a session log; history lives in commits and the PR.

Use `diagnosing-bugs` only for hard, unclear, reproduction-dependent or non-converging failures. A routine failure with a clear cause is fixed in the ordinary loop.

**Done when:** the allowed path works, the failure and forbidden paths that apply are covered, and the branch can be resumed from git.

## 4. Verify

- Map each acceptance criterion to one rejecting proof in the record.
- Run `pnpm verify` once on the finished candidate. It is the same suite CI runs. Do not edit tracked files while it runs.
- Database and Auth behaviour is proven by the CI `database-ci` job (disposable Supabase on a CI runner). For earlier database feedback, push the branch and dispatch CI with `database_feedback=true`; the final PR head still needs every required check.
- A check that already passed on unchanged inputs is not rerun. An unrun check needs a one-line reason in the record.

**Done when:** every acceptance criterion has green proof or a recorded blocker.

## 5. Review

- Always: `git diff --check`, `git diff --stat`, the full diff, and a changed-file secret and scope review.
- Protected path: an independent review of the exact candidate by a separately running review agent (Claude Code `independent-reviewer`, `/code-review`, `/security-review`; Codex `independent_reviewer`) or a human. Record the reviewer and the result. A finding returns you to step 3.
- Material UI: complete the technical floor in `docs/agents/frontend.md`, present the candidate to Ahmed or Ziad, and record `Approved commit: <sha>` with the approver. A later presentation or interaction change makes the approval stale; a proven non-visual fix keeps it.
- Record review honestly: say "self-review" when you reviewed your own work and "independent review" only when a separate reviewer examined the exact candidate.

**Done when:** findings are resolved and any required approval matches the candidate.

## 6. Deliver

Delivery follows the `finalize` skill:

1. Push the branch and open one PR. The PR body maps each acceptance criterion to its proof and states risk, rollback, review and any founder approval.
2. Wait for the required checks on the exact head. Main requires a pull request and green checks; it does not require an approving review.
3. Squash-merge. The PR keeps the slice history.
4. Prove only the external or production state the change can affect (deployment, database, domain). Store a short gate report in `evidence/<work-package>/` only when such proof was needed; otherwise the PR and its CI run are the evidence.
5. Close: mark the runbook task `[x]`, set the record's status, and delete the branch and worktree.

D-22 authorizes every non-financial step above. Stop immediately before any real-money exposure. If the request narrowed delivery (`local only`, `draft only`, `do not merge`, `stop before delivery`, `prepare for review only`), stop at that boundary and write the exact remaining action in the record.

**Done when:** the requested boundary is reached and proven from repository state, and a fresh agent needs no chat context.
