"use client";

import Image from "next/image";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { logoutAction } from "@/app/(auth)/actions";
import {
  buildCatalogHref,
  type CatalogJourney,
  type CatalogNode,
  type CatalogSelectionKey,
  type CatalogUnitNode,
  type CatalogAccessState,
} from "@/lib/catalog/catalog-journey.application";
import { getCatalogCopy } from "@/lib/i18n/catalog-copy";
import {
  formatInteger,
  getDictionary,
  getTextDirection,
  type Locale,
} from "@/lib/i18n/locale";

import type { UnitPresentation } from "../synthetic-catalog";
import styles from "../study-shelf.module.css";

type CatalogViewState = CatalogAccessState | "ERROR";
type IconName =
  | "calendar"
  | "check"
  | "grid"
  | "lock"
  | "progress"
  | "search"
  | "settings"
  | "sources"
  | "workspace";

const navItems = [
  { icon: "grid", labelKey: "nav.studyShelf", current: true },
  { icon: "workspace", labelKey: "nav.workspace", current: false },
  { icon: "calendar", labelKey: "nav.calendar", current: false },
  { icon: "sources", labelKey: "nav.sources", current: false },
  { icon: "progress", labelKey: "nav.progress", current: false },
  { icon: "settings", labelKey: "nav.settings", current: false },
] as const;

const fallbackImages = [
  "/images/study-shelf/cell-biology.png",
  "/images/study-shelf/cardiovascular.png",
  "/images/study-shelf/physiology.png",
  "/images/study-shelf/clinical-medicine.png",
] as const;

const subscribeToHydration = () => () => {};
const clientHydrationSnapshot = () => true;
const serverHydrationSnapshot = () => false;

function Icon({
  name,
  className,
}: Readonly<{ name: IconName; className?: string | undefined }>) {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="15" width="6" height="6" rx="1" />
        <rect x="15" y="15" width="6" height="6" rx="1" />
      </>
    ),
    workspace: (
      <>
        <path d="M4 19.5V5.5A2.5 2.5 0 0 1 6.5 3H18" />
        <path d="m10 18 7.8-7.8a1.7 1.7 0 0 1 2.4 2.4L12.4 20.4 9 21Z" />
        <path d="m15.8 12.2 2.4 2.4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    sources: (
      <>
        <path d="M6 3h11a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2Z" />
        <path d="M6 17a2 2 0 0 0 2 2M9 7h6" />
      </>
    ),
    progress: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l-3 2M12 3v2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <svg className={styles.brandMark} viewBox="0 0 44 44" aria-hidden="true">
      <path
        d="M3 8.5c7.5 0 12.8 2.5 17 7.5v21c-4.2-4-9.5-6-17-6Z"
        fill="currentColor"
      />
      <path
        d="M41 8.5c-7.5 0-12.8 2.5-17 7.5v21c4.2-4 9.5-6 17-6Z"
        fill="#ecf3f9"
      />
    </svg>
  );
}

function localizedName(node: CatalogNode, locale: Locale) {
  return locale === "ar" ? node.nameAr : node.nameEn;
}

function imageForUnit(unit: CatalogUnitNode, presentation?: UnitPresentation) {
  if (presentation !== undefined) return presentation.image;
  const score = [...unit.code].reduce(
    (total, character) => total + character.codePointAt(0)!,
    0,
  );
  return fallbackImages[score % fallbackImages.length] ?? fallbackImages[0];
}

function PathSelect({
  id,
  label,
  options,
  value,
  locale,
  pending,
  onChange,
}: Readonly<{
  id: CatalogSelectionKey;
  label: string;
  options: readonly CatalogNode[];
  value?: string | undefined;
  locale: Locale;
  pending: boolean;
  onChange: (key: CatalogSelectionKey, value: string) => void;
}>) {
  const catalogCopy = getCatalogCopy(locale);
  return (
    <label className={styles.pathField} data-ready={options.length > 0}>
      <span>{label}</span>
      <select
        name={id}
        value={value ?? ""}
        disabled={pending || options.length === 0}
        onChange={(event) => onChange(id, event.target.value)}
      >
        <option value="">{catalogCopy.choose}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {localizedName(option, locale)}
          </option>
        ))}
      </select>
    </label>
  );
}

