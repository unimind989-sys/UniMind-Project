import { describe, expect, it } from "vitest";

import { readHostedSupabaseTarget } from "../../scripts/lib/hosted-supabase-target";

const projectRef = "abcdefghijklmnopqrst";

describe("hosted Supabase target guard", () => {
  it.each(["development", "ci"])("accepts the %s target", (environment) => {
    expect(
      readHostedSupabaseTarget({
        UNIMIND_DB_ENVIRONMENT: environment,
        UNIMIND_SUPABASE_PROJECT_REF: projectRef,
      }),
    ).toEqual({ environment, projectRef });
  });

  it.each(["local", "preview", "beta", "production"])(
    "rejects the %s environment",
    (environment) => {
      expect(() =>
        readHostedSupabaseTarget({
          UNIMIND_DB_ENVIRONMENT: environment,
          UNIMIND_SUPABASE_PROJECT_REF: projectRef,
        }),
      ).toThrow("development or ci");
    },
  );

  it("rejects a malformed or missing project reference", () => {
    expect(() =>
      readHostedSupabaseTarget({
        UNIMIND_DB_ENVIRONMENT: "development",
        UNIMIND_SUPABASE_PROJECT_REF: "preview-project",
      }),
    ).toThrow("20-character lowercase");
  });

  it("requires the exact target-specific reset confirmation", () => {
    const environment = {
      UNIMIND_DB_ENVIRONMENT: "development",
      UNIMIND_SUPABASE_PROJECT_REF: projectRef,
    };

    expect(() =>
      readHostedSupabaseTarget(environment, {
        requireResetConfirmation: true,
      }),
    ).toThrow("UNIMIND_DB_RESET_CONFIRMATION");

    expect(
      readHostedSupabaseTarget(
        {
          ...environment,
          UNIMIND_DB_RESET_CONFIRMATION: `reset:development:${projectRef}`,
        },
        { requireResetConfirmation: true },
      ),
    ).toEqual({ environment: "development", projectRef });
  });
});
