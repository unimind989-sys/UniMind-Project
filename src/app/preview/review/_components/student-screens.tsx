"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import {
  answerExamples,
  artifactTypes,
  promptExamples,
  reviewBase,
  scopeChoices,
  text,
  type Locale,
  type ResponseKind,
  type SampleAnswer,
} from "../review-fixtures";
import styles from "../review.module.css";
import { useReview } from "./review-provider";
import { Button, Notice, ReviewLink, Row, Select } from "./review-ui";

type Props = {
  screen: string;
  scope: WorkspaceScope;
  locale: Locale;
  base: string;
  scenario: string;
};
const kindNames: Record<ResponseKind, readonly [string, string]> = {
  supported: ["Supported", "مدعوم"],
  partial: ["Partial support", "دعم جزئي"],
  unavailable: ["Unavailable information", "معلومة غير متاحة"],
  conflict: ["Source conflict", "تعارض المصادر"],
  hint: ["Professor hint", "تلميح محاضر"],
  educational: ["Educational case", "حالة تعليمية"],
  patient: ["Real-patient boundary", "حدود المريض الحقيقي"],
};

export function StudentScreen(props: Props) {
  const { scope, locale, base, screen } = props;
  const router = useRouter();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  return (
    <>
      <div className={styles.scope}>
        <nav
          className={styles.breadcrumb}
          aria-label={t("Curriculum scope", "نطاق المنهج")}
        >
          {[
            locale === "ar" ? scope.institutionNameAr : scope.institutionNameEn,
            locale === "ar" ? scope.programNameAr : scope.programNameEn,
            locale === "ar" ? scope.levelNameAr : scope.levelNameEn,
            locale === "ar" ? scope.termNameAr : scope.termNameEn,
          ].map((name, index) => (
            <bdi key={index}>
              {name}
              {index < 3 ? " / " : ""}
            </bdi>
          ))}
        </nav>
        <p>
          <strong>
            {locale === "ar"
              ? scope.unitLabelSingularAr
              : scope.unitLabelSingularEn}
            :{" "}
            <bdi>{locale === "ar" ? scope.unitTitleAr : scope.unitTitleEn}</bdi>
          </strong>
        </p>
        <p>
          <bdi>{scope.curriculumEdition}</bdi> ·{" "}
          {t(
            "Synthetic available unit · one knowledge pool",
            "وحدة تجريبية متاحة · مجموعة معرفة واحدة",
          )}
        </p>
        <Select
          id="unit-scope"
          label={t(
            "Switch sample unit and session scope",
            "تغيير الوحدة التجريبية ونطاق الجلسة",
          )}
          value={base}
          options={[
            [
              base,
              `${locale === "ar" ? scope.programNameAr : scope.programNameEn} · ${locale === "ar" ? scope.unitTitleAr : scope.unitTitleEn}`,
            ],
            ...scopeChoices
              .filter((choice) => choice.path !== base)
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
      </div>
      {screen === "overview" ? (
        <Overview {...props} />
      ) : screen === "chat" ? (
        <Chat {...props} />
      ) : screen === "studio" ? (
        <Studio {...props} />
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

function Overview({ scope, locale, base }: Props) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  return (
    <>
      <section className={styles.panel}>
        <h2>{t("Material and capacity", "المواد والسعة")}</h2>
        <dl className={styles.definition}>
          <div>
            <dt>{t("Pool", "مجموعة المعرفة")}</dt>
            <dd>
              {new Intl.NumberFormat(locale).format(scope.sourceCount)}{" "}
              {t(
                "synthetic source fixtures; no real approval implied",
                "مصادر تجريبية؛ لا تعني اعتمادًا حقيقيًا",
              )}
            </dd>
          </div>
          <div>
            <dt>{t("Sample material date", "تاريخ مواد المثال")}</dt>
            <dd>
              {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
                dateStyle: "medium",
                timeZone: "UTC",
              }).format(new Date(scope.materialUpdatedAt))}{" "}
              · {t("fixture date", "تاريخ تجريبي")}
            </dd>
          </div>
          <div>
            <dt>{t("Allowance", "الرصيد")}</dt>
            <dd>
              {t(
                "Illustrative ready state. Numeric caps and resets are not approved. Try unavailable/capacity scenarios above.",
                "حالة جاهزية توضيحية. الحدود الرقمية والتجديد لم يعتمدا. جرب سيناريو الرصيد غير المتاح أو السعة بالأعلى.",
              )}
            </dd>
          </div>
        </dl>
      </section>
      <Row
        title={t("Chat", "المحادثة")}
        action={
          <ReviewLink href={base + "/chat"} locale={locale}>
            {t("Try fixed answers", "جرب إجابات ثابتة")}
          </ReviewLink>
        }
      >
        <p>
          {t(
            "Start a unit-bound sample session and inspect supported, missing and conflicting evidence.",
            "ابدأ جلسة تجريبية مرتبطة بالوحدة وراجع الأدلة المدعومة والناقصة والمتعارضة.",
          )}
        </p>
      </Row>
      <Row
        title={t("Studio", "الاستوديو")}
        action={
          <ReviewLink href={base + "/studio"} locale={locale}>
            {t("Review artifacts", "مراجعة المخرجات")}
          </ReviewLink>
        }
      >
        <p>
          {t(
            "Six fixed artifact examples from the same synthetic source pool.",
            "ستة أمثلة مخرجات ثابتة من نفس مجموعة المصادر التجريبية.",
          )}
        </p>
      </Row>
      <Row
        title={t("Quiz", "الاختبار")}
        action={
          <ReviewLink href={base + "/quiz"} locale={locale}>
            {t("Try sample quiz", "جرب الاختبار التجريبي")}
          </ReviewLink>
        }
      >
        <p>
          {t(
            "Answer, submit and review an illustrative score with source explanations.",
            "أجب وسلم وراجع نتيجة توضيحية مع شرح من المصادر.",
          )}
        </p>
      </Row>
      <Row
        title={t("Sources and evidence", "المصادر والأدلة")}
        action={
          <ReviewLink href={base + "/sources"} locale={locale}>
            {t("Inspect sample sources", "فحص المصادر التجريبية")}
          </ReviewLink>
        }
      >
        <p>
          {t(
            "Title, format and reliable sample locator; no private source or download.",
            "العنوان والصيغة وموضع تجريبي موثوق؛ لا مصدر خاص أو تنزيل.",
          )}
        </p>
      </Row>
      <Row
        title={t("Reporting", "الإبلاغ")}
        action={
          <ReviewLink href={base + "/report"} locale={locale}>
            {t("Review reporting", "مراجعة الإبلاغ")}
          </ReviewLink>
        }
      >
        <p>
          {t(
            "A report needs an exchange. Create a fixed answer first; report details and retention policy remain undecided.",
            "البلاغ يحتاج محادثة. أنشئ إجابة ثابتة أولًا؛ تفاصيل البلاغ وسياسة الاحتفاظ لم تعتمدا.",
          )}
        </p>
      </Row>
    </>
  );
}

function Chat({ scope, locale, base }: Props) {
  const { state, update } = useReview();
  const [kind, setKind] = useState<ResponseKind>("supported");
  const [language, setLanguage] = useState<"en" | "ar" | "mixed">(locale);
  const [sending, setSending] = useState<SampleAnswer | null>(null);
  const [notice, setNotice] = useState("");
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const sessions = state.sessions.filter(
    (session) => session.scope === scope.unitId,
  );
  const selected = sessions.find(
    (session) => session.id === state.activeSessions[scope.unitId],
  );
  function start() {
    const id =
      state.sessions.reduce(
        (maximum, session) => Math.max(maximum, session.id),
        0,
      ) + 1;
    update((current) => ({
      ...current,
      sessions: [...current.sessions, { id, scope: scope.unitId, answers: [] }],
      activeSessions: { ...current.activeSessions, [scope.unitId]: id },
    }));
    setSending(null);
    setNotice(
      t(
        "New simulated session in this unit only.",
        "جلسة محاكاة جديدة داخل هذه الوحدة فقط.",
      ),
    );
  }
  function finish() {
    if (!sending || !selected || sending.sessionId !== selected.id) return;
    update((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === sending.sessionId && session.scope === scope.unitId
          ? { ...session, answers: [...session.answers, sending] }
          : session,
      ),
    }));
    setSending(null);
    setNotice(
      t(
        "Fixed answer revealed. No generation, retrieval, saving or provider call occurred.",
        "تم إظهار إجابة ثابتة. لم يحدث توليد أو استرجاع أو حفظ أو اتصال بمزود.",
      ),
    );
  }
  return (
    <>
      <div className={styles.actions}>
        <Button primary onClick={start}>
          {t("Start scoped sample session", "بدء جلسة تجريبية للوحدة")}
        </Button>
        <ReviewLink href={reviewBase + "/settings"} locale={locale}>
          {t("Privacy settings", "إعدادات الخصوصية")}
        </ReviewLink>
      </div>
      {sessions.length ? (
        <Select
          id="sample-session"
          label={t("Session in this unit", "الجلسة في هذه الوحدة")}
          value={String(selected?.id ?? "")}
          options={sessions.map((session) => [
            String(session.id),
            t("Session ", "جلسة ") +
              new Intl.NumberFormat(locale).format(session.id),
          ])}
          onChange={(value) => {
            update((current) => ({
              ...current,
              activeSessions: {
                ...current.activeSessions,
                [scope.unitId]: Number(value),
              },
            }));
            setSending(null);
          }}
        />
      ) : (
        <p>
          {t(
            "No sessions in this scope. Start one to try the fixed composer.",
            "لا جلسات في هذا النطاق. ابدأ جلسة لتجربة مثال المحادثة.",
          )}
        </p>
      )}
      <section className={styles.panel}>
        <h2>{t("Sample composer", "مثال كتابة السؤال")}</h2>
        <div className={styles.form}>
          <Select
            id="sample-prompt"
            label={t(
              "Fixed prompt and answer state",
              "السؤال الثابت وحالة الإجابة",
            )}
            value={kind}
            options={Object.entries(kindNames).map(([key, label]) => [
              key,
              text(label, locale),
            ])}
            onChange={(value) => setKind(value as ResponseKind)}
          />
          <Select
            id="study-language"
            label={t("Study language", "لغة المذاكرة")}
            value={language}
            options={[
              ["en", "English"],
              ["ar", "العربية"],
              ["mixed", t("Mixed Arabic and English", "عربي وإنجليزي مختلط")],
            ]}
            onChange={(value) => setLanguage(value as typeof language)}
          />
          <p
            lang={language === "mixed" ? "ar" : language}
            dir={language === "en" ? "ltr" : "rtl"}
          >
            {language === "mixed" ? (
              <>
                اشرح <bdi lang="en">study sequence</bdi> في المثال التجريبي.
              </>
            ) : (
              text(promptExamples[kind], language)
            )}
          </p>
          <p>
            {t("Future sample exchange mode", "وضع المحادثة التجريبية القادمة")}
            :{" "}
            {state.sharing === "private"
              ? t("Private / no sharing", "خاص / عدم مشاركة")
              : t("Founder-visible by default", "ظاهر للمؤسسين افتراضيًا")}
          </p>
          <Button
            primary
            disabled={!selected || sending !== null}
            onClick={() =>
              selected &&
              setSending({
                kind,
                language,
                sessionId: selected.id,
                sharing: state.sharing,
              })
            }
          >
            {t("Send fixed prompt", "إرسال السؤال الثابت")}
          </Button>
        </div>
        {sending ? (
          <div role="status">
            <p>
              {t(
                "Simulated stream · sample passage being revealed…",
                "بث محاكى · إظهار نص المثال…",
              )}
            </p>
            <p>
              {
                text(
                  answerExamples[sending.kind],
                  sending.language === "ar" ? "ar" : "en",
                ).split(".")[0]
              }
              …
            </p>
            <div className={styles.actions}>
              <Button onClick={finish}>
                {t("Complete simulated stream", "إكمال البث المحاكى")}
              </Button>
              <Button
                onClick={() => {
                  setSending(null);
                  setNotice(
                    t(
                      "Sample stream cancelled. Retry by sending the fixed prompt.",
                      "تم إلغاء بث المثال. أعد المحاولة بإرسال السؤال الثابت.",
                    ),
                  );
                }}
              >
                {t("Cancel stream", "إلغاء البث")}
              </Button>
            </div>
          </div>
        ) : null}
        {notice ? <Notice>{notice}</Notice> : null}
      </section>
      {selected?.answers.map((answer, index) => (
        <article className={styles.answer} key={index}>
          <h2>{text(kindNames[answer.kind], locale)}</h2>
          <p
            lang={
              answer.language === "ar" || answer.language === "mixed"
                ? "ar"
                : "en"
            }
            dir={answer.language === "en" ? "ltr" : "rtl"}
          >
            {answer.language === "mixed" ? (
              <>
                {text(answerExamples[answer.kind], "ar")}{" "}
                <bdi lang="en">Synthetic source · study sequence</bdi>
              </>
            ) : (
              text(answerExamples[answer.kind], answer.language)
            )}
          </p>
          <p>
            {t("Recorded sample sharing mode", "وضع مشاركة المثال المسجل")}:{" "}
            {answer.sharing === "private"
              ? t("Private", "خاص")
              : t("Shared", "مشارك")}
          </p>
          <div className={styles.actions}>
            <ReviewLink
              href={`${base}/evidence?exchange=${index + 1}&session=${selected.id}`}
              locale={locale}
            >
              {t("Inspect evidence", "فحص الأدلة")}
            </ReviewLink>
            <ReviewLink
              href={`${base}/report?exchange=${index + 1}&session=${selected.id}`}
              locale={locale}
            >
              {t("Report example", "الإبلاغ عن المثال")}
            </ReviewLink>
          </div>
        </article>
      ))}
    </>
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

function Evidence({ scope, locale, base, screen }: Props) {
  const { state } = useReview();
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
      <p>
        {t(
          "Synthetic source titles and formats are metadata in one unit pool. Locators and excerpts below are fixtures, not real source access.",
          "عناوين وصيغ المصادر التجريبية بيانات داخل مجموعة الوحدة الواحدة. المواضع والنصوص أدناه أمثلة وليست وصولًا لمصادر حقيقية.",
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
                  <p>
                    {t("Sample provenance", "تتبع تجريبي")}:{" "}
                    <bdi>{source.segment}</bdi>
                  </p>
                </Row>
              ))
            )}
          </section>
        )
      ) : (
        sources.map((source) => (
          <Row key={source.segment} title={source.title}>
            <p>
              <bdi>{source.format}</bdi> · {source.locator}
            </p>
            <span className={styles.pill}>
              {t(
                "READY sample · valid sample rights",
                "مثال جاهز · حقوق تجريبية سارية",
              )}
            </span>
          </Row>
        ))
      )}
      <div className={styles.actions}>
        <ReviewLink href={base + "/chat"} locale={locale}>
          {t("Return to Chat", "العودة للمحادثة")}
        </ReviewLink>
        {answer ? (
          <ReviewLink
            href={`${base}/report?exchange=${exchange}&session=${session?.id}`}
            locale={locale}
          >
            {t("Report selected exchange", "الإبلاغ عن المحادثة المختارة")}
          </ReviewLink>
        ) : null}
      </div>
    </>
  );
}

