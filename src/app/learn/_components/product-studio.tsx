"use client";
import { useProductText } from "@/app/_components/product-copy";
import { useEffect, useRef, useState } from "react";
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
} from "@/app/_components/synthetic-fixtures";
import { FrontendIcon } from "@/app/_components/frontend-system";
import type { ProductStudyProps } from "./product-study";
import styles from "@/app/_components/product.module.css";
import studyStyles from "./product-study.module.css";
export function ProductStudio({ scope, locale, base }: ProductStudyProps) {
  const { state, update } = useProductServices();
  const draft = state.studioDrafts[scope.unitId] ?? {
    type: "summary",
    language: locale,
    topic: "sequence",
    depth: "concise",
    size: "short",
  };
  const { type, language, topic, depth, size } = draft;
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
            if (!request && handoutAvailable) {
              setNotice("");
              setRequest({ type, language, topic, depth, size });
            }
          }}
        >
          {!handoutAvailable ? (
            <Notice error>
              {t(
                "The handout needed by this artifact fixture is inactive. Other unit sources remain available; choose another unit or reactivate the source through governed review.",
                "الملزمة اللازمة لمثال المخرج غير نشطة. المصادر الأخرى متاحة؛ اختر وحدة أخرى أو أعد تفعيل المصدر بمراجعة منضبطة.",
              )}
            </Notice>
          ) : null}
          <h2>{t("Shape the result", "شكّل المخرج")}</h2>
          <Select
            id="artifact-type"
            label={t("Artifact type", "نوع المخرج")}
            value={type}
            onChange={(value) => setOption("type", value)}
            options={artifactTypes.map(
              ([id, en, ar]) => [id, t(en, ar)] as const,
            )}
            disabled={request !== null}
          />
          <div className={studyStyles.configuration}>
            <Select
              id="artifact-topic"
              label={t("Topic", "الموضوع")}
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

          <Button
            primary
            type="submit"
            disabled={request !== null || !handoutAvailable}
          >
            {t("Generate", "إنشاء")}
          </Button>
          <p className={studyStyles.caption}>
            {t(
              "Fixed examples · kept only until reload",
              "أمثلة ثابتة · تبقى حتى إعادة التحميل فقط",
            )}
          </p>
        </form>
        <div className={studyStyles.artifactArea} aria-busy={request !== null}>
          <header className={studyStyles.artifactHeader}>
            <h2>{t("Your artifact", "مخرجك الدراسي")}</h2>
            <span>
              {(artifact?.language ?? language) === "ar"
                ? "العربية"
                : (artifact?.language ?? language) === "en"
                  ? "English"
                  : t("Bilingual", "ثنائي اللغة")}
            </span>
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
          {notice ? <Notice>{notice}</Notice> : null}
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
                    <div
                      className={studyStyles.flashcard}
                      data-flipped={flipped}
                      role="region"
                      aria-label={t("Flashcard", "بطاقة مراجعة")}
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <div className={studyStyles.flashcardInner}>
                        <p
                          className={studyStyles.flashcardFront}
                          aria-hidden={flipped}
                        >
                          {artifact.language === "en"
                            ? "What sequence does the sample handout use?"
                            : "ما ترتيب الملزمة التجريبية؟"}
                        </p>
                        <p
                          className={studyStyles.flashcardBack}
                          aria-hidden={!flipped}
                        >
                          {artifact.language === "en"
                            ? "Identify labels, then compare diagrams."
                            : "حدد الأسماء ثم قارن الرسوم."}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setFlipped(!flipped)}>
                      {t("Flip card", "اقلب البطاقة التجريبية")}
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
                    {artifact.type === "guide" ||
                    artifact.type === "revision" ? (
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
                <ProductLink
                  href={base + "/sources?from=studio"}
                  locale={locale}
                >
                  {t("Inspect source pool", "فحص مجموعة المصادر")}
                </ProductLink>
                {artifact.type === "quiz" ? (
                  <ProductLink href={base + "/quiz"} locale={locale}>
                    {t("Open quiz", "فتح الاختبار التجريبي")}
                  </ProductLink>
                ) : null}
              </div>
            </section>
          ) : (
            <div className={studyStyles.artifactEmpty}>
              <FrontendIcon name="studio" />
              <h3>
                {t("Your study aid appears here", "أداة مذاكرتك تظهر هنا")}
              </h3>
              <p>
                {t(
                  "Choose a type, set your options, then Generate. You can inspect its sources and any missing or conflicting evidence.",
                  "اختر النوع والمعايير ثم اضغط إنشاء. يمكنك فحص المصادر والأدلة الناقصة أو المتعارضة.",
                )}
              </p>
            </div>
          )}
          <footer className={studyStyles.artifactFooter}>
            <ProductLink href={base + "/sources?from=studio"} locale={locale}>
              <FrontendIcon name="sources" />
              {t("Unit sources", "مصادر الوحدة")}
            </ProductLink>
          </footer>
        </div>
      </div>
    </div>
  );
}
