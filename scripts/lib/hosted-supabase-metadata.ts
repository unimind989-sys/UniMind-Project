export const hostedSupabaseMetadataQuery = `
select
  current_setting('server_version') as postgres_version,
  coalesce(
    (select extension.extversion from pg_catalog.pg_extension as extension where extension.extname = 'vector'),
    'missing'
  ) as vector_version,
  coalesce(
    (select extension.extversion from pg_catalog.pg_extension as extension where extension.extname = 'pgcrypto'),
    'missing'
  ) as pgcrypto_version,
  (select count(*)::text from unimind_private.synthetic_foundation_fixture) as fixture_count,
  (
    select count(distinct fixture.leakage_canary)::text
    from unimind_private.synthetic_foundation_fixture as fixture
  ) as canary_count,
  pg_catalog.has_schema_privilege('anon', 'unimind_private', 'usage') as anon_schema_usage,
  pg_catalog.has_schema_privilege('authenticated', 'unimind_private', 'usage') as authenticated_schema_usage;
`;

export interface HostedSupabaseMetadata {
  postgresVersion: string;
  vectorVersion: string;
  pgcryptoVersion: string;
  fixtureCount: number;
  canaryCount: number;
  privateSchemaDenied: boolean;
}

type MetadataRow = {
  postgres_version?: unknown;
  vector_version?: unknown;
  pgcrypto_version?: unknown;
  fixture_count?: unknown;
  canary_count?: unknown;
  anon_schema_usage?: unknown;
  authenticated_schema_usage?: unknown;
};

export function parseHostedSupabaseMetadata(
  payload: unknown,
): HostedSupabaseMetadata {
  const rows = Array.isArray(payload)
    ? payload
    : typeof payload === "object" &&
        payload !== null &&
        "result" in payload &&
        Array.isArray(payload.result)
      ? payload.result
      : null;

  const row = rows?.[0] as MetadataRow | undefined;
  if (
    typeof row?.postgres_version !== "string" ||
    typeof row.vector_version !== "string" ||
    typeof row.pgcrypto_version !== "string" ||
    typeof row.fixture_count !== "string" ||
    typeof row.canary_count !== "string" ||
    typeof row.anon_schema_usage !== "boolean" ||
    typeof row.authenticated_schema_usage !== "boolean"
  ) {
    throw new Error("Hosted Supabase metadata response has an invalid shape.");
  }
  if (row.vector_version === "missing" || row.pgcrypto_version === "missing") {
    throw new Error("A required hosted Supabase extension is missing.");
  }
  const fixtureCount = Number.parseInt(row.fixture_count, 10);
  const canaryCount = Number.parseInt(row.canary_count, 10);
  if (fixtureCount !== 3 || canaryCount !== 3) {
    throw new Error(
      "Hosted Supabase synthetic foundation fixtures are incomplete.",
    );
  }
  if (row.anon_schema_usage || row.authenticated_schema_usage) {
    throw new Error(
      "Hosted Supabase private schema has an exposed role grant.",
    );
  }

  return {
    postgresVersion: row.postgres_version,
    vectorVersion: row.vector_version,
    pgcryptoVersion: row.pgcrypto_version,
    fixtureCount,
    canaryCount,
    privateSchemaDenied: true,
  };
}
