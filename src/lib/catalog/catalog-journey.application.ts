export {
  buildCatalogHref,
  parseCatalogSelectionHints,
  resolveCatalogJourney,
  serializeCatalogSelection,
} from "./catalog-journey.domain";

export type {
  AuthorizedCatalogRow,
  CatalogJourney,
  CatalogNode,
  CatalogProgressionMode,
  CatalogSelection,
  CatalogSelectionKey,
  CatalogUnitNode,
} from "./catalog-journey.domain";

export type CatalogAccessState =
  | "READY"
  | "NO_MEMBERSHIP"
  | "COHORT_LOCKED"
  | "NO_CATALOG"
  | "UNIT_UNPUBLISHED"
  | "READY_SOURCE_MISSING";
