import { defineConfig, devices } from "@playwright/test";
import { resolvePlaywrightServerPort } from "./scripts/lib/playwright-server";

const syntheticPublicCredential = "synthetic-public-credential-only";
const syntheticServerCredential = "synthetic-server-credential-only";
const port = resolvePlaywrightServerPort(process.env.UNIMIND_E2E_PORT);
const baseURL = `http://127.0.0.1:${String(port)}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 15_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/e2e/results.json" }],
  ],
  outputDir: "test-results/e2e/artifacts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "corepack pnpm exec tsx scripts/run-playwright-server.ts",
    url: `${baseURL}/preview/learn?lang=en`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NODE_ENV: "development",
      NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: syntheticPublicCredential,
      NEXT_PUBLIC_RELEASE_ID: "e2e-synthetic",
      NEXT_PUBLIC_TELEMETRY_ENABLED: "false",
      APP_ORIGIN: baseURL,
      UNIMIND_E2E_PORT: String(port),
      DATABASE_URL:
        "postgresql://synthetic:synthetic@db.synthetic.invalid:5432/e2e",
      SUPABASE_SERVICE_ROLE_KEY: syntheticServerCredential,
      RAW_STORAGE_CREDENTIAL: syntheticServerCredential,
      PROCESSED_STORAGE_CREDENTIAL: syntheticServerCredential,
      QUEUE_SIGNING_SECRET: syntheticServerCredential,
      PROVIDER_MODE: "mock",
      APPROVED_PROVIDER_BUDGET_MINOR: "0",
      GENERATION_PROVIDER_ENABLED: "false",
      EMBEDDING_PROVIDER_ENABLED: "false",
      TRANSCRIPTION_PROVIDER_ENABLED: "false",
    },
  },
});
