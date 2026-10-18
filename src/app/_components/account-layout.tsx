"use client";

import { useId, useRef, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/locale";
import styles from "./student-account.module.css";

export type AccountView = { id: string; label: string; content: ReactNode };
export function AccountLayout({
  locale,
  views,
  returnAction,
  identity,
  signOutAction,
}: {
  locale: Locale;
  views: readonly AccountView[];
  returnAction?: ReactNode;
  identity?: { name: string | null; role: string };
  signOutAction?: ReactNode;
}) {
  const query = useSearchParams();
  const prefix = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const requested = views.findIndex((view) => view.id === query.get("section"));
  const selected = requested < 0 ? 0 : requested;
  // Switching sections stays on the client: Next syncs useSearchParams with
  // the native History API, so the URL keeps the section for reloads and
  // links without re-running the page's server loaders.
  function select(index: number) {
    const url = new URL(window.location.href);
    url.searchParams.set("section", views[index]!.id);
    window.history.replaceState(null, "", url);
  }
  return (
    <>
      {identity || signOutAction ? (
        <div className={styles.accountSummary}>
          {identity ? (
            <p>
              {identity.name ? <bdi>{identity.name}</bdi> : null}
              <small>{identity.role}</small>
            </p>
          ) : null}
          {signOutAction}
        </div>
      ) : null}
      {returnAction ? (
        <div className={styles.returnAction}>{returnAction}</div>
      ) : null}
      <div className={styles.layout}>
        <div
          className={styles.sectionNav}
          role="tablist"
          aria-label={locale === "ar" ? "أقسام الحساب" : "Account sections"}
        >
          {views.map((view, index) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              ref={(button) => {
                buttons.current[index] = button;
              }}
              id={`${prefix}-tab-${view.id}`}
              aria-controls={`${prefix}-panel-${view.id}`}
              aria-selected={index === selected}
              tabIndex={index === selected ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(event) => {
                const forward = locale === "ar" ? "ArrowLeft" : "ArrowRight";
                const backward = locale === "ar" ? "ArrowRight" : "ArrowLeft";
                const offset =
                  event.key === forward || event.key === "ArrowDown"
                    ? 1
                    : event.key === backward || event.key === "ArrowUp"
                      ? -1
                      : 0;
                if (!offset && event.key !== "Home" && event.key !== "End")
                  return;
                event.preventDefault();
                const target =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? views.length - 1
                      : (index + offset + views.length) % views.length;
                select(target);
                buttons.current[target]?.focus();
              }}
            >
              {view.label}
            </button>
          ))}
        </div>
        <div className={styles.settingsBody}>
          {views.map((view, index) => (
            <div
              key={view.id}
              role="tabpanel"
              id={`${prefix}-panel-${view.id}`}
              aria-labelledby={`${prefix}-tab-${view.id}`}
              hidden={index !== selected}
            >
              {view.content}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
