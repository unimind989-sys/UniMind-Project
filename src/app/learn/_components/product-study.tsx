"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import {
  answerExamples,
  defaultScope,
  scopeChoices,
  sampleScopeAvailable,
  text,
  type Locale,
  type ResponseKind,
} from "@/app/_components/synthetic-fixtures";
import styles from "@/app/_components/product.module.css";
import { ProductChat } from "./product-chat";
import { ProductStudio } from "./product-studio";
import { useProductServices } from "@/app/_components/product-services";
import {
  Button,
  Notice,
  ProductLink,
  Row,
  Select,
} from "@/app/_components/product-ui";

export type ProductStudyProps = {
  screen: string;
  scope: WorkspaceScope;
  locale: Locale;
  base: string;
  scenario: string;
};
type Props = ProductStudyProps;
const kindNames: Record<ResponseKind, readonly [string, string]> = {
  supported: ["Supported", "مدعوم"],
  partial: ["Partial support", "دعم جزئي"],
  unavailable: ["Unavailable information", "معلومة غير متاحة"],
  conflict: ["Source conflict", "تعارض المصادر"],
  hint: ["Professor hint", "تلميح محاضر"],
  educational: ["Educational case", "حالة تعليمية"],
  patient: ["Real-patient boundary", "حدود المريض الحقيقي"],
};

export function ProductStudy(props: Props) {
  const { base, screen } = props;
  const { update } = useProductServices();
  useEffect(() => {
    if (["chat", "studio"].includes(screen)) {
      update((current) =>
        current.lastStudyPath === `${base}/${screen}`
          ? current
          : { ...current, lastStudyPath: `${base}/${screen}` },
      );
    }
  }, [base, screen, update]);
  return (
    <>
      {screen === "overview" ? (
        <Overview {...props} />
      ) : screen === "chat" ? (
        <ProductChat {...props} />
      ) : screen === "studio" ? (
        <ProductStudio {...props} />
      ) : ["quiz", "attempt", "quiz-review"].includes(screen) ? (
        <Quiz {...props} />
      ) : screen === "sources" || screen === "evidence" ? (
        <Evidence {...props} />
      ) : (
        <Report {...props} />
      )}
    </>
  );
}

function Overview(props: Props) {
  const t = (en: string, ar: string) => (props.locale === "ar" ? ar : en);
  return (
    <section>
      <header className={styles.materialsHeading}>
        <div>
          <h2>{t("Materials", "المواد الدراسية")}</h2>
          <p>
            {new Intl.DateTimeFormat(
              props.locale === "ar" ? "ar-EG" : "en-GB",
              {
                dateStyle: "medium",
                timeZone: "UTC",
              },
            ).format(new Date(props.scope.materialUpdatedAt))}{" "}
            · <bdi>{props.scope.curriculumEdition}</bdi>
          </p>
        </div>
        <ProductLink href={props.base + "/sources"} locale={props.locale}>
          {t("View material details", "عرض تفاصيل المواد")}
        </ProductLink>
      </header>
      <Evidence {...props} screen="sources" embedded />
    </section>
  );
}

function getSources(scope: WorkspaceScope, locale: Locale) {
  return Array.from({ length: scope.sourceCount }, (_, index) => ({
    title:
      index === 0
        ? locale === "ar"
          ? "ملزمة الترتيب التجريبية"
          : "Synthetic sequence handout"
        : index === 1
          ? locale === "ar"
            ? "تسجيل المقارنة التجريبي"
            : "Synthetic comparison recording"
          : (locale === "ar" ? "ملحق تجريبي " : "Synthetic appendix ") +
            new Intl.NumberFormat(locale).format(index - 1),
    format: index === 1 ? "AUDIO" : "PDF",
    locator:
      index === 0
        ? locale === "ar"
          ? "صفحة تجريبية ٣"
          : "Sample page 3"
        : index === 1
          ? locale === "ar"
            ? "توقيت تجريبي ٠٢:١٠"
            : "Sample timestamp 02:10"
          : locale === "ar"
            ? "لا يوجد موضع موثوق في المثال"
            : "No reliable locator in fixture",
    segment: `sample:${scope.unitId}:${index + 1}`,
  }));
}

