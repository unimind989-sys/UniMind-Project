"use client";
import { useSearchParams } from "next/navigation";
import { useProductText } from "@/app/_components/product-copy";
import { useProductServices } from "@/app/_components/product-services";
import { Notice, ProductLink, Row } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import {
  answerExamples,
  text,
} from "@/lib/demo/synthetic-fixtures.application";
import {
  resolveChatExchangeSelection,
  resolveQuizSourceSelection,
} from "@/lib/study/study-origin.application";
import { MaterialLibrary } from "./material-library";
import { SourceReturnContext } from "./source-return-context";
import type { ProductStudyProps } from "./study-props";
import { getSources, kindNames, selectedExchange } from "./study-sources";

/**
 * The material library, or the supporting passages of one Chat reply, with
 * the way back to the tool that opened it. `embedded` renders the library
 * inside the unit overview without its own heading or return action.
 */
export function Evidence({
  scope,
  locale,
  base,
  screen,
  embedded = false,
  quizTime,
}: ProductStudyProps & { embedded?: boolean; quizTime?: number }) {
  const { state } = useProductServices();
  const query = useSearchParams();
  const t = useProductText(locale);
  const quizSource = embedded
    ? null
    : resolveQuizSourceSelection(query, state.attempts[scope.unitId], quizTime);
  const selection =
    embedded || quizSource ? null : resolveChatExchangeSelection(query);
  const { session, exchange, answer } = selectedExchange(
    state.sessions,
    scope.unitId,
    selection,
  );
  const sources = getSources(
    scope,
    locale,
    state.studyDensityUnitId === scope.unitId,
  );
  const supporting =
    answer?.kind === "conflict"
      ? sources.slice(0, 2)
      : answer?.kind === "hint"
        ? sources.slice(1, 2)
        : sources.slice(0, 1);
  return (
    <>
      {!embedded ? (
        <SourceReturnContext
          screen={screen}
          locale={locale}
          base={base}
          from={query.get("from")}
          quizSource={quizSource}
          chatHref={`${base}/chat${session ? `?session=${session.id}#exchange-${exchange}` : ""}`}
        />
      ) : (
        <p className={styles.materialsCaption}>
          {t(
            "Sample materials · Excerpts and page references below are illustrative.",
            "مواد تجريبية · النصوص ومواضع الصفحات أدناه للتوضيح.",
          )}
        </p>
      )}
      {screen === "evidence" ? (
        !answer ? (
          <Notice>
            {t(
              "No sample answer selected. Send a fixed prompt in Chat, then inspect its evidence.",
              "لم تختر إجابة تجريبية. أرسل سؤالًا ثابتًا في المحادثة ثم افحص أدلته.",
            )}
          </Notice>
        ) : (
          <section className={styles.panel}>
            <h2>{text(kindNames[answer.kind], locale)}</h2>
            <p>{text(answerExamples[answer.kind], locale)}</p>
            {["unavailable", "patient"].includes(answer.kind) ? (
              <p>
                {t(
                  "No supporting factual evidence for this response. No citations are invented.",
                  "لا أدلة واقعية داعمة لهذه الإجابة. لا يتم اختراع استشهادات.",
                )}
              </p>
            ) : (
              supporting.map((source) => (
                <Row key={source.segment} title={source.title}>
                  <p>
                    <bdi>{source.format}</bdi> · {source.locator}
                  </p>
                  <p>
                    {t("Fixture excerpt", "نص المثال")}:{" "}
                    {source.format === "AUDIO"
                      ? t(
                          "Compare first, then identify the labels.",
                          "قارن أولًا ثم حدد الأسماء.",
                        )
                      : t(
                          "Identify the labels, then compare the diagrams.",
                          "حدد الأسماء ثم قارن الرسوم.",
                        )}
                  </p>
                </Row>
              ))
            )}
          </section>
        )
      ) : (
        <MaterialLibrary scope={scope} locale={locale} sources={sources} />
      )}
      <div className={styles.actions}>
        {answer ? (
          <ProductLink
            href={`${base}/report?exchange=${exchange}&session=${session?.id}`}
            locale={locale}
          >
            {t("Report selected exchange", "الإبلاغ عن المحادثة المختارة")}
          </ProductLink>
        ) : null}
      </div>
    </>
  );
}
