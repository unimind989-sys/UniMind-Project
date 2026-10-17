import { studyDensitySourceTitles } from "@/lib/demo/synthetic-study-density.application";
import {
  text,
  type Locale,
  type ResponseKind,
} from "@/lib/demo/synthetic-fixtures.application";
import type { ProductState } from "@/lib/demo/synthetic-product-state.application";
import type { ChatExchangeSelection } from "@/lib/study/study-origin.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";

export const kindNames: Record<ResponseKind, readonly [string, string]> = {
  supported: ["Supported", "مدعوم"],
  partial: ["Partial support", "دعم جزئي"],
  unavailable: ["Unavailable information", "معلومة غير متاحة"],
  conflict: ["Source conflict", "تعارض المصادر"],
  hint: ["Professor hint", "تلميح محاضر"],
  educational: ["Educational case", "حالة تعليمية"],
  patient: ["Real-patient boundary", "حدود المريض الحقيقي"],
};

export type StudySource = ReturnType<typeof getSources>[number];

/** The unit's sample material collection, in library order. */
export function getSources(
  scope: WorkspaceScope,
  locale: Locale,
  dense: boolean,
) {
  return Array.from({ length: scope.sourceCount }, (_, index) => ({
    title: dense
      ? text(studyDensitySourceTitles[index]!, locale)
      : index === 0
        ? locale === "ar"
          ? "ملزمة الترتيب التجريبية"
          : "Synthetic sequence handout"
        : index === 1
          ? locale === "ar"
            ? "تسجيل المقارنة التجريبي"
            : "Synthetic comparison recording"
          : (locale === "ar" ? "ملحق تجريبي " : "Synthetic appendix ") +
            new Intl.NumberFormat(locale).format(index - 1),
    format: index === 1 ? "AUDIO" : "PDF",
    locator:
      index === 0
        ? locale === "ar"
          ? "صفحة تجريبية ٣"
          : "Sample page 3"
        : index === 1
          ? locale === "ar"
            ? "توقيت تجريبي ٠٢:١٠"
            : "Sample timestamp 02:10"
          : locale === "ar"
            ? "لا يوجد مرجع موثّق لصفحة أو توقيت"
            : "No verified page or timestamp reference",
    segment: `sample:${scope.unitId}:${index + 1}`,
    passageId: index === 0 ? "handout" : index === 1 ? "recording" : null,
  }));
}

/** The Chat exchange a study view was opened for, when it still exists. */
export function selectedExchange(
  sessions: ProductState["sessions"],
  unitId: string,
  selection: ChatExchangeSelection | null,
) {
  const session = sessions.find(
    (entry) => entry.scope === unitId && entry.id === selection?.sessionId,
  );
  const exchange = selection?.exchange;
  const answer =
    exchange !== undefined && Number.isInteger(exchange) && exchange > 0
      ? session?.answers[exchange - 1]
      : undefined;
  return { session, exchange, answer };
}
