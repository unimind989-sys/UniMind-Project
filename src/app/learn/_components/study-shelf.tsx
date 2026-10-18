"use client";
import { useHostedSynthetic } from "@/app/_components/product-navigation";
import { buttonLook } from "@/app/_components/button-look";
import { Button } from "@/app/_components/product-ui";
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
import { localizedHref, type Locale } from "@/lib/i18n/locale";
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
  const band = (
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
        {!subjects && context ? (
          // The academic line is itself the way to change it (MD-17).
          <Link
            className={styles.contextLink}
            href={`/settings?lang=${locale}&section=academic` as Route}
          >
            <span className="visually-hidden">
              {t("Academic settings", "الإعدادات الدراسية")}:{" "}
            </span>
            <bdi>{context}</bdi>
            <FrontendIcon name="settings" size={16} />
          </Link>
        ) : (
          <p>
            {context ||
              t(
                "Your subjects and materials, together.",
                "موادك ومصادرك في مكان واحد.",
              )}
          </p>
        )}
        {!subjects && !context ? (
          <Link
            className={styles.contextLink}
            href={`/settings?lang=${locale}&section=academic` as Route}
          >
            {t("Academic settings", "الإعدادات الدراسية")}
          </Link>
        ) : null}
      </div>
      {ready && !subjects ? (
        <section className={styles.resume} data-plane="cobalt">
          <div className={styles.planeText}>
            {resumeName ? (
              <>
                <h2 className={styles.planeLabel}>
                  <span className={styles.planePill}>
                    <bdi>{resumeName}</bdi>
                  </span>
                  <span className="visually-hidden"> · </span>
                  <span>{resumeTool}</span>
                </h2>
                {resumeAddress && lastStudyDetails ? (
                  <p className={styles.recentTitle}>
                    <bdi>{lastStudyDetails.title}</bdi>
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className={styles.planeLabel}>
                  <span className={styles.planePill}>
                    {t("Start here", "ابدأ من هنا")}
                  </span>
                </p>
                <h2>
                  {startName ? (
                    <>
                      {t("Start in", "ابدأ في")} <bdi>{startName}</bdi>
                    </>
                  ) : (
                    t("Start studying", "ابدأ المذاكرة")
                  )}
                </h2>
              </>
            )}
            {resumeAddress && lastStudyDetails ? (
              <p className={styles.planeDetail}>{lastStudyDetails.detail}</p>
            ) : null}
            {/* The resume card names what to resume; only the local
                    demo adds its tab-boundary note (MD-17, WP03 D4). */}
            {resumeAddress && (!synthetic || hosted) ? null : (
              <p className={styles.planeNote}>
                {resumeAddress
                  ? t(
                      "Only the latest work in this tab is shown. Reload starts fresh.",
                      "يظهر آخر عمل في هذا التبويب فقط. إعادة التحميل تبدأ من جديد.",
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
            )}
          </div>
          <Link
            {...buttonLook(
              { variant: "primary", tone: "cobalt", size: "large" },
              styles.open,
            )}
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
  );
  return (
    <AppShell
      locale={locale}
      synthetic={synthetic}
      profileName={profileName}
      title={subjects ? t("Subjects", "المواد") : t("Study", "المذاكرة")}
      band={band}
    >
      <div
        className={styles.content}
        data-view={subjects ? "subjects" : "study"}
        data-resume={ready && !subjects ? "" : undefined}
      >
        {state !== "READY" ? (
          <section
            className={styles.emptyState}
            role={state === "ERROR" ? "alert" : "status"}
          >
            <h2>{safe[state][0]}</h2>
            <p>{safe[state][1]}</p>
            {state === "ERROR" ? (
              <Link
                {...buttonLook({ variant: "primary" })}
                href={localizedHref(basePath, locale) as Route}
              >
                {copy.retry}
              </Link>
            ) : null}
          </section>
        ) : journey.units.length === 0 ? (
          <section className={styles.emptyState} role="status">
            <h2>{copy.choosePathTitle}</h2>
            <p>{copy.choosePathBody}</p>
            {!subjects ? (
              <Link
                {...buttonLook({ variant: "primary" })}
                href={localizedHref("/settings", locale) as Route}
              >
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
                <Link className={styles.browseLink} href={browseHref}>
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
              {/* The h1 already names the list; this heading keeps the
                  structure for assistive technology (MD-15). */}
              <h2 className="visually-hidden">{collectionLabel}</h2>
              {/* A search landmark with a filter field (IX-12). */}
              <search className={styles.searchLandmark}>
                <label className={styles.search}>
                  <span>
                    {t(
                      `Search ${collectionLabel.toLocaleLowerCase(locale)}`,
                      `البحث في ${collectionLabel}`,
                    )}
                  </span>
                  <input
                    type="search"
                    name="q"
                    value={search}
                    placeholder={t(
                      `Find a ${singularLabel.toLocaleLowerCase(locale)}…`,
                      `ابحث عن ${singularLabel}…`,
                    )}
                    autoComplete="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    aria-describedby="subjects-shown"
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </search>
              {/* The count is live, so typing announces what the filter
                  leaves; it only exists in the Subjects view. */}
              <p id="subjects-shown" className="visually-hidden" role="status">
                {locale === "ar"
                  ? `${collectionLabel} المعروضة: ${new Intl.NumberFormat("ar-EG").format(units.length)}`
                  : `${new Intl.NumberFormat("en").format(units.length)} ${(units.length === 1 ? singularLabel : collectionLabel).toLocaleLowerCase("en")} shown`}
              </p>
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
                <Button onClick={() => setSearch("")}>
                  {copy.clearSearch}
                </Button>
              </section>
            ) : (
              <ul className={styles.units}>
                {units.map((unit) => {
                  const href = unitHref(unit.id);
                  const name = locale === "ar" ? unit.nameAr : unit.nameEn;
                  const materials = count(unit.sourceCount);
                  const contents = (
                    <>
                      <span className={styles.unitCopy}>
                        <span className={styles.unitHeading}>
                          <span className={styles.unitTitle}>
                            <bdi>{name}</bdi>
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
      </div>
    </AppShell>
  );
}
