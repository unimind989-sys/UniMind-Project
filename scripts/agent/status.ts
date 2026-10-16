// Read-only work-state summary for coding agents: `pnpm agent:status [--json]`.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export type RunbookTaskState =
  "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "FAILED" | "DONE";

export type RunbookTask = {
  id: string;
  title: string;
  state: RunbookTaskState;
};

const runbookPath = "docs/runbooks/poc-execution-runbook.md";
const recordsDirectory = "planning/tasks";
export const recordLineLimit = 120;

export function deriveState(marks: string[]): RunbookTaskState | undefined {
  if (marks.length === 0) return undefined;
  if (marks.includes("!")) return "FAILED";
  if (marks.includes("?")) return "BLOCKED";
  if (marks.every((mark) => mark === "x")) return "DONE";
  if (marks.every((mark) => mark === " ")) return "NOT_STARTED";
  return "IN_PROGRESS";
}

export function parseRunbookTasks(markdown: string): RunbookTask[] {
  const tasks: RunbookTask[] = [];
  let current: { id: string; title: string; marks: string[] } | undefined;
  const flush = () => {
    const state = current && deriveState(current.marks);
    if (current && state)
      tasks.push({ id: current.id, title: current.title, state });
  };
  for (const line of markdown.split(/\r?\n/u)) {
    const heading = /^#{1,6}\s/u.test(line);
    const task = /^####\s+(WP\d{2}-T\d{2})\s+—\s+(.+)$/u.exec(line);
    if (heading) {
      flush();
      current = task
        ? { id: task[1]!, title: task[2]!.trim(), marks: [] }
        : undefined;
      continue;
    }
    const mark = /^\s*-\s+\[([ x~?!])\]/u.exec(line);
    if (current && mark) current.marks.push(mark[1]!);
  }
  flush();
  return tasks;
}

export type TaskRecord = { file: string; status: string; lines: number };

export function readTaskRecords(root = process.cwd()): TaskRecord[] {
  const directory = path.join(root, recordsDirectory);
  return readdirSync(directory)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .map((name) => {
      const text = readFileSync(path.join(directory, name), "utf8");
      const status =
        /^\*\*Status:\*\*\s*(\[[ x~?!]\])/mu.exec(text)?.[1] ?? "?";
      return {
        file: `${recordsDirectory}/${name}`,
        status,
        lines: text.split(/\r?\n/u).length,
      };
    });
}

function git(args: string[]): string {
  try {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function main(): void {
  const tasks = parseRunbookTasks(readFileSync(runbookPath, "utf8"));
  const records = readTaskRecords().filter((record) => record.status !== "[x]");
  const summary = {
    branch: git(["branch", "--show-current"]),
    uncommittedPaths: git(["status", "--porcelain"]).split("\n").filter(Boolean)
      .length,
    inProgress: tasks.filter((task) => task.state === "IN_PROGRESS"),
    blocked: tasks.filter((task) => task.state === "BLOCKED"),
    failed: tasks.filter((task) => task.state === "FAILED"),
    nextNotStarted: tasks.find((task) => task.state === "NOT_STARTED"),
    activeRecords: records,
  };
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  const list = (items: RunbookTask[]) =>
    items.length === 0
      ? "  none"
      : items.map((task) => `  ${task.id} — ${task.title}`).join("\n");
  console.log(
    `Branch: ${summary.branch} (${summary.uncommittedPaths} uncommitted paths)`,
  );
  console.log(`In progress:\n${list(summary.inProgress)}`);
  console.log(`Failed:\n${list(summary.failed)}`);
  console.log(`Blocked:\n${list(summary.blocked)}`);
  console.log(
    `Next not started (check its dependencies in the runbook): ${
      summary.nextNotStarted
        ? `${summary.nextNotStarted.id} — ${summary.nextNotStarted.title}`
        : "none"
    }`,
  );
  console.log("Active task records:");
  for (const record of records)
    console.log(
      `  ${record.status} ${record.file} (${record.lines} lines${
        record.lines > recordLineLimit
          ? `, over the ${recordLineLimit}-line limit`
          : ""
      })`,
    );
  if (records.length === 0) console.log("  none");
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(import.meta.filename)
)
  main();
