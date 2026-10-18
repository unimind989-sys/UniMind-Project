import { describe, expect, it, vi } from "vitest";

import {
  accountLanguageFromLocale,
  isProfileComplete,
  localeFromAccountLanguage,
  normalizeDisplayName,
} from "../../src/lib/account/profile.domain";
import {
  saveProfile,
  type ProfileRepository,
} from "../../src/lib/account/profile.application";

describe("profile name rules", () => {
  it.each([
    ["  Samir   Hassan ", "Samir Hassan"],
    ["سمير حسن", "سمير حسن"],
    ["Hala Mansour منصور", "Hala Mansour منصور"],
    ["Samir\tHassan", "Samir Hassan"],
    ["O'Brien-Smith", "O'Brien-Smith"],
    ["élise", "élise"],
  ])("normalizes %j", (input, value) => {
    expect(normalizeDisplayName(input)).toEqual({ ok: true, value });
  });

  it.each([
    [undefined, "DISPLAY_NAME_REQUIRED"],
    ["   ", "DISPLAY_NAME_REQUIRED"],
    ["a".repeat(81), "DISPLAY_NAME_TOO_LONG"],
    ["12345", "DISPLAY_NAME_INVALID"],
    ["Samir\u202EnassaH", "DISPLAY_NAME_INVALID"],
    ["سمير\u200Fحسن", "DISPLAY_NAME_INVALID"],
    ["Samir\u0000", "DISPLAY_NAME_INVALID"],
    ["Samir\u0085", "DISPLAY_NAME_INVALID"],
  ])("rejects %j", (input, error) => {
    expect(normalizeDisplayName(input)).toEqual({ ok: false, error });
  });

  it("accepts exactly 80 characters, counting each Arabic letter once", () => {
    expect(normalizeDisplayName("ع".repeat(80))).toMatchObject({ ok: true });
  });

  it("derives completion from the stored name only", () => {
    expect(isProfileComplete("Samir")).toBe(true);
    expect(isProfileComplete("")).toBe(false);
    expect(isProfileComplete("  ")).toBe(false);
    expect(isProfileComplete(null)).toBe(false);
  });

  it("maps the interface language to the account language and back", () => {
    expect(accountLanguageFromLocale("ar")).toBe("AR_EG");
    expect(accountLanguageFromLocale("en")).toBe("EN");
    expect(localeFromAccountLanguage("AR_EG")).toBe("ar");
    expect(localeFromAccountLanguage("EN")).toBe("en");
    expect(localeFromAccountLanguage("MIXED")).toBe(null);
  });
});

describe("profile save seam", () => {
  const repository = (caller: string | null = "user-1") =>
    ({
      eligibleCaller: vi.fn().mockResolvedValue(caller),
      save: vi.fn().mockResolvedValue(undefined),
    }) satisfies ProfileRepository;

  it("saves the normalized name and account language for the caller", async () => {
    const store = repository();
    await expect(
      saveProfile(store, { displayName: " Samir  Hassan ", locale: "ar" }),
    ).resolves.toEqual({
      status: "SAVED",
      displayName: "Samir Hassan",
      locale: "ar",
    });
    expect(store.save).toHaveBeenCalledWith("user-1", {
      displayName: "Samir Hassan",
      language: "AR_EG",
    });
  });

  it("rejects invalid input before reading the caller", async () => {
    const store = repository();
    await expect(
      saveProfile(store, { displayName: "", locale: "en" }),
    ).resolves.toEqual({ status: "INVALID", error: "DISPLAY_NAME_REQUIRED" });
    await expect(
      saveProfile(store, { displayName: "Samir", locale: "fr" }),
    ).resolves.toEqual({ status: "INVALID", error: "LANGUAGE_INVALID" });
    expect(store.eligibleCaller).not.toHaveBeenCalled();
    expect(store.save).not.toHaveBeenCalled();
  });

  it("refuses an ineligible caller and hides storage failures", async () => {
    const denied = repository(null);
    await expect(
      saveProfile(denied, { displayName: "Samir", locale: "en" }),
    ).resolves.toEqual({ status: "FORBIDDEN" });
    expect(denied.save).not.toHaveBeenCalled();
    const failing = repository();
    failing.save.mockRejectedValue(new Error("database detail"));
    await expect(
      saveProfile(failing, { displayName: "Samir", locale: "en" }),
    ).resolves.toEqual({ status: "UNAVAILABLE" });
  });
});
