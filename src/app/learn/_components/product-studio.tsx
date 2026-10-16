"use client";
import { useProductText } from "@/app/_components/product-copy";
import { useEffect, useRef, useState } from "react";
import { ProductSourceDialog } from "./product-source-dialog";
import { useProductServices } from "@/app/_components/product-services";
import {
  Button,
  Notice,
  ProductLink,
  Select,
} from "@/app/_components/product-ui";
import {
  artifactTypes,
  defaultScope,
  text,
} from "@/lib/demo/synthetic-fixtures.application";
import { FrontendIcon } from "@/app/_components/frontend-system";
import type { ProductStudyProps } from "./product-study";
import styles from "@/app/_components/product.module.css";
import studyStyles from "./product-study.module.css";
import {
  buildStudioFixture,
  studioFixtureSegments,
  type StudioFixtureOptions,
  type StudioFixtureText,
} from "@/lib/studio/studio-fixture.application";

const formatPurposes = [
  {
    type: "summary",
    group: "understand",
    description: [
      "See the key ideas together.",
      "اجمع الأفكار الأساسية في نظرة واحدة.",
    ],
    example: [
      "The two source instructions and where they differ.",
      "تعليمات المصدرين ومواضع الاختلاف بينهما.",
    ],
  },
  {
    type: "guide",
    group: "understand",
    description: [
      "Work through the topic step by step.",
      "ذاكر الموضوع خطوة بخطوة.",
    ],
    example: [
      "Read the handout, compare the recording, then note the conflict.",
      "اقرأ الملزمة، وقارن التسجيل، ثم دوّن التعارض.",
    ],
  },
  {
    type: "practice",
    group: "practice",
    description: [
      "Explain an idea yourself, then reveal the source-backed answer.",
      "اشرح الفكرة بنفسك، ثم أظهر الإجابة المدعومة بالمصدر.",
    ],
    example: [
      "What order does each source give?",
      "ما الترتيب الذي يقدمه كل مصدر؟",
    ],
  },
  {
    type: "quiz",
    group: "practice",
    description: [
      "Answer multiple-choice questions and review your corrections.",
      "أجب عن أسئلة الاختيار من متعدد وراجع تصحيح إجاباتك.",
    ],
    example: [
      "Choose which step the handout puts first.",
      "اختر الخطوة التي تبدأ بها الملزمة.",
    ],
  },
  {
    type: "flashcards",
    group: "review",
    description: [
      "Recall an answer before turning the card over.",
      "استرجع الإجابة قبل قلب البطاقة.",
    ],
    example: [
      "What sequence does the handout use?",
      "ما ترتيب الخطوات في الملزمة؟",
    ],
  },
  {
    type: "revision",
    group: "review",
    description: [
      "Combine a checklist of key points with questions for a final review.",
      "اجمع قائمة بالنقاط الأساسية وأسئلة للمراجعة النهائية.",
    ],
    example: [
      "Check both source orders, then revisit the missing timing.",
      "راجع ترتيب المصدرين، ثم راجع سؤال المدة غير المتاحة.",
    ],
  },
] as const;

