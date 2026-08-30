import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("Vercel deployment policy", () => {
  it("keeps main disabled until an explicit Production promotion", async () => {
    const config = JSON.parse(await readFile("vercel.json", "utf8")) as {
      git?: { deploymentEnabled?: Record<string, boolean> };
    };

    expect(config.git?.deploymentEnabled).toEqual({ main: false });
  });
});
