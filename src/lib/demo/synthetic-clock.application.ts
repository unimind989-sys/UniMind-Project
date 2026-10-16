// Calendar fixtures have one fixed reference, independent of the review date.
// This never supplies a clock to real authorization, expiry or retention rules.
const now = "2026-10-01T12:00:00.000Z";
function offset(hours: number): string {
  return new Date(Date.parse(now) + hours * 60 * 60 * 1_000).toISOString();
}

export const syntheticDemoTime = Object.freeze({
  now,
  timeZone: "UTC",
  clockLabel: `${now.slice(0, 16).replace("T", " ")} UTC`,
  campaignOpensAt: offset(-30 * 24 - 12),
  assignmentExpiresAt: offset(9 * 24 + 8),
  campaignClosesAt: offset(11 * 24 + 8),
  expiredAt: offset(-24),
  historicalSubmittedAt: offset(-11 * 24 - 2),
});
