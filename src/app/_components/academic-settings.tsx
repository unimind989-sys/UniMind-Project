"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  contextFromSelection,
  type AcademicContext,
  type AcademicSaveState,
} from "@/lib/account/account.application";
import {
  resolveCatalogJourney,
  type AuthorizedCatalogRow,
  type CatalogSelection,
} from "@/lib/catalog/catalog-journey.application";
import type { Locale } from "@/lib/i18n/locale";
import { Button } from "./product-ui";
import styles from "./student-account.module.css";
import { FrontendIcon } from "./frontend-controls";
import { useAcademicSetupDraft } from "./academic-setup-draft";
import {
  academicSetupSequence,
  type AcademicSetupField,
} from "@/lib/account/academic-setup.application";

export function AcademicSettings({
  locale,
  rows,
  initialContext,
  save,
  onboarding = false,
}: {
  locale: Locale;
  rows: readonly AuthorizedCatalogRow[];
  initialContext: AcademicContext | null;
  save: (context: AcademicContext) => Promise<AcademicSaveState>;
  onboarding?: boolean;
}) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const retained = useAcademicSetupDraft();
  const [selection, setSelection] = useState<CatalogSelection>(
    (onboarding ? retained?.draft?.selection : null) ?? initialContext ?? {},
  );
  const [setupStep, setSetupStep] = useState(
    onboarding ? (retained?.draft?.step ?? 0) : 0,
  );
  const journey = resolveCatalogJourney(rows, selection);
  const university = journey.selectedStage?.code === "UNIVERSITY";
  const highSchool = journey.selectedStage?.code === "HIGH_SCHOOL";
  const fields = [
    [
      "stageId",
      t("Education stage", "المرحلة التعليمية"),
      journey.options.stages,
    ],
    [
      "institutionId",
      university
        ? t("University", "الجامعة")
        : highSchool
          ? t("Education system", "نظام التعليم")
          : t("Institution", "المؤسسة"),
      journey.options.institutions,
    ],
    [
      "programId",
      university
        ? t("Faculty or program", "الكلية أو البرنامج")
        : highSchool
          ? t("Track", "المسار")
          : t("Program", "البرنامج"),
      journey.options.programs,
    ],
    [
      "levelId",
      university ? t("Academic year", "السنة الدراسية") : t("Level", "المستوى"),
      journey.options.levels,
    ],
    [
      "termId",
      journey.selectedProgram?.progressionMode === "FLEXIBLE_CREDIT"
        ? t("Course-plan period", "فترة الخطة الدراسية")
        : t("Study period", "الفترة الدراسية"),
      journey.options.terms,
    ],
    ["cohortId", t("Cohort", "الدفعة"), journey.options.cohorts],
  ] as const;
  const setupFields = fields.filter(
    ([key, , options]) => key !== "cohortId" || options.length > 1,
  );
  const sequence = academicSetupSequence(
    setupFields,
    journey.selection,
    setupStep,
  );
  const step = sequence.step;
  const context = contextFromSelection(journey.selection);
  const choose = (key: keyof CatalogSelection, value: string) => {
    const next: Record<string, string> = {};
    for (const [previousKey] of fields) {
      if (previousKey === key) break;
      const previous = journey.selection[previousKey];
      if (previous) next[previousKey] = previous;
    }
    if (value) next[key] = value;
    setSelection(next);
    if (onboarding) retained?.remember({ selection: next, step });
  };
  const changeStep = (next: number) => {
    setSetupStep(next);
    retained?.remember({ selection: journey.selection, step: next });
  };
  // The result remembers which choices it was about, so a "saved" message
  // never sits next to choices changed after saving (IX-19).
  const contextKey = JSON.stringify(context);
  const [result, action, pending] = useActionState<
    AcademicSaveState & { key?: string },
    FormData
  >(
    async () => {
      if (!context) return { status: "INVALID", key: contextKey };
      const saved = await save(context);
      if (saved.status === "SAVED") retained?.remember(null);
      return { ...saved, key: contextKey };
    },
    { status: "IDLE" },
  );
  const shownResult =
    result.status === "SAVED" && result.key !== contextKey
      ? { status: "IDLE" as const }
      : result;
  return (
    <section
      className={`${styles.section} ${onboarding ? styles.onboarding : ""}`}
      aria-labelledby="academic-settings-heading"
    >
      {onboarding ? (
        <h1 id="academic-settings-heading">
          {t("Set up your Study Shelf", "إعداد رف المذاكرة")}
        </h1>
      ) : (
        <h2 id="academic-settings-heading">
          {t("Academic settings", "الإعدادات الدراسية")}
        </h2>
      )}
      <p>
        {locale === "ar" ? (
          <>
            اختر مسارك الدراسي. يمكنك تعديله لاحقًا من{" "}
            <span className={styles.settingsReference}>
              ملفك الشخصي ←{"\u00a0"}الإعدادات الدراسية.
            </span>
          </>
        ) : (
          <>
            Choose your academic path. You can change it later in{" "}
            <span className={styles.settingsReference}>
              your profile →{"\u00a0"}Academic settings.
            </span>
          </>
        )}
      </p>
      {initialContext && journey.correction ? (
        <p role="status">
          {t(
            "Your saved path has changed. Choose an available path below.",
            "تغير مسارك المحفوظ. اختر مسارًا متاحًا أدناه.",
          )}
        </p>
      ) : null}
      {rows.length === 0 ? (
        <p role="status">
          {t(
            "No academic path is available for this account yet. Your institution must assign access first.",
            "لا يوجد مسار دراسي متاح لهذا الحساب بعد. يجب إسناد الوصول من مؤسستك أولًا.",
          )}
        </p>
      ) : (
        <form
          action={action}
          onSubmit={(event) => {
            // Enter on a question's radio must not submit mid-sequence: it
            // advances once that question has an answer (IX-18).
            const active = onboarding ? setupFields[step] : undefined;
            if (!active) return;
            event.preventDefault();
            if (journey.selection[active[0]]) changeStep(sequence.next);
          }}
        >
          {onboarding ? (
            <AcademicSetup
              locale={locale}
              fields={setupFields}
              sequence={sequence}
              selection={journey.selection}
              choose={choose}
              step={step}
              setStep={changeStep}
              pending={pending}
              complete={!!context}
            />
          ) : (
            <fieldset disabled={pending} className={styles.fields}>
              <legend className="visually-hidden">
                {t("Academic settings", "الإعدادات الدراسية")}
              </legend>
              {fields
                .filter(
                  ([key, , options]) =>
                    key !== "cohortId" || options.length > 1,
                )
                .map(([key, label, options], index, shown) => (
                  <div key={key}>
                    <label htmlFor={`academic-${key}`}>{label}</label>
                    <select
                      id={`academic-${key}`}
                      name={key}
                      required
                      value={journey.selection[key] ?? ""}
                      disabled={options.length === 0}
                      // An empty select says which choice unlocks it.
                      aria-describedby={
                        options.length === 0 && index > 0
                          ? `academic-${key}-hint`
                          : undefined
                      }
                      onChange={(event) => choose(key, event.target.value)}
                    >
                      <option value="">{t("Choose…", "اختر…")}</option>
                      {options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {locale === "ar" ? option.nameAr : option.nameEn}
                        </option>
                      ))}
                    </select>
                    {options.length === 0 && index > 0 ? (
                      <p id={`academic-${key}-hint`} className={styles.hint}>
                        {t(
                          `Choose ${shown[index - 1]![1].toLocaleLowerCase("en")} first.`,
                          `اختر ${shown[index - 1]![1]} أولًا.`,
                        )}
                      </p>
                    ) : null}
                  </div>
                ))}
            </fieldset>
          )}
          {journey.selectedProgram?.progressionMode === "FLEXIBLE_CREDIT" ? (
            <p>
              {t(
                "Available subjects follow your program's flexible credit structure.",
                "المواد المتاحة تتبع نظام الساعات المرن في برنامجك.",
              )}
            </p>
          ) : null}
          {!onboarding ? (
            <Button
              variant="primary"
              size="large"
              className={styles.alignStart}
              type="submit"
              disabled={!context}
              pending={pending}
              pendingLabel={t("Saving…", "جار الحفظ…")}
            >
              {t("Save academic settings", "حفظ الإعدادات الدراسية")}
            </Button>
          ) : null}
          {shownResult.status !== "IDLE" ? (
            <p role={shownResult.status === "SAVED" ? "status" : "alert"}>
              {shownResult.status === "SAVED"
                ? t("Academic settings saved.", "تم حفظ الإعدادات الدراسية.")
                : shownResult.status === "INVALID"
                  ? t(
                      "Choose a complete available academic path.",
                      "اختر مسارًا دراسيًا متاحًا ومكتملًا.",
                    )
                  : shownResult.status === "FORBIDDEN"
                    ? t(
                        "Sign in and complete account access before saving.",
                        "سجل الدخول وأكمل خطوات الوصول قبل الحفظ.",
                      )
                    : t(
                        "Settings could not be saved. Your selections remain here; try again.",
                        "تعذر حفظ الإعدادات. اختياراتك محفوظة هنا؛ حاول مجددًا.",
                      )}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
}

function AcademicSetup({
  locale,
  fields,
  sequence,
  selection,
  choose,
  step,
  setStep,
  pending,
  complete,
}: {
  locale: Locale;
  fields: readonly AcademicSetupField[];
  sequence: ReturnType<typeof academicSetupSequence>;
  selection: CatalogSelection;
  choose: (key: keyof CatalogSelection, value: string) => void;
  step: number;
  setStep: (step: number) => void;
  pending: boolean;
  complete: boolean;
}) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const heading = useRef<HTMLHeadingElement>(null);
  const active = fields[step];
  const number = new Intl.NumberFormat(locale);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  return (
    <div className={styles.setup}>
      <div className={styles.setupProgress}>
        <p className={styles.progressLabel}>
          <span>
            {active
              ? t(
                  `Step ${number.format(sequence.ordinal + 1)} of ${number.format(sequence.questions.length)}`,
                  `الخطوة ${number.format(sequence.ordinal + 1)} من ${number.format(sequence.questions.length)}`,
                )
              : t("Review your choices", "راجع اختياراتك")}
          </span>
          {!active ? (
            <span className={styles.reviewCompletion}>
              <FrontendIcon name="check" size={16} />
              <span>{t("Academic path complete", "اكتمل المسار الدراسي")}</span>
            </span>
          ) : null}
        </p>
        <div className={styles.progressTrack} aria-hidden="true">
          {sequence.questions.map((index) => (
            <span
              key={fields[index]![0]}
              data-complete={index < step}
              data-current={index === step}
            />
          ))}
        </div>
      </div>
      {active ? (
        <>
          <h2 ref={heading} tabIndex={-1}>
            {active[1]}
          </h2>
          <fieldset
            className={styles.choices}
            data-step={active[0]}
            disabled={pending}
          >
            <legend className="visually-hidden">{active[1]}</legend>
            {active[2].map((option) => (
              <label key={option.id} className={styles.choice}>
                <input
                  type="radio"
                  name={`setup-${active[0]}`}
                  required
                  value={option.id}
                  checked={selection[active[0]] === option.id}
                  onChange={() => choose(active[0], option.id)}
                />
                <span>
                  <bdi>{locale === "ar" ? option.nameAr : option.nameEn}</bdi>
                </span>
              </label>
            ))}
            {active[2].length === 0 ? (
              <p role="status">
                {t(
                  "No available choices. Go back and choose another path.",
                  "لا توجد اختيارات متاحة. ارجع واختر مسارًا آخر.",
                )}
              </p>
            ) : null}
          </fieldset>
        </>
      ) : (
        <>
          <h2 ref={heading} tabIndex={-1}>
            {t("Your academic path", "مسارك الدراسي")}
          </h2>
          <dl className={styles.setupReview}>
            {fields.map(([key, label, options], index) => {
              const selected = options.find(
                (option) => option.id === selection[key],
              );
              return (
                <div key={key}>
                  <dt>{label}</dt>
                  <dd>
                    <bdi>
                      {selected
                        ? locale === "ar"
                          ? selected.nameAr
                          : selected.nameEn
                        : t("Choose an option", "اختر أحد الخيارات")}
                    </bdi>
                    {options.length > 1 ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setStep(index)}
                        aria-label={`${t("Edit", "تعديل")} ${label}`}
                      >
                        {t("Edit", "تعديل")}
                      </button>
                    ) : null}
                  </dd>
                </div>
              );
            })}
          </dl>
        </>
      )}
      <div className={styles.setupActions}>
        {sequence.previous !== null ? (
          <Button
            key="back"
            size="large"
            disabled={pending}
            onClick={() => setStep(sequence.previous!)}
          >
            {t("Back", "رجوع")}
          </Button>
        ) : null}
        {active ? (
          <Button
            key="advance"
            variant="primary"
            size="large"
            className={styles.advance}
            disabled={pending || !selection[active[0]]}
            onClick={(event) => {
              event.preventDefault();
              setStep(sequence.next);
            }}
          >
            {sequence.next === fields.length
              ? t("Review choices", "مراجعة الاختيارات")
              : t("Continue", "متابعة")}
          </Button>
        ) : (
          <Button
            key="save"
            variant="primary"
            size="large"
            className={styles.advance}
            type="submit"
            disabled={!complete}
            pending={pending}
            pendingLabel={t("Saving…", "جار الحفظ…")}
          >
            {t("Open Study Shelf", "فتح رف المذاكرة")}
          </Button>
        )}
      </div>
    </div>
  );
}
