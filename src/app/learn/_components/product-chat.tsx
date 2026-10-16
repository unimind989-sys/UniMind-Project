"use client";
import { useProductText } from "@/app/_components/product-copy";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProductServices } from "@/app/_components/product-services";
import { Button, Notice, ProductLink } from "@/app/_components/product-ui";
import { FrontendIcon } from "@/app/_components/frontend-system";
import {
  answerExamples,
  defaultScope,
  promptExamples,
  text,
  type ResponseKind,
  type SampleAnswer,
} from "@/lib/demo/synthetic-fixtures.application";
import { ChoiceGroup } from "@/app/_components/choice-group";
import { ProductDialog } from "@/app/_components/product-dialog";
import type { ProductStudyProps } from "./product-study";
import { conversationTitle } from "@/lib/study/recent-work.application";
import styles from "./product-study.module.css";
import productStyles from "@/app/_components/product.module.css";

const kindNames: Record<ResponseKind, readonly [string, string]> = {
  supported: ["Supported", "مدعوم"],
  partial: ["Partial support", "دعم جزئي"],
  unavailable: ["Unavailable information", "معلومة غير متاحة"],
  conflict: ["Source conflict", "تعارض المصادر"],
  hint: ["Professor hint", "تلميح محاضر"],
  educational: ["Educational case", "حالة تعليمية"],
  patient: ["Real-patient boundary", "حدود المريض الحقيقي"],
};

