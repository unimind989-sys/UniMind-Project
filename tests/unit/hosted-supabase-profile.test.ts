import { describe, expect, it } from "vitest";

import { parseHostedSupabaseProfile } from "../../scripts/lib/hosted-supabase-profile";

const validProfile = [
  "UNIMIND_DB_ENVIRONMENT=development",
  "UNIMIND_SUPABASE_PROJECT_REF=abcdefghijklmnopqrst",
  "UNIMIND_DB_RESET_CONFIRMATION=reset:development:abcdefghijklmnopqrst",
  "SUPABASE_ACCESS_TOKEN=synthetic=access=token",
  "SUPABASE_DB_PASSWORD=synthetic-password",
].join("\n");

describe("hosted Supabase profile parser", () => {
  it("loads required values without truncating embedded equals signs", () => {
    expect(parseHostedSupabaseProfile(validProfile)).toMatchObject({
      UNIMIND_DB_ENVIRONMENT: "development",
      SUPABASE_ACCESS_TOKEN: "synthetic=access=token",
    });
  });

  it("ignores blank lines and comments", () => {
    expect(
      parseHostedSupabaseProfile(`# local only\n\n${validProfile}\n`),
    ).toMatchObject({
      UNIMIND_SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
    });
  });

  it.each([
    "SUPABASE_ACCESS_TOKEN=",
    "SUPABASE_ACCESS_TOKEN=deleted",
    "SUPABASE_ACCESS_TOKEN=<TOKEN>",
  ])("rejects a missing or placeholder secret: %s", (replacement) => {
    expect(() =>
      parseHostedSupabaseProfile(
        validProfile.replace(
          "SUPABASE_ACCESS_TOKEN=synthetic=access=token",
          replacement,
        ),
      ),
    ).toThrow("SUPABASE_ACCESS_TOKEN");
  });

  it("rejects duplicate keys without disclosing their values", () => {
    expect(() =>
      parseHostedSupabaseProfile(
        `${validProfile}\nSUPABASE_DB_PASSWORD=another-secret`,
      ),
    ).toThrow("Duplicate hosted Supabase profile key: SUPABASE_DB_PASSWORD");
  });

  it("rejects malformed lines without echoing their content", () => {
    const secretValue = "not-a-key secret-material";
    expect(() =>
      parseHostedSupabaseProfile(`${validProfile}\n${secretValue}`),
    ).toThrow("Malformed hosted Supabase profile entry");

    try {
      parseHostedSupabaseProfile(`${validProfile}\n${secretValue}`);
    } catch (error) {
      expect(String(error)).not.toContain("secret-material");
    }
  });
});
