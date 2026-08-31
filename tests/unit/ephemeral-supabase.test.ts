import { describe, expect, it } from "vitest";

import {
  assertGitHubHostedLinuxRunner,
  createEphemeralSupabaseArguments,
  parseEphemeralSupabaseAction,
  parseEphemeralSupabaseStatus,
} from "../../scripts/lib/ephemeral-supabase";

const localDatabaseUrl = [
  "postgresql://postgres",
  "postgres@127.0.0.1:54322/postgres",
].join(":");

describe("ephemeral Supabase guard", () => {
  it("accepts only the GitHub-hosted Linux runner contract", () => {
    expect(() =>
      assertGitHubHostedLinuxRunner({
        GITHUB_ACTIONS: "true",
        RUNNER_ENVIRONMENT: "github-hosted",
        RUNNER_OS: "Linux",
      }),
    ).not.toThrow();

    for (const input of [
      {},
      {
        GITHUB_ACTIONS: "true",
        RUNNER_ENVIRONMENT: "self-hosted",
        RUNNER_OS: "Linux",
      },
      {
        GITHUB_ACTIONS: "true",
        RUNNER_ENVIRONMENT: "github-hosted",
        RUNNER_OS: "Windows",
      },
    ]) {
      expect(() => assertGitHubHostedLinuxRunner(input)).toThrow(
        "Disposable Supabase commands require a GitHub-hosted Linux runner.",
      );
    }
  });

  it("accepts only named lifecycle actions", () => {
    expect(parseEphemeralSupabaseAction(["reset"])).toBe("reset");
    expect(() => parseEphemeralSupabaseAction([])).toThrow();
    expect(() => parseEphemeralSupabaseAction(["reset", "preview"])).toThrow();
    expect(() => parseEphemeralSupabaseAction(["preview"])).toThrow();
  });

  it("uses explicit local-only CLI flags", () => {
    expect(createEphemeralSupabaseArguments("start")).toEqual(["start"]);
    expect(createEphemeralSupabaseArguments("reset")).toEqual([
      "db",
      "reset",
      "--local",
    ]);
    expect(createEphemeralSupabaseArguments("migrations")).toEqual([
      "migration",
      "list",
      "--local",
    ]);
    expect(createEphemeralSupabaseArguments("test")).toEqual([
      "test",
      "db",
      "--local",
    ]);
    expect(createEphemeralSupabaseArguments("advisors")).toEqual([
      "db",
      "lint",
      "--local",
      "--schema",
      "public,unimind_private",
      "--level",
      "warning",
      "--fail-on",
      "warning",
    ]);
    expect(createEphemeralSupabaseArguments("types")).toEqual([
      "gen",
      "types",
      "typescript",
      "--local",
      "--schema",
      "public",
    ]);
    expect(createEphemeralSupabaseArguments("stop")).toEqual([
      "stop",
      "--no-backup",
    ]);
  });

  it("parses local status without exposing values", () => {
    expect(
      parseEphemeralSupabaseStatus(
        [
          'API_URL="http://127.0.0.1:54321"',
          'ANON_KEY="synthetic-anon-key"',
          'SERVICE_ROLE_KEY="synthetic-service-role-key"',
          `DB_URL="${localDatabaseUrl}"`,
        ].join("\n"),
      ),
    ).toEqual({
      apiUrl: "http://127.0.0.1:54321",
      publishableKey: "synthetic-anon-key",
      serviceRoleKey: "synthetic-service-role-key",
      databaseUrl: localDatabaseUrl,
    });
  });

  it("rejects incomplete or non-loopback status", () => {
    expect(() =>
      parseEphemeralSupabaseStatus("API_URL=http://127.0.0.1"),
    ).toThrow("Disposable Supabase status is missing a required value.");
    expect(() =>
      parseEphemeralSupabaseStatus(
        [
          "API_URL=https://project.supabase.co",
          "ANON_KEY=synthetic-anon-key",
          "SERVICE_ROLE_KEY=synthetic-service-role-key",
          `DB_URL=${localDatabaseUrl}`,
        ].join("\n"),
      ),
    ).toThrow("Disposable Supabase API must remain on loopback HTTP.");
  });
});
