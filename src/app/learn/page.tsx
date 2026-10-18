import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { requireReadyAccess } from "@/lib/auth/access-route.server";
import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
  serializeCatalogSelection,
  type CatalogAccessState,
  type AuthorizedCatalogRow,
} from "@/lib/catalog/catalog-journey.application";
import { loadCurrentStudentCatalog } from "@/lib/catalog/catalog-journey.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";

import { StudyShelf } from "./_components/study-shelf";
import {
  loadCurrentAccount,
  loadCurrentStudyResume,
} from "@/lib/account/account.supabase.server";
import {
  authorizedAcademicContext,
  type AcademicContext,
} from "@/lib/account/account.application";
import { AppShell } from "@/app/_components/app-shell";
import { AcademicSettings } from "@/app/_components/academic-settings";
import { saveAcademicAction } from "@/app/settings/actions";

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

  await requireReadyAccess({ locale, next: "/learn" });

  const hints = parseCatalogSelectionHints(parameters);
  let catalogState: CatalogAccessState | "ERROR" = "ERROR";
  let journey = resolveCatalogJourney([], {});
  let lastStudyPath: string | null = null;
  let profileName: string | null = null;
  let setup: {
    rows: readonly AuthorizedCatalogRow[];
    academicContext: AcademicContext | null;
  } | null = null;

  try {
    const [catalog, account] = await Promise.all([
      loadCurrentStudentCatalog(),
      loadCurrentAccount(),
    ]);
    profileName = account.displayName;
    catalogState = catalog.state;
    const saved = authorizedAcademicContext(
      account.academicContext,
      catalog.rows,
    );
    journey = resolveCatalogJourney(
      catalog.rows,
      Object.keys(hints).length > 0 ? hints : (saved ?? {}),
    );
    if (catalog.state === "READY" && journey.selectedCohort) {
      lastStudyPath = await loadCurrentStudyResume(
        catalog.rows,
        journey.selectedCohort.id,
      );
    }
    if (
      catalog.state === "READY" &&
      !saved &&
      Object.keys(hints).length === 0
    ) {
      setup = { rows: catalog.rows, academicContext: account.academicContext };
    }
  } catch {
    // The UI receives one non-identifying failure state. Provider/database
    // diagnostics stay on the server-side observability seam.
  }

  const requestedQuery = serializeCatalogSelection(hints);
  if (setup)
    return (
      <AppShell
        locale={locale}
        profileName={profileName}
        title={locale === "ar" ? "المذاكرة" : "Study"}
      >
        <AcademicSettings
          locale={locale}
          rows={setup.rows}
          initialContext={setup.academicContext}
          save={saveAcademicAction}
          onboarding
        />
      </AppShell>
    );
  if (
    catalogState === "READY" &&
    (journey.correction !== null || requestedQuery !== journey.canonicalQuery)
  ) {
    const canonical = new URLSearchParams({ lang: locale });
    if (parameters.view === "subjects") canonical.set("view", "subjects");
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
      lastStudyPath={lastStudyPath}
      profileName={profileName}
    />
  );
}
