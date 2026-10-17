import type { Locale } from "../i18n/locale";

// Fixed processed excerpts already used by the synthetic evidence views.
// This is fixture presentation, never a retrieval or availability authority.
const passages = {
  handout: {
    format: "PDF",
    title: ["Lecture 6 handout", "ملزمة المحاضرة 6"],
    locator: ["Page 14", "صفحة ١٤"],
    text: [
      "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder. The plexus is formed by the ventral rami of C5 to T1.",
      "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
    ],
  },
  recording: {
    format: "AUDIO",
    title: ["Practical 3 recording", "تسجيل العملي 3"],
    locator: ["Timestamp 18:42", "التوقيت ١٨:٤٢"],
    text: [
      "Count the roots first. In some people the plexus is prefixed and takes a branch from C4, so check before you name the trunks.",
      "عُدّ الجذور أولًا. في بعض الناس تكون الضفيرة متقدمة وتأخذ فرعًا من C4، فتأكد قبل أن تسمي الجذوع.",
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
        ? t("Excerpt from the processed passage", "مقتطف من النص المعالج")
        : passage?.id === "recording"
          ? t(
              "Excerpt from the processed transcript",
              "مقتطف من التفريغ المعالج",
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
