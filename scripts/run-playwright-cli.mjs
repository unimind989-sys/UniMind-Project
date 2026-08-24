import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const packageRoot = path.dirname(
  require.resolve("@playwright/cli/package.json"),
);
const cliPath = path.join(packageRoot, "playwright-cli.js");
const result = spawnSync(
  process.execPath,
  [cliPath, ...process.argv.slice(2)],
  {
    env: { ...process.env, NO_UPDATE_NOTIFIER: "1" },
    stdio: "inherit",
  },
);

if (result.error) {
  throw result.error;
}

if (result.signal) {
  throw new Error(`playwright-cli exited on signal ${result.signal}`);
}

process.exitCode = result.status ?? 1;