function Report({ scope, locale, base }: Props) {
  const { state, update } = useReview();
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
        <ReviewLink href={base + "/chat"} locale={locale}>
          {t("Open Chat", "فتح المحادثة")}
        </ReviewLink>
      </section>
    );
  return (
    <section className={styles.panel}>
      <h2>{t("Selected sample exchange", "المحادثة التجريبية المختارة")}</h2>
      <p>{text(answerExamples[answer.kind], locale)}</p>
      <Select
        id="report-reason"
        label={t("Sample reason", "السبب التجريبي")}
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
          "This example submits only this exchange's sample reason to tab memory. In the real product, a qualifying report can permit audited founder review of that exchange even in private mode. Exact report payload, disclosure and retention await D-08; this sample does not decide them.",
          "المثال يضيف سببًا تجريبيًا لهذه المحادثة فقط إلى ذاكرة التبويب. في المنتج الحقيقي، البلاغ المؤهل قد يسمح بمراجعة المؤسسين المدققة لهذه المحادثة حتى في الوضع الخاص. محتوى البلاغ والإفصاح والاحتفاظ بانتظار D-08؛ المثال لا يقررها.",
        )}
      </p>
      <label className={styles.check}>
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        {t(
          "Review this simulated report for the selected exchange",
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
        {t("Simulate report", "محاكاة البلاغ")}
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
        <ReviewLink href={base + "/chat"} locale={locale}>
          {t("Back to Chat", "العودة للمحادثة")}
        </ReviewLink>
      </div>
    </section>
  );
}

