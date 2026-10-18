import {
  accountLanguageFromLocale,
  normalizeDisplayName,
  type AccountLanguage,
  type DisplayNameError,
} from "./profile.domain";

export type ProfileSaveState =
  | Readonly<{ status: "IDLE" | "FORBIDDEN" | "UNAVAILABLE" }>
  | Readonly<{
      status: "SAVED";
      displayName: string;
      locale: "en" | "ar";
    }>
  | Readonly<{
      status: "INVALID";
      error: DisplayNameError | "LANGUAGE_INVALID";
    }>;

export interface ProfileRepository {
  /** The verified caller allowed to edit its own profile, or null. */
  eligibleCaller(): Promise<string | null>;
  save(
    caller: string,
    profile: Readonly<{ displayName: string; language: AccountLanguage }>,
  ): Promise<void>;
}

/** Saves the caller's own name and interface language (onboarding and Settings). */
export async function saveProfile(
  repository: ProfileRepository,
  input: Readonly<{ displayName: unknown; locale: unknown }>,
): Promise<ProfileSaveState> {
  const name = normalizeDisplayName(input.displayName);
  if (!name.ok) return { status: "INVALID", error: name.error };
  if (input.locale !== "en" && input.locale !== "ar")
    return { status: "INVALID", error: "LANGUAGE_INVALID" };
  try {
    const caller = await repository.eligibleCaller();
    if (!caller) return { status: "FORBIDDEN" };
    await repository.save(caller, {
      displayName: name.value,
      language: accountLanguageFromLocale(input.locale),
    });
    return { status: "SAVED", displayName: name.value, locale: input.locale };
  } catch {
    return { status: "UNAVAILABLE" };
  }
}
