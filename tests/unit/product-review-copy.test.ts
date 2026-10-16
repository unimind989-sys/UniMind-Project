import { describe, expect, it } from "vitest";
import { productText } from "../../src/app/_components/product-copy";

describe("hosted product copy overrides", () => {
  it("passes text through unless a hosted override exists for the English key", () => {
    const en = "Review invitation example";
    const ar = "مراجعة مثال الدعوة";

    expect(productText(en, ar, "en", false)).toBe(en);
    expect(productText(en, ar, "ar", false)).toBe(ar);
    expect(productText("Unmapped synthetic text", "نص", "ar", true)).toBe("نص");
    expect(productText(en, ar, "en", true)).toBe("Review invitation");
    expect(productText(en, ar, "ar", true)).toBe("مراجعة الدعوة");
  });
});