function SafeState({
  state,
  locale,
  basePath,
}: Readonly<{
  state: Exclude<CatalogViewState, "READY">;
  locale: Locale;
  basePath: string;
}>) {
  const text = getCatalogCopy(locale);
  const content = {
    NO_MEMBERSHIP: [text.noMembershipTitle, text.noMembershipBody],
    COHORT_LOCKED: [text.cohortLockedTitle, text.cohortLockedBody],
    NO_CATALOG: [text.noCatalogTitle, text.noCatalogBody],
    UNIT_UNPUBLISHED: [text.unpublishedTitle, text.unpublishedBody],
    READY_SOURCE_MISSING: [text.noReadySourceTitle, text.noReadySourceBody],
    ERROR: [text.errorTitle, text.errorBody],
  } as const;
  const [title, body] = content[state];

  return (
    <section
      className={styles.safeState}
      role={state === "ERROR" ? "alert" : "status"}
    >
      <Icon
        name={state === "ERROR" ? "lock" : "sources"}
        className={styles.safeStateIcon}
      />
      <div>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {state === "ERROR" ? (
        <a className={styles.retryAction} href={`${basePath}?lang=${locale}`}>
          {text.retry}
        </a>
      ) : null}
    </section>
  );
}

function UnitCard({
  unit,
  locale,
  selected,
  pending,
  edition,
  presentation,
  eager,
  onSelect,
}: Readonly<{
  unit: CatalogUnitNode;
  locale: Locale;
  selected: boolean;
  pending: boolean;
  edition: string;
  presentation?: UnitPresentation | undefined;
  eager: boolean;
  onSelect: (unitId: string) => void;
}>) {
  const dictionary = getDictionary(locale);
  const text = getCatalogCopy(locale);
  const direction = getTextDirection(locale);
  const description =
    locale === "ar" ? presentation?.descriptionAr : presentation?.descriptionEn;

  return (
    <li
      className={styles.unitItem}
      data-focused={selected}
      data-unit-id={unit.id}
    >
      <article className={styles.unitCard}>
        <button
          className={styles.unitSelect}
          type="button"
          disabled={pending}
          aria-pressed={selected}
          aria-label={`${text.selectUnit}: ${localizedName(unit, locale)}`}
          onClick={() => onSelect(unit.id)}
        >
          <span className={styles.unitImage}>
            <Image
              src={imageForUnit(unit, presentation)}
              alt=""
              fill
              sizes="(max-width: 767px) 88vw, 382px"
              loading={eager ? "eager" : "lazy"}
              fetchPriority={eager ? "high" : "auto"}
            />
          </span>
          <span className={styles.unitCopy}>
            <bdi className={styles.unitName} lang={locale} dir={direction}>
              {localizedName(unit, locale)}
            </bdi>
            {selected ? (
              <span className={styles.readyBadge} role="status">
                <Icon name="check" className={styles.statusIcon} />
                {dictionary["catalog.ready"]}
              </span>
            ) : null}
          </span>
        </button>
        {selected ? (
          <div className={styles.focusedDetails}>
            <div className={styles.detailGrid}>
              <p className={styles.detailLabel}>
                <strong className={styles.detailValue}>
                  {formatInteger(locale, unit.sourceCount ?? 1)}
                </strong>
                <span>{text.sourceCount}</span>
              </p>
              <p className={styles.detailLabel}>
                <strong className={styles.detailValue}>
                  <bdi>{edition}</bdi>
                </strong>
                <span>{text.edition}</span>
              </p>
              <button
                className={styles.workspaceAction}
                type="button"
                disabled
                title={text.workspacePending}
              >
                {text.workspacePending}
              </button>
            </div>
            {description === undefined ? null : (
              <p className={styles.unitDescription}>
                <bdi>{description}</bdi>
              </p>
            )}
          </div>
        ) : null}
      </article>
    </li>
  );
}

