import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";
import { parse } from "yaml";

import {
  createLoadDryRunReport,
  parseLoadProfile,
} from "../../scripts/lib/load-profile";

const validProfile = {
  schema_version: 1,
  profile_id: "synthetic-layer-v1",
  status: "DRAFT_SYNTHETIC",
  dataset_version: "synthetic-load-fixtures-v1",
  random_seed: 20260816,
  target_environment: "local-mock",
  provider_mode: "mock",
  hard_abort: {
    leakage_events: 0,
    duplicate_settlements: 0,
    lost_accepted_jobs: 0,
    maximum_cost: 0,
  },
  phases: [
    {
      name: "warm_up",
      duration_seconds: 1,
      virtual_users: 1,
      arrival_rate_per_second: 1,
      concurrency_limit: 1,
      actions: { chat_submit: 1 },
    },
  ],
  thresholds: {
    maximum_leakage_events: 0,
    maximum_duplicate_business_events: 0,
    maximum_lost_accepted_jobs: 0,
    maximum_total_cost: 0,
  },
};

describe("guarded load profile", () => {
  it.each(["beta", "production", "preview"])(
    "rejects the forbidden default target %s",
    (target) => {
      expect(() =>
        parseLoadProfile({ ...validProfile, target_environment: target }),
      ).toThrow(`Load target '${target}' is forbidden by the default profile.`);
    },
  );

  it("rejects any paid-provider or nonzero-cost profile", () => {
    expect(() =>
      parseLoadProfile({ ...validProfile, provider_mode: "real" }),
    ).toThrow("Load profile must use deterministic mock providers.");
    expect(() =>
      parseLoadProfile({
        ...validProfile,
        hard_abort: { ...validProfile.hard_abort, maximum_cost: 1 },
      }),
    ).toThrow("Load profile maximum cost must be zero.");
  });

  it("parses the versioned repository profile and emits a dry-run claim only", async () => {
    const yaml = await readFile(
      "planning/load-profile-100-students.yaml",
      "utf8",
    );
    const profile = parseLoadProfile(parse(yaml));
    const report = createLoadDryRunReport(profile);

    expect(report).toMatchObject({
      schemaVersion: 1,
      profileId: "unimind-100-student-v1",
      datasetVersion: "synthetic-load-fixtures-v1",
      targetEnvironment: "local-mock",
      providerMode: "mock",
      executionStatus: "NOT_EXECUTED",
      totalVirtualUsers: 100,
      maximumCost: 0,
    });
    expect(report.phaseCount).toBe(8);
    expect(report.totalDeclaredActions).toBeGreaterThan(800);
  });
});
