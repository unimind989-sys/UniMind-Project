"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageState } from "./_components/page-state";
import { resolveLocale, type Locale } from "@/lib/i18n/locale";

function RootLoadingState({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <PageState
      kind="loading"
      standalone
      headingLevel={1}
      locale={locale}
      title={locale === "ar" ? "جارٍ تحميل UniMind…" : "Loading UniMind…"}
    />
  );
}

function LocalizedRootLoading() {
  const locale = resolveLocale(useSearchParams().get("lang"));
  return <RootLoadingState locale={locale} />;
}

export default function Loading() {
  return (
    <Suspense fallback={<RootLoadingState locale="en" />}>
      <LocalizedRootLoading />
    </Suspense>
  );
}
