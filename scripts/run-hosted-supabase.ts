import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

import { readHostedSupabaseTarget } from "./lib/hosted-supabase-target";

const supportedActions = [
  "reset",
  "migrations",
  "types",
  "push-dry-run",
] as const;
type HostedSupabaseAction = (typeof supportedActions)[number];
const requestedAction = process.argv[2];

if (
  requestedAction === undefined ||
  !supportedActions.includes(requestedAction as HostedSupabaseAction)
) {
  throw new Error(
    `Expected one hosted Supabase action: ${supportedActions.join(", ")}.`,
  );
}
const action = requestedAction as HostedSupabaseAction;

const target = readHostedSupabaseTarget(process.env, {
  requireResetConfirmation: action === "reset",
});
const supabaseCli = path.resolve("node_modules/supabase/dist/supabase.js");

const actionArguments: Record<HostedSupabaseAction, string[]> = {
  reset: ["db", "reset", "--project-ref", target.projectRef, "--yes"],
  migrations: ["migration", "list", "--project-ref", target.projectRef],
  types: [
    "gen",
    "types",
    "typescript",
    "--project-id",
    target.projectRef,
    "--schema",
    "public",
  ],
  "push-dry-run": [
    "db",
    "push",
    "--project-ref",
    target.projectRef,
    "--dry-run",
  ],
};

const capturesTypes = action === "types";
const result = spawnSync(
  process.execPath,
  [supabaseCli, ...actionArguments[action]],
  {
    cwd: process.cwd(),
    encoding: capturesTypes ? "utf8" : undefined,
    stdio: capturesTypes ? ["ignore", "pipe", "inherit"] : "inherit",
    windowsHide: true,
  },
);

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
