import type { Locale } from "../i18n/locale";
import type { StudyReturnTool } from "./study-origin.application";

type Words = readonly [string, string];
type Conversation = {
  title?: Words;
  answers: readonly { kind: string; promptKind?: string }[];
};
const topics: Record<string, Words> = {
  supported: ["Study sequence", "ترتيب الدراسة"],
  partial: ["Sequence and missing duration", "الترتيب والمدة غير المذكورة"],
  unavailable: ["Source coverage", "ما تغطيه المصادر"],
  conflict: ["Handout and recording comparison", "مقارنة الملزمة والتسجيل"],
  hint: ["Professor emphasis", "تركيز المحاضر"],
  educational: ["Fictional educational case", "حالة تعليمية خيالية"],
  patient: ["Educational-use boundary", "حدود الاستخدام التعليمي"],
  unmatched: ["Other question", "سؤال آخر"],
};
const formats: Record<string, Words> = {
  summary: ["Structured summary", "ملخص منظم"],
  guide: ["Study guide", "دليل مذاكرة"],
  practice: ["Practice questions", "أسئلة تدريب"],
  flashcards: ["Flashcards", "بطاقات مراجعة"],
  revision: ["Revision pack", "حزمة مراجعة"],
  quiz: ["MCQ quiz", "اختبار اختيار من متعدد"],
};
const word = (value: Words, locale: Locale) => value[locale === "ar" ? 1 : 0];

// Metadata for browser-only fixture records. Never store or derive a title from
// arbitrary prompt text. Existing explicitly prepared titles keep their meaning.
export function conversationTitle(session: Conversation, locale: Locale) {
  if (session.title) return word(session.title, locale);
  const first = session.answers[0];
  const kind = first?.promptKind ?? first?.kind;
  const topic = kind && Object.hasOwn(topics, kind) ? topics[kind] : undefined;
  return word(topic ?? ["New conversation", "محادثة جديدة"], locale);
}

export type RecentStudyDetails = { title: string; detail: string };
export function recentStudyDetails({
  tool,
  locale,
  conversation,
  artifact,
  attempt,
  now,
}: {
  tool: StudyReturnTool;
  locale: Locale;
  conversation?: Conversation | undefined;
  artifact?: { type: string; topic: string } | undefined;
  attempt?:
    | {
        answers: readonly number[];
        submitted: boolean;
        abandoned?: boolean;
        expiresAt?: number;
      }
    | undefined;
  now: number;
}): RecentStudyDetails | null {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  if (tool === "chat" && conversation) {
    return {
      title: conversationTitle(conversation, locale),
      detail:
        t("Replies", "الإجابات") +
        " · " +
        new Intl.NumberFormat(locale).format(conversation.answers.length),
    };
  }
  if (tool === "studio" && artifact) {
    const format = Object.hasOwn(formats, artifact.type)
      ? formats[artifact.type]
      : undefined;
    const topic =
      artifact.topic === "sequence"
        ? t("Study sequence", "ترتيب الدراسة")
        : artifact.topic === "comparison"
          ? t("Diagram comparison", "مقارنة الرسوم")
          : null;
    if (!format || !topic) return null;
    return { title: word(format, locale), detail: topic };
  }
  if ((tool === "attempt" || tool === "quiz-review") && attempt) {
    const expired =
      attempt.abandoned ||
      (attempt.expiresAt !== undefined && now >= attempt.expiresAt);
    return {
      title: t("Quiz attempt", "محاولة اختبار"),
      detail: attempt.submitted
        ? t("Submitted · Review available", "تم التسليم · المراجعة متاحة")
        : expired
          ? t("Expired · Unscored review", "انتهت المدة · مراجعة دون نتيجة")
          : t("In progress", "قيد الحل") +
            " · " +
            new Intl.NumberFormat(locale).format(
              attempt.answers.filter((answer) => answer >= 0).length,
            ) +
            t(" answered", " إجابات"),
    };
  }
  return null;
}
