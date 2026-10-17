"use client";
import { useProductText } from "@/app/_components/product-copy";
import { Button, Notice, ProductLink } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import { ProductSourceDialog } from "../product-source-dialog";
import { QuizAnsweredCount, QuizProgress } from "./quiz-progress";
import { QuizQuestion } from "./quiz-question";
import type { QuizSession } from "./use-quiz-session";

export type PassageQuestion = { attemptKey: string; index: number };

/**
 * An open attempt, or the read-only review of a submitted or expired one,
 * with its questions, actions and per-question supporting passages.
 */
export function QuizAttempt({
  quiz,
  attempt,
  scope,
  locale,
  base,
  screen,
  now,
  expired,
  readOnly,
  passageQuestion,
  onPassageQuestion,
}: {
  quiz: QuizSession;
  attempt: NonNullable<QuizSession["attempt"]>;
  scope: WorkspaceScope;
  locale: Locale;
  base: string;
  screen: string;
  now: number;
  expired: boolean;
  readOnly: boolean;
  passageQuestion: PassageQuestion | null;
  onPassageQuestion: (question: PassageQuestion | null) => void;
}) {
  const t = useProductText(locale);
  const { questions, handoutAvailable } = quiz;
  const score = questions.filter(
    (question, index) => attempt.answers[index] === question.correct,
  ).length;
  const answered = attempt.answers.filter((answer) => answer >= 0).length;
  const remainingSeconds = attempt.expiresAt
    ? Math.max(0, Math.ceil((attempt.expiresAt - now) / 1000))
    : null;
  return (
    <>
      {!expired ? (
        <h2>
          {readOnly
            ? t("Quiz review", "مراجعة الاختبار")
            : t("Quiz attempt", "محاولة الاختبار")}
        </h2>
      ) : null}
      <p>
        {
          {
            easy: t("Easy", "سهل"),
            medium: t("Medium", "متوسط"),
            hard: t("Hard", "صعب"),
          }[attempt.configuration.difficulty]
        }{" "}
        ·{" "}
        {attempt.configuration.mode === "timed"
          ? `${t("Timed", "مؤقت")} · ${new Intl.NumberFormat(locale).format(attempt.configuration.durationMinutes)} ${t("minutes", "دقائق")}`
          : t("Untimed", "دون توقيت")}
      </p>
      {expired ? (
        <>
          <h2>{t("Expired quiz review", "مراجعة الاختبار المنتهي")}</h2>
          <Notice error>
            {t(
              "This timed attempt has expired. No score was recorded. Your answers are frozen; review the corrections below.",
              "انتهى وقت المحاولة. لم تسجل نتيجة. إجاباتك ثابتة؛ راجع التصحيحات أدناه.",
            )}
          </Notice>
          <p>
            <QuizAnsweredCount
              locale={locale}
              answered={answered}
              total={questions.length}
            />
          </p>
        </>
      ) : null}
      <QuizProgress
        locale={locale}
        answered={answered}
        total={questions.length}
        readOnly={readOnly}
        expired={expired}
        expiresAt={attempt.expiresAt}
        remainingSeconds={remainingSeconds}
      />
      {attempt.submitted ? (
        <Notice>
          {t("Simulated score", "نتيجة محاكاة")}:{" "}
          {new Intl.NumberFormat(locale).format(score)} /{" "}
          {new Intl.NumberFormat(locale).format(questions.length)} ·{" "}
          {t("illustrative only", "توضيحية فقط")}
        </Notice>
      ) : null}
      {questions.map((question, index) => (
        <QuizQuestion
          key={index}
          question={question}
          index={index}
          total={questions.length}
          selected={attempt.answers[index]}
          readOnly={readOnly}
          locale={locale}
          onAnswer={(answerIndex) =>
            quiz.answer(attempt.inspectionKey, index, answerIndex)
          }
          onShowPassages={() =>
            onPassageQuestion({ attemptKey: attempt.inspectionKey, index })
          }
        />
      ))}
      {!readOnly ? (
        <p id="quiz-submit-help">
          {answered < questions.length ? (
            <>
              {t(
                "Answer every question before submitting. Unanswered questions",
                "أجب عن كل الأسئلة قبل التسليم. الأسئلة دون إجابة",
              )}
              :{" "}
              <bdi>
                {attempt.answers
                  .flatMap((answer, index) =>
                    answer < 0
                      ? [new Intl.NumberFormat(locale).format(index + 1)]
                      : [],
                  )
                  .join(locale === "ar" ? "، " : ", ")}
              </bdi>
              .
            </>
          ) : (
            t(
              "All questions answered. You can submit now.",
              "تمت الإجابة عن كل الأسئلة. يمكنك التسليم الآن.",
            )
          )}
        </p>
      ) : null}
      <div className={styles.actions}>
        {!readOnly ? (
          <Button
            primary
            disabled={
              !handoutAvailable || attempt.answers.some((answer) => answer < 0)
            }
            onClick={() => quiz.submit(attempt.inspectionKey)}
          >
            {t("Submit answers", "تسليم الإجابات")}
          </Button>
        ) : (
          <Button
            primary
            disabled={!handoutAvailable}
            onClick={() =>
              quiz.start(attempt.configuration, attempt.inspectionKey)
            }
          >
            {t("Repeat this setup", "تكرار هذه الإعدادات")}
          </Button>
        )}
        <ProductLink href={base + "/quiz"} locale={locale}>
          {t("Back to quiz", "العودة للاختبار")}
        </ProductLink>
        <ProductLink
          href={`${base}/sources?from=${screen === "quiz-review" ? "quiz-review" : "quiz-attempt"}&attempt=${encodeURIComponent(attempt.inspectionKey)}`}
          locale={locale}
        >
          {t("Browse material library", "تصفح مكتبة المصادر")}
        </ProductLink>
      </div>
      <ProductSourceDialog
        open={Boolean(
          readOnly &&
          passageQuestion?.attemptKey === attempt.inspectionKey &&
          questions[passageQuestion.index],
        )}
        title={
          t("Supporting passages for question", "النصوص الداعمة للسؤال") +
          " " +
          new Intl.NumberFormat(locale).format(
            (passageQuestion?.index ?? 0) + 1,
          )
        }
        ids={
          passageQuestion?.attemptKey === attempt.inspectionKey
            ? (questions[passageQuestion.index]?.supportingPassages ?? [])
            : []
        }
        scope={scope}
        locale={locale}
        libraryHref={`${base}/sources?from=${screen === "quiz-review" ? "quiz-review" : "quiz-attempt"}&attempt=${encodeURIComponent(attempt.inspectionKey)}`}
        onClose={() => onPassageQuestion(null)}
      />
    </>
  );
}
