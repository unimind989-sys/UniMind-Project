import { describe, expect, it } from "vitest";

import {
  nextExecutableTask,
  parseDependsOn,
  parseRunbookTasks,
} from "../../scripts/agent/status";

describe("parseDependsOn", () => {
  it("reads single IDs and expands ranges within one package", () => {
    expect(
      parseDependsOn(
        "**Depends on:** WP04-T12 to WP04-T14, WP03-T34. **Decision gates:** D-10. **Protected:** none.",
      ),
    ).toEqual(["WP04-T12", "WP04-T13", "WP04-T14", "WP03-T34"]);
  });

  it("ignores task IDs named after the decision gates", () => {
    expect(
      parseDependsOn(
        "**Depends on:** WP00-T18. **Decision gates:** none; WP04-T19 consumes it.",
      ),
    ).toEqual(["WP00-T18"]);
  });

  it("returns nothing for other lines or an empty dependency", () => {
    expect(parseDependsOn("- [ ] Depends on: WP01-T01")).toEqual([]);
    expect(
      parseDependsOn("**Depends on:** none. **Protected:** none."),
    ).toEqual([]);
  });
});

describe("nextExecutableTask", () => {
  const runbook = [
    "#### WP01-T01 — Done task",
    "- [x] Done.",
    "#### WP01-T02 — Blocked task",
    "**Depends on:** WP01-T01. **Decision gates:** D-01.",
    "- [?] Gate.",
    "#### WP01-T03 — Waits on the blocked task",
    "**Depends on:** WP01-T02.",
    "- [ ] Step.",
    "#### WP01-T04 — Depends on a missing task",
    "**Depends on:** WP09-T99.",
    "- [ ] Step.",
    "#### WP01-T05 — Executable",
    "**Depends on:** WP01-T01.",
    "- [ ] Step.",
  ].join("\n");

  it("skips tasks whose dependencies are blocked or missing", () => {
    const tasks = parseRunbookTasks(runbook);
    expect(tasks.find((task) => task.id === "WP01-T03")?.dependsOn).toEqual([
      "WP01-T02",
    ]);
    expect(nextExecutableTask(tasks)?.id).toBe("WP01-T05");
  });

  it("returns nothing when no task is executable", () => {
    const tasks = parseRunbookTasks(runbook).filter(
      (task) => task.id !== "WP01-T05",
    );
    expect(nextExecutableTask(tasks)).toBeUndefined();
  });
});
