import { spawnSync } from "node:child_process";
import path from "node:path";

import { parseHostedAuthCommand } from "./lib/hosted-auth-command";
import {
  readHostedSupabaseEnvironmentProfile,
  readHostedSupabaseProfile,
} from "./lib/hosted-supabase-profile";
import { readApprovedHostedSupabaseTarget } from "./lib/hosted-supabase-target";
import {
  createProjectApiKeysCurlRequest,
  parseProjectServiceRoleKeyJson,
} from "./lib/supabase-management-api";

const command = parseHostedAuthCommand(process.argv.slice(2));
const profile =
  command.profileSource === "environment"
    ? readHostedSupabaseEnvironmentProfile(command.environment)
    : readHostedSupabaseProfile(command.environment);
const target = readApprovedHostedSupabaseTarget(profile, {
  requireResetConfirmation: true,
});

const projectUrl = profile.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = profile.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const accessToken = profile.SUPABASE_ACCESS_TOKEN;
if (
  projectUrl === undefined ||
  publishableKey === undefined ||
  accessToken === undefined
) {
  throw new Error(`Hosted ${target.environment} Auth profile is incomplete.`);
}
if (new URL(projectUrl).hostname !== `${target.projectRef}.supabase.co`) {
  throw new Error("Hosted Auth URL does not match the guarded project target.");
}

const supabaseCli = path.resolve("node_modules/supabase/dist/supabase.js");
const apiKeyResult = spawnSync(
  process.execPath,
  [
    supabaseCli,
    "projects",
    "api-keys",
    "--project-ref",
    target.projectRef,
    "--reveal",
    "--output",
    "json",
    "--dns-resolver",
    "https",
  ],
  {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      SUPABASE_ACCESS_TOKEN: accessToken,
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

let serviceRoleKey: string;
if (apiKeyResult.error === undefined && apiKeyResult.status === 0) {
  serviceRoleKey = parseProjectServiceRoleKeyJson(String(apiKeyResult.stdout));
} else {
  const curlExecutable = process.platform === "win32" ? "curl.exe" : "curl";
  const curlRequest = createProjectApiKeysCurlRequest(
    target.projectRef,
    accessToken,
  );
  const curlResult = spawnSync(curlExecutable, curlRequest.arguments, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    input: curlRequest.stdin,
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  });
  if (curlResult.error !== undefined || curlResult.status !== 0) {
    throw new Error(
      "Supabase API-key lookup failed through CLI and HTTPS fallback.",
    );
  }
  serviceRoleKey = parseProjectServiceRoleKeyJson(String(curlResult.stdout));
}
const inheritedNames = new Set([
  "COMSPEC",
  "NUMBER_OF_PROCESSORS",
  "PATH",
  "PATHEXT",
  "PROCESSOR_ARCHITECTURE",
  "SYSTEMROOT",
  "TEMP",
  "TMP",
  "WINDIR",
]);
const inheritedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => inheritedNames.has(name)),
);
const syntheticServerCredential = [
  "synthetic",
  "hosted",
  "auth",
  "credential",
].join("-");
const childEnvironment: NodeJS.ProcessEnv = {
  ...inheritedEnvironment,
  NODE_ENV: "test",
  NODE_OPTIONS: "--use-system-ca --dns-result-order=ipv4first",
  NEXT_PUBLIC_SUPABASE_URL: projectUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  NEXT_PUBLIC_RELEASE_ID: `hosted-auth-${target.environment}-integration`,
  NEXT_PUBLIC_TELEMETRY_ENABLED: "false",
  DATABASE_URL:
    "postgresql://synthetic:synthetic@db.synthetic.invalid:5432/auth_test",
  SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
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
    windowsHide: true,
  },
);

if (result.error !== undefined) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(
    `Hosted Auth integration failed with status ${String(result.status)}.`,
  );
}
