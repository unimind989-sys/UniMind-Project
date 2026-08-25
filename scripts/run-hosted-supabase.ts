import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  createHostedSupabaseArguments,
  supportedHostedSupabaseActions,
  type HostedSupabaseAction,
} from "./lib/hosted-supabase-command";
import { readHostedSupabaseProfile } from "./lib/hosted-supabase-profile";
import { readHostedSupabaseTarget } from "./lib/hosted-supabase-target";

const requestedAction = process.argv[2];

if (
  requestedAction === undefined ||
  !supportedHostedSupabaseActions.includes(
    requestedAction as HostedSupabaseAction,
  )
) {
  throw new Error(
    `Expected one hosted Supabase action: ${supportedHostedSupabaseActions.join(", ")}.`,
  );
}
const action = requestedAction as HostedSupabaseAction;

const wrapperArguments = process.argv.slice(3);
if (wrapperArguments.length > 0) {
  if (
    wrapperArguments.length !== 2 ||
    wrapperArguments[0] !== "--environment" ||
    !["development", "ci"].includes(wrapperArguments[1] ?? "")
  ) {
    throw new Error("Expected --environment development or --environment ci.");
  }

  Object.assign(
    process.env,
    readHostedSupabaseProfile(wrapperArguments[1] as "development" | "ci"),
  );
}

const target = readHostedSupabaseTarget(process.env, {
  requireResetConfirmation: action === "reset",
});
const supabaseCli = path.resolve("node_modules/supabase/dist/supabase.js");

const actionArguments = createHostedSupabaseArguments(action, target);

const capturesTypes = action === "types";
const result = spawnSync(process.execPath, [supabaseCli, ...actionArguments], {
  cwd: process.cwd(),
  encoding: capturesTypes ? "utf8" : undefined,
  stdio: capturesTypes ? ["ignore", "pipe", "inherit"] : "inherit",
  windowsHide: true,
});

if (result.error !== undefined) {
  throw result.error;
}
if (result.status !== 0) {
  throw new Error(
    `Hosted Supabase ${action} failed with status ${String(result.status)}.`,
  );
}

if (capturesTypes) {
  writeFileSync(
    path.resolve("src/types/database.generated.ts"),
    String(result.stdout),
    "utf8",
  );
}
