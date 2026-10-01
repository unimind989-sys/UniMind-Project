"use client";

import { useEffect, useRef, useState } from "react";
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
} from "@/app/_components/synthetic-fixtures";
import type { ProductStudyProps } from "./product-study";
import styles from "./product-study.module.css";

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
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const sessions = state.sessions.filter(
    (session) => session.scope === scope.unitId,
  );
  const selected = sessions.find(
    (session) => session.id === state.activeSessions[scope.unitId],
  );
  const key = `${scope.unitId}:${selected?.id ?? "new"}`;
  const draft = state.chatDrafts[key] ?? { message: "", language: locale };
  useEffect(() => {
    update((current) =>
      current.chatDrafts[key]
        ? current
        : {
            ...current,
            chatDrafts: {
              ...current.chatDrafts,
              [key]: { message: "", language: locale },
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
      <aside
        className={styles.history}
        aria-label={t("Unit sessions", "جلسات الوحدة")}
      >
        <Button onClick={start} disabled={sending !== null}>
          <FrontendIcon name="plus" />
          {t("New session", "جلسة جديدة")}
        </Button>
        <details className={styles.historyList} open>
          <summary>
            {t("Sessions in this unit", "جلسات هذه الوحدة")} ·{" "}
            {new Intl.NumberFormat(locale).format(sessions.length)}
          </summary>
          {sessions.length ? (
            <ul>
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    aria-pressed={selected?.id === session.id}
                    onClick={() => {
                      update((current) => ({
                        ...current,
                        activeSessions: {
                          ...current.activeSessions,
                          [scope.unitId]: session.id,
                        },
                      }));
                      setSending(null);
                      setNotice("");
                    }}
                  >
                    {t("Session", "جلسة")}{" "}
                    {new Intl.NumberFormat(locale).format(session.id)}
                    <span>
                      {new Intl.NumberFormat(locale).format(
                        session.answers.length,
                      )}{" "}
                      {t("replies", "إجابات")}
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
        <ProductLink href="/settings" locale={locale}>
          <FrontendIcon name="settings" />
          {t("Privacy settings", "إعدادات الخصوصية")}
        </ProductLink>
      </aside>
      <div className={styles.conversation}>
        <div className={styles.sectionHeading}>
          <h2>{t("Chat", "المحادثة")}</h2>
          <ProductLink href={base + "/sources"} locale={locale}>
            <FrontendIcon name="sources" />
            {t("Unit sources", "مصادر الوحدة")}
          </ProductLink>
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
                  "Ask about this unit’s sources. Missing evidence and disagreements stay visible.",
                  "اسأل عن مصادر هذه الوحدة. تظهر المعلومات الناقصة والتعارضات بوضوح.",
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
                <div className={styles.replyActions}>
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
            rows={3}
            maxLength={1000}
            autoComplete="off"
            placeholder={t("Ask about your unit…", "اسأل عن وحدتك…")}
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
            <label htmlFor="study-language">
              {t("Study language", "لغة المذاكرة")}
              <select
                id="study-language"
                name="study-language"
                aria-label={t("Study language", "لغة المذاكرة")}
                value={draft.language}
                disabled={sending !== null}
                onChange={(event) =>
                  setDraft({
                    language: event.target.value as typeof draft.language,
                  })
                }
              >
                <option value="en">{t("English", "الإنجليزية")}</option>
                <option value="ar">{t("Arabic", "العربية")}</option>
                <option value="mixed">
                  {t("Mixed Arabic and English", "عربي وإنجليزي مختلط")}
                </option>
              </select>
            </label>
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
          <p className={styles.caption}>
            {state.sharing === "private"
              ? t("Private for future exchanges", "المحادثات القادمة خاصة")
              : t("Founder-visible by default", "ظاهر للمؤسسين افتراضيًا")}{" "}
            ·{" "}
            {t(
              "Enter to send; Shift+Enter for a new line",
              "Enter للإرسال؛ Shift+Enter لسطر جديد",
            )}
          </p>
        </form>
        {notice ? <Notice>{notice}</Notice> : null}
      </div>
    </div>
  );
}
