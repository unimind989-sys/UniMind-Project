import type { AuthorizedCatalogRow } from "@/lib/catalog/catalog-journey.application";

export type UnitPresentation = Readonly<{
  image: string;
  descriptionEn?: string;
  descriptionAr?: string;
}>;

type SyntheticUnit = Readonly<{
  id: string;
  nameEn: string;
  nameAr: string;
  image: string;
  sourceCount: number;
  descriptionEn: string;
  descriptionAr: string;
}>;

type SyntheticProgram = Readonly<{
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
  progressionMode: "TERM_BASED" | "FLEXIBLE_CREDIT";
  unitType: "MODULE" | "SUBJECT";
  unitLabelSingularEn: string;
  unitLabelPluralEn: string;
  unitLabelSingularAr: string;
  unitLabelPluralAr: string;
  years: readonly (1 | 2 | 3)[];
  units: readonly SyntheticUnit[];
}>;

const humanMedicineUnits: readonly SyntheticUnit[] = [
  {
    id: "anatomy",
    nameEn: "Anatomy",
    nameAr: "علم التشريح",
    image: "/images/study-shelf/clinical-medicine.png",
    sourceCount: 8,
    descriptionEn: "Structure, regional anatomy, and clinical relationships.",
    descriptionAr: "البنية والتشريح الموضعي والعلاقات السريرية.",
  },
  {
    id: "biochemistry",
    nameEn: "Biochemistry",
    nameAr: "الكيمياء الحيوية",
    image: "/images/study-shelf/biochemistry.png",
    sourceCount: 11,
    descriptionEn: "Biomolecules, enzymes, metabolism, and regulation.",
    descriptionAr: "الجزيئات الحيوية والإنزيمات والأيض وتنظيمه.",
  },
  {
    id: "physiology",
    nameEn: "Physiology",
    nameAr: "وظائف الأعضاء",
    image: "/images/study-shelf/physiology.png",
    sourceCount: 10,
    descriptionEn: "Integrated organ function and homeostatic control.",
    descriptionAr: "تكامل وظائف الأعضاء وآليات الاتزان الداخلي.",
  },
  {
    id: "pathology",
    nameEn: "Pathology",
    nameAr: "علم الأمراض",
    image: "/images/study-shelf/pathology.png",
    sourceCount: 6,
    descriptionEn: "Mechanisms of injury, adaptation, and disease patterns.",
    descriptionAr: "آليات الإصابة والتكيف وأنماط الأمراض.",
  },
  {
    id: "pharmacology",
    nameEn: "Pharmacology",
    nameAr: "علم الأدوية",
    image: "/images/study-shelf/pharmacology.png",
    sourceCount: 9,
    descriptionEn: "Drug actions, kinetics, safety, and clinical use.",
    descriptionAr: "تأثيرات الأدوية وحركتها وسلامتها واستخدامها السريري.",
  },
];

const veterinaryMedicineUnits: readonly SyntheticUnit[] = [
  {
    id: "veterinary-anatomy",
    nameEn: "Veterinary Anatomy",
    nameAr: "تشريح بيطري",
    image: "/images/study-shelf/clinical-medicine.png",
    sourceCount: 7,
    descriptionEn: "Comparative structure across common domestic species.",
    descriptionAr: "التشريح المقارن بين أنواع الحيوانات المنزلية الشائعة.",
  },
  {
    id: "animal-physiology",
    nameEn: "Animal Physiology",
    nameAr: "فسيولوجيا الحيوان",
    image: "/images/study-shelf/physiology.png",
    sourceCount: 9,
    descriptionEn: "Integrated organ function across animal species.",
    descriptionAr: "تكامل وظائف الأعضاء في الأنواع الحيوانية المختلفة.",
  },
  {
    id: "veterinary-microbiology",
    nameEn: "Veterinary Microbiology",
    nameAr: "الميكروبيولوجيا البيطرية",
    image: "/images/study-shelf/microbiology.png",
    sourceCount: 8,
    descriptionEn: "Animal pathogens, transmission, and laboratory basics.",
    descriptionAr: "مسببات أمراض الحيوان وانتقالها وأساسيات المختبر.",
  },
  {
    id: "animal-nutrition",
    nameEn: "Animal Nutrition",
    nameAr: "تغذية الحيوان",
    image: "/images/study-shelf/gastrointestinal.png",
    sourceCount: 6,
    descriptionEn: "Nutrient requirements, feeds, and ration principles.",
    descriptionAr: "الاحتياجات الغذائية والأعلاف ومبادئ تكوين العلائق.",
  },
  {
    id: "veterinary-pathology",
    nameEn: "Veterinary Pathology",
    nameAr: "الباثولوجيا البيطرية",
    image: "/images/study-shelf/pathology.png",
    sourceCount: 5,
    descriptionEn: "Disease mechanisms and tissue changes in animals.",
    descriptionAr: "آليات المرض والتغيرات النسيجية في الحيوانات.",
  },
];

