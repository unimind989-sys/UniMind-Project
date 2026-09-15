"use client";

import { useSearchParams } from "next/navigation";

import { getCatalogCopy } from "@/lib/i18n/catalog-copy";
import { getTextDirection, resolveLocale } from "@/lib/i18n/locale";

import styles from "./study-shelf.module.css";

export default function LearnLoading() {
  const parameters = useSearchParams();
  const locale = resolveLocale(parameters.get("lang"));

  return (
    <main
      className={styles.loadingShell}
      aria-busy="true"
      aria-label={getCatalogCopy(locale).navigationPending}
      aria-live="polite"
      lang={locale}
      dir={getTextDirection(locale)}
    >
      <span className={styles.loadingRail} />
      <span className={styles.loadingUtility} />
      <span className={styles.loadingHeading} />
      <span className={styles.loadingPath} />
      <span className={styles.loadingUnits} />
    </main>
  );
}
