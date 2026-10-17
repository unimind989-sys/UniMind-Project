import { syntheticCatalogRows } from "./synthetic-catalog.application";
import { loadSyntheticWorkspaceScope } from "./synthetic-workspace.application";
import type {
  AuthorizedCatalogRow,
  CatalogAccessState,
} from "@/lib/catalog/catalog-journey.application";

export type Locale = "en" | "ar";
export type Localized = readonly [string, string];
export const text = (value: Localized, locale: Locale) =>
  value[locale === "ar" ? 1 : 0];

export const reviewBase = "";
export const defaultRow = syntheticCatalogRows[0]!;
export const defaultScope = loadSyntheticWorkspaceScope(
  defaultRow.cohort.id,
  defaultRow.unit.id,
)!;
export const defaultUnitPath = `${reviewBase}/learn/${defaultScope.cohortId}/${defaultScope.unitId}`;
const flexibleRow: AuthorizedCatalogRow = {
  ...defaultRow,
  program: {
    ...defaultRow.program,
    id: "synthetic-credit-program",
    code: "SYNTHETIC_CREDIT",
    nameEn: "Synthetic flexible-credit program",
    nameAr: "برنامج ساعات مرنة تجريبي",
    progressionMode: "FLEXIBLE_CREDIT",
  },
  level: { ...defaultRow.level, id: "synthetic-credit-level" },
  term: {
    ...defaultRow.term,
    id: "synthetic-credit-period",
    nameEn: "Eligible course plan",
    nameAr: "خطة المقررات المتاحة",
  },
  cohort: {
    ...defaultRow.cohort,
    id: "synthetic-credit-cohort",
    nameEn: "Synthetic credit-plan cohort",
    nameAr: "مجموعة خطة ساعات تجريبية",
  },
  unit: {
    ...defaultRow.unit,
    id: "synthetic-credit-unit",
    nameEn: "Synthetic evidence study",
    nameAr: "دراسة أدلة تجريبية",
  },
};
export const reviewCatalogRows = [...syntheticCatalogRows, flexibleRow].map(
  (row) => ({
    ...row,
    unit: { ...row.unit, sourceCount: 8 },
  }),
);
export function loadReviewScope(cohortId: string, unitId: string) {
  if (cohortId !== flexibleRow.cohort.id || unitId !== flexibleRow.unit.id) {
    const scope = loadSyntheticWorkspaceScope(cohortId, unitId);
    return scope ? { ...scope, sourceCount: 8 } : null;
  }
  return {
    ...defaultScope,
    cohortId,
    unitId,
    progressionMode: flexibleRow.program.progressionMode,
    programNameEn: flexibleRow.program.nameEn,
    programNameAr: flexibleRow.program.nameAr,
    levelNameEn: flexibleRow.level.nameEn,
    levelNameAr: flexibleRow.level.nameAr,
    termNameEn: flexibleRow.term.nameEn,
    termNameAr: flexibleRow.term.nameAr,
    cohortName: flexibleRow.cohort.nameEn,
    unitTitleEn: flexibleRow.unit.nameEn,
    unitTitleAr: flexibleRow.unit.nameAr,
  };
}
export const scopeChoices = reviewCatalogRows
  .filter(
    (row, index, rows) =>
      rows.findIndex((other) => other.program.id === row.program.id) === index,
  )
  .map((row) => ({
    path: `${reviewBase}/learn/${row.cohort.id}/${row.unit.id}`,
    scope: loadReviewScope(row.cohort.id, row.unit.id)!,
  }));

export const artifactTypes = [
  ["summary", "Structured summary", "ملخص منظم"],
  ["guide", "Study guide", "دليل مذاكرة"],
  ["practice", "Practice questions", "أسئلة تدريب"],
  ["flashcards", "Flashcards", "بطاقات مراجعة"],
  ["revision", "Revision pack", "حزمة مراجعة"],
  ["quiz", "MCQ quiz", "اختبار اختيار من متعدد"],
] as const;

export const actionFixtures = [
  {
    id: "publish",
    label: ["Publish unit", "نشر الوحدة"],
    before: "DRAFT",
    after: "PUBLISHED",
    protected: true,
  },
  {
    id: "hide",
    label: ["Hide unit", "إخفاء الوحدة"],
    before: "PUBLISHED",
    after: "WITHDRAWN",
    protected: false,
  },
  {
    id: "unlock",
    label: ["Unlock cohort", "فتح المجموعة"],
    before: "LOCKED",
    after: "UNLOCKED",
    protected: true,
  },
  {
    id: "lock",
    label: ["Lock cohort", "قفل المجموعة"],
    before: "UNLOCKED",
    after: "LOCKED",
    protected: false,
  },
  {
    id: "activate",
    label: ["Activate source", "تفعيل المصدر"],
    before: "INACTIVE",
    after: "ACTIVE",
    protected: true,
  },
  {
    id: "deactivate",
    label: ["Deactivate source", "تعطيل المصدر"],
    before: "ACTIVE",
    after: "DEACTIVATED",
    protected: false,
  },
  {
    id: "quarantine",
    label: ["Quarantine source", "عزل المصدر"],
    before: "FAILED",
    after: "QUARANTINED",
    protected: false,
  },
  {
    id: "retry",
    label: ["Retry source", "إعادة محاولة المصدر"],
    before: "FAILED",
    after: "PENDING_OWNER_REVIEW",
    protected: false,
  },
  {
    id: "hold",
    label: ["Place raw-data hold", "تعليق حذف البيانات الخام"],
    before: "STORED",
    after: "HELD",
    protected: true,
  },
  {
    id: "remove-hold",
    label: ["Remove raw-data hold", "رفع تعليق الحذف"],
    before: "HELD",
    after: "STORED",
    protected: true,
  },
  {
    id: "enable",
    label: ["Enable provider or artifact", "تفعيل مزود أو مخرج"],
    before: "DISABLED",
    after: "ENABLED",
    protected: true,
  },
  {
    id: "disable",
    label: ["Disable provider or artifact", "تعطيل مزود أو مخرج"],
    before: "ENABLED",
    after: "DISABLED",
    protected: false,
  },
] as const;

