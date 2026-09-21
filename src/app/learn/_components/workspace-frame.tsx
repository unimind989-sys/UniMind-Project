"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";
import type {
  WorkspaceLocale,
  WorkspaceScope,
} from "@/lib/workspace/workspace.application";

import styles from "../workspace.module.css";

type WorkspaceFrameProps = Readonly<{
  scope: WorkspaceScope;
  children: ReactNode;
  preview?: boolean;
}>;

type IconName = "overview" | "chat" | "studio" | "quiz" | "back" | "check";

function Icon({ name }: Readonly<{ name: IconName }>) {
  const paths: Record<IconName, ReactNode> = {
    overview: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    chat: (
      <>
        <path d="M5 18.5 3.5 21v-5A8.5 8.5 0 1 1 7 19.2" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    studio: (
      <>
        <path d="M6 3h12v18H6z" />
        <path d="M9 7h6M9 11h6M9 15h4" />
      </>
    ),
    quiz: (
      <>
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2Z" />
        <path d="M10 8a2 2 0 1 1 2.8 1.8c-.8.4-.8 1.2-.8 1.2M12 14h.01" />
      </>
    ),
    back: (
      <>
        <path d="m15 18-6-6 6-6" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function localized(
  scope: WorkspaceScope,
  locale: WorkspaceLocale,
  key: "stage" | "institution" | "program" | "level" | "term" | "unit",
) {
  const suffix = locale === "ar" ? "Ar" : "En";
  const names = {
    stage: scope[`stageName${suffix}`],
    institution: scope[`institutionName${suffix}`],
    program: scope[`programName${suffix}`],
    level: scope[`levelName${suffix}`],
    term: scope[`termName${suffix}`],
    unit: scope[`unitTitle${suffix}`],
  } as const;
  return names[key];
}

export function WorkspaceFrame({
  scope,
  children,
  preview = false,
}: WorkspaceFrameProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale: WorkspaceLocale =
    searchParams.get("lang") === "ar" ? "ar" : "en";
  const text = getWorkspaceCopy(locale);
  const base = `${preview ? "/preview/learn" : "/learn"}/${scope.cohortId}/${scope.unitId}`;
  const direction = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  const localeHref = (nextLocale: WorkspaceLocale) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("lang", nextLocale);
    return `${pathname}?${next.toString()}`;
  };
  const nav = [
    { path: "", label: text.overview, icon: "overview" as const },
    { path: "/chat", label: text.chat, icon: "chat" as const },
    { path: "/studio", label: text.studio, icon: "studio" as const },
    { path: "/quiz", label: text.quiz, icon: "quiz" as const },
  ];
  const materialDate = new Intl.DateTimeFormat(
    locale === "ar" ? "ar-EG" : "en-GB",
    {
      dateStyle: "medium",
    },
  ).format(new Date(scope.materialUpdatedAt));

  return (
    <div
      className={styles.workspace}
      lang={locale}
      dir={direction}
      data-locale={locale}
    >
      <a className={styles.skipLink} href="#workspace-content">
        {text.overview}
      </a>
      <aside className={styles.rail}>
        <Link
          className={styles.brand}
          href={
            `${preview ? "/preview/learn" : "/learn"}?lang=${locale}` as Route
          }
        >
          <span className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
          </span>
          <span>UniMind</span>
        </Link>
        <Link
          className={styles.backLink}
          href={
            `${preview ? "/preview/learn" : "/learn"}?lang=${locale}` as Route
          }
        >
          <Icon name="back" />
          {text.backToShelf}
        </Link>
        <nav aria-label={text.productNavigation}>
          <ul className={styles.navList}>
            {nav.map((item) => {
              const href = `${base}${item.path}?lang=${locale}`;
              const active =
                item.path === ""
                  ? pathname === base
                  : pathname === `${base}${item.path}`;
              return (
                <li key={item.path}>
                  <Link
                    className={styles.navLink}
                    data-active={active}
                    aria-current={active ? "page" : undefined}
                    href={href as Route}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={styles.railStatus}>
          <Icon name="check" />
          <span>{text.ready}</span>
        </div>
      </aside>

      <div className={styles.stage}>
        <header className={styles.utility}>
          <div className={styles.localeSwitch} aria-label="Language">
            <Link
              aria-current={locale === "en" ? "page" : undefined}
              href={localeHref("en") as Route}
            >
              EN
            </Link>
            <Link
              aria-current={locale === "ar" ? "page" : undefined}
              href={localeHref("ar") as Route}
            >
              عربي
            </Link>
          </div>
          {preview ? (
            <span className={styles.previewBadge}>{text.synthetic}</span>
          ) : null}
        </header>

        <div className={styles.content}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            {["institution", "program", "level", "term", "unit"].map(
              (key, index) => (
                <span key={key}>
                  <bdi>
                    {localized(
                      scope,
                      locale,
                      key as
                        "institution" | "program" | "level" | "term" | "unit",
                    )}
                  </bdi>
                  {index < 4 ? <span aria-hidden="true">/</span> : null}
                </span>
              ),
            )}
          </nav>
          <section className={styles.workspaceHeader}>
            <div>
              <p className={styles.contextLabel}>{text.workspaceFor}</p>
              <h1>
                <bdi>{localized(scope, locale, "unit")}</bdi>
              </h1>
              <p className={styles.scopeLine}>
                <bdi>{scope.cohortName}</bdi> ·{" "}
                <bdi>{scope.curriculumEdition}</bdi>
              </p>
            </div>
            <div className={styles.readyBadge} role="status">
              <Icon name="check" />
              {text.ready}
            </div>
          </section>

          <dl className={styles.statusGrid}>
            <div>
              <dt>{text.sourceStatus}</dt>
              <dd>
                {scope.sourceCount} {text.approvedSources}
              </dd>
            </div>
            <div>
              <dt>{text.materialUpdate}</dt>
              <dd>{materialDate}</dd>
            </div>
            <div>
              <dt>{text.quota}</dt>
              <dd>{text.quotaUnavailable}</dd>
            </div>
            <div>
              <dt>{text.edition}</dt>
              <dd>
                <bdi>{scope.curriculumEdition}</bdi>
              </dd>
            </div>
          </dl>

          <main id="workspace-content" className={styles.main} tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
