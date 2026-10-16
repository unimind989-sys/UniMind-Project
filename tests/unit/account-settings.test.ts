import { describe, expect, it, vi } from "vitest";
import {
  saveAcademicSettings,
  authorizedAcademicContext,
  roleHome,
} from "../../src/lib/account/account.application";
import type { AuthorizedCatalogRow } from "../../src/lib/catalog/catalog-journey.application";

const node = (id: string) => ({
  id,
  code: id,
  nameEn: id,
  nameAr: id,
  sortOrder: 1,
});
const row: AuthorizedCatalogRow = {
  stage: node("stage-1"),
  institution: node("institution-1"),
  program: {
    ...node("program-1"),
    progressionMode: "TERM_BASED",
    unitType: "MODULE",
    unitLabelSingularEn: "Module",
    unitLabelPluralEn: "Modules",
    unitLabelSingularAr: "وحدة",
    unitLabelPluralAr: "وحدات",
  },
  level: node("level-1"),
  term: node("term-1"),
  cohort: { ...node("cohort-1"), curriculumEdition: "2026" },
  unit: { ...node("unit-1"), unitType: "MODULE" },
};
const catalogRows = [row];
const context = {
  version: 1,
  stageId: row.stage.id,
  institutionId: row.institution.id,
  programId: row.program.id,
  levelId: row.level.id,
  termId: row.term.id,
  cohortId: row.cohort.id,
};

describe("academic profile preference boundary", () => {
  it("saves only a complete authorized path for the caller obtained at the seam", async () => {
    const save = vi.fn();
    const repository = {
      eligibleCaller: async () => "verified-caller",
      catalog: async () => catalogRows,
      save,
    };
    expect(await saveAcademicSettings(repository, context)).toEqual({
      status: "SAVED",
    });
    expect(save).toHaveBeenCalledWith("verified-caller", context);
    expect(authorizedAcademicContext(context, [])).toBeNull();
  });
  it.each([
    null,
    { ...context, userId: "foreign" },
    { ...context, cohortId: "foreign" },
    { ...context, version: 2 },
    { ...context, termId: "wrong-period" },
  ])(
    "rejects malformed, foreign or stale preferences without a write",
    async (input) => {
      const save = vi.fn();
      expect(
        await saveAcademicSettings(
          {
            eligibleCaller: async () => "caller",
            catalog: async () => catalogRows,
            save,
          },
          input,
        ),
      ).toEqual({ status: "INVALID" });
      expect(save).not.toHaveBeenCalled();
    },
  );
  it("denies an ineligible identity before any catalog read or write", async () => {
    const catalog = vi.fn(),
      save = vi.fn();
    expect(
      await saveAcademicSettings(
        { eligibleCaller: async () => null, catalog, save },
        context,
      ),
    ).toEqual({ status: "FORBIDDEN" });
    expect(catalog).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
  it("reports unavailable persistence without claiming success", async () => {
    expect(
      await saveAcademicSettings(
        {
          eligibleCaller: async () => "caller",
          catalog: async () => catalogRows,
          save: async () => {
            throw new Error("fixture database unavailable");
          },
        },
        context,
      ),
    ).toEqual({ status: "UNAVAILABLE" });
  });
  it("routes from authoritative roles with deterministic precedence", () => {
    expect(roleHome(["STUDENT", "BATCH_LEADER", "ADMIN"])).toBe("/admin");
    expect(roleHome(["STUDENT", "BATCH_LEADER"])).toBe("/batch-leader");
    expect(roleHome(["STUDENT"])).toBe("/learn");
    expect(roleHome([])).toBe("/learn");
  });
});
