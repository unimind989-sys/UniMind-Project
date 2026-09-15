import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
  serializeCatalogSelection,
  type CatalogAccessState,
} from "@/lib/catalog/catalog-journey.application";
import { resolveLocale } from "@/lib/i18n/locale";

import { StudyShelf } from "../../learn/_components/study-shelf";
import {
  syntheticCatalogRows,
  syntheticUnitPresentationById,
} from "../../learn/synthetic-catalog";

export const metadata: Metadata = {
  title: "Study Shelf synthetic preview | UniMind",
  robots: { index: false, follow: false },
};

export default async function StudyShelfPreviewPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const parameters = await searchParams;
  const localeParameter = Array.isArray(parameters.lang)
    ? parameters.lang[0]
    : parameters.lang;
  const locale = resolveLocale(localeParameter);
  const fixtureParameter = Array.isArray(parameters.state)
    ? parameters.state[0]
    : parameters.state;
  const states: Readonly<Record<string, CatalogAccessState | "ERROR">> = {
    "no-membership": "NO_MEMBERSHIP",
    locked: "COHORT_LOCKED",
    "no-catalog": "NO_CATALOG",
    unpublished: "UNIT_UNPUBLISHED",
    "no-ready-source": "READY_SOURCE_MISSING",
    error: "ERROR",
  };
  const state =
    fixtureParameter === undefined
      ? "READY"
      : (states[fixtureParameter] ?? "ERROR");
  const hints = parseCatalogSelectionHints(parameters);
  const journey = resolveCatalogJourney(
    state === "READY" ? syntheticCatalogRows : [],
    hints,
  );
  const requestedQuery = serializeCatalogSelection(hints);

  if (
    state === "READY" &&
    (journey.correction !== null || requestedQuery !== journey.canonicalQuery)
  ) {
    const canonical = new URLSearchParams({ lang: locale });
    for (const [key, value] of new URLSearchParams(journey.canonicalQuery)) {
      canonical.set(key, value);
    }
    redirect(`/preview/learn?${canonical.toString()}`);
  }

  if (state !== "READY" && requestedQuery.length > 0) {
    const safe = new URLSearchParams({ lang: locale });
    safe.set(
      "state",
      fixtureParameter !== undefined && states[fixtureParameter] !== undefined
        ? fixtureParameter
        : "error",
    );
    redirect(`/preview/learn?${safe.toString()}`);
  }

  return (
    <StudyShelf
      initialLocale={locale}
      journey={journey}
      state={state}
      basePath="/preview/learn"
      synthetic
      unitPresentationById={syntheticUnitPresentationById}
    />
  );
}
