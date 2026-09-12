import { describe, expect, it } from "vitest";

import {
  curriculumUnitLabel,
  type ProgramTerminology,
} from "../../src/lib/catalog/terminology";
import {
  getDictionary,
  getTextDirection,
  formatInteger,
  isSupportedLocale,
  resolveLocale,
} from "../../src/lib/i18n/locale";
import { messageKeys } from "../../src/lib/i18n/dictionaries";

describe("catalog terminology", () => {
  const medicineTerminology: ProgramTerminology = {
    curriculumUnitNoun: "module",
  };
  const generalTerminology: ProgramTerminology = {
    curriculumUnitNoun: "subject",
  };

  it("renders Module and Subject from program configuration", () => {
    expect(curriculumUnitLabel(medicineTerminology, "en", 1)).toBe("Module");
    expect(curriculumUnitLabel(medicineTerminology, "en", 3)).toBe("Modules");
    expect(curriculumUnitLabel(generalTerminology, "en", 1)).toBe("Subject");
    expect(curriculumUnitLabel(generalTerminology, "en", 3)).toBe("Subjects");
  });

  it("keeps the configured distinction in Arabic", () => {
    expect(curriculumUnitLabel(medicineTerminology, "ar", 1)).toBe("وحدة");
    expect(curriculumUnitLabel(medicineTerminology, "ar", 3)).toBe("وحدات");
    expect(curriculumUnitLabel(generalTerminology, "ar", 1)).toBe("مادة");
    expect(curriculumUnitLabel(generalTerminology, "ar", 3)).toBe("مواد");
  });
});

describe("locale contract", () => {
  it("accepts only explicit supported locales", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("ar")).toBe(true);
    expect(isSupportedLocale("en-US")).toBe(false);
    expect(resolveLocale("ar")).toBe("ar");
    expect(resolveLocale(undefined)).toBe("en");
    expect(resolveLocale("fr")).toBe("en");
  });

  it("maps English and Arabic to their correct directions", () => {
    expect(getTextDirection("en")).toBe("ltr");
    expect(getTextDirection("ar")).toBe("rtl");
  });

  it("formats numerals for the active locale", () => {
    expect(formatInteger("en", 12)).toBe("12");
    expect(formatInteger("ar", 12)).toBe("١٢");
  });

  it("requires complete non-empty dictionaries", () => {
    const english = getDictionary("en");
    const arabic = getDictionary("ar");

    expect(Object.keys(arabic)).toEqual(Object.keys(english));
    expect(Object.values(english).every((value) => value.trim() !== "")).toBe(
      true,
    );
    expect(Object.values(arabic).every((value) => value.trim() !== "")).toBe(
      true,
    );
    for (const key of messageKeys) {
      expect(arabic[key]).not.toBe(english[key]);
    }
    expect(arabic["catalog.syntheticNotice"]).toContain("تجريبية");
  });
});