export const resourceNames = {
  catalog: ["Catalog", "الدليل الدراسي"],
  cohorts: ["Cohorts", "المجموعات"],
  campaigns: ["Campaigns", "حملات الجمع"],
  sources: ["Sources", "المصادر"],
  jobs: ["Jobs", "المهام"],
  quality: ["Quality", "الجودة"],
  usage: ["Usage and capacity", "الاستخدام والسعة"],
  incidents: ["Incidents", "الحوادث"],
} as const satisfies Record<string, Localized>;

export type ResponseKind =
  | "supported"
  | "partial"
  | "unavailable"
  | "conflict"
  | "hint"
  | "educational"
  | "patient";
export const promptExamples: Record<ResponseKind, Localized> = {
  supported: [
    "What happens if the upper trunk of the brachial plexus is injured?",
    "إيه اللي بيحصل لو الجذع العلوي للضفيرة العضدية اتصاب؟",
  ],
  partial: [
    "How long does recovery from Erb's palsy take?",
    "التعافي من شلل إرب بياخد وقت قد إيه؟",
  ],
  unavailable: [
    "What does the brachial plexus look like on an MRI?",
    "شكل الضفيرة العضدية في الرنين المغناطيسي عامل إزاي؟",
  ],
  conflict: [
    "Which spinal roots form the brachial plexus?",
    "إيه الجذور اللي بتكوّن الضفيرة العضدية؟",
  ],
  hint: [
    "What did the practical session stress?",
    "العملي ركّز على إيه؟",
  ],
  educational: [
    "In a teaching case, a newborn's arm hangs limp after a difficult delivery. Which trunk is injured?",
    "في حالة تعليمية، ذراع مولود مرتخية بعد ولادة متعسرة. أي جذع اتصاب؟",
  ],
  patient: [
    "Treat an identifiable real patient.",
    "عالج مريضًا حقيقيًا محدد الهوية.",
  ],
};
export const answerExamples: Record<ResponseKind, Localized> = {
  supported: [
    "An upper trunk injury damages the C5 and C6 roots: Erb's palsy. The arm hangs adducted and medially rotated, with the forearm extended and pronated, the waiter's tip position. This answer uses only the Lecture 6 handout.",
    "إصابة الجذع العلوي تؤثر على الجذرين C5 وC6، وتُعرف بشلل إرب. يتدلى الذراع مقرّبًا ومدوّرًا للداخل والساعد ممدود ومكبوب، وهو وضع «بقشيش النادل». هذه الإجابة تعتمد على ملزمة المحاضرة 6 فقط.",
  ],
  partial: [
    "Supported: an upper trunk injury (C5, C6) causes Erb's palsy. Missing: your materials don't say how long recovery takes.",
    "المتاح: إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب. غير المتاح: موادك لا تذكر مدة التعافي.",
  ],
  unavailable: [
    "This information isn't in your uploaded materials. No outside knowledge or web search is used.",
    "هذه المعلومة غير موجودة في المواد المرفوعة. لا نستخدم معرفة خارجية أو بحثًا على الإنترنت.",
  ],
  conflict: [
    "The Lecture 6 handout says the plexus is formed by C5 to T1. The Practical 3 recording says it can also take a branch from C4, a prefixed plexus. Your materials disagree, and neither one settles it.",
    "ملزمة المحاضرة 6 تقول إن الضفيرة تتكون من C5 إلى T1. تسجيل العملي 3 يقول إنها قد تأخذ فرعًا من C4 أيضًا، وهي الضفيرة المتقدمة. موادك متعارضة ولا يحسم أي منها الخلاف.",
  ],
  hint: [
    "Professor hint: the Practical 3 recording stresses counting the roots before naming the trunks. This is emphasis in your material, not a guarantee of exam content.",
    "تلميح المحاضر: تسجيل العملي 3 يؤكد عدّ الجذور قبل تسمية الجذوع. هذا تأكيد داخل موادك وليس ضمانًا لمحتوى الامتحان.",
  ],
  educational: [
    "In this teaching case, a limp, inward-turned arm after a difficult delivery matches the handout's upper trunk injury (C5, C6), Erb's palsy. This is study material; no patient advice is given.",
    "في هذه الحالة التعليمية، الذراع المرتخية المدوّرة للداخل بعد ولادة متعسرة تطابق وصف الملزمة لإصابة الجذع العلوي (C5 وC6)، أي شلل إرب. هذه مادة للمذاكرة ولا تُقدَّم نصيحة لمريض.",
  ],
  patient: [
    "UniMind is for study, not treatment of a real patient. Consult a qualified professional. No patient details are collected in this review.",
    "UniMind للمذاكرة وليس لعلاج مريض حقيقي. ارجع لمختص مؤهل. المراجعة لا تجمع بيانات مرضى.",
  ],
};

