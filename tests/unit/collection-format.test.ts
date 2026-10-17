import { describe, expect, it } from "vitest";

import {
  collectionTimeLeft,
  formatCollectionDate,
  formatCollectionTimeLeft,
} from "../../src/lib/i18n/collection-format";

describe("collection date formatting", () => {
  it("uses the campaign's fixed Cairo time zone in English and Arabic", () => {
    const instant = "2026-10-12T20:00:00.000Z";

    expect(formatCollectionDate("en", instant)).toContain("11:00 PM");
    expect(formatCollectionDate("ar", instant)).toContain("١١:٠٠ م");
  });
});

describe("collection time left", () => {
  const deadline = "2026-10-10T20:00:00.000Z";
  const at = (iso: string) => Date.parse(iso);

  it("counts whole days, then hours, then minutes, with urgency", () => {
    expect(collectionTimeLeft(deadline, at("2026-10-01T12:00:00Z"))).toEqual({
      unit: "day",
      value: 9,
      urgency: "calm",
    });
    expect(collectionTimeLeft(deadline, at("2026-10-06T20:00:00Z"))).toEqual({
      unit: "day",
      value: 4,
      urgency: "soon",
    });
    expect(collectionTimeLeft(deadline, at("2026-10-09T10:30:00Z"))).toEqual({
      unit: "hour",
      value: 33,
      urgency: "urgent",
    });
    expect(collectionTimeLeft(deadline, at("2026-10-10T19:59:30Z"))).toEqual({
      unit: "minute",
      value: 1,
      urgency: "urgent",
    });
  });

  it("returns nothing once the deadline has passed or is unreadable", () => {
    expect(collectionTimeLeft(deadline, at(deadline))).toBeNull();
    expect(collectionTimeLeft("not a date", 0)).toBeNull();
  });

  it("formats the remaining time in English and Arabic", () => {
    expect(
      formatCollectionTimeLeft("en", {
        unit: "day",
        value: 9,
        urgency: "calm",
      }),
    ).toBe("9 days left");
    expect(
      formatCollectionTimeLeft("en", {
        unit: "hour",
        value: 1,
        urgency: "urgent",
      }),
    ).toBe("1 hour left");
    expect(
      formatCollectionTimeLeft("ar", {
        unit: "day",
        value: 9,
        urgency: "calm",
      }),
    ).toContain("٩");
  });
});
