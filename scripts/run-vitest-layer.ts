import { mkdirSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const layers = [
  "unit",
  "integration",
  "security",
  "evaluation",
  "load",
] as const;
type VitestLayer = (typeof layers)[number];

const requestedLayer = process.argv[2];
if (
  requestedLayer !== "all" &&
  !layers.includes(requestedLayer as VitestLayer)
) {
  throw new Error(`Expected one test layer or all: ${layers.join(", ")}.`);
}
// "all" runs every layer in one Vitest process; layers with
// fileParallelism: false still run their files one at a time.
const layer = requestedLayer as VitestLayer | "all";
const projects = layer === "all" ? layers : [layer];
const filters = process.argv.slice(3).filter((argument) => argument !== "--");
const reportDirectory = path.resolve("test-results/vitest");
mkdirSync(reportDirectory, { recursive: true });

const vitestBinary = path.resolve("node_modules/vitest/vitest.mjs");
const result = spawnSync(
  process.execPath,
  [
    vitestBinary,
    "run",
    ...projects.flatMap((project) => ["--project", project]),
    ...filters,
    "--reporter=default",
    "--reporter=json",
    `--outputFile.json=${path.join(reportDirectory, `${layer}.json`)}`,
  ],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  },
);

if (result.error !== undefined) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(
    `Test layer '${layer}' failed with status ${String(result.status)}.`,
  );
}
