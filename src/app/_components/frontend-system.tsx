"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { Locale } from "./synthetic-fixtures";
import styles from "./frontend-system.module.css";

export type FrontendIconName =
  | "shelf"
  | "chat"
  | "studio"
  | "quiz"
  | "sources"
  | "settings"
  | "back"
  | "plus"
  | "send"
  | "check"
  | "summary"
  | "cards";
export function FrontendIcon({ name }: { name: FrontendIconName }) {
  const paths: Record<FrontendIconName, ReactNode> = {
    shelf: (
      <>
        <path d="M4 4h6v13H4zM14 4h6v13h-6zM2 21h20" />
      </>
    ),
    chat: (
      <>
        <path d="M4 5h16v12H8l-4 4V5Z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    studio: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h4" />
      </>
    ),
    quiz: (
      <>
        <path d="M9 4H5v17h14V4h-4M9 2h6v4H9zM8 11l2 2 5-4M8 17h7" />
      </>
    ),
    sources: (
      <>
        <path d="M6 3h12v16H8a2 2 0 0 0 0 4h10M6 3v18M10 7h4M10 11h4" />
      </>
    ),
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="3" />
        <circle cx="15" cy="17" r="3" />
      </>
    ),
    back: <path d="m14 6-6 6 6 6M8 12h12" />,
    plus: <path d="M12 5v14M5 12h14" />,
    send: <path d="m5 12 7-7 7 7M12 5v15" />,
    check: <path d="m5 12 4 4L19 6" />,
    summary: (
      <>
        <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" />
      </>
    ),
    cards: (
      <>
        <rect x="7" y="6" width="13" height="15" rx="2" />
        <path d="M16 3H4v14M10 11h7M10 15h5" />
      </>
    ),
  };
  return (
    <svg
      className={styles.icon}
      data-directional={name === "back" || undefined}
      aria-hidden="true"
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

export function LanguageSwitch({ locale }: { locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const query = useSearchParams();
  return (
    <label className={styles.language}>
      <span>{locale === "ar" ? "لغة الواجهة" : "Interface language"}</span>
      <select
        aria-label={locale === "ar" ? "لغة الواجهة" : "Interface language"}
        value={locale}
        onChange={(event) => {
          const next = new URLSearchParams(query.toString());
          next.set("lang", event.target.value);
          router.replace(`${pathname}?${next}` as Route, { scroll: false });
        }}
      >
        <option lang="en" value="en">
          English
        </option>
        <option lang="ar" value="ar">
          العربية
        </option>
      </select>
    </label>
  );
}

type ShellProps = {
  locale: Locale;
  title: string;
  context: string;
  base: string;
  scopeControl: ReactNode;
  available: boolean;
  account: string;
  signOut: () => void;
  children: ReactNode;
};

// Checkpoint scope: inherited Study Shelf palette, fonts and existing logo.
// One compact scope header; unit navigation stays distinct from session history.
export function FrontendShell({
  locale,
  title,
  context,
  base,
  scopeControl,
  available,
  account,
  signOut,
  children,
}: ShellProps) {
  const pathname = usePathname();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const nav: [string, string, FrontendIconName][] = [
    ["", t("Overview", "نظرة عامة"), "shelf"],
    ["/chat", t("Chat", "المحادثة"), "chat"],
    ["/studio", t("Studio", "الاستوديو"), "studio"],
    ["/quiz", t("Quiz", "الاختبار"), "quiz"],
    ["/sources", t("Sources", "المصادر"), "sources"],
  ];
  const settings = `/settings?lang=${locale}`;
  return (
    <div
      className={styles.shell}
      data-overhaul="checkpoint"
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <a href="#study-content" className={styles.skip}>
        {t("Skip to content", "تخطي إلى المحتوى")}
      </a>
      <aside className={styles.rail}>
        <Link
          className={styles.brand}
          href={`/learn?lang=${locale}` as Route}
          prefetch={false}
        >
          <span className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
          </span>
          <span translate="no">UniMind</span>
        </Link>
        <Link
          className={styles.back}
          href={`/learn?lang=${locale}` as Route}
          prefetch={false}
        >
          <FrontendIcon name="back" />
          {t("Back to Study Shelf", "العودة لرف المذاكرة")}
        </Link>
        <div className={styles.scopeControl}>{scopeControl}</div>
        <nav
          aria-label={t("Workspace navigation", "تنقل مساحة المذاكرة")}
          className={styles.navigation}
        >
          {nav.map(([suffix, label, icon]) => (
            <Link
              key={suffix}
              href={`${base}${suffix}?lang=${locale}` as Route}
              prefetch={false}
              aria-current={pathname === base + suffix ? "page" : undefined}
            >
              <FrontendIcon name={icon} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.railFoot}>
          <p>
            {available
              ? t("Sample sources ready", "المصادر التجريبية جاهزة")
              : t("Unit unavailable", "الوحدة غير متاحة")}
          </p>
          <p>
            {t("One unit. One source pool.", "وحدة واحدة. مجموعة مصادر واحدة.")}
          </p>
        </div>
      </aside>
      <div className={styles.stage}>
        <header className={styles.header}>
          <div className={styles.unitTitle}>
            <h1>
              <bdi>{title}</bdi>
            </h1>
            <p>
              <bdi>{context}</bdi>
            </p>
          </div>
          <div className={styles.utilities}>
            <LanguageSwitch locale={locale} />
            <details
              className={styles.account}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
            >
              <summary>
                <FrontendIcon name="settings" />
                <span>{t("Account", "الحساب")}</span>
              </summary>
              <div>
                <p>
                  <bdi>{account}</bdi>
                </p>
                <Link href={settings as Route} prefetch={false}>
                  {t("Settings", "الإعدادات")}
                </Link>
                <button type="button" onClick={signOut}>
                  {t("Sign out", "تسجيل الخروج")}
                </button>
              </div>
            </details>
          </div>
        </header>
        <p className={styles.simulation} role="note">
          {t(
            "Synthetic demo · Simulated services · Reload clears demo data",
            "عرض تجريبي · خدمات محاكاة · إعادة التحميل تمسح بيانات العرض",
          )}
        </p>
        <main id="study-content" className={styles.content} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
