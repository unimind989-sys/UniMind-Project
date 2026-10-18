"use client";
import { useProductText } from "@/app/_components/product-copy";
import { Button } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import type { QuizSession } from "./use-quiz-session";

/**
 * One question: its choices while the attempt is open, and the correction plus
 * a supporting-passages action once it is read-only.
 */
export function QuizQuestion({
  question,
  index,
  total,
  selected,
  readOnly,
  locale,
  onAnswer,
  onShowPassages,
}: {
  question: QuizSession["questions"][number];
  index: number;
  total: number;
  selected: number | undefined;
  readOnly: boolean;
  locale: Locale;
  onAnswer: (answerIndex: number) => void;
  onShowPassages: () => void;
}) {
  const t = useProductText(locale);
  return (
    <>
      <fieldset className={styles.question} disabled={readOnly}>
        <legend>
          <span>
            {t("Question", "السؤال")}{" "}
            {new Intl.NumberFormat(locale).format(index + 1)} {t("of", "من")}{" "}
            {new Intl.NumberFormat(locale).format(total)}
          </span>
          <span className="visually-hidden">: </span>
          <span>{question.prompt}</span>
        </legend>
        {question.choices.map((choice, answerIndex) => (
          <label className={styles.check} key={choice}>
            <input
              type="radio"
              name={`sample-question-${index}`}
              checked={selected === answerIndex}
              onChange={() => onAnswer(answerIndex)}
            />
            {choice}
          </label>
        ))}
        {readOnly ? (
          <div>
            <p
              className={`${styles.verdict} ${
                selected! < 0
                  ? styles.verdictUnanswered
                  : selected === question.correct
                    ? styles.verdictCorrect
                    : styles.verdictIncorrect
              }`}
            >
              <strong>
                {selected! < 0
                  ? t("Unanswered", "دون إجابة")
                  : selected === question.correct
                    ? t("Correct", "صحيحة")
                    : t("Incorrect", "غير صحيحة")}
              </strong>
            </p>
            <p>
              {t("Your answer", "إجابتك")}:{" "}
              {question.choices[selected!] ?? t("Unanswered", "دون إجابة")}
            </p>
            <p>
              {t("Correct answer", "الإجابة الصحيحة")}:{" "}
              {question.choices[question.correct]}
            </p>
            <p>{question.explanation}</p>
          </div>
        ) : null}
      </fieldset>
      {readOnly ? (
        <div className={styles.actions}>
          <Button onClick={onShowPassages}>
            {t("Supporting passages for question", "النصوص الداعمة للسؤال")}{" "}
            {new Intl.NumberFormat(locale).format(index + 1)}
          </Button>
        </div>
      ) : null}
    </>
  );
}
