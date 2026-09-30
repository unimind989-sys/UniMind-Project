"use client";

import { StudyShelf } from "@/app/learn/_components/study-shelf";
import { syntheticUnitPresentationById } from "@/app/learn/synthetic-catalog";
import {
  resolveCatalogJourney,
  type CatalogSelection,
} from "@/lib/catalog/catalog-journey.application";
import {
  reviewBase,
  reviewCatalogRows,
  sampleScopeAvailable,
  type Locale,
} from "../review-fixtures";
import { useReview } from "./review-provider";

export function ReviewCatalog({
  locale,
  selection,
}: {
  locale: Locale;
  selection: CatalogSelection;
}) {
  const { state } = useReview();
  const rows = reviewCatalogRows.filter((row) =>
    sampleScopeAvailable(state, row.cohort.id, row.unit.id),
  );
  const journey = resolveCatalogJourney(rows, selection);
  return (
    <StudyShelf
      initialLocale={locale}
      journey={journey}
      state="READY"
      basePath={`${reviewBase}/catalog`}
      synthetic
      reviewMode
      unitPresentationById={syntheticUnitPresentationById}
    />
  );
}
