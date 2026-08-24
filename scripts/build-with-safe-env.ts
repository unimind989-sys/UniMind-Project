import { spawnSync } from "node:child_process";
import path from "node:path";

import { parseServerEnvironment } from "../src/lib/config/env.schema";

const syntheticCredential = ["synthetic", "ci", "credential", "only"].join("-");
const safeEnvironment = {
  NODE_ENV: "production",
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: syntheticCredential,
  NEXT_PUBLIC_RELEASE_ID: "ci-verification",
  NEXT_PUBLIC_TELEMETRY_ENABLED: "false",
  DATABASE_URL:
    "postgresql://synthetic:synthetic@db.synthetic.invalid:5432/synthetic_ci",
  SUPABASE_SERVICE_ROLE_KEY: syntheticCredential,
  RAW_STORAGE_CREDENTIAL: syntheticCredential,
  PROCESSED_STORAGE_CREDENTIAL: syntheticCredential,
  QUEUE_SIGNING_SECRET: syntheticCredential,
  PROVIDER_MODE: "mock",
  APPROVED_PROVIDER_BUDGET_MINOR: "0",
  GENERATION_PROVIDER_ENABLED: "false",
  EMBEDDING_PROVIDER_ENABLED: "false",
  TRANSCRIPTION_PROVIDER_ENABLED: "false",
} as const;

parseServerEnvironment(safeEnvironment);

const inheritedEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(
    ([name]) =>
      !name.startsWith("NEXT_PUBLIC_") && !name.endsWith("_PROVIDER_API_KEY"),
  ),
);
const nextBinary = path.resolve("node_modules/next/dist/bin/next");
const childEnvironment: NodeJS.ProcessEnv = {
  ...inheritedEnvironment,
  ...safeEnvironment,
};
const result = spawnSync(process.execPath, [nextBinary, "build"], {
  cwd: process.cwd(),
  env: childEnvironment,
  stdio: "inherit",
});

if (result.error !== undefined) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(
    `Safe-environment build failed with status ${String(result.status)}.`,
  );
}
