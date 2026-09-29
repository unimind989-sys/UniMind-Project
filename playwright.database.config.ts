import { defineConfig } from "@playwright/test";
import {
  assertGitHubHostedLinuxRunner,
  parseEphemeralSupabaseStatus,
} from "./scripts/lib/ephemeral-supabase";
import base from "./playwright.config";

const inheritedServer = base.webServer;
if (inheritedServer === undefined || Array.isArray(inheritedServer)) {
  throw new Error(
    "Disposable browser gate requires one owned application server.",
  );
}

assertGitHubHostedLinuxRunner(process.env);
// Revalidate the ephemeral destination; never inherit a shared-environment URL.
const status = parseEphemeralSupabaseStatus(
  [
    `API_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
    `PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""}`,
    `SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
    `DB_URL=${process.env.DATABASE_URL ?? ""}`,
  ].join("\n"),
);

export default defineConfig({
  ...base,
  testDir: "./tests/e2e-database",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/e2e-database/results.json" }],
  ],
  outputDir: "test-results/e2e-database/artifacts",
  // Credentials and real session payloads must never enter report attachments.
  use: { ...base.use, trace: "off", screenshot: "off", video: "off" },
  webServer: {
    ...inheritedServer,
    command: "corepack pnpm exec tsx scripts/run-playwright-server.ts",
    url: "http://127.0.0.1:3100/login",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ...inheritedServer.env,
      NEXT_PUBLIC_SUPABASE_URL: status.apiUrl,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.publishableKey,
      SUPABASE_SERVICE_ROLE_KEY: status.serviceRoleKey,
      DATABASE_URL: status.databaseUrl,
      UNIMIND_E2E_PORT: "3100",
      APP_ORIGIN: "http://127.0.0.1:3100",
    },
  },
});
