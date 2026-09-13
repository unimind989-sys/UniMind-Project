import type { ReactNode } from "react";

import { getAuthCopy } from "@/lib/i18n/auth-copy";
import { getTextDirection, type Locale } from "@/lib/i18n/locale";

import { ActiveAuthShelf } from "./active-auth-shelf";
import styles from "../auth.module.css";

type StepIcon =
  | "account"
  | "check"
  | "document"
  | "info"
  | "learner"
  | "mail"
  | "shelf"
  | "status";

function Icon({ name }: Readonly<{ name: StepIcon }>) {
  const path = {
    account: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    document: (
      <>
        <path d="M6 3h9l3 3v15H6Z" />
        <path d="M14 3v4h4M9 11h6M9 15h6" />
      </>
    ),
    shelf: (
      <>
        <path d="M3 7.5 12 3l9 4.5-9 4.5Z" />
        <path d="M6 10v6.5c3.5 2.5 8.5 2.5 12 0V10M3 7.5V14" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    learner: (
      <>
        <path d="M4 5h6a3 3 0 0 1 3 3v12a3 3 0 0 0-3-3H4Z" />
        <path d="M20 5h-4a3 3 0 0 0-3 3v12a3 3 0 0 1 3-3h4Z" />
      </>
    ),
    status: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
  } satisfies Record<StepIcon, ReactNode>;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {path[name]}
    </svg>
  );
}

function BrandMark() {
  return (
    <svg className={styles.brandMark} viewBox="0 0 44 44" aria-hidden="true">
      <path d="M3 8.5c7.5 0 12.8 2.5 17 7.5v21c-4.2-4-9.5-6-17-6Z" />
      <path d="M41 8.5c-7.5 0-12.8 2.5-17 7.5v21c4.2-4 9.5-6 17-6Z" />
    </svg>
  );
}

const directionContract = `<!--
THESIS: Access Shelf makes account readiness visible as one expanding academic rail and refuses the generic centered auth modal.
OWN-WORLD: Deep matte navy fields, strict shelf tiles, off-white workhorse type, cool separators, cobalt focus, and explicit mint completion.
STORY: A learner completes account, email verification, current commitments, and entry without losing sight of the safe next step.
FIRST VIEWPORT: A 254px identity rail anchors four horizontal stages; the active stage expands to hold the only primary action while later stages remain visible.
FORM: Access Shelf, selected surface composition, seed 33cbfda3.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

export function AuthShell({
  locale,
  activeStep,
  children,
  languageHref,
}: Readonly<{
  locale: Locale;
  activeStep: 0 | 1 | 2 | 3;
  children: ReactNode;
  languageHref: Readonly<Record<Locale, string>>;
}>) {
  const copy = getAuthCopy(locale);
  const direction = getTextDirection(locale);
  const stages = [
    { title: copy.account, summary: copy.accountSummary, icon: "account" },
    { title: copy.verify, summary: copy.verifySummary, icon: "mail" },
    { title: copy.consent, summary: copy.consentSummary, icon: "document" },
    { title: copy.enter, summary: copy.enterSummary, icon: "shelf" },
  ] as const;

  return (
    <div className={styles.shell} lang={locale} dir={direction}>
      <template
        data-surface-direction-contract="33cbfda3"
        dangerouslySetInnerHTML={{ __html: directionContract }}
      />
      <aside className={styles.identityRail} aria-label="UniMind">
        <div className={styles.brand}>
          <BrandMark />
          <span>UniMind</span>
        </div>
        <p className={styles.tagline}>{copy.brandTagline}</p>
        <nav className={styles.identityNav} aria-label={copy.accountAccess}>
          <a
            className={styles.identityNavItem}
            data-current="true"
            href={languageHref[locale]}
            aria-current="page"
          >
            <Icon name="account" />
            <span>
              <strong>{copy.accountAccess}</strong>
              <small>{copy.accountAccessSummary}</small>
            </span>
          </a>
          <span className={styles.identityNavItem}>
            <Icon name="learner" />
            <span>
              <strong>{copy.forLearners}</strong>
              <small>{copy.forLearnersSummary}</small>
            </span>
          </span>
        </nav>
        <p className={styles.railCalm}>{copy.enterSummary}</p>
      </aside>

      <main className={styles.workspace}>
        <div className={styles.localeBar}>
          <nav className={styles.languageSwitch} aria-label={copy.language}>
            <a
              href={languageHref.en}
              aria-current={locale === "en" ? "page" : undefined}
            >
              EN
            </a>
            <a
              href={languageHref.ar}
              aria-current={locale === "ar" ? "page" : undefined}
            >
              عربي
            </a>
          </nav>
        </div>
        <header className={styles.header}>
          <div>
            <h1>{copy.heading}</h1>
            <p>{copy.summary}</p>
          </div>
          <div className={styles.syntheticContext}>
            <Icon name="shelf" />
            <span>
              <strong>{copy.synthetic}</strong>
              <small>{copy.syntheticDetail}</small>
            </span>
            <Icon name="info" />
          </div>
        </header>
        <ActiveAuthShelf activeStep={activeStep} label={copy.heading}>
          {stages.map((stage, index) => {
            const isActive = index === activeStep;
            const isComplete = index < activeStep;
            return (
              <li
                key={stage.title}
                className={styles.stage}
                data-active={isActive}
                data-complete={isComplete}
                aria-current={isActive ? "step" : undefined}
              >
                <div className={styles.stageTopline}>
                  <span className={styles.stageNumber}>{index + 1}</span>
                  <span className={styles.stageLine} aria-hidden="true" />
                </div>
                <div className={styles.stageIdentity}>
                  <span className={styles.stageIcon}>
                    <Icon name={stage.icon} />
                  </span>
                  <div>
                    <h2>{stage.title}</h2>
                    {!isActive ? <p>{stage.summary}</p> : null}
                  </div>
                </div>
                {isActive ? (
                  <div className={styles.activeContent}>{children}</div>
                ) : (
                  <span className={styles.stageStatus}>
                    <Icon name={isComplete ? "check" : "status"} />
                    {isComplete ? copy.complete : copy.pending}
                  </span>
                )}
              </li>
            );
          })}
        </ActiveAuthShelf>
        <footer className={styles.safetyRail} id="educational-boundary">
          <Icon name="info" />
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
