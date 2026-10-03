"use client";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/app/_components/app-shell";
import {
  buildCatalogHref,
  type CatalogJourney,
  type CatalogAccessState,
  type CatalogSelectionKey,
} from "@/lib/catalog/catalog-journey.application";
import { getCatalogCopy } from "@/lib/i18n/catalog-copy";
import type { Locale } from "@/lib/i18n/locale";
import type { UnitPresentation } from "../synthetic-catalog";
import styles from "../study-shelf.module.css";

export function StudyShelf({
  initialLocale: locale,
  journey,
  state,
  basePath,
  synthetic = false,
  completeNavigation = false,
  lastStudyPath,
  unitPresentationById = {},
}: {
  initialLocale: Locale;
  journey: CatalogJourney;
  state: CatalogAccessState | "ERROR";
  basePath: string;
  synthetic?: boolean;
  completeNavigation?: boolean;
  showLogout?: boolean;
  lastStudyPath?: string | null;
  unitPresentationById?: Readonly<Record<string, UnitPresentation>>;
}) {
  const router = useRouter();
  const parameters = useSearchParams();
  const subjects = parameters.get("view") === "subjects";
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const copy = getCatalogCopy(locale);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState(false);
  const results = useRef<HTMLHeadingElement>(null);
  const navigating = useRef(false);
  const preview = basePath.startsWith("/preview");
  const resumeAddress = lastStudyPath
    ? new URL(lastStudyPath, "https://unimind.invalid")
    : null;
  resumeAddress?.searchParams.set("lang", locale);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!preview) {
      window.scrollTo({ top: 0 });
      heading.current?.focus({ preventScroll: true });
    }
  }, [preview]);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  useEffect(() => {
    if (navigating.current) {
      navigating.current = false;
      setPending(false);
      results.current?.focus();
    }
  }, [journey.canonicalQuery]);
  const units = useMemo(
    () =>
      journey.units.filter((unit) =>
        `${unit.nameEn} ${unit.nameAr}`
          .toLocaleLowerCase(locale)
          .includes(search.trim().toLocaleLowerCase(locale)),
      ),
    [journey.units, locale, search],
  );
  const navigate = (key: CatalogSelectionKey, value: string) => {
    setPending(true);
    navigating.current = true;
    router.push(
      `${buildCatalogHref(basePath, locale, journey.selection, key, value)}${subjects ? "&view=subjects" : ""}` as Route,
    );
  };
  const label =
    locale === "ar"
      ? journey.selectedProgram?.unitLabelPluralAr
      : journey.selectedProgram?.unitLabelPluralEn;
  const context = journey.selectedProgram
    ? [
        locale === "ar"
          ? journey.selectedProgram.nameAr
          : journey.selectedProgram.nameEn,
        ...journey.options.levels
          .filter((item) => item.id === journey.selection.levelId)
          .map((item) => (locale === "ar" ? item.nameAr : item.nameEn)),
        ...journey.options.terms
          .filter((item) => item.id === journey.selection.termId)
          .map((item) => (locale === "ar" ? item.nameAr : item.nameEn)),
      ].join(" · ")
    : "";
  const safe = {
    NO_MEMBERSHIP: [copy.noMembershipTitle, copy.noMembershipBody],
    COHORT_LOCKED: [copy.cohortLockedTitle, copy.cohortLockedBody],
    NO_CATALOG: [copy.noCatalogTitle, copy.noCatalogBody],
    UNIT_UNPUBLISHED: [copy.unpublishedTitle, copy.unpublishedBody],
    READY_SOURCE_MISSING: [copy.noReadySourceTitle, copy.noReadySourceBody],
    ERROR: [copy.errorTitle, copy.errorBody],
  };
  return (
    <AppShell
      locale={locale}
      preview={preview}
      synthetic={synthetic}
      title={subjects ? t("Subjects", "المواد") : t("Study", "المذاكرة")}
    >
      <div className={styles.content} aria-busy={pending}>
        <header className={styles.pageHeader}>
          <h1 ref={heading} tabIndex={-1}>
            {subjects
              ? t("Your subjects", "موادك الدراسية")
              : t("Your Study Shelf", "رف المذاكرة")}
          </h1>
          <p>
            {context ||
              t(
                "Your subjects and materials, together.",
                "موادك ومصادرك في مكان واحد.",
              )}
          </p>
          {!preview ? (
            <Link
              className={styles.contextLink}
              href={
                `/settings?lang=${locale}#academic-settings-heading` as Route
              }
            >
              {t("Academic settings", "الإعدادات الدراسية")}
            </Link>
          ) : null}
        </header>
        {preview && state === "READY" ? (
          <fieldset className={styles.path} disabled={pending}>
            <legend>{copy.pathHeading}</legend>
            {(
              [
                ["stage", "stageId", copy.stage, journey.options.stages],
                [
                  "institution",
                  "institutionId",
                  journey.selectedStage?.code === "UNIVERSITY"
                    ? copy.university
                    : copy.educationSystem,
                  journey.options.institutions,
                ],
                [
                  "program",
                  "programId",
                  journey.selectedStage?.code === "UNIVERSITY"
                    ? copy.faculty
                    : copy.track,
                  journey.options.programs,
                ],
                [
                  "level",
                  "levelId",
                  journey.selectedStage?.code === "UNIVERSITY"
                    ? copy.academicYear
                    : copy.schoolYear,
                  journey.options.levels,
                ],
                [
                  "term",
                  "termId",
                  journey.selectedStage?.code === "UNIVERSITY"
                    ? copy.semester
                    : copy.term,
                  journey.options.terms,
                ],
                ["cohort", "cohortId", copy.cohort, journey.options.cohorts],
              ] as const
            )
              .filter(
                ([key, , , options]) => key !== "cohort" || options.length > 1,
              )
              .map(([key, selectionKey, title, options]) => (
                <label key={key}>
                  <span>{title}</span>
                  <select
                    aria-label={title}
                    name={key}
                    value={journey.selection[selectionKey] ?? ""}
                    disabled={options.length === 0}
                    onChange={(event) => navigate(key, event.target.value)}
                  >
                    <option value="">{copy.choose}</option>
                    {options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {locale === "ar" ? option.nameAr : option.nameEn}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
          </fieldset>
        ) : null}
        {state !== "READY" ? (
          <section
            className={styles.emptyState}
            role={state === "ERROR" ? "alert" : "status"}
          >
            <h2>{safe[state][0]}</h2>
            <p>{safe[state][1]}</p>
            {state === "ERROR" ? (
              <Link href={`${basePath}?lang=${locale}` as Route}>
                {copy.retry}
              </Link>
            ) : null}
          </section>
        ) : (
          <>
            {journey.units.length === 0 ? (
              <section className={styles.emptyState} role="status">
                <h2>{copy.choosePathTitle}</h2>
                <p>{copy.choosePathBody}</p>
                {!preview ? (
                  <Link href={`/settings?lang=${locale}` as Route}>
                    {t("Choose academic settings", "اختيار الإعدادات الدراسية")}
                  </Link>
                ) : null}
              </section>
            ) : (
              <>
                {!subjects && lastStudyPath ? (
                  <section className={styles.resume}>
                    <div>
                      <h2>
                        {t("Pick up where you left off", "أكمل من حيث توقفت")}
                      </h2>
                      <p>
                        {t(
                          synthetic
                            ? "Return to your most recent workspace in this session."
                            : "Return to your most recently opened chat session.",
                          synthetic
                            ? "عد إلى آخر مساحة مذاكرة في هذه الجلسة."
                            : "عد إلى آخر جلسة محادثة بدأتَها.",
                        )}
                      </p>
                    </div>
                    <Link
                      className={styles.open}
                      href={
                        (resumeAddress!.pathname +
                          resumeAddress!.search +
                          resumeAddress!.hash) as Route
                      }
                    >
                      {t("Continue studying", "متابعة المذاكرة")}
                    </Link>
                  </section>
                ) : null}
                <div className={styles.shelfHeading}>
                  <h2 ref={results} tabIndex={-1}>
                    {label ?? t("Subjects", "المواد")}
                  </h2>
                  <label className={styles.search}>
                    <span>{t("Search subjects", "البحث عن مادة")}</span>
                    <input
                      type="search"
                      value={search}
                      placeholder={t("Find a subject…", "ابحث عن مادة…")}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                </div>
                {units.length === 0 ? (
                  <section className={styles.emptyState} role="status">
                    <h3>{copy.noSearchTitle}</h3>
                    <p>{copy.noSearchBody}</p>
                    <button type="button" onClick={() => setSearch("")}>
                      {copy.clearSearch}
                    </button>
                  </section>
                ) : (
                  <ul className={styles.units}>
                    {units.map((unit) => {
                      const focused = journey.selection.unitId === unit.id;
                      const presentation = unitPresentationById[unit.id];
                      const href = journey.selectedCohort
                        ? `${basePath}/${journey.selectedCohort.id}/${unit.id}?lang=${locale}`
                        : null;
                      return (
                        <li
                          key={unit.id}
                          data-focused={focused}
                          data-unit-id={unit.id}
                        >
                          <article className={styles.unit}>
                            <div
                              className={styles.subjectBook}
                              aria-hidden="true"
                            >
                              <span />
                            </div>
                            <div className={styles.unitCopy}>
                              <button
                                className={styles.unitSelect}
                                type="button"
                                disabled={pending}
                                aria-pressed={focused}
                                aria-label={`${copy.selectUnit}: ${locale === "ar" ? unit.nameAr : unit.nameEn}`}
                                onClick={() => navigate("unit", unit.id)}
                              >
                                <bdi>
                                  {locale === "ar" ? unit.nameAr : unit.nameEn}
                                </bdi>
                              </button>
                              <p>
                                {unit.sourceCount !== undefined ? (
                                  <span>
                                    {new Intl.NumberFormat(locale).format(
                                      unit.sourceCount,
                                    )}
                                  </span>
                                ) : null}{" "}
                                {synthetic
                                  ? t("sample materials", "مواد تجريبية")
                                  : t("available materials", "مواد متاحة")}{" "}
                                ·{" "}
                                <span className={styles.ready}>
                                  {t("Ready to study", "جاهزة للمذاكرة")}
                                </span>
                              </p>
                              {focused && presentation ? (
                                <p>
                                  {locale === "ar"
                                    ? presentation.descriptionAr
                                    : presentation.descriptionEn}
                                </p>
                              ) : null}
                            </div>
                            {href ? (
                              <Link
                                className={styles.open}
                                href={href as Route}
                              >
                                {t("Open", "فتح")}{" "}
                                <span className={styles.srOnly}>
                                  {locale === "ar" ? unit.nameAr : unit.nameEn}
                                </span>
                              </Link>
                            ) : null}
                          </article>
                          {focused && journey.selectedCohort ? (
                            <p className={styles.edition}>
                              <bdi>
                                {journey.selectedCohort.curriculumEdition}
                              </bdi>
                              {completeNavigation
                                ? ` · ${t("Sample workspace", "مساحة تجريبية")}`
                                : ""}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </>
        )}
        <p className={styles.srOnly} role="status">
          {pending ? copy.navigationPending : copy.resultsUpdated}
        </p>
      </div>
    </AppShell>
  );
}
