import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "native-product-demo.spec.ts",
  timeout: 300_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/demo/results.json" }],
  ],
  outputDir: "test-results/demo/artifacts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3102",
    actionTimeout: 15_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "corepack pnpm demo 3102",
    url: "http://127.0.0.1:3102/login",
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
