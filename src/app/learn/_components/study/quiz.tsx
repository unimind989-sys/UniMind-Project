"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProductText } from "@/app/_components/product-copy";
import { Notice, ProductLink } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import { quizAttemptExpired } from "@/lib/quiz/quiz-fixture.application";
import { quizInspectionKeyMatches } from "@/lib/study/study-origin.application";
import { QuizAttempt, type PassageQuestion } from "./quiz-attempt";
import { QuizSetup } from "./quiz-setup";
import type { ProductStudyProps } from "./study-props";
import { useQuizSession } from "./use-quiz-session";

/**
 * The quiz tool across its setup, attempt and review screens. It stays
 * mounted between those screens, so the open supporting-passages question
 * survives the move from an attempt to its review.
 */
export function Quiz({
  scope,
  locale,
  base,
  screen,
  quizTime: now,
  onQuizStart,
}: ProductStudyProps & {
  quizTime: number;
  onQuizStart: (time: number) => void;
}) {
  const query = useSearchParams();
  const t = useProductText(locale);
  const quiz = useQuizSession(scope, locale, base, onQuizStart);
  const { attempt } = quiz;
  const [passageQuestion, setPassageQuestion] =
    useState<PassageQuestion | null>(null);
  if (screen === "quiz")
    return <QuizSetup quiz={quiz} locale={locale} base={base} now={now} />;
  if (
    query.has("attempt") &&
    !quizInspectionKeyMatches(query, attempt?.inspectionKey)
  )
    return (
      <section className={styles.panel}>
        <Notice error>
          {t(
            "This source return no longer matches the current quiz. Open Quiz to continue.",
            "لم يعد مسار العودة من المصادر يطابق الاختبار الحالي. افتح الاختبار للمتابعة.",
          )}
        </Notice>
        <ProductLink href={base + "/quiz"} locale={locale}>
          {t("Open Quiz", "فتح الاختبار")}
        </ProductLink>
      </section>
    );
  if (!attempt)
    return (
      <section className={styles.panel}>
        <p>
          {t(
            "No attempt exists in this unit. Reload and reset clear sample attempts.",
            "لا محاولة في هذه الوحدة. إعادة التحميل والضبط تمسح المحاولات التجريبية.",
          )
            .replace(
              "this unit",
              `the current ${scope.unitLabelSingularEn.toLowerCase()}`,
            )
            .replace("في هذه الوحدة", `في ${scope.unitLabelSingularAr}`)}
        </p>
        <ProductLink href={base + "/quiz"} locale={locale}>
          {t("Create a sample attempt", "بدء الاختبار")}
        </ProductLink>
      </section>
    );
  const expired =
    attempt.abandoned ||
    (!attempt.submitted && quizAttemptExpired(attempt, now));
  const readOnly = attempt.submitted || expired;
  if (screen === "attempt" && readOnly)
    return (
      <p role="status">{t("Opening your review…", "جارٍ فتح مراجعتك…")}</p>
    );
  if (screen === "quiz-review" && !readOnly)
    return (
      <section className={styles.panel}>
        <p>
          {t(
            "Submit the sample answers before viewing a score.",
            "سلم الإجابات التجريبية قبل عرض النتيجة.",
          )}
        </p>
        <ProductLink href={base + "/quiz/sample-attempt"} locale={locale}>
          {t("Return to attempt", "العودة للمحاولة")}
        </ProductLink>
      </section>
    );
  return (
    <QuizAttempt
      quiz={quiz}
      attempt={attempt}
      scope={scope}
      locale={locale}
      base={base}
      screen={screen}
      now={now}
      expired={expired}
      readOnly={readOnly}
      passageQuestion={passageQuestion}
      onPassageQuestion={setPassageQuestion}
    />
  );
}
