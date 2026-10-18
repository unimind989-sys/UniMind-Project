"use client";
import { MetaList } from "@/app/_components/meta-list";
import { useProductText } from "@/app/_components/product-copy";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import styles from "./quiz.module.css";

/** "Answered: n / total" and "Unanswered: m" as one metadata list: the
 * summary of an expired attempt. */
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
  const number = new Intl.NumberFormat(locale);
  return (
    <MetaList
      items={[
        {
          key: "answered",
          label: t("Answered", "تمت الإجابة"),
          labelVisible: true,
          value: `${number.format(answered)} / ${number.format(total)}`,
        },
        {
          key: "unanswered",
          label: t("Unanswered", "دون إجابة"),
          labelVisible: true,
          value: number.format(total - answered),
        },
      ]}
    />
  );
}

/** The sticky progress strip of an open attempt: "n of total answered",
 * the timer when timed, and the low-time warning. Timing and difficulty are
 * already named above it, so the strip repeats neither. */
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
  const number = new Intl.NumberFormat(locale);
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
          {t(
            `${number.format(answered)} of ${number.format(total)} answered`,
            `تمت الإجابة عن ${number.format(answered)} من ${number.format(total)}`,
          )}
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
