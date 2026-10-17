"use client";
import { useHostedSynthetic } from "@/app/_components/product-navigation";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import { AppShell } from "@/app/_components/app-shell";
import type {
  CatalogJourney,
  CatalogAccessState,
} from "@/lib/catalog/catalog-journey.application";
import { getCatalogCopy } from "@/lib/i18n/catalog-copy";
import type { Locale } from "@/lib/i18n/locale";
import type { RecentStudyDetails } from "@/lib/study/recent-work.application";
import styles from "../study-shelf.module.css";

export function StudyShelf({
  initialLocale: locale,
  journey,
  state,
  basePath,
  synthetic = false,
  lastStudyPath,
  lastStudyDetails,
  profileName,
}: {
  initialLocale: Locale;
  journey: CatalogJourney;
  state: CatalogAccessState | "ERROR";
  basePath: string;
  synthetic?: boolean;
  lastStudyPath?: string | null;
  lastStudyDetails?: RecentStudyDetails | null;
  profileName?: string | null;
}) {
  const hosted = useHostedSynthetic();
  const parameters = useSearchParams();
  const subjects = parameters.get("view") === "subjects";
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const copy = getCatalogCopy(locale);
  const [search, setSearch] = useState("");
  const browseQuery = new URLSearchParams(journey.canonicalQuery);
  browseQuery.set("lang", locale);
  browseQuery.set("view", "subjects");
  const browseHref = `${basePath}?${browseQuery}` as Route;
  const candidateAddress = lastStudyPath
    ? new URL(lastStudyPath, "https://unimind.invalid")
    : null;
  candidateAddress?.searchParams.set("lang", locale);
  const resumeUnit = journey.units.find((unit) =>
    [
      "chat",
      "studio",
      ...(synthetic
        ? ["quiz", "quiz/sample-attempt", "quiz/sample-attempt/review"]
        : []),
    ].some(
      (tool) =>
        candidateAddress?.pathname ===
        `${basePath}/${journey.selectedCohort?.id}/${unit.id}/${tool}`,
    ),
  );
  const resumeAddress = resumeUnit ? candidateAddress : null;
  const startUnit =
    journey.units.find((unit) => unit.id === journey.selection.unitId) ??
    journey.units[0];
  const startAddress =
    startUnit && journey.selectedCohort
      ? `${basePath}/${journey.selectedCohort.id}/${startUnit.id}?lang=${locale}`
      : null;
  const startName = startUnit
    ? locale === "ar"
      ? startUnit.nameAr
      : startUnit.nameEn
    : null;
  const resumeName = resumeUnit
    ? locale === "ar"
      ? resumeUnit.nameAr
      : resumeUnit.nameEn
    : null;
  const resumeTool = resumeAddress?.pathname.endsWith("/studio")
    ? t("Studio", "الاستوديو")
    : synthetic && resumeAddress?.pathname.includes("/quiz")
      ? t("Quiz", "الاختبار")
      : t("Chat", "المحادثة");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  const units = useMemo(
    () =>
      journey.units.filter((unit) =>
        `${unit.nameEn} ${unit.nameAr}`
          .toLocaleLowerCase(locale)
          .includes(search.trim().toLocaleLowerCase(locale)),
      ),
    [journey.units, locale, search],
  );
  const label =
    locale === "ar"
      ? journey.selectedProgram?.unitLabelPluralAr
      : journey.selectedProgram?.unitLabelPluralEn;
  const collectionLabel = label ?? t("Subjects", "المواد");
  const singularLabel =
    (locale === "ar"
      ? journey.selectedProgram?.unitLabelSingularAr
      : journey.selectedProgram?.unitLabelSingularEn) ?? t("Subject", "مادة");
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
      ].join(locale === "ar" ? "، " : ", ")
    : "";
  const safe = {
    NO_MEMBERSHIP: [copy.noMembershipTitle, copy.noMembershipBody],
    COHORT_LOCKED: [copy.cohortLockedTitle, copy.cohortLockedBody],
    NO_CATALOG: [copy.noCatalogTitle, copy.noCatalogBody],
    UNIT_UNPUBLISHED: [copy.unpublishedTitle, copy.unpublishedBody],
    READY_SOURCE_MISSING: [copy.noReadySourceTitle, copy.noReadySourceBody],
    ERROR: [copy.errorTitle, copy.errorBody],
  };
  const featured = resumeUnit ?? startUnit;
  const unitHref = (unitId: string) =>
    journey.selectedCohort
      ? `${basePath}/${journey.selectedCohort.id}/${unitId}?lang=${locale}`
      : null;
  const count = (value: number | undefined) =>
    value === undefined
      ? null
      : `${new Intl.NumberFormat(locale).format(value)} ${t(
          value === 1 ? "material" : "materials",
          "مصادر",
        )}`;
  const ready = state === "READY" && journey.units.length > 0;
  return (
    <AppShell
      locale={locale}
      synthetic={synthetic}
      profileName={profileName}
      title={subjects ? t("Subjects", "المواد") : t("Study", "المذاكرة")}
    >
      <div className={styles.content} aria-busy={false}>
        <header
          className={styles.pageHeader}
          data-view={subjects ? "subjects" : "study"}
        >
          <div className={styles.headerText}>
            <h1 ref={heading} tabIndex={-1}>
              {subjects
                ? t(
                    `Your ${collectionLabel.toLocaleLowerCase(locale)}`,
                    `قائمة ${collectionLabel}`,
                  )
                : t("Your Study Shelf", "رف المذاكرة")}
            </h1>
            <p>
              {context ||
                t(
                  "Your subjects and materials, together.",
                  "موادك ومصادرك في مكان واحد.",
                )}
            </p>
            {!subjects ? (
              <Link
                className={styles.contextLink}
                href={`/settings?lang=${locale}&section=academic` as Route}
              >
                {t("Academic settings", "الإعدادات الدراسية")}
              </Link>
            ) : null}
          </div>
          {ready && !subjects ? (
            <section className={styles.resume}>
              <div className={styles.planeText}>
                <p className={styles.planeLabel}>
                  {resumeName ? (
                    <>
                      <span className={styles.planePill}>
                        <bdi>{resumeName}</bdi>
                      </span>
                      <span>{resumeTool}</span>
                    </>
                  ) : (
                    <span className={styles.planePill}>
                      {t("Start here", "ابدأ من هنا")}
                    </span>
                  )}
                </p>
                <h2>
                  {resumeAddress && lastStudyDetails ? (
                    <bdi className={styles.recentTitle}>
                      {lastStudyDetails.title}
                    </bdi>
                  ) : resumeName ? (
                    <>
                      <bdi>{resumeName}</bdi> · {resumeTool}
                    </>
                  ) : startName ? (
                    <>
                      {t("Start in", "ابدأ في")} <bdi>{startName}</bdi>
                    </>
                  ) : (
                    t("Start studying", "ابدأ المذاكرة")
                  )}
                </h2>
                {resumeAddress && lastStudyDetails ? (
                  <p className={styles.planeDetail}>
                    {lastStudyDetails.detail}
                  </p>
                ) : null}
                <p className={styles.planeNote}>
                  {resumeAddress
                    ? t(
                        synthetic
                          ? hosted
                            ? "Only your latest work is shown here."
                            : "Only the latest work in this tab is shown. Reload starts fresh."
                          : "Continue your newest open Chat conversation. Other tools are not listed here yet.",
                        synthetic
                          ? hosted
                            ? "يظهر آخر عمل لك هنا فقط."
                            : "يظهر آخر عمل في هذا التبويب فقط. إعادة التحميل تبدأ من جديد."
                          : "تابع أحدث محادثة مفتوحة. الأدوات الأخرى لا تظهر هنا بعد.",
                      )
                    : startName
                      ? t(
                          "Open learning materials in your current study path.",
                          "افتح مصادر المذاكرة في مسارك الدراسي الحالي.",
                        )
                      : t(
                          `Choose a ${singularLabel.toLocaleLowerCase(locale)} to open its learning materials and study tools.`,
                          `اختر ${singularLabel} لفتح مصادر المذاكرة والأدوات.`,
                        )}
                </p>
              </div>
              <Link
                className={styles.open}
                href={
                  resumeAddress
                    ? ((resumeAddress.pathname +
                        resumeAddress.search +
                        resumeAddress.hash) as Route)
                    : startAddress
                      ? (startAddress as Route)
                      : browseHref
                }
              >
                <FrontendIcon name={resumeName ? "chat" : "sources"} />
                {resumeName
                  ? t(`Resume ${resumeName}`, `متابعة ${resumeName}`)
                  : startName
                    ? t(`Open ${startName}`, `فتح ${startName}`)
                    : t(
                        `Choose a ${singularLabel.toLocaleLowerCase(locale)}`,
                        `اختر ${singularLabel}`,
                      )}
              </Link>
            </section>
          ) : null}
        </header>
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
        ) : journey.units.length === 0 ? (
          <section className={styles.emptyState} role="status">
            <h2>{copy.choosePathTitle}</h2>
            <p>{copy.choosePathBody}</p>
            {!subjects ? (
              <Link href={`/settings?lang=${locale}` as Route}>
                {t("Choose academic settings", "اختيار الإعدادات الدراسية")}
              </Link>
            ) : null}
          </section>
        ) : !subjects ? (
          <section
            className={styles.covers}
            aria-labelledby="shelf-covers-heading"
          >
            <div className={styles.coversHead}>
              <h2 id="shelf-covers-heading">{collectionLabel}</h2>
              {resumeAddress || startAddress ? (
                <Link className={styles.contextLink} href={browseHref}>
                  {t("Browse all subjects", "تصفح كل المواد")}
                </Link>
              ) : null}
            </div>
            <ul className={styles.coverGrid}>
              {journey.units.map((unit) => {
                const href = unitHref(unit.id);
                const name = locale === "ar" ? unit.nameAr : unit.nameEn;
                const other = locale === "ar" ? unit.nameEn : unit.nameAr;
                const materials = count(unit.sourceCount);
                const body = (
                  <>
                    <span
                      className={styles.coverOther}
                      lang={locale === "ar" ? "en" : "ar"}
                      dir={locale === "ar" ? "ltr" : "rtl"}
                      aria-hidden="true"
                    >
                      {other}
                    </span>
                    <span className={styles.coverTitle}>
                      <bdi>{name}</bdi>
                    </span>
                    {materials ? (
                      <span className={styles.coverMeta}>{materials}</span>
                    ) : null}
                  </>
                );
                return (
                  <li
                    key={unit.id}
                    data-cover-unit-id={unit.id}
                    data-current={unit === featured ? true : undefined}
                  >
                    {href ? (
                      <Link
                        className={styles.cover}
                        href={href as Route}
                        aria-current={unit === featured ? "true" : undefined}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className={styles.cover}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <div className={styles.indexLayout}>
            <div className={styles.shelfHeading}>
              <h2 tabIndex={-1}>{collectionLabel}</h2>
              <label className={styles.search}>
                <span>
                  {t(
                    `Search ${collectionLabel.toLocaleLowerCase(locale)}`,
                    `البحث في ${collectionLabel}`,
                  )}
                </span>
                <input
                  type="search"
                  value={search}
                  placeholder={t(
                    `Find a ${singularLabel.toLocaleLowerCase(locale)}…`,
                    `ابحث عن ${singularLabel}…`,
                  )}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>
            {units.length === 0 ? (
              <section className={styles.emptyState} role="status">
                <h3>
                  {t(
                    `No ${collectionLabel.toLocaleLowerCase(locale)} match this search`,
                    `لا توجد ${collectionLabel} تطابق هذا البحث`,
                  )}
                </h3>
                <p>
                  {t(
                    `Try a different ${singularLabel.toLocaleLowerCase(locale)} name or clear the search.`,
                    `جرّب اسم ${singularLabel} آخر أو امسح البحث.`,
                  )}
                </p>
                <button type="button" onClick={() => setSearch("")}>
                  {copy.clearSearch}
                </button>
              </section>
            ) : (
              <ul className={styles.units}>
                {units.map((unit) => {
                  const href = unitHref(unit.id);
                  const name = locale === "ar" ? unit.nameAr : unit.nameEn;
                  const materials = count(unit.sourceCount);
                  const contents = (
                    <>
                      <span className={styles.subjectBook} aria-hidden="true">
                        <span />
                      </span>
                      <span className={styles.unitCopy}>
                        <span className={styles.unitHeading}>
                          <span className={styles.unitTitle}>
                            <bdi>{name}</bdi>
                          </span>
                          <span className={styles.ready}>
                            {t("Ready", "جاهزة")}
                          </span>
                        </span>
                        {materials ? (
                          <span className={styles.materialCount}>
                            {materials}
                          </span>
                        ) : null}
                      </span>
                      <span className={styles.unitAction}>
                        {href ? <span>{t("Open", "فتح")}</span> : null}
                        <FrontendIcon name="arrow" />
                      </span>
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
        )}
        <p className={styles.srOnly} role="status">
          {copy.resultsUpdated}
        </p>
      </div>
    </AppShell>
  );
}
