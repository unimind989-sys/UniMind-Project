import { describe, expect, it } from "vitest";
import { studyRecovery } from "../../src/lib/study/study-recovery.application";

describe("prepared study recovery presentation", () => {
  it.each(["quota", "capacity", "offline", "error", "stale"])(
    "%s offers a tool-specific temporary action without a reset-time promise",
    (condition) => {
      for (const locale of ["en", "ar"] as const) {
        const chat = studyRecovery("chat", condition, locale)!;
        const studio = studyRecovery("studio", condition, locale)!;
        expect(chat.transient).toBe(true);
        expect(chat.retryLabel).toBeTruthy();
        expect(chat.message).not.toBe(studio.message);
        expect(chat.detail).not.toMatch(/\d/u);
        expect(chat.detail).not.toContain("approved numeric");
      }
    },
  );
  it.each([
    "empty",
    "no-membership",
    "forbidden",
    "wrong-scope",
    "locked",
    "unpublished",
    "no-ready-source",
    "expired",
    "replayed",
  ])(
    "%s cannot be repaired by clearing its prepared condition",
    (condition) => {
      for (const locale of ["en", "ar"] as const) {
        const view = studyRecovery("chat", condition, locale)!;
        expect(view.transient).toBe(false);
        expect(view.retryLabel).toBeNull();
        expect(view.message).not.toContain("Chat");
        expect(view.detail).toBeTruthy();
      }
    },
  );
  it("does not classify unrelated routes or unknown/prototype keys", () => {
    expect(studyRecovery("collection", "offline", "en")).toBeNull();
    expect(studyRecovery("constructor", "error", "en")).toBeNull();
    expect(studyRecovery("chat", "constructor", "en")).toBeNull();
    expect(studyRecovery("chat", "ready", "en")).toBeNull();
  });
  it("classifies Shelf failures with a temporary action only for recoverable conditions", () => {
    for (const locale of ["en", "ar"] as const) {
      for (const condition of [
        "quota",
        "capacity",
        "offline",
        "error",
        "stale",
      ]) {
        const shelf = studyRecovery("catalog", condition, locale)!;
        expect(shelf.transient).toBe(true);
        expect(shelf.retryLabel).toContain(
          locale === "ar" ? "رف المذاكرة" : "Study Shelf",
        );
      }
      for (const condition of [
        "no-membership",
        "locked",
        "unpublished",
        "no-ready-source",
      ]) {
        const shelf = studyRecovery("catalog", condition, locale)!;
        expect(shelf.transient).toBe(false);
        expect(shelf.retryLabel).toBeNull();
      }
    }
  });
  it("refreshes stale views and keeps a denied view non-identifying", () => {
    expect(studyRecovery("studio", "stale", "en")!.retryLabel).toBe(
      "Refresh Studio view",
    );
    expect(studyRecovery("chat", "forbidden", "en")).toEqual(
      studyRecovery("studio", "wrong-scope", "en"),
    );
  });
});
