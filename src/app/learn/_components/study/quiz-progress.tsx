"use client";
import { MetaList } from "@/app/_components/meta-list";
import { useProductText } from "@/app/_components/product-copy";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import styles from "./quiz.module.css";

/** "Answered: n / total" and "Unanswered: m" as one metadata list, shared
 * by progress and expiry. */
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
        <div id="quiz-progress" aria-live="polite">
          <QuizAnsweredCount
            locale={locale}
            answered={answered}
            total={total}
          />
        </div>
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
