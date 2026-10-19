"use client";

import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { useHostedSynthetic } from "./product-navigation";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import { localizedHref, type Locale } from "@/lib/i18n/locale";
import { useProductProfileName } from "./product-profile";
import { Brand } from "./brand";
import { Disclosure, type DisclosureHandle } from "./disclosure";
import { FrontendIcon, type FrontendIconName } from "./frontend-controls";
import { LanguageSwitch } from "./language-switch";
import styles from "./app-shell.module.css";

/** A focused field that raises a phone's on-screen keyboard. */
function isTextField(element: Element | null) {
  if (element instanceof HTMLTextAreaElement) return true;
  if (element instanceof HTMLInputElement)
    return ![
      "button",
      "checkbox",
      "color",
      "file",
      "hidden",
      "image",
      "radio",
      "range",
      "reset",
      "submit",
    ].includes(element.type);
  return element instanceof HTMLElement && element.isContentEditable;
}

/** A shrink larger than this, while a field has focus, is a keyboard. */
const keyboardShrink = 120;

export function AppShell({
  locale,
  role = "student",
  children,
  band,
  synthetic = false,
  title,
  roleLabel,
  workspace = false,
  profileName,
}: {
  locale: Locale;
  role?: "student" | "leader" | "admin";
  children: ReactNode;
  /** A full-width Night band above the padded content (DESIGN "band"). */
  band?: ReactNode;
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
  const homeHref = localizedHref(
    role === "leader"
      ? "/batch-leader"
      : role === "admin"
        ? "/admin"
        : "/learn",
    locale,
  );
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
  const menu = useRef<DisclosureHandle>(null);
  const workspaceRoot = useRef<HTMLDivElement>(null);
  /*
   * The unit workspace measures its chrome once per frame and picks a flow:
   * `pane` docks Chat's composer and scrolls only the conversation; `page`
   * scrolls the document. Phones scroll the document for every tool except
   * Chat, and for Chat only when the docked layout would leave under 160px to
   * read. A phone keyboard (a focused field and a viewport at least 120px
   * shorter than before it had focus) sets `data-keyboard` instead of
   * changing the flow, so the composer stays docked above the keyboard.
   */
  useLayoutEffect(() => {
    const root = workspaceRoot.current;
    if (!workspace || !root) return;
    let frame = 0;
    let previousChrome: number | null = null;
    let previousHeight: number | null = null;
    let restingHeight: number | null = null;
    const measure = () => {
      frame = 0;
      const phone = window.innerWidth < 768;
      const height = Math.min(
        window.innerHeight,
        window.visualViewport?.height ?? window.innerHeight,
      );
      const focused = document.activeElement;
      const typing =
        phone &&
        focused instanceof HTMLElement &&
        root.contains(focused) &&
        isTextField(focused);
      if (!typing || restingHeight === null || height > restingHeight)
        restingHeight = height;
      const keyboard = typing && restingHeight - height > keyboardShrink;
      if (keyboard) {
        root.dataset.keyboard = "open";
        // iOS resizes only the visual viewport: size the shell to it.
        root.style.setProperty("--workspace-height", `${height}px`);
      } else {
        delete root.dataset.keyboard;
        root.style.removeProperty("--workspace-height");
      }
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
      const navigationHeight = navigation?.getBoundingClientRect().height ?? 0;
      const tool = root
        .querySelector("[data-study-tool]")
        ?.getAttribute("data-study-tool");
      const flowHeight = keyboard ? restingHeight : height;
      const flow =
        phone &&
        (tool !== "chat" || flowHeight - chrome - navigationHeight < 160)
          ? "page"
          : "pane";
      root.dataset.workspaceFlow = flow;
      if (
        previousChrome !== null &&
        previousHeight !== null &&
        (Math.abs(previousChrome - chrome) > 1 ||
          Math.abs(previousHeight - height) > 1) &&
        phone &&
        focused instanceof HTMLElement &&
        root.contains(focused) &&
        focused.matches("input,textarea,select,button,a")
      ) {
        focused.scrollIntoView({
          block: flow === "page" ? "center" : "nearest",
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
    content.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-study-tool"],
    });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    root.addEventListener("focusin", schedule);
    root.addEventListener("focusout", schedule);
    observe();
    measure();
    return () => {
      resize.disconnect();
      content.disconnect();
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      root.removeEventListener("focusin", schedule);
      root.removeEventListener("focusout", schedule);
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
            // DESIGN IA: "History" (the page itself is "Latest submissions").
            ["/batch-leader?view=history", t("History", "السجل"), "sources"],
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
        href={localizedHref(href, locale) as Route}
        prefetch={false}
        aria-current={isCurrent ? "page" : undefined}
        data-account={href === "/settings" ? true : undefined}
        aria-describedby={
          role === "student" && href === "/settings"
            ? profileDestinationId
            : undefined
        }
        onClick={() => menu.current?.close()}
      >
        {role === "student" && href === "/settings" ? (
          <>
            <span className={styles.profileMarker}>
              <b className={styles.profileAvatar} aria-hidden="true">
                {initial}
              </b>
              <span
                id={profileDestinationId}
                className={`visually-hidden ${styles.profileDestination}`}
                aria-hidden="true"
              >
                {t("Settings", "الإعدادات")}
              </span>
            </span>
            <bdi className={styles.profileName}>{name}</bdi>
          </>
        ) : (
          <>
            <FrontendIcon name={icon} size={24} />
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
      <header className={styles.topbar} data-workspace-chrome>
        <div className={styles.railBrand}>
          <Brand href={homeHref} tone="dark" />
        </div>
        <div className={styles.compactBrand}>
          <Brand href={homeHref} variant="compact" tone="dark" />
        </div>
        {role === "admin" ? (
          // Below 1200px the five destinations sit behind one labelled menu
          // in the bar itself (DESIGN: "a labelled compact menu").
          <Disclosure
            ref={menu}
            className={styles.adminMenu}
            summary={t("Menu", "القائمة")}
          >
            <div className={styles.adminMenuPanel}>
              <nav
                className={styles.globalNav}
                aria-label={t("Admin navigation", "تنقل الإدارة")}
              >
                {navigation}
              </nav>
              <Link
                className={styles.adminMenuAccount}
                href={localizedHref("/settings", locale) as Route}
                prefetch={false}
                onClick={() => menu.current?.close()}
              >
                {t("Account", "الحساب")}
              </Link>
            </div>
          </Disclosure>
        ) : null}
        <nav
          className={styles.globalNav}
          aria-label={t("Product navigation", "تنقل المنتج")}
        >
          {navigation}
        </nav>
        <div className={styles.utility}>
          <LanguageSwitch locale={locale} />
          {role === "admin" ? (
            <Link
              className={styles.adminAccount}
              href={localizedHref("/settings", locale) as Route}
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
        </div>
      </header>
      <div className={styles.stage}>
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
          data-band={band ? "" : undefined}
          tabIndex={-1}
          lang={locale}
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {band ? (
            <>
              {band}
              {/* A page band ends in the folio's curved edge (DESIGN.md);
                  a unit workspace keeps a flat band, since it measures
                  its chrome. */}
              {workspace ? null : (
                <div className={styles.bandEdge} aria-hidden="true" />
              )}
              <div className={styles.body}>{children}</div>
            </>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
