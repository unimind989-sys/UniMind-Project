import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
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
        <Brand href={`/?lang=${locale}` as Route} tone="dark" />
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
          <p className={styles.introductionTitle} lang="en" dir="ltr">
            <span>Study deeper</span> <span>Go further.</span>
          </p>
          <p className={styles.introductionCopy}>
            {locale === "ar"
              ? "اسأل عن محاضراتك وراجع كل إجابة على الصفحة التي جاءت منها."
              : "Ask about your own lectures and check every answer against the page it came from."}
          </p>
          <ul className={styles.proof}>
            {(locale === "ar"
              ? [
                  "إجابات من موادك المعتمدة فقط",
                  "صفحة أو توقيت وراء كل معلومة",
                  "حسابك يحدد دورك والمواد المتاحة لك",
                ]
              : [
                  "Answers only from your approved material",
                  "A page or timestamp behind every claim",
                  "Your account determines your role and available materials",
                ]
            ).map((line) => (
              <li key={line}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M5 12.5 10 17l9-10" />
                </svg>
                {line}
              </li>
            ))}
          </ul>
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
