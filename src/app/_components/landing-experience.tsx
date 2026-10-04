"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { LandingIcon } from "./landing-icons";
import styles from "./landing.module.css";

export function StudyAtlas({ locale }: { locale: Locale }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const scene = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const element = scene.current;
    if (!element) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let visible = true;
    const reset = () => {
      window.cancelAnimationFrame(frame);
      element.style.setProperty("--atlas-x", "0deg");
      element.style.setProperty("--atlas-y", "0deg");
    };
    const move = (event: PointerEvent) => {
      if (
        preference.matches ||
        !finePointer.matches ||
        !visible ||
        document.hidden
      )
        return;
      const bounds = element.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        element.style.setProperty("--atlas-x", x.toFixed(2) + "deg");
        element.style.setProperty("--atlas-y", y.toFixed(2) + "deg");
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (!visible) reset();
    });
    observer.observe(element);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", reset);
    preference.addEventListener("change", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerleave", reset);
      preference.removeEventListener("change", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);

  return (
    <div className={styles.atlas} ref={scene} data-expanded={expanded}>
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
            <strong>{t("The bigger picture", "الصورة الكاملة")}</strong>
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
              {t("Make the connections", "اربط الأفكار")}
            </span>
          </div>
          <div className={styles.folioLeafRight}>
            <span className={styles.paperIcon}>
              <LandingIcon name="source" />
            </span>
            <strong>{t("Your understanding", "فهمك")}</strong>
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
              {t("Go one layer deeper", "تعمق أكثر")}
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
            <span>{t("Follow the evidence", "تتبع الأدلة")}</span>
          </div>
        </div>
        <span className={styles.atlasLabelMaterial}>
          {t("Your materials", "موادك")}
        </span>
        <span className={styles.atlasLabelUnderstanding}>
          {t("Connected understanding", "فهم مترابط")}
        </span>
      </div>
      <div className={styles.atlasControls}>
        <span>
          {t("A different perspective on studying.", "منظور مختلف للمذاكرة.")}
        </span>
        <button
          type="button"
          aria-pressed={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <LandingIcon name="expand" />
          {expanded
            ? t("Bring it together", "اجمع الأفكار")
            : t("Explore the layers", "اكتشف الطبقات")}
        </button>
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
            "Interactive preview · sample material",
            "معاينة تفاعلية · مواد تجريبية",
          )}
        </p>
      </div>
      <div className={styles.workspaceWindow}>
        <div className={styles.windowHeader}>
          <span>
            <LandingIcon name="book" />
            {t("Your subject workspace", "مساحة مادتك")}
          </span>
          <span className={styles.sampleLabel}>{t("Sample", "نموذج")}</span>
        </div>
        <div className={styles.windowBody}>
          <aside
            className={styles.previewMaterials}
            aria-label={t("Sample materials", "المواد التجريبية")}
          >
            <h3>{t("Materials", "المواد")}</h3>
            <p>{t("One connected knowledge pool", "مجموعة معرفة مترابطة")}</p>
            <ul>
              {[
                [
                  "PDF",
                  t("Lecture notes", "ملاحظات المحاضرة"),
                  t("The core concepts", "الأفكار الأساسية"),
                ],
                [
                  "PDF",
                  t("Course reading", "قراءة المقرر"),
                  t("The detail behind them", "التفاصيل الداعمة"),
                ],
                [
                  "AUDIO",
                  t("Professor insight", "ملاحظات الأستاذ"),
                  t("What to pay attention to", "ما يستحق التركيز"),
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
                      "How do these ideas connect?",
                      "كيف تترابط هذه الأفكار؟",
                    )}
                  </p>
                  <div className={styles.answerIdentity}>
                    <LandingIcon name="book" />
                    <strong>UniMind</strong>
                    <span>{t("Sample answer", "إجابة تجريبية")}</span>
                  </div>
                  <h3>{t("See the whole picture.", "شاهد الصورة الكاملة.")}</h3>
                  <p>
                    {t(
                      "Bring the core ideas together, then follow each connection back to the material. The explanation and its evidence stay side by side.",
                      "اجمع الأفكار الأساسية، ثم تتبع كل رابط إلى المادة الدراسية. يظل الشرح وأدلته جنبًا إلى جنب.",
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
                          "“Bring the core ideas together, then follow each connection back to the material.”",
                          "«اجمع الأفكار الأساسية، ثم تتبع كل رابط إلى المادة الدراسية.»",
                        )}
                      </p>
                    </div>
                  )}
                  <p className={styles.previewHint}>
                    {t(
                      "An illustrative explanation, not a generated course answer.",
                      "شرح توضيحي، وليس إجابة مولدة من مقرر دراسي.",
                    )}
                  </p>
                </>
              )}
              {view === "studio" && (
                <>
                  <div className={styles.answerIdentity}>
                    <LandingIcon name="studio" />
                    <strong>{t("Make it your own.", "ذاكر بطريقتك.")}</strong>
                  </div>
                  <h3>
                    {t(
                      "A new angle on the same material.",
                      "زاوية جديدة لنفس المادة.",
                    )}
                  </h3>
                  <p>
                    {t(
                      "Summaries, flashcards, mind maps, reports, audio overviews and presentations. Different ways to work with one subject.",
                      "ملخصات وبطاقات مذاكرة وخرائط ذهنية وتقارير وملخصات صوتية وعروض. طرق مختلفة للعمل على مادة واحدة.",
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
                        ? t("The connection", "الرابط")
                        : t("Sample flashcard", "بطاقة تجريبية")}
                    </span>
                    <strong>
                      {flipped
                        ? t(
                            "Return to the source. Check the relationship. Explain it in your own words.",
                            "عد إلى المصدر. راجع العلاقة. اشرحها بكلماتك.",
                          )
                        : t(
                            "What makes an explanation worth trusting?",
                            "ما الذي يجعل الشرح جديرًا بالثقة؟",
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
                    <strong>
                      {t("Find what sticks.", "اكتشف ما أتقنته.")}
                    </strong>
                  </div>
                  <h3>
                    {t(
                      "Turn understanding into practice.",
                      "حول الفهم إلى تدريب.",
                    )}
                  </h3>
                  <fieldset className={styles.sampleQuiz}>
                    <legend>
                      {t(
                        "In UniMind, what supports a course answer?",
                        "في UniMind، ما الذي يدعم إجابة المقرر؟",
                      )}
                    </legend>
                    {[
                      t(
                        "The approved material for your subject",
                        "المواد المعتمدة لمادتك",
                      ),
                      t(
                        "An unrelated web search",
                        "بحث على الإنترنت خارج المقرر",
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
                            "Exactly. Your subject’s approved material is the source.",
                            "صحيح. المواد المعتمدة لمادتك هي المصدر.",
                          )
                        : t(
                            "Try again. UniMind works from your subject’s approved material.",
                            "حاول مجددًا. يعتمد UniMind على المواد المعتمدة لمادتك.",
                          )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.previewFootnote}>
        <span>
          {t("Your material stays at the center.", "تظل مادتك في قلب التجربة.")}
        </span>
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
