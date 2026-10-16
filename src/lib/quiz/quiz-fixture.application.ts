import type { Locale } from "@/lib/i18n/locale";
import type { StudyPassageId } from "../study/study-passages.application";

// Public synthetic passages only. Production questions and grading remain server-owned.
export type QuizDifficulty = "easy" | "medium" | "hard";
export type QuizConfiguration = {
  mode: "untimed" | "timed";
  durationMinutes: number;
  questionCount: number;
  difficulty: QuizDifficulty;
};
type Words = readonly [string, string];
type Question = {
  prompt: Words;
  choices: readonly [Words, Words];
  correct: number;
  explanation: Words;
  supportingPassages: readonly StudyPassageId[];
};
const labels: Words = ["Identify labels", "تحديد الأسماء"];
const compare: Words = ["Compare diagrams", "مقارنة الرسوم"];
const handout: Words = [
  "The sample handout identifies labels before comparing diagrams (page 3).",
  "تضع الملزمة التجريبية تحديد الأسماء قبل مقارنة الرسوم (صفحة ٣).",
];
const recording: Words = [
  "The sample recording compares first, then identifies labels (02:10).",
  "يضع التسجيل التجريبي المقارنة أولًا ثم تحديد الأسماء (٠٢:١٠).",
];
const missing: Words = [
  "Neither passage supplies a study duration.",
  "لا يحدد أي من النصين مدة للمذاكرة.",
];
const conflict: Words = [
  "The passages give different orders; neither supplies a rule for choosing between them.",
  "يقدم النصان ترتيبين مختلفين ولا يحددان قاعدة للاختيار بينهما.",
];
function q(
  prompt: Words,
  choices: readonly [Words, Words],
  correct: number,
  explanation: Words,
  supportingPassages: readonly StudyPassageId[],
): Question {
  return { prompt, choices, correct, explanation, supportingPassages };
}
const bank: Record<QuizDifficulty, readonly Question[]> = {
  easy: [
    q(
      ["What comes first in the handout?", "ما الخطوة الأولى في الملزمة؟"],
      [labels, compare],
      0,
      handout,
      ["handout"],
    ),
    q(
      ["What comes first in the recording?", "ما الخطوة الأولى في التسجيل؟"],
      [labels, compare],
      1,
      recording,
      ["recording"],
    ),
    q(
      [
        "Does either passage give a study duration?",
        "هل يحدد أي نص مدة للمذاكرة؟",
      ],
      [
        ["Yes", "نعم"],
        ["No", "لا"],
      ],
      1,
      missing,
      ["handout", "recording"],
    ),
    q(
      [
        "Which page contains the handout passage?",
        "في أي صفحة يوجد نص الملزمة؟",
      ],
      [
        ["Page 3", "صفحة ٣"],
        ["Page 10", "صفحة ١٠"],
      ],
      0,
      handout,
      ["handout"],
    ),
    q(
      ["Where is the recording passage?", "أين يوجد نص التسجيل؟"],
      [
        ["02:10", "٠٢:١٠"],
        ["20:00", "٢٠:٠٠"],
      ],
      0,
      recording,
      ["recording"],
    ),
    q(
      ["Do the passages give the same order?", "هل يقدم النصان نفس الترتيب؟"],
      [
        ["Yes", "نعم"],
        ["No", "لا"],
      ],
      1,
      conflict,
      ["handout", "recording"],
    ),
  ],
  medium: [
    q(
      [
        "Which step is first in the sample handout?",
        "ما الخطوة الأولى في الملزمة التجريبية؟",
      ],
      [labels, compare],
      0,
      handout,
      ["handout"],
    ),
    q(
      [
        "What timing do the sample sources specify?",
        "ما التوقيت المحدد في المصادر التجريبية؟",
      ],
      [
        ["An exact duration", "مدة دقيقة"],
        ["No duration is supplied", "لا توجد مدة محددة"],
      ],
      1,
      missing,
      ["handout", "recording"],
    ),
    q(
      ["Which sequence matches the recording?", "أي ترتيب يطابق التسجيل؟"],
      [
        ["Compare, then identify", "قارن ثم حدد"],
        ["Identify, then compare", "حدد ثم قارن"],
      ],
      0,
      recording,
      ["recording"],
    ),
    q(
      ["What do the passages disagree about?", "في ماذا يختلف النصان؟"],
      [
        ["The order of the steps", "ترتيب الخطوات"],
        ["A fixed duration", "مدة ثابتة"],
      ],
      0,
      conflict,
      ["handout", "recording"],
    ),
    q(
      ["What does 02:10 locate?", "ما الذي يحدده ٠٢:١٠؟"],
      [
        ["The recording passage", "نص التسجيل"],
        ["The length of the study session", "مدة جلسة المذاكرة"],
      ],
      0,
      recording,
      ["recording"],
    ),
    q(
      [
        "Which source supports identification first?",
        "أي مصدر يدعم التحديد أولًا؟",
      ],
      [
        ["The recording", "التسجيل"],
        ["The handout", "الملزمة"],
      ],
      1,
      handout,
      ["handout"],
    ),
  ],
  hard: [
    q(
      [
        "Which answer preserves the evidence accurately?",
        "أي إجابة تحافظ على دقة الأدلة؟",
      ],
      [
        [
          "Describe both orders and their disagreement",
          "اشرح الترتيبين واختلافهما",
        ],
        [
          "Choose one order without mentioning the other",
          "اختر ترتيبًا دون ذكر الآخر",
        ],
      ],
      0,
      conflict,
      ["handout", "recording"],
    ),
    q(
      [
        "How should an answer handle a request for an exact study duration?",
        "كيف تتعامل الإجابة مع طلب مدة دقيقة للمذاكرة؟",
      ],
      [
        ["Treat 02:10 as the recommended duration", "اعتبر ٠٢:١٠ مدة موصى بها"],
        [
          "Say that the passages do not specify it",
          "اذكر أن النصين لا يحددانها",
        ],
      ],
      1,
      missing,
      ["handout", "recording"],
    ),
    q(
      [
        "Does the handout establish that both sources agree?",
        "هل تثبت الملزمة اتفاق المصدرين؟",
      ],
      [
        [
          "No; the recording gives a different order",
          "لا؛ يقدم التسجيل ترتيبًا مختلفًا",
        ],
        ["Yes; one passage is sufficient", "نعم؛ نص واحد يكفي"],
      ],
      0,
      conflict,
      ["handout", "recording"],
    ),
    q(
      [
        "Which claim is unsupported by the recording timestamp?",
        "أي ادعاء لا يدعمه توقيت التسجيل؟",
      ],
      [
        ["The passage begins at 02:10", "يبدأ النص عند ٠٢:١٠"],
        [
          "Studying should take two minutes and ten seconds",
          "يجب أن تستغرق المذاكرة دقيقتين وعشر ثوانٍ",
        ],
      ],
      1,
      missing,
      ["handout", "recording"],
    ),
    q(
      [
        "Can source format alone resolve the disagreement?",
        "هل يكفي شكل المصدر لحسم الاختلاف؟",
      ],
      [
        [
          "Yes; audio always overrides a handout",
          "نعم؛ التسجيل يتفوق دائمًا على الملزمة",
        ],
        [
          "No; neither passage supplies that rule",
          "لا؛ لا يقدم أي نص هذه القاعدة",
        ],
      ],
      1,
      conflict,
      ["handout", "recording"],
    ),
    q(
      [
        "Which summary follows only the handout?",
        "أي ملخص يتبع الملزمة وحدها؟",
      ],
      [
        ["Compare before identifying", "قارن قبل التحديد"],
        ["Identify before comparing", "حدد قبل المقارنة"],
      ],
      1,
      handout,
      ["handout"],
    ),
  ],
};
export const defaultQuizConfiguration: QuizConfiguration = {
  mode: "untimed",
  durationMinutes: 5,
  questionCount: 2,
  difficulty: "medium",
};
export function validQuizConfiguration(value: QuizConfiguration): boolean {
  const errors = quizConfigurationErrors(value);
  return (
    (value.mode === "untimed" || value.mode === "timed") &&
    Object.hasOwn(bank, value.difficulty) &&
    !errors.questionCount &&
    !errors.durationMinutes
  );
}
export function quizConfigurationErrors(value: QuizConfiguration) {
  return {
    questionCount:
      !Number.isInteger(value.questionCount) ||
      value.questionCount < 1 ||
      value.questionCount > 6,
    durationMinutes:
      value.mode === "timed" &&
      (!Number.isInteger(value.durationMinutes) ||
        value.durationMinutes < 1 ||
        value.durationMinutes > 240),
  };
}
export function fixtureQuizQuestions(
  config: QuizConfiguration,
  locale: Locale,
) {
  if (!validQuizConfiguration(config))
    throw new Error("Invalid sample quiz configuration.");
  const index = locale === "ar" ? 1 : 0;
  return bank[config.difficulty]
    .slice(0, config.questionCount)
    .map((question) => ({
      prompt: question.prompt[index],
      choices: question.choices.map((choice) => choice[index]),
      correct: question.correct,
      explanation: question.explanation[index],
      supportingPassages: question.supportingPassages,
    }));
}
export function fixtureQuizAttempt(config: QuizConfiguration, now: number) {
  if (!validQuizConfiguration(config))
    throw new Error("Invalid sample quiz configuration.");
  return {
    configuration: { ...config },
    answers: Array<number>(config.questionCount).fill(-1),
    submitted: false,
    ...(config.mode === "timed"
      ? { expiresAt: now + config.durationMinutes * 60_000 }
      : {}),
  };
}
export function quizAttemptExpired(
  attempt: { expiresAt?: number },
  now: number,
) {
  return attempt.expiresAt !== undefined && now >= attempt.expiresAt;
}

