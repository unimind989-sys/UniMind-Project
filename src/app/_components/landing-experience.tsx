"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { LandingIcon } from "./landing-icons";
import styles from "./landing.module.css";

export function StudyAtlas({ locale }: { locale: Locale }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const syncMotion = () => {
      element.dataset.motion =
        visible && !document.hidden && !preference.matches
          ? "running"
          : "paused";
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      syncMotion();
    });
    observer.observe(element);
    preference.addEventListener("change", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
    };
  }, []);

  return (
    <div className={styles.atlas} ref={scene} data-motion="paused">
      <div className={styles.atlasVisual} aria-hidden="true" dir="ltr">
        <div className={styles.atlasOrbit}>
          <span />
          <span />
          <span />
        </div>
        <div className={styles.folioStage}>
          <div className={styles.folioBase} />
          <div className={styles.folioEdge} />
          <div className={styles.folioLeafLeft}>
            <span className={styles.paperIcon}>
              <LandingIcon name="book" />
            </span>
            <strong>{t("Course topics", "موضوعات المقرر")}</strong>
            <div className={styles.folioMap}>
              <svg viewBox="0 0 150 135" fill="none">
                <path
                  d="M75 24v35m0 0H28v37m47-37h47v37M75 59v53"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="46"
                  y="6"
                  width="58"
                  height="28"
                  rx="5"
                  fill="currentColor"
                />
                <rect
                  x="8"
                  y="93"
                  width="40"
                  height="24"
                  rx="4"
                  fill="currentColor"
                  opacity=".25"
                />
                <rect
                  x="102"
                  y="93"
                  width="40"
                  height="24"
                  rx="4"
                  fill="currentColor"
                  opacity=".25"
                />
                <rect
                  x="55"
                  y="108"
                  width="40"
                  height="24"
                  rx="4"
                  fill="currentColor"
                  opacity=".45"
                />
              </svg>
            </div>
            <span className={styles.paperFoot}>
              {t("Topic outline", "مخطط الموضوعات")}
            </span>
          </div>
          <div className={styles.folioLeafRight}>
            <span className={styles.paperIcon}>
              <LandingIcon name="source" />
            </span>
            <strong>{t("Study notes", "ملاحظات المذاكرة")}</strong>
            <div className={styles.paperLines}>
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className={styles.paperHighlight}>
              <LandingIcon name="check" />
              {t("Backed by material", "مدعوم بمادتك")}
            </div>
            <div className={styles.paperLines}>
              <i />
              <i />
              <i />
            </div>
            <span className={styles.paperFoot}>
              {t("Source passage", "مقتطف من المصدر")}
            </span>
          </div>
          <div className={styles.floatingSource}>
            <LandingIcon name="source" />
            <strong>{t("Lecture notes", "ملاحظات المحاضرة")}</strong>
            <div className={styles.paperLines}>
              <i />
              <i />
              <i />
            </div>
            <span>PDF</span>
          </div>
          <div className={styles.floatingInsight}>
            <LandingIcon name="chat" />
            <strong>{t("Professor insight", "ملاحظات الأستاذ")}</strong>
            <div className={styles.waveform}>
              {[12, 22, 16, 34, 46, 25, 38, 20, 42, 30, 15, 25].map(
                (height, i) => (
                  <i key={i} style={{ height }} />
                ),
              )}
            </div>
          </div>
          <div className={styles.floatingCitation}>
            <LandingIcon name="check" />
            <span>{t("Supporting material", "المادة الداعمة")}</span>
          </div>
        </div>
        <span className={styles.atlasLabelMaterial}>
          {t("Your materials", "موادك")}
        </span>
        <span className={styles.atlasLabelUnderstanding}>
          {t("Your study tools", "أدوات مذاكرتك")}
        </span>
      </div>
    </div>
  );
}

