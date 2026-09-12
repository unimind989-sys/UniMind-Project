import type { Locale } from "../i18n/locale";

export const curriculumUnitNouns = ["module", "subject"] as const;

export type CurriculumUnitNoun = (typeof curriculumUnitNouns)[number];

export type ProgramTerminology = Readonly<{
  curriculumUnitNoun: CurriculumUnitNoun;
}>;

const terms = {
  module: {
    en: { one: "Module", many: "Modules" },
    ar: { one: "وحدة", many: "وحدات" },
  },
  subject: {
    en: { one: "Subject", many: "Subjects" },
    ar: { one: "مادة", many: "مواد" },
  },
} as const satisfies Record<
  CurriculumUnitNoun,
  Record<Locale, { one: string; many: string }>
>;

export function curriculumUnitLabel(
  terminology: ProgramTerminology,
  locale: Locale,
  count: number,
): string {
  const plurality = count === 1 ? "one" : "many";
  return terms[terminology.curriculumUnitNoun][locale][plurality];
}
