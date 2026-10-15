import type {
  CatalogNode,
  CatalogSelection,
} from "../catalog/catalog-journey.application";

export type AcademicSetupField = readonly [
  keyof CatalogSelection,
  string,
  readonly CatalogNode[],
];

// Catalog resolution supplies determined values. This describes questions and
// review navigation only; it never selects a path or authorizes a save.
export function academicSetupSequence(
  fields: readonly AcademicSetupField[],
  selection: CatalogSelection,
  requestedStep: number,
) {
  const questions = fields.flatMap(([key, , options], index) =>
    options.length === 1 && selection[key] === options[0]!.id ? [] : [index],
  );
  const firstMissing = fields.findIndex(([key]) => !selection[key]);
  const requested = Number.isFinite(requestedStep)
    ? Math.max(0, Math.min(fields.length, Math.floor(requestedStep)))
    : 0;
  const start = Math.min(
    requested,
    firstMissing < 0 ? fields.length : firstMissing,
  );
  const step = questions.find((index) => index >= start) ?? fields.length;
  return {
    questions,
    step,
    ordinal: questions.indexOf(step),
    previous: questions.filter((index) => index < step).at(-1) ?? null,
    next: questions.find((index) => index > step) ?? fields.length,
  };
}
