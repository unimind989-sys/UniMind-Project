import type { Locale } from "./locale";

const copy = {
  en: {
    productNavigation: "Workspace navigation",
    studyShelf: "Study Shelf",
    overview: "Overview",
    chat: "Chat",
    studio: "Studio",
    quiz: "Quiz",
    evidence: "Evidence",
    report: "Report an issue",
    backToShelf: "Back to Study Shelf",
    workspaceFor: "Authorized unit workspace",
    ready: "Approved material ready",
    sourceStatus: "Source status",
    approvedSources: "approved sources",
    materialUpdate: "Material update",
    quota: "Quota",
    quotaUnavailable: "Not active in this mock",
    edition: "Curriculum edition",
    overviewTitle: "Study overview",
    overviewBody:
      "This shell keeps your authorized unit scope visible while learning tools are built in later work packages.",
    continueTitle: "Choose a study tool",
    placeholder: "Planned capability",
    chatDescription:
      "Session scope is persisted now. Asking and answering questions is not active yet.",
    studioDescription:
      "Summary, study-guide, flashcard, and practice-generation tools are not active yet.",
    quizDescription: "Quiz attempts, grading, and review are not active yet.",
    evidenceDescription:
      "Evidence inspection arrives with grounded answers; no evidence list is available yet.",
    reportDescription:
      "Reporting is planned, but this shell does not submit a report yet.",
    open: "View status",
    unavailable: "Unavailable",
    chatTitle: "Scoped chat sessions",
    chatBody:
      "Create or select a session for this unit. The mock stores scope only; messaging remains unavailable.",
    newSession: "Start a scoped session",
    selectedSession: "Selected session",
    chooseSession: "Select session",
    noSessions: "No scoped sessions yet.",
    messagePlaceholder: "Messaging is not available in WP03-T04.",
    studioTitle: "Studio is planned",
    studioBody:
      "No summary, study guide, flashcard, or generated practice item can be created from this placeholder.",
    quizTitle: "Quiz is planned",
    quizBody:
      "No quiz attempt, score, or review record can be created from this placeholder.",
    genericErrorTitle: "We could not load this workspace",
    genericErrorBody:
      "Your access was not broadened. Try the authorized workspace again.",
    retry: "Try again",
    notFoundTitle: "Workspace unavailable",
    notFoundBody:
      "This workspace is not available to your current account or is no longer active.",
    loading: "Checking workspace access…",
    synthetic: "Synthetic workspace preview",
  },
  ar: {
    productNavigation: "التنقل داخل مساحة العمل",
    studyShelf: "مكتبة الدراسة",
    overview: "نظرة عامة",
    chat: "المحادثة",
    studio: "الاستوديو",
    quiz: "الاختبار",
    evidence: "الأدلة",
    report: "الإبلاغ عن مشكلة",
    backToShelf: "العودة إلى مكتبة الدراسة",
    workspaceFor: "مساحة وحدة مصرّح بها",
    ready: "المادة المعتمدة جاهزة",
    sourceStatus: "حالة المصادر",
    approvedSources: "مصادر معتمدة",
    materialUpdate: "آخر تحديث للمادة",
    quota: "الحصة المتاحة",
    quotaUnavailable: "غير مفعّلة في النموذج التجريبي",
    edition: "إصدار المنهج",
    overviewTitle: "نظرة عامة على الدراسة",
    overviewBody:
      "تحافظ هذه الواجهة على نطاق وحدتك المصرّح به أثناء تنفيذ أدوات التعلّم في حزم العمل اللاحقة.",
    continueTitle: "اختر أداة للدراسة",
    placeholder: "إمكانية مخططة",
    chatDescription:
      "يُحفظ نطاق الجلسة الآن، لكن إرسال الأسئلة واستقبال الإجابات غير مفعّل بعد.",
    studioDescription:
      "أدوات الملخص ودليل الدراسة والبطاقات والأسئلة التدريبية غير مفعّلة بعد.",
    quizDescription: "محاولات الاختبار والتصحيح والمراجعة غير مفعّلة بعد.",
    evidenceDescription:
      "تظهر الأدلة مع الإجابات الموثّقة، ولا توجد قائمة أدلة متاحة الآن.",
    reportDescription: "الإبلاغ مخطط له، لكن هذه الواجهة لا ترسل بلاغًا بعد.",
    open: "عرض الحالة",
    unavailable: "غير متاح",
    chatTitle: "جلسات محادثة محددة النطاق",
    chatBody:
      "أنشئ جلسة لهذه الوحدة أو اختر جلسة موجودة. يحفظ النموذج النطاق فقط، وتظل الرسائل غير متاحة.",
    newSession: "بدء جلسة محددة النطاق",
    selectedSession: "الجلسة المختارة",
    chooseSession: "اختيار الجلسة",
    noSessions: "لا توجد جلسات محددة النطاق بعد.",
    messagePlaceholder: "المراسلة غير متاحة في WP03-T04.",
    studioTitle: "الاستوديو مخطط له",
    studioBody:
      "لا يمكن إنشاء ملخص أو دليل دراسة أو بطاقات أو أسئلة تدريبية من هذه الواجهة المؤقتة.",
    quizTitle: "الاختبار مخطط له",
    quizBody:
      "لا يمكن إنشاء محاولة اختبار أو نتيجة أو سجل مراجعة من هذه الواجهة المؤقتة.",
    genericErrorTitle: "تعذّر تحميل مساحة العمل",
    genericErrorBody:
      "لم يتم توسيع صلاحياتك. حاول فتح مساحة العمل المصرّح بها مرة أخرى.",
    retry: "حاول مرة أخرى",
    notFoundTitle: "مساحة العمل غير متاحة",
    notFoundBody: "مساحة العمل غير متاحة لحسابك الحالي أو لم تعد نشطة.",
    loading: "جارٍ التحقق من صلاحية مساحة العمل…",
    synthetic: "معاينة تجريبية لمساحة العمل",
  },
} as const;

export function getWorkspaceCopy(locale: Locale) {
  return copy[locale];
}
