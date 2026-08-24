const allowedEnvironments = ["development", "ci"] as const;

export type HostedDatabaseEnvironment = (typeof allowedEnvironments)[number];

export interface HostedSupabaseTarget {
  environment: HostedDatabaseEnvironment;
  projectRef: string;
}

type EnvironmentInput = Readonly<Record<string, string | undefined>>;

function requireValue(input: EnvironmentInput, name: string): string {
  const value = input[name]?.trim();

  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required hosted database variable: ${name}`);
  }
  return value;
}

export function readHostedSupabaseTarget(
  input: EnvironmentInput,
  options: { requireResetConfirmation?: boolean } = {},
): HostedSupabaseTarget {
  const environment = requireValue(input, "UNIMIND_DB_ENVIRONMENT");
  if (!allowedEnvironments.includes(environment as HostedDatabaseEnvironment)) {
    throw new Error(
      "UNIMIND_DB_ENVIRONMENT must be development or ci; preview and beta are forbidden.",
    );
  }

  const projectRef = requireValue(input, "UNIMIND_SUPABASE_PROJECT_REF");
  if (!/^[a-z]{20}$/.test(projectRef)) {
    throw new Error(
      "UNIMIND_SUPABASE_PROJECT_REF must be a 20-character lowercase Supabase project reference.",
    );
  }

  if (options.requireResetConfirmation === true) {
    const confirmation = requireValue(input, "UNIMIND_DB_RESET_CONFIRMATION");
    const expected = `reset:${environment}:${projectRef}`;
    if (confirmation !== expected) {
      throw new Error(
        "UNIMIND_DB_RESET_CONFIRMATION does not match the selected hosted database target.",
      );
    }
  }

  return {
    environment: environment as HostedDatabaseEnvironment,
    projectRef,
  };
}
