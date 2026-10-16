"use client";
import { useProductText } from "@/app/_components/product-copy";
import { useProductRouter } from "@/app/_components/product-navigation";
import { studyDensitySourceTitles } from "@/lib/demo/synthetic-study-density.application";

import { Fragment, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Route } from "next";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import {
  answerExamples,
  defaultScope,
  reviewCatalogRows,
  sampleScopeAvailable,
  text,
  type Locale,
  type ResponseKind,
} from "@/lib/demo/synthetic-fixtures.application";
import { ChoiceGroup } from "@/app/_components/choice-group";
import {
  defaultQuizConfiguration,
  fixtureQuizAttempt,
  fixtureQuizQuestions,
  quizAttemptExpired,
  expireQuizAttempt,
  answerQuizAttempt,
  submitQuizAttempt,
  quizAttemptReviewable,
  validQuizConfiguration,
  quizConfigurationErrors,
  type QuizConfiguration,
} from "@/lib/quiz/quiz-fixture.application";
import styles from "@/app/_components/product.module.css";
import studyStyles from "./product-study.module.css";
import {
  resolveChatExchangeSelection,
  resolveQuizSourceSelection,
  quizInspectionKeyMatches,
  buildStudyReturnPath,
} from "@/lib/study/study-origin.application";
import { ProductChat } from "./product-chat";
import { ProductStudio } from "./product-studio";
import { ProductSourceDialog } from "./product-source-dialog";
import {
  studyPassage,
  studyMaterialReading,
} from "@/lib/study/study-passages.application";
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
  const { base, screen, scope } = props;
  const { state, update } = useProductServices();
  const query = useSearchParams();
  const router = useProductRouter();
  const [now, setNow] = useState(() => Date.now());
  const attempt = state.attempts[scope.unitId];
  useEffect(() => {
    if (!attempt?.expiresAt || attempt.submitted || attempt.abandoned) return;
    const timer = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= attempt.expiresAt!)
        update((current) => {
          const latest = current.attempts[scope.unitId];
          if (!latest || latest.inspectionKey !== attempt.inspectionKey)
            return current;
          const expired = expireQuizAttempt(latest, currentTime);
          return expired === latest
            ? current
            : {
                ...current,
                attempts: { ...current.attempts, [scope.unitId]: expired },
              };
        });
    }, 500);
    return () => clearInterval(timer);
  }, [attempt, scope.unitId, update]);
  const selection = resolveChatExchangeSelection(query);
  const canonicalReview =
    screen === "attempt" &&
    attempt &&
    quizAttemptReviewable(attempt, now) &&
    (!query.has("attempt") ||
      quizInspectionKeyMatches(query, attempt.inspectionKey));
  const reviewPath = canonicalReview
    ? `${base}/quiz/sample-attempt/review?attempt=${encodeURIComponent(attempt.inspectionKey)}&lang=${props.locale}`
    : null;
  useEffect(() => {
    if (reviewPath) router.replace(reviewPath as Route);
  }, [reviewPath, router]);
  const returnPath = buildStudyReturnPath(
    base,
    canonicalReview ? "quiz-review" : screen,
    query,
    state.attempts[scope.unitId],
    now,
  );
  useEffect(() => {
    if (returnPath) {
      update((current) =>
        current.lastStudyPath === returnPath
          ? current
          : { ...current, lastStudyPath: returnPath },
      );
    }
  }, [returnPath, update]);
  return (
    <>
      {screen === "overview" ? (
        <Overview {...props} />
      ) : screen === "chat" ? (
        <ProductChat key={props.scope.unitId} {...props} />
      ) : screen === "studio" ? (
        <ProductStudio key={props.scope.unitId} {...props} />
      ) : ["quiz", "attempt", "quiz-review"].includes(screen) ? (
        <Quiz {...props} quizTime={now} onQuizStart={setNow} />
      ) : screen === "sources" || screen === "evidence" ? (
        <Evidence {...props} quizTime={now} />
      ) : (
        <Report
          key={`${props.scope.unitId}:${selection ? `${selection.origin}:${selection.sessionId}:${selection.exchange}` : "unselected"}`}
          {...props}
        />
      )}
    </>
  );
}

