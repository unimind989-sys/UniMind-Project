"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/locale";
import { Brand } from "./brand";
import {
  FrontendIcon,
  LanguageSwitch,
  type FrontendIconName,
} from "./frontend-controls";
import styles from "./app-shell.module.css";

export function AppShell({
  locale,
  role = "student",
  children,
  synthetic = false,
  title,
  preview = false,
}: {
  locale: Locale;
  role?: "student" | "leader" | "admin";
  children: ReactNode;
  synthetic?: boolean;
  title?: string;
  preview?: boolean;
}) {
  const pathname = usePathname();
  const query = useSearchParams();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const prefix = preview ? "/preview" : "";
  const nav: [string, string, FrontendIconName][] =
    role === "student"
      ? [
          [prefix + "/learn", t("Study", "المذاكرة"), "shelf"],
          [prefix + "/learn?view=subjects", t("Subjects", "المواد"), "sources"],
          ["/settings", t("Account", "الحساب"), "settings"],
        ]
      : role === "leader"
        ? [
            [prefix + "/batch-leader", t("Uploads", "الرفع"), "plus"],
            [
              prefix + "/batch-leader?view=history",
              t("History", "السجل"),
              "sources",
            ],
            ["/settings", t("Account", "الحساب"), "settings"],
          ]
        : [
            ["/admin", t("Overview", "نظرة عامة"), "shelf"],
            ["/admin/sources", t("Content", "المحتوى"), "sources"],
            ["/admin/catalog", t("Academics", "الدراسة"), "studio"],
            ["/admin/cohorts?view=users", t("Users", "المستخدمون"), "chat"],
            ["/admin/jobs", t("Operations", "العمليات"), "settings"],
          ];
  return (
    <div
      className={styles.shell}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-role={role}
    >
      <a className={styles.skip} href="#app-content">
        {t("Skip to content", "تخطي إلى المحتوى")}
      </a>
      <aside className={styles.rail}>
        <Brand href={nav[0]![0]} />
        <nav
          className={styles.globalNav}
          aria-label={t("Product navigation", "تنقل المنتج")}
        >
          {nav.map(([href, label, icon], index) => {
            const isCurrent =
              role === "student"
                ? index ===
                  (pathname === "/settings"
                    ? 2
                    : query.get("view") === "subjects"
                      ? 1
                      : 0)
                : role === "leader"
                  ? index ===
                    (pathname === "/settings"
                      ? 2
                      : query.get("view") === "history"
                        ? 1
                        : 0)
                  : pathname === href?.split("?")[0];
            return (
              <Link
                key={href}
                href={
                  `${href}${href?.includes("?") ? "&" : "?"}lang=${locale}` as Route
                }
                prefetch={false}
                aria-current={isCurrent ? "page" : undefined}
              >
                <FrontendIcon name={icon} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <p className={styles.slogan} lang="en" dir="ltr">
          Study deeper
          <br />
          Go further.
        </p>
      </aside>
      <div className={styles.stage}>
        <header className={styles.utility}>
          <div className={styles.mobileBrand}>
            <Brand href={nav[0]![0]} variant="compact" />
          </div>
          <span className={styles.location}>
            {title ??
              t(
                role === "student"
                  ? "Study"
                  : role === "leader"
                    ? "Uploads"
                    : "Overview",
                role === "student"
                  ? "المذاكرة"
                  : role === "leader"
                    ? "الرفع"
                    : "نظرة عامة",
              )}
          </span>
          <LanguageSwitch locale={locale} />
        </header>
        {synthetic ? (
          <p className={styles.simulation} role="note">
            {t(
              "Synthetic demo · Simulated services · Reload clears demo data",
              "عرض تجريبي · خدمات محاكاة · إعادة التحميل تمسح بيانات العرض",
            )}
          </p>
        ) : null}
        <main id="app-content" className={styles.content} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
