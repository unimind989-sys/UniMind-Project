import { describe, expect, it } from "vitest";

import { formatCollectionDate } from "../../src/lib/i18n/collection-format";

describe("collection date formatting", () => {
  it("uses the campaign's fixed Cairo time zone in English and Arabic", () => {
    const instant = "2026-10-12T20:00:00.000Z";

    expect(formatCollectionDate("en", instant)).toContain("11:00 PM");
    expect(formatCollectionDate("ar", instant)).toContain("١١:٠٠ م");
  });
});
