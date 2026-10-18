import { describe, expect, it } from "vitest";

import { accessDestination } from "../../src/lib/auth/auth-flow.domain";

describe("one access destination per gate", () => {
  it.each([
    ["SIGN_IN", "/login?lang=ar&next=%2Flearn%2Fc%2Fu%2Fchat"],
    ["VERIFY_EMAIL", "/verify-email?lang=ar&next=%2Flearn%2Fc%2Fu%2Fchat"],
    ["CONSENT_REQUIRED", "/consent?lang=ar&next=%2Flearn%2Fc%2Fu%2Fchat"],
    ["PROFILE_REQUIRED", "/welcome?lang=ar&next=%2Flearn%2Fc%2Fu%2Fchat"],
    ["SUSPENDED", "/login?lang=ar&status=suspended"],
    ["DISABLED", "/login?lang=ar&status=disabled"],
    ["ACCOUNT_PENDING", "/login?lang=ar&status=unavailable"],
    ["UNAVAILABLE", "/login?lang=ar&status=unavailable"],
  ] as const)(
    "sends %s to its resolving page in the caller's language",
    (gate, path) => {
      expect(
        accessDestination(gate, { locale: "ar", next: "/learn/c/u/chat" }),
      ).toBe(path);
    },
  );

  it("lets a ready caller continue", () => {
    expect(accessDestination("READY", { locale: "en", next: "/admin" })).toBe(
      null,
    );
  });

  it.each([
    "https://attacker.invalid/learn",
    "//attacker.invalid/learn",
    "/login",
    "/learn\r\nLocation:https://attacker.invalid",
  ])("never forwards a forged next %s", (next) => {
    expect(accessDestination("PROFILE_REQUIRED", { locale: "en", next })).toBe(
      "/welcome?lang=en&next=%2Flearn",
    );
  });

  it("keeps the batch-leader return and omits the language when unknown", () => {
    expect(
      accessDestination("CONSENT_REQUIRED", {
        next: "/batch-leader/campaigns/campaign-1",
      }),
    ).toBe("/consent?next=%2Fbatch-leader%2Fcampaigns%2Fcampaign-1");
  });
});
