import type { Locale } from "../i18n/locale";

// Fixed processed excerpts already used by the synthetic evidence views.
// This is fixture presentation, never a retrieval or availability authority.
const passages = {
  handout: {
    format: "PDF",
    title: ["Synthetic sequence handout", "ملزمة الترتيب التجريبية"],
    locator: ["Sample page 3", "صفحة تجريبية ٣"],
    text: [
      "Identify the labels, then compare the diagrams.",
      "حدد الأسماء ثم قارن الرسوم.",
    ],
  },
  recording: {
    format: "AUDIO",
    title: ["Synthetic comparison recording", "تسجيل المقارنة التجريبي"],
    locator: ["Sample timestamp 02:10", "توقيت تجريبي ٠٢:١٠"],
    text: [
      "Compare first, then identify the labels.",
      "قارن أولًا ثم حدد الأسماء.",
    ],
  },
} as const;

export type StudyPassageId = keyof typeof passages;

export function studyPassage(id: string | null, locale: Locale) {
  if (!id || !Object.hasOwn(passages, id)) return null;
  const passage = passages[id as StudyPassageId];
  const language = locale === "ar" ? 1 : 0;
  return {
    id: id as StudyPassageId,
    format: passage.format,
    title: passage.title[language],
    locator: passage.locator[language],
    text: passage.text[language],
  };
}

export function studyMaterialReading(
  id: string | null,
  active: boolean,
  locale: Locale,
) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const passage = studyPassage(id, locale);
  return {
    readable: active && passage !== null,
    caption: !active
      ? t(
          "Reading is unavailable for new study while this source is inactive.",
          "القراءة للمذاكرة الجديدة غير متاحة ما دام هذا المصدر غير نشط.",
        )
      : passage?.id === "handout"
        ? t(
            "Processed passage available · excerpt only",
            "نص معالج متاح · مقتطف فقط",
          )
        : passage?.id === "recording"
          ? t(
              "Processed transcript available · excerpt only",
              "تفريغ معالج متاح · مقتطف فقط",
            )
          : t("No reading passage supplied", "لا يوجد نص متاح للقراءة"),
    action:
      !active || !passage
        ? null
        : passage.id === "handout"
          ? t("Read processed passage", "قراءة النص المعالج")
          : t("Read transcript excerpt", "قراءة مقتطف التفريغ"),
  };
}
