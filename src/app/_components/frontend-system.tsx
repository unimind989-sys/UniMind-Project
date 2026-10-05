"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
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
  returnToAdmin?: boolean;
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
  returnToAdmin = false,
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
      title={`${title} · ${t("Study", "المذاكرة")}`}
      workspace
    >
      {returnToAdmin ? (
        <p className={styles.previewContext}>
          {t("Student preview", "معاينة الطالب")} ·{" "}
          <Link href={("/admin?lang=" + locale) as Route}>
            {t("Return to Admin", "العودة للإدارة")}
          </Link>
        </p>
      ) : null}
      <header className={styles.subjectHeader}>
        <div>
          <Link
            className={styles.back}
            href={
              ((preview ? "/preview/learn" : "/learn") +
                "?view=subjects&lang=" +
                locale) as Route
            }
            prefetch={false}
          >
            <FrontendIcon name="back" />
            {t("Subjects", "المواد")}
          </Link>
          <h1>
            <bdi>{title}</bdi>
          </h1>
          <p>
            <bdi>{context}</bdi>
          </p>
        </div>
        {scopeControl ? (
          <details className={styles.subjectSwitch}>
            <summary>
              <FrontendIcon name="sources" />
              {t("Switch unit", "تغيير الوحدة")}
            </summary>
            <div>{scopeControl}</div>
          </details>
        ) : null}
      </header>
      <nav
        className={styles.subjectNav}
        aria-label={t("Workspace navigation", "تنقل مساحة المذاكرة")}
      >
        {destinations.map(([suffix, label], index) => (
          <Link
            key={suffix}
            href={(base + suffix + "?lang=" + locale) as Route}
            prefetch={false}
            aria-current={
              pathname === base + suffix ||
              (suffix === "" && pathname === base + "/sources") ||
              (suffix === "/quiz" && pathname.startsWith(base + "/quiz/"))
                ? "page"
                : undefined
            }
          >
            <FrontendIcon
              name={(["sources", "chat", "studio", "quiz"] as const)[index]!}
            />
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
