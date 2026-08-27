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

  it("removes environment-specific PostgREST generator metadata", async () => {
    await expect(
      formatGeneratedDatabaseTypes(`export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: { Tables: {} }
}
`),
    ).resolves.toBe(`export type Database = {
  public: { Tables: {} };
};
`);
  });
});
