"use client";

import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { useHostedSynthetic } from "./product-navigation";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import type { Locale } from "@/lib/i18n/locale";
import { useProductProfileName } from "./product-profile";
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
  roleLabel,
  workspace = false,
  profileName,
}: {
  locale: Locale;
  role?: "student" | "leader" | "admin";
  children: ReactNode;
  synthetic?: boolean;
  title?: string;
  roleLabel?: string | undefined;
  workspace?: boolean;
  profileName?: string | null | undefined;
}) {
  const sampleName = useProductProfileName();
  const name =
    profileName?.trim() ||
    sampleName ||
    (locale === "ar" ? "ملفك الشخصي" : "Your profile");
  const initial = Array.from(name)[0]?.toLocaleUpperCase(locale) ?? "?";
  const profileDestinationId = useId();
  const pathname = usePathname();
  const hosted = useHostedSynthetic();
  const query = useSearchParams();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  useLayoutEffect(() => {
    if (title) document.title = `${title} · UniMind`;
  }, [title, pathname]);
  const homeHref = `${role === "leader" ? "/batch-leader" : role === "admin" ? "/admin" : "/learn"}?lang=${locale}`;
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
  const workspaceRoot = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = workspaceRoot.current;
    if (!workspace || !root) return;
    let frame = 0;
    let previousChrome: number | null = null;
    let previousHeight: number | null = null;
    const measure = () => {
      frame = 0;
      const height = Math.min(
        window.innerHeight,
        window.visualViewport?.height ?? window.innerHeight,
      );
      const chrome = Array.from(
        root.querySelectorAll<HTMLElement>("[data-workspace-chrome]"),
      ).reduce((total, element) => {
        const box = element.getBoundingClientRect();
        if (!box.width || !box.height) return total;
        const style = getComputedStyle(element);
        return (
          total +
          box.height +
          parseFloat(style.marginTop || "0") +
          parseFloat(style.marginBottom || "0")
        );
      }, 0);
      const navigation = root.querySelector<HTMLElement>(
        `nav.${styles.globalNav}`,
      );
      const navigationHeight = navigation?.getBoundingClientRect().height ?? 64;
      root.dataset.workspaceFlow =
        window.innerWidth < 768 && height - chrome - navigationHeight < 160
          ? "page"
          : "pane";
      const focused = document.activeElement;
      if (
        previousChrome !== null &&
        previousHeight !== null &&
        (Math.abs(previousChrome - chrome) > 1 ||
          Math.abs(previousHeight - height) > 1) &&
        window.innerWidth < 768 &&
        focused instanceof HTMLElement &&
        root.contains(focused) &&
        focused.matches("input,textarea,select,button,a")
      ) {
        focused.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "instant",
        });
      }
      previousChrome = chrome;
      previousHeight = height;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    const observe = () => {
      resize.disconnect();
      root
        .querySelectorAll<HTMLElement>("[data-workspace-chrome]")
        .forEach((element) => resize.observe(element));
      schedule();
    };
    const content = new MutationObserver(observe);
    content.observe(root, { childList: true, subtree: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    observe();
    measure();
    return () => {
      resize.disconnect();
      content.disconnect();
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, [workspace]);
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
          ["/learn", t("Study", "المذاكرة"), "shelf"],
          ["/learn?view=subjects", t("Subjects", "المواد"), "sources"],
          ["/settings", name, "account"],
        ]
      : role === "leader"
        ? [
            ["/batch-leader", t("Source intake", "استلام المصادر"), "upload"],
            [
              "/batch-leader?view=history",
              t("Latest submissions", "آخر الإرسالات"),
              "sources",
            ],
            ["/settings", t("Account", "الحساب"), "settings"],
          ]
        : [
            ["/admin", t("Decision queue", "قائمة القرارات"), "shield"],
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
    return (
      <Link
        key={href}
        href={`${href}${href.includes("?") ? "&" : "?"}lang=${locale}` as Route}
        prefetch={false}
        aria-current={isCurrent ? "page" : undefined}
        title={label}
        data-account={href === "/settings" ? true : undefined}
        aria-describedby={
          role === "student" && href === "/settings"
            ? profileDestinationId
            : undefined
        }
        onClick={() => {
          if (menu.current) menu.current.open = false;
        }}
      >
        {role === "student" && href === "/settings" ? (
          <>
            <span className={styles.profileMarker}>
              <b className={styles.profileAvatar} aria-hidden="true">
                {initial}
              </b>
              <span
                id={profileDestinationId}
                className={styles.profileDestination}
                aria-hidden="true"
              >
                {t("Settings", "الإعدادات")}
              </span>
            </span>
            <bdi className={styles.profileName}>{name}</bdi>
          </>
        ) : (
          <>
            <FrontendIcon name={icon} />
            <span>{label}</span>
          </>
        )}
      </Link>
    );
  });
  return (
    <div
      ref={workspaceRoot}
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
        {role === "admin" ? (
          <Link
            className={styles.adminAccount}
            href={`/settings?lang=${locale}` as Route}
            prefetch={false}
          >
            {t("Account", "الحساب")}
          </Link>
        ) : null}
        {role !== "student" ? (
          <div className={styles.identity}>
            <FrontendIcon name="account" />
            <span>{identity}</span>
          </div>
        ) : null}
      </aside>
      <div className={styles.stage}>
        <header className={styles.utility} data-workspace-chrome>
          <div className={styles.mobileBrand}>
            <Brand href={homeHref} variant="compact" tone="dark" />
          </div>
          <span className={styles.location}>
            {title ??
              t(
                role === "student"
                  ? "Study"
                  : role === "leader"
                    ? "Source intake"
                    : "Overview",
                role === "student"
                  ? "المذاكرة"
                  : role === "leader"
                    ? "استلام المصادر"
                    : "نظرة عامة",
              )}
          </span>
          <LanguageSwitch locale={locale} />
        </header>
        {role === "admin" ? (
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
        {synthetic && !hosted ? (
          <p className={styles.simulation} role="note" data-workspace-chrome>
            {t(
              "Synthetic demo · Simulated services · Reload clears demo data",
              "عرض تجريبي · خدمات محاكاة · إعادة التحميل تمسح بيانات العرض",
            )}
            {" · "}
            {t("Demo clock", "ساعة العرض التجريبي")}:{" "}
            <bdi>{syntheticDemoTime.clockLabel}</bdi>
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
