export const ephemeralSupabaseActions = [
  "start",
  "upgrade",
  "reset",
  "migrations",
  "test",
  "advisors",
  "types",
  "auth",
  "stop",
] as const;

export type EphemeralSupabaseAction = (typeof ephemeralSupabaseActions)[number];

type EnvironmentInput = Readonly<Record<string, string | undefined>>;

export type EphemeralSupabaseStatus = Readonly<{
  apiUrl: string;
  publishableKey: string;
  serviceRoleKey: string;
  databaseUrl: string;
}>;

export function parseEphemeralSupabaseAction(
  arguments_: readonly string[],
): EphemeralSupabaseAction {
  if (
    arguments_.length !== 1 ||
    !ephemeralSupabaseActions.includes(arguments_[0] as EphemeralSupabaseAction)
  ) {
    throw new Error(
      `Expected one ephemeral Supabase action: ${ephemeralSupabaseActions.join(", ")}.`,
    );
  }
  return arguments_[0] as EphemeralSupabaseAction;
}

export function assertGitHubHostedLinuxRunner(input: EnvironmentInput): void {
  if (
    input.GITHUB_ACTIONS !== "true" ||
    input.RUNNER_ENVIRONMENT !== "github-hosted" ||
    input.RUNNER_OS !== "Linux"
  ) {
    throw new Error(
      "Disposable Supabase commands require a GitHub-hosted Linux runner.",
    );
  }
}

export function createEphemeralSupabaseArguments(
  action: Exclude<EphemeralSupabaseAction, "auth" | "upgrade">,
): readonly string[] {
  switch (action) {
    case "start":
      return ["start"];
    case "reset":
      return [
        "db",
        "reset",
        "--local",
        "--sql-paths",
        "./seed.sql",
        "--sql-paths",
        "./fixtures/wp02-synthetic.sql",
      ];
    case "migrations":
      return ["migration", "list", "--local"];
    case "test":
      return ["test", "db", "--local"];
    case "advisors":
      return [
        "db",
        "lint",
        "--local",
        "--schema",
        "public,unimind_private",
        "--level",
        "warning",
        "--fail-on",
        "warning",
      ];
    case "types":
      return ["gen", "types", "typescript", "--local", "--schema", "public"];
    case "stop":
      return ["stop", "--no-backup"];
  }
}

function unquote(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseEphemeralSupabaseStatus(
  source: string,
): EphemeralSupabaseStatus {
  const values = new Map<string, string>();
  for (const line of source.split(/\r?\n/u)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.+)$/u.exec(line.trim());
    if (match?.[1] !== undefined && match[2] !== undefined) {
      values.set(match[1], unquote(match[2].trim()));
    }
  }

  const apiUrl = values.get("API_URL");
  const publishableKey =
    values.get("PUBLISHABLE_KEY") ?? values.get("ANON_KEY");
  const serviceRoleKey = values.get("SERVICE_ROLE_KEY");
  const databaseUrl = values.get("DB_URL");
  if (
    apiUrl === undefined ||
    publishableKey === undefined ||
    serviceRoleKey === undefined ||
    databaseUrl === undefined
  ) {
    throw new Error("Disposable Supabase status is missing a required value.");
  }

  const url = new URL(apiUrl);
  if (
    url.protocol !== "http:" ||
    !["127.0.0.1", "localhost"].includes(url.hostname)
  ) {
    throw new Error("Disposable Supabase API must remain on loopback HTTP.");
  }
  if (
    publishableKey.length < 10 ||
    serviceRoleKey.length < 16 ||
    !databaseUrl.startsWith("postgresql://")
  ) {
    throw new Error("Disposable Supabase status contains an invalid value.");
  }

  return { apiUrl, publishableKey, serviceRoleKey, databaseUrl };
}
