"use client";
import { useRef, useState, type ReactNode, type RefObject } from "react";
import { ChoiceGroup } from "@/app/_components/choice-group";
import { useProductText } from "@/app/_components/product-copy";
import { Notice } from "@/app/_components/notice";
import { Button, ProductLink } from "@/app/_components/product-ui";
import { useHostedSynthetic } from "@/app/_components/product-navigation";
import styles from "@/app/_components/product.module.css";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import {
  defaultQuizConfiguration,
  parseQuizNumber,
  quizAttemptReviewable,
  quizConfigurationErrors,
  validQuizConfiguration,
  type QuizConfiguration,
} from "@/lib/quiz/quiz-fixture.application";
import type { QuizSession } from "./use-quiz-session";

const formatQuizNumber = (value: number) =>
  Number.isNaN(value) ? "" : String(value);

/**
 * A whole-number setup field typed as text with a numeric keyboard, so
 * Arabic-Indic digits work (`parseQuizNumber`). It keeps what was typed
 * while the stored number matches it and shows a stored change (such as
 * "Use default setup") otherwise. Its error appears after blur or Start,
 * never while typing (IX-13).
 */
function QuizNumberField({
  id,
  label,
  value,
  onValue,
  onBlur,
  invalid,
  disabled,
  help,
  error,
  fieldRef,
  min,
  max,
}: {
  id: string;
  label: string;
  value: number;
  /** Arrow keys step within these bounds, as the number field did. */
  min: number;
  max: number;
  onValue: (value: number) => void;
  onBlur: () => void;
  invalid: boolean;
  disabled: boolean;
  help?: ReactNode;
  error: string;
  fieldRef: RefObject<HTMLInputElement | null>;
}) {
  const [draft, setDraft] = useState(() => ({
    text: formatQuizNumber(value),
    value,
  }));
  const text = Object.is(draft.value, value)
    ? draft.text
    : formatQuizNumber(value);
  return (
    <>
      <label className={styles.field}>
        {label}
        <input
          ref={fieldRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          enterKeyHint="done"
          maxLength={4}
          required
          disabled={disabled}
          aria-invalid={invalid}
          aria-describedby={
            [help ? `${id}-help` : null, invalid ? `${id}-error` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          value={text}
          onChange={(event) => {
            const next = parseQuizNumber(event.target.value);
            setDraft({ text: event.target.value, value: next });
            onValue(next);
          }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            const step = event.key === "ArrowUp" ? 1 : -1;
            const next = Number.isInteger(value)
              ? Math.min(max, Math.max(min, value + step))
              : min;
            setDraft({ text: formatQuizNumber(next), value: next });
            onValue(next);
          }}
          onBlur={onBlur}
        />
      </label>
      {help ? (
        <p id={`${id}-help`} className={styles.fieldHint}>
          {help}
        </p>
      ) : null}
      {invalid ? (
        <p role="alert" id={`${id}-error`} className={styles.fieldHint}>
          {error}
        </p>
      ) : null}
    </>
  );
}

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
  const hosted = useHostedSynthetic();
  const {
    unavailable,
    attempt,
    configuration,
    configurationErrors,
    setConfiguration,
    handoutAvailable,
    start,
  } = quiz;
  const countField = useRef<HTMLInputElement>(null);
  const durationField = useRef<HTMLInputElement>(null);
  // Which fields have been left (blur) or checked by Start.
  const [checked, setChecked] = useState({ count: false, duration: false });
  const countInvalid = checked.count && configurationErrors.questionCount;
  const durationInvalid =
    checked.duration && configurationErrors.durationMinutes;
  return (
    <section className={styles.panel}>
      <h2>{t("Set up your quiz", "إعداد الاختبار")}</h2>
      {unavailable ? (
        <Notice locale={locale}>
          {t(
            "Quiz is not available yet. Questions will come from approved materials when it launches.",
            "الاختبار غير متاح بعد. ستأتي الأسئلة من المصادر المعتمدة عند إطلاقه.",
          )}
        </Notice>
      ) : hosted ? null : (
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
            <QuizNumberField
              id="quiz-duration"
              min={1}
              max={240}
              fieldRef={durationField}
              label={t("Duration (minutes)", "المدة (بالدقائق)")}
              value={configuration.durationMinutes}
              disabled={unavailable}
              invalid={durationInvalid}
              error={t(
                "Enter a whole number of minutes from 1 to 240.",
                "أدخل عددًا صحيحًا من الدقائق من ١ إلى ٢٤٠.",
              )}
              onValue={(durationMinutes) => {
                setConfiguration((current) => ({
                  ...current,
                  durationMinutes,
                }));
                // A fixed value clears its error at once; a new error waits
                // for blur or Start.
                if (
                  !quizConfigurationErrors({
                    ...configuration,
                    durationMinutes,
                  }).durationMinutes
                )
                  setChecked((current) => ({ ...current, duration: false }));
              }}
              onBlur={() =>
                setChecked((current) => ({ ...current, duration: true }))
              }
            />
          </div>
        ) : null}
        <div className={styles.questionCount}>
          <QuizNumberField
            id="quiz-question-count"
            min={1}
            max={6}
            fieldRef={countField}
            label={t("Number of questions", "عدد الأسئلة")}
            value={configuration.questionCount}
            disabled={unavailable}
            invalid={countInvalid}
            help={
              unavailable
                ? t(
                    "1–6 questions per attempt.",
                    "من ١ إلى ٦ أسئلة في المحاولة.",
                  )
                : t(
                    "1–6 questions per sample attempt.",
                    "من ١ إلى ٦ أسئلة في المحاولة التجريبية.",
                  )
            }
            error={t(
              "Enter a whole number of questions from 1 to 6.",
              "أدخل عددًا صحيحًا من الأسئلة من ١ إلى ٦.",
            )}
            onValue={(questionCount) => {
              setConfiguration((current) => ({ ...current, questionCount }));
              if (
                !quizConfigurationErrors({ ...configuration, questionCount })
                  .questionCount
              )
                setChecked((current) => ({ ...current, count: false }));
            }}
            onBlur={() =>
              setChecked((current) => ({ ...current, count: true }))
            }
          />
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
      <div
        className={styles.quizStart}
        // A press on these actions keeps focus in the field: blurring an
        // invalid field first would show its error and push the actions
        // down before the click lands. Start validates and focuses the
        // field itself.
        onMouseDown={(event) => {
          if ((event.target as Element).closest("button, a"))
            event.preventDefault();
        }}
      >
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            if (validQuizConfiguration(configuration)) return start();
            // Start validates: it shows each field's error and moves to the
            // first field to fix.
            setChecked({
              count: configurationErrors.questionCount,
              duration: configurationErrors.durationMinutes,
            });
            (configurationErrors.durationMinutes
              ? durationField
              : countField
            ).current?.focus();
          }}
          disabled={!handoutAvailable}
        >
          {attempt
            ? t("Start new attempt", "بدء محاولة جديدة")
            : t("Start quiz", "بدء الاختبار")}
        </Button>
        <Button
          variant="quiet"
          disabled={unavailable}
          onClick={() => {
            setConfiguration(() => ({ ...defaultQuizConfiguration }));
            setChecked({ count: false, duration: false });
          }}
        >
          {t("Use default setup", "استخدام الإعدادات الافتراضية")}
        </Button>
        {attempt ? (
          <ProductLink
            size="large"
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
        <Notice tone="warning" locale={locale}>
          {t(
            "This quiz fixture needs the inactive handout. New attempts are unavailable until its source is active.",
            "مثال الاختبار يحتاج الملزمة غير النشطة. المحاولات الجديدة غير متاحة حتى تفعيل المصدر.",
          )}
        </Notice>
      ) : null}
      {attempt ? (
        <Notice locale={locale}>
          {t(
            "Your setup stays in this tab. A new attempt replaces the latest attempt; reloading clears both.",
            "تبقى إعداداتك في هذا التبويب. المحاولة الجديدة تستبدل آخر محاولة؛ وإعادة التحميل تمسحهما.",
          )}
        </Notice>
      ) : null}
    </section>
  );
}
