"use client";
import { useProductText } from "@/app/_components/product-copy";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import styles from "./quiz.module.css";

/** "Answered: n / total · Unanswered: m", shared by progress and expiry. */
export function QuizAnsweredCount({
  locale,
  answered,
  total,
}: {
  locale: Locale;
  answered: number;
  total: number;
}) {
  const t = useProductText(locale);
  return (
    <>
      {t("Answered", "تمت الإجابة")}:{" "}
      <bdi>
        {new Intl.NumberFormat(locale).format(answered)} /{" "}
        {new Intl.NumberFormat(locale).format(total)}
      </bdi>{" "}
      · {t("Unanswered", "دون إجابة")}:{" "}
      {new Intl.NumberFormat(locale).format(total - answered)}
    </>
  );
}

/** The sticky progress, timer and low-time warning of an open attempt. */
export function QuizProgress({
  locale,
  answered,
  total,
  readOnly,
  expired,
  expiresAt,
  remainingSeconds,
}: {
  locale: Locale;
  answered: number;
  total: number;
  readOnly: boolean;
  expired: boolean;
  expiresAt: number | undefined;
  remainingSeconds: number | null;
}) {
  const t = useProductText(locale);
  const clockNumber = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  return (
    <div
      className={!readOnly ? styles.quizProgress : undefined}
      data-workspace-chrome={!readOnly ? true : undefined}
    >
      {!expired ? (
        <p id="quiz-progress" aria-live="polite">
          <QuizAnsweredCount
            locale={locale}
            answered={answered}
            total={total}
          />
        </p>
      ) : null}
      {expiresAt && !readOnly ? (
        <p role="timer">
          {t("Time remaining", "الوقت المتبقي")}:{" "}
          <bdi>
            {clockNumber.format(Math.floor(remainingSeconds! / 60))}:
            {clockNumber.format(remainingSeconds! % 60)}
          </bdi>
        </p>
      ) : null}
      {!expiresAt && !readOnly ? <p>{t("Untimed", "دون توقيت")}</p> : null}
      {remainingSeconds !== null &&
      remainingSeconds > 0 &&
      remainingSeconds < 60 &&
      !readOnly ? (
        <p className={styles.lowTime} role="status">
          {t("Less than one minute remains.", "متبقي أقل من دقيقة.")}
        </p>
      ) : null}
    </div>
  );
}
