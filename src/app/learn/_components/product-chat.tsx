"use client";
import { useProductText } from "@/app/_components/product-copy";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import { useOptionalProductServices } from "@/app/_components/product-services";
import { Notice } from "@/app/_components/notice";
import { ProductLink } from "@/app/_components/product-ui";
import { useHostedSynthetic } from "@/app/_components/product-navigation";
import { FrontendIcon, useUnitMenu } from "@/app/_components/frontend-system";
import { useKeyboardScroll } from "@/app/_components/use-keyboard-scroll";
import {
  answerExamples,
  defaultScope,
  promptExamples,
  text,
  type ResponseKind,
  type SampleAnswer,
} from "@/lib/demo/synthetic-fixtures.application";
import { ProductDialog } from "@/app/_components/product-dialog";
import type { ProductStudyProps } from "./study/study-props";
import { ChatExchange } from "./study/chat-exchange";
import { ChatComposer, type AnswerLanguage } from "./study/chat-composer";
import {
  ChatSessionsMenu,
  type ChatSessionView,
} from "./study/chat-sessions-menu";
import { useLiveStudy } from "./study/live-study";
import { conversationTitle } from "@/lib/study/recent-work.application";
import styles from "./product-chat.module.css";

const hintKey = "unimind.citation-onboarding.v1";

/**
 * Chat for one unit. Synthetic sessions and fixed sample replies live in the
 * tab store. Real routes list the student's own sessions and start new ones
 * through the authorized Server Action; answering is not available yet, so
 * the composer is disabled there. The session menu lives in the unit band.
 */
