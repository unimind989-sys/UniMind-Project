"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  localeCookieName,
  localeCookieOptions,
} from "@/lib/i18n/locale-preference.application";
import {
  saveCurrentAcademicSettings,
  saveCurrentProfile,
} from "@/lib/account/account.supabase.server";
import type { AcademicContext } from "@/lib/account/account.application";

export async function saveAcademicAction(context: AcademicContext) {
  const result = await saveCurrentAcademicSettings(context);
  if (result.status === "SAVED") {
    revalidatePath("/learn");
    revalidatePath("/settings");
  }
  return result;
}

/** Settings → Profile: the same seam as the first-run profile step. */
export async function saveProfileAction(input: {
  displayName: string;
  locale: "en" | "ar";
}) {
  const result = await saveCurrentProfile(input);
  if (result.status === "SAVED") {
    // Later visits without ?lang= open in the language just saved.
    (await cookies()).set(
      localeCookieName,
      result.locale,
      localeCookieOptions(process.env.NODE_ENV === "production"),
    );
    revalidatePath("/", "layout");
  }
  return result;
}
