// Profile rules for the first-run step and Settings. The profile is complete
// when its display name is non-empty; there is no stored onboarding flag.

export const displayNameMaxLength = 80;

export type DisplayNameError =
  "DISPLAY_NAME_REQUIRED" | "DISPLAY_NAME_TOO_LONG" | "DISPLAY_NAME_INVALID";

export type AccountLanguage = "EN" | "AR_EG";

// Control characters and bidirectional controls can reorder or hide text
// where the name is shown to other people (Arabic letter mark, LRM/RLM,
// embeddings, overrides and isolates).
const forbidden = /[\p{Cc}؜‎‏‪-‮⁦-⁩]/u;

/** Normalizes a typed name (NFC, trimmed, single spaces) or explains why it cannot be saved. */
export function normalizeDisplayName(
  input: unknown,
):
  | Readonly<{ ok: true; value: string }>
  | Readonly<{ ok: false; error: DisplayNameError }> {
  if (typeof input !== "string")
    return { ok: false, error: "DISPLAY_NAME_REQUIRED" };
  if (forbidden.test(input.replace(/[\t\n\r]/gu, " ")))
    return { ok: false, error: "DISPLAY_NAME_INVALID" };
  const value = input.normalize("NFC").trim().replace(/\s+/gu, " ");
  if (value.length === 0) return { ok: false, error: "DISPLAY_NAME_REQUIRED" };
  if (Array.from(value).length > displayNameMaxLength)
    return { ok: false, error: "DISPLAY_NAME_TOO_LONG" };
  if (!/\p{L}/u.test(value))
    return { ok: false, error: "DISPLAY_NAME_INVALID" };
  return { ok: true, value };
}

export function isProfileComplete(displayName: unknown): boolean {
  return typeof displayName === "string" && displayName.trim().length > 0;
}

/** The interface language stored as the account language. */
export function accountLanguageFromLocale(
  locale: "en" | "ar",
): AccountLanguage {
  return locale === "ar" ? "AR_EG" : "EN";
}

/** `MIXED` (a study-language value) carries no interface preference. */
export function localeFromAccountLanguage(value: unknown): "en" | "ar" | null {
  return value === "AR_EG" ? "ar" : value === "EN" ? "en" : null;
}
