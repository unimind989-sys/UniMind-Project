import type { Locale } from "./locale";

/** Route-state copy for the unit workspace (loading, error, not found). */
const copy = {
  en: {
    backToShelf: "Back to Study Shelf",
    genericErrorTitle: "We could not load this workspace",
    genericErrorBody:
      "Your access was not broadened. Try the authorized workspace again.",
    retry: "Try again",
    notFoundTitle: "Workspace unavailable",
    notFoundBody:
      "This workspace is not available to your current account or is no longer active.",
    loading: "Checking workspace access…",
  },
  ar: {
    backToShelf: "العودة إلى مكتبة الدراسة",
    genericErrorTitle: "تعذّر تحميل مساحة العمل",
    genericErrorBody:
      "لم يتم توسيع صلاحياتك. حاول فتح مساحة العمل المصرّح بها مرة أخرى.",
    retry: "حاول مرة أخرى",
    notFoundTitle: "مساحة العمل غير متاحة",
    notFoundBody: "مساحة العمل غير متاحة لحسابك الحالي أو لم تعد نشطة.",
    loading: "جارٍ التحقق من صلاحية مساحة العمل…",
  },
} as const;

export function getWorkspaceCopy(locale: Locale) {
  return copy[locale];
}