export function StudyShelf({
  initialLocale,
  journey,
  state,
  basePath,
  synthetic = false,
  showLogout = false,
  unitPresentationById = {},
}: Readonly<{
  initialLocale: Locale;
  journey: CatalogJourney;
  state: CatalogViewState;
  basePath: string;
  synthetic?: boolean;
  showLogout?: boolean;
  unitPresentationById?: Readonly<Record<string, UnitPresentation>>;
}>) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientHydrationSnapshot,
    serverHydrationSnapshot,
  );
  const [pending, setPending] = useState(false);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const navigationStarted = useRef(false);
  const dictionary = getDictionary(initialLocale);
  const text = getCatalogCopy(initialLocale);
  const direction = getTextDirection(initialLocale);

  useEffect(() => {
    document.documentElement.lang = initialLocale;
    document.documentElement.dir = direction;
  }, [direction, initialLocale]);

  useEffect(() => {
    if (!navigationStarted.current) return;
    navigationStarted.current = false;
    setPending(false);
    resultsHeadingRef.current?.focus();
  }, [initialLocale, journey.canonicalQuery]);

  const filteredUnits = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(initialLocale);
    if (normalized === "") return journey.units;
    return journey.units.filter((unit) =>
      `${unit.nameEn} ${unit.nameAr}`
        .toLocaleLowerCase(initialLocale)
        .includes(normalized),
    );
  }, [initialLocale, journey.units, query]);

  function navigate(key: CatalogSelectionKey, value: string) {
    navigationStarted.current = true;
    setPending(true);
    router.push(
      buildCatalogHref(
        basePath,
        initialLocale,
        journey.selection,
        key,
        value,
      ) as Route,
    );
  }

  function selectLocale(locale: Locale) {
    navigationStarted.current = true;
    setPending(true);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", locale);
    router.replace(`${url.pathname}?${url.searchParams.toString()}` as Route);
  }

  const showCohort = journey.options.cohorts.length > 1;
  const selectedStageCode = journey.selectedStage?.code;
  const isUniversity = selectedStageCode === "UNIVERSITY";
  const isHighSchool = selectedStageCode === "HIGH_SCHOOL";
  const usesFlexibleCredits =
    journey.selectedProgram?.progressionMode === "FLEXIBLE_CREDIT";
  const showTerm = !usesFlexibleCredits || journey.options.terms.length > 1;
  const institutionLabel = isUniversity
    ? text.university
    : isHighSchool
      ? text.educationSystem
      : text.institution;
  const programLabel = isUniversity
    ? text.faculty
    : isHighSchool
      ? text.track
      : text.program;
  const levelLabel = isUniversity
    ? text.academicYear
    : isHighSchool
      ? text.schoolYear
      : text.level;
  const termLabel = isUniversity ? text.semester : text.term;
  const resultLabel =
    initialLocale === "ar"
      ? (journey.selectedProgram?.unitLabelPluralAr ??
        dictionary["catalog.heading"])
      : (journey.selectedProgram?.unitLabelPluralEn ??
        dictionary["catalog.heading"]);

  return (
    <div
      className={styles.shell}
      lang={initialLocale}
      dir={direction}
      aria-busy={!hydrated || pending}
    >
      <a className={styles.skipLink} href="#main-content">
        {initialLocale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>
      <aside className={styles.productNav} aria-label="UniMind">
        <div className={styles.brand}>
          <BrandMark />
          <span className={styles.brandName} translate="no">
            UniMind
          </span>
        </div>
        <p className={styles.brandTagline}>{dictionary["brand.tagline"]}</p>
        <nav
          aria-label={
            initialLocale === "ar" ? "التنقل في المنتج" : "Product navigation"
          }
        >
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.labelKey}>
                {item.current ? (
                  <a
                    className={styles.navItem}
                    href={`${basePath}?lang=${initialLocale}`}
                    aria-current="page"
                    data-current="true"
                  >
                    <Icon name={item.icon} className={styles.navIcon} />
                    <span className={styles.navCopy}>
                      {dictionary[item.labelKey]}
                    </span>
                  </a>
                ) : (
                  <span className={styles.navItem} aria-disabled="true">
                    <Icon name={item.icon} className={styles.navIcon} />
                    <span className={styles.navCopy}>
                      {dictionary[item.labelKey]}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.navFooter}>
          <p>
            {initialLocale === "ar"
              ? "بخطوات هادئة نحو مستقبل أكثر إشراقًا"
              : "A calmer path to a brighter you."}
          </p>
        </div>
      </aside>

      <main id="main-content" className={styles.content} tabIndex={-1}>
        <div className={styles.utilityBar}>
          <form
            className={styles.searchForm}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label className={styles.srOnly} htmlFor="catalog-search">
              {dictionary["catalog.searchLabel"]}
            </label>
            <Icon name="search" className={styles.searchIcon} />
            <input
              id="catalog-search"
              className={styles.searchInput}
              type="search"
              value={query}
              disabled={journey.units.length === 0}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dictionary["catalog.searchPlaceholder"]}
              autoComplete="off"
            />
          </form>
          <div className={styles.utilityActions}>
            <div
              className={styles.localeSwitch}
              aria-label={initialLocale === "ar" ? "اللغة" : "Language"}
              role="group"
            >
              <button
                className={styles.localeButton}
                type="button"
                aria-pressed={initialLocale === "en"}
                disabled={!hydrated || pending}
                onClick={() => selectLocale("en")}
              >
                EN
              </button>
              <button
                className={styles.localeButton}
                type="button"
                aria-pressed={initialLocale === "ar"}
                disabled={!hydrated || pending}
                onClick={() => selectLocale("ar")}
              >
                عربي
              </button>
            </div>
            <span className={styles.utilityDivider} aria-hidden="true" />
            <div className={styles.identity}>
              <span className={styles.avatar} aria-hidden="true">
                SA
              </span>
              <span className={styles.identityCopy}>
                {dictionary["identity.student"]}
              </span>
              {showLogout ? (
                <form action={logoutAction}>
                  <button className={styles.logoutAction} type="submit">
                    {initialLocale === "ar" ? "تسجيل الخروج" : "Sign out"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>

        <header className={styles.pageHeader}>
          <div>
            <h1>{dictionary["catalog.heading"]}</h1>
            <p className={styles.summary}>
              <span>{dictionary["catalog.summary"]}</span>
              {synthetic ? (
                <span className={styles.syntheticNotice} role="status">
                  {text.syntheticNotice}
                </span>
              ) : null}
            </p>
          </div>
        </header>

        {state === "READY" ? (
          <>
            <section
              className={styles.pathPanel}
              aria-labelledby="catalog-path-heading"
            >
              <div className={styles.pathIntro}>
                <h2 id="catalog-path-heading">{text.pathHeading}</h2>
                <p>{text.pathSummary}</p>
              </div>
              <div className={styles.pathGrid}>
                <PathSelect
                  id="stage"
                  label={text.stage}
                  options={journey.options.stages}
                  value={journey.selection.stageId}
                  locale={initialLocale}
                  pending={!hydrated || pending}
                  onChange={navigate}
                />
                <PathSelect
                  id="institution"
                  label={institutionLabel}
                  options={journey.options.institutions}
                  value={journey.selection.institutionId}
                  locale={initialLocale}
                  pending={!hydrated || pending}
                  onChange={navigate}
                />
                <PathSelect
                  id="program"
                  label={programLabel}
                  options={journey.options.programs}
                  value={journey.selection.programId}
                  locale={initialLocale}
                  pending={!hydrated || pending}
                  onChange={navigate}
                />
                <PathSelect
                  id="level"
                  label={levelLabel}
                  options={journey.options.levels}
                  value={journey.selection.levelId}
                  locale={initialLocale}
                  pending={!hydrated || pending}
                  onChange={navigate}
                />
                {showTerm ? (
                  <PathSelect
                    id="term"
                    label={termLabel}
                    options={journey.options.terms}
                    value={journey.selection.termId}
                    locale={initialLocale}
                    pending={!hydrated || pending}
                    onChange={navigate}
                  />
                ) : null}
                {showCohort ? (
                  <PathSelect
                    id="cohort"
                    label={text.cohort}
                    options={journey.options.cohorts}
                    value={journey.selection.cohortId}
                    locale={initialLocale}
                    pending={!hydrated || pending}
                    onChange={navigate}
                  />
                ) : null}
              </div>
              {usesFlexibleCredits ? (
                <div className={styles.flexiblePathNotice} role="status">
                  <strong>{text.flexibleCourseHeading}</strong>
                  <span>{text.flexibleCourseBody}</span>
                </div>
              ) : null}
              <p className={styles.navigationStatus} aria-live="polite">
                {!hydrated || pending
                  ? text.navigationPending
                  : text.resultsUpdated}
              </p>
            </section>

            <section
              id="catalog-shelves"
              className={styles.shelves}
              aria-labelledby="catalog-results-heading"
            >
              <div className={styles.shelfHeading}>
                <div className={styles.shelfTitle}>
                  <Icon name="sources" className={styles.shelfIcon} />
                  <h2
                    id="catalog-results-heading"
                    ref={resultsHeadingRef}
                    tabIndex={-1}
                  >
                    {resultLabel}
                  </h2>
                </div>
                {journey.selectedCohort ? (
                  <span className={styles.shelfMeta}>
                    <bdi>
                      {localizedName(journey.selectedCohort, initialLocale)}
                    </bdi>
                  </span>
                ) : null}
              </div>

              {journey.units.length === 0 ? (
                <div className={styles.emptyState} role="status">
                  <h3>{text.choosePathTitle}</h3>
                  <p>{text.choosePathBody}</p>
                </div>
              ) : filteredUnits.length === 0 ? (
                <div className={styles.emptyState} role="status">
                  <h3>{text.noSearchTitle}</h3>
                  <p>{text.noSearchBody}</p>
                  <button type="button" onClick={() => setQuery("")}>
                    {text.clearSearch}
                  </button>
                </div>
              ) : (
                <ul className={styles.unitRail} aria-live="polite">
                  {filteredUnits.map((unit, index) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      locale={initialLocale}
                      selected={journey.selection.unitId === unit.id}
                      pending={!hydrated || pending}
                      edition={journey.selectedCohort?.curriculumEdition ?? "—"}
                      presentation={unitPresentationById[unit.id]}
                      eager={index === 0}
                      onSelect={(unitId) => navigate("unit", unitId)}
                    />
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          <SafeState state={state} locale={initialLocale} basePath={basePath} />
        )}
      </main>
    </div>
  );
}