function FixtureText({
  value,
  language,
}: {
  value: StudioFixtureText;
  language: StudioFixtureOptions["language"];
}) {
  return (
    <>
      {studioFixtureSegments(value, language).map((segment, index) => (
        <span key={segment.language}>
          {index > 0 ? <br /> : null}
          <bdi
            lang={segment.language}
            dir={segment.language === "ar" ? "rtl" : "ltr"}
          >
            {segment.text}
          </bdi>
        </span>
      ))}
    </>
  );
}
export function ProductStudio({ scope, locale, base }: ProductStudyProps) {
  const { state, update } = useProductServices();
  const [showPassages, setShowPassages] = useState(false);
  const draft = state.studioDrafts[scope.unitId] ?? {
    type: "summary",
    language: locale,
    topic: "sequence",
    depth: "concise",
    size: "short",
  };
  const { type, language, topic, depth, size } = draft;
  const purpose = formatPurposes.find((item) => item.type === type);
  useEffect(() => {
    update((current) =>
      current.studioDrafts[scope.unitId]
        ? current
        : {
            ...current,
            studioDrafts: {
              ...current.studioDrafts,
              [scope.unitId]: {
                type: "summary",
                language: locale,
                topic: "sequence",
                depth: "concise",
                size: "short",
              },
            },
          },
    );
  }, [locale, scope.unitId, update]);
  const setOption = (key: keyof typeof draft, value: string) =>
    update((current) => ({
      ...current,
      studioDrafts: {
        ...current.studioDrafts,
        [scope.unitId]: { ...draft, [key]: value },
      },
    }));
  const [flipped, setFlipped] = useState(false);
  const outputHeading = useRef<HTMLHeadingElement>(null);
  const completed = useRef(false);
  const [notice, setNotice] = useState("");
  const [request, setRequest] = useState<{
    type: string;
    language: string;
    topic: string;
    depth: string;
    size: string;
  } | null>(null);
  useEffect(() => {
    if (!request) return;
    const timer = setTimeout(() => {
      completed.current = true;
      update((current) => ({
        ...current,
        artifacts: { ...current.artifacts, [scope.unitId]: request },
      }));
      setRequest(null);
      setFlipped(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [request, scope.unitId, update]);
  const t = useProductText(locale);
  const artifact = state.artifacts[scope.unitId];
  const example = artifact ? buildStudioFixture(artifact) : null;
  useEffect(() => {
    if (artifact && completed.current) {
      completed.current = false;
      outputHeading.current?.focus();
    }
  }, [artifact]);
  const handoutAvailable =
    scope.unitId !== defaultScope.unitId || state.availability.sourceActive;
  return (
    <div className={studyStyles.studio}>
      <div className={studyStyles.studioLayout}>
        <form
          className={studyStyles.studioControls}
          onSubmit={(event) => {
            event.preventDefault();
            if (type === "quiz") return;
            if (!request && handoutAvailable) {
              const selected = buildStudioFixture({
                type,
                language,
                topic,
                depth,
                size,
              });
              if (!selected) {
                setNotice(
                  t(
                    "Select supported sample settings. Your previous artifact is unchanged.",
                    "اختر إعدادات تجريبية مدعومة. المخرج السابق كما هو.",
                  ),
                );
                return;
              }
              setNotice("");
              setRequest(selected.options);
            }
          }}
        >
          {!handoutAvailable ? (
            <Notice error>
              {t(
                `The handout needed by this artifact fixture is inactive. Other ${scope.unitLabelSingularEn.toLowerCase()} sources remain available; choose another ${scope.unitLabelSingularEn.toLowerCase()} or reactivate the source through governed review.`,
                `الملزمة اللازمة لمثال المخرج غير نشطة. المصادر الأخرى متاحة؛ اختر ${scope.unitLabelSingularAr} أخرى أو أعد تفعيل المصدر بمراجعة منضبطة.`,
              )}
            </Notice>
          ) : null}
          <h2>{t("Shape the result", "شكّل المخرج")}</h2>
          <div className={styles.field}>
            <label htmlFor="artifact-type">
              {t("Artifact type", "نوع المخرج")}
            </label>
            <select
              id="artifact-type"
              name="artifact-type"
              value={type}
              onChange={(event) => setOption("type", event.target.value)}
              disabled={request !== null}
              aria-describedby={purpose ? "artifact-purpose" : undefined}
            >
              {[
                ["understand", t("Understand", "افهم")],
                ["practice", t("Practice", "تدرّب")],
                ["review", t("Review", "راجع")],
              ].map(([group, label]) => (
                <optgroup key={group} label={label}>
                  {artifactTypes
                    .filter(([id]) =>
                      formatPurposes.some(
                        (item) => item.type === id && item.group === group,
                      ),
                    )
                    .map(([id, en, ar]) => (
                      <option key={id} value={id}>
                        {t(en, ar)}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          {purpose ? (
            <p
              id="artifact-purpose"
              className={studyStyles.caption}
              aria-live="polite"
            >
              {text(purpose.description, locale)}
              <br />
              {t("Example:", "مثال:")} {text(purpose.example, locale)}
            </p>
          ) : null}
          {type === "quiz" ? (
            <>
              <p className={studyStyles.caption}>
                {artifact
                  ? t(
                      "Set the question count, difficulty and timing in Quiz. Your current Studio aid stays here.",
                      "حدد عدد الأسئلة والصعوبة والتوقيت في الاختبار. تبقى أداة الاستوديو الحالية هنا.",
                    )
                  : t(
                      "Set the question count, difficulty and timing in Quiz.",
                      "حدد عدد الأسئلة والصعوبة والتوقيت في الاختبار.",
                    )}
              </p>
              <ProductLink href={base + "/quiz"} locale={locale}>
                {t("Set up MCQ quiz", "إعداد اختبار اختيار من متعدد")}
              </ProductLink>
            </>
          ) : (
            <>
              <div className={studyStyles.configuration}>
                <Select
                  id="artifact-topic"
                  label={t("Study focus", "محور المذاكرة")}
                  value={topic}
                  onChange={(value) => setOption("topic", value)}
                  options={[
                    ["sequence", t("Study sequence", "ترتيب الدراسة")],
                    ["comparison", t("Diagram comparison", "مقارنة الرسوم")],
                  ]}
                />
                <Select
                  id="artifact-language"
                  label={t("Output language", "لغة المخرج")}
                  value={language}
                  onChange={(value) => setOption("language", value)}
                  options={[
                    ["en", t("English", "الإنجليزية")],
                    ["ar", t("Arabic", "العربية")],
                    ["mixed", t("Mixed", "مختلط")],
                  ]}
                />
              </div>
              <details className={studyStyles.secondaryOptions}>
                <summary>{t("Depth and size", "التفصيل والحجم")}</summary>
                <div className={studyStyles.configuration}>
                  <Select
                    id="artifact-depth"
                    label={t("Depth", "التفصيل")}
                    value={depth}
                    onChange={(value) => setOption("depth", value)}
                    options={[
                      ["concise", t("Concise", "موجز")],
                      ["detailed", t("Detailed", "مفصل")],
                    ]}
                  />
                  <Select
                    id="artifact-size"
                    label={t("Size", "الحجم")}
                    value={size}
                    onChange={(value) => setOption("size", value)}
                    options={[
                      ["short", t("Short sample", "مثال قصير")],
                      ["extended", t("Extended sample", "مثال موسع")],
                    ]}
                  />
                </div>
              </details>

              <p className={studyStyles.caption}>
                {artifact
                  ? t(
                      `Generating again replaces the current aid for this ${scope.unitLabelSingularEn.toLowerCase()} when it finishes. Cancel keeps the current aid.`,
                      "عند اكتمال إنشاء أداة جديدة، تحل محل الأداة الحالية في هذا المقرر. الإلغاء يُبقي الأداة الحالية.",
                    )
                  : t(
                      `Studio keeps one current aid for each ${scope.unitLabelSingularEn.toLowerCase()}.`,
                      "يحتفظ الاستوديو بأداة حالية واحدة لكل مقرر.",
                    )}
              </p>
              <Button
                primary
                type="submit"
                disabled={request !== null || !handoutAvailable}
              >
                {t("Generate", "إنشاء")}
              </Button>
              <p className={studyStyles.caption}>
                {t(
                  "Fixed examples for these settings · no model generation · cleared on reload",
                  "أمثلة ثابتة لهذه الإعدادات · دون توليد بنموذج · تمسح عند إعادة التحميل",
                )}
              </p>
            </>
          )}
        </form>
        <div className={studyStyles.artifactArea} aria-busy={request !== null}>
          <header className={studyStyles.artifactHeader}>
            <h2>{t("Your artifact", "مخرجك الدراسي")}</h2>
            {artifact || type !== "quiz" ? (
              <span>
                {(artifact?.language ?? language) === "ar"
                  ? "العربية"
                  : (artifact?.language ?? language) === "en"
                    ? "English"
                    : t("Bilingual", "ثنائي اللغة")}
              </span>
            ) : null}
          </header>
          {request ? (
            <div className={studyStyles.artifactLoading}>
              <Notice>
                {t("Preparing artifact… · Simulated", "إعداد المخرج… · محاكاة")}
              </Notice>
              <Button
                onClick={() => {
                  setRequest(null);
                  setNotice(
                    t(
                      "Preparation cancelled. Your previous artifact is unchanged; Generate to retry.",
                      "تم إلغاء الإعداد. المخرج السابق كما هو؛ اضغط إنشاء للمحاولة.",
                    ),
                  );
                }}
              >
                {t("Cancel preparation", "إلغاء الإعداد")}
              </Button>
            </div>
          ) : null}
          {notice && type !== "quiz" ? <Notice>{notice}</Notice> : null}
          {artifact ? (
            <section
              className={studyStyles.artifactOutput}
              key={`${artifact.type}:${artifact.language}:${artifact.topic}:${artifact.depth}:${artifact.size}`}
            >
              <h2 ref={outputHeading} tabIndex={-1}>
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
                {t("Selected study focus", "محور المذاكرة المختار")}:{" "}
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
              {example ? (
                <div
                  lang={example.options.language === "en" ? "en" : "ar"}
                  dir={example.options.language === "en" ? "ltr" : "rtl"}
                >
                  {artifact.type !== "flashcards" ? (
                    <p>
                      <FixtureText
                        value={example.intro}
                        language={example.options.language}
                      />
                    </p>
                  ) : null}
                  {example.paragraphs.map((paragraph, index) => (
                    <p key={index}>
                      <FixtureText
                        value={paragraph}
                        language={example.options.language}
                      />
                    </p>
                  ))}
                  {example.steps.length ? (
                    <ol>
                      {example.steps.map((step, index) => (
                        <li key={index}>
                          <FixtureText
                            value={step.text}
                            language={example.options.language}
                          />
                          {step.explanation[0] ? (
                            <p>
                              <FixtureText
                                value={step.explanation}
                                language={example.options.language}
                              />
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {example.card ? (
                    <>
                      <p
                        id="flashcard-side"
                        className={studyStyles.caption}
                        lang={locale}
                        dir={locale === "ar" ? "rtl" : "ltr"}
                      >
                        {flipped
                          ? t("Answer side", "وجه الإجابة")
                          : t("Question side", "وجه السؤال")}
                      </p>
                      <div
                        className={studyStyles.flashcard}
                        data-flipped={flipped}
                        role="region"
                        aria-label={t("Flashcard", "بطاقة مراجعة")}
                        aria-describedby="flashcard-side"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        <div className={studyStyles.flashcardInner}>
                          <p
                            className={studyStyles.flashcardFront}
                            aria-hidden={flipped}
                          >
                            {example.card.front.map((value, index) => (
                              <span key={index}>
                                <FixtureText
                                  value={value}
                                  language={example.options.language}
                                />
                              </span>
                            ))}
                          </p>
                          <p
                            className={studyStyles.flashcardBack}
                            aria-hidden={!flipped}
                          >
                            {example.card.back.map((value, index) => (
                              <span key={index}>
                                <FixtureText
                                  value={value}
                                  language={example.options.language}
                                />
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => setFlipped(!flipped)}>
                        {flipped
                          ? t("Show question", "إظهار السؤال")
                          : t("Show answer", "إظهار الإجابة")}
                      </Button>
                    </>
                  ) : null}
                  {example.questions.length ? (
                    <ol>
                      {example.questions.map((question, index) => (
                        <li key={index}>
                          <p>
                            <FixtureText
                              value={question.prompt}
                              language={example.options.language}
                            />
                          </p>
                          {artifact.type === "quiz" ? (
                            example.options.depth === "detailed" &&
                            question.explanations[1] ? (
                              <p>
                                <FixtureText
                                  value={question.explanations[1]}
                                  language={example.options.language}
                                />
                              </p>
                            ) : null
                          ) : (
                            <details>
                              <summary>
                                {t(
                                  "Reveal grounded explanation",
                                  "إظهار الشرح من المصدر",
                                )}
                              </summary>
                              {question.explanations.map(
                                (explanation, explanationIndex) => (
                                  <p key={explanationIndex}>
                                    <FixtureText
                                      value={explanation}
                                      language={example.options.language}
                                    />
                                  </p>
                                ),
                              )}
                            </details>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              ) : (
                <Notice error>
                  {t(
                    "These settings do not match a fixed example. Choose supported settings and Generate again.",
                    "لا تطابق هذه الإعدادات مثالًا ثابتًا. اختر إعدادات مدعومة واضغط إنشاء مجددًا.",
                  )}
                </Notice>
              )}
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
                {example ? (
                  <Button onClick={() => setShowPassages(true)}>
                    {t("Supporting passages", "النصوص الداعمة")}
                  </Button>
                ) : null}
                {artifact.type === "quiz" && type !== "quiz" ? (
                  <ProductLink href={base + "/quiz"} locale={locale}>
                    {t("Set up MCQ quiz", "إعداد اختبار اختيار من متعدد")}
                  </ProductLink>
                ) : null}
              </div>
            </section>
          ) : (
            <div className={studyStyles.artifactEmpty}>
              <FrontendIcon name="studio" />
              <h3>
                {type === "quiz"
                  ? t(
                      "MCQ practice continues in Quiz",
                      "تابع تدريب الاختيار من متعدد في الاختبار",
                    )
                  : t("Your study aid appears here", "أداة مذاكرتك تظهر هنا")}
              </h3>
              <p>
                {type === "quiz"
                  ? t(
                      "Set up your attempt once, answer the questions and review your corrections.",
                      "اضبط محاولتك مرة واحدة، وأجب عن الأسئلة، ثم راجع تصحيح إجاباتك.",
                    )
                  : t(
                      "Choose a type, set your options, then Generate. You can inspect its sources and any missing or conflicting evidence.",
                      "اختر النوع والمعايير ثم اضغط إنشاء. يمكنك فحص المصادر والأدلة الناقصة أو المتعارضة.",
                    )}
              </p>
            </div>
          )}
          <footer className={studyStyles.artifactFooter}>
            <ProductLink href={base + "/sources?from=studio"} locale={locale}>
              <FrontendIcon name="sources" />
              {t(
                `${scope.unitLabelSingularEn} sources`,
                `مصادر ${scope.unitLabelSingularAr}`,
              )}
            </ProductLink>
          </footer>
        </div>
      </div>
      <ProductSourceDialog
        open={Boolean(showPassages && artifact && example)}
        title={t("Supporting passages", "النصوص الداعمة")}
        ids={["handout", "recording"]}
        scope={scope}
        locale={locale}
        libraryHref={base + "/sources?from=studio"}
        onClose={() => setShowPassages(false)}
      />
    </div>
  );
}
