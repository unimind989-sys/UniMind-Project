import { z } from "zod";

const actionCountsSchema = z.record(
  z.string().min(1),
  z.number().int().nonnegative(),
);

const loadProfileSchema = z.object({
  schema_version: z.literal(1),
  profile_id: z.string().min(1),
  status: z.literal("DRAFT_SYNTHETIC"),
  dataset_version: z.string().min(1),
  random_seed: z.number().int().nonnegative(),
  target_environment: z.literal("local-mock"),
  provider_mode: z.literal("mock"),
  hard_abort: z.object({
    leakage_events: z.literal(0),
    duplicate_settlements: z.literal(0),
    lost_accepted_jobs: z.literal(0),
    maximum_cost: z.literal(0),
  }),
  phases: z
    .array(
      z.object({
        name: z.string().min(1),
        duration_seconds: z.number().int().nonnegative(),
        virtual_users: z.number().int().nonnegative(),
        arrival_rate_per_second: z.number().nonnegative(),
        concurrency_limit: z.number().int().nonnegative(),
        actions: actionCountsSchema,
      }),
    )
    .min(1),
  thresholds: z.object({
    maximum_leakage_events: z.literal(0),
    maximum_duplicate_business_events: z.literal(0),
    maximum_lost_accepted_jobs: z.literal(0),
    maximum_total_cost: z.literal(0),
  }),
});

export type LoadProfile = z.infer<typeof loadProfileSchema>;

export type LoadDryRunReport = Readonly<{
  schemaVersion: 1;
  profileId: string;
  datasetVersion: string;
  targetEnvironment: "local-mock";
  providerMode: "mock";
  executionStatus: "NOT_EXECUTED";
  phaseCount: number;
  totalVirtualUsers: number;
  totalDeclaredActions: number;
  maximumCost: 0;
}>;

export function parseLoadProfile(value: unknown): LoadProfile {
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const target = record.target_environment;
    if (
      typeof target === "string" &&
      ["beta", "production", "preview"].includes(target)
    ) {
      throw new Error(
        `Load target '${target}' is forbidden by the default profile.`,
      );
    }
    if (record.provider_mode !== "mock") {
      throw new Error("Load profile must use deterministic mock providers.");
    }
    const hardAbort = record.hard_abort;
    if (
      typeof hardAbort === "object" &&
      hardAbort !== null &&
      (hardAbort as Record<string, unknown>).maximum_cost !== 0
    ) {
      throw new Error("Load profile maximum cost must be zero.");
    }
  }

  const result = loadProfileSchema.safeParse(value);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.join(".") || "profile";
    throw new Error(
      `Load profile is invalid at '${path}': ${issue?.message ?? "unknown validation error"}`,
    );
  }

  const names = new Set<string>();
  for (const phase of result.data.phases) {
    if (names.has(phase.name)) {
      throw new Error(`Load phase name '${phase.name}' must be unique.`);
    }
    names.add(phase.name);
  }
  return result.data;
}

export function createLoadDryRunReport(profile: LoadProfile): LoadDryRunReport {
  return {
    schemaVersion: 1,
    profileId: profile.profile_id,
    datasetVersion: profile.dataset_version,
    targetEnvironment: profile.target_environment,
    providerMode: profile.provider_mode,
    executionStatus: "NOT_EXECUTED",
    phaseCount: profile.phases.length,
    totalVirtualUsers: Math.max(
      ...profile.phases.map((phase) => phase.virtual_users),
    ),
    totalDeclaredActions: profile.phases.reduce(
      (profileTotal, phase) =>
        profileTotal +
        Object.values(phase.actions).reduce(
          (phaseTotal, count) => phaseTotal + count,
          0,
        ),
      0,
    ),
    maximumCost: 0,
  };
}

export function renderLoadDryRunMarkdown(report: LoadDryRunReport): string {
  return [
    "# Synthetic load profile dry run",
    "",
    `- Profile: \`${report.profileId}\``,
    `- Dataset: \`${report.datasetVersion}\``,
    `- Target: \`${report.targetEnvironment}\``,
    `- Provider mode: \`${report.providerMode}\``,
    `- Execution: \`${report.executionStatus}\``,
    `- Phases: ${String(report.phaseCount)}`,
    `- Maximum virtual users: ${String(report.totalVirtualUsers)}`,
    `- Declared actions: ${String(report.totalDeclaredActions)}`,
    `- Maximum provider cost: ${String(report.maximumCost)}`,
    "",
    "This report validates the guarded profile only. It does not claim that the workload was executed or that performance thresholds passed.",
    "",
  ].join("\n");
}
