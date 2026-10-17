"use client";
import { useProductText } from "@/app/_components/product-copy";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useOptionalProductServices } from "@/app/_components/product-services";
import { useProductRouter } from "@/app/_components/product-navigation";
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
import type { ProductStudyProps } from "./study/study-props";
import { ChatExchange } from "./study/chat-exchange";
import { useLiveStudy } from "./study/live-study";
import { conversationTitle } from "@/lib/study/recent-work.application";
import styles from "./product-chat.module.css";

/** A chat session as the conversation view shows it, in either mode. */
type ChatSessionView = {
  id: string;
  number: number;
  title: string;
  answers: readonly SampleAnswer[];
};

/**
 * Chat for one unit. Synthetic sessions and fixed sample replies live in the
 * tab store. Real routes list the student's own sessions and start new ones
 * through the authorized Server Action; answering is not available yet, so
 * the composer is disabled there.
 */
export function ProductChat({ scope, locale, base }: ProductStudyProps) {
  const liveChat = useLiveStudy()?.chat;
  const services = useOptionalProductServices();
  const state = services?.state;
  const update = services?.update;
  const answering = !liveChat && state !== undefined;
  const router = useProductRouter();
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
  const [showHint, setShowHint] = useState(() => {
    if (state?.evidenceHintSeen) return false;
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
    update?.((current) =>
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
  const sessions: readonly ChatSessionView[] = liveChat
    ? liveChat.sessions.map((session, index, all) => ({
        id: session.id,
        number: all.length - index,
        title: new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(session.createdAt)),
        answers: [],
      }))
    : (state?.sessions ?? [])
        .filter((session) => session.scope === scope.unitId)
        .map((session) => ({
          id: String(session.id),
          number: session.id,
          title: conversationTitle(session, locale),
          answers: session.answers,
        }));
  const selectedId = liveChat
    ? liveChat.selectedSessionId
    : String(state?.activeSessions[scope.unitId] ?? "");
  const selected = sessions.find((session) => session.id === selectedId);
  const evidence =
    selectedEvidence?.sessionId === selected?.number ? selectedEvidence : null;
  const key = `${scope.unitId}:${selected?.number ?? "new"}`;
  const [liveDraft, setLiveDraft] = useState<{
    message: string;
    language: "en" | "ar" | "mixed";
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
  const handoutAvailable =
    scope.unitId !== defaultScope.unitId ||
    state?.availability.sourceActive === true;

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
  function select(session: ChatSessionView) {
    if (history.current) history.current.open = false;
    setSending(null);
    setNotice("");
    setEvidence(null);
    setEvidenceDialog(false);
    if (liveChat) {
      router.push(
        `${base}/chat?lang=${locale}&session=${encodeURIComponent(session.id)}` as Route,
      );
      return;
    }
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
                {liveChat ? (
                  // A real form, so the Server Action re-authorizes the scope
                  // and its redirect or not-found applies as a navigation.
                  <form
                    action={liveChat.startAction}
                    className={styles.sessionForm}
                  >
                    <input
                      type="hidden"
                      name="cohortId"
                      value={scope.cohortId}
                    />
                    <input type="hidden" name="unitId" value={scope.unitId} />
                    <input type="hidden" name="locale" value={locale} />
                    <Button type="submit">
                      <FrontendIcon name="plus" />
                      {t("New session", "جلسة جديدة")}
                    </Button>
                  </form>
                ) : (
                  <Button onClick={start} disabled={sending !== null}>
                    <FrontendIcon name="plus" />
                    {t("New session", "جلسة جديدة")}
                  </Button>
                )}
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
                            onClick={() => select(session)}
                          >
                            <bdi>{session.title}</bdi>
                            <span>
                              {t("Session", "جلسة")}{" "}
                              {new Intl.NumberFormat(locale).format(
                                session.number,
                              )}
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
                      {answering
                        ? t(
                            "Your first message starts a session here.",
                            "أول رسالة تبدأ جلسة هنا.",
                          )
                        : t(
                            "Start a session to keep your study here.",
                            "ابدأ جلسة للاحتفاظ بمذاكرتك هنا.",
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
                disabled={sending !== null || !answering}
                options={[
                  ["en", t("English", "الإنجليزية")],
                  ["ar", t("Arabic", "العربية")],
                  [
                    "mixed",
                    t("Mixed Arabic and English", "عربي وإنجليزي مختلط"),
                  ],
                ]}
                onChange={(value) =>
                  update?.((current) => ({
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
                      disabled={!answering}
                      onClick={() => {
                        setDraft({
                          message: text(promptExamples[kind], locale),
                        });
                        input.current?.focus({ preventScroll: true });
                      }}
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
              onInspect={() => inspect(answer, index + 1, selected.number)}
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
            disabled={!answering}
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
                disabled={!answering || !draft.message.trim()}
              >
                <FrontendIcon name="send" />
                {t("Send", "إرسال")}
              </Button>
            )}
          </div>
          <p className={styles.composerMeta}>
            {answering ? (
              <>
                <strong>
                  {state?.sharing === "private"
                    ? t(
                        "Private for future exchanges",
                        "المحادثات القادمة خاصة",
                      )
                    : t(
                        "Visible to UniMind’s founders",
                        "ظاهرة لمؤسسي UniMind",
                      )}
                </strong>
                <span>
                  {t(
                    "Enter to send; Shift+Enter for a new line",
                    "Enter للإرسال؛ Shift+Enter لسطر جديد",
                  )}
                </span>
              </>
            ) : (
              <strong>
                {t("Answers are not available yet", "الإجابات غير متاحة بعد")}
              </strong>
            )}
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
