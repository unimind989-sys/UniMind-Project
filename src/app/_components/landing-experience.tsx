"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { LandingIcon } from "./landing-icons";
import atlas from "./landing-atlas.module.css";
import panel from "./landing-workspace-panel.module.css";
import workspace from "./landing-workspace.module.css";

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
    <div className={atlas.atlas} ref={scene} data-motion="paused">
      <div className={atlas.atlasVisual} aria-hidden="true" dir="ltr">
        <div className={atlas.atlasOrbit}>
          <span />
          <span />
          <span />
        </div>
        <div className={atlas.folioStage}>
          <div className={atlas.folioBase} />
          <div className={atlas.folioEdge} />
          <div className={atlas.folioLeafLeft}>
            <span className={atlas.paperIcon}>
              <LandingIcon name="book" />
            </span>
            <strong>{t("Course topics", "موضوعات المقرر")}</strong>
            <div className={atlas.folioMap}>
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
            <span className={atlas.paperFoot}>
              {t("Topic outline", "مخطط الموضوعات")}
            </span>
          </div>
          <div className={atlas.folioLeafRight}>
            <span className={atlas.paperIcon}>
              <LandingIcon name="source" />
            </span>
            <strong>{t("Study notes", "ملاحظات المذاكرة")}</strong>
            <div className={atlas.paperLines}>
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className={atlas.paperHighlight}>
              <LandingIcon name="check" />
              {t("Backed by material", "مدعوم بمادتك")}
            </div>
            <div className={atlas.paperLines}>
              <i />
              <i />
              <i />
            </div>
            <span className={atlas.paperFoot}>
              {t("Source passage", "مقتطف من المصدر")}
            </span>
          </div>
          <div className={atlas.floatingSource}>
            <LandingIcon name="source" />
            <strong>{t("Lecture notes", "ملاحظات المحاضرة")}</strong>
            <div className={atlas.paperLines}>
              <i />
              <i />
              <i />
            </div>
            <span>PDF</span>
          </div>
          <div className={atlas.floatingInsight}>
            <LandingIcon name="chat" />
            <strong>{t("Professor insight", "ملاحظات الأستاذ")}</strong>
            <div className={atlas.waveform}>
              {[12, 22, 16, 34, 46, 25, 38, 20, 42, 30, 15, 25].map(
                (height, i) => (
                  <i key={i} style={{ height }} />
                ),
              )}
            </div>
          </div>
          <div className={atlas.floatingCitation}>
            <LandingIcon name="check" />
            <span>{t("Supporting material", "المادة الداعمة")}</span>
          </div>
        </div>
        <span className={atlas.atlasLabelMaterial}>
          {t("Your materials", "موادك")}
        </span>
        <span className={atlas.atlasLabelUnderstanding}>
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
    <div className={workspace.previewWrap}>
      <div className={workspace.previewNavigation}>
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
        <p className={workspace.previewDisclaimer}>
          {t(
            "Try the tools with sample material",
            "جرّب الأدوات بمواد تجريبية",
          )}
        </p>
      </div>
      <div className={workspace.workspaceWindow}>
        <div className={workspace.windowHeader}>
          <span>
            <LandingIcon name="book" />
            {t("Anatomy & physiology", "التشريح ووظائف الأعضاء")}
          </span>
          <span className={workspace.sampleLabel}>{t("Sample", "نموذج")}</span>
        </div>
        <div className={workspace.windowBody}>
          <aside
            className={workspace.previewMaterials}
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
                  <span className={workspace.materialFormat}>{format}</span>
                  <div>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                  <LandingIcon name="check" />
                </li>
              ))}
            </ul>
            <div className={workspace.materialFooter}>
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
            className={workspace.previewPanel}
            id="preview-panel"
            role="tabpanel"
            aria-labelledby={"preview-tab-" + view}
            tabIndex={0}
          >
            <div className={panel.panelContent} key={view}>
              {view === "chat" && (
                <>
                  <p className={panel.previewQuestion}>
                    {t(
                      "How is anatomy different from physiology?",
                      "ما الفرق بين التشريح ووظائف الأعضاء؟",
                    )}
                  </p>
                  <div className={panel.answerIdentity}>
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
                    className={panel.citationButton}
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
                    <div className={panel.sourceExcerpt} id="sample-evidence">
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
                  <p className={panel.previewHint}>
                    {t(
                      "This is a fixed sample answer using invented lecture notes.",
                      "هذه إجابة تجريبية ثابتة تستخدم ملاحظات محاضرة غير حقيقية.",
                    )}
                  </p>
                </>
              )}
              {view === "studio" && (
                <>
                  <div className={panel.answerIdentity}>
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
                    className={panel.flashcard}
                    aria-pressed={flipped}
                    onClick={() => setFlipped(!flipped)}
                  >
                    <span className={panel.flashcardLabel}>
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
                    <span className={panel.flashcardAction}>
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
                  <div className={panel.answerIdentity}>
                    <LandingIcon name="quiz" />
                    <strong>{t("Quiz", "الاختبار")}</strong>
                  </div>
                  <h3>{t("Check what you remember", "اختبر ما تتذكره")}</h3>
                  <fieldset className={panel.sampleQuiz}>
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
                  <p className={panel.quizFeedback} role="status">
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
      <div className={workspace.previewFootnote}>
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
