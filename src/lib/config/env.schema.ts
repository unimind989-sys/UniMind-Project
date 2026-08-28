import { z } from "zod";

const allowedPublicNames = new Set([
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_RELEASE_ID",
  "NEXT_PUBLIC_TELEMETRY_ENABLED",
  // Vercel injects this exact build-time value for its optional observability
  // packages. UniMind does not consume it, and Zod strips it from our client
  // configuration while every other unexpected NEXT_PUBLIC_ name stays denied.
  "NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG",
]);

const booleanString = z
  .enum(["true", "false"])
  .transform((value) => value === "true");
const booleanStringWithDefault = z.preprocess(
  (value) => value ?? "false",
  booleanString,
);

const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
  NEXT_PUBLIC_RELEASE_ID: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,63}$/),
  NEXT_PUBLIC_TELEMETRY_ENABLED: booleanString,
});

const secretString = z.string().min(16);

const serverEnvironmentSchema = publicEnvironmentSchema
  .extend({
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: secretString,
    RAW_STORAGE_CREDENTIAL: secretString,
    PROCESSED_STORAGE_CREDENTIAL: secretString,
    QUEUE_SIGNING_SECRET: secretString,
    PROVIDER_MODE: z.enum(["mock", "real"]).default("mock"),
    APPROVED_PROVIDER_BUDGET_MINOR: z.coerce
      .number()
      .int()
      .min(0)
      .max(100_000_000)
      .default(0),
    GENERATION_PROVIDER_ENABLED: booleanStringWithDefault,
    GENERATION_PROVIDER_API_KEY: secretString.optional(),
    EMBEDDING_PROVIDER_ENABLED: booleanStringWithDefault,
    EMBEDDING_PROVIDER_API_KEY: secretString.optional(),
    TRANSCRIPTION_PROVIDER_ENABLED: booleanStringWithDefault,
    TRANSCRIPTION_PROVIDER_API_KEY: secretString.optional(),
    MAX_MESSAGE_CHARACTERS: z.coerce
      .number()
      .int()
      .min(1)
      .max(100_000)
      .default(12_000),
    MAX_UPLOAD_BYTES: z.coerce
      .number()
      .int()
      .min(1)
      .max(104_857_600)
      .default(26_214_400),
    MAX_AUDIO_DURATION_SECONDS: z.coerce
      .number()
      .int()
      .min(1)
      .max(14_400)
      .default(1_800),
    MAX_OUTPUT_TOKENS: z.coerce
      .number()
      .int()
      .min(1)
      .max(32_768)
      .default(4_096),
    REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(300_000)
      .default(60_000),
    PROVIDER_CONCURRENCY: z.coerce.number().int().min(1).max(32).default(4),
    PROVIDER_RETRY_COUNT: z.coerce.number().int().min(0).max(10).default(3),
    DAILY_STUDENT_QUOTA: z.coerce.number().int().min(1).max(1_000).default(50),
  })
  .superRefine((environment, context) => {
    const providerFlags = [
      [
        "GENERATION_PROVIDER_ENABLED",
        environment.GENERATION_PROVIDER_ENABLED,
        "GENERATION_PROVIDER_API_KEY",
        environment.GENERATION_PROVIDER_API_KEY,
      ],
      [
        "EMBEDDING_PROVIDER_ENABLED",
        environment.EMBEDDING_PROVIDER_ENABLED,
        "EMBEDDING_PROVIDER_API_KEY",
        environment.EMBEDDING_PROVIDER_API_KEY,
      ],
      [
        "TRANSCRIPTION_PROVIDER_ENABLED",
        environment.TRANSCRIPTION_PROVIDER_ENABLED,
        "TRANSCRIPTION_PROVIDER_API_KEY",
        environment.TRANSCRIPTION_PROVIDER_API_KEY,
      ],
    ] as const;
    const enabledProviders = providerFlags.filter(([, enabled]) => enabled);

    if (environment.PROVIDER_MODE === "mock") {
      for (const [flagName, enabled] of providerFlags) {
        if (enabled) {
          context.addIssue({
            code: "custom",
            path: [flagName],
            message: "Real provider flags require real provider mode.",
          });
        }
      }
      return;
    }

    if (environment.APPROVED_PROVIDER_BUDGET_MINOR <= 0) {
      context.addIssue({
        code: "custom",
        path: ["APPROVED_PROVIDER_BUDGET_MINOR"],
        message: "Real provider mode requires an approved budget.",
      });
    }
    if (enabledProviders.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["PROVIDER_MODE"],
        message: "Real provider mode requires an enabled provider.",
      });
    }
    for (const [, enabled, keyName, key] of providerFlags) {
      if (enabled && key === undefined) {
        context.addIssue({
          code: "custom",
          path: [keyName],
          message: "An enabled provider requires its server-only key.",
        });
      }
    }
  });

type EnvironmentInput = Readonly<Record<string, string | undefined>>;

export class EnvironmentValidationError extends Error {
  readonly variableNames: readonly string[];

  constructor(variableNames: readonly string[]) {
    super(`Invalid environment variables: ${variableNames.join(", ")}`);
    this.name = "EnvironmentValidationError";
    this.variableNames = variableNames;
  }
}

function rejectUnknownPublicNames(input: EnvironmentInput): void {
  const forbiddenNames = Object.keys(input)
    .filter(
      (name) =>
        name.startsWith("NEXT_PUBLIC_") && !allowedPublicNames.has(name),
    )
    .sort();

  if (forbiddenNames.length > 0) {
    throw new EnvironmentValidationError(forbiddenNames);
  }
}

function issueVariableNames(error: z.ZodError): readonly string[] {
  return [
    ...new Set(
      error.issues.map((issue) => {
        const name = issue.path[0];
        return typeof name === "string" ? name : "environment";
      }),
    ),
  ].sort();
}

function parseEnvironment<T>(schema: z.ZodType<T>, input: EnvironmentInput): T {
  rejectUnknownPublicNames(input);
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new EnvironmentValidationError(issueVariableNames(result.error));
  }
  return result.data;
}

export type ClientEnvironment = z.infer<typeof publicEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseClientEnvironment(
  input: EnvironmentInput,
): ClientEnvironment {
  return parseEnvironment(publicEnvironmentSchema, input);
}

export function parseServerEnvironment(
  input: EnvironmentInput,
): ServerEnvironment {
  return parseEnvironment(serverEnvironmentSchema, input);
}

export function createCachedEnvironmentReader<T>(parse: () => T): () => T {
  let cached: T | undefined;
  return () => {
    cached ??= parse();
    return cached;
  };
}
