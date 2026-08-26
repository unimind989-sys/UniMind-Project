import { describe, expect, it } from "vitest";

import { formatGeneratedDatabaseTypes } from "../../scripts/lib/generated-database-types";

describe("generated database types", () => {
  it("uses the repository TypeScript format before drift comparison", async () => {
    await expect(
      formatGeneratedDatabaseTypes(
        "export type SyntheticRow = { id: string; active: boolean }\n",
      ),
    ).resolves.toBe(
      "export type SyntheticRow = { id: string; active: boolean };\n",
    );
  });
});
