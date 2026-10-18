"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import styles from "./frontend-system.module.css";
import { AppShell } from "./app-shell";
import { Disclosure, type DisclosureHandle } from "./disclosure";
import { FrontendIcon } from "./frontend-controls";
import { LanguageSwitch } from "./language-switch";
import { MetaList } from "./meta-list";
import { localizedHref } from "@/lib/i18n/locale";
import { SegmentedControl } from "./segmented-control";
export { FrontendIcon } from "./frontend-controls";
export type { FrontendIconName } from "./frontend-controls";

const focusable =
  'a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex]:not([tabindex="-1"])';

/**
 * Keyboard access to the study body's scroll area. Content with focusable
 * elements scrolls with them; a scrolling body without any (for example a
 * real-mode notice at 200% text) becomes a labelled focusable region.
 */
function useKeyboardScroll(label: string) {
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = body.current;
    if (!element) return;
    // Set directly in the observer callback so the region exists in the same
    // frame the overflow appears; React does not own these attributes.
    const measure = () => {
      const needed =
        element.scrollHeight > element.clientHeight + 1 &&
        element.querySelector(focusable) === null;
      if (needed) {
        element.tabIndex = 0;
        element.setAttribute("role", "region");
        element.setAttribute("aria-label", label);
      } else {
        element.removeAttribute("tabindex");
        element.removeAttribute("role");
        element.removeAttribute("aria-label");
      }
    };
    const resize = new ResizeObserver(measure);
    const observeChildren = () => {
      resize.disconnect();
      resize.observe(element);
      for (const child of element.children) resize.observe(child);
    };
    const mutation = new MutationObserver(() => {
      observeChildren();
      measure();
    });
    observeChildren();
    mutation.observe(element, { childList: true, subtree: true });
    measure();
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [label]);
  return body;
}

/**
 * The unit band's one menu (DESIGN: the session switcher on desktop, the
 * title button on phones). A study tool may portal its own section into
 * `panel` (Chat's sessions) and name its current item in the title line.
 */
export type UnitMenu = Readonly<{
  panel: HTMLElement | null;
  setLine: (line: string | null) => void;
  close: (restoreFocus?: boolean) => void;
}>;
const UnitMenuContext = createContext<UnitMenu | null>(null);
export function useUnitMenu() {
  return useContext(UnitMenuContext);
}

