# Agent operability audit

**Status:** IN PROGRESS

**Objective:** Coding agents can discover context, select work, execute safely, verify results, and hand off evidence with minimal contributor involvement; non-code documentation and filenames remain simple, consistent, and navigable.

This is a completion audit, not a second plan. The master plan owns product direction, the execution runbook owns task contracts, and task records own current execution state.

| Required capability | Current direct evidence | Assessment | Missing proof or work |
| --- | --- | --- | --- |
| Discover governing context | Root maps and workflow; readiness link check; `scripts/test-agent-handoff.ps1` passes from an isolated committed snapshot in new processes | Partial | Repository-only process isolation is proven, but a separate fresh agent/reviewer has not evaluated comprehension. |
| Select the next valid task | Runbook section 0.1; durable records; decision resolution/block lists; work-state text/JSON; isolated rehearsal must match the live source recommendation | Partial | Machine selection is proven, but a separate fresh agent has not exercised the full readiness judgment; decision deadlines and founder review-role assignments remain open. |
| Execute safely | Runbook definitions of ready/done, hard stops, mocks, privacy/cost controls, rollback hierarchy, and agent/human role split | Partial | The application foundation and executable boundaries do not exist until WP01; safety remains instruction-level rather than runtime-proven. |
| Verify results | `scripts/verify-agent-readiness.ps1` passes for planning/docs structure | Partial | `package.json`, `pnpm verify`, CI, database reset, security tests, build, and clean-clone proof do not exist until WP01. |
| Hand off durable evidence | Controlled task/gate formats, WP00 records, and isolated rehearsal prove next-safe-action fields survive in a clean committed snapshot | Partial | No real candidate commit, commit-specific evidence report, or founder human checkpoint exists for WP00-T00/T01. |
| Minimize contributor implementation work | Agents are default executors; humans retain decisions and required review | Partial | Human decision owners must supply deadlines/outcomes and required reviewers; those are governance inputs, not coding work. |
| Keep non-code structure and naming simple | Placement rules, lowercase decision convention, scoped indexes, and automated name/link checks pass | Partial | The convention still needs a founder human checkpoint and continued enforcement as code, CI, decisions, and evidence are added. |

## Next proof milestones

1. Obtain an Ahmed-or-Ziad human checkpoint and candidate-SHA evidence for WP00-T00 and WP00-T01.
2. Close or explicitly schedule the WP00 human decisions without asking contributors to implement code.
3. Have a separate fresh agent/reviewer evaluate the isolated workflow's clarity and repository-only handoff.
4. Build WP01 so one zero-cost `pnpm verify` command proves install, lint, types, tests, database reset, generated types, and build.
5. Re-run this audit against the clean-clone and CI evidence; keep the goal open until every row has complete direct proof.
