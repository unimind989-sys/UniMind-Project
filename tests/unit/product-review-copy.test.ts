import { describe, expect, it } from "vitest";
import { productText } from "../../src/app/_components/product-copy";

describe("task-accurate hosted review outcomes", () => {
  it.each(["en", "ar"] as const)(
    "describes invitation review without delivery or new mode explanations in %s",
    (locale) => {
      expect(
        productText(
          "Review invitation example",
          "مراجعة مثال الدعوة",
          locale,
          true,
        ),
      ).toBe(locale === "en" ? "Review invitation" : "مراجعة الدعوة");
      expect(
        productText(
          "Invitation example reviewed. No email, assignment or access grant.",
          "روجع مثال الدعوة. لا بريد أو تكليف أو منح وصول.",
          locale,
          true,
        ),
      ).toBe(locale === "en" ? "Invitation reviewed." : "تمت مراجعة الدعوة.");
    },
  );

  it.each(["en", "ar"] as const)(
    "describes cohort review without a saved draft in %s",
    (locale) => {
      expect(
        productText(
          "Cohort configuration reviewed. No cohort unlocked.",
          "تمت مراجعة إعدادات المجموعة. لم تُفتح المجموعة.",
          locale,
          true,
        ),
      ).toBe(
        locale === "en"
          ? "Cohort configuration reviewed."
          : "تمت مراجعة إعدادات المجموعة.",
      );
    },
  );
});
