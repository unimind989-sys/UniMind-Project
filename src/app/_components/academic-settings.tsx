"use client";

import { useActionState, useState } from "react";
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
import styles from "./student-account.module.css";

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
  const [selection, setSelection] = useState<CatalogSelection>(
    initialContext ?? {},
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
        ? t("Faculty", "الكلية")
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
    ["termId", t("Study period", "الفترة الدراسية"), journey.options.terms],
    ["cohortId", t("Cohort", "الدفعة"), journey.options.cohorts],
  ] as const;
  const context = contextFromSelection(journey.selection);
  const [result, action, pending] = useActionState<AcademicSaveState, FormData>(
    async () => (context ? save(context) : { status: "INVALID" }),
    { status: "IDLE" },
  );
  return (
    <section
      className={styles.section}
      aria-labelledby="academic-settings-heading"
    >
      <h2 id="academic-settings-heading">
        {onboarding
          ? t("Set up your Study Shelf", "إعداد رف المذاكرة")
          : t("Academic settings", "الإعدادات الدراسية")}
      </h2>
      <p>
        {t(
          "Choose what you study. You can change this later in Account → Academic settings.",
          "اختر ما تدرسه. يمكنك تعديله لاحقًا من الحساب ← الإعدادات الدراسية.",
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
        <form action={action}>
          <fieldset disabled={pending} className={styles.fields}>
            <legend className={styles.srOnly}>
              {t("Academic context", "السياق الدراسي")}
            </legend>
            {fields
              .filter(
                ([key, , options]) => key !== "cohortId" || options.length > 1,
              )
              .map(([key, label, options], index) => (
                <div key={key}>
                  <label htmlFor={`academic-${key}`}>{label}</label>
                  <select
                    id={`academic-${key}`}
                    value={journey.selection[key] ?? ""}
                    disabled={options.length === 0}
                    onChange={(event) => {
                      const next: Record<string, string> = {};
                      for (const [previousKey] of fields.slice(0, index)) {
                        const value = journey.selection[previousKey];
                        if (value) next[previousKey] = value;
                      }
                      if (event.target.value) next[key] = event.target.value;
                      setSelection(next);
                    }}
                  >
                    <option value="">{t("Choose…", "اختر…")}</option>
                    {options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {locale === "ar" ? option.nameAr : option.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </fieldset>
          {journey.selectedProgram?.progressionMode === "FLEXIBLE_CREDIT" ? (
            <p>
              {t(
                "Available subjects follow your program's flexible credit structure.",
                "المواد المتاحة تتبع نظام الساعات المرن في برنامجك.",
              )}
            </p>
          ) : null}
          <button
            className={styles.primary}
            type="submit"
            disabled={pending || !context}
          >
            {pending
              ? t("Saving…", "جار الحفظ…")
              : onboarding
                ? t("Open Study Shelf", "فتح رف المذاكرة")
                : t("Save academic settings", "حفظ الإعدادات الدراسية")}
          </button>
          {result.status !== "IDLE" ? (
            <p role={result.status === "SAVED" ? "status" : "alert"}>
              {result.status === "SAVED"
                ? t("Academic settings saved.", "تم حفظ الإعدادات الدراسية.")
                : result.status === "INVALID"
                  ? t(
                      "Choose a complete available academic path.",
                      "اختر مسارًا دراسيًا متاحًا ومكتملًا.",
                    )
                  : result.status === "FORBIDDEN"
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
