import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = path.resolve(
  "supabase/migrations/20260921190508_unit_workspace_scope.sql",
);

describe("workspace trust boundary SQL", () => {
  it("derives the route scope from the caller-authorized catalog and exposes no diagnostic reason codes", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain("security invoker");
    expect(sql).toContain("from public.available_catalog_entries() as entries");
    expect(sql).toContain("entries.cohort_id = target_cohort_id");
    expect(sql).toContain(
      "entries.curriculum_unit_id = target_curriculum_unit_id",
    );
    expect(sql).not.toContain("reason_codes");
    expect(sql).not.toMatch(/security\s+definer/iu);
  });

  it("grants only execution of the bounded function to authenticated callers", async () => {
    const sql = await readFile(migrationPath, "utf8");
    expect(sql).toContain(
      "revoke all on function public.current_student_workspace(uuid, uuid)",
    );
    expect(sql).toContain(
      "grant execute on function public.current_student_workspace(uuid, uuid)",
    );
    expect(sql).toContain("to authenticated");
  });
});
