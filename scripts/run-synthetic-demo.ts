import { runOwnedPlaywrightServer } from "./lib/playwright-server";

const rawPort = process.argv[2] ?? "3101";
if (!/^\d{4,5}$/u.test(rawPort) || Number(rawPort) > 65535)
  throw new Error("Use a valid local demo port.");
const env: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: "development",
  UNIMIND_SYNTHETIC_DEMO: "true",
  APP_ORIGIN: `http://127.0.0.1:${rawPort}`,
  UNIMIND_E2E_PORT: rawPort,
  NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "synthetic-public-credential-only",
  NEXT_PUBLIC_RELEASE_ID: "synthetic-product-demo",
  NEXT_PUBLIC_TELEMETRY_ENABLED: "false",
  DATABASE_URL:
    "postgresql://synthetic:synthetic@db.synthetic.invalid:5432/synthetic_demo",
  SUPABASE_SERVICE_ROLE_KEY: "synthetic-server-credential-only",
  RAW_STORAGE_CREDENTIAL: "synthetic-server-credential-only",
  PROCESSED_STORAGE_CREDENTIAL: "synthetic-server-credential-only",
  QUEUE_SIGNING_SECRET: "synthetic-server-credential-only",
  PROVIDER_MODE: "mock",
  APPROVED_PROVIDER_BUDGET_MINOR: "0",
  GENERATION_PROVIDER_ENABLED: "false",
  EMBEDDING_PROVIDER_ENABLED: "false",
  TRANSCRIPTION_PROVIDER_ENABLED: "false",
};
Object.assign(process.env, env);
process.exitCode = await runOwnedPlaywrightServer();