function Studio({ scope, locale, base }: Props) {
  const { state, update } = useReview();
  const [type, setType] = useState("summary");
  const [language, setLanguage] = useState<string>(locale);
  const [topic, setTopic] = useState("sequence");
  const [depth, setDepth] = useState("concise");
  const [size, setSize] = useState("short");
  const [flipped, setFlipped] = useState(false);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const artifact = state.artifacts[scope.unitId];
  return (
    <>
      <p>
        {t(
          "Select parameters to load a fixed fixture. No artifact is generated or stored. Every type uses this unit's same sample pool.",
          "اختر المعايير لعرض مثال ثابت. لا يتم توليد أو حفظ مخرج. كل الأنواع تستخدم نفس مجموعة الوحدة التجريبية.",
        )}
      </p>
      <div className={styles.form}>
        <Select
          id="artifact-type"
          label={t("Artifact type", "نوع المخرج")}
          value={type}
          onChange={setType}
          options={artifactTypes.map(([id, en, ar]) => [id, t(en, ar)])}
        />
        <div className={styles.grid}>
          <Select
            id="artifact-topic"
            label={t("Topic", "الموضوع")}
            value={topic}
            onChange={setTopic}
            options={[
              ["sequence", t("Study sequence", "ترتيب الدراسة")],
              ["comparison", t("Diagram comparison", "مقارنة الرسوم")],
            ]}
          />
          <Select
            id="artifact-language"
            label={t("Language", "اللغة")}
            value={language}
            onChange={setLanguage}
            options={[
              ["en", "English"],
              ["ar", "العربية"],
              ["mixed", t("Mixed", "مختلط")],
            ]}
          />
          <Select
            id="artifact-depth"
            label={t("Depth", "التفصيل")}
            value={depth}
            onChange={setDepth}
            options={[
              ["concise", t("Concise", "موجز")],
              ["detailed", t("Detailed", "مفصل")],
            ]}
          />
          <Select
            id="artifact-size"
            label={t("Size", "الحجم")}
            value={size}
            onChange={setSize}
            options={[
              ["short", t("Short sample", "مثال قصير")],
              ["extended", t("Extended sample", "مثال موسع")],
            ]}
          />
        </div>
        <Button
          primary
          onClick={() => {
            update((current) => ({
              ...current,
              artifacts: {
                ...current.artifacts,
                [scope.unitId]: { type, language, topic, depth, size },
              },
            }));
            setFlipped(false);
          }}
        >
          {t("Load fixed artifact", "تحميل المخرج الثابت")}
        </Button>
      </div>
      {artifact ? (
        <section className={styles.panel}>
          <h2>
            {t("Simulated artifact", "مخرج محاكى")}:{" "}
            {text(
              (
                artifactTypes.find(([id]) => id === artifact.type) ??
                artifactTypes[0]
              ).slice(1) as [string, string],
              locale,
            )}
          </h2>
          <p>
            {t("Selected topic", "الموضوع المختار")}:{" "}
            {artifact.topic === "comparison"
              ? t("Diagram comparison", "مقارنة الرسوم")
              : t("Study sequence", "ترتيب الدراسة")}{" "}
            ·{" "}
            {artifact.depth === "detailed"
              ? t("Detailed", "مفصل")
              : t("Concise", "موجز")}{" "}
            ·{" "}
            {artifact.size === "extended"
              ? t("Extended sample", "مثال موسع")
              : t("Short sample", "مثال قصير")}
          </p>
          <div
            lang={artifact.language === "en" ? "en" : "ar"}
            dir={artifact.language === "en" ? "ltr" : "rtl"}
          >
            {artifact.type === "flashcards" ? (
              <>
                <p>
                  {flipped
                    ? artifact.language === "en"
                      ? "Identify labels, then compare diagrams."
                      : "حدد الأسماء ثم قارن الرسوم."
                    : artifact.language === "en"
                      ? "What sequence does the sample handout use?"
                      : "ما ترتيب الملزمة التجريبية؟"}
                </p>
                <Button onClick={() => setFlipped(!flipped)}>
                  {t("Flip sample card", "اقلب البطاقة التجريبية")}
                </Button>
              </>
            ) : artifact.type === "quiz" ? (
              <p>
                {artifact.language === "en"
                  ? "Two sample questions about evidence and the study sequence."
                  : "سؤالان تجريبيان عن الأدلة وترتيب الدراسة."}
              </p>
            ) : (
              <>
                <p>
                  {artifact.type === "practice"
                    ? artifact.language === "en"
                      ? "Question: Which step comes first in the sample handout?"
                      : "سؤال: ما الخطوة الأولى في الملزمة التجريبية؟"
                    : artifact.topic === "comparison"
                      ? artifact.language === "en"
                        ? "Compare the two labelled diagrams using the sample handout."
                        : "قارن الرسمين المسميين باستخدام الملزمة التجريبية."
                      : artifact.language === "en"
                        ? "Identify the labelled structures before comparing the diagrams."
                        : "حدد الأجزاء المسماة قبل مقارنة الرسمين."}
                </p>
                {artifact.type === "guide" || artifact.type === "revision" ? (
                  <ol>
                    <li>
                      {artifact.language === "en"
                        ? "Read the sample labels."
                        : "اقرأ أسماء المثال."}
                    </li>
                    <li>
                      {artifact.language === "en"
                        ? "Explain the comparison using the source."
                        : "اشرح المقارنة بالمصدر."}
                    </li>
                  </ol>
                ) : null}
                {artifact.type === "practice" ? (
                  <details>
                    <summary>
                      {t(
                        "Reveal grounded explanation",
                        "إظهار الشرح من المصدر",
                      )}
                    </summary>
                    <p>
                      {artifact.language === "en"
                        ? "Identification comes first in the sample handout (sample page 3)."
                        : "التحديد أولًا في الملزمة التجريبية (صفحة تجريبية ٣)."}
                    </p>
                  </details>
                ) : null}
                {artifact.depth === "detailed" ? (
                  <p>
                    {artifact.language === "en"
                      ? "The first step establishes labels; the second compares the labelled diagrams. This is a fixed elaboration of the sample passage."
                      : "الخطوة الأولى تحدد الأسماء، والثانية تقارن الرسوم المسماة. هذا شرح ثابت لنص المثال."}
                  </p>
                ) : null}
                {artifact.size === "extended" ? (
                  <p>
                    {artifact.language === "en"
                      ? "Review prompt: describe the two steps and identify what the sources leave unspecified."
                      : "سؤال مراجعة: صف الخطوتين وحدد ما لم توضحه المصادر."}
                  </p>
                ) : null}
              </>
            )}
            {artifact.language === "mixed" ? (
              <p>
                <bdi lang="en">Identify → Compare · synthetic sequence</bdi>
              </p>
            ) : null}
          </div>
          <p>
            {t(
              "Missing: no timing is supplied. Conflict: the recording reverses the sequence. This fixed example does not resolve that disagreement.",
              "الناقص: لا يوجد توقيت. التعارض: التسجيل يعكس الترتيب. المثال الثابت لا يحسم هذا الخلاف.",
            )}
          </p>
          <p>
            {t(
              "Evidence: Synthetic sequence handout · PDF · sample page 3; Synthetic comparison recording · AUDIO · sample timestamp 02:10.",
              "الأدلة: ملزمة الترتيب التجريبية · PDF · صفحة تجريبية ٣؛ تسجيل المقارنة التجريبي · AUDIO · توقيت تجريبي ٠٢:١٠.",
            )}
          </p>
          <div className={styles.actions}>
            <ReviewLink href={base + "/sources"} locale={locale}>
              {t("Inspect source pool", "فحص مجموعة المصادر")}
            </ReviewLink>
            <ReviewLink href={base + "/quiz"} locale={locale}>
              {t("Open sample quiz", "فتح الاختبار التجريبي")}
            </ReviewLink>
          </div>
        </section>
      ) : (
        <p>
          {t(
            "No artifact loaded in this unit. Choose parameters and load a fixed example.",
            "لم تحمل مخرجًا في هذه الوحدة. اختر المعايير وحمل مثالًا ثابتًا.",
          )}
        </p>
      )}
    </>
  );
}