export function ProductChat({ scope, locale, base }: ProductStudyProps) {
  const liveChat = useLiveStudy()?.chat;
  const services = useOptionalProductServices();
  const state = services?.state;
  const update = services?.update;
  const answering = !liveChat && state !== undefined;
  const hosted = useHostedSynthetic();
  const unitMenu = useUnitMenu();
  const requestedSession = useSearchParams().get("session");
  useEffect(() => {
    if (!requestedSession || !update) return;
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
  // The first-visit citation tip (IX-21): storage is read when the student
  // first sends (never during render); the tip shows under the first cited
  // answer and is then remembered as seen.
  const [tip, setTip] = useState<"hidden" | "select" | "tap">("hidden");
  const tipChecked = useRef(false);
  function checkTip() {
    if (tipChecked.current || state?.evidenceHintSeen) return;
    tipChecked.current = true;
    let seen = false;
    try {
      seen = window.localStorage.getItem(hintKey) === "seen";
    } catch {
      /* Storage denied: show the tip for this document only. */
    }
    if (!seen)
      setTip(window.matchMedia("(pointer: coarse)").matches ? "tap" : "select");
  }
  const input = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  // The conversation is the scroll owner; with nothing focusable inside
  // (Chat before answers launch), it takes focus itself so keys scroll it.
  const transcript = useKeyboardScroll<HTMLElement>();
  const t = useProductText(locale);
  const sessions: readonly (ChatSessionView & {
    answers: readonly SampleAnswer[];
  })[] = liveChat
    ? liveChat.sessions.map((session, index, all) => ({
        id: session.id,
        number: all.length - index,
        title: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(session.createdAt)),
        replies: 0,
        answers: [],
      }))
    : (state?.sessions ?? [])
        .filter((session) => session.scope === scope.unitId)
        .map((session) => ({
          id: String(session.id),
          number: session.id,
          title: conversationTitle(session, locale),
          replies: session.answers.length,
          answers: session.answers,
        }));
  const selectedId = liveChat
    ? (liveChat.selectedSessionId ?? undefined)
    : String(state?.activeSessions[scope.unitId] ?? "");
  const selected = sessions.find((session) => session.id === selectedId);
  const setLine = unitMenu?.setLine;
  useEffect(() => {
    setLine?.(selected?.title ?? null);
  }, [setLine, selected?.title]);
  useEffect(() => () => setLine?.(null), [setLine]);
  const evidence =
    selectedEvidence?.sessionId === selected?.number ? selectedEvidence : null;
  const key = `${scope.unitId}:${selected?.number ?? "new"}`;
  const [liveDraft, setLiveDraft] = useState<{
    message: string;
    language: AnswerLanguage;
  }>({ message: "", language: locale });
  const savedDraft = state
    ? (state.chatDrafts[key] ?? { message: "", language: locale })
    : liveDraft;
  const draft = {
    ...savedDraft,
    language: state?.studyLanguage ?? savedDraft.language,
  };
  useEffect(() => {
    update?.((current) =>
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
    update
      ? update((current) => ({
          ...current,
          chatDrafts: { ...current.chatDrafts, [key]: { ...draft, ...patch } },
        }))
      : setLiveDraft({ ...draft, ...patch });
  const fillQuestion = answering
    ? (question: string) => {
        setDraft({ message: question });
        input.current?.focus({ preventScroll: true });
      }
    : undefined;
  const handoutAvailable =
    scope.unitId !== defaultScope.unitId ||
    state?.availability.sourceActive === true;
  const tipExchange =
    tip === "hidden"
      ? -1
      : (selected?.answers.findIndex(
          (answer) => !["unavailable", "patient"].includes(answer.kind),
        ) ?? -1);
  useEffect(() => {
    if (tipExchange < 0) return;
    update?.((current) =>
      current.evidenceHintSeen
        ? current
        : { ...current, evidenceHintSeen: true },
    );
    try {
      window.localStorage.setItem(hintKey, "seen");
    } catch {
      /* Document-local fallback. */
    }
  }, [tipExchange, update]);

  useEffect(() => {
    if (!sending || !update) return;
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
              ? t("Practical 3 recording", "تسجيل العملي 3")
              : t("Lecture 6 handout", "ملزمة المحاضرة 6")}
          </h3>
          <p>
            {format === "AUDIO"
              ? t("Timestamp 18:42", "التوقيت ١٨:٤٢")
              : t("Page 14", "صفحة ١٤")}
          </p>
          <blockquote>
            {format === "AUDIO"
              ? t(
                  "Count the roots first. In some people the plexus is prefixed and takes a branch from C4, so check before you name the trunks.",
                  "عُدّ الجذور أولًا. في بعض الناس تكون الضفيرة متقدمة وتأخذ فرعًا من C4، فتأكد قبل أن تسمي الجذوع.",
                )
              : t(
                  "Injury to the upper trunk (C5, C6) produces Erb–Duchenne paralysis, commonly from excessive separation of the head and shoulder. The plexus is formed by the ventral rami of C5 to T1.",
                  "إصابة الجذع العلوي (C5 وC6) تسبب شلل إرب-دوشين، غالبًا من المباعدة الشديدة بين الرأس والكتف. تتكون الضفيرة من الفروع الأمامية للأعصاب من C5 إلى T1.",
                )}
          </blockquote>
        </section>
      ))}
      <div className={styles.sheetActions}>
        <ProductLink
          href={`${base}/evidence?exchange=${evidence.exchange}&session=${evidence.sessionId}`}
          locale={locale}
        >
          {t("Open evidence details", "فتح تفاصيل الأدلة")}
        </ProductLink>
        <ProductLink href={base + "/sources"} locale={locale} variant="quiet">
          {t("Browse material library", "تصفح مكتبة المصادر")}
        </ProductLink>
      </div>
    </>
  ) : null;
  function select(session: ChatSessionView) {
    setSending(null);
    setNotice("");
    setEvidence(null);
    setEvidenceDialog(false);
    // Real sessions are links: the router follows them.
    unitMenu?.close(!liveChat);
    if (liveChat) return;
    update?.((current) => ({
      ...current,
      activeSessions: {
        ...current.activeSessions,
        [scope.unitId]: session.number,
      },
    }));
  }
  function start() {
    if (!state || !update) return 0;
    unitMenu?.close();
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
    if (!state || !update || sending || !draft.message.trim()) return;
    const promptKind = (Object.entries(promptExamples).find(([, prompts]) =>
      prompts.some(
        (prompt) => prompt.toLowerCase() === draft.message.trim().toLowerCase(),
      ),
    )?.[0] ?? "unmatched") as ResponseKind | "unmatched";
    const kind = promptKind === "unmatched" ? "unavailable" : promptKind;
    const id = selected?.number ?? start();
    // Only fixture classification is retained as an exchange. Typed text is a
    // document-local draft; it never enters logs, storage, fetch or an answer.
    update((current) => {
      const chatDrafts = { ...current.chatDrafts };
      delete chatDrafts[`${scope.unitId}:new`];
      chatDrafts[`${scope.unitId}:${id}`] = draft;
      return { ...current, chatDrafts };
    });
    setNotice("");
    checkTip();
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
      {unitMenu?.panel
        ? createPortal(
            <ChatSessionsMenu
              locale={locale}
              scope={scope}
              base={base}
              sessions={sessions}
              selectedId={selected?.id}
              answering={answering}
              sending={sending !== null}
              startAction={liveChat?.startAction}
              onStart={start}
              onSelect={select}
            />,
            unitMenu.panel,
          )
        : null}
      <div className={styles.conversation}>
        <h2 className="visually-hidden">{t("Chat", "المحادثة")}</h2>
        <section
          ref={transcript}
          className={styles.transcript}
          aria-label={t("Conversation", "المحادثة الحالية")}
        >
          {!selected?.answers.length && !sending ? (
            <div className={styles.chatEmpty}>
              <FrontendIcon name="chat" size={24} />
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
                      disabled={!answering}
                      onClick={() =>
                        fillQuestion?.(text(promptExamples[kind], locale))
                      }
                    >
                      {kind === "supported"
                        ? t("Upper trunk injury", "إصابة الجذع العلوي")
                        : kind === "conflict"
                          ? t("Roots of the plexus", "جذور الضفيرة")
                          : t("What isn’t covered", "ما الذي لا تغطيه المواد؟")}
                    </button>
                  ),
                )}
              </div>
              {answering && hosted ? null : (
                <p className={styles.caption}>
                  {answering
                    ? t(
                        "Try a supplied sample question. Replies are fixed examples.",
                        "جرب سؤالًا من الأمثلة المرفقة. الإجابات أمثلة ثابتة.",
                      )
                    : t(
                        "Chat answers are not available yet. Answers will use only approved materials when Chat launches.",
                        "إجابات المحادثة غير متاحة بعد. ستعتمد الإجابات على المصادر المعتمدة فقط عند إطلاق المحادثة.",
                      )}
                </p>
              )}
            </div>
          ) : null}
          {selected?.answers.map((answer, index) => (
            <ChatExchange
              key={index}
              answer={answer}
              exchange={index + 1}
              sessionNumber={selected.number}
              scope={scope}
              locale={locale}
              base={base}
              handoutAvailable={handoutAvailable}
              currentSharing={state?.sharing}
              onInspect={() => inspect(answer, index + 1, selected.number)}
              onUseQuestion={fillQuestion}
              tip={
                index === tipExchange ? (
                  <aside
                    className={styles.evidenceTip}
                    aria-label={t("Citation help", "مساعدة الاستشهادات")}
                  >
                    <p>
                      {tip === "tap"
                        ? t(
                            "Tap a citation to read its source passage.",
                            "المس الاستشهاد لقراءة نص المصدر.",
                          )
                        : t(
                            "Select a citation to read its source passage.",
                            "اختر الاستشهاد لقراءة نص المصدر.",
                          )}
                    </p>
                    <button type="button" onClick={() => setTip("hidden")}>
                      {t("Got it", "فهمت")}
                    </button>
                  </aside>
                ) : null
              }
            />
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
        <ChatComposer
          locale={locale}
          scope={scope}
          input={input}
          message={draft.message}
          language={draft.language}
          answering={answering}
          sending={sending !== null}
          sharing={state?.sharing}
          onMessage={(message) => setDraft({ message })}
          onLanguage={(language) =>
            update?.((current) => ({ ...current, studyLanguage: language }))
          }
          onSend={send}
          onCancel={() => {
            setSending(null);
            setNotice(
              t(
                "Sample stream cancelled. Send again to retry.",
                "تم إلغاء بث المثال. أرسل مجددًا للمحاولة.",
              ),
            );
            input.current?.focus({ preventScroll: true });
          }}
        />
        {notice ? (
          <Notice live locale={locale}>
            {notice}
          </Notice>
        ) : null}
      </div>

      <ProductDialog
        open={!!evidence && evidenceDialog}
        title={t("Source excerpt", "نص المصدر")}
        closeLabel={t("Close", "إغلاق")}
        presentation="sheet"
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
