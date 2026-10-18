"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";
import styles from "./frontend-system.module.css";
import { AppShell } from "./app-shell";
import { FrontendIcon } from "./frontend-controls";
import { localizedHref } from "@/lib/i18n/locale";
import { MetaList } from "./meta-list";
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

type ShellProps = {
  locale: Locale;
  title: string;
  unitLabel: string;
  /** Program, level and term: shown as structured metadata. */
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
  const destinations: readonly (readonly [string, string])[] = [
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
      title={`${title} · ${t("Study", "المذاكرة")}`}
      workspace
    >
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
          <div>
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
            <MetaList
              className={styles.scopeCaption}
              items={context.map((value, index) => ({
                key: String(index),
                value,
              }))}
            />
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
                  <bdi>{context.join(locale === "ar" ? "، " : ", ")}</bdi>
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
      {!available ? (
        <p className={styles.unavailable} role="status" data-workspace-chrome>
          {t(
            `This ${unitLabel.toLowerCase()} is currently unavailable.`,
            `${unitLabel} غير متاحة حاليًا.`,
          )}
        </p>
      ) : null}
      <div
        ref={body}
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
