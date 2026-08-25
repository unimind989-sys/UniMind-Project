import type { HostedSupabaseTarget } from "./hosted-supabase-target";

export const supportedHostedSupabaseActions = [
  "reset",
  "migrations",
  "types",
  "push-dry-run",
] as const;

export type HostedSupabaseAction =
  (typeof supportedHostedSupabaseActions)[number];

export function createHostedSupabaseArguments(
  action: HostedSupabaseAction,
  target: HostedSupabaseTarget,
): string[] {
  const actionArguments: Record<HostedSupabaseAction, string[]> = {
    reset: [
      "db",
      "reset",
      "--linked",
      "--project-ref",
      target.projectRef,
      "--yes",
    ],
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

  return actionArguments[action];
}
