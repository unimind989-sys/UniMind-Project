"use client";

import { useSearchParams } from "next/navigation";

import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { getTextDirection, resolveLocale } from "@/lib/i18n/locale";

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
  const direction = getTextDirection(locale);
  const text = getCollectionCopy(locale);

  if (kind === "loading") {
    return (
      <main
        className="foundation-page"
        aria-busy="true"
        lang={locale}
        dir={direction}
      >
        <p>{text.loading}</p>
      </main>
    );
  }

  const failed = kind === "error";
  return (
    <main className="foundation-page" lang={locale} dir={direction}>
      <h1>{failed ? text.errorTitle : text.unavailableTitle}</h1>
      <p>{failed ? text.errorBody : text.unavailableBody}</p>
      {failed && reset !== undefined ? (
        <button type="button" onClick={reset}>
          {text.retry}
        </button>
      ) : (
        <a href={`${backHref}?lang=${locale}`}>{text.backToCampaigns}</a>
      )}
    </main>
  );
}
