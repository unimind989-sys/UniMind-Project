"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n/locale";
import workspace from "./landing-workspace.module.css";

const views = ["chat", "studio", "quiz"] as const;
type View = (typeof views)[number];

/** A local sample of the study workspace: nothing is generated or saved. */
export function WorkspacePreview({ locale }: { locale: Locale }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [view, setView] = useState<View>("chat");
  const [sourceOpen, setSourceOpen] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const labels = {
    chat: t("Chat", "الدردشة"),
    studio: t("Studio", "الاستوديو"),
    quiz: t("Quiz", "الاختبار"),
  };
  function navigateTabs(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let target: number;
    if (event.key === "Home") target = 0;
    else if (event.key === "End") target = views.length - 1;
    else if (event.key === "ArrowRight")
      target = (index + (locale === "ar" ? 2 : 1)) % views.length;
    else if (event.key === "ArrowLeft")
      target = (index + (locale === "ar" ? 1 : 2)) % views.length;
    else return;
    event.preventDefault();
    setView(views[target]!);
    tabs.current[target]?.focus();
  }
  return (
    <div className={workspace.window}>
      <div className={workspace.band}>
        <div className={workspace.subject}>
          <p className={workspace.subjectTitle}>
            {t("Anatomy", "علم التشريح")}
          </p>
          <p className={workspace.subjectMeta}>
            {t(
              "Year 1, Term 1. Sample subject",
              "السنة الأولى، الفصل الأول. مادة تجريبية",
            )}
          </p>
        </div>
        <div
          className={workspace.tabs}
          role="tablist"
          aria-label={t("Explore the study tools", "اكتشف أدوات المذاكرة")}
        >
          {views.map((item, index) => (
            <button
              key={item}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              id={"preview-tab-" + item}
              type="button"
              role="tab"
              aria-selected={view === item}
              aria-controls="preview-panel"
              tabIndex={view === item ? 0 : -1}
              onClick={() => setView(item)}
              onKeyDown={(event) => navigateTabs(event, index)}
            >
              {labels[item]}
            </button>
          ))}
        </div>
      </div>
      <div className={workspace.body}>
        <aside
          className={workspace.materials}
          aria-label={t("Sample materials", "المواد التجريبية")}
        >
          <h3>{t("Materials", "المواد")}</h3>
          <ul>
            {[
              ["Lecture 6 handout", t("PDF, 22 pages", "ملف PDF، 22 صفحة")],
              [
                "Practical 3 recording",
                t("Recording, 46 minutes", "تسجيل، 46 دقيقة"),
              ],
              [
                "Dr. Hala Mansour",
                t("Voice note, exam emphasis", "ملاحظة صوتية، تركيز امتحاني"),
              ],
            ].map(([title, description]) => (
              <li key={title}>
                <strong lang="en" dir="ltr">
                  {title}
                </strong>
                <span>{description}</span>
              </li>
            ))}
          </ul>
          <p>
            {t(
              "Chat, Studio and Quiz all use these three sources.",
              "الدردشة والاستوديو والاختبار تستخدم هذه المصادر الثلاثة.",
            )}
          </p>
        </aside>
        <div
          className={workspace.panel}
          id="preview-panel"
          role="tabpanel"
          aria-labelledby={"preview-tab-" + view}
          tabIndex={0}
        >
          <div className={workspace.panelContent} key={view}>
            {view === "chat" && (
              <>
                <p className={workspace.question}>
                  {t(
                    "What happens if the upper trunk of the brachial plexus is injured?",
                    "إيه اللي بيحصل لو الجذع العلوي للضفيرة العضدية اتصاب؟",
                  )}
                </p>
                <div className={workspace.reply}>
                  <p className={workspace.replyFrom}>
                    <strong>UniMind</strong>
                    <span>{t("Sample answer", "إجابة تجريبية")}</span>
                  </p>
                  <p>
                    {t(
                      "An upper trunk injury damages the C5 and C6 roots: Erb’s palsy. The arm hangs adducted and medially rotated, with the forearm pronated, the “waiter’s tip” position.",
                      "إصابة الجذع العلوي تؤثر على الجذرين C5 وC6، وتُعرف بشلل إرب. يتدلى الذراع مقرّبًا ومدوّرًا للداخل والساعد مكبوب، وهو وضع «بقشيش النادل».",
                    )}
                  </p>
                  <button
                    className={workspace.sourceButton}
                    type="button"
                    aria-expanded={sourceOpen}
                    aria-controls="sample-evidence"
                    onClick={() => setSourceOpen(!sourceOpen)}
                  >
                    <b aria-hidden="true">1</b>
                    {t("View supporting material", "عرض المادة الداعمة")}
                  </button>
                  {sourceOpen && (
                    <div className={workspace.excerpt} id="sample-evidence">
                      <strong lang="en" dir="ltr">
                        Lecture 6 handout, page 14
                      </strong>
                      <p lang="en" dir="ltr">
                        <mark>
                          Injury to the upper trunk (C5, C6) produces
                          Erb–Duchenne paralysis
                        </mark>
                        , commonly from excessive separation of the head and
                        shoulder.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
            {view === "studio" && (
              <>
                <h3>
                  {t("Flashcards from Lecture 6", "بطاقات من المحاضرة 6")}
                </h3>
                <p>
                  {t(
                    "Make summaries, flashcards and practice questions from your subject’s sources. Try one card.",
                    "أعد ملخصات وبطاقات مذاكرة وأسئلة تدريب من مصادر مادتك. جرّب بطاقة واحدة.",
                  )}
                </p>
                {/* The name follows the visible side and action, so the
                    button has no `aria-pressed` that could contradict it
                    (IX-16). */}
                <button
                  type="button"
                  className={workspace.flashcard}
                  data-flipped={flipped || undefined}
                  onClick={() => setFlipped(!flipped)}
                >
                  <span className={workspace.flashcardLabel}>
                    {flipped
                      ? t("Sample answer", "إجابة تجريبية")
                      : t("Sample flashcard", "بطاقة تجريبية")}
                  </span>
                  <strong>
                    {flipped
                      ? t(
                          "C5 and C6. An upper trunk injury gives Erb’s palsy.",
                          "C5 وC6. إصابة الجذع العلوي تسبب شلل إرب.",
                        )
                      : t(
                          "Which roots form the upper trunk?",
                          "ما الجذور التي تكوّن الجذع العلوي؟",
                        )}
                  </strong>
                  <span className={workspace.flashcardAction}>
                    {flipped
                      ? t("Show question", "عرض السؤال")
                      : t("Reveal answer", "عرض الإجابة")}
                  </span>
                </button>
              </>
            )}
            {view === "quiz" && (
              <>
                <h3>{t("Check what you remember", "اختبر ما تتذكره")}</h3>
                <fieldset className={workspace.quiz}>
                  <legend>
                    {t(
                      "Which position follows an upper trunk injury?",
                      "أي وضع يتبع إصابة الجذع العلوي؟",
                    )}
                  </legend>
                  {[
                    t(
                      "Arm adducted and medially rotated",
                      "ذراع مقرّب ومدوّر للداخل",
                    ),
                    t(
                      "Claw hand with wasted small muscles",
                      "يد مخلبية مع ضمور العضلات الصغيرة",
                    ),
                  ].map((option, index) => (
                    <label key={option} data-selected={answer === index}>
                      <input
                        type="radio"
                        name="landing-quiz"
                        checked={answer === index}
                        onChange={() => setAnswer(index)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
                <p className={workspace.feedback} role="status">
                  {answer === null
                    ? t("Try the sample question.", "جرّب السؤال التجريبي.")
                    : answer === 0
                      ? t(
                          "Correct. That’s the waiter’s tip position of Erb’s palsy.",
                          "صحيح. هذا وضع «بقشيش النادل» في شلل إرب.",
                        )
                      : t(
                          "Try again. A claw hand follows a lower trunk injury (Klumpke’s palsy).",
                          "حاول مجددًا. اليد المخلبية تتبع إصابة الجذع السفلي (شلل كلومبكه).",
                        )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <p className={workspace.footnote}>
        <strong>{t("Sample workspace", "مساحة تجريبية")}</strong>{" "}
        {t(
          "Invented material. Access and tools depend on your subject. This preview does not generate or save anything.",
          "مواد مُتخيَّلة. الوصول والأدوات تعتمد على مادتك. هذه المعاينة لا تولّد شيئًا ولا تحفظه.",
        )}
      </p>
    </div>
  );
}