export type SampleAnswer = {
  kind: ResponseKind;
  promptKind?: ResponseKind | "unmatched";
  language: "en" | "ar" | "mixed";
  sessionId: number;
  sharing: "shared" | "private";
};
export type ReviewSession = {
  id: number;
  scope: string;
  title?: Localized;
  answers: SampleAnswer[];
};
export type ReviewSubmission = {
  id: number;
  format: string;
  status: string;
  campaignId?: string;
  requestedItemId?: string;
  sourceName?: string;
  correction?: {
    action: "FIX_INFORMATION" | "REPLACE_FILE";
    reasonEn: string;
    reasonAr: string;
  };
};
export type ReviewState = {
  campaignDensity: boolean;
  studyDensityUnitId: string | null;
  account: "NEW" | "UNVERIFIED" | "VERIFIED" | "SIGNED_IN" | "SUSPENDED";
  consent: boolean;
  recoveryUsed: boolean;
  sharing: "shared" | "private";
  sessions: ReviewSession[];
  activeSessions: Record<string, number>;
  artifacts: Record<
    string,
    {
      type: string;
      language: string;
      topic: string;
      depth: string;
      size: string;
    }
  >;
  attempts: Record<string, { answers: number[]; submitted: boolean }>;
  reports: Record<string, string>;
  submissions: ReviewSubmission[];
  adminStates: Record<string, string>;
  availability: {
    published: boolean;
    unlocked: boolean;
    sourceActive: boolean;
  };
  audit: Localized[];
  catalogDraft: "MODULE" | "SUBJECT" | null;
  cohortDraft: boolean;
  campaignDraft: boolean;
  invitation: boolean;
};
export function initialReviewState(): ReviewState {
  return {
    campaignDensity: false,
    studyDensityUnitId: null,
    account: "NEW",
    consent: false,
    recoveryUsed: false,
    sharing: "shared",
    sessions: [],
    activeSessions: {},
    artifacts: {},
    attempts: {},
    reports: {},
    submissions: [],
    adminStates: {},
    availability: { published: true, unlocked: true, sourceActive: true },
    audit: [],
    catalogDraft: null,
    cohortDraft: false,
    campaignDraft: false,
    invitation: false,
  };
}

export function sampleScopeAvailable(
  state: ReviewState,
  cohortId: string,
  unitId: string,
) {
  if (cohortId !== defaultScope.cohortId) return true;
  if (!state.availability.unlocked) return false;
  return unitId !== defaultScope.unitId || state.availability.published;
}

export function applySampleAvailability(
  state: ReviewState,
  action: string,
): ReviewState["availability"] {
  const availability = { ...state.availability };
  if (action === "hide" || action === "publish")
    availability.published = action === "publish";
  if (action === "lock" || action === "unlock")
    availability.unlocked = action === "unlock";
  if (action === "deactivate" || action === "activate")
    availability.sourceActive = action === "activate";
  return availability;
}

export const commonScenarios = [
  ["ready", "Ready", "جاهز"],
  ["loading", "Loading", "تحميل"],
  ["empty", "Empty", "فارغ"],
  ["error", "Error", "خطأ"],
  ["offline", "Offline / interrupted", "غير متصل / متوقف"],
  ["stale", "Stale", "قديم"],
  ["forbidden", "Access unavailable", "الوصول غير متاح"],
] as const;

type ShelfFixtureState = Exclude<CatalogAccessState, "READY"> | "ERROR";

/**
 * Loopback-only Study Shelf access states (`/learn?fixture=shelf-*`). They
 * render the shared shelf's own safe states with no catalog rows; hosted
 * entry strips `fixture`, so they are never reachable there.
 */
const shelfFixtures: Readonly<Record<string, ShelfFixtureState>> = {
  "shelf-no-membership": "NO_MEMBERSHIP",
  "shelf-locked": "COHORT_LOCKED",
  "shelf-no-catalog": "NO_CATALOG",
  "shelf-unpublished": "UNIT_UNPUBLISHED",
  "shelf-no-ready-source": "READY_SOURCE_MISSING",
  "shelf-error": "ERROR",
};

export function syntheticShelfState(fixture: string): ShelfFixtureState | null {
  return Object.hasOwn(shelfFixtures, fixture) ? shelfFixtures[fixture]! : null;
}
