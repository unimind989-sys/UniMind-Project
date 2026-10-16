@AGENTS.md

## Claude Code notes

- `AGENTS.md` above is the shared rule set for every agent; this file only adds Claude Code specifics.
- Use your own task list for in-session progress; durable state still goes in the task record.
- Use plan mode for protected-path work before editing.
- Independent review: the `independent-reviewer` sub-agent, or the built-in `/code-review` and `/security-review` skills, on the exact candidate diff.
- Skills under `.claude/skills/` are generated. Edit `.agents/skills/` and run `pnpm skills:sync`.
- Run package scripts with `corepack pnpm <script>` when `pnpm` is not on the shell path.
