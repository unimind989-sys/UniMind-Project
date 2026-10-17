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
const labels: Words = ["C5 and C6", "C5 وC6"];
const compare: Words = ["C8 and T1", "C8 وT1"];
const handout: Words = [
  "The Lecture 6 handout names C5 and C6 for an upper trunk injury and lists C5 to T1 for the plexus (page 14).",
  "تذكر ملزمة المحاضرة 6 الجذرين C5 وC6 لإصابة الجذع العلوي، وتذكر C5 إلى T1 للضفيرة (صفحة ١٤).",
];
const recording: Words = [
  "The Practical 3 recording says some plexuses also take a branch from C4 (18:42).",
  "يقول تسجيل العملي 3 إن بعض الضفائر تأخذ فرعًا من C4 أيضًا (١٨:٤٢).",
];
const missing: Words = [
  "Neither passage gives a recovery time.",
  "لا يذكر أي من النصين مدة للتعافي.",
];
const conflict: Words = [
  "The passages list different roots; neither gives a rule for choosing between them.",
  "يذكر النصان جذورًا مختلفة ولا يحددان قاعدة للاختيار بينهما.",
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
      [
        "Which roots does the handout give for an upper trunk injury?",
        "ما الجذور التي تذكرها الملزمة لإصابة الجذع العلوي؟",
      ],
      [labels, compare],
      0,
      handout,
      ["handout"],
    ),
    q(
      [
        "Which extra root does the recording mention?",
        "ما الجذر الإضافي الذي يذكره التسجيل؟",
      ],
      [
        ["T2", "T2"],
        ["C4", "C4"],
      ],
      1,
      recording,
      ["recording"],
    ),
    q(
      [
        "Does either passage give a recovery time?",
        "هل يذكر أي نص مدة للتعافي؟",
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
        ["Page 14", "صفحة ١٤"],
        ["Page 30", "صفحة ٣٠"],
      ],
      0,
      handout,
      ["handout"],
    ),
    q(
      ["Where is the recording passage?", "أين يوجد نص التسجيل؟"],
      [
        ["18:42", "١٨:٤٢"],
        ["42:18", "٤٢:١٨"],
      ],
      0,
      recording,
      ["recording"],
    ),
    q(
      ["Do the passages list the same roots?", "هل يذكر النصان الجذور نفسها؟"],
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
        "Which roots does the handout name for Erb's palsy?",
        "ما الجذور التي تذكرها الملزمة لشلل إرب؟",
      ],
      [labels, compare],
      0,
      handout,
      ["handout"],
    ),
    q(
      [
        "What recovery time do your sources give?",
        "ما مدة التعافي التي تذكرها مصادرك؟",
      ],
      [
        ["An exact number of weeks", "عدد محدد من الأسابيع"],
        ["No recovery time is given", "لا توجد مدة للتعافي"],
      ],
      1,
      missing,
      ["handout", "recording"],
    ),
    q(
      ["Which statement matches the recording?", "أي عبارة تطابق التسجيل؟"],
      [
        ["Some plexuses also take C4", "بعض الضفائر تأخذ C4 أيضًا"],
        ["The plexus never includes C4", "الضفيرة لا تشمل C4 أبدًا"],
      ],
      0,
      recording,
      ["recording"],
    ),
    q(
      ["What do the passages disagree about?", "في ماذا يختلف النصان؟"],
      [
        ["Which roots form the plexus", "الجذور التي تكوّن الضفيرة"],
        ["How long recovery takes", "مدة التعافي"],
      ],
      0,
      conflict,
      ["handout", "recording"],
    ),
    q(
      ["What does 18:42 locate?", "ما الذي يحدده ١٨:٤٢؟"],
      [
        ["The recording passage", "نص التسجيل"],
        ["How long the injury lasts", "مدة الإصابة"],
      ],
      0,
      recording,
      ["recording"],
    ),
    q(
      ["Which source lists only C5 to T1?", "أي مصدر يذكر C5 إلى T1 فقط؟"],
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
          "Describe both root lists and their disagreement",
          "اشرح قائمتي الجذور واختلافهما",
        ],
        [
          "Choose one list without mentioning the other",
          "اختر قائمة دون ذكر الأخرى",
        ],
      ],
      0,
      conflict,
      ["handout", "recording"],
    ),
    q(
      [
        "How should an answer handle a request for an exact recovery time?",
        "كيف تتعامل الإجابة مع طلب مدة دقيقة للتعافي؟",
      ],
      [
        ["Treat 18:42 as the recovery time", "اعتبر ١٨:٤٢ مدة التعافي"],
        ["Say that the passages do not give it", "اذكر أن النصين لا يذكرانها"],
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
        ["No; the recording adds a C4 branch", "لا؛ يضيف التسجيل فرعًا من C4"],
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
        ["The passage begins at 18:42", "يبدأ النص عند ١٨:٤٢"],
        [
          "Recovery takes 18 weeks and 42 days",
          "يستغرق التعافي ١٨ أسبوعًا و٤٢ يومًا",
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
          "Yes; a recording always overrides a handout",
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
        ["C4 to T1", "من C4 إلى T1"],
        ["C5 to T1", "من C5 إلى T1"],
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
