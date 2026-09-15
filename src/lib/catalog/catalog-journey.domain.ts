export type CatalogNode = Readonly<{
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
}>;

export type CatalogProgressionMode = "TERM_BASED" | "FLEXIBLE_CREDIT";

export type CatalogProgramNode = CatalogNode &
  Readonly<{
    progressionMode: CatalogProgressionMode;
    unitType: "MODULE" | "SUBJECT";
    unitLabelSingularEn: string;
    unitLabelPluralEn: string;
    unitLabelSingularAr: string;
    unitLabelPluralAr: string;
  }>;

export type CatalogCohortNode = CatalogNode &
  Readonly<{
    curriculumEdition: string;
  }>;

export type CatalogUnitNode = CatalogNode &
  Readonly<{
    unitType: "MODULE" | "SUBJECT";
    sourceCount?: number;
  }>;

export type AuthorizedCatalogRow = Readonly<{
  stage: CatalogNode;
  institution: CatalogNode;
  program: CatalogProgramNode;
  level: CatalogNode;
  term: CatalogNode;
  cohort: CatalogCohortNode;
  unit: CatalogUnitNode;
}>;

export type CatalogSelection = Readonly<{
  stageId?: string;
  institutionId?: string;
  programId?: string;
  levelId?: string;
  termId?: string;
  cohortId?: string;
  unitId?: string;
}>;

export type CatalogSelectionKey =
  "stage" | "institution" | "program" | "level" | "term" | "cohort" | "unit";

const selectionContract = [
  { parameter: "stage", property: "stageId", rowProperty: "stage" },
  {
    parameter: "institution",
    property: "institutionId",
    rowProperty: "institution",
  },
  { parameter: "program", property: "programId", rowProperty: "program" },
  { parameter: "level", property: "levelId", rowProperty: "level" },
  { parameter: "term", property: "termId", rowProperty: "term" },
  { parameter: "cohort", property: "cohortId", rowProperty: "cohort" },
  { parameter: "unit", property: "unitId", rowProperty: "unit" },
] as const;

type SelectionProperty = (typeof selectionContract)[number]["property"];
type RowProperty = (typeof selectionContract)[number]["rowProperty"];

export type CatalogJourney = Readonly<{
  selection: CatalogSelection;
  options: Readonly<{
    stages: readonly CatalogNode[];
    institutions: readonly CatalogNode[];
    programs: readonly CatalogProgramNode[];
    levels: readonly CatalogNode[];
    terms: readonly CatalogNode[];
    cohorts: readonly CatalogCohortNode[];
  }>;
  units: readonly CatalogUnitNode[];
  selectedStage: CatalogNode | null;
  selectedProgram: CatalogProgramNode | null;
  selectedCohort: CatalogCohortNode | null;
  canonicalQuery: string;
  correction: "INVALID_HINT" | null;
}>;

function boundedHint(value: string | string[] | undefined) {
  const firstValue = Array.isArray(value) ? value[0] : value;
  if (
    firstValue === undefined ||
    firstValue.length === 0 ||
    firstValue.length > 128 ||
    !/^[A-Za-z0-9_-]+$/u.test(firstValue)
  ) {
    return undefined;
  }

  return firstValue;
}

export function parseCatalogSelectionHints(
  parameters: Readonly<Record<string, string | string[] | undefined>>,
): CatalogSelection {
  const selection: Record<string, string> = {};

  for (const { parameter, property } of selectionContract) {
    const hint = boundedHint(parameters[parameter]);
    if (hint !== undefined) {
      selection[property] = hint;
    }
  }

  return selection;
}

function uniqueSortedOptions(
  rows: readonly AuthorizedCatalogRow[],
  property: RowProperty,
): readonly CatalogNode[] {
  const options = new Map<string, CatalogNode>();
  for (const row of rows) {
    const option = row[property];
    options.set(option.id, option);
  }

  return [...options.values()].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.code.localeCompare(right.code),
  );
}

export function serializeCatalogSelection(selection: CatalogSelection) {
  const parameters = new URLSearchParams();
  for (const { parameter, property } of selectionContract) {
    const value = selection[property];
    if (value !== undefined) {
      parameters.set(parameter, value);
    }
  }
  return parameters.toString();
}

export function resolveCatalogJourney(
  authorizedRows: readonly AuthorizedCatalogRow[],
  hints: CatalogSelection,
): CatalogJourney {
  let candidates = [...authorizedRows];
  const selection: Record<string, string> = {};
  const optionsByProperty = new Map<RowProperty, readonly CatalogNode[]>();
  let correction: "INVALID_HINT" | null = null;
  let canContinue = true;

  for (const { property, rowProperty } of selectionContract) {
    const options = canContinue
      ? uniqueSortedOptions(candidates, rowProperty)
      : [];
    optionsByProperty.set(rowProperty, options);

    const suppliedHint = hints[property];
    const hint =
      suppliedHint ?? (options.length === 1 ? options[0]?.id : undefined);
    if (!canContinue || hint === undefined) {
      if (suppliedHint !== undefined || hasDownstreamHint(hints, property)) {
        correction = "INVALID_HINT";
      }
      canContinue = false;
      continue;
    }

    if (!options.some((option) => option.id === hint)) {
      correction = "INVALID_HINT";
      canContinue = false;
      continue;
    }

    selection[property] = hint;
    candidates = candidates.filter((row) => row[rowProperty].id === hint);
  }

  const resolvedSelection = selection as CatalogSelection;
  const units = optionsByProperty.get("unit") ?? [];
  const stages = optionsByProperty.get("stage") ?? [];
  const programs = optionsByProperty.get("program") ?? [];
  const cohorts = optionsByProperty.get("cohort") ?? [];

  return {
    selection: resolvedSelection,
    options: {
      stages,
      institutions: optionsByProperty.get("institution") ?? [],
      programs: programs as readonly CatalogProgramNode[],
      levels: optionsByProperty.get("level") ?? [],
      terms: optionsByProperty.get("term") ?? [],
      cohorts: cohorts as readonly CatalogCohortNode[],
    },
    units: units as readonly CatalogUnitNode[],
    selectedStage:
      stages.find((stage) => stage.id === selection.stageId) ?? null,
    selectedProgram:
      (programs.find((program) => program.id === selection.programId) as
        CatalogProgramNode | undefined) ?? null,
    selectedCohort:
      (cohorts.find((cohort) => cohort.id === selection.cohortId) as
        CatalogCohortNode | undefined) ?? null,
    canonicalQuery: serializeCatalogSelection(resolvedSelection),
    correction,
  };
}

function hasDownstreamHint(
  hints: CatalogSelection,
  property: SelectionProperty,
) {
  const index = selectionContract.findIndex(
    (contract) => contract.property === property,
  );
  return selectionContract
    .slice(index + 1)
    .some((contract) => hints[contract.property] !== undefined);
}

export function buildCatalogHref(
  pathname: string,
  locale: "en" | "ar",
  selection: CatalogSelection,
  changedKey: CatalogSelectionKey,
  changedValue: string,
) {
  const parameters = new URLSearchParams({ lang: locale });
  const changedIndex = selectionContract.findIndex(
    (contract) => contract.parameter === changedKey,
  );

  for (const [index, contract] of selectionContract.entries()) {
    if (index > changedIndex) break;
    const value =
      index === changedIndex ? changedValue : selection[contract.property];
    if (value !== undefined && value.length > 0) {
      parameters.set(contract.parameter, value);
    }
  }

  return `${pathname}?${parameters.toString()}`;
}
