"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { curriculumUnitLabel } from "@/lib/catalog/terminology";
import {
  formatInteger,
  getDictionary,
  getTextDirection,
  type Locale,
} from "@/lib/i18n/locale";

import type {
  ShelfIcon,
  SyntheticShelf,
  SyntheticUnit,
} from "../synthetic-catalog";
import styles from "../study-shelf.module.css";

type IconName =
  | ShelfIcon
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
] as const satisfies readonly Readonly<{
  icon: IconName;
  labelKey:
    | "nav.studyShelf"
    | "nav.workspace"
    | "nav.calendar"
    | "nav.sources"
    | "nav.progress"
    | "nav.settings";
  current: boolean;
}>[];

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
    medicine: (
      <>
        <path d="M5 3v5a4 4 0 0 0 8 0V3M4 3h2M12 3h2M9 12v2a5 5 0 0 0 10 0v-1" />
        <circle cx="19" cy="10" r="2" />
      </>
    ),
    science: (
      <>
        <path d="M9 3v6l-4.5 8a2.5 2.5 0 0 0 2.2 4h10.6a2.5 2.5 0 0 0 2.2-4L15 9V3M8 3h8M7 15h10" />
      </>
    ),
    clinical: (
      <>
        <path d="M3 12v8M21 12v8M3 17h18M6 17v-5h5a3 3 0 0 1 3 3v2M6 12V7h2a3 3 0 0 1 3 3v2" />
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

function UnitCard({
  unit,
  locale,
  focused,
  onFocus,
}: Readonly<{
  unit: SyntheticUnit;
  locale: Locale;
  focused: boolean;
  onFocus: (unitId: string) => void;
}>) {
  const dictionary = getDictionary(locale);
  const direction = getTextDirection(locale);
  const progress = Math.round((unit.completedUnits / unit.totalUnits) * 100);
  const primaryName = locale === "ar" ? unit.nameAr : unit.nameEn;
  const description = locale === "ar" ? unit.descriptionAr : unit.descriptionEn;

  return (
    <li
      className={styles.unitItem}
      data-focused={focused}
      data-available={unit.available}
      data-unit-id={unit.id}
    >
      <article className={styles.unitCard}>
        <button
          className={styles.unitSelect}
          type="button"
          disabled={!unit.available}
          aria-pressed={focused}
          aria-label={`${dictionary["catalog.focusUnit"]}: ${primaryName}`}
          onClick={() => onFocus(unit.id)}
        >
          <span className={styles.unitImage}>
            <Image
              src={unit.image}
              alt=""
              fill
              sizes="(max-width: 767px) 88vw, 382px"
              {...(unit.id === "cardiovascular"
                ? { loading: "eager", fetchPriority: "high" as const }
                : {})}
            />
          </span>
          <span className={styles.unitCopy}>
            <bdi className={styles.unitName} lang={locale} dir={direction}>
              {primaryName}
            </bdi>
            {focused && unit.available ? (
              <span className={styles.readyBadge} role="status">
                <Icon name="check" className={styles.statusIcon} />
                <span lang={locale} dir={direction}>
                  {dictionary["catalog.ready"]}
                </span>
              </span>
            ) : !unit.available ? (
              <span className={styles.lockedBadge}>
                <Icon name="lock" className={styles.statusIcon} />
                <span lang={locale}>{dictionary["catalog.unavailable"]}</span>
              </span>
            ) : null}
            {!focused && unit.available ? (
              <span className={styles.progressRow}>
                <span className={styles.progressTrack} aria-hidden="true">
                  <span
                    className={styles.progressValue}
                    style={{ width: `${progress}%` }}
                  />
                </span>
                <span>
                  {formatInteger(locale, unit.completedUnits)}/
                  {formatInteger(locale, unit.totalUnits)}{" "}
                  {dictionary["catalog.units"]}
                </span>
              </span>
            ) : null}
          </span>
        </button>

        {focused && unit.available ? (
          <div className={styles.focusedDetails}>
            <div className={styles.detailGrid}>
              <p className={styles.detailLabel}>
                <strong className={styles.detailValue}>
                  {formatInteger(locale, unit.sourceCount ?? 0)}
                </strong>
                <span lang={locale} dir={direction}>
                  {dictionary["catalog.sources"]}
                </span>
              </p>
              <p className={styles.detailLabel}>
                <strong className={styles.detailValue}>
                  {dictionary["catalog.scopeValue"]}
                </strong>
                <span lang={locale} dir={direction}>
                  {dictionary["catalog.scope"]}
                </span>
              </p>
              <button
                className={styles.workspaceAction}
                type="button"
                disabled
                title={dictionary["catalog.workspacePending"]}
              >
                {dictionary["catalog.workspacePending"]}
              </button>
            </div>
            <p className={styles.unitDescription}>
              <bdi lang={locale} dir={direction}>
                {description}
              </bdi>
            </p>
          </div>
        ) : null}
      </article>
    </li>
  );
}

export function StudyShelf({
  initialLocale,
  shelves,
}: Readonly<{
  initialLocale: Locale;
  shelves: readonly SyntheticShelf[];
}>) {
  const [locale, setLocale] = useState(initialLocale);
  const [query, setQuery] = useState("");
  const [focusedUnitId, setFocusedUnitId] = useState("cardiovascular");
  const shelvesRootRef = useRef<HTMLDivElement>(null);
  const dictionary = getDictionary(locale);
  const direction = getTextDirection(locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 47.99rem)").matches) return;

    const selectedUnit = shelvesRootRef.current?.querySelector<HTMLElement>(
      `[data-unit-id="${CSS.escape(focusedUnitId)}"]`,
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    selectedUnit?.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [focusedUnitId]);

  const filteredShelves = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase(locale);
    if (normalizedQuery === "") return shelves;

    return shelves
      .map((shelf) => ({
        ...shelf,
        units: shelf.units.filter((unit) =>
          `${unit.nameEn} ${unit.nameAr}`
            .toLocaleLowerCase(locale)
            .includes(normalizedQuery),
        ),
      }))
      .filter((shelf) => shelf.units.length > 0);
  }, [locale, query, shelves]);

  function selectLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", nextLocale);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className={styles.shell} lang={locale} dir={direction}>
      <aside className={styles.productNav} aria-label="UniMind">
        <div className={styles.brand}>
          <BrandMark />
          <span className={styles.brandName}>UniMind</span>
        </div>
        <p className={styles.brandTagline}>{dictionary["brand.tagline"]}</p>
        <nav
          aria-label={
            locale === "ar" ? "التنقل في المنتج" : "Product navigation"
          }
        >
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.labelKey}>
                {item.current ? (
                  <a
                    className={styles.navItem}
                    href="/learn"
                    aria-current="page"
                    data-current="true"
                  >
                    <Icon name={item.icon} className={styles.navIcon} />
                    <span
                      className={styles.navCopy}
                      lang={locale}
                      dir={direction}
                    >
                      {dictionary[item.labelKey]}
                    </span>
                  </a>
                ) : (
                  <span className={styles.navItem} aria-disabled="true">
                    <Icon name={item.icon} className={styles.navIcon} />
                    <span
                      className={styles.navCopy}
                      lang={locale}
                      dir={direction}
                    >
                      {dictionary[item.labelKey]}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.navFooter}>
          <p lang={locale} dir={direction}>
            {locale === "ar"
              ? "بخطوات هادئة نحو مستقبل أكثر إشراقًا"
              : "A calmer path to a brighter you."}
          </p>
        </div>
      </aside>

      <main className={styles.content}>
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder={dictionary["catalog.searchPlaceholder"]}
              autoComplete="off"
            />
          </form>
          <div className={styles.utilityActions}>
            <div
              className={styles.localeSwitch}
              aria-label={locale === "ar" ? "اللغة" : "Language"}
              role="group"
            >
              <button
                className={styles.localeButton}
                type="button"
                aria-pressed={locale === "en"}
                onClick={() => selectLocale("en")}
              >
                EN
              </button>
              <button
                className={styles.localeButton}
                type="button"
                aria-pressed={locale === "ar"}
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
              <span
                className={styles.identityCopy}
                lang={locale}
                dir={direction}
              >
                {dictionary["identity.student"]}
              </span>
            </div>
          </div>
        </div>

        <header className={styles.pageHeader}>
          <div>
            <div className={styles.titleRow}>
              <h1 lang={locale} dir={direction}>
                {dictionary["catalog.heading"]}
              </h1>
            </div>
            <p className={styles.summary}>
              <span lang={locale} dir={direction}>
                {dictionary["catalog.summary"]}
              </span>
              <span className={styles.syntheticNotice} role="status">
                {dictionary["catalog.syntheticNotice"]}
              </span>
            </p>
          </div>
          <a className={styles.viewAll} href="#catalog-shelves">
            {dictionary["catalog.viewAll"]} {locale === "ar" ? "←" : "→"}
          </a>
        </header>

        <div
          id="catalog-shelves"
          ref={shelvesRootRef}
          className={styles.shelves}
          aria-live="polite"
        >
          {filteredShelves.length === 0 ? (
            <p className={styles.emptyState}>
              {dictionary["catalog.noResults"]}
            </p>
          ) : (
            filteredShelves.map((shelf) => (
              <section
                className={styles.shelf}
                key={shelf.id}
                aria-labelledby={`${shelf.id}-heading`}
              >
                <div className={styles.shelfHeading}>
                  <div className={styles.shelfTitle}>
                    <Icon name={shelf.icon} className={styles.shelfIcon} />
                    <h2
                      id={`${shelf.id}-heading`}
                      lang={locale}
                      dir={direction}
                    >
                      {locale === "ar" ? shelf.titleAr : shelf.titleEn}
                    </h2>
                  </div>
                  <div className={styles.shelfMeta}>
                    <span lang={locale} dir={direction}>
                      {locale === "ar" ? "السنة" : "Year"}{" "}
                      {formatInteger(locale, shelf.year)} ·{" "}
                      {formatInteger(locale, shelf.units.length)}{" "}
                      {curriculumUnitLabel(
                        shelf.terminology,
                        locale,
                        shelf.units.length,
                      )}
                    </span>
                  </div>
                </div>
                <ul className={styles.unitRail}>
                  {shelf.units.map((unit) => (
                    <UnitCard
                      key={unit.id}
                      unit={unit}
                      locale={locale}
                      focused={focusedUnitId === unit.id}
                      onFocus={setFocusedUnitId}
                    />
                  ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
