"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProductText } from "@/app/_components/product-copy";
import { useOptionalProductServices } from "@/app/_components/product-services";
import { Notice } from "@/app/_components/notice";
import { Button, ProductLink, Select } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import {
  answerExamples,
  text,
} from "@/lib/demo/synthetic-fixtures.application";
import { resolveChatExchangeSelection } from "@/lib/study/study-origin.application";
import type { ProductStudyProps } from "./study-props";
import { selectedExchange } from "./study-sources";
import { useLiveStudy } from "./live-study";

/**
 * A report about one selected Chat exchange. Synthetic reports stay in this
 * tab; real routes have no exchanges to report until Chat answers exist.
 */
export function Report({ scope, locale, base }: ProductStudyProps) {
  const live = useLiveStudy();
  const services = useOptionalProductServices();
  const query = useSearchParams();
  const [reason, setReason] = useState("poor-answer");
  const [confirmed, setConfirmed] = useState(false);
  const t = useProductText(locale);
  const selection = resolveChatExchangeSelection(query);
  const { session, exchange, answer } = services
    ? selectedExchange(services.state.sessions, scope.unitId, selection)
    : { session: undefined, exchange: undefined, answer: undefined };
  const reportKey = `${scope.unitId}:${session?.id}:${exchange}`;
  if (!answer || !services)
    return (
      <section className={styles.panel}>
        <p>
          {live
            ? t(
                "There is no exchange to report in this scope. Chat answers are not available yet.",
                "لا توجد محادثة للإبلاغ عنها في هذا النطاق. إجابات المحادثة غير متاحة بعد.",
              )
            : t(
                "There is no exchange to report in this scope. Start a sample session and reveal a fixed answer first.",
                "لا توجد محادثة للإبلاغ عنها في هذا النطاق. ابدأ جلسة تجريبية وأظهر إجابة ثابتة أولًا.",
              )}
        </p>
        <div className={styles.actions}>
          <ProductLink href={base + "/chat"} locale={locale}>
            {t("Open Chat", "فتح المحادثة")}
          </ProductLink>
        </div>
      </section>
    );
  const { state, update } = services;
  return (
    <section className={styles.panel}>
      <h2>{t("Selected sample exchange", "المحادثة التجريبية المختارة")}</h2>
      <p>{text(answerExamples[answer.kind], locale)}</p>
      <Select
        id="report-reason"
        label={t("Reason", "السبب")}
        value={reason}
        onChange={setReason}
        options={[
          ["poor-answer", t("Poor answer", "إجابة ضعيفة")],
          ["source-problem", t("Source problem", "مشكلة مصدر")],
          ["conflict", t("Conflict", "تعارض")],
        ]}
      />
      <p>
        {t(
          "This example submits only this exchange's sample reason to tab memory. In the real product, a qualifying report can permit audited founder review of that exchange even in private mode. Report details, disclosure and retention are still being confirmed.",
          "المثال يضيف سببًا تجريبيًا لهذه المحادثة فقط إلى ذاكرة التبويب. في المنتج الحقيقي، البلاغ المؤهل قد يسمح بمراجعة المؤسسين المدققة لهذه المحادثة حتى في الوضع الخاص. تفاصيل البلاغ والإفصاح والاحتفاظ ما زالت قيد التأكيد.",
        )}
      </p>
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        {t(
          "Confirm report for this exchange",
          "مراجعة البلاغ المحاكى للمحادثة المختارة",
        )}
      </label>
      <div className={styles.actions}>
        <Button
          variant="primary"
          disabled={!confirmed || Boolean(state.reports[reportKey])}
          onClick={() =>
            update((current) => ({
              ...current,
              reports: { ...current.reports, [reportKey]: reason },
            }))
          }
        >
          {t("Submit report", "إرسال البلاغ")}
        </Button>
      </div>
      {state.reports[reportKey] ? (
        <Notice tone="success" live locale={locale}>
          {t(
            "Simulated report received in this tab. Nothing was sent, saved or shared.",
            "استلم البلاغ المحاكى داخل التبويب. لم يرسل أو يحفظ أو يشارك شيء.",
          )}
        </Notice>
      ) : null}
      <div className={styles.actions}>
        <ProductLink
          href={`${base}/chat${session ? `?session=${session.id}#exchange-${exchange}` : ""}`}
          locale={locale}
        >
          {t("Back to Chat", "العودة للمحادثة")}
        </ProductLink>
      </div>
    </section>
  );
}
