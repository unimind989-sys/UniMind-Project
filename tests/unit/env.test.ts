import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  createCachedEnvironmentReader,
  EnvironmentValidationError,
  parseClientEnvironment,
  parseServerEnvironment,
} from "../../src/lib/config/env.schema";

const syntheticCredential = ["synthetic", "test", "credential"].join("-");

function validEnvironment(): Record<string, string> {
  return {
    NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: syntheticCredential,
    NEXT_PUBLIC_RELEASE_ID: "unit-test",
    NEXT_PUBLIC_TELEMETRY_ENABLED: "false",
    DATABASE_URL:
      "postgresql://synthetic:synthetic@db.synthetic.invalid:5432/test",
    SUPABASE_SERVICE_ROLE_KEY: syntheticCredential,
    RAW_STORAGE_CREDENTIAL: syntheticCredential,
    PROCESSED_STORAGE_CREDENTIAL: syntheticCredential,
    QUEUE_SIGNING_SECRET: syntheticCredential,
    PROVIDER_MODE: "mock",
  };
}

function readExampleEnvironment(): Record<string, string> {
  return Object.fromEntries(
    readFileSync(".env.example", "utf8")
      .split(/\r?\n/u)
      .filter((line) => line !== "" && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

describe("environment contract", () => {
  it("keeps the copied example ready for a synthetic mock workstation", () => {
    const environment = readExampleEnvironment();

    expect(parseServerEnvironment(environment)).toMatchObject({
      NEXT_PUBLIC_RELEASE_ID: "workstation-mock",
      PROVIDER_MODE: "mock",
      APPROVED_PROVIDER_BUDGET_MINOR: 0,
      GENERATION_PROVIDER_ENABLED: false,
      EMBEDDING_PROVIDER_ENABLED: false,
      TRANSCRIPTION_PROVIDER_ENABLED: false,
    });
    expect(environment).not.toHaveProperty("UNIMIND_DB_ENVIRONMENT");
    expect(environment).not.toHaveProperty("SUPABASE_ACCESS_TOKEN");
  });

  it("parses a valid mock configuration with bounded defaults", () => {
    const environment = parseServerEnvironment(validEnvironment());

    expect(environment).toMatchObject({
      PROVIDER_MODE: "mock",
      APPROVED_PROVIDER_BUDGET_MINOR: 0,
      GENERATION_PROVIDER_ENABLED: false,
      MAX_MESSAGE_CHARACTERS: 12_000,
      MAX_UPLOAD_BYTES: 26_214_400,
      MAX_AUDIO_DURATION_SECONDS: 1_800,
      MAX_OUTPUT_TOKENS: 4_096,
      REQUEST_TIMEOUT_MS: 60_000,
      PROVIDER_CONCURRENCY: 4,
      PROVIDER_RETRY_COUNT: 3,
      DAILY_STUDENT_QUOTA: 50,
    });
  });

  it("parses the browser-safe subset", () => {
    expect(parseClientEnvironment(validEnvironment())).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: syntheticCredential,
      NEXT_PUBLIC_RELEASE_ID: "unit-test",
      NEXT_PUBLIC_TELEMETRY_ENABLED: false,
    });
  });

  it("accepts Vercel's exact injected observability config without exposing it", () => {
    const environment = {
      ...validEnvironment(),
      NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG:
        '{"speedInsights":{"scriptSrc":"/synthetic.js"}}',
    };

    expect(parseServerEnvironment(environment)).toBeDefined();
    expect(parseClientEnvironment(environment)).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: "https://synthetic.supabase.invalid",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: syntheticCredential,
      NEXT_PUBLIC_RELEASE_ID: "unit-test",
      NEXT_PUBLIC_TELEMETRY_ENABLED: false,
    });
  });

  it.each([
    ["missing", { DATABASE_URL: undefined }, "DATABASE_URL"],
    ["malformed", { MAX_OUTPUT_TOKENS: "unbounded" }, "MAX_OUTPUT_TOKENS"],
    ["out of range", { PROVIDER_CONCURRENCY: "0" }, "PROVIDER_CONCURRENCY"],
  ])(
    "rejects %s variables without disclosing their values",
    (_, change, name) => {
      const environment: Record<string, string | undefined> = {
        ...validEnvironment(),
        ...change,
      };
      const rejectedValue = environment[name];

      expect(() => parseServerEnvironment(environment)).toThrow(
        new EnvironmentValidationError([name]),
      );
      try {
        parseServerEnvironment(environment);
      } catch (error) {
        expect(String(error)).not.toContain(String(rejectedValue));
      }
    },
  );

  it("rejects any accidentally public secret name without disclosing its value", () => {
    const forbiddenValue = ["must", "never", "appear"].join("-");
    const environment = {
      ...validEnvironment(),
      NEXT_PUBLIC_SERVICE_ROLE_KEY: forbiddenValue,
    };

    expect(() => parseServerEnvironment(environment)).toThrow(
      "NEXT_PUBLIC_SERVICE_ROLE_KEY",
    );
    expect(() => parseServerEnvironment(environment)).not.toThrow(
      forbiddenValue,
    );
  });

  it("rejects a provider flag while provider mode is mock", () => {
    expect(() =>
      parseServerEnvironment({
        ...validEnvironment(),
        GENERATION_PROVIDER_ENABLED: "true",
      }),
    ).toThrow("GENERATION_PROVIDER_ENABLED");
  });

  it("requires an enable flag, matching key, and positive budget in real mode", () => {
    const realEnvironment = {
      ...validEnvironment(),
      PROVIDER_MODE: "real",
    };

    expect(() => parseServerEnvironment(realEnvironment)).toThrow(
      "APPROVED_PROVIDER_BUDGET_MINOR",
    );
    expect(() =>
      parseServerEnvironment({
        ...realEnvironment,
        APPROVED_PROVIDER_BUDGET_MINOR: "100",
        GENERATION_PROVIDER_ENABLED: "true",
      }),
    ).toThrow("GENERATION_PROVIDER_API_KEY");

    expect(
      parseServerEnvironment({
        ...realEnvironment,
        APPROVED_PROVIDER_BUDGET_MINOR: "100",
        GENERATION_PROVIDER_ENABLED: "true",
        GENERATION_PROVIDER_API_KEY: syntheticCredential,
      }).GENERATION_PROVIDER_ENABLED,
    ).toBe(true);
  });

  it("caches a validated environment after the first read", () => {
    const parse = vi.fn(() => parseServerEnvironment(validEnvironment()));
    const read = createCachedEnvironmentReader(parse);

    expect(read()).toBe(read());
    expect(parse).toHaveBeenCalledOnce();
  });
});
