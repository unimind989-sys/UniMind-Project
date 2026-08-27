import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  assertGitHubHostedLinuxRunner,
  createEphemeralSupabaseArguments,
  parseEphemeralSupabaseAction,
  parseEphemeralSupabaseStatus,
  type EphemeralSupabaseAction,
} from "./lib/ephemeral-supabase";
import { formatGeneratedDatabaseTypes } from "./lib/generated-database-types";

assertGitHubHostedLinuxRunner(process.env);
const action = parseEphemeralSupabaseAction(process.argv.slice(2));
const supabaseCli = path.resolve("node_modules/supabase/dist/supabase.js");

type CommandResult = Readonly<{
  stdout: string;
}>;

function runCli(arguments_: readonly string[]): CommandResult {
  const result = spawnSync(process.execPath, [supabaseCli, ...arguments_], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error !== undefined || result.status !== 0) {
    throw new Error(
      `Disposable Supabase action failed with status ${String(result.status)}.`,
    );
  }
  return { stdout: String(result.stdout) };
}

function readStatus() {
  return parseEphemeralSupabaseStatus(runCli(["status", "-o", "env"]).stdout);
}

function runAuthIntegration(): void {
  const status = readStatus();
  const inheritedNames = new Set([
    "CI",
    "GITHUB_ACTIONS",
    "HOME",
    "LANG",
    "PATH",
    "RUNNER_ENVIRONMENT",
    "RUNNER_OS",
    "TEMP",
    "TMP",
  ]);
  const inheritedEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => inheritedNames.has(name)),
  );
  const syntheticServerCredential = [
    "synthetic",
    "ephemeral",
    "auth",
    "credential",
  ].join("-");
  const childEnvironment: NodeJS.ProcessEnv = {
    ...inheritedEnvironment,
    NODE_ENV: "test",
    NODE_OPTIONS: "--dns-result-order=ipv4first",
    NEXT_PUBLIC_SUPABASE_URL: status.apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.publishableKey,
    NEXT_PUBLIC_RELEASE_ID: "ephemeral-database-auth-integration",
    NEXT_PUBLIC_TELEMETRY_ENABLED: "false",
    DATABASE_URL: status.databaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: status.serviceRoleKey,
    RAW_STORAGE_CREDENTIAL: syntheticServerCredential,
    PROCESSED_STORAGE_CREDENTIAL: syntheticServerCredential,
    QUEUE_SIGNING_SECRET: syntheticServerCredential,
    PROVIDER_MODE: "mock",
    APPROVED_PROVIDER_BUDGET_MINOR: "0",
    GENERATION_PROVIDER_ENABLED: "false",
    EMBEDDING_PROVIDER_ENABLED: "false",
    TRANSCRIPTION_PROVIDER_ENABLED: "false",
    UNIMIND_DATABASE_AUTH_TEST: "true",
  };
  const vitestBinary = path.resolve("node_modules/vitest/vitest.mjs");
  const result = spawnSync(
    process.execPath,
    [vitestBinary, "run", "--project", "integration"],
    {
      cwd: process.cwd(),
      env: childEnvironment,
      stdio: "inherit",
    },
  );
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `Disposable Auth integration failed with status ${String(result.status)}.`,
    );
  }
}

async function execute(action_: EphemeralSupabaseAction): Promise<void> {
  if (action_ === "auth") {
    runAuthIntegration();
    return;
  }
  const result = runCli(createEphemeralSupabaseArguments(action_));
  if (action_ === "types") {
    writeFileSync(
      path.resolve("src/types/database.generated.ts"),
      await formatGeneratedDatabaseTypes(result.stdout),
      "utf8",
    );
  }
}

await execute(action);
process.stdout.write(`Disposable Supabase action passed: ${action}.\n`);
