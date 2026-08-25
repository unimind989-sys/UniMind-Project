import { describe, expect, it } from "vitest";

import { parseHostedSupabaseMetadata } from "../../scripts/lib/hosted-supabase-metadata";

const validRow = {
  postgres_version: "17.6",
  vector_version: "0.8.0",
  pgcrypto_version: "1.3",
  fixture_count: "3",
  canary_count: "3",
  anon_schema_usage: false,
  authenticated_schema_usage: false,
};

describe("hosted Supabase metadata response", () => {
  it.each([[validRow], { result: [validRow] }])(
    "accepts a supported response shape",
    (payload) => {
      expect(parseHostedSupabaseMetadata(payload)).toEqual({
        postgresVersion: "17.6",
        vectorVersion: "0.8.0",
        pgcryptoVersion: "1.3",
        fixtureCount: 3,
        canaryCount: 3,
        privateSchemaDenied: true,
      });
    },
  );

  it("rejects a missing required extension", () => {
    expect(() =>
      parseHostedSupabaseMetadata([{ ...validRow, vector_version: "missing" }]),
    ).toThrow("required hosted Supabase extension is missing");
  });

  it("rejects incomplete synthetic fixtures", () => {
    expect(() =>
      parseHostedSupabaseMetadata([{ ...validRow, fixture_count: "2" }]),
    ).toThrow("synthetic foundation fixtures are incomplete");
  });

  it("rejects an exposed private schema", () => {
    expect(() =>
      parseHostedSupabaseMetadata([{ ...validRow, anon_schema_usage: true }]),
    ).toThrow("private schema has an exposed role grant");
  });

  it("rejects an unexpected response without echoing it", () => {
    expect(() =>
      parseHostedSupabaseMetadata({ secret: "sensitive-value" }),
    ).toThrow("invalid shape");

    try {
      parseHostedSupabaseMetadata({ secret: "sensitive-value" });
    } catch (error) {
      expect(String(error)).not.toContain("sensitive-value");
    }
  });
});
