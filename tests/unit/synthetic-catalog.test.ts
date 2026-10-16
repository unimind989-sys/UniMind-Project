import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  syntheticCatalogRows,
  syntheticUnitPresentationById,
} from "../../src/app/learn/synthetic-catalog";
import { loadSyntheticWorkspaceScope } from "../../src/app/learn/synthetic-workspace";

describe("synthetic high-school catalogs", () => {
  for (const term of [1, 2]) {
    it(`gives Mathematics its own bilingual subjects in term ${term}`, () => {
      const rows = syntheticCatalogRows.filter(
        (row) =>
          row.program.id === "mathematics-track" &&
          row.term.code === `TERM_${term}`,
      );
      expect(rows.map((row) => [row.unit.nameEn, row.unit.nameAr])).toEqual([
        ["Mathematics", "الرياضيات"],
        ["Chemistry", "الكيمياء"],
        ["Physics", "الفيزياء"],
      ]);
      const mathematics = rows[0]!;
      expect(mathematics.unit.code).toBe("MATHEMATICS");
      expect(mathematics.unit.id).toBe(
        `egyptian-thanaweya-amma-mathematics-track-y3-t${term}-mathematics`,
      );
      expect(mathematics.unit.sourceCount).toBe(8);
      expect(syntheticUnitPresentationById[mathematics.unit.id]).toMatchObject({
        descriptionEn: "Synthetic Thanaweya Amma mathematics material.",
        descriptionAr: "محتوى تجريبي لمادة الرياضيات بالثانوية العامة.",
      });
      expect(
        loadSyntheticWorkspaceScope(mathematics.cohort.id, mathematics.unit.id),
      ).toMatchObject({
        unitTitleEn: "Mathematics",
        unitTitleAr: "الرياضيات",
        programNameEn: "Mathematics track",
        termNameEn: `Term ${term}`,
        curriculumEdition: "synthetic-2026-2027",
        sourceCount: 8,
      });
    });

    it(`keeps Biology in the Science sample in term ${term}`, () => {
      const rows = syntheticCatalogRows.filter(
        (row) =>
          row.program.id === "science-track" &&
          row.term.code === `TERM_${term}`,
      );
      expect(rows.map((row) => [row.unit.nameEn, row.unit.nameAr])).toEqual([
        ["Biology", "الأحياء"],
        ["Chemistry", "الكيمياء"],
        ["Physics", "الفيزياء"],
      ]);
    });

    it(`rejects the removed Biology unit and foreign cohort pairs in term ${term}`, () => {
      const cohort = `egyptian-thanaweya-amma-mathematics-track-year-3-term-${term}-cohort`;
      const mathUnit = `egyptian-thanaweya-amma-mathematics-track-y3-t${term}-mathematics`;
      expect(
        loadSyntheticWorkspaceScope(
          cohort,
          mathUnit.replace(/mathematics$/u, "biology"),
        ),
      ).toBeNull();
      expect(
        loadSyntheticWorkspaceScope(
          cohort.replace("mathematics-track", "science-track"),
          mathUnit,
        ),
      ).toBeNull();
      expect(
        loadSyntheticWorkspaceScope(
          cohort.replace(`term-${term}`, `term-${term === 1 ? 2 : 1}`),
          mathUnit,
        ),
      ).toBeNull();
    });
  }

  it("resolves every unique configured cohort/unit pair with a local presentation", () => {
    expect(syntheticCatalogRows).toHaveLength(192);
    expect(new Set(syntheticCatalogRows.map((row) => row.unit.id)).size).toBe(
      192,
    );
    for (const row of syntheticCatalogRows) {
      expect(
        loadSyntheticWorkspaceScope(row.cohort.id, row.unit.id),
      ).toMatchObject({
        unitTitleEn: row.unit.nameEn,
        unitTitleAr: row.unit.nameAr,
        programNameEn: row.program.nameEn,
        sourceCount: row.unit.sourceCount,
      });
      const presentation = syntheticUnitPresentationById[row.unit.id]!;
      expect(presentation.image).toMatch(/^\//u);
      expect(
        readFileSync(`public${presentation.image}`).length,
      ).toBeGreaterThan(0);
    }
  });

  it("ships the same catalog and representative mathematics scope in the review pack", () => {
    const pack = JSON.parse(
      readFileSync("public/demo-files/test-data.json", "utf8"),
    ) as {
      catalog: unknown[];
      unitScopes: {
        programEn: string;
        unitEn: string;
        unitAr: string;
        path: string;
      }[];
    };
    expect(pack.catalog.slice(0, syntheticCatalogRows.length)).toEqual(
      syntheticCatalogRows.map((row) => ({
        ...row,
        unit: { ...row.unit, sourceCount: 8 },
      })),
    );
    expect(
      pack.unitScopes.find((scope) => scope.programEn === "Mathematics track"),
    ).toMatchObject({
      unitEn: "Mathematics",
      unitAr: "الرياضيات",
      path: "/learn/egyptian-thanaweya-amma-mathematics-track-year-3-term-1-cohort/egyptian-thanaweya-amma-mathematics-track-y3-t1-mathematics",
    });
  });
});