const highSchoolUnits: readonly SyntheticUnit[] = [
  {
    id: "biology",
    nameEn: "Biology",
    nameAr: "الأحياء",
    image: "/images/study-shelf/cell-biology.png",
    sourceCount: 8,
    descriptionEn: "Synthetic Thanaweya Amma biology material.",
    descriptionAr: "محتوى تجريبي لمادة الأحياء بالثانوية العامة.",
  },
  {
    id: "chemistry",
    nameEn: "Chemistry",
    nameAr: "الكيمياء",
    image: "/images/study-shelf/biochemistry.png",
    sourceCount: 7,
    descriptionEn: "Synthetic Thanaweya Amma chemistry material.",
    descriptionAr: "محتوى تجريبي لمادة الكيمياء بالثانوية العامة.",
  },
  {
    id: "physics",
    nameEn: "Physics",
    nameAr: "الفيزياء",
    image: "/images/study-shelf/cardiovascular.png",
    sourceCount: 6,
    descriptionEn: "Synthetic Thanaweya Amma physics material.",
    descriptionAr: "محتوى تجريبي لمادة الفيزياء بالثانوية العامة.",
  },
];

const universityPrograms: readonly SyntheticProgram[] = [
  {
    id: "human-medicine",
    code: "HUMAN_MEDICINE",
    nameEn: "Faculty of Medicine",
    nameAr: "كلية الطب البشري",
    sortOrder: 1,
    progressionMode: "TERM_BASED",
    unitType: "MODULE",
    unitLabelSingularEn: "Module",
    unitLabelPluralEn: "Modules",
    unitLabelSingularAr: "وحدة",
    unitLabelPluralAr: "وحدات",
    years: [1, 2, 3],
    units: humanMedicineUnits,
  },
  {
    id: "veterinary-medicine",
    code: "VETERINARY_MEDICINE",
    nameEn: "Faculty of Veterinary Medicine",
    nameAr: "كلية الطب البيطري",
    sortOrder: 2,
    progressionMode: "TERM_BASED",
    unitType: "SUBJECT",
    unitLabelSingularEn: "Subject",
    unitLabelPluralEn: "Subjects",
    unitLabelSingularAr: "مادة",
    unitLabelPluralAr: "مواد",
    years: [1, 2, 3],
    units: veterinaryMedicineUnits,
  },
];

const highSchoolPrograms: readonly SyntheticProgram[] = [
  {
    id: "science-track",
    code: "SCIENCE_TRACK",
    nameEn: "Science track",
    nameAr: "شعبة علمي علوم",
    sortOrder: 1,
    progressionMode: "TERM_BASED",
    unitType: "SUBJECT",
    unitLabelSingularEn: "Subject",
    unitLabelPluralEn: "Subjects",
    unitLabelSingularAr: "مادة",
    unitLabelPluralAr: "مواد",
    years: [3],
    units: highSchoolUnits,
  },
  {
    id: "mathematics-track",
    code: "MATHEMATICS_TRACK",
    nameEn: "Mathematics track",
    nameAr: "شعبة علمي رياضة",
    sortOrder: 2,
    progressionMode: "TERM_BASED",
    unitType: "SUBJECT",
    unitLabelSingularEn: "Subject",
    unitLabelPluralEn: "Subjects",
    unitLabelSingularAr: "مادة",
    unitLabelPluralAr: "مواد",
    years: [3],
    units: highSchoolUnits,
  },
];

