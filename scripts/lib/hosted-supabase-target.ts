import { createHash } from "node:crypto";

const allowedEnvironments = ["development", "ci"] as const;

const approvedProjectFingerprints: Readonly<
  Record<HostedDatabaseEnvironment, string>
> = {
  development: "sha256:5575d1c3d806",
  ci: "sha256:6ad364ad022a",
};

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

export function createHostedProjectFingerprint(projectRef: string): string {
  return `sha256:${createHash("sha256").update(projectRef).digest("hex").slice(0, 12)}`;
}

export function assertApprovedHostedSupabaseTarget(
  target: HostedSupabaseTarget,
): void {
  const actualFingerprint = createHostedProjectFingerprint(target.projectRef);
  const approvedFingerprint = approvedProjectFingerprints[target.environment];

  if (actualFingerprint !== approvedFingerprint) {
    throw new Error(
      "Hosted Supabase target does not match the approved environment fingerprint.",
    );
  }
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