function Evidence({
  scope,
  locale,
  base,
  screen,
  embedded = false,
}: Props & { embedded?: boolean }) {
  const { state } = useProductServices();
  const query = useSearchParams();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const session = state.sessions.find(
    (entry) =>
      entry.scope === scope.unitId &&
      entry.id ===
        (query.has("session")
          ? Number(query.get("session"))
          : state.activeSessions[scope.unitId]),
  );
  const exchange = query.has("exchange")
    ? Number(query.get("exchange"))
    : session?.answers.length;
  const answer =
    exchange !== undefined && Number.isInteger(exchange) && exchange > 0
      ? session?.answers[exchange - 1]
      : undefined;
  const sources = getSources(scope, locale);
  const supporting =
    answer?.kind === "conflict"
      ? sources.slice(0, 2)
      : answer?.kind === "hint"
        ? sources.slice(1, 2)
        : sources.slice(0, 1);
  return (
    <>
      {!embedded ? (
        <ProductLink
          href={
            query.get("from") === "studio"
              ? base + "/studio"
              : `${base}/chat${session ? `?session=${session.id}#exchange-${exchange}` : ""}`
          }
          locale={locale}
        >
          {query.get("from") === "studio"
            ? t("Return to Studio", "العودة للاستوديو")
            : t("Return to Chat", "العودة للمحادثة")}
        </ProductLink>
      ) : null}
      <p className={embedded ? styles.materialsCaption : undefined}>
        {t(
          "Sample materials · Excerpts and page references below are illustrative.",
          "مواد تجريبية · النصوص ومواضع الصفحات أدناه للتوضيح.",
        )}
      </p>
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
        <div className={styles.materialLibrary}>
          {sources.map((source) => (
            <Row key={source.segment} title={source.title}>
              <p>
                <bdi>{source.format}</bdi> · {source.locator}
              </p>
              <span className={styles.pill}>
                {scope.unitId === defaultScope.unitId &&
                !state.availability.sourceActive &&
                source.segment.endsWith(":1")
                  ? t(
                      "INACTIVE sample · excluded from new requests",
                      "مثال غير نشط · مستبعد من الطلبات الجديدة",
                    )
                  : t("Ready · Sample material", "جاهز · مادة تجريبية")}
              </span>
              {sources.indexOf(source) < 2 &&
              !(
                scope.unitId === defaultScope.unitId &&
                !state.availability.sourceActive &&
                source.segment.endsWith(":1")
              ) ? (
                <details>
                  <summary>
                    {t("View supporting excerpt", "عرض النص الداعم")}
                  </summary>
                  <p>
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
                  <p>
                    {t("Processed sample excerpt", "نص تجريبي معالج")} ·{" "}
                    {source.locator}
                  </p>
                </details>
              ) : null}
            </Row>
          ))}
        </div>
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

function Report({ scope, locale, base }: Props) {
  const { state, update } = useProductServices();
  const query = useSearchParams();
  const [reason, setReason] = useState("poor-answer");
  const [confirmed, setConfirmed] = useState(false);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const session = state.sessions.find(
    (entry) =>
      entry.scope === scope.unitId &&
      entry.id ===
        (query.has("session")
          ? Number(query.get("session"))
          : state.activeSessions[scope.unitId]),
  );
  const exchange = query.has("exchange")
    ? Number(query.get("exchange"))
    : session?.answers.length;
  const answer =
    exchange !== undefined && Number.isInteger(exchange) && exchange > 0
      ? session?.answers[exchange - 1]
      : undefined;
  const reportKey = `${scope.unitId}:${session?.id}:${exchange}`;
  if (!answer)
    return (
      <section className={styles.panel}>
        <p>
          {t(
            "There is no exchange to report in this scope. Start a sample session and reveal a fixed answer first.",
            "لا توجد محادثة للإبلاغ عنها في هذا النطاق. ابدأ جلسة تجريبية وأظهر إجابة ثابتة أولًا.",
          )}
        </p>
        <ProductLink href={base + "/chat"} locale={locale}>
          {t("Open Chat", "فتح المحادثة")}
        </ProductLink>
      </section>
    );
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
      <Button
        primary
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
      {state.reports[reportKey] ? (
        <Notice>
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

function Quiz({ scope, locale, base, screen }: Props) {
  const { state, update } = useProductServices();
  const router = useRouter();
  const [mode, setMode] = useState("untimed");
  const [now, setNow] = useState(() => Date.now());
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const attempt = state.attempts[scope.unitId];
  const handoutAvailable =
    scope.unitId !== defaultScope.unitId || state.availability.sourceActive;
  useEffect(() => {
    if (!attempt?.expiresAt || attempt.submitted || attempt.abandoned) return;
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= attempt.expiresAt!)
        update((current) => ({
          ...current,
          attempts: {
            ...current.attempts,
            [scope.unitId]: { ...attempt, abandoned: true },
          },
        }));
    }, 500);
    return () => clearInterval(timer);
  }, [attempt, scope.unitId, update]);
  const questions = [
    {
      prompt: t(
        "Which step is first in the sample handout?",
        "ما الخطوة الأولى في الملزمة التجريبية؟",
      ),
      choices: [
        t("Identify labels", "تحديد الأسماء"),
        t("Compare diagrams", "مقارنة الرسوم"),
      ],
      correct: 0,
      explanation: t(
        "The sample handout says identification precedes comparison (sample page 3).",
        "الملزمة التجريبية تضع التحديد قبل المقارنة (صفحة تجريبية ٣).",
      ),
    },
    {
      prompt: t(
        "What timing do the sample sources specify?",
        "ما التوقيت المحدد في المصادر التجريبية؟",
      ),
      choices: [
        t("An exact duration", "مدة دقيقة"),
        t("No duration is supplied", "لا توجد مدة محددة"),
      ],
      correct: 1,
      explanation: t(
        "Timing is unavailable in these sources. An exact duration would be unsupported.",
        "التوقيت غير متاح في هذه المصادر. تحديد مدة دقيقة سيكون غير مدعوم.",
      ),
    },
  ];
  function start() {
    update((current) => ({
      ...current,
      attempts: {
        ...current.attempts,
        [scope.unitId]: {
          answers: [-1, -1],
          submitted: false,
          ...(mode === "timed" ? { expiresAt: Date.now() + 60_000 } : {}),
        },
      },
    }));
    router.push(`${base}/quiz/sample-attempt?lang=${locale}` as Route);
  }
  const score = attempt
    ? questions.filter(
        (question, index) => attempt.answers[index] === question.correct,
      ).length
    : 0;
  if (screen === "quiz")
    return (
      <section className={styles.panel}>
        <h2>{t("Fixed MCQ quiz", "اختبار اختيار ثابت")}</h2>
        <p>
          {t(
            "Two fixture questions from this unit's sample evidence. Scores are illustrative and not saved or server-graded.",
            "سؤالان ثابتان من أدلة الوحدة التجريبية. النتيجة توضيحية ولا تحفظ أو تصحح على الخادم.",
          )}
        </p>
        <div className={styles.actions}>
          <Select
            id="quiz-mode"
            label={t("Mode", "الوضع")}
            value={mode}
            options={[
              ["untimed", t("Untimed", "دون توقيت")],
              [
                "timed",
                t("Timed · illustrative 60 seconds", "مؤقت · ٦٠ ثانية توضيحية"),
              ],
            ]}
            onChange={setMode}
          />
          <Button primary onClick={start} disabled={!handoutAvailable}>
            {attempt
              ? t("Start new attempt", "بدء محاولة جديدة")
              : t("Start quiz", "بدء الاختبار")}
          </Button>
          {attempt ? (
            <ProductLink href={base + "/quiz/sample-attempt"} locale={locale}>
              {t("Open sample attempt", "فتح المحاولة التجريبية")}
            </ProductLink>
          ) : null}
          {attempt?.submitted ? (
            <ProductLink
              href={base + "/quiz/sample-attempt/review"}
              locale={locale}
            >
              {t("Review score", "مراجعة النتيجة")}
            </ProductLink>
          ) : null}
        </div>
        {!handoutAvailable ? (
          <Notice error>
            {t(
              "This quiz fixture needs the inactive handout. New attempts are unavailable until its source is active.",
              "مثال الاختبار يحتاج الملزمة غير النشطة. المحاولات الجديدة غير متاحة حتى تفعيل المصدر.",
            )}
          </Notice>
        ) : null}
        {attempt ? (
          <Notice>
            {t(
              "Sample attempt ready in this tab.",
              "المحاولة التجريبية جاهزة داخل التبويب.",
            )}
          </Notice>
        ) : null}
      </section>
    );
  if (!attempt)
    return (
      <section className={styles.panel}>
        <p>
          {t(
            "No attempt exists in this unit. Reload and reset clear sample attempts.",
            "لا محاولة في هذه الوحدة. إعادة التحميل والضبط تمسح المحاولات التجريبية.",
          )}
        </p>
        <ProductLink href={base + "/quiz"} locale={locale}>
          {t("Create a sample attempt", "بدء الاختبار")}
        </ProductLink>
      </section>
    );
  if (attempt.abandoned)
    return (
      <section className={styles.panel}>
        <Notice error>
          {t(
            "This timed attempt has expired. No score was recorded. The 60-second clock is an illustrative demo fixture.",
            "انتهى وقت المحاولة. لم تسجل نتيجة. مؤقت ٦٠ ثانية مثال توضيحي فقط.",
          )}
        </Notice>
        <ProductLink href={base + "/quiz"} locale={locale}>
          {t("Start new attempt", "بدء محاولة جديدة")}
        </ProductLink>
      </section>
    );
  if (screen === "quiz-review" && !attempt.submitted)
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
    <>
      {attempt.expiresAt && !attempt.submitted ? (
        <p role="timer">
          {t("Time remaining", "الوقت المتبقي")}:{" "}
          {new Intl.NumberFormat(locale).format(
            Math.max(0, Math.ceil((attempt.expiresAt - now) / 1000)),
          )}
        </p>
      ) : null}
      {attempt.submitted ? (
        <Notice>
          {t("Simulated score", "نتيجة محاكاة")}:{" "}
          {new Intl.NumberFormat(locale).format(score)} /{" "}
          {new Intl.NumberFormat(locale).format(questions.length)} ·{" "}
          {t("illustrative only", "توضيحية فقط")}
        </Notice>
      ) : null}
      {questions.map((question, index) => (
        <fieldset
          key={index}
          className={styles.question}
          disabled={attempt.submitted}
        >
          <legend>{question.prompt}</legend>
          {question.choices.map((choice, answerIndex) => (
            <label className={styles.check} key={choice}>
              <input
                type="radio"
                name={`sample-question-${index}`}
                checked={attempt.answers[index] === answerIndex}
                onChange={() =>
                  update((current) => ({
                    ...current,
                    attempts: {
                      ...current.attempts,
                      [scope.unitId]: {
                        ...attempt,
                        answers: attempt.answers.map((value, position) =>
                          position === index ? answerIndex : value,
                        ),
                      },
                    },
                  }))
                }
              />
              {choice}
            </label>
          ))}
          {attempt.submitted ? (
            <p>
              {question.explanation} {t("Selected answer", "الإجابة المختارة")}:{" "}
              {question.choices[attempt.answers[index]!]}
            </p>
          ) : null}
        </fieldset>
      ))}
      <div className={styles.actions}>
        {!attempt.submitted ? (
          <Button
            primary
            disabled={
              !handoutAvailable || attempt.answers.some((answer) => answer < 0)
            }
            onClick={() => {
              update((current) => ({
                ...current,
                attempts: {
                  ...current.attempts,
                  [scope.unitId]: { ...attempt, submitted: true },
                },
              }));
              router.push(
                `${base}/quiz/sample-attempt/review?lang=${locale}` as Route,
              );
            }}
          >
            {t("Submit answers", "تسليم الإجابات")}
          </Button>
        ) : (
          <ProductLink
            href={base + "/quiz/sample-attempt/review"}
            locale={locale}
          >
            {t("Open grounded review", "فتح المراجعة بالمصادر")}
          </ProductLink>
        )}
        <ProductLink href={base + "/quiz"} locale={locale}>
          {t("Back to quiz", "العودة للاختبار")}
        </ProductLink>
        <ProductLink href={base + "/sources"} locale={locale}>
          {t("Inspect sources", "فحص المصادر")}
        </ProductLink>
      </div>
    </>
  );
}

export function UnitSwitch({
  scope,
  locale,
  base,
}: Pick<ProductStudyProps, "scope" | "locale" | "base">) {
  const router = useRouter();
  const { state } = useProductServices();
  return (
    <Select
      id="unit-scope"
      label={locale === "ar" ? "تغيير الوحدة" : "Switch unit"}
      value={base}
      options={[
        [base, locale === "ar" ? scope.unitTitleAr : scope.unitTitleEn],
        ...scopeChoices
          .filter(
            (choice) =>
              choice.path !== base &&
              sampleScopeAvailable(
                state,
                choice.scope.cohortId,
                choice.scope.unitId,
              ),
          )
          .map(
            (choice) =>
              [
                choice.path,
                `${locale === "ar" ? choice.scope.programNameAr : choice.scope.programNameEn} · ${locale === "ar" ? choice.scope.unitTitleAr : choice.scope.unitTitleEn}`,
              ] as const,
          ),
      ]}
      onChange={(value) => router.push(`${value}?lang=${locale}` as Route)}
    />
  );
}
