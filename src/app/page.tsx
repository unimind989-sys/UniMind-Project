import type { Route } from "next";
import { redirect } from "next/navigation";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { currentRoleHome } from "@/lib/account/account.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";
import { Landing } from "./_components/landing";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = resolveLocale((await searchParams).lang);
  let destination: string | null = null;
  try {
    const access = await getCurrentAuthAccess();
    if (access.gate === "READY") destination = await currentRoleHome();
    else if (access.gate === "CONSENT_REQUIRED") destination = "/consent";
    else if (access.gate === "VERIFY_EMAIL") destination = "/verify-email";
  } catch {
    /* Anonymous entry remains available if account services are unavailable. */
  }
  if (destination) redirect((destination + "?lang=" + locale) as Route);
  return <Landing locale={locale} />;
}
