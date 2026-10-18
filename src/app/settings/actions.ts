"use server";
import { revalidatePath } from "next/cache";
import { rememberInterfaceLanguage } from "@/lib/i18n/locale-cookie.server";
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
    await rememberInterfaceLanguage(result.locale);
    revalidatePath("/", "layout");
  }
  return result;
}
