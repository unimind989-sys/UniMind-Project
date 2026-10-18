"use client";
import type { ReactNode } from "react";
import { useProductText } from "@/app/_components/product-copy";
import { FrontendIcon } from "@/app/_components/frontend-system";
import { Button, ProductLink } from "@/app/_components/product-ui";
import productStyles from "@/app/_components/product.module.css";
import {
  answerExamples,
  promptExamples,
  text,
  type SampleAnswer,
} from "@/lib/demo/synthetic-fixtures.application";
import type { ProductStudyProps } from "./study-props";
import { kindNames } from "./study-sources";
import styles from "../product-chat.module.css";

/**
 * One question and its sample reply. Evidence has one route per answer: the
 * citation chip opens the source sheet, which links to the evidence details.
 * Report is a quiet action, the sharing mode shows only when it differs from
 * the current setting, and covered or clarifying questions fill Message.
 */
export function ChatExchange({
  answer,
  exchange,
  sessionNumber,
  scope,
  locale,
  base,
  handoutAvailable,
  currentSharing,
  tip,
  onInspect,
  onUseQuestion,
}: Pick<ProductStudyProps, "scope" | "locale" | "base"> & {
  answer: SampleAnswer;
  exchange: number;
  sessionNumber: number;
  handoutAvailable: boolean;
  currentSharing: SampleAnswer["sharing"] | undefined;
  /** The first-visit citation tip, shown under this answer's citation. */
  tip?: ReactNode;
  onInspect: () => void;
  /** Puts a question in Message; absent where Chat cannot answer. */
  onUseQuestion?: ((question: string) => void) | undefined;
}) {
  const t = useProductText(locale);
  const covered = [
    ...(handoutAvailable ? [text(promptExamples.supported, locale)] : []),
    text(promptExamples.hint, locale),
  ];
  const clarification = t(
    `The handout places identification before comparison, but the recording places comparison first. Which sequence should I follow for this ${scope.unitLabelSingularEn.toLowerCase()}, and is there an approved source resolving the difference?`,
    `الملزمة تضع التحديد قبل المقارنة، لكن التسجيل يضع المقارنة أولًا. أي ترتيب أتبع في ${scope.unitLabelSingularAr}، وهل يوجد مصدر معتمد يحسم الاختلاف؟`,
  );
  const cited = !["unavailable", "patient"].includes(answer.kind);
  return (
    <article className={styles.exchange} id={`exchange-${exchange}`}>
      <div
        className={styles.questionBubble}
        dir={answer.language === "en" ? "ltr" : "rtl"}
        lang={answer.language === "en" ? "en" : "ar"}
      >
        <p>
          {answer.promptKind === "unmatched"
            ? t(
                "Question outside the supplied sample pack",
                "سؤال خارج الأمثلة المرفقة",
              )
            : text(
                promptExamples[answer.promptKind ?? answer.kind],
                answer.language === "en" ? "en" : "ar",
              )}
        </p>
        <small>{t("Sample question", "سؤال تجريبي")}</small>
      </div>
      <div className={styles.reply}>
        <div className={styles.replyHeading}>
          <strong translate="no">UniMind</strong>
          <span>{text(kindNames[answer.kind], locale)}</span>
        </div>
        <p
          lang={answer.language === "en" ? "en" : "ar"}
          dir={answer.language === "en" ? "ltr" : "rtl"}
        >
          {text(
            answerExamples[answer.kind],
            answer.language === "en" ? "en" : "ar",
          )}
          {answer.language === "mixed" ? (
            <>
              {" "}
              <bdi lang="en">Lecture 6 handout, page 14</bdi>
            </>
          ) : null}
        </p>
        {answer.kind === "unavailable" ? (
          <div>
            <p>
              {handoutAvailable
                ? answer.promptKind &&
                  !["unavailable", "unmatched"].includes(answer.promptKind)
                  ? t(
                      "The handout is currently available. This saved reply is unchanged; inspect materials or send a covered question for a new answer.",
                      "الملزمة متاحة حاليًا. هذه الإجابة المحفوظة كما هي؛ افحص المصادر أو أرسل سؤالًا تغطيه للحصول على إجابة جديدة.",
                    )
                  : t(
                      "The current sources do not support an answer to this question. You can inspect available materials or try a question they cover.",
                      "المصادر الحالية لا تدعم إجابة لهذا السؤال. يمكنك فحص المصادر المتاحة أو تجربة سؤال تغطيه.",
                    )
                : t(
                    "The handout is currently inactive, so new answers cannot use it. The recording remains available; you can inspect materials or ask about its emphasis.",
                    "الملزمة غير نشطة حاليًا، فلا تستخدمها الإجابات الجديدة. التسجيل ما زال متاحًا؛ يمكنك فحص المصادر أو السؤال عن النقطة التي يؤكدها.",
                  )}
            </p>
            <details className={styles.secondaryOptions}>
              <summary>
                {t(
                  "Questions covered by these materials",
                  "أسئلة تغطيها هذه المصادر",
                )}
                <FrontendIcon name="chevron" size={16} />
              </summary>
              <div className={styles.followUps}>
                {covered.map((question) => (
                  <button
                    key={question}
                    type="button"
                    disabled={!onUseQuestion}
                    onClick={() => onUseQuestion?.(question)}
                  >
                    <bdi>{question}</bdi>
                  </button>
                ))}
              </div>
              <p>
                {t(
                  "Choosing a question puts it in Message; nothing is sent until you press Send.",
                  "اختيار سؤال يضعه في خانة السؤال؛ لا يُرسل شيء حتى تضغط إرسال.",
                )}
              </p>
            </details>
            <ProductLink href={base} locale={locale}>
              {t("View available materials", "عرض مصادر المذاكرة المتاحة")}
            </ProductLink>
          </div>
        ) : null}
        {answer.kind === "conflict" ? (
          <details className={styles.secondaryOptions}>
            <summary>
              {t(
                "Question to ask about this conflict",
                "سؤال للاستفسار عن هذا التعارض",
              )}
              <FrontendIcon name="chevron" size={16} />
            </summary>
            <p>
              {t(
                "Inspect both excerpts, then use this question to ask for clarification. Nothing is sent until you press Send.",
                "افحص النصين، ثم استخدم هذا السؤال لطلب التوضيح. لا يُرسل شيء حتى تضغط إرسال.",
              )}
            </p>
            <div className={productStyles.field}>
              <label
                htmlFor={`conflict-clarification-${sessionNumber}-${exchange}`}
              >
                {t("Clarification question", "سؤال التوضيح")}
              </label>
              <textarea
                id={`conflict-clarification-${sessionNumber}-${exchange}`}
                readOnly
                rows={4}
                lang={locale}
                dir={locale === "ar" ? "rtl" : "ltr"}
                value={clarification}
              />
            </div>
            {onUseQuestion ? (
              <Button onClick={() => onUseQuestion(clarification)}>
                {t("Use this question", "استخدم هذا السؤال")}
              </Button>
            ) : null}
          </details>
        ) : null}
        <div className={styles.replyActions}>
          {cited ? (
            <button
              type="button"
              className={styles.citation}
              onClick={onInspect}
            >
              <FrontendIcon name="sources" />
              {answer.kind === "hint"
                ? t("Practical 3, 18:42", "العملي 3، ١٨:٤٢")
                : answer.kind === "conflict"
                  ? t("Two source excerpts", "نصان من مصدرين")
                  : t("Lecture 6, p. 14", "المحاضرة 6، ص ١٤")}
            </button>
          ) : null}
          {currentSharing && answer.sharing !== currentSharing ? (
            <span>
              {answer.sharing === "private"
                ? t("Private", "خاص")
                : t("Shared", "مشارك")}
            </span>
          ) : null}
          <ProductLink
            className={styles.reportLink}
            variant="quiet"
            href={`${base}/report?exchange=${exchange}&session=${sessionNumber}`}
            locale={locale}
          >
            {t("Report example", "الإبلاغ عن المثال")}
          </ProductLink>
        </div>
        {tip}
      </div>
    </article>
  );
}
