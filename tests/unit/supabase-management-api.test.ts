import { describe, expect, it } from "vitest";

import {
  parseProjectServiceRoleKey,
  parseProjectServiceRoleKeyJson,
  SupabaseManagementApiError,
} from "../../scripts/lib/supabase-management-api";

const serviceRoleKey = "synthetic-service-role-key";

describe("Supabase Management API key parser", () => {
  it("returns only the service-role key from captured CLI JSON", () => {
    expect(
      parseProjectServiceRoleKey([
        {
          id: "anon",
          name: "anon",
          api_key: "synthetic-publishable-key",
        },
        {
          id: "service_role",
          name: "service_role",
          api_key: serviceRoleKey,
        },
      ]),
    ).toBe(serviceRoleKey);
  });

  it.each([
    null,
    {},
    [],
    [
      {
        id: "anon",
        name: "anon",
        api_key: "synthetic-publishable-key",
      },
    ],
  ])("rejects malformed or non-privileged API-key output", (body) => {
    expect(() => parseProjectServiceRoleKey(body)).toThrow(
      SupabaseManagementApiError,
    );
  });

  it("does not include captured values in an error", () => {
    const providerValue = "sensitive-provider-response";

    try {
      parseProjectServiceRoleKey([
        {
          id: "unexpected",
          api_key: providerValue,
        },
      ]);
      throw new Error("Expected the API-key parser to fail.");
    } catch (error) {
      expect(String(error)).not.toContain(providerValue);
    }
  });
  it("parses a captured JSON response through the non-disclosing seam", () => {
    expect(
      parseProjectServiceRoleKeyJson(
        JSON.stringify([
          {
            id: "service_role",
            api_key: serviceRoleKey,
          },
        ]),
      ),
    ).toBe(serviceRoleKey);
  });

  it("does not echo malformed JSON in an error", () => {
    const malformedBody = '{"api_key":"sensitive-response-fragment"';

    try {
      parseProjectServiceRoleKeyJson(malformedBody);
      throw new Error("Expected malformed JSON to fail.");
    } catch (error) {
      expect(error).toBeInstanceOf(SupabaseManagementApiError);
      expect(String(error)).not.toContain("sensitive-response-fragment");
    }
  });
});
