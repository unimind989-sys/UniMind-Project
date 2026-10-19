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
  dependsOn: string[];
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

// Reads the task IDs in a `**Depends on:**` line, expanding ranges such as
// "WP04-T04 to WP04-T07" within one package. Text after "**Decision gates:**"
// is not a dependency.
export function parseDependsOn(line: string): string[] {
  const match = /^\*\*Depends on:\*\*(.*)$/u.exec(line.trim());
  if (!match) return [];
  const text = match[1]!.split("**Decision gates:**")[0]!;
  const ids: string[] = [];
  const pattern = /(WP\d{2})-T(\d{2})(?:\s+to\s+\1-T(\d{2}))?/gu;
  for (const [, pack, first, last] of text.matchAll(pattern)) {
    const start = Number(first);
    const end = last ? Number(last) : start;
    for (let number = start; number <= end; number += 1)
      ids.push(`${pack}-T${String(number).padStart(2, "0")}`);
  }
  return [...new Set(ids)];
}

export function parseRunbookTasks(markdown: string): RunbookTask[] {
  const tasks: RunbookTask[] = [];
  let current:
    | { id: string; title: string; marks: string[]; dependsOn: string[] }
    | undefined;
  const flush = () => {
    const state = current && deriveState(current.marks);
    if (current && state)
      tasks.push({
        id: current.id,
        title: current.title,
        state,
        dependsOn: current.dependsOn,
      });
  };
  for (const line of markdown.split(/\r?\n/u)) {
    const heading = /^#{1,6}\s/u.test(line);
    const task = /^####\s+(WP\d{2}-T\d{2})\s+—\s+(.+)$/u.exec(line);
    if (heading) {
      flush();
      current = task
        ? { id: task[1]!, title: task[2]!.trim(), marks: [], dependsOn: [] }
        : undefined;
      continue;
    }
    if (current && current.dependsOn.length === 0)
      current.dependsOn = parseDependsOn(line);
    const mark = /^\s*-\s+\[([ x~?!])\]/u.exec(line);
    if (current && mark) current.marks.push(mark[1]!);
  }
  flush();
  return tasks;
}

// The earliest not-started task, in document order, whose every dependency is
// done. A dependency that is missing from the runbook counts as not done.
export function nextExecutableTask(
  tasks: RunbookTask[],
): RunbookTask | undefined {
  const state = new Map(tasks.map((task) => [task.id, task.state]));
  return tasks.find(
    (task) =>
      task.state === "NOT_STARTED" &&
      task.dependsOn.every((id) => state.get(id) === "DONE"),
  );
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
    nextExecutable: nextExecutableTask(tasks),
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
    `Next executable (not started, every Depends on task done): ${
      summary.nextExecutable
        ? `${summary.nextExecutable.id} — ${summary.nextExecutable.title}`
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
