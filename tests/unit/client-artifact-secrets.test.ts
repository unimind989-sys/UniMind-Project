import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  assertClientArtifactsExcludeValues,
  findClientArtifactLeaks,
} from "../../scripts/lib/client-artifact-secrets";

const serviceRoleCanary = "SYNTHETIC_SERVICE_ROLE_CANARY_73D9";
let buildRoot: string;

beforeEach(async () => {
  buildRoot = await mkdtemp(
    path.join(os.tmpdir(), "unimind-client-artifacts-"),
  );
  await mkdir(path.join(buildRoot, "static", "chunks"), { recursive: true });
  await mkdir(path.join(buildRoot, "server", "app"), { recursive: true });
});

afterEach(async () => {
  await rm(buildRoot, { recursive: true, force: true });
});

describe("client artifact secret scan", () => {
  it("accepts clean browser and serialized artifacts", async () => {
    await writeFile(
      path.join(buildRoot, "static", "chunks", "app.js"),
      "console.log('public bundle')",
    );
    await writeFile(
      path.join(buildRoot, "server", "app", "index.rsc"),
      "serialized public props",
    );

    await expect(
      assertClientArtifactsExcludeValues(buildRoot, [
        {
          label: "service-role",
          value: serviceRoleCanary,
        },
      ]),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["static/chunks/app.js", "browser bundle"],
    ["server/app/index.html", "rendered HTML"],
    ["server/app/index.rsc", "serialized RSC payload"],
  ])("detects a service-role canary in %s", async (relativePath) => {
    const file = path.join(buildRoot, ...relativePath.split("/"));
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, `prefix-${serviceRoleCanary}-suffix`);

    await expect(
      findClientArtifactLeaks(buildRoot, [
        {
          label: "service-role",
          value: serviceRoleCanary,
        },
      ]),
    ).resolves.toEqual([
      {
        label: "service-role",
        file: relativePath,
      },
    ]);
  });

  it("does not misclassify server implementation chunks as serialized props", async () => {
    await writeFile(
      path.join(buildRoot, "server", "app", "page.js"),
      serviceRoleCanary,
    );

    await expect(
      findClientArtifactLeaks(buildRoot, [
        {
          label: "service-role",
          value: serviceRoleCanary,
        },
      ]),
    ).resolves.toEqual([]);
  });

  it("never includes the secret value in a failure message", async () => {
    await writeFile(
      path.join(buildRoot, "static", "chunks", "app.js"),
      serviceRoleCanary,
    );

    try {
      await assertClientArtifactsExcludeValues(buildRoot, [
        {
          label: "service-role",
          value: serviceRoleCanary,
        },
      ]);
      throw new Error("Expected the client artifact scan to fail.");
    } catch (error) {
      expect(String(error)).toContain("service-role");
      expect(String(error)).not.toContain(serviceRoleCanary);
    }
  });
});
