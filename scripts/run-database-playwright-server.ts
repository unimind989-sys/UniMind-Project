import { spawn } from "node:child_process";
import path from "node:path";
import {
  assertGitHubHostedLinuxRunner,
  parseEphemeralSupabaseStatus,
} from "./lib/ephemeral-supabase";

assertGitHubHostedLinuxRunner(process.env);
parseEphemeralSupabaseStatus(
  [
    `API_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}`,
    `PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""}`,
    `SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
    `DB_URL=${process.env.DATABASE_URL ?? ""}`,
  ].join("\n"),
);

// Real Auth responses need the production cache behavior. next dev deliberately
// replaces Cache-Control and cannot prove the deployed cookie-write policy.
async function next(arguments_: string[]): Promise<number> {
  const child = spawn(
    process.execPath,
    [path.resolve("node_modules/next/dist/bin/next"), ...arguments_],
    { stdio: "inherit", env: process.env, windowsHide: true },
  );
  const stop = () => child.kill("SIGTERM");
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
  return await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => {
      process.removeListener("SIGINT", stop);
      process.removeListener("SIGTERM", stop);
      resolve(code ?? 1);
    });
  });
}

const built = await next(["build"]);
process.exitCode =
  built === 0
    ? await next(["start", "--hostname", "127.0.0.1", "--port", "3100"])
    : built;