export function ProductChat({ scope, locale, base }: ProductStudyProps) {
  const { state, update } = useProductServices();
  const requestedSession = useSearchParams().get("session");
  useEffect(() => {
    if (!requestedSession) return;
    const id = Number(requestedSession);
    update((current) =>
      current.sessions.some(
        (session) => session.scope === scope.unitId && session.id === id,
      ) && current.activeSessions[scope.unitId] !== id
        ? {
            ...current,
            activeSessions: { ...current.activeSessions, [scope.unitId]: id },
          }
        : current,
    );
  }, [requestedSession, scope.unitId, update]);
  const [sending, setSending] = useState<SampleAnswer | null>(null);
  const [notice, setNotice] = useState("");
  const [selectedEvidence, setEvidence] = useState<{
    answer: SampleAnswer;
    exchange: number;
    sessionId: number;
  } | null>(null);
  const [evidenceDialog, setEvidenceDialog] = useState(false);
  const [showHint, setShowHint] = useState(() => {
    if (state.evidenceHintSeen) return false;
    try {
      return (
        window.localStorage.getItem("unimind.citation-onboarding.v1") !== "seen"
      );
    } catch {
      return true;
    }
  });
  const studyOptions = useRef<HTMLDetailsElement>(null);
  useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    // The desktop summary is hidden, so the browser may move its focus to the
    // body before the change event runs; remember it until focus goes elsewhere.
    let summaryFocused = false;
    const track = (event: FocusEvent) => {
      summaryFocused =
        event.target === studyOptions.current?.querySelector("summary");
    };
    const adapt = () => {
      const options = studyOptions.current;
      if (!options) return;
      const summary = options.querySelector("summary");
      const active = document.activeElement;
      if (media.matches && active && options.contains(active)) summary?.focus();
      options.open = !media.matches;
      if (
        !media.matches &&
        (active === summary ||
          (summaryFocused && (active === null || active === document.body)))
      )
        options.querySelector<HTMLInputElement>("input:checked")?.focus();
    };
    adapt();
    document.addEventListener("focusin", track);
    media.addEventListener("change", adapt);
    return () => {
      document.removeEventListener("focusin", track);
      media.removeEventListener("change", adapt);
    };
  }, []);
  useEffect(() => {
    update((current) =>
      current.evidenceHintSeen
        ? current
        : { ...current, evidenceHintSeen: true },
    );
    try {
      window.localStorage.setItem("unimind.citation-onboarding.v1", "seen");
    } catch {
      /* Document-local fallback. */
    }
  }, [update]);
  const history = useRef<HTMLDetailsElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const t = useProductText(locale);
  const sessions = state.sessions.filter(
    (session) => session.scope === scope.unitId,
  );
  const selected = sessions.find(
    (session) => session.id === state.activeSessions[scope.unitId],
  );
  const evidence =
    selectedEvidence?.sessionId === selected?.id ? selectedEvidence : null;
  const key = `${scope.unitId}:${selected?.id ?? "new"}`;
  const savedDraft = state.chatDrafts[key] ?? { message: "", language: locale };
  const draft = {
    ...savedDraft,
    language: state.studyLanguage ?? savedDraft.language,
  };
  useEffect(() => {
    update((current) =>
      current.chatDrafts[key]
        ? current
        : {
            ...current,
            chatDrafts: {
              ...current.chatDrafts,
              [key]: { message: "", language: current.studyLanguage ?? locale },
            },
          },
    );
  }, [key, locale, update]);
  const setDraft = (patch: Partial<typeof draft>) =>
    update((current) => ({
      ...current,
      chatDrafts: { ...current.chatDrafts, [key]: { ...draft, ...patch } },
    }));
  const handoutAvailable =
    scope.unitId !== defaultScope.unitId || state.availability.sourceActive;

  useEffect(() => {
    if (!sending) return;
    const timer = setTimeout(() => {
      update((current) => ({
        ...current,
        sessions: current.sessions.map((session) =>
          session.id === sending.sessionId && session.scope === scope.unitId
            ? { ...session, answers: [...session.answers, sending] }
            : session,
        ),
        chatDrafts: {
          ...current.chatDrafts,
          [`${scope.unitId}:${sending.sessionId}`]: {
            message: "",
            language: sending.language,
          },
        },
      }));
      setSending(null);
      input.current?.focus({ preventScroll: true });
    }, 1000);
    return () => clearTimeout(timer);
  }, [sending, scope.unitId, update]);
  useEffect(() => {
    if (selected?.answers.length || sending)
      end.current?.scrollIntoView({ block: "nearest" });
  }, [selected?.answers.length, sending]);

  function inspect(answer: SampleAnswer, exchange: number, sessionId: number) {
    setEvidence({ answer, exchange, sessionId });
    setEvidenceDialog(true);
  }
  const sourceContent = evidence ? (
    <>
      <p className={styles.caption}>
        {t(
          "Sample excerpt · illustrative source locator",
          "نص تجريبي · موضع مصدر توضيحي",
        )}
      </p>
      {(evidence.answer.kind === "conflict"
        ? ["PDF", "AUDIO"]
        : evidence.answer.kind === "hint"
          ? ["AUDIO"]
          : ["PDF"]
      ).map((format) => (
        <section className={styles.excerpt} key={format}>
          <h3>
            {format === "AUDIO"
              ? t("Synthetic comparison recording", "تسجيل المقارنة التجريبي")
              : t("Synthetic sequence handout", "ملزمة الترتيب التجريبية")}
          </h3>
          <p>
            {format === "AUDIO"
              ? t("Sample timestamp 02:10", "توقيت تجريبي ٠٢:١٠")
              : t("Sample page 3", "صفحة تجريبية ٣")}
          </p>
          <blockquote>
            {format === "AUDIO"
              ? t(
                  "Compare first, then identify the labels.",
                  "قارن أولًا ثم حدد الأسماء.",
                )
              : t(
                  "Identify the labels, then compare the diagrams.",
                  "حدد الأسماء ثم قارن الرسوم.",
                )}
          </blockquote>
        </section>
      ))}
      <ProductLink
        href={`${base}/evidence?exchange=${evidence.exchange}&session=${evidence.sessionId}`}
        locale={locale}
      >
        {t("Open evidence details", "فتح تفاصيل الأدلة")}
      </ProductLink>
    </>
  ) : (
    <p>
      {t(
        "When an answer cites a source, inspect its excerpt without losing your question.",
        "عندما تستشهد الإجابة بمصدر، افحص النص دون فقدان سؤالك.",
      )}
    </p>
  );
  function start() {
    if (history.current) history.current.open = false;
    setEvidence(null);
    setEvidenceDialog(false);
    const id =
      state.sessions.reduce(
        (maximum, session) => Math.max(maximum, session.id),
        0,
      ) + 1;
    update((current) => ({
      ...current,
      sessions: [...current.sessions, { id, scope: scope.unitId, answers: [] }],
      activeSessions: { ...current.activeSessions, [scope.unitId]: id },
      chatDrafts: {
        ...current.chatDrafts,
        [`${scope.unitId}:${id}`]: { message: "", language: draft.language },
      },
    }));
    setSending(null);
    setNotice("");
    input.current?.focus({ preventScroll: true });
    return id;
  }
  function send() {
    if (sending || !draft.message.trim()) return;
    const promptKind = (Object.entries(promptExamples).find(([, prompts]) =>
      prompts.some(
        (prompt) => prompt.toLowerCase() === draft.message.trim().toLowerCase(),
      ),
    )?.[0] ?? "unmatched") as ResponseKind | "unmatched";
    const kind = promptKind === "unmatched" ? "unavailable" : promptKind;
    const id = selected?.id ?? start();
    // Only fixture classification is retained as an exchange. Typed text is a
    // document-local draft; it never enters logs, storage, fetch or an answer.
    update((current) => {
      const chatDrafts = { ...current.chatDrafts };
      delete chatDrafts[`${scope.unitId}:new`];
      chatDrafts[`${scope.unitId}:${id}`] = draft;
      return { ...current, chatDrafts };
    });
    setNotice("");
    setSending({
      kind:
        !handoutAvailable && !["patient", "hint"].includes(kind)
          ? "unavailable"
          : kind,
      promptKind,
      language: draft.language,
      sessionId: id,
      sharing: state.sharing,
    });
  }
  return (
    <div className={styles.chatLayout}>
      <div className={styles.conversation}>
        <div className={styles.sectionHeading} data-workspace-chrome>
          <h2 className={styles.chatHeading}>{t("Chat", "المحادثة")}</h2>
          <div className={styles.chatTools}>
            <details
              ref={history}
              className={styles.history}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
            >
              <summary
                aria-label={t("Sessions and privacy", "الجلسات والخصوصية")}
              >
                {t("Sessions", "الجلسات")}
              </summary>
              <div>
                <Button onClick={start} disabled={sending !== null}>
                  <FrontendIcon name="plus" />
                  {t("New session", "جلسة جديدة")}
                </Button>
                <ProductLink href="/settings?section=privacy" locale={locale}>
                  <FrontendIcon name="settings" />
                  {t("Privacy settings", "إعدادات الخصوصية")}
                </ProductLink>
                <details className={styles.historyList} open>
                  <summary>
                    {t(
                      `Sessions in this ${scope.unitLabelSingularEn.toLowerCase()}`,
                      `جلسات ${scope.unitLabelSingularAr}`,
                    )}{" "}
                    · {new Intl.NumberFormat(locale).format(sessions.length)}
                  </summary>
                  {sessions.length ? (
                    <ul>
                      {sessions.map((session) => (
                        <li key={session.id}>
                          <button
                            type="button"
                            aria-pressed={selected?.id === session.id}
                            onClick={() => {
                              if (history.current) history.current.open = false;
                              update((current) => ({
                                ...current,
                                activeSessions: {
                                  ...current.activeSessions,
                                  [scope.unitId]: session.id,
                                },
                              }));
                              setSending(null);
                              setNotice("");
                              setEvidence(null);
                              setEvidenceDialog(false);
                            }}
                          >
                            <bdi>{conversationTitle(session, locale)}</bdi>
                            <span>
                              {t("Session", "جلسة")}{" "}
                              {new Intl.NumberFormat(locale).format(session.id)}
                            </span>
                            <span>
                              {t("Replies", "الإجابات")} ·{" "}
                              {new Intl.NumberFormat(locale).format(
                                session.answers.length,
                              )}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {t(
                        "Your first message starts a session here.",
                        "أول رسالة تبدأ جلسة هنا.",
                      )}
                    </p>
                  )}
                </details>
              </div>
            </details>
            <span className={styles.desktopSources}>
              <ProductLink href={base + "/sources"} locale={locale}>
                <FrontendIcon name="sources" />
                {t(
                  `${scope.unitLabelSingularEn} sources`,
                  `مصادر ${scope.unitLabelSingularAr}`,
                )}
              </ProductLink>
            </span>
          </div>
          <details
            ref={studyOptions}
            open
            className={styles.studyOptions}
            onKeyDown={(event) => {
              if (
                event.key === "Escape" &&
                window.matchMedia("(max-width: 767px)").matches &&
                event.currentTarget.open
              ) {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
                event.stopPropagation();
              }
            }}
          >
            <summary>{t("Study options", "خيارات المذاكرة")}</summary>
            <div className={styles.chatPreferences}>
              <span className={styles.phoneSources}>
                <ProductLink href={base + "/sources"} locale={locale}>
                  <FrontendIcon name="sources" />
                  {t(
                    `${scope.unitLabelSingularEn} sources`,
                    `مصادر ${scope.unitLabelSingularAr}`,
                  )}
                </ProductLink>
              </span>
              <ChoiceGroup
                label={t("Study language", "لغة المذاكرة")}
                value={draft.language}
                disabled={sending !== null}
                options={[
                  ["en", t("English", "الإنجليزية")],
                  ["ar", t("Arabic", "العربية")],
                  [
                    "mixed",
                    t("Mixed Arabic and English", "عربي وإنجليزي مختلط"),
                  ],
                ]}
                onChange={(value) =>
                  update((current) => ({
                    ...current,
                    studyLanguage: value as "en" | "ar" | "mixed",
                  }))
                }
              />
            </div>
          </details>
          {showHint ? (
            <aside
              className={styles.evidenceTip}
              aria-label={t("Citation help", "مساعدة الاستشهادات")}
            >
              <p>
                {t(
                  "Click a citation below an answer to read the source passage.",
                  "اضغط على الاستشهاد أسفل الإجابة لقراءة نص المصدر.",
                )}
              </p>
              <button type="button" onClick={() => setShowHint(false)}>
                {t("Got it", "فهمت")}
              </button>
            </aside>
          ) : null}
        </div>
        <section
          className={styles.transcript}
          aria-label={t("Conversation", "المحادثة الحالية")}
        >
          {!selected?.answers.length && !sending ? (
            <div className={styles.chatEmpty}>
              <FrontendIcon name="chat" />
              <h3>
                {t("What would you like to understand?", "ما الذي تريد فهمه؟")}
              </h3>
              <p>
                {t(
                  `Ask about this ${scope.unitLabelSingularEn.toLowerCase()}’s sources. Missing evidence and disagreements stay visible.`,
                  `اسأل عن مصادر ${scope.unitLabelSingularAr}. تظهر المعلومات الناقصة والتعارضات بوضوح.`,
                )}
              </p>
              <div className={styles.suggestions}>
                {(["supported", "conflict", "unavailable"] as const).map(
                  (kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => {
                        setDraft({
                          message: text(promptExamples[kind], locale),
                        });
                        input.current?.focus({ preventScroll: true });
                      }}
                    >
                      {kind === "supported"
                        ? t("Explain the study sequence", "اشرح ترتيب المذاكرة")
                        : kind === "conflict"
                          ? t("Compare the two sources", "قارن المصدرين")
                          : t("Find what’s missing", "ما المعلومات الناقصة؟")}
                    </button>
                  ),
                )}
              </div>
              <p className={styles.caption}>
                {t(
                  "Try a supplied sample question. Replies are fixed examples.",
                  "جرب سؤالًا من الأمثلة المرفقة. الإجابات أمثلة ثابتة.",
                )}
              </p>
            </div>
          ) : null}
          {selected?.answers.map((answer, index) => (
            <article
              className={styles.exchange}
              key={index}
              id={`exchange-${index + 1}`}
            >
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
                      <bdi lang="en">Synthetic source · study sequence</bdi>
                    </>
                  ) : null}
                </p>
                {answer.kind === "unavailable" ? (
                  <div>
                    <p>
                      {handoutAvailable
                        ? answer.promptKind &&
                          !["unavailable", "unmatched"].includes(
                            answer.promptKind,
                          )
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
                      </summary>
                      <ul>
                        {handoutAvailable ? (
                          <li>
                            <bdi>{text(promptExamples.supported, locale)}</bdi>
                          </li>
                        ) : null}
                        <li>
                          <bdi>{text(promptExamples.hint, locale)}</bdi>
                        </li>
                      </ul>
                      <p>
                        {t(
                          "You can copy a question into Message. Your current draft stays unchanged.",
                          "يمكنك نسخ سؤال إلى خانة السؤال. مسودتك الحالية تبقى كما هي.",
                        )}
                      </p>
                    </details>
                    <ProductLink href={base} locale={locale}>
                      {t(
                        "View available materials",
                        "عرض مصادر المذاكرة المتاحة",
                      )}
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
                    </summary>
                    <p>
                      {t(
                        "Inspect both excerpts, then copy this question if you want to ask for clarification. Nothing is sent from here.",
                        "افحص النصين، ثم انسخ هذا السؤال إن أردت طلب توضيح. لا يُرسل شيء من هنا.",
                      )}
                    </p>
                    <div className={productStyles.field}>
                      <label
                        htmlFor={`conflict-clarification-${selected.id}-${index + 1}`}
                      >
                        {t("Clarification question", "سؤال التوضيح")}
                      </label>
                      <textarea
                        id={`conflict-clarification-${selected.id}-${index + 1}`}
                        readOnly
                        rows={4}
                        lang={locale}
                        dir={locale === "ar" ? "rtl" : "ltr"}
                        value={t(
                          `The handout places identification before comparison, but the recording places comparison first. Which sequence should I follow for this ${scope.unitLabelSingularEn.toLowerCase()}, and is there an approved source resolving the difference?`,
                          `الملزمة تضع التحديد قبل المقارنة، لكن التسجيل يضع المقارنة أولًا. أي ترتيب أتبع في ${scope.unitLabelSingularAr}، وهل يوجد مصدر معتمد يحسم الاختلاف؟`,
                        )}
                      />
                    </div>
                  </details>
                ) : null}
                <div className={styles.replyActions}>
                  {!["unavailable", "patient"].includes(answer.kind) ? (
                    <button
                      type="button"
                      className={styles.citation}
                      onClick={() => inspect(answer, index + 1, selected.id)}
                    >
                      <FrontendIcon name="sources" />
                      {answer.kind === "hint"
                        ? t("Recording · 02:10", "التسجيل · ٠٢:١٠")
                        : answer.kind === "conflict"
                          ? t("Two source excerpts", "نصان من مصدرين")
                          : t("Handout · p. 3", "الملزمة · ص ٣")}
                    </button>
                  ) : null}
                  <ProductLink
                    href={`${base}/evidence?exchange=${index + 1}&session=${selected.id}`}
                    locale={locale}
                  >
                    <FrontendIcon name="sources" />
                    {t("Inspect evidence", "فحص الأدلة")}
                  </ProductLink>
                  <ProductLink
                    href={`${base}/report?exchange=${index + 1}&session=${selected.id}`}
                    locale={locale}
                  >
                    {t("Report example", "الإبلاغ عن المثال")}
                  </ProductLink>
                  <span>
                    {answer.sharing === "private"
                      ? t("Private", "خاص")
                      : t("Shared", "مشارك")}
                  </span>
                </div>
              </div>
            </article>
          ))}
          {sending ? (
            <div className={styles.streaming} role="status">
              <strong>
                {t(
                  "Simulated stream · sample passage being revealed…",
                  "بث محاكى · إظهار نص المثال…",
                )}
              </strong>
              <p>
                {
                  text(
                    answerExamples[sending.kind],
                    sending.language === "ar" ? "ar" : "en",
                  ).split(".")[0]
                }
                …
              </p>
            </div>
          ) : null}
          <div ref={end} />
        </section>
        <form
          className={styles.composer}
          data-workspace-chrome
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <label htmlFor="message">{t("Message", "السؤال")}</label>
          <textarea
            ref={input}
            id="message"
            name="message"
            dir="auto"
            rows={2}
            maxLength={1000}
            autoComplete="off"
            placeholder={t(
              `Ask about this ${scope.unitLabelSingularEn.toLowerCase()}…`,
              `اسأل عن ${scope.unitLabelSingularAr}…`,
            )}
            value={draft.message}
            onChange={(event) => setDraft({ message: event.target.value })}
            readOnly={sending !== null}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                send();
              }
            }}
          />
          <div className={styles.composerTools}>
            {sending ? (
              <Button
                key="cancel"
                onClick={() => {
                  setSending(null);
                  setNotice(
                    t(
                      "Sample stream cancelled. Send again to retry.",
                      "تم إلغاء بث المثال. أرسل مجددًا للمحاولة.",
                    ),
                  );
                  input.current?.focus({ preventScroll: true });
                }}
              >
                {t("Cancel stream", "إلغاء البث")}
              </Button>
            ) : (
              <Button
                key="send"
                primary
                type="submit"
                disabled={!draft.message.trim()}
              >
                <FrontendIcon name="send" />
                {t("Send", "إرسال")}
              </Button>
            )}
          </div>
          <p className={styles.composerMeta}>
            <strong>
              {state.sharing === "private"
                ? t("Private for future exchanges", "المحادثات القادمة خاصة")
                : t("Founder-visible by default", "ظاهر للمؤسسين افتراضيًا")}
            </strong>
            <span>
              {t(
                "Enter to send; Shift+Enter for a new line",
                "Enter للإرسال؛ Shift+Enter لسطر جديد",
              )}
            </span>
          </p>
        </form>
        {notice ? <Notice>{notice}</Notice> : null}
      </div>

      <ProductDialog
        open={!!evidence && evidenceDialog}
        title={t("Source excerpt", "نص المصدر")}
        closeLabel={t("Close", "إغلاق")}
        onClose={() => {
          setEvidenceDialog(false);
          setEvidence(null);
        }}
      >
        {sourceContent}
      </ProductDialog>
    </div>
  );
}
