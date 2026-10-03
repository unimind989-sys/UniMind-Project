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
      <div className={styles.accessLayout}>
        <aside
          className={styles.introduction}
          aria-label={
            locale === "ar" ? "المذاكرة مع UniMind" : "Studying with UniMind"
          }
        >
          <div className={styles.folioScene} aria-hidden="true">
            <div className={styles.folio}>
              <div className={styles.folioCover} />
              <div className={styles.folioPages} />
              <div className={styles.folioLeaf}>
                <span />
                <span />
                <span />
                <span />
                <div className={styles.folioMark}>U</div>
              </div>
            </div>
            <div className={styles.folioNote}>
              <span />
              <span />
              <span />
            </div>
          </div>
          <p className={styles.introductionTitle} lang="en" dir="ltr">
            Study deeper
            <br />
            Go further.
          </p>
          <p className={styles.introductionCopy}>
            {locale === "ar"
              ? "موادك المعتمدة، محادثاتك، وأدوات المذاكرة في مساحة واحدة."
              : "Your approved materials, conversations, and study tools. One considered workspace."}
          </p>
        </aside>
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
    </div>
  );
}
