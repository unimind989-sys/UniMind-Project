import { describe, expect, it } from "vitest";

import { getAdminCopy } from "../../src/lib/i18n/admin-copy";

describe("bilingual admin copy", () => {
  it("localizes every governed state and the language control", () => {
    const english = getAdminCopy("en");
    const arabic = getAdminCopy("ar");
    const states = [
      "DRAFT",
      "WITHDRAWN",
      "PUBLISHED",
      "LOCKED",
      "UNLOCKED",
      "ACTIVE",
      "INACTIVE",
      "DEACTIVATED",
      "FAILED",
      "NEEDS_REVIEW",
      "QUARANTINED",
      "PENDING_OWNER_REVIEW",
      "STORED",
      "HELD",
      "DISABLED",
      "ENABLED",
    ] as const;

    expect(english.language).toBe("Language");
    expect(arabic.language).toBe("اللغة");
    for (const state of states) {
      expect(english.states[state]).not.toBe(state);
      expect(arabic.states[state]).not.toBe(state);
      expect(arabic.states[state]).not.toBe(english.states[state]);
    }
  });
});
