import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { syntheticDemoTime as time } from "../../src/lib/demo/synthetic-clock.application";

afterEach(() => vi.useRealTimers());

describe("synthetic calendar reference", () => {
  it("keeps the downloadable scenario register bound to the runtime calendar", () => {
    const pack = JSON.parse(
      readFileSync(
        new URL("../../public/demo-files/test-data.json", import.meta.url),
        "utf8",
      ),
    ) as {
      calendar: typeof time & {
        collectionDisplayTimeZone: string;
        newSubmissionReceivedAt: string;
      };
    };
    expect(pack.calendar).toMatchObject({
      ...time,
      collectionDisplayTimeZone: "Africa/Cairo",
      newSubmissionReceivedAt: time.now,
    });
  });

  it("puts normal deadlines ahead of the clock and expired examples behind it", () => {
    const now = Date.parse(time.now);
    expect(Date.parse(time.campaignOpensAt)).toBeLessThan(now);
    expect(Date.parse(time.historicalSubmittedAt)).toBeLessThan(now);
    expect(Date.parse(time.expiredAt)).toBeLessThan(now);
    expect(Date.parse(time.assignmentExpiresAt)).toBeGreaterThan(now);
    expect(Date.parse(time.campaignClosesAt)).toBeGreaterThan(
      Date.parse(time.assignmentExpiresAt),
    );
  });

  it.each(["2025-01-01T00:00:00Z", "2028-12-31T23:00:00Z"])(
    "keeps the same calendar and new-receipt reference when the device date is %s",
    (deviceDate) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(deviceDate));
      expect(time.now).toBe("2026-10-01T12:00:00.000Z");
      expect(time.clockLabel).toBe("2026-10-01 12:00 UTC");
    },
  );
});
