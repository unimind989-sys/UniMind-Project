"use client";
import { useSearchParams } from "next/navigation";
import { useProductText } from "@/app/_components/product-copy";
import { useOptionalProductServices } from "@/app/_components/product-services";
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
import { useLiveStudy } from "./live-study";

/**
 * The material library, or the supporting passages of one Chat reply, with
 * the way back to the tool that opened it. `embedded` renders the library
 * inside the unit overview without its own heading or return action. Real
 * routes show the approved material count until an authorized material list
 * exists, and no evidence until Chat answers exist.
 */
export function Evidence({
  scope,
  locale,
  base,
  screen,
  embedded = false,
  quizTime,
}: ProductStudyProps & { embedded?: boolean; quizTime?: number }) {
  const live = useLiveStudy();
  const state = useOptionalProductServices()?.state;
  const query = useSearchParams();
  const t = useProductText(locale);
  const quizSource =
    embedded || !state
      ? null
      : resolveQuizSourceSelection(
          query,
          state.attempts[scope.unitId],
          quizTime,
        );
  const selection =
    embedded || quizSource ? null : resolveChatExchangeSelection(query);
  const { session, exchange, answer } = state
    ? selectedExchange(state.sessions, scope.unitId, selection)
    : { session: undefined, exchange: undefined, answer: undefined };
  const sources = state
    ? getSources(scope, locale, state.studyDensityUnitId === scope.unitId)
    : [];
  const unitName = t(
    scope.unitLabelSingularEn.toLowerCase(),
    scope.unitLabelSingularAr,
  );
  const count = new Intl.NumberFormat(locale).format(scope.sourceCount);
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
          {live
            ? t(
                `${count} approved materials in this ${unitName}.`,
                `${count} مصادر معتمدة في ${unitName}.`,
              )
            : t(
                "These are sample materials. The excerpts and page references below are illustrative.",
                "هذه مواد تجريبية. النصوص ومواضع الصفحات أدناه للتوضيح.",
              )}
        </p>
      )}
      {screen === "evidence" ? (
        !answer ? (
          <Notice>
            {live
              ? t(
                  "Evidence opens from a Chat answer. Chat answers are not available yet.",
                  "تُفتح الأدلة من إجابة في المحادثة. إجابات المحادثة غير متاحة بعد.",
                )
              : t(
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
                          "Count the roots first. In some people the plexus is prefixed and takes a branch from C4, so check before you name the trunks.",
                          "عُدّ الجذور أولًا. في بعض الناس تكون الضفيرة متقدمة وتأخذ فرعًا من C4، فتأكد قبل أن تسمي الجذوع.",
                        )
                      : t(
                          "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder. The plexus is formed by the ventral rami of C5 to T1.",
                          "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
                        )}
                  </p>
                </Row>
              ))
            )}
          </section>
        )
      ) : live ? (
        <Notice>
          {embedded
            ? t(
                "The material list is not available yet.",
                "قائمة المصادر غير متاحة بعد.",
              )
            : t(
                `The material list is not available yet. ${count} approved materials are ready in this ${unitName}.`,
                `قائمة المصادر غير متاحة بعد. ${count} مصادر معتمدة جاهزة في ${unitName}.`,
              )}
        </Notice>
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
