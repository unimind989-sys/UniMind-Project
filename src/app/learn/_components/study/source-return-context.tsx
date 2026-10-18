"use client";
import { useProductText } from "@/app/_components/product-copy";
import { Notice } from "@/app/_components/notice";
import { ProductLink } from "@/app/_components/product-ui";
import { useHostedSynthetic } from "@/app/_components/product-navigation";
import styles from "@/app/_components/product.module.css";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import type { QuizSourceSelection } from "@/lib/study/study-origin.application";

/**
 * Heading, purpose and the way back for a source view opened from Chat,
 * Studio or a quiz attempt.
 */
export function SourceReturnContext({
  screen,
  locale,
  base,
  from,
  quizSource,
  chatHref,
}: {
  screen: string;
  locale: Locale;
  base: string;
  from: string | null;
  quizSource: QuizSourceSelection | null;
  chatHref: string;
}) {
  const t = useProductText(locale);
  const hosted = useHostedSynthetic();
  return (
    <div className={styles.sourceContext}>
      <h2>
        {screen === "evidence"
          ? t("Supporting passages", "النصوص الداعمة")
          : t("Material library", "مكتبة المصادر")}
      </h2>
      <p>
        {screen === "evidence"
          ? t(
              "Evidence for the selected Chat reply.",
              "أدلة إجابة المحادثة المختارة.",
            )
          : t(
              "The complete material collection. Reading actions show only the supplied processed passages or transcript excerpts.",
              "مجموعة المصادر كاملة. تعرض إجراءات القراءة النصوص المعالجة أو مقتطفات التفريغ المتاحة فقط.",
            )}
      </p>
      <ProductLink
        href={
          quizSource
            ? quizSource.kind === "unavailable"
              ? base + "/quiz"
              : `${base}/quiz/sample-attempt${quizSource.kind === "review" ? "/review" : ""}?attempt=${encodeURIComponent(quizSource.inspectionKey)}`
            : from === "studio"
              ? base + "/studio"
              : chatHref
        }
        locale={locale}
      >
        {quizSource
          ? quizSource.kind === "unavailable"
            ? t("Open Quiz", "فتح الاختبار")
            : quizSource.kind === "review"
              ? t("Return to quiz review", "العودة إلى مراجعة الاختبار")
              : t("Return to quiz attempt", "العودة إلى محاولة الاختبار")
          : from === "studio"
            ? t("Return to Studio", "العودة للاستوديو")
            : t("Return to Chat", "العودة للمحادثة")}
      </ProductLink>
      {quizSource?.kind === "unavailable" ? (
        <Notice tone="error" live locale={locale}>
          {t(
            "This source return no longer matches the current quiz. Open Quiz to continue.",
            "لم يعد مسار العودة من المصادر يطابق الاختبار الحالي. افتح الاختبار للمتابعة.",
          )}
        </Notice>
      ) : null}
      {hosted ? null : (
        <p>
          {t(
            "These are sample materials. The excerpts and page references below are illustrative.",
            "هذه مواد تجريبية. النصوص ومواضع الصفحات أدناه للتوضيح.",
          )}
        </p>
      )}
    </div>
  );
}
