import { describe, expect, it } from "vitest";
import {
  studyPassage,
  studyMaterialReading,
} from "../../src/lib/study/study-passages.application";

describe("fixed processed passage presentation", () => {
  it.each([null, "appendix", "constructor", "__proto__", ""])(
    "does not invent text or a locator for %s",
    (id) => {
      expect(studyPassage(id, "en")).toBeNull();
      expect(studyMaterialReading(id, true, "en")).toMatchObject({
        readable: false,
        action: null,
        caption: "No reading passage supplied",
      });
    },
  );
  it("separates ready-for-tools materials from supplied reading content", () => {
    for (const locale of ["en", "ar"] as const) {
      expect(studyMaterialReading("handout", true, locale).readable).toBe(true);
      expect(studyMaterialReading("recording", true, locale).readable).toBe(
        true,
      );
      expect(studyMaterialReading(null, true, locale).readable).toBe(false);
      expect(studyMaterialReading("handout", true, locale).action).not.toBe(
        studyMaterialReading("recording", true, locale).action,
      );
    }
  });
  it("does not reopen current reading when a source is inactive, while retaining the fixed historical excerpt", () => {
    for (const locale of ["en", "ar"] as const) {
      expect(studyMaterialReading("handout", false, locale)).toMatchObject({
        readable: false,
        action: null,
      });
      expect(studyPassage("handout", locale)).toBeTruthy();
    }
  });
  it("preserves the two distinct positions and their only supplied locators in both locales", () => {
    expect(studyPassage("handout", "en")).toMatchObject({
      format: "PDF",
      locator: "Sample page 3",
      text: "Identify the labels, then compare the diagrams.",
    });
    expect(studyPassage("recording", "en")).toMatchObject({
      format: "AUDIO",
      locator: "Sample timestamp 02:10",
      text: "Compare first, then identify the labels.",
    });
    expect(studyPassage("handout", "ar")?.text).toBe(
      "حدد الأسماء ثم قارن الرسوم.",
    );
    expect(studyPassage("recording", "ar")?.text).toBe(
      "قارن أولًا ثم حدد الأسماء.",
    );
  });
});
