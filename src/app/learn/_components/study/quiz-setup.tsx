"use client";
import { ChoiceGroup } from "@/app/_components/choice-group";
import { useProductText } from "@/app/_components/product-copy";
import { Button, Notice, ProductLink } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import {
  defaultQuizConfiguration,
  quizAttemptReviewable,
  validQuizConfiguration,
  type QuizConfiguration,
} from "@/lib/quiz/quiz-fixture.application";
import type { QuizSession } from "./use-quiz-session";

/** Quiz setup: timing, duration, question count and difficulty. */
export function QuizSetup({
  quiz,
  locale,
  base,
  now,
}: {
  quiz: QuizSession;
  locale: Locale;
  base: string;
  now: number;
}) {
  const t = useProductText(locale);
  const {
    unavailable,
    attempt,
    configuration,
    configurationErrors,
    setConfiguration,
    handoutAvailable,
    start,
  } = quiz;
  return (
    <section className={styles.panel}>
      <h2>{t("Set up your quiz", "إعداد الاختبار")}</h2>
      {unavailable ? (
        <Notice>
          {t(
            "Quiz is not available yet. Questions will come from approved materials when it launches.",
            "الاختبار غير متاح بعد. ستأتي الأسئلة من المصادر المعتمدة عند إطلاقه.",
          )}
        </Notice>
      ) : (
        <p>
          {t(
            "Choose from six sample questions per difficulty. Scores are illustrative and stay in this tab.",
            "اختر من ستة أسئلة تجريبية لكل مستوى. النتيجة توضيحية وتبقى في هذا التبويب.",
          )}
        </p>
      )}
      <div className={styles.quizConfiguration}>
        <ChoiceGroup
          label={t("Timing", "التوقيت")}
          value={configuration.mode}
          disabled={unavailable}
          options={[
            ["untimed", t("Untimed", "دون توقيت")],
            ["timed", t("Timed", "مؤقت")],
          ]}
          onChange={(value) =>
            setConfiguration((current) => ({
              ...current,
              mode: value as QuizConfiguration["mode"],
            }))
          }
        />
        {configuration.mode === "timed" ? (
          <div>
            <label className={styles.field}>
              {t("Duration (minutes)", "المدة (بالدقائق)")}
              <input
                type="number"
                disabled={unavailable}
                min={1}
                max={240}
                step={1}
                aria-invalid={configurationErrors.durationMinutes}
                aria-describedby={
                  configurationErrors.durationMinutes
                    ? "quiz-duration-error"
                    : undefined
                }
                value={
                  Number.isNaN(configuration.durationMinutes)
                    ? ""
                    : configuration.durationMinutes
                }
                onChange={(event) =>
                  setConfiguration((current) => ({
                    ...current,
                    durationMinutes: event.target.valueAsNumber,
                  }))
                }
              />
            </label>
            {configurationErrors.durationMinutes ? (
              <p
                role="alert"
                id="quiz-duration-error"
                className={styles.fieldHint}
              >
                {t(
                  "Enter a whole number of minutes from 1 to 240.",
                  "أدخل عددًا صحيحًا من الدقائق من ١ إلى ٢٤٠.",
                )}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={styles.questionCount}>
          <label className={styles.field}>
            {t("Number of questions", "عدد الأسئلة")}
            <input
              type="number"
              disabled={unavailable}
              min={1}
              max={6}
              step={1}
              aria-invalid={configurationErrors.questionCount}
              aria-describedby={`quiz-question-count-help${configurationErrors.questionCount ? " quiz-question-count-error" : ""}`}
              value={
                Number.isNaN(configuration.questionCount)
                  ? ""
                  : configuration.questionCount
              }
              onChange={(event) =>
                setConfiguration((current) => ({
                  ...current,
                  questionCount: event.target.valueAsNumber,
                }))
              }
            />
          </label>
          <p id="quiz-question-count-help" className={styles.fieldHint}>
            {unavailable
              ? t("1–6 questions per attempt.", "من ١ إلى ٦ أسئلة في المحاولة.")
              : t(
                  "1–6 questions per sample attempt.",
                  "من ١ إلى ٦ أسئلة في المحاولة التجريبية.",
                )}
          </p>
          {configurationErrors.questionCount ? (
            <p
              role="alert"
              id="quiz-question-count-error"
              className={styles.fieldHint}
            >
              {t(
                "Enter a whole number of questions from 1 to 6.",
                "أدخل عددًا صحيحًا من الأسئلة من ١ إلى ٦.",
              )}
            </p>
          ) : null}
        </div>
        <ChoiceGroup
          label={t("Difficulty", "الصعوبة")}
          value={configuration.difficulty}
          disabled={unavailable}
          options={[
            ["easy", t("Easy", "سهل")],
            ["medium", t("Medium", "متوسط")],
            ["hard", t("Hard", "صعب")],
          ]}
          onChange={(value) =>
            setConfiguration((current) => ({
              ...current,
              difficulty: value as QuizConfiguration["difficulty"],
            }))
          }
        />
      </div>
      <div className={styles.quizStart}>
        <Button
          primary
          onClick={() => start()}
          disabled={!handoutAvailable || !validQuizConfiguration(configuration)}
        >
          {attempt
            ? t("Start new attempt", "بدء محاولة جديدة")
            : t("Start quiz", "بدء الاختبار")}
        </Button>
        <Button
          disabled={unavailable}
          onClick={() =>
            setConfiguration(() => ({ ...defaultQuizConfiguration }))
          }
        >
          {t("Use default setup", "استخدام الإعدادات الافتراضية")}
        </Button>
        {attempt ? (
          <ProductLink
            href={`${base}/quiz/sample-attempt${quizAttemptReviewable(attempt, now) ? "/review" : ""}?attempt=${encodeURIComponent(attempt.inspectionKey)}`}
            locale={locale}
          >
            {attempt.submitted
              ? t("Review score", "مراجعة النتيجة")
              : quizAttemptReviewable(attempt, now)
                ? t("Review expired attempt", "مراجعة المحاولة المنتهية")
                : t("Open sample attempt", "فتح المحاولة التجريبية")}
          </ProductLink>
        ) : null}
      </div>
      {!handoutAvailable && !unavailable ? (
        <Notice error>
          {t(
            "This quiz fixture needs the inactive handout. New attempts are unavailable until its source is active.",
            "مثال الاختبار يحتاج الملزمة غير النشطة. المحاولات الجديدة غير متاحة حتى تفعيل المصدر.",
          )}
        </Notice>
      ) : null}
      {attempt ? (
        <Notice>
          {t(
            "Your setup stays in this tab. A new attempt replaces the latest attempt; reloading clears both.",
            "تبقى إعداداتك في هذا التبويب. المحاولة الجديدة تستبدل آخر محاولة؛ وإعادة التحميل تمسحهما.",
          )}
        </Notice>
      ) : null}
    </section>
  );
}
