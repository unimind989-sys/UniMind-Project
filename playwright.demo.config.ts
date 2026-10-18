import { availableParallelism } from "node:os";
import { defineConfig, devices } from "@playwright/test";

const reuseDemo =
  process.env.UNIMIND_DEMO_REUSE === "1" ||
  process.env.UNIMIND_FRONTEND_AUDIT === "1";
// Every demo test starts from its own sign-in in a fresh page, so tests are
// independent. PW_WORKERS overrides the worker count (CI pins 2 per shard);
// locally the default leaves headroom for the dev server: 2 on 4 CPUs.
function demoWorkers(value = process.env.PW_WORKERS): number {
  if (value === undefined || value === "")
    return Math.max(1, Math.floor((availableParallelism() - 1) / 1.5));
  const workers = Number(value);
  if (!Number.isInteger(workers) || workers < 1)
    throw new Error("PW_WORKERS must be a positive integer.");
  return workers;
}
const workers = demoWorkers();

export default defineConfig({
  testDir: "./tests/e2e/demo",
  testMatch: "*.spec.ts",
  timeout: 300_000,
  expect: { timeout: 20_000 },
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/demo/results.json" }],
  ],
  outputDir: "test-results/demo/artifacts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: reuseDemo ? "http://127.0.0.1:3101" : "http://127.0.0.1:3102",
    actionTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: reuseDemo
    ? []
    : {
        command: "corepack pnpm demo 3102",
        url: "http://127.0.0.1:3102/login",
        reuseExistingServer: false,
        timeout: 300_000,
      },
});
