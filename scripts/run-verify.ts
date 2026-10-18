// Local verification runner for `pnpm check` and `pnpm verify`.
//
// `verify:ci` in package.json stays the canonical component list (the CI
// workflow policy audits it). This runner reads that list, runs the cheap
// static components concurrently, builds before the browser suites so a
// build failure appears early, and never calls a bare `pnpm` (which is
// missing when only corepack is on PATH). It stops at the first failure and
// reports every unrun component.
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { availableParallelism } from "node:os";

import {
  planVerification,
  verifyCiComponents,
  type VerificationProfile,
} from "./lib/verification-plan";

type Outcome = {
  component: string;
  status: "passed" | "failed" | "not run";
  milliseconds: number;
};

const profile = (process.argv[2] ?? "verify") as VerificationProfile;
if (profile !== "verify" && profile !== "check")
  throw new Error("Usage: run-verify.ts [verify|check]");

const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};
const stages = planVerification(
  profile,
  verifyCiComponents(manifest.scripts["verify:ci"] ?? ""),
);
const concurrency = Math.max(1, Math.min(4, availableParallelism() - 1));

// pnpm exports its own entry point to the scripts it runs: a JavaScript
// file under corepack, the executable itself for a standalone pnpm. Fall
// back to corepack when neither is available.
function command(component: string): [string, string[]] {
  const execPath = process.env.npm_execpath;
  if (execPath !== undefined && /pnpm[^/\\]*\.(?:c|m)?js$/u.test(execPath))
    return [process.execPath, [execPath, "run", component]];
  if (execPath !== undefined && /pnpm(?:\.exe)?$/iu.test(execPath))
    return [execPath, ["run", component]];
  return [
    process.platform === "win32" ? "corepack.cmd" : "corepack",
    ["pnpm", "run", component],
  ];
}

function run(component: string, buffered: boolean): Promise<Outcome> {
  const started = Date.now();
  const [file, args] = command(component);
  return new Promise((resolve) => {
    const child = spawn(file, args, {
      stdio: buffered ? ["ignore", "pipe", "pipe"] : "inherit",
      env: process.env,
      shell: process.platform === "win32" && file.endsWith(".cmd"),
      windowsHide: true,
    });
    const chunks: Buffer[] = [];
    child.stdout?.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.stderr?.on("data", (chunk: Buffer) => chunks.push(chunk));
    const finish = (code: number | null) => {
      const status = code === 0 ? "passed" : "failed";
      if (buffered) {
        process.stdout.write(`\n=== ${component} (${status})\n`);
        process.stdout.write(Buffer.concat(chunks));
      }
      resolve({ component, status, milliseconds: Date.now() - started });
    };
    child.once("error", () => finish(1));
    // "close" fires after the output streams end, so no diagnostics are lost.
    child.once("close", finish);
  });
}

async function runStage(
  components: readonly string[],
  parallel: boolean,
): Promise<Outcome[]> {
  if (!parallel) {
    const outcomes: Outcome[] = [];
    for (const component of components) {
      process.stdout.write(`\n=== ${component}\n`);
      const outcome = await run(component, false);
      outcomes.push(outcome);
      if (outcome.status === "failed") break;
    }
    return outcomes;
  }
  const queue = [...components];
  const outcomes: Outcome[] = [];
  let failed = false;
  const worker = async () => {
    for (let next = queue.shift(); next !== undefined; next = queue.shift()) {
      if (failed) return;
      const outcome = await run(next, true);
      outcomes.push(outcome);
      if (outcome.status === "failed") failed = true;
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return outcomes;
}

const started = Date.now();
const results: Outcome[] = [];
for (const stage of stages) {
  const outcomes = await runStage(stage.components, stage.parallel);
  results.push(...outcomes);
  if (outcomes.some((outcome) => outcome.status === "failed")) break;
}
const ran = new Set(results.map((outcome) => outcome.component));
for (const stage of stages)
  for (const component of stage.components)
    if (!ran.has(component))
      results.push({ component, status: "not run", milliseconds: 0 });

const seconds = (milliseconds: number) =>
  `${(milliseconds / 1000).toFixed(1)}s`.padStart(8);
process.stdout.write(`\n${profile} summary\n`);
for (const outcome of results)
  process.stdout.write(
    `${outcome.status.padEnd(8)} ${seconds(outcome.milliseconds)}  ${outcome.component}\n`,
  );
process.stdout.write(`total    ${seconds(Date.now() - started)}\n`);
process.exitCode = results.every((outcome) => outcome.status === "passed")
  ? 0
  : 1;
