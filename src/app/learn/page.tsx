import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
  serializeCatalogSelection,
  type CatalogAccessState,
} from "@/lib/catalog/catalog-journey.application";
import { loadCurrentStudentCatalog } from "@/lib/catalog/catalog-journey.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";

import { StudyShelf } from "./_components/study-shelf";

export const metadata: Metadata = {
  title: "Study Shelf | UniMind",
  description: "Your authorized bilingual curriculum catalog in UniMind.",
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

  const hints = parseCatalogSelectionHints(parameters);
  let catalogState: CatalogAccessState | "ERROR" = "ERROR";
  let journey = resolveCatalogJourney([], {});

  try {
    const catalog = await loadCurrentStudentCatalog();
    catalogState = catalog.state;
    journey = resolveCatalogJourney(catalog.rows, hints);
  } catch {
    // The UI receives one non-identifying failure state. Provider/database
    // diagnostics stay on the server-side observability seam.
  }

  const requestedQuery = serializeCatalogSelection(hints);
  if (
    catalogState === "READY" &&
    (journey.correction !== null || requestedQuery !== journey.canonicalQuery)
  ) {
    const canonical = new URLSearchParams({ lang: locale });
    for (const [key, value] of new URLSearchParams(journey.canonicalQuery)) {
      canonical.set(key, value);
    }
    redirect(`/learn?${canonical.toString()}` as Route);
  }

  if (catalogState !== "READY" && requestedQuery.length > 0) {
    redirect(`/learn?lang=${locale}` as Route);
  }

  return (
    <StudyShelf
      initialLocale={locale}
      journey={journey}
      state={catalogState}
      basePath="/learn"
      showLogout
    />
  );
}
