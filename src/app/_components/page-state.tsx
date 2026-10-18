import type { ReactNode } from "react";

import type { Locale } from "@/lib/i18n/locale";
import { Brand } from "./brand";
import { StateIcon, type StateIconName } from "./state-pill";
import styles from "./page-state.module.css";

export type PageStateKind =
  | "loading"
  | "empty"
  | "error"
  | "forbidden"
  | "not-found"
  | "stale"
  | "interrupted";

const icon: Record<Exclude<PageStateKind, "loading">, StateIconName> = {
  empty: "info",
  error: "bad",
  forbidden: "warn",
  "not-found": "info",
  stale: "wait",
  interrupted: "warn",
};

/**
 * `PageState` (DESIGN.md): loading, empty, error, forbidden, not-found, stale
 * and interrupted states with a specific recovery. Loading keeps the known
 * context and announces itself; errors announce once. `standalone` renders a
 * whole page under a minimal Night bar (root and route-level fallbacks).
 */
export function PageState({
  kind,
  title,
  children,
  actions,
  locale,
  headingLevel = 2,
  standalone = false,
  homeHref,
  className,
}: Readonly<{
  kind: PageStateKind;
  title: ReactNode;
  children?: ReactNode;
  /** Recovery: a retry where retryable, and a safe exit. */
  actions?: ReactNode;
  locale: Locale;
  headingLevel?: 1 | 2;
  standalone?: boolean;
  homeHref?: string | undefined;
  className?: string | undefined;
}>) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const state = (
    <section
      className={className ? `${styles.state} ${className}` : styles.state}
      data-kind={kind}
      role={
        kind === "loading" ? "status" : kind === "error" ? "alert" : undefined
      }
      aria-busy={kind === "loading" ? true : undefined}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {kind === "loading" ? (
        <span className={styles.loadingLine} aria-hidden="true" />
      ) : (
        <span className={styles.mark}>
          <StateIcon tone={icon[kind]} size={24} />
        </span>
      )}
      <Heading className={styles.title}>{title}</Heading>
      {children ? <div className={styles.body}>{children}</div> : null}
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
  if (!standalone) return state;
  return (
    <div
      className={styles.page}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <header className={styles.bar}>
        <Brand href={homeHref ?? "/"} locale={locale} tone="dark" />
      </header>
      <main className={styles.main} id="app-content" tabIndex={-1}>
        {state}
      </main>
    </div>
  );
}
