import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";

import { StudyShelf } from "./_components/study-shelf";
import { syntheticShelves } from "./synthetic-catalog";

export const metadata: Metadata = {
  title: "Study Shelf | UniMind",
  description: "Synthetic bilingual catalog foundation for UniMind WP03.",
};

export default async function LearnPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const parameters = await searchParams;
  const localeParameter = Array.isArray(parameters.lang)
    ? parameters.lang[0]
    : parameters.lang;
  const locale = resolveLocale(localeParameter);

  let access: Awaited<ReturnType<typeof getCurrentAuthAccess>>;
  try {
    access = await getCurrentAuthAccess();
  } catch {
    redirect(`/login?lang=${locale}&status=unavailable` as Route);
  }

  if (access.gate === "SIGN_IN") {
    redirect(`/login?lang=${locale}&next=%2Flearn` as Route);
  }
  if (access.gate === "CONSENT_REQUIRED") {
    redirect(`/consent?lang=${locale}&next=%2Flearn` as Route);
  }
  if (access.gate === "VERIFY_EMAIL") {
    redirect(`/verify-email?lang=${locale}&next=%2Flearn` as Route);
  }
  if (access.gate === "SUSPENDED" || access.gate === "DISABLED") {
    redirect(
      `/login?lang=${locale}&status=${access.gate.toLowerCase()}` as Route,
    );
  }
  if (access.gate !== "READY") {
    redirect(`/login?lang=${locale}&status=unavailable` as Route);
  }

  return (
    <StudyShelf initialLocale={locale} shelves={syntheticShelves} showLogout />
  );
}
