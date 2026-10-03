"use server";
import { revalidatePath } from "next/cache";
import { saveCurrentAcademicSettings } from "@/lib/account/account.supabase.server";
import type { AcademicContext } from "@/lib/account/account.application";

export async function saveAcademicAction(context: AcademicContext) {
  const result = await saveCurrentAcademicSettings(context);
  if (result.status === "SAVED") {
    revalidatePath("/learn");
    revalidatePath("/settings");
  }
  return result;
}
