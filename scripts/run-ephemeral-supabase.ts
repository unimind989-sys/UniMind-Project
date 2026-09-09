import { spawn, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  assertGitHubHostedLinuxRunner,
  createEphemeralSupabaseArguments,
  parseEphemeralSupabaseAction,
  parseEphemeralSupabaseStatus,
  type EphemeralSupabaseAction,
} from "./lib/ephemeral-supabase";
import {
  findSupabaseContainer,
  parsePostgresRuntimeMetadata,
} from "./lib/ephemeral-supabase-metadata";
import { formatGeneratedDatabaseTypes } from "./lib/generated-database-types";
import { assertReasonableAvailabilityPlan } from "./lib/availability-query-plan";
import { assertReasonableRetrievalPlan } from "./lib/retrieval-query-plan";

assertGitHubHostedLinuxRunner(process.env);
const action = parseEphemeralSupabaseAction(process.argv.slice(2));
const supabaseCli = path.resolve("node_modules/supabase/dist/supabase.js");

type CommandResult = Readonly<{
  stdout: string;
}>;

function formatFailureOutput(stdout: unknown, stderr: unknown): string {
  const combined = [String(stdout ?? ""), String(stderr ?? "")]
    .filter((value) => value.trim().length > 0)
    .join("\n")
    .replace(
      /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,
      "[redacted-jwt]",
    )
    .replace(
      /((?:access|api|publishable|secret|service_role)[_-]?(?:key|token)\s*[=:]\s*)\S+/gi,
      "$1[redacted]",
    );

  return combined.length > 8_000 ? combined.slice(-8_000) : combined;
}

function runCli(arguments_: readonly string[]): CommandResult {
  const result = spawnSync(process.execPath, [supabaseCli, ...arguments_], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error !== undefined || result.status !== 0) {
    const diagnostic = formatFailureOutput(result.stdout, result.stderr);
    throw new Error(
      `Disposable Supabase action failed with status ${String(result.status)}.${
        diagnostic.length > 0 ? `\n${diagnostic}` : ""
      }`,
    );
  }
  return { stdout: String(result.stdout) };
}

function runProgram(
  program: string,
  arguments_: readonly string[],
): CommandResult {
  const result = spawnSync(program, arguments_, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error !== undefined || result.status !== 0) {
    throw new Error(
      `Disposable runtime metadata command failed with status ${String(result.status)}.`,
    );
  }
  return { stdout: String(result.stdout) };
}

function runProgramWithInput(
  program: string,
  arguments_: readonly string[],
  input: string,
): CommandResult {
  const result = spawnSync(program, arguments_, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    input,
    maxBuffer: 16 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.error !== undefined || result.status !== 0) {
    const diagnostic = formatFailureOutput(result.stdout, result.stderr);
    throw new Error(
      `Disposable query-plan command failed with status ${String(result.status)}.${
        diagnostic.length > 0 ? `\n${diagnostic}` : ""
      }`,
    );
  }
  return { stdout: String(result.stdout) };
}

