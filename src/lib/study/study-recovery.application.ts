import type { Locale } from "../i18n/locale";

const tools: Record<string, readonly [string, string]> = {
  catalog: ["Study Shelf", "رف المذاكرة"],
  overview: ["Materials", "مصادر المذاكرة"],
  chat: ["Chat", "المحادثة"],
  studio: ["Studio", "الاستوديو"],
  quiz: ["Quiz", "الاختبار"],
  attempt: ["Quiz", "الاختبار"],
  "quiz-review": ["Quiz review", "مراجعة الاختبار"],
  sources: ["Sources", "المصادر"],
  evidence: ["Evidence", "الأدلة"],
  report: ["Report", "الإبلاغ"],
};

// Presentation for prepared study failures. Callers must apply their existing
// role/scope guards first; this classification never establishes availability.
export function studyRecovery(
  screen: string,
  condition: string,
  locale: Locale,
) {
  if (!Object.hasOwn(tools, screen)) return null;
  const tool = tools[screen]![locale === "ar" ? 1 : 0];
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const transient = ["quota", "capacity", "offline", "error", "stale"].includes(
    condition,
  );
  if (transient) {
    const messages = {
      quota: t(`${tool} allowance unavailable`, `الرصيد غير متاح في ${tool}`),
      capacity: t(`${tool} capacity delay`, `تأخير السعة في ${tool}`),
      offline: t(`${tool} connection interrupted`, `توقف الاتصال في ${tool}`),
      error: t(`${tool} could not load`, `تعذر تحميل ${tool}`),
      stale: t(`${tool} view changed`, `تغير عرض ${tool}`),
    };
    const details = {
      quota: t(
        "Your current work is unchanged. Try again later or open available materials. No reset time is available.",
        "عملك الحالي كما هو. حاول لاحقًا أو افتح المصادر المتاحة. لا يوجد موعد متاح لتجدد الرصيد.",
      ),
      capacity: t(
        "Capacity is temporarily unavailable. Your current work is unchanged; try again later or use another available tool.",
        "السعة غير متاحة مؤقتًا. عملك الحالي كما هو؛ حاول لاحقًا أو استخدم أداة أخرى متاحة.",
      ),
      offline: t(
        "Your current work is unchanged. Reconnect before retrying, or return to materials already available in this view.",
        "عملك الحالي كما هو. استعد الاتصال قبل المحاولة، أو ارجع إلى المصادر المتاحة في هذا العرض.",
      ),
      error: t(
        "Your current work is unchanged. Retry this view or use the available materials and other tools.",
        "عملك الحالي كما هو. أعد محاولة فتح العرض أو استخدم المصادر والأدوات الأخرى المتاحة.",
      ),
      stale: t(
        "Refresh this view to check its current state. Your retained work is unchanged; availability is checked again when you return.",
        "حدّث العرض لفحص حالته الحالية. عملك المحفوظ في العرض كما هو؛ تُفحص الإتاحة مجددًا عند العودة.",
      ),
    };
    const key = condition as keyof typeof messages;
    return {
      transient: true,
      message: messages[key],
      detail: details[key],
      retryLabel:
        condition === "stale"
          ? t(`Refresh ${tool} view`, `تحديث عرض ${tool}`)
          : t(`Retry ${tool}`, `إعادة محاولة ${tool}`),
    };
  }
  const persistent = {
    empty: [
      t("No study records yet", "لا توجد سجلات مذاكرة بعد"),
      t(
        "Choose an available subject to continue.",
        "اختر مادة متاحة للمتابعة.",
      ),
    ],
    "no-membership": [
      t("Study access unavailable", "الوصول للمذاكرة غير متاح"),
      t(
        "No study access is available here for this account. Browse the subjects available to you.",
        "لا يتاح لهذا الحساب الوصول للمذاكرة هنا. تصفح المواد المتاحة لك.",
      ),
    ],
    forbidden: [
      t("Study access unavailable", "الوصول للمذاكرة غير متاح"),
      t(
        "This view is not available to this account. Browse the subjects available to you.",
        "هذا العرض غير متاح لهذا الحساب. تصفح المواد المتاحة لك.",
      ),
    ],
    "wrong-scope": [
      t("Study access unavailable", "الوصول للمذاكرة غير متاح"),
      t(
        "This view is not available to this account. Browse the subjects available to you.",
        "هذا العرض غير متاح لهذا الحساب. تصفح المواد المتاحة لك.",
      ),
    ],
    locked: [
      t("Study access is locked", "الوصول للمذاكرة مغلق"),
      t(
        "Retry cannot unlock access. Choose another available subject.",
        "إعادة المحاولة لا تفتح الوصول. اختر مادة أخرى متاحة.",
      ),
    ],
    unpublished: [
      t("Study materials are not published", "مصادر المذاكرة غير منشورة"),
      t(
        "These materials are not available for study yet. Choose another available subject while you wait.",
        "هذه المصادر غير متاحة للمذاكرة بعد. اختر مادة أخرى متاحة أثناء الانتظار.",
      ),
    ],
    "no-ready-source": [
      t("No ready study sources", "لا توجد مصادر جاهزة للمذاكرة"),
      t(
        "Learning tools need approved, ready sources. Wait for materials or choose another available subject.",
        "أدوات المذاكرة تحتاج مصادر معتمدة وجاهزة. انتظر المصادر أو اختر مادة أخرى متاحة.",
      ),
    ],
    expired: [
      t("Study link expired", "انتهت صلاحية رابط المذاكرة"),
      t(
        "Use a current study destination from your available subjects.",
        "افتح وجهة مذاكرة حالية من المواد المتاحة لك.",
      ),
    ],
    replayed: [
      t("Study link already used", "رابط المذاكرة مستخدم بالفعل"),
      t(
        "Use a current study destination from your available subjects.",
        "افتح وجهة مذاكرة حالية من المواد المتاحة لك.",
      ),
    ],
  };
  if (!Object.hasOwn(persistent, condition)) return null;
  const [message, detail] = persistent[condition as keyof typeof persistent];
  return {
    transient: false,
    message: message!,
    detail: detail!,
    retryLabel: null,
  };
}