function Overview(props: Props) {
  const t = (en: string, ar: string) => (props.locale === "ar" ? ar : en);
  const edition =
    props.scope.curriculumEdition === "synthetic-2026-2027"
      ? t("Sample edition 2026–2027", "إصدار تجريبي ٢٠٢٦–٢٠٢٧")
      : props.scope.curriculumEdition;
  return (
    <section>
      <header className={styles.materialsHeading}>
        <div>
          <h2>{t("Materials", "مصادر المذاكرة")}</h2>
          <p>
            {new Intl.DateTimeFormat(
              props.locale === "ar" ? "ar-EG" : "en-GB",
              {
                dateStyle: "medium",
                timeZone: "UTC",
              },
            ).format(new Date(props.scope.materialUpdatedAt))}{" "}
            · <bdi>{edition}</bdi>
          </p>
        </div>
      </header>
      <Evidence {...props} screen="sources" embedded />
    </section>
  );
}

function getSources(scope: WorkspaceScope, locale: Locale, dense: boolean) {
  return Array.from({ length: scope.sourceCount }, (_, index) => ({
    title: dense
      ? text(studyDensitySourceTitles[index]!, locale)
      : index === 0
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
            ? "لا يوجد مرجع موثّق لصفحة أو توقيت"
            : "No verified page or timestamp reference",
    segment: `sample:${scope.unitId}:${index + 1}`,
    passageId: index === 0 ? "handout" : index === 1 ? "recording" : null,
  }));
}

function Evidence({
  scope,
  locale,
  base,
  screen,
  embedded = false,
  quizTime,
}: Props & { embedded?: boolean; quizTime?: number }) {
  const { state } = useProductServices();
  const query = useSearchParams();
  const t = useProductText(locale);
  const quizSource = embedded
    ? null
    : resolveQuizSourceSelection(query, state.attempts[scope.unitId], quizTime);
  const selection =
    embedded || quizSource ? null : resolveChatExchangeSelection(query);
  const session = state.sessions.find(
    (entry) =>
      entry.scope === scope.unitId && entry.id === selection?.sessionId,
  );
  const exchange = selection?.exchange;
  const answer =
    exchange !== undefined && Number.isInteger(exchange) && exchange > 0
      ? session?.answers[exchange - 1]
      : undefined;
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
                : query.get("from") === "studio"
                  ? base + "/studio"
                  : `${base}/chat${session ? `?session=${session.id}#exchange-${exchange}` : ""}`
            }
            locale={locale}
          >
            {quizSource
              ? quizSource.kind === "unavailable"
                ? t("Open Quiz", "فتح الاختبار")
                : quizSource.kind === "review"
                  ? t("Return to quiz review", "العودة إلى مراجعة الاختبار")
                  : t("Return to quiz attempt", "العودة إلى محاولة الاختبار")
              : query.get("from") === "studio"
                ? t("Return to Studio", "العودة للاستوديو")
                : t("Return to Chat", "العودة للمحادثة")}
          </ProductLink>
          {quizSource?.kind === "unavailable" ? (
            <Notice error>
              {t(
                "This source return no longer matches the current quiz. Open Quiz to continue.",
                "لم يعد مسار العودة من المصادر يطابق الاختبار الحالي. افتح الاختبار للمتابعة.",
              )}
            </Notice>
          ) : null}
          <p>
            {t(
              "Sample materials · Excerpts and page references below are illustrative.",
              "مواد تجريبية · النصوص ومواضع الصفحات أدناه للتوضيح.",
            )}
          </p>
        </div>
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
        <div className={styles.materialLibrary}>
          {sources.map((source) => {
            const active = !(
              scope.unitId === defaultScope.unitId &&
              !state.availability.sourceActive &&
              source.segment.endsWith(":1")
            );
            const reading = studyMaterialReading(
              source.passageId,
              active,
              locale,
            );
            const passage = studyPassage(source.passageId, locale);
            return (
              <article key={source.segment} className={styles.sourceRow}>
                <div className={styles.sourceIdentity}>
                  <div className={styles.sourceTitle}>
                    <bdi className={styles.sourceFormat}>{source.format}</bdi>
                    <h3>{source.title}</h3>
                  </div>
                  <p>{source.locator}</p>
                  <p>{reading.caption}</p>
                </div>
                <span className={styles.pill}>
                  {active
                    ? t("Available for learning tools", "متاح لأدوات المذاكرة")
                    : t(
                        "INACTIVE sample · excluded from new requests",
                        "مثال غير نشط · مستبعد من الطلبات الجديدة",
                      )}
                </span>
                {reading.readable && passage ? (
                  <details>
                    <summary>{reading.action}</summary>
                    <p>{passage.text}</p>
                    <p>
                      {t(
                        "Processed excerpt only. Full file reading and audio playback are not available here.",
                        "مقتطف معالج فقط. قراءة الملف الكامل وتشغيل الصوت غير متاحين هنا.",
                      )}{" "}
                      · {passage.locator}
                    </p>
                  </details>
                ) : null}
              </article>
            );
          })}
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
  const t = useProductText(locale);
  const selection = resolveChatExchangeSelection(query);
  const session = state.sessions.find(
    (entry) =>
      entry.scope === scope.unitId && entry.id === selection?.sessionId,
  );
  const exchange = selection?.exchange;
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

