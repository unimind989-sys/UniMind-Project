import { describe, expect, it } from "vitest";
import {
  academicSetupSequence,
  type AcademicSetupField,
} from "../../src/lib/account/academic-setup.application";

const node = (id: string) => ({
  id,
  code: id,
  nameEn: id,
  nameAr: id,
  sortOrder: 0,
});
const fields: readonly AcademicSetupField[] = [
  ["stageId", "Stage", [node("university"), node("school")]],
  ["institutionId", "Institution", [node("institution")]],
  ["programId", "Program", [node("medicine"), node("veterinary")]],
  ["levelId", "Level", [node("year")]],
  ["termId", "Period", [node("first"), node("second")]],
];
const complete = Object.freeze({
  stageId: "university",
  institutionId: "institution",
  programId: "medicine",
  levelId: "year",
  termId: "first",
});
describe("academic setup questions preserve path review and field identity", () => {
  it("asks variable questions while carrying only matching determined values", () => {
    expect(academicSetupSequence(fields, complete, 0)).toEqual({
      questions: [0, 2, 4],
      step: 0,
      ordinal: 0,
      previous: null,
      next: 2,
    });
  });
  it("a retained raw institution step opens the next meaningful program question", () => {
    expect(academicSetupSequence(fields, complete, 1)).toMatchObject({
      step: 2,
      ordinal: 1,
      previous: 0,
      next: 4,
    });
  });
  it("Back from review returns to the last question, then to the program", () => {
    expect(academicSetupSequence(fields, complete, 5)).toMatchObject({
      step: 5,
      previous: 4,
    });
    expect(academicSetupSequence(fields, complete, 4)).toMatchObject({
      previous: 2,
      next: 5,
    });
  });
  it("a parent reset cannot retain a later review step past a missing choice", () => {
    expect(
      academicSetupSequence(
        fields,
        { stageId: "university", institutionId: "institution" },
        5,
      ),
    ).toMatchObject({ step: 2, next: 3 });
  });
  it("never silently carries a mismatched determined option", () => {
    expect(
      academicSetupSequence(
        fields,
        { ...complete, institutionId: "old-institution" },
        1,
      ),
    ).toMatchObject({ step: 1, questions: [0, 1, 2, 4] });
  });
  it("an unavailable question remains a blocking question", () => {
    const unavailable: readonly AcademicSetupField[] = [
      fields[0]!,
      fields[1]!,
      ["programId", "Program", []],
    ];
    expect(
      academicSetupSequence(
        unavailable,
        { stageId: "university", institutionId: "institution" },
        3,
      ),
    ).toMatchObject({ step: 2 });
  });
  it("a fully determined authorized path goes straight to explicit review", () => {
    const determined: readonly AcademicSetupField[] = [
      ["stageId", "Stage", [node("university")]],
      ["institutionId", "Institution", [node("institution")]],
    ];
    expect(academicSetupSequence(determined, complete, 0)).toEqual({
      questions: [],
      step: 2,
      ordinal: -1,
      previous: null,
      next: 2,
    });
  });
  it("bounds corrupt step hints without changing fields or selections", () => {
    const before = JSON.stringify({ fields, complete });
    for (const step of [-10, NaN, Infinity])
      expect(academicSetupSequence(fields, complete, step).step).toBe(0);
    expect(academicSetupSequence(fields, complete, 100).step).toBe(5);
    expect(JSON.stringify({ fields, complete })).toBe(before);
  });
});