const stages = [
  {
    id: "university",
    code: "UNIVERSITY",
    nameEn: "University student",
    nameAr: "طالب جامعي",
    sortOrder: 1,
    institutions: [
      {
        id: "zagazig-university",
        code: "ZAGAZIG_UNIVERSITY",
        nameEn: "Zagazig University",
        nameAr: "جامعة الزقازيق",
        sortOrder: 1,
      },
      {
        id: "ain-shams-university",
        code: "AIN_SHAMS_UNIVERSITY",
        nameEn: "Ain Shams University",
        nameAr: "جامعة عين شمس",
        sortOrder: 2,
      },
      {
        id: "benha-university",
        code: "BENHA_UNIVERSITY",
        nameEn: "Benha University",
        nameAr: "جامعة بنها",
        sortOrder: 3,
      },
    ],
    programs: universityPrograms,
  },
  {
    id: "thanaweya-amma",
    code: "HIGH_SCHOOL",
    nameEn: "High school (Thanaweya Amma)",
    nameAr: "الثانوية العامة",
    sortOrder: 2,
    institutions: [
      {
        id: "egyptian-thanaweya-amma",
        code: "EGYPTIAN_THANAWAYA_AMMA",
        nameEn: "Egyptian Thanaweya Amma",
        nameAr: "نظام الثانوية العامة المصرية",
        sortOrder: 1,
      },
    ],
    programs: highSchoolPrograms,
  },
] as const;

const ordinalNames = {
  1: { en: "First year", ar: "السنة الأولى" },
  2: { en: "Second year", ar: "السنة الثانية" },
  3: { en: "Third year", ar: "السنة الثالثة" },
} as const;

const rows: AuthorizedCatalogRow[] = [];
const presentations: Record<string, UnitPresentation> = {};

for (const stage of stages) {
  for (const institution of stage.institutions) {
    for (const program of stage.programs) {
      for (const year of program.years) {
        for (const semester of [1, 2] as const) {
          for (const [unitIndex, unit] of program.units.entries()) {
            const levelId = `${program.id}-year-${year}`;
            const termId = `${levelId}-term-${semester}`;
            const cohortId = `${institution.id}-${termId}-cohort`;
            const unitId = `${institution.id}-${program.id}-y${year}-t${semester}-${unit.id}`;
            rows.push({
              stage: {
                id: stage.id,
                code: stage.code,
                nameEn: stage.nameEn,
                nameAr: stage.nameAr,
                sortOrder: stage.sortOrder,
              },
              institution,
              program: {
                id: program.id,
                code: program.code,
                nameEn: program.nameEn,
                nameAr: program.nameAr,
                sortOrder: program.sortOrder,
                progressionMode: program.progressionMode,
                unitType: program.unitType,
                unitLabelSingularEn: program.unitLabelSingularEn,
                unitLabelPluralEn: program.unitLabelPluralEn,
                unitLabelSingularAr: program.unitLabelSingularAr,
                unitLabelPluralAr: program.unitLabelPluralAr,
              },
              level: {
                id: levelId,
                code: `YEAR_${year}`,
                nameEn: ordinalNames[year].en,
                nameAr: ordinalNames[year].ar,
                sortOrder: year,
              },
              term: {
                id: termId,
                code: `TERM_${semester}`,
                nameEn: `Term ${semester}`,
                nameAr: `الترم ${semester === 1 ? "الأول" : "الثاني"}`,
                sortOrder: semester,
              },
              cohort: {
                id: cohortId,
                code: `${program.code}_Y${year}_T${semester}_2026`,
                nameEn: `Synthetic ${program.nameEn} year ${year}, term ${semester}`,
                nameAr: `مجموعة تجريبية: ${program.nameAr}، السنة ${year}، الترم ${semester}`,
                sortOrder: 1,
                curriculumEdition: "synthetic-2026-2027",
              },
              unit: {
                id: unitId,
                code: unit.id.toUpperCase().replaceAll("-", "_"),
                nameEn: unit.nameEn,
                nameAr: unit.nameAr,
                sortOrder: unitIndex + 1,
                unitType: program.unitType,
                sourceCount: unit.sourceCount,
              },
            });
            presentations[unitId] = {
              image: unit.image,
              descriptionEn: unit.descriptionEn,
              descriptionAr: unit.descriptionAr,
            };
          }
        }
      }
    }
  }
}

export const syntheticCatalogRows: readonly AuthorizedCatalogRow[] = rows;
export const syntheticUnitPresentationById: Readonly<
  Record<string, UnitPresentation>
> = presentations;
