"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { useSyntheticNavigation } from "./product-navigation";
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
  roleLabel,
  workspace = false,
}: {
  locale: Locale;
  role?: "student" | "leader" | "admin";
  children: ReactNode;
  synthetic?: boolean;
  title?: string;
  preview?: boolean;
  roleLabel?: string | undefined;
  workspace?: boolean;
}) {
  const pathname = usePathname();
  const hosted = useSyntheticNavigation();
  const query = useSearchParams();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  useLayoutEffect(() => {
    if (title) document.title = `${title} · UniMind`;
  }, [title, pathname]);
  const prefix = preview ? "/preview" : "";
  const homeHref = `${prefix}${role === "leader" ? "/batch-leader" : role === "admin" ? "/admin" : "/learn"}?lang=${locale}`;
  const identity =
    roleLabel ??
    t(
      role === "leader"
        ? "Batch Leader"
        : role === "admin"
          ? "Admin"
          : "Student",
      role === "leader" ? "مسؤول الدفعة" : role === "admin" ? "مسؤول" : "طالب",
    );
  const menu = useRef<HTMLDetailsElement>(null);
  const adminResource = pathname.split("/").at(-1);
  const adminIndex =
    pathname === "/settings"
      ? -1
      : adminResource === "cohorts" && query.get("view") === "users"
        ? 3
        : ["sources", "campaigns"].includes(adminResource ?? "")
          ? 1
          : ["catalog", "cohorts"].includes(adminResource ?? "")
            ? 2
            : ["jobs", "quality", "usage", "incidents"].includes(
                  adminResource ?? "",
                )
              ? 4
              : 0;
  const nav: [string, string, FrontendIconName][] =
    role === "student"
      ? [
          [prefix + "/learn", t("Study", "المذاكرة"), "shelf"],
          [prefix + "/learn?view=subjects", t("Subjects", "المواد"), "sources"],
          ["/settings", t("Account", "الحساب"), "settings"],
        ]
      : role === "leader"
        ? [
            [
              prefix + "/batch-leader",
              t("Source intake", "استقبال المصادر"),
              "upload",
            ],
            [
              prefix + "/batch-leader?view=history",
              t("History", "السجل"),
              "sources",
            ],
            ["/settings", t("Account", "الحساب"), "settings"],
          ]
        : [
            [
              prefix + "/admin",
              t("Decision queue", "قائمة القرارات"),
              "shield",
            ],
            ["/admin/sources", t("Content", "المحتوى"), "sources"],
            ["/admin/catalog", t("Academics", "الدراسة"), "studio"],
            [
              "/admin/cohorts?view=users",
              t("Access context", "سياق الوصول"),
              "account",
            ],
            ["/admin/jobs", t("Operations", "العمليات"), "settings"],
          ];
  const navigation = nav.map(([href, label, icon], index) => {
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
          : index === adminIndex;
    if (role === "admin" && preview && index > 0)
      return (
        <span key={href} className={styles.previewDestination}>
          <FrontendIcon name={icon} />
          {label}
        </span>
      );
    return (
      <Link
        key={href}
        href={`${href}${href.includes("?") ? "&" : "?"}lang=${locale}` as Route}
        prefetch={false}
        aria-current={isCurrent ? "page" : undefined}
        title={label}
        data-account={href === "/settings" ? true : undefined}
        onClick={() => {
          if (menu.current) menu.current.open = false;
        }}
      >
        <FrontendIcon name={icon} />
        <span>{label}</span>
      </Link>
    );
  });
  return (
    <div
      className={styles.shell}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-role={role}
      data-layout={workspace ? "workspace" : "page"}
    >
      <a className={styles.skip} href="#app-content">
        {t("Skip to content", "تخطي إلى المحتوى")}
      </a>
      <aside
        className={styles.rail}
        aria-label={t("UniMind sidebar", "الشريط الجانبي لـUniMind")}
      >
        <div className={styles.railBrand}>
          <Brand href={homeHref} tone="dark" />
        </div>
        <div className={styles.compactBrand}>
          <Brand href={homeHref} variant="compact" tone="dark" />
        </div>
        <nav
          className={styles.globalNav}
          aria-label={t("Product navigation", "تنقل المنتج")}
        >
          {navigation}
        </nav>
        {role === "admin" && !preview ? (
          <Link
            className={styles.adminAccount}
            href={`/settings?lang=${locale}` as Route}
            prefetch={false}
          >
            {t("Account", "الحساب")}
          </Link>
        ) : null}
        <div className={styles.identity}>
          <FrontendIcon name="account" />
          <span>{identity}</span>
        </div>
        <p className={styles.slogan} lang="en" dir="ltr">
          Study deeper
          <br />
          Go further.
        </p>
      </aside>
      <div className={styles.stage}>
        <header className={styles.utility}>
          <div className={styles.mobileBrand}>
            <Brand href={homeHref} variant="compact" tone="dark" />
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
        {role === "admin" && !preview ? (
          <div
            className={styles.adminMenuRow}
            role="navigation"
            aria-label={t("Admin controls", "أدوات الإدارة")}
          >
            <details
              ref={menu}
              className={styles.adminMenu}
              onKeyDown={(event) => {
                if (event.key === "Escape" && event.currentTarget.open) {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                  event.stopPropagation();
                }
              }}
            >
              <summary>{t("Menu", "القائمة")}</summary>
              <nav
                className={styles.globalNav}
                aria-label={t("Admin navigation", "تنقل الإدارة")}
              >
                {navigation}
              </nav>
            </details>
            <Link href={`/settings?lang=${locale}` as Route} prefetch={false}>
              {t("Account", "الحساب")}
            </Link>
          </div>
        ) : null}
        {synthetic && !hosted?.active ? (
          <p className={styles.simulation} role="note">
            {t(
              "Synthetic demo · Simulated services · Reload clears demo data",
              "عرض تجريبي · خدمات محاكاة · إعادة التحميل تمسح بيانات العرض",
            )}
          </p>
        ) : null}
        <main
          id="app-content"
          className={styles.content}
          tabIndex={-1}
          lang={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
