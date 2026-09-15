import { describe, expect, it } from "vitest";

import {
  buildCatalogHref,
  parseCatalogSelectionHints,
  resolveCatalogJourney,
  type AuthorizedCatalogRow,
} from "../../src/lib/catalog/catalog-journey.domain";

const rows = [
  {
    stage: {
      id: "stage-university",
      code: "university",
      nameEn: "University",
      nameAr: "الجامعة",
      sortOrder: 1,
    },
    institution: {
      id: "institution-alpha",
      code: "alpha",
      nameEn: "Alpha University",
      nameAr: "جامعة ألفا",
      sortOrder: 1,
    },
    program: {
      id: "program-human",
      code: "human-medicine",
      nameEn: "Human Medicine",
      nameAr: "الطب البشري",
      sortOrder: 1,
      progressionMode: "TERM_BASED",
      unitType: "MODULE",
      unitLabelSingularEn: "Module",
      unitLabelPluralEn: "Modules",
      unitLabelSingularAr: "وحدة",
      unitLabelPluralAr: "وحدات",
    },
    level: {
      id: "level-one",
      code: "level-one",
      nameEn: "Level one",
      nameAr: "المستوى الأول",
      sortOrder: 1,
    },
    term: {
      id: "term-one",
      code: "term-one",
      nameEn: "Term one",
      nameAr: "الفصل الأول",
      sortOrder: 1,
    },
    cohort: {
      id: "cohort-2026",
      code: "human-2026",
      nameEn: "2026 cohort",
      nameAr: "دفعة ٢٠٢٦",
      sortOrder: 1,
      curriculumEdition: "2026",
    },
    unit: {
      id: "unit-anatomy",
      code: "anatomy",
      nameEn: "Anatomy",
      nameAr: "التشريح",
      sortOrder: 1,
      unitType: "MODULE",
      sourceCount: 4,
    },
  },
  {
    stage: {
      id: "stage-university",
      code: "university",
      nameEn: "University",
      nameAr: "الجامعة",
      sortOrder: 1,
    },
    institution: {
      id: "institution-alpha",
      code: "alpha",
      nameEn: "Alpha University",
      nameAr: "جامعة ألفا",
      sortOrder: 1,
    },
    program: {
      id: "program-human",
      code: "human-medicine",
      nameEn: "Human Medicine",
      nameAr: "الطب البشري",
      sortOrder: 1,
      progressionMode: "TERM_BASED",
      unitType: "MODULE",
      unitLabelSingularEn: "Module",
      unitLabelPluralEn: "Modules",
      unitLabelSingularAr: "وحدة",
      unitLabelPluralAr: "وحدات",
    },
    level: {
      id: "level-two",
      code: "level-two",
      nameEn: "Level two",
      nameAr: "المستوى الثاني",
      sortOrder: 2,
    },
    term: {
      id: "term-two",
      code: "term-two",
      nameEn: "Term two",
      nameAr: "الفصل الثاني",
      sortOrder: 2,
    },
    cohort: {
      id: "cohort-2027",
      code: "human-2027",
      nameEn: "2027 cohort",
      nameAr: "دفعة ٢٠٢٧",
      sortOrder: 2,
      curriculumEdition: "2027",
    },
    unit: {
      id: "unit-physiology",
      code: "physiology",
      nameEn: "Physiology",
      nameAr: "علم وظائف الأعضاء",
      sortOrder: 2,
      unitType: "MODULE",
      sourceCount: 6,
    },
  },
] as const satisfies readonly AuthorizedCatalogRow[];

describe("server-authorized catalog journey", () => {
  it("parses only the first bounded string value for known selection hints", () => {
    expect(
      parseCatalogSelectionHints({
        stage: ["stage-university", "forged"],
        institution: "institution-alpha",
        unit: "x".repeat(129),
        hidden: "private-option",
      }),
    ).toEqual({
      stageId: "stage-university",
      institutionId: "institution-alpha",
    });
  });

  it("validates each hint against the authorized upstream option set", () => {
    const journey = resolveCatalogJourney(rows, {
      stageId: "stage-university",
      institutionId: "institution-alpha",
      programId: "program-human",
      levelId: "forged-level",
      termId: "term-two",
      cohortId: "cohort-2027",
      unitId: "unit-physiology",
    });

    expect(journey.selection).toEqual({
      stageId: "stage-university",
      institutionId: "institution-alpha",
      programId: "program-human",
    });
    expect(journey.options.levels.map((option) => option.id)).toEqual([
      "level-one",
      "level-two",
    ]);
    expect(journey.options.terms).toEqual([]);
    expect(journey.units).toEqual([]);
    expect(journey.correction).toBe("INVALID_HINT");
  });

  it("keeps a fully authorized selection stable and exposes only its units", () => {
    const journey = resolveCatalogJourney(rows, {
      stageId: "stage-university",
      institutionId: "institution-alpha",
      programId: "program-human",
      levelId: "level-two",
      termId: "term-two",
      cohortId: "cohort-2027",
      unitId: "unit-physiology",
    });

    expect(journey.correction).toBeNull();
    expect(journey.units.map((unit) => unit.id)).toEqual(["unit-physiology"]);
    expect(journey.selection.unitId).toBe("unit-physiology");
    expect(journey.canonicalQuery).toBe(
      "stage=stage-university&institution=institution-alpha&program=program-human&level=level-two&term=term-two&cohort=cohort-2027&unit=unit-physiology",
    );
  });

  it("clears every downstream hint when an upstream option changes", () => {
    expect(
      buildCatalogHref(
        "/learn",
        "ar",
        {
          stageId: "stage-university",
          institutionId: "institution-alpha",
          programId: "program-human",
          levelId: "level-two",
          termId: "term-two",
          cohortId: "cohort-2027",
          unitId: "unit-physiology",
        },
        "level",
        "level-one",
      ),
    ).toBe(
      "/learn?lang=ar&stage=stage-university&institution=institution-alpha&program=program-human&level=level-one",
    );
  });

  it("deduplicates repeated rows and sorts every option deterministically", () => {
    const journey = resolveCatalogJourney([rows[1], rows[0], rows[0]], {
      stageId: "stage-university",
      institutionId: "institution-alpha",
      programId: "program-human",
    });

    expect(journey.options.levels.map((option) => option.id)).toEqual([
      "level-one",
      "level-two",
    ]);
  });

  it("handles the minimum, typical, and PoC maximum option counts with long mixed labels", () => {
    const makeRows = (count: number): readonly AuthorizedCatalogRow[] =>
      Array.from({ length: count }, (_, index) => ({
        ...rows[0],
        unit: {
          ...rows[0].unit,
          id: `unit-${index + 1}`,
          code: `UNIT_${String(index + 1).padStart(2, "0")}`,
          nameEn:
            index === count - 1
              ? "Integrated Cardiovascular, Respiratory & Renal Systems — OSCE 1"
              : `Authorized module ${index + 1}`,
          nameAr:
            index === count - 1
              ? "الوحدة المتكاملة للقلب والتنفس والكلى — OSCE 1"
              : `الوحدة المصرح بها ${index + 1}`,
          sortOrder: index + 1,
        },
      }));

    for (const count of [1, 8, 12]) {
      const journey = resolveCatalogJourney(makeRows(count), {});
      expect(journey.units).toHaveLength(count);
    }

    const maximum = resolveCatalogJourney(makeRows(12), {});
    expect(maximum.units.at(-1)?.nameEn).toContain("OSCE 1");
    expect(maximum.units.at(-1)?.nameAr).toContain("OSCE 1");
  });
});