type QuizAnswers = {
  answers: number[];
  submitted: boolean;
  expiresAt?: number;
  abandoned?: boolean;
};

export function quizAttemptReviewable(
  attempt: {
    submitted: boolean;
    abandoned?: boolean;
    expiresAt?: number;
  },
  now?: number,
): boolean {
  return (
    attempt.submitted ||
    attempt.abandoned === true ||
    (now !== undefined && quizAttemptExpired(attempt, now))
  );
}

// Terminal outcomes retain their original answers. Every interaction checks the
// deadline independently of the UI timer, including delayed background events.
export function expireQuizAttempt<T extends QuizAnswers>(
  attempt: T,
  now: number,
): T {
  return !quizAttemptReviewable(attempt) && quizAttemptExpired(attempt, now)
    ? { ...attempt, abandoned: true }
    : attempt;
}

export function answerQuizAttempt<T extends QuizAnswers>(
  attempt: T,
  index: number,
  answer: number,
  now: number,
): T {
  const current = expireQuizAttempt(attempt, now);
  if (
    quizAttemptReviewable(current) ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= current.answers.length ||
    !Number.isInteger(answer) ||
    answer < 0 ||
    answer > 1
  )
    return current;
  return {
    ...current,
    answers: current.answers.map((value, position) =>
      position === index ? answer : value,
    ),
  };
}

export function submitQuizAttempt<T extends QuizAnswers>(
  attempt: T,
  now: number,
): T {
  const current = expireQuizAttempt(attempt, now);
  return quizAttemptReviewable(current) ||
    current.answers.some((answer) => answer !== 0 && answer !== 1)
    ? current
    : { ...current, submitted: true };
}
