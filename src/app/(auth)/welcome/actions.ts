"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import {
  accessDestination,
  validatedInternalReturnPath,
} from "@/lib/auth/auth-actions.application";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import {
  currentRoleHome,
  saveCurrentProfile,
} from "@/lib/account/account.supabase.server";
import type { ProfileSaveState } from "@/lib/account/profile.application";
import { resolveLocale } from "@/lib/i18n/locale";

export type WelcomeFormState = Readonly<{
  result: ProfileSaveState;
  /** The typed name comes back so a failed save never clears it. */
  displayName: string;
}>;

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** Completes the first-run profile step and continues to the caller's destination. */
export async function completeProfileAction(
  _state: WelcomeFormState,
  formData: FormData,
): Promise<WelcomeFormState> {
  const displayName = field(formData, "displayName");
  const locale = resolveLocale(field(formData, "locale"));
  const result = await saveCurrentProfile({ displayName, locale });
  if (result.status !== "SAVED") return { result, displayName };
  revalidatePath("/", "layout");
  const returnPath = validatedInternalReturnPath(field(formData, "returnPath"));
  let destination: string | null;
  try {
    const access = await getCurrentAuthAccess();
    destination =
      access.gate === "READY"
        ? ["/", "/learn"].includes(returnPath)
          ? await currentRoleHome()
          : returnPath
        : accessDestination(access.gate, { locale, next: returnPath });
  } catch {
    return { result: { status: "UNAVAILABLE" }, displayName };
  }
  const address = new URL(destination ?? "/learn", "https://unimind.invalid");
  address.searchParams.set("lang", locale);
  redirect((address.pathname + address.search + address.hash) as Route);
}
