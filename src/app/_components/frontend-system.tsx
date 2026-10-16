"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import styles from "./frontend-system.module.css";
import { AppShell } from "./app-shell";
import { FrontendIcon } from "./frontend-controls";
export { FrontendIcon, LanguageSwitch } from "./frontend-controls";
export type { FrontendIconName } from "./frontend-controls";

type ShellProps = {
  locale: Locale;
  title: string;
  unitLabel: string;
  context: string;
  institution?: string;
  base: string;
  scopeControl?: ReactNode;
  profileName?: string | null | undefined;
  available: boolean;
  account?: string;
  signOut?: () => void;
  children: ReactNode;
  synthetic?: boolean;
  preview?: boolean;
  returnToAdmin?: boolean;
  adminReturnHref?: string;
};

export function FrontendShell({
  locale,
  title,
  unitLabel,
  context,
  institution,
  base,
  scopeControl,
  profileName,
  available,
  children,
  synthetic = true,
  preview = false,
  returnToAdmin = false,
  adminReturnHref,
}: ShellProps) {
  const pathname = usePathname();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const destinations = [
    ["", t("Materials", "مصادر المذاكرة")],
    ["/chat", t("Chat", "المحادثة")],
    ["/studio", t("Studio", "الاستوديو")],
    ["/quiz", t("Quiz", "الاختبار")],
  ];
  return (
    <AppShell
      locale={locale}
      profileName={profileName}
      synthetic={synthetic}
      preview={preview}
      title={`${title} · ${t("Study", "المذاكرة")}`}
      workspace
    >
      {returnToAdmin ? (
        <p className={styles.previewContext} data-workspace-chrome>
          {t("Student preview", "معاينة الطالب")} ·{" "}
          <Link href={(adminReturnHref ?? "/admin?lang=" + locale) as Route}>
            {t("Return to Admin", "العودة للإدارة")}
          </Link>
        </p>
      ) : null}
      <header className={styles.subjectHeader} data-workspace-chrome>
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
          <p className={styles.scopeCaption}>
            <bdi>{context}</bdi>
          </p>
        </div>
        {institution || scopeControl ? (
          <details
            className={styles.subjectSwitch}
            onKeyDown={(event) => {
              if (event.key === "Escape" && event.currentTarget.open) {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary")?.focus();
                event.stopPropagation();
              }
            }}
          >
            <summary>
              <FrontendIcon name="sources" />
              {t(`${unitLabel} details`, `تفاصيل ${unitLabel}`)}
            </summary>
            <div>
              {institution ? (
                <p className={styles.institution}>
                  <strong>{t("Institution", "الجامعة أو النظام")}</strong>
                  <br />
                  <bdi>{institution}</bdi>
                </p>
              ) : null}
              <p>
                <bdi>{context}</bdi>
              </p>
              {scopeControl ? (
                <>
                  <h2 className={styles.switchHeading}>
                    {t(
                      `Switch ${unitLabel.toLowerCase()}`,
                      `تغيير ${unitLabel}`,
                    )}
                  </h2>
                  {scopeControl}
                </>
              ) : null}
            </div>
          </details>
        ) : null}
      </header>
      <nav
        className={styles.subjectNav}
        data-workspace-chrome
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
        <p className={styles.unavailable} role="status" data-workspace-chrome>
          {t(
            `This ${unitLabel.toLowerCase()} is currently unavailable.`,
            `${unitLabel} غير متاحة حاليًا.`,
          )}
        </p>
      ) : null}
      <div
        className={styles.workspaceBody}
        data-study-tool={
          pathname.includes("/chat")
            ? "chat"
            : pathname.includes("/studio")
              ? "studio"
              : pathname.includes("/quiz")
                ? "quiz"
                : "materials"
        }
      >
        {children}
      </div>
    </AppShell>
  );
}
