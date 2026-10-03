"use client";

import { useSearchParams } from "next/navigation";

import { getCatalogCopy } from "@/lib/i18n/catalog-copy";
import { getTextDirection, resolveLocale } from "@/lib/i18n/locale";

import styles from "./study-shelf.module.css";
import { AppShell } from "@/app/_components/app-shell";

export default function LearnLoading() {
  const parameters = useSearchParams();
  const locale = resolveLocale(parameters.get("lang"));

  return (
    <AppShell locale={locale}>
      <section
        className={styles.emptyState}
        aria-busy="true"
        aria-label={getCatalogCopy(locale).navigationPending}
        aria-live="polite"
        lang={locale}
        dir={getTextDirection(locale)}
      >
        <h1>{locale === "ar" ? "رف المذاكرة" : "Your Study Shelf"}</h1>
        <p role="status">{getCatalogCopy(locale).navigationPending}</p>
      </section>
    </AppShell>
  );
}