type ShellProps = {
  locale: Locale;
  title: string;
  unitLabel: string;
  /** Program, level and term: shown in the unit menu. */
  context: readonly string[];
  institution?: string;
  base: string;
  scopeControl?: ReactNode;
  profileName?: string | null | undefined;
  available: boolean;
  children: ReactNode;
  synthetic?: boolean;
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
  returnToAdmin = false,
  adminReturnHref,
}: ShellProps) {
  const pathname = usePathname();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const body = useKeyboardScroll(t("Study content", "محتوى المذاكرة"));
  const menu = useRef<DisclosureHandle>(null);
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [line, setLine] = useState<string | null>(null);
  const unitMenu = useMemo<UnitMenu>(
    () => ({
      panel,
      setLine,
      close: (restoreFocus) => menu.current?.close(restoreFocus),
    }),
    [panel],
  );
  const tool = pathname.includes("/chat")
    ? "chat"
    : pathname.includes("/studio")
      ? "studio"
      : pathname.includes("/quiz")
        ? "quiz"
        : "materials";
  const chat = tool === "chat";
  const destinations: readonly (readonly [string, string])[] = [
    // A short Arabic label keeps the four tools on one row at 320px (MD-07).
    ["", t("Materials", "المصادر")],
    ["/chat", t("Chat", "المحادثة")],
    ["/studio", t("Studio", "الاستوديو")],
    ["/quiz", t("Quiz", "الاختبار")],
  ];
  const details = t(`${unitLabel} details`, `تفاصيل ${unitLabel}`);
  const sessions = t("Sessions and privacy", "الجلسات والخصوصية");
  // Chat names its current session; the other tools name the details menu.
  const summaryLine = chat ? line || t("Sessions", "الجلسات") : details;
  const band = (
    <>
      {returnToAdmin ? (
        <p className={styles.previewContext} data-workspace-chrome>
          <span>{t("Student preview", "معاينة الطالب")}</span>
          <Link
            href={(adminReturnHref ?? localizedHref("/admin", locale)) as Route}
          >
            {t("Return to Admin", "العودة للإدارة")}
          </Link>
        </p>
      ) : null}
      <div className={styles.band} data-workspace-chrome>
        <header className={styles.subjectHeader}>
          <Link
            className={styles.back}
            href={localizedHref("/learn?view=subjects", locale) as Route}
            prefetch={false}
          >
            <FrontendIcon name="back" size={24} />
            <span className="visually-hidden">{t("Subjects", "المواد")}</span>
          </Link>
          <h1>
            <bdi>{title}</bdi>
          </h1>
          <Disclosure
            ref={menu}
            className={styles.unitMenu}
            summaryProps={{
              className: styles.unitSummary,
              ...(chat
                ? { "aria-label": line ? `${sessions}: ${line}` : sessions }
                : {}),
            }}
            summary={
              <>
                {/* On phones the title button shows the unit title; the h1
                    beside it stays the heading for assistive technology. */}
                <span className={styles.summaryTitle} aria-hidden="true">
                  <bdi>{title}</bdi>
                </span>
                <span className={styles.summaryLine}>
                  <FrontendIcon name={chat ? "chat" : "sources"} />
                  <bdi>{summaryLine}</bdi>
                  <FrontendIcon name="chevron" size={16} />
                </span>
              </>
            }
          >
            <div className={styles.menuPanel}>
              <div ref={setPanel} className={styles.toolMenu} />
              <section className={styles.unitDetails} aria-label={details}>
                {institution ? (
                  <p className={styles.institution}>
                    <strong>{t("Institution", "الجامعة أو النظام")}</strong>
                    <br />
                    <bdi>{institution}</bdi>
                  </p>
                ) : null}
                <MetaList
                  className={styles.unitContext}
                  items={context.map((value, index) => ({
                    key: String(index),
                    value,
                  }))}
                />
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
              </section>
              {/* Phones have no top bar inside a unit, so the interface
                  language lives here (DESIGN.md "Surfaces and shell"). */}
              <div className={styles.menuLanguage}>
                <LanguageSwitch locale={locale} tone="paper" />
              </div>
            </div>
          </Disclosure>
        </header>
        <SegmentedControl
          mode="links"
          tone="night"
          className={styles.subjectNav}
          label={t("Workspace navigation", "تنقل مساحة المذاكرة")}
          items={destinations.map(([suffix, label], index) => ({
            key: suffix,
            label,
            href: localizedHref(base + suffix, locale),
            current:
              pathname === base + suffix ||
              (suffix === "" && pathname === base + "/sources") ||
              (suffix === "/quiz" && pathname.startsWith(base + "/quiz/")),
            icon: (
              <FrontendIcon
                name={(["sources", "chat", "studio", "quiz"] as const)[index]!}
              />
            ),
          }))}
        />
      </div>
    </>
  );
  return (
    <AppShell
      locale={locale}
      profileName={profileName}
      synthetic={synthetic}
      title={`${title} · ${t("Study", "المذاكرة")}`}
      workspace
      band={band}
    >
      {!available ? (
        <p className={styles.unavailable} role="status" data-workspace-chrome>
          {t(
            `This ${unitLabel.toLowerCase()} is currently unavailable.`,
            `${unitLabel} غير متاحة حاليًا.`,
          )}
        </p>
      ) : null}
      <UnitMenuContext.Provider value={unitMenu}>
        <div ref={body} className={styles.workspaceBody} data-study-tool={tool}>
          {children}
        </div>
      </UnitMenuContext.Provider>
    </AppShell>
  );
}
