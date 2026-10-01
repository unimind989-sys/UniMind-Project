import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
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
  let lastStudyPath: string | null = null;
  let setup: {
    rows: readonly AuthorizedCatalogRow[];
    academicContext: AcademicContext | null;
  } | null = null;

  try {
    const [catalog, account] = await Promise.all([
      loadCurrentStudentCatalog(),
      loadCurrentAccount(),
    ]);
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
      <AppShell locale={locale} title={locale === "ar" ? "المذاكرة" : "Study"}>
        <h1>
          {locale === "ar" ? "مرحبًا بك في UniMind" : "Welcome to UniMind"}
        </h1>
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
      showLogout
      lastStudyPath={lastStudyPath}
    />
  );
}