function captureAvailabilityQueryPlan(): void {
  const inventory = runProgram("docker", [
    "ps",
    "--format",
    "{{.Names}}\t{{.Image}}",
  ]).stdout;
  const databaseContainer = findSupabaseContainer(inventory, "db");
  const query = readFileSync(
    path.resolve(
      "supabase/fixtures/query-plans/student_catalog_availability.sql",
    ),
    "utf8",
  );
  const rawPlan = runProgramWithInput(
    "docker",
    [
      "exec",
      "-i",
      databaseContainer.name,
      "psql",
      "--no-psqlrc",
      "--quiet",
      "--username",
      "postgres",
      "--dbname",
      "postgres",
      "--tuples-only",
      "--no-align",
      "--set",
      "ON_ERROR_STOP=1",
    ],
    query,
  ).stdout.trim();
  const planParts = rawPlan.split("WP02_T05_BODY_PLAN");
  if (planParts.length !== 2) {
    throw new Error(
      "Availability measurement must include invocation and SQL-body plans.",
    );
  }
  const planDocument: unknown = JSON.parse(planParts[0]!);
  const bodyPlanDocument: unknown = JSON.parse(planParts[1]!);
  mkdirSync(path.resolve("test-results"), { recursive: true });
  writeFileSync(
    path.resolve("test-results/student-catalog-availability-query-plan.json"),
    `${JSON.stringify(
      {
        schemaVersion: 2,
        scope: "wp02-t05-representative-synthetic",
        generatedUnits: 512,
        statement:
          "select id, cohort_id, availability_state from public.available_curriculum_units(false)",
        plan: planDocument,
        bodyPlanSource:
          "Installed pg_proc.prosrc prepared with admin_preview=$1, same authenticated caller and empty search_path",
        bodyPlan: bodyPlanDocument,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  // Preserve real measurement evidence even when the shape guard rejects it.
  assertReasonableAvailabilityPlan(planDocument, bodyPlanDocument);
}

function captureRetrievalQueryPlan(): void {
  const inventory = runProgram("docker", [
    "ps",
    "--format",
    "{{.Names}}\t{{.Image}}",
  ]).stdout;
  const databaseContainer = findSupabaseContainer(inventory, "db");
  const query = readFileSync(
    path.resolve(
      "supabase/fixtures/query-plans/authorized_hybrid_retrieval.sql",
    ),
    "utf8",
  );
  const rawPlan = runProgramWithInput(
    "docker",
    [
      "exec",
      "-i",
      databaseContainer.name,
      "psql",
      "--no-psqlrc",
      "--quiet",
      "--username",
      "postgres",
      "--dbname",
      "postgres",
      "--tuples-only",
      "--no-align",
      "--set",
      "ON_ERROR_STOP=1",
    ],
    query,
  ).stdout.trim();
  const planParts = rawPlan.split("WP02_T09_RETRIEVAL_BODY_PLAN");
  if (planParts.length !== 2) {
    throw new Error(
      "Retrieval measurement must include invocation and installed SQL-body plans.",
    );
  }
  const planDocument: unknown = JSON.parse(planParts[0]!);
  const bodyPlanDocument: unknown = JSON.parse(planParts[1]!);
  mkdirSync(path.resolve("test-results"), { recursive: true });
  writeFileSync(
    path.resolve("test-results/authorized-hybrid-retrieval-query-plan.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        scope: "wp02-t09-representative-synthetic",
        targetSegments: 513,
        distractorSegments: 4_097,
        resultLimit: 50,
        statement:
          "select * from unimind_private.retrieve_authorized_segments(<synthetic-scope>, '[1,0,0]', 'retrieval plan evidence', 50)",
        plan: planDocument,
        bodyPlanSource:
          "Installed pg_proc.prosrc RETURN QUERY body with reviewed synthetic arguments, measured in the same rolled-back transaction",
        bodyPlan: bodyPlanDocument,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  // Preserve real measurement evidence even when the shape guard rejects it.
  assertReasonableRetrievalPlan(planDocument, bodyPlanDocument);
}

function runPsqlConcurrently(
  databaseContainerName: string,
  queries: readonly string[],
): Promise<readonly string[]> {
  return Promise.all(
    queries.map(
      (query) =>
        new Promise<string>((resolve, reject) => {
          const child = spawn(
            "docker",
            [
              "exec",
              "-i",
              databaseContainerName,
              "psql",
              "--no-psqlrc",
              "--quiet",
              "--username",
              "postgres",
              "--dbname",
              "postgres",
              "--tuples-only",
              "--no-align",
              "--set",
              "ON_ERROR_STOP=1",
            ],
            {
              cwd: process.cwd(),
              env: process.env,
              stdio: ["pipe", "pipe", "pipe"],
            },
          );
          let stdout = "";
          let stderr = "";
          child.stdout.setEncoding("utf8");
          child.stderr.setEncoding("utf8");
          child.stdout.on("data", (chunk: string) => {
            stdout += chunk;
          });
          child.stderr.on("data", (chunk: string) => {
            stderr += chunk;
          });
          child.once("error", reject);
          child.once("close", (code) => {
            if (code !== 0) {
              reject(
                new Error(
                  `Concurrent database session failed with status ${String(code)}.\n${formatFailureOutput(stdout, stderr)}`,
                ),
              );
              return;
            }
            resolve(stdout.trim());
          });
          child.stdin.end(query);
        }),
    ),
  );
}

async function runTransactionalConcurrencyTests(): Promise<void> {
  const inventory = runProgram("docker", [
    "ps",
    "--format",
    "{{.Names}}\t{{.Image}}",
  ]).stdout;
  const databaseContainer = findSupabaseContainer(inventory, "db");
  const jobId = randomUUID();
  const jobClaimKeyA = `race-claim-a-${randomUUID()}`;
  const jobClaimKeyB = `race-claim-b-${randomUUID()}`;
  const jobCorrelationA = randomUUID();
  const jobCorrelationB = randomUUID();
  const jobClock = Date.now();
  const jobAvailableAt = new Date(jobClock - 60_000).toISOString();
  const jobClaimedAt = new Date(jobClock + 60_000).toISOString();
  const reservationKey = `race-reserve-${randomUUID()}`;
  const settlementKey = `race-settle-${randomUUID()}`;
  const usageStartedAt = Date.now();
  const reservationExpiresAt = new Date(
    usageStartedAt + 10 * 60_000,
  ).toISOString();
  const settlementAt = new Date(usageStartedAt + 5 * 60_000).toISOString();

  runProgramWithInput(
    "docker",
    [
      "exec",
      "-i",
      databaseContainer.name,
      "psql",
      "--no-psqlrc",
      "--quiet",
      "--username",
      "postgres",
      "--dbname",
      "postgres",
      "--set",
      "ON_ERROR_STOP=1",
    ],
    `
      update unimind_private.processing_jobs
      set available_at = '2099-01-01T00:00:00Z'
      where state in ('QUEUED', 'RETRYING');
      insert into unimind_private.processing_jobs (
        id, job_type, idempotency_key, priority, available_at
      ) values (
        '${jobId}', 'RECONCILE', 'race-job-${jobId}', 0,
        '${jobAvailableAt}'
      );
    `,
  );

  const claimOutputs = await runPsqlConcurrently(databaseContainer.name, [
    `select id from unimind_private.claim_processing_job(
      'race-worker-a', '${jobClaimedAt}', interval '2 minutes',
      '${jobClaimKeyA}', '${jobCorrelationA}'
    );`,
    `select id from unimind_private.claim_processing_job(
      'race-worker-b', '${jobClaimedAt}', interval '2 minutes',
      '${jobClaimKeyB}', '${jobCorrelationB}'
    );`,
  ]);
  const claimWinners = claimOutputs.filter((output) => output === jobId);
  const claimLosers = claimOutputs.filter((output) => output.length === 0);
  if (claimWinners.length !== 1 || claimLosers.length !== 1) {
    throw new Error(
      `Concurrent job claim expected one winner and one empty result; received ${JSON.stringify(claimOutputs)}.`,
    );
  }

  const jobEvidence = runProgramWithInput(
    "docker",
    [
      "exec",
      "-i",
      databaseContainer.name,
      "psql",
      "--no-psqlrc",
      "--quiet",
      "--username",
      "postgres",
      "--dbname",
      "postgres",
      "--tuples-only",
      "--no-align",
      "--set",
      "ON_ERROR_STOP=1",
    ],
    `select attempt_count || ':' ||
      (select count(*) from unimind_private.job_attempts where job_id = '${jobId}') || ':' ||
      (select count(*) from unimind_private.job_events where job_id = '${jobId}')
      from unimind_private.processing_jobs where id = '${jobId}';`,
  ).stdout.trim();
  if (jobEvidence !== "1:1:1") {
    throw new Error(
      `Concurrent job claim created unexpected durable state: ${jobEvidence}.`,
    );
  }

  const reserveQuery = `select id from unimind_private.reserve_usage(
    '10000000-0000-0000-0000-000000000002', 'CHAT', 100,
    '${reservationExpiresAt}', '${reservationKey}'
  );`;
  const reserveOutputs = await runPsqlConcurrently(databaseContainer.name, [
    reserveQuery,
    reserveQuery,
  ]);
  if (
    reserveOutputs[0] === undefined ||
    reserveOutputs[0].length === 0 ||
    reserveOutputs[0] !== reserveOutputs[1]
  ) {
    throw new Error(
      `Concurrent usage reserve did not return one canonical row: ${JSON.stringify(reserveOutputs)}.`,
    );
  }
  const reservationId = reserveOutputs[0];

  const settleQuery = `select id from unimind_private.settle_usage(
    '${reservationId}', 80, '${settlementAt}', '${settlementKey}'
  );`;
  const settleOutputs = await runPsqlConcurrently(databaseContainer.name, [
    settleQuery,
    settleQuery,
  ]);
  if (
    settleOutputs[0] !== reservationId ||
    settleOutputs[1] !== reservationId
  ) {
    throw new Error(
      `Concurrent usage settlement did not return one canonical row: ${JSON.stringify(settleOutputs)}.`,
    );
  }

  const usageEvidence = runProgramWithInput(
    "docker",
    [
      "exec",
      "-i",
      databaseContainer.name,
      "psql",
      "--no-psqlrc",
      "--quiet",
      "--username",
      "postgres",
      "--dbname",
      "postgres",
      "--tuples-only",
      "--no-align",
      "--set",
      "ON_ERROR_STOP=1",
    ],
    `select state || ':' || settled_units || ':' ||
      (select count(*) from unimind_private.usage_ledger
       where related_entity_id = '${reservationId}'
         and event_type = 'RESERVED') || ':' ||
      (select count(*) from unimind_private.usage_ledger
       where related_entity_id = '${reservationId}'
         and event_type = 'SETTLED') || ':' ||
      (select count(*) from unimind_private.usage_ledger
       where related_entity_id = '${reservationId}'
         and event_type = 'RELEASED')
      from unimind_private.usage_reservations where id = '${reservationId}';`,
  ).stdout.trim();
  if (usageEvidence !== "SETTLED:80:1:1:1") {
    throw new Error(
      `Concurrent usage settlement created unexpected durable state: ${usageEvidence}.`,
    );
  }

  mkdirSync(path.resolve("test-results"), { recursive: true });
  writeFileSync(
    path.resolve("test-results/transactional-concurrency.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        scope: "wp02-t07-disposable-database",
        jobClaim: { winners: 1, attempts: 1, events: 1 },
        usageReserve: { canonicalRows: 1, ledgerEvents: 1 },
        usageSettle: {
          canonicalRows: 1,
          settledEvents: 1,
          unusedReleaseEvents: 1,
        },
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function writeRuntimeMetadata(): void {
  const inventory = runProgram("docker", [
    "ps",
    "--format",
    "{{.Names}}\\t{{.Image}}",
  ]).stdout;
  const databaseContainer = findSupabaseContainer(inventory, "db");
  const restContainer = findSupabaseContainer(inventory, "rest");
  const postgres = parsePostgresRuntimeMetadata(
    runProgram("docker", [
      "exec",
      databaseContainer.name,
      "psql",
      "--no-psqlrc",
      "--username",
      "postgres",
      "--dbname",
      "postgres",
      "--tuples-only",
      "--no-align",
      "--command",
      "select current_setting('server_version'); select extname || '=' || extversion from pg_extension order by extname;",
    ]).stdout,
  );
  const report = {
    schemaVersion: 1,
    scope: "disposable-supabase-ci",
    githubRunId: process.env.GITHUB_RUN_ID ?? "unknown",
    runner: {
      os: process.env.RUNNER_OS ?? "unknown",
      architecture: process.env.RUNNER_ARCH ?? "unknown",
      imageOs: process.env.ImageOS ?? "unknown",
      imageVersion: process.env.ImageVersion ?? "unknown",
    },
    runtime: {
      node: process.version,
      dockerServer: runProgram("docker", [
        "version",
        "--format",
        "{{.Server.Version}}",
      ]).stdout.trim(),
      supabaseCli: runCli(["--version"]).stdout.trim(),
      postgres: postgres.version,
      databaseImage: databaseContainer.image,
      postgrestImage: restContainer.image,
      extensions: postgres.extensions,
    },
  };

  mkdirSync(path.resolve("test-results"), { recursive: true });
  writeFileSync(
    path.resolve("test-results/database-ci-runtime.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8",
  );
}

function readStatus() {
  return parseEphemeralSupabaseStatus(runCli(["status", "-o", "env"]).stdout);
}

function runAuthIntegration(): void {
  const status = readStatus();
  const inheritedNames = new Set([
    "CI",
    "GITHUB_ACTIONS",
    "HOME",
    "LANG",
    "PATH",
    "RUNNER_ENVIRONMENT",
    "RUNNER_OS",
    "TEMP",
    "TMP",
  ]);
  const inheritedEnvironment = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => inheritedNames.has(name)),
  );
  const syntheticServerCredential = [
    "synthetic",
    "ephemeral",
    "auth",
    "credential",
  ].join("-");
  const childEnvironment: NodeJS.ProcessEnv = {
    ...inheritedEnvironment,
    NODE_ENV: "test",
    NODE_OPTIONS: "--dns-result-order=ipv4first",
    NEXT_PUBLIC_SUPABASE_URL: status.apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.publishableKey,
    NEXT_PUBLIC_RELEASE_ID: "ephemeral-database-auth-integration",
    NEXT_PUBLIC_TELEMETRY_ENABLED: "false",
    DATABASE_URL: status.databaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: status.serviceRoleKey,
    RAW_STORAGE_CREDENTIAL: syntheticServerCredential,
    PROCESSED_STORAGE_CREDENTIAL: syntheticServerCredential,
    QUEUE_SIGNING_SECRET: syntheticServerCredential,
    PROVIDER_MODE: "mock",
    APPROVED_PROVIDER_BUDGET_MINOR: "0",
    GENERATION_PROVIDER_ENABLED: "false",
    EMBEDDING_PROVIDER_ENABLED: "false",
    TRANSCRIPTION_PROVIDER_ENABLED: "false",
    UNIMIND_DATABASE_AUTH_TEST: "true",
  };
  const vitestBinary = path.resolve("node_modules/vitest/vitest.mjs");
  const result = spawnSync(
    process.execPath,
    [vitestBinary, "run", "--project", "integration"],
    {
      cwd: process.cwd(),
      env: childEnvironment,
      stdio: "inherit",
    },
  );
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(
      `Disposable Auth integration failed with status ${String(result.status)}.`,
    );
  }
}

async function execute(action_: EphemeralSupabaseAction): Promise<void> {
  if (action_ === "auth") {
    runAuthIntegration();
    return;
  }
  if (action_ === "upgrade") {
    runCli(["db", "reset", "--local", "--version", "20260824235549"]);
    runCli(["db", "push", "--local", "--include-all"]);
    runCli([
      "test",
      "db",
      "--local",
      "supabase/tests/00_populated_upgrade_retains_foundation.sql",
    ]);
    return;
  }
  const result = runCli(createEphemeralSupabaseArguments(action_));
  if (action_ === "start") {
    writeRuntimeMetadata();
  }
  if (action_ === "types") {
    writeFileSync(
      path.resolve("src/types/database.generated.ts"),
      await formatGeneratedDatabaseTypes(result.stdout),
      "utf8",
    );
  }
  if (action_ === "test") {
    await runTransactionalConcurrencyTests();
    captureAvailabilityQueryPlan();
    captureRetrievalQueryPlan();
  }
}

await execute(action);
process.stdout.write(`Disposable Supabase action passed: ${action}.\n`);
