import { defineConfig, devices } from "@playwright/test";

const reuseDemo =
  process.env.UNIMIND_DEMO_REUSE === "1" ||
  process.env.UNIMIND_FRONTEND_AUDIT === "1";
// Every demo test starts from its own sign-in in a fresh page, so tests are
// independent. Locally one worker is the default; CI passes --workers/--shard.
const workers = Number(process.env.PW_WORKERS ?? 1);

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
