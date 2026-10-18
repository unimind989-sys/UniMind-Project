"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageState } from "./_components/page-state";
import { ProductLink } from "./_components/product-ui";
import { resolveLocale, type Locale } from "@/lib/i18n/locale";

function NotFoundState({ locale }: Readonly<{ locale: Locale }>) {
  const ar = locale === "ar";
  return (
    <PageState
      kind="not-found"
      standalone
      headingLevel={1}
      locale={locale}
      title={ar ? "الصفحة غير موجودة" : "Page not found"}
      actions={
        <ProductLink href="/" locale={locale} variant="primary">
          {ar ? "العودة إلى UniMind" : "Return to UniMind"}
        </ProductLink>
      }
    >
      <p>
        {ar
          ? "صفحة UniMind المطلوبة غير موجودة."
          : "The requested UniMind page does not exist."}
      </p>
    </PageState>
  );
}

function LocalizedNotFound() {
  const locale = resolveLocale(useSearchParams().get("lang"));
  return <NotFoundState locale={locale} />;
}

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundState locale="en" />}>
      <LocalizedNotFound />
    </Suspense>
  );
}
