// The only seam between browser tests and application modules. Browser specs
// import product fixtures and copy from here, so a source move touches one
// file instead of every spec.
export {
  actionFixtures,
  answerExamples,
  artifactTypes,
  promptExamples,
  reviewCatalogRows,
} from "../../../src/lib/demo/synthetic-fixtures.application";
export { syntheticDemoTime } from "../../../src/lib/demo/synthetic-clock.application";
export { getAdminCopy } from "../../../src/lib/i18n/admin-copy";
export { getAuthCopy } from "../../../src/lib/i18n/auth-copy";
export { getCatalogCopy } from "../../../src/lib/i18n/catalog-copy";
export { formatCollectionDate } from "../../../src/lib/i18n/collection-format";
export type { Locale } from "../../../src/lib/i18n/locale";
