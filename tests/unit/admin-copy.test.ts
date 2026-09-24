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

  it("localizes the first founder shown on a pending confirmation", () => {
    expect(getAdminCopy("en").founderAhmed).toBe("Ahmed");
    expect(getAdminCopy("ar").founderAhmed).toBe("أحمد");
    expect(getAdminCopy("en").founderZiad).toBe("Ziad");
    expect(getAdminCopy("ar").founderZiad).toBe("زياد");
  });
});
