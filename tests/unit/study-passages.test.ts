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
      locator: "Page 14",
      text: "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder. The plexus is formed by the ventral rami of C5 to T1.",
    });
    expect(studyPassage("recording", "en")).toMatchObject({
      format: "AUDIO",
      locator: "Timestamp 18:42",
      text: "Count the roots first. In some people the plexus is prefixed and takes a branch from C4, so check before you name the trunks.",
    });
    expect(studyPassage("handout", "ar")?.text).toBe(
      "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
    );
    expect(studyPassage("recording", "ar")?.text).toBe(
      "عُدّ الجذور أولًا. في بعض الناس تكون الضفيرة متقدمة وتأخذ فرعًا من C4، فتأكد قبل أن تسمي الجذوع.",
    );
  });
});
