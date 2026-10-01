import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { Brand } from "@/app/_components/brand";
import { getAuthCopy } from "@/lib/i18n/auth-copy";
import type { Locale } from "@/lib/i18n/locale";
import styles from "../auth.module.css";

export function AuthShell({
  locale,
  activeStep,
  children,
  languageHref,
}: {
  locale: Locale;
  activeStep: 0 | 1 | 2 | 3;
  children: ReactNode;
  languageHref: Readonly<Record<Locale, string>>;
}) {
  const copy = getAuthCopy(locale);
  return (
    <div
      className={styles.shell}
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <header className={styles.header}>
        <Brand />
        <nav className={styles.languageSwitch} aria-label={copy.language}>
          <Link
            href={languageHref.en as Route}
            aria-current={locale === "en" ? "page" : undefined}
          >
            English
          </Link>
          <Link
            href={languageHref.ar as Route}
            aria-current={locale === "ar" ? "page" : undefined}
          >
            العربية
          </Link>
        </nav>
      </header>
      <main className={styles.workspace}>
        {activeStep > 0 ? (
          <ol className={styles.steps} aria-label={copy.accountAccess}>
            {[copy.account, copy.verify, copy.consent].map((label, index) => (
              <li
                key={label}
                aria-current={activeStep === index ? "step" : undefined}
              >
                {index < activeStep ? "✓ " : ""}
                {label}
              </li>
            ))}
          </ol>
        ) : null}
        {children}
        <footer className={styles.safetyRail} id="educational-boundary">
          <p>{copy.railBoundary}</p>
          <details>
            <summary>{copy.learnMore}</summary>
            <p>{copy.boundaryBody}</p>
          </details>
        </footer>
      </main>
    </div>
  );
}