const views = ["chat", "studio", "quiz"] as const;
type View = (typeof views)[number];

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
    <div className={styles.previewWrap}>
      <div className={styles.previewNavigation}>
        <div
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
              <LandingIcon name={item} />
              {labels[item]}
            </button>
          ))}
        </div>
        <p className={styles.previewDisclaimer}>
          {t(
            "Try the tools with sample material",
            "جرّب الأدوات بمواد تجريبية",
          )}
        </p>
      </div>
      <div className={styles.workspaceWindow}>
        <div className={styles.windowHeader}>
          <span>
            <LandingIcon name="book" />
            {t("Anatomy & physiology", "التشريح ووظائف الأعضاء")}
          </span>
          <span className={styles.sampleLabel}>{t("Sample", "نموذج")}</span>
        </div>
        <div className={styles.windowBody}>
          <aside
            className={styles.previewMaterials}
            aria-label={t("Sample materials", "المواد التجريبية")}
          >
            <h3>{t("Materials", "المواد")}</h3>
            <p>{t("Sources for this subject", "مصادر هذه المادة")}</p>
            <ul>
              {[
                [
                  "PDF",
                  t("Lecture notes", "ملاحظات المحاضرة"),
                  t("Anatomy and physiology", "التشريح ووظائف الأعضاء"),
                ],
                [
                  "PDF",
                  t("Course reading", "قراءة المقرر"),
                  t("Structure and function", "التركيب والوظيفة"),
                ],
                [
                  "AUDIO",
                  t("Professor insight", "ملاحظات الأستاذ"),
                  t("Class discussion", "مناقشة المحاضرة"),
                ],
              ].map(([format, title, description]) => (
                <li key={title}>
                  <span className={styles.materialFormat}>{format}</span>
                  <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                  <LandingIcon name="check" />
                </li>
              ))}
            </ul>
            <div className={styles.materialFooter}>
              <LandingIcon name="source" />
              <span>
                {t(
                  "Your questions and study aids use the same approved material.",
                  "أسئلتك وأدوات مذاكرتك تستخدم نفس المواد المعتمدة.",
                )}
              </span>
            </div>
          </aside>
          <div
            className={styles.previewPanel}
            id="preview-panel"
            role="tabpanel"
            aria-labelledby={"preview-tab-" + view}
            tabIndex={0}
          >
            <div className={styles.panelContent} key={view}>
              {view === "chat" && (
                <>
                  <p className={styles.previewQuestion}>
                    {t(
                      "How is anatomy different from physiology?",
                      "ما الفرق بين التشريح ووظائف الأعضاء؟",
                    )}
                  </p>
                  <div className={styles.answerIdentity}>
                    <LandingIcon name="book" />
                    <strong>UniMind</strong>
                    <span>{t("Sample answer", "إجابة تجريبية")}</span>
                  </div>
                  <h3>{t("Structure and function", "التركيب والوظيفة")}</h3>
                  <p>
                    {t(
                      "Anatomy describes the structures of the body. Physiology explains how those structures function. The lecture notes use this distinction to introduce both subjects.",
                      "يصف التشريح تراكيب الجسم، وتشرح وظائف الأعضاء كيف تعمل هذه التراكيب. تستخدم ملاحظات المحاضرة هذا الفرق للتعريف بالمجالين.",
                    )}
                  </p>
                  <button
                    className={styles.citationButton}
                    type="button"
                    aria-expanded={sourceOpen}
                    aria-controls="sample-evidence"
                    onClick={() => setSourceOpen(!sourceOpen)}
                  >
                    <LandingIcon name="source" />
                    {t("View supporting material", "عرض المادة الداعمة")}
                    <LandingIcon name="arrow" />
                  </button>
                  {sourceOpen && (
                    <div className={styles.sourceExcerpt} id="sample-evidence">
                      <strong>
                        {t(
                          "Lecture notes · sample excerpt",
                          "ملاحظات المحاضرة · مقتطف تجريبي",
                        )}
                      </strong>
                      <p>
                        {t(
                          "“Anatomy describes body structures. Physiology explains how those structures function.”",
                          "«يصف التشريح تراكيب الجسم، وتشرح وظائف الأعضاء كيف تعمل هذه التراكيب.»",
                        )}
                      </p>
                    </div>
                  )}
                  <p className={styles.previewHint}>
                    {t(
                      "This is a fixed sample answer using invented lecture notes.",
                      "هذه إجابة تجريبية ثابتة تستخدم ملاحظات محاضرة غير حقيقية.",
                    )}
                  </p>
                </>
              )}
              {view === "studio" && (
                <>
                  <div className={styles.answerIdentity}>
                    <LandingIcon name="studio" />
                    <strong>{t("Studio", "الاستوديو")}</strong>
                  </div>
                  <h3>
                    {t("Review with flashcards", "راجع ببطاقات المذاكرة")}
                  </h3>
                  <p>
                    {t(
                      "Make summaries, study guides and practice questions from your subject’s sources. Try a sample flashcard below.",
                      "أعد ملخصات وأدلة مذاكرة وأسئلة تدريب من مصادر مادتك. جرّب بطاقة المذاكرة أدناه.",
                    )}
                  </p>
                  <button
                    type="button"
                    className={styles.flashcard}
                    aria-pressed={flipped}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <span className={styles.flashcardLabel}>
                      {flipped
                        ? t("Sample answer", "إجابة تجريبية")
                        : t("Sample flashcard", "بطاقة تجريبية")}
                    </span>
                    <strong>
                      {flipped
                        ? t(
                            "Physiology studies how body structures function.",
                            "تدرس وظائف الأعضاء كيف تعمل تراكيب الجسم.",
                          )
                        : t(
                            "What does physiology study?",
                            "ماذا تدرس وظائف الأعضاء؟",
                          )}
                    </strong>
                    <span className={styles.flashcardAction}>
                      {flipped
                        ? t("Show question", "عرض السؤال")
                        : t("Reveal answer", "عرض الإجابة")}
                      <LandingIcon name="arrow" />
                    </span>
                  </button>
                </>
              )}
              {view === "quiz" && (
                <>
                  <div className={styles.answerIdentity}>
                    <LandingIcon name="quiz" />
                    <strong>{t("Quiz", "الاختبار")}</strong>
                  </div>
                  <h3>{t("Check what you remember", "اختبر ما تتذكره")}</h3>
                  <fieldset className={styles.sampleQuiz}>
                    <legend>
                      {t(
                        "Which question is about physiology?",
                        "أي سؤال يتعلق بوظائف الأعضاء؟",
                      )}
                    </legend>
                    {[
                      t(
                        "How does this structure function?",
                        "كيف يعمل هذا التركيب؟",
                      ),
                      t(
                        "Where is this structure located?",
                        "أين يوجد هذا التركيب؟",
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
                  <p className={styles.quizFeedback} role="status">
                    {answer === null
                      ? t("Try the sample question.", "جرب السؤال التجريبي.")
                      : answer === 0
                        ? t(
                            "Correct. Physiology explains function; anatomy describes structure.",
                            "صحيح. تشرح وظائف الأعضاء الوظيفة، ويصف التشريح التركيب.",
                          )
                        : t(
                            "Try again. Location is part of anatomy; physiology explains function.",
                            "حاول مجددًا. الموقع جزء من التشريح، وتشرح وظائف الأعضاء الوظيفة.",
                          )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.previewFootnote}>
        <span>{t("Sample workspace", "مساحة تجريبية")}</span>
        <p>
          {t(
            "Sample materials. Access and available tools depend on your subject. This preview does not generate or save content.",
            "مواد تجريبية. الوصول والأدوات المتاحة يعتمدان على مادتك. هذه المعاينة لا تولد محتوى ولا تحفظه.",
          )}
        </p>
      </div>
    </div>
  );
}