function Quiz({ scope, locale, base, screen }: Props) {
  const { state, update } = useReview();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const attempt = state.attempts[scope.unitId];
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
        [scope.unitId]: { answers: [-1, -1], submitted: false },
      },
    }));
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
          <Button primary onClick={start}>
            {attempt
              ? t("Reset sample attempt", "إعادة ضبط المحاولة التجريبية")
              : t("Create sample attempt", "إنشاء محاولة تجريبية")}
          </Button>
          {attempt ? (
            <ReviewLink href={base + "/quiz/sample-attempt"} locale={locale}>
              {t("Open sample attempt", "فتح المحاولة التجريبية")}
            </ReviewLink>
          ) : null}
          {attempt?.submitted ? (
            <ReviewLink
              href={base + "/quiz/sample-attempt/review"}
              locale={locale}
            >
              {t("Review score", "مراجعة النتيجة")}
            </ReviewLink>
          ) : null}
        </div>
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
        <ReviewLink href={base + "/quiz"} locale={locale}>
          {t("Create a sample attempt", "إنشاء محاولة تجريبية")}
        </ReviewLink>
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
        <ReviewLink href={base + "/quiz/sample-attempt"} locale={locale}>
          {t("Return to attempt", "العودة للمحاولة")}
        </ReviewLink>
      </section>
    );
  return (
    <>
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
            disabled={attempt.answers.some((answer) => answer < 0)}
            onClick={() =>
              update((current) => ({
                ...current,
                attempts: {
                  ...current.attempts,
                  [scope.unitId]: { ...attempt, submitted: true },
                },
              }))
            }
          >
            {t("Submit sample answers", "تسليم الإجابات التجريبية")}
          </Button>
        ) : (
          <ReviewLink
            href={base + "/quiz/sample-attempt/review"}
            locale={locale}
          >
            {t("Open grounded review", "فتح المراجعة بالمصادر")}
          </ReviewLink>
        )}
        <ReviewLink href={base + "/quiz"} locale={locale}>
          {t("Back to quiz", "العودة للاختبار")}
        </ReviewLink>
        <ReviewLink href={base + "/sources"} locale={locale}>
          {t("Inspect sources", "فحص المصادر")}
        </ReviewLink>
      </div>
    </>
  );
}