function Quiz({
  scope,
  locale,
  base,
  screen,
  quizTime: now,
  onQuizStart,
}: Props & { quizTime: number; onQuizStart: (time: number) => void }) {
  const { state, update } = useProductServices();
  const router = useProductRouter();
  const query = useSearchParams();
  const t = useProductText(locale);
  const attempt = state.attempts[scope.unitId];
  const [passageQuestion, setPassageQuestion] = useState<{
    attemptKey: string;
    index: number;
  } | null>(null);
  const configuration =
    state.quizDrafts[scope.unitId] ?? defaultQuizConfiguration;
  const configurationErrors = quizConfigurationErrors(configuration);
  function setConfiguration(
    change: (value: QuizConfiguration) => QuizConfiguration,
  ) {
    update((current) => ({
      ...current,
      quizDrafts: {
        ...current.quizDrafts,
        [scope.unitId]: change(
          current.quizDrafts[scope.unitId] ?? defaultQuizConfiguration,
        ),
      },
    }));
  }
  const handoutAvailable =
    scope.unitId !== defaultScope.unitId || state.availability.sourceActive;
  const questions = fixtureQuizQuestions(
    attempt?.configuration ?? defaultQuizConfiguration,
    locale,
  );
  function start(config = configuration, expectedKey?: string) {
    if (!handoutAvailable || !validQuizConfiguration(config)) return;
    const startedAt = Date.now();
    onQuizStart(startedAt);
    const prepared = {
      ...fixtureQuizAttempt(config, startedAt),
      inspectionKey: crypto.randomUUID(),
    };
    update((current) =>
      expectedKey &&
      current.attempts[scope.unitId]?.inspectionKey !== expectedKey
        ? current
        : {
            ...current,
            quizDrafts: {
              ...current.quizDrafts,
              [scope.unitId]: { ...config },
            },
            attempts: {
              ...current.attempts,
              [scope.unitId]: prepared,
            },
          },
    );
    router.push(
      `${base}/quiz/sample-attempt?attempt=${encodeURIComponent(prepared.inspectionKey)}&lang=${locale}` as Route,
    );
  }
  const score = attempt
    ? questions.filter(
        (question, index) => attempt.answers[index] === question.correct,
      ).length
    : 0;
  if (screen === "quiz")
    return (
      <section className={styles.panel}>
        <h2>{t("Set up your quiz", "إعداد الاختبار")}</h2>
        <p>
          {t(
            "Choose from six sample questions per difficulty. Scores are illustrative and stay in this tab.",
            "اختر من ستة أسئلة تجريبية لكل مستوى. النتيجة توضيحية وتبقى في هذا التبويب.",
          )}
        </p>
        <div className={styles.quizConfiguration}>
          <ChoiceGroup
            label={t("Timing", "التوقيت")}
            value={configuration.mode}
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
              <label className={styles.field}>
                {t("Duration (minutes)", "المدة (بالدقائق)")}
                <input
                  type="number"
                  min={1}
                  max={240}
                  step={1}
                  aria-invalid={configurationErrors.durationMinutes}
                  aria-describedby={
                    configurationErrors.durationMinutes
                      ? "quiz-duration-error"
                      : undefined
                  }
                  value={
                    Number.isNaN(configuration.durationMinutes)
                      ? ""
                      : configuration.durationMinutes
                  }
                  onChange={(event) =>
                    setConfiguration((current) => ({
                      ...current,
                      durationMinutes: event.target.valueAsNumber,
                    }))
                  }
                />
              </label>
              {configurationErrors.durationMinutes ? (
                <p
                  role="alert"
                  id="quiz-duration-error"
                  className={styles.fieldHint}
                >
                  {t(
                    "Enter a whole number of minutes from 1 to 240.",
                    "أدخل عددًا صحيحًا من الدقائق من ١ إلى ٢٤٠.",
                  )}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className={styles.questionCount}>
            <label className={styles.field}>
              {t("Number of questions", "عدد الأسئلة")}
              <input
                type="number"
                min={1}
                max={6}
                step={1}
                aria-invalid={configurationErrors.questionCount}
                aria-describedby={`quiz-question-count-help${configurationErrors.questionCount ? " quiz-question-count-error" : ""}`}
                value={
                  Number.isNaN(configuration.questionCount)
                    ? ""
                    : configuration.questionCount
                }
                onChange={(event) =>
                  setConfiguration((current) => ({
                    ...current,
                    questionCount: event.target.valueAsNumber,
                  }))
                }
              />
            </label>
            <p id="quiz-question-count-help" className={styles.fieldHint}>
              {t(
                "1–6 questions per sample attempt.",
                "من ١ إلى ٦ أسئلة في المحاولة التجريبية.",
              )}
            </p>
            {configurationErrors.questionCount ? (
              <p
                role="alert"
                id="quiz-question-count-error"
                className={styles.fieldHint}
              >
                {t(
                  "Enter a whole number of questions from 1 to 6.",
                  "أدخل عددًا صحيحًا من الأسئلة من ١ إلى ٦.",
                )}
              </p>
            ) : null}
          </div>
          <ChoiceGroup
            label={t("Difficulty", "الصعوبة")}
            value={configuration.difficulty}
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
        <div className={styles.quizStart}>
          <Button
            primary
            onClick={() => start()}
            disabled={
              !handoutAvailable || !validQuizConfiguration(configuration)
            }
          >
            {attempt
              ? t("Start new attempt", "بدء محاولة جديدة")
              : t("Start quiz", "بدء الاختبار")}
          </Button>
          <Button
            onClick={() =>
              setConfiguration(() => ({ ...defaultQuizConfiguration }))
            }
          >
            {t("Use default setup", "استخدام الإعدادات الافتراضية")}
          </Button>
          {attempt ? (
            <ProductLink
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
              "Your setup stays in this tab. A new attempt replaces the latest attempt; reloading clears both.",
              "تبقى إعداداتك في هذا التبويب. المحاولة الجديدة تستبدل آخر محاولة؛ وإعادة التحميل تمسحهما.",
            )}
          </Notice>
        ) : null}
      </section>
    );
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
  const answered = attempt.answers.filter((answer) => answer >= 0).length;
  const remainingSeconds = attempt.expiresAt
    ? Math.max(0, Math.ceil((attempt.expiresAt - now) / 1000))
    : null;
  const clockNumber = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
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
    <>
      {!expired ? (
        <h2>
          {readOnly
            ? t("Quiz review", "مراجعة الاختبار")
            : t("Quiz attempt", "محاولة الاختبار")}
        </h2>
      ) : null}
      <p>
        {
          {
            easy: t("Easy", "سهل"),
            medium: t("Medium", "متوسط"),
            hard: t("Hard", "صعب"),
          }[attempt.configuration.difficulty]
        }{" "}
        ·{" "}
        {attempt.configuration.mode === "timed"
          ? `${t("Timed", "مؤقت")} · ${new Intl.NumberFormat(locale).format(attempt.configuration.durationMinutes)} ${t("minutes", "دقائق")}`
          : t("Untimed", "دون توقيت")}
      </p>
      {expired ? (
        <>
          <h2>{t("Expired quiz review", "مراجعة الاختبار المنتهي")}</h2>
          <Notice error>
            {t(
              "This timed attempt has expired. No score was recorded. Your answers are frozen; review the corrections below.",
              "انتهى وقت المحاولة. لم تسجل نتيجة. إجاباتك ثابتة؛ راجع التصحيحات أدناه.",
            )}
          </Notice>
          <p>
            {t("Answered", "تمت الإجابة")}:{" "}
            <bdi>
              {new Intl.NumberFormat(locale).format(answered)} /{" "}
              {new Intl.NumberFormat(locale).format(questions.length)}
            </bdi>{" "}
            · {t("Unanswered", "دون إجابة")}:{" "}
            {new Intl.NumberFormat(locale).format(questions.length - answered)}
          </p>
        </>
      ) : null}
      <div
        className={!readOnly ? studyStyles.quizProgress : undefined}
        data-workspace-chrome={!readOnly ? true : undefined}
      >
        {!expired ? (
          <p id="quiz-progress" aria-live="polite">
            {t("Answered", "تمت الإجابة")}:{" "}
            <bdi>
              {new Intl.NumberFormat(locale).format(answered)} /{" "}
              {new Intl.NumberFormat(locale).format(questions.length)}
            </bdi>{" "}
            · {t("Unanswered", "دون إجابة")}:{" "}
            {new Intl.NumberFormat(locale).format(questions.length - answered)}
          </p>
        ) : null}
        {attempt.expiresAt && !readOnly ? (
          <p role="timer">
            {t("Time remaining", "الوقت المتبقي")}:{" "}
            <bdi>
              {clockNumber.format(Math.floor(remainingSeconds! / 60))}:
              {clockNumber.format(remainingSeconds! % 60)}
            </bdi>
          </p>
        ) : null}
        {!attempt.expiresAt && !readOnly ? (
          <p>{t("Untimed", "دون توقيت")}</p>
        ) : null}
        {remainingSeconds !== null &&
        remainingSeconds > 0 &&
        remainingSeconds < 60 &&
        !readOnly ? (
          <p className={studyStyles.lowTime} role="status">
            {t("Less than one minute remains.", "متبقي أقل من دقيقة.")}
          </p>
        ) : null}
      </div>
      {attempt.submitted ? (
        <Notice>
          {t("Simulated score", "نتيجة محاكاة")}:{" "}
          {new Intl.NumberFormat(locale).format(score)} /{" "}
          {new Intl.NumberFormat(locale).format(questions.length)} ·{" "}
          {t("illustrative only", "توضيحية فقط")}
        </Notice>
      ) : null}
      {questions.map((question, index) => (
        <Fragment key={index}>
          <fieldset className={styles.question} disabled={readOnly}>
            <legend>
              <span>
                {t("Question", "السؤال")}{" "}
                {new Intl.NumberFormat(locale).format(index + 1)}{" "}
                {t("of", "من")}{" "}
                {new Intl.NumberFormat(locale).format(questions.length)}
              </span>{" "}
              · <span>{question.prompt}</span>
            </legend>
            {question.choices.map((choice, answerIndex) => (
              <label className={styles.check} key={choice}>
                <input
                  type="radio"
                  name={`sample-question-${index}`}
                  checked={attempt.answers[index] === answerIndex}
                  onChange={() => {
                    const answeredAt = Date.now();
                    update((current) => {
                      const latest = current.attempts[scope.unitId];
                      if (
                        !latest ||
                        latest.inspectionKey !== attempt.inspectionKey
                      )
                        return current;
                      const next = answerQuizAttempt(
                        latest,
                        index,
                        answerIndex,
                        answeredAt,
                      );
                      return next === latest
                        ? current
                        : {
                            ...current,
                            attempts: {
                              ...current.attempts,
                              [scope.unitId]: next,
                            },
                          };
                    });
                  }}
                />
                {choice}
              </label>
            ))}
            {readOnly ? (
              <div>
                <p>
                  <strong>
                    {attempt.answers[index]! < 0
                      ? t("Unanswered", "دون إجابة")
                      : attempt.answers[index] === question.correct
                        ? t("Correct", "صحيحة")
                        : t("Incorrect", "غير صحيحة")}
                  </strong>
                </p>
                <p>
                  {t("Your answer", "إجابتك")}:{" "}
                  {question.choices[attempt.answers[index]!] ??
                    t("Unanswered", "دون إجابة")}
                </p>
                <p>
                  {t("Correct answer", "الإجابة الصحيحة")}:{" "}
                  {question.choices[question.correct]}
                </p>
                <p>{question.explanation}</p>
              </div>
            ) : null}
          </fieldset>
          {readOnly ? (
            <div className={styles.actions}>
              <Button
                onClick={() =>
                  setPassageQuestion({
                    attemptKey: attempt.inspectionKey,
                    index,
                  })
                }
              >
                {t("Supporting passages for question", "النصوص الداعمة للسؤال")}{" "}
                {new Intl.NumberFormat(locale).format(index + 1)}
              </Button>
            </div>
          ) : null}
        </Fragment>
      ))}
      {!readOnly ? (
        <p id="quiz-submit-help">
          {answered < questions.length ? (
            <>
              {t(
                "Answer every question before submitting. Unanswered questions",
                "أجب عن كل الأسئلة قبل التسليم. الأسئلة دون إجابة",
              )}
              :{" "}
              <bdi>
                {attempt.answers
                  .flatMap((answer, index) =>
                    answer < 0
                      ? [new Intl.NumberFormat(locale).format(index + 1)]
                      : [],
                  )
                  .join(locale === "ar" ? "، " : ", ")}
              </bdi>
              .
            </>
          ) : (
            t(
              "All questions answered. You can submit now.",
              "تمت الإجابة عن كل الأسئلة. يمكنك التسليم الآن.",
            )
          )}
        </p>
      ) : null}
      <div className={styles.actions}>
        {!readOnly ? (
          <Button
            primary
            disabled={
              !handoutAvailable || attempt.answers.some((answer) => answer < 0)
            }
            onClick={() => {
              const submittedAt = Date.now();
              update((current) => {
                const latest = current.attempts[scope.unitId];
                if (!latest || latest.inspectionKey !== attempt.inspectionKey)
                  return current;
                const next = submitQuizAttempt(latest, submittedAt);
                return next === latest
                  ? current
                  : {
                      ...current,
                      attempts: { ...current.attempts, [scope.unitId]: next },
                    };
              });
            }}
          >
            {t("Submit answers", "تسليم الإجابات")}
          </Button>
        ) : (
          <Button
            primary
            disabled={!handoutAvailable}
            onClick={() => start(attempt.configuration, attempt.inspectionKey)}
          >
            {t("Repeat this setup", "تكرار هذه الإعدادات")}
          </Button>
        )}
        <ProductLink href={base + "/quiz"} locale={locale}>
          {t("Back to quiz", "العودة للاختبار")}
        </ProductLink>
        <ProductLink
          href={`${base}/sources?from=${screen === "quiz-review" ? "quiz-review" : "quiz-attempt"}&attempt=${encodeURIComponent(attempt.inspectionKey)}`}
          locale={locale}
        >
          {t("Browse material library", "تصفح مكتبة المصادر")}
        </ProductLink>
      </div>
      <ProductSourceDialog
        open={Boolean(
          readOnly &&
          passageQuestion?.attemptKey === attempt.inspectionKey &&
          questions[passageQuestion.index],
        )}
        title={
          t("Supporting passages for question", "النصوص الداعمة للسؤال") +
          " " +
          new Intl.NumberFormat(locale).format(
            (passageQuestion?.index ?? 0) + 1,
          )
        }
        ids={
          passageQuestion?.attemptKey === attempt.inspectionKey
            ? (questions[passageQuestion.index]?.supportingPassages ?? [])
            : []
        }
        scope={scope}
        locale={locale}
        libraryHref={`${base}/sources?from=${screen === "quiz-review" ? "quiz-review" : "quiz-attempt"}&attempt=${encodeURIComponent(attempt.inspectionKey)}`}
        onClose={() => setPassageQuestion(null)}
      />
    </>
  );
}

export function UnitSwitch({
  scope,
  locale,
  base,
}: Pick<ProductStudyProps, "scope" | "locale" | "base">) {
  const { state } = useProductServices();
  const pathname = usePathname();
  const suffix =
    ["/chat", "/studio", "/quiz"].find((tab) => pathname === base + tab) ?? "";
  const units = reviewCatalogRows.filter(
    (row) =>
      row.cohort.id === scope.cohortId &&
      sampleScopeAvailable(state, row.cohort.id, row.unit.id),
  );
  return (
    <nav
      className={styles.unitChoices}
      aria-label={
        locale === "ar"
          ? `${scope.unitLabelPluralAr} مجموعتك`
          : `${scope.unitLabelPluralEn} in your cohort`
      }
    >
      {units.map(({ unit }) => (
        <ProductLink
          key={unit.id}
          href={`/learn/${scope.cohortId}/${unit.id}${suffix}`}
          locale={locale}
          aria-current={unit.id === scope.unitId ? "page" : undefined}
          onClick={(event) =>
            event.currentTarget.closest("details")?.removeAttribute("open")
          }
        >
          {locale === "ar" ? unit.nameAr : unit.nameEn}
        </ProductLink>
      ))}
    </nav>
  );
}
