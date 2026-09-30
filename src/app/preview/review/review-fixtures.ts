import { syntheticCatalogRows } from "@/app/learn/synthetic-catalog";
import { loadSyntheticWorkspaceScope } from "@/app/learn/synthetic-workspace";
import type { AuthorizedCatalogRow } from "@/lib/catalog/catalog-journey.application";

export type Locale = "en" | "ar";
export type Localized = readonly [string, string];
export const text = (value: Localized, locale: Locale) =>
  value[locale === "ar" ? 1 : 0];

export const reviewBase = "/preview/review";
export const defaultRow = syntheticCatalogRows[0]!;
export const defaultScope = loadSyntheticWorkspaceScope(
  defaultRow.cohort.id,
  defaultRow.unit.id,
)!;
export const defaultUnitPath = `${reviewBase}/catalog/${defaultScope.cohortId}/${defaultScope.unitId}`;
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
export const reviewCatalogRows = [...syntheticCatalogRows, flexibleRow];
export function loadReviewScope(cohortId: string, unitId: string) {
  if (cohortId !== flexibleRow.cohort.id || unitId !== flexibleRow.unit.id)
    return loadSyntheticWorkspaceScope(cohortId, unitId);
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
    path: `${reviewBase}/catalog/${row.cohort.id}/${row.unit.id}`,
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
    after: "QUEUED",
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
    "Explain the sample unit's study sequence.",
    "اشرح ترتيب المذاكرة في الوحدة التجريبية.",
  ],
  partial: [
    "Explain the sequence and its missing timing.",
    "اشرح الترتيب والتوقيت غير الموجود.",
  ],
  unavailable: [
    "What is not covered by these sample sources?",
    "ما المعلومات غير الموجودة في المصادر التجريبية؟",
  ],
  conflict: [
    "Do the two sample sources agree?",
    "هل المصدران التجريبيان متفقان؟",
  ],
  hint: [
    "What did the sample professor emphasize?",
    "ما النقطة التي أكد عليها المحاضر التجريبي؟",
  ],
  educational: [
    "In this fictional teaching case, what is the study sequence?",
    "في حالة تعليمية خيالية، ما ترتيب الدراسة؟",
  ],
  patient: [
    "Treat an identifiable real patient.",
    "عالج مريضًا حقيقيًا محدد الهوية.",
  ],
};
export const answerExamples: Record<ResponseKind, Localized> = {
  supported: [
    "The synthetic handout says to identify the labelled structures, then compare the two diagrams. This fixed example uses only the sample handout.",
    "الملزمة التجريبية تطلب تحديد الأجزاء المسماة ثم مقارنة الرسمين. هذا مثال ثابت من الملزمة فقط.",
  ],
  partial: [
    "Supported: identify the labelled structures before comparison. Missing: the sample materials do not specify how long either step takes.",
    "المتاح: تحديد الأجزاء المسماة قبل المقارنة. غير المتاح: المصادر التجريبية لا تحدد وقت كل خطوة.",
  ],
  unavailable: [
    "This information is unavailable in the sample uploaded materials. No outside knowledge or web search is used.",
    "المعلومة غير متاحة في المواد التجريبية المرفوعة. لا نستخدم معرفة خارجية أو بحثًا على الإنترنت.",
  ],
  conflict: [
    "The sample handout puts identification before comparison. The sample recording puts comparison first. The materials conflict; neither source resolves the disagreement.",
    "الملزمة التجريبية تضع التحديد قبل المقارنة، والتسجيل التجريبي يضع المقارنة أولًا. المواد متعارضة ولا يوجد مصدر يحسم الخلاف.",
  ],
  hint: [
    "Professor hint: the sample recording emphasizes comparing diagrams. This is emphasis in a fixture, not guaranteed exam content.",
    "تلميح محاضر: التسجيل التجريبي يؤكد مقارنة الرسوم. هذا تأكيد داخل المثال وليس ضمانًا لمحتوى الامتحان.",
  ],
  educational: [
    "For this fictional educational case, the sample handout's sequence is identification followed by comparison. No patient advice is generated.",
    "في هذه الحالة التعليمية الخيالية، ترتيب الملزمة التجريبية هو التحديد ثم المقارنة. لا يتم توليد نصيحة لمريض.",
  ],
  patient: [
    "UniMind is for study, not treatment of a real patient. Consult a qualified professional. No patient details are collected in this review.",
    "UniMind للمذاكرة وليس لعلاج مريض حقيقي. ارجع لمختص مؤهل. المراجعة لا تجمع بيانات مرضى.",
  ],
};

export type SampleAnswer = {
  kind: ResponseKind;
  language: "en" | "ar" | "mixed";
  sessionId: number;
  sharing: "shared" | "private";
};
export type ReviewSession = {
  id: number;
  scope: string;
  answers: SampleAnswer[];
};
export type ReviewSubmission = { id: number; format: string; status: string };
export type ReviewState = {
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
  return (
    unitId !== defaultScope.unitId ||
    (state.availability.published && state.availability.sourceActive)
  );
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
