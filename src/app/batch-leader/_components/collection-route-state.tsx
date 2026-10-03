"use client";

import { useSearchParams } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { Button } from "@/app/_components/product-ui";

import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { resolveLocale } from "@/lib/i18n/locale";

export function CollectionRouteState({
  kind,
  backHref = "/batch-leader",
  reset,
}: Readonly<{
  kind: "loading" | "not-found" | "error";
  backHref?: string;
  reset?: () => void;
}>) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const text = getCollectionCopy(locale);

  if (kind === "loading") {
    return (
      <AppShell locale={locale} role="leader" title={text.loading}>
        <section aria-busy="true" role="status">
          <h1>{locale === "ar" ? "الرفع" : "Uploads"}</h1>
          <p>{text.loading}</p>
        </section>
      </AppShell>
    );
  }

  const failed = kind === "error";
  return (
    <AppShell
      locale={locale}
      role="leader"
      title={failed ? text.errorTitle : text.unavailableTitle}
    >
      <h1>{failed ? text.errorTitle : text.unavailableTitle}</h1>
      <p>{failed ? text.errorBody : text.unavailableBody}</p>
      {failed && reset !== undefined ? (
        <Button onClick={reset}>{text.retry}</Button>
      ) : (
        <a href={`${backHref}?lang=${locale}`}>{text.backToCampaigns}</a>
      )}
    </AppShell>
  );
}
