import type { ReactNode } from "react";
import { Brand } from "@/app/_components/brand";
import { LanguageSwitch } from "@/app/_components/language-switch";
import { SegmentedControl } from "@/app/_components/segmented-control";
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
        <Brand href="/" locale={locale} tone="dark" />
        <LanguageSwitch
          locale={locale}
          labels="full"
          hrefs={languageHref}
          label={copy.language}
        />
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
            <SegmentedControl
              mode="steps"
              tone="paper"
              className={styles.steps}
              label={copy.accountAccess}
              items={[copy.account, copy.verify, copy.consent].map(
                (label, index) => ({
                  key: label,
                  label,
                  state:
                    index < activeStep
                      ? "done"
                      : index === activeStep
                        ? "current"
                        : "todo",
                }),
              )}
            />
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
