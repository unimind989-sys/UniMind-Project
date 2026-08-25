import { describe, expect, it } from "vitest";

import { createHostedSupabaseArguments } from "../../scripts/lib/hosted-supabase-command";

const target = {
  environment: "development" as const,
  projectRef: "abcdefghijklmnopqrst",
};

describe("hosted Supabase command arguments", () => {
  it("marks a project-ref reset as explicitly linked", () => {
    expect(createHostedSupabaseArguments("reset", target)).toEqual([
      "db",
      "reset",
      "--linked",
      "--project-ref",
      target.projectRef,
      "--yes",
    ]);
  });

  it("keeps type generation scoped to the public schema", () => {
    expect(createHostedSupabaseArguments("types", target)).toEqual([
      "gen",
      "types",
      "typescript",
      "--project-id",
      target.projectRef,
      "--schema",
      "public",
    ]);
  });
});
