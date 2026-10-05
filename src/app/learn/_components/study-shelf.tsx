"use client";
import { useProductRouter } from "@/app/_components/product-navigation";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FrontendIcon } from "@/app/_components/frontend-controls";
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
  lastStudyPath,
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
  const router = useProductRouter();
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
                <div className={styles.indexLayout}>
                  <div>
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
                          const href = journey.selectedCohort
                            ? `${basePath}/${journey.selectedCohort.id}/${unit.id}?lang=${locale}`
                            : null;
                          const name =
                            locale === "ar" ? unit.nameAr : unit.nameEn;
                          const contents = (
                            <>
                              <span
                                className={styles.subjectBook}
                                aria-hidden="true"
                              >
                                <span />
                              </span>
                              <span className={styles.unitCopy}>
                                <span className={styles.unitTitle}>
                                  <bdi>{name}</bdi>
                                </span>
                                <span className={styles.materialCount}>
                                  {unit.sourceCount !== undefined
                                    ? new Intl.NumberFormat(locale).format(
                                        unit.sourceCount,
                                      )
                                    : ""}{" "}
                                  {synthetic
                                    ? t("sample materials", "مواد تجريبية")
                                    : t("available materials", "مواد متاحة")}
                                </span>
                              </span>
                              <span className={styles.ready}>
                                {t("Ready", "جاهزة")}
                              </span>
                              <FrontendIcon name="arrow" />
                            </>
                          );
                          return (
                            <li key={unit.id} data-unit-id={unit.id}>
                              {href ? (
                                <Link
                                  className={styles.unit}
                                  href={href as Route}
                                  aria-label={`${t("Open", "فتح")} ${name}`}
                                >
                                  {contents}
                                </Link>
                              ) : (
                                <div className={styles.unit}>{contents}</div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                  <aside className={styles.orientation}>
                    <svg
                      viewBox="0 0 180 140"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <path d="M25 26h48q17 0 17 16v74q-8-11-22-11H25z M155 26h-48q-17 0-17 16v74q8-11 22-11h43z M36 42h30 M36 53h30 M36 64h23 M107 42h35 M107 53h35 M107 64h25" />
                      <path d="M136 26v28l-7-6-7 6V26" fill="currentColor" />
                      <path
                        d="M18 32v80h50q14 0 22 10 8-10 22-10h50V32"
                        opacity=".45"
                      />
                    </svg>
                    <h2>{t("Start with the source.", "ابدأ بالمصدر.")}</h2>
                    <p>
                      {t(
                        "Read your materials, ask a question, then turn what you understand into a study artifact.",
                        "اقرأ مصادرك، اسأل عما تريد فهمه، ثم حوّل فهمك إلى أداة للمذاكرة.",
                      )}
                    </p>
                    <p>
                      {t(
                        "Your academic settings determine which subjects appear here.",
                        "إعداداتك الدراسية تحدد المواد التي تظهر هنا.",
                      )}
                    </p>
                    <Link
                      href={
                        `/settings?lang=${locale}#academic-settings-heading` as Route
                      }
                    >
                      {t("Edit academic context", "تعديل السياق الدراسي")}
                    </Link>
                  </aside>
                </div>
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
