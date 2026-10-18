"use client";

import { useSearchParams } from "next/navigation";

import { getCatalogCopy } from "@/lib/i18n/catalog-copy";
import { resolveLocale } from "@/lib/i18n/locale";

import { AppShell } from "@/app/_components/app-shell";
import { PageState } from "@/app/_components/page-state";

export default function LearnLoading() {
  const parameters = useSearchParams();
  const locale = resolveLocale(parameters.get("lang"));

  return (
    <AppShell locale={locale}>
      <PageState
        kind="loading"
        locale={locale}
        headingLevel={1}
        title={locale === "ar" ? "رف المذاكرة" : "Your Study Shelf"}
      >
        <p>{getCatalogCopy(locale).navigationPending}</p>
      </PageState>
    </AppShell>
  );
}
