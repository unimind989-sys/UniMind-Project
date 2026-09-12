import type { ProgramTerminology } from "@/lib/catalog/terminology";

export type ShelfIcon = "medicine" | "science" | "clinical";

export type SyntheticUnit = Readonly<{
  id: string;
  nameEn: string;
  nameAr: string;
  image: string;
  completedUnits: number;
  totalUnits: number;
  available: boolean;
  sourceCount?: number;
  descriptionEn?: string;
  descriptionAr?: string;
}>;

export type SyntheticShelf = Readonly<{
  id: string;
  titleEn: string;
  titleAr: string;
  year: number;
  icon: ShelfIcon;
  terminology: ProgramTerminology;
  units: readonly SyntheticUnit[];
}>;

export const syntheticShelves: readonly SyntheticShelf[] = [
  {
    id: "human-medicine",
    titleEn: "Human Medicine",
    titleAr: "الطب البشري",
    year: 2,
    icon: "medicine",
    terminology: { curriculumUnitNoun: "module" },
    units: [
      {
        id: "anatomy",
        nameEn: "Anatomy",
        nameAr: "علم التشريح",
        image: "/images/study-shelf/clinical-medicine.png",
        completedUnits: 2,
        totalUnits: 8,
        available: true,
      },
      {
        id: "cardiovascular",
        nameEn: "Cardiovascular Module",
        nameAr: "وحدة الجهاز القلبي الوعائي",
        image: "/images/study-shelf/cardiovascular.png",
        completedUnits: 4,
        totalUnits: 8,
        available: true,
        sourceCount: 12,
        descriptionEn:
          "Cardiac structure, function, regulation, and common pathologies.",
        descriptionAr: "بنية القلب ووظيفته وتنظيمه وأهم الأمراض الشائعة.",
      },
      {
        id: "respiratory",
        nameEn: "Respiratory Module",
        nameAr: "وحدة الجهاز التنفسي",
        image: "/images/study-shelf/respiratory.png",
        completedUnits: 1,
        totalUnits: 8,
        available: true,
        sourceCount: 9,
        descriptionEn:
          "Airways, gas exchange, mechanics, and common disorders.",
        descriptionAr:
          "الممرات الهوائية وتبادل الغازات والميكانيكا والاضطرابات الشائعة.",
      },
      {
        id: "renal",
        nameEn: "Renal Module",
        nameAr: "وحدة الجهاز البولي",
        image: "/images/study-shelf/renal.png",
        completedUnits: 0,
        totalUnits: 8,
        available: true,
        sourceCount: 7,
        descriptionEn:
          "Renal structure, fluid balance, and filtration principles.",
        descriptionAr: "بنية الكلى وتوازن السوائل ومبادئ الترشيح.",
      },
      {
        id: "gastrointestinal",
        nameEn: "Gastrointestinal Module",
        nameAr: "وحدة الجهاز الهضمي",
        image: "/images/study-shelf/gastrointestinal.png",
        completedUnits: 3,
        totalUnits: 8,
        available: true,
        sourceCount: 10,
        descriptionEn:
          "Digestive anatomy, physiology, and common presentations.",
        descriptionAr: "تشريح الجهاز الهضمي ووظائفه وأهم الحالات الشائعة.",
      },
      {
        id: "endocrine",
        nameEn: "Endocrine Module",
        nameAr: "وحدة الغدد الصماء",
        image: "/images/study-shelf/cell-biology.png",
        completedUnits: 0,
        totalUnits: 8,
        available: false,
      },
    ],
  },
  {
    id: "basic-sciences",
    titleEn: "Basic Sciences",
    titleAr: "العلوم الأساسية",
    year: 1,
    icon: "science",
    terminology: { curriculumUnitNoun: "module" },
    units: [
      {
        id: "cell-biology",
        nameEn: "Cell Biology",
        nameAr: "علم الخلية",
        image: "/images/study-shelf/cell-biology.png",
        completedUnits: 4,
        totalUnits: 6,
        available: true,
        sourceCount: 8,
        descriptionEn: "Cell structure, organelles, transport, and signaling.",
        descriptionAr: "بنية الخلية وعضياتها والنقل والإشارات الخلوية.",
      },
      {
        id: "biochemistry",
        nameEn: "Biochemistry",
        nameAr: "الكيمياء الحيوية",
        image: "/images/study-shelf/biochemistry.png",
        completedUnits: 2,
        totalUnits: 6,
        available: true,
        sourceCount: 11,
        descriptionEn: "Biomolecules, enzymes, metabolism, and regulation.",
        descriptionAr: "الجزيئات الحيوية والإنزيمات والأيض وتنظيمه.",
      },
      {
        id: "physiology",
        nameEn: "Physiology",
        nameAr: "وظائف الأعضاء",
        image: "/images/study-shelf/physiology.png",
        completedUnits: 1,
        totalUnits: 6,
        available: true,
        sourceCount: 10,
        descriptionEn: "Integrated organ function and homeostatic control.",
        descriptionAr: "تكامل وظائف الأعضاء وآليات الاتزان الداخلي.",
      },
      {
        id: "pathology",
        nameEn: "Pathology",
        nameAr: "علم الأمراض",
        image: "/images/study-shelf/pathology.png",
        completedUnits: 0,
        totalUnits: 6,
        available: true,
        sourceCount: 6,
        descriptionEn:
          "Mechanisms of injury, adaptation, and disease patterns.",
        descriptionAr: "آليات الإصابة والتكيف وأنماط الأمراض.",
      },
      {
        id: "pharmacology",
        nameEn: "Pharmacology",
        nameAr: "علم الأدوية",
        image: "/images/study-shelf/pharmacology.png",
        completedUnits: 1,
        totalUnits: 6,
        available: true,
        sourceCount: 9,
        descriptionEn: "Drug actions, kinetics, safety, and clinical use.",
        descriptionAr: "تأثيرات الأدوية وحركتها وسلامتها واستخدامها السريري.",
      },
      {
        id: "microbiology",
        nameEn: "Microbiology",
        nameAr: "الأحياء الدقيقة",
        image: "/images/study-shelf/microbiology.png",
        completedUnits: 0,
        totalUnits: 6,
        available: false,
      },
    ],
  },
  {
    id: "clinical-practice",
    titleEn: "Clinical Practice",
    titleAr: "التدريب السريري",
    year: 3,
    icon: "clinical",
    terminology: { curriculumUnitNoun: "module" },
    units: [
      {
        id: "internal-medicine",
        nameEn: "Internal Medicine",
        nameAr: "الأمراض الباطنية",
        image: "/images/study-shelf/internal-medicine.png",
        completedUnits: 2,
        totalUnits: 5,
        available: true,
        sourceCount: 12,
        descriptionEn: "Structured approaches to common adult presentations.",
        descriptionAr: "مناهج منظمة للتعامل مع حالات البالغين الشائعة.",
      },
      {
        id: "surgery",
        nameEn: "Surgery",
        nameAr: "الجراحة",
        image: "/images/study-shelf/surgery.png",
        completedUnits: 1,
        totalUnits: 5,
        available: true,
        sourceCount: 8,
        descriptionEn:
          "Assessment, perioperative care, and surgical principles.",
        descriptionAr: "التقييم والرعاية المحيطة بالجراحة ومبادئها.",
      },
      {
        id: "pediatrics",
        nameEn: "Pediatrics",
        nameAr: "طب الأطفال",
        image: "/images/study-shelf/pediatrics.png",
        completedUnits: 0,
        totalUnits: 5,
        available: true,
        sourceCount: 7,
        descriptionEn:
          "Age-aware assessment, growth, and common presentations.",
        descriptionAr: "التقييم حسب العمر والنمو وحالات الأطفال الشائعة.",
      },
      {
        id: "obstetrics",
        nameEn: "Obstetrics & Gynecology",
        nameAr: "أمراض النساء والتوليد",
        image: "/images/study-shelf/obstetrics.png",
        completedUnits: 1,
        totalUnits: 5,
        available: true,
        sourceCount: 6,
        descriptionEn:
          "Reproductive health, pregnancy, and clinical assessment.",
        descriptionAr: "الصحة الإنجابية والحمل والتقييم السريري.",
      },
      {
        id: "emergency-medicine",
        nameEn: "Emergency Medicine",
        nameAr: "طب الطوارئ",
        image: "/images/study-shelf/emergency-medicine.png",
        completedUnits: 0,
        totalUnits: 5,
        available: false,
      },
    ],
  },
] as const;
