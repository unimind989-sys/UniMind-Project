"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Locale } from "./synthetic-fixtures";
import styles from "./frontend-system.module.css";
import { AppShell } from "./app-shell";
import { FrontendIcon } from "./frontend-controls";
export { FrontendIcon, LanguageSwitch } from "./frontend-controls";
export type { FrontendIconName } from "./frontend-controls";

type ShellProps = {
  locale: Locale;
  title: string;
  context: string;
  base: string;
  scopeControl?: ReactNode;
  available: boolean;
  account?: string;
  signOut?: () => void;
  children: ReactNode;
  synthetic?: boolean;
  preview?: boolean;
};

export function FrontendShell({
  locale,
  title,
  context,
  base,
  scopeControl,
  available,
  children,
  synthetic = true,
  preview = false,
}: ShellProps) {
  const pathname = usePathname();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const destinations = [
    ["", t("Materials", "المواد")],
    ["/chat", t("Chat", "المحادثة")],
    ["/studio", t("Studio", "الاستوديو")],
    ["/quiz", t("Quiz", "الاختبار")],
  ];
  return (
    <AppShell
      locale={locale}
      synthetic={synthetic}
      preview={preview}
      title={t("Study", "المذاكرة")}
    >
      <header className={styles.subjectHeader}>
        <div>
          <Link
            className={styles.back}
            href={
              ((preview ? "/preview/learn" : "/learn") +
                "?lang=" +
                locale) as Route
            }
            prefetch={false}
          >
            <FrontendIcon name="back" />
            {t("Study Shelf", "رف المذاكرة")}
          </Link>
          <h1>
            <bdi>{title}</bdi>
          </h1>
          <p>
            <bdi>{context}</bdi>
          </p>
        </div>
        {scopeControl ? (
          <div className={styles.subjectSwitch}>{scopeControl}</div>
        ) : null}
      </header>
      <nav
        className={styles.subjectNav}
        aria-label={t("Workspace navigation", "تنقل مساحة المذاكرة")}
      >
        {destinations.map(([suffix, label]) => (
          <Link
            key={suffix}
            href={(base + suffix + "?lang=" + locale) as Route}
            prefetch={false}
            aria-current={
              pathname === base + suffix ||
              (suffix === "" && pathname === base + "/sources")
                ? "page"
                : undefined
            }
          >
            {label}
          </Link>
        ))}
      </nav>
      {!available ? (
        <p className={styles.unavailable} role="status">
          {t(
            "This subject is currently unavailable.",
            "هذه المادة غير متاحة حاليًا.",
          )}
        </p>
      ) : null}
      <div className={styles.workspaceBody}>{children}</div>
    </AppShell>
  );
}
