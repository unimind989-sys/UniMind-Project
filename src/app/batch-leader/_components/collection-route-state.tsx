"use client";

import { useSearchParams } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { PageState } from "@/app/_components/page-state";
import { ProductLink } from "@/app/_components/product-ui";
import { RouteErrorState } from "@/app/_components/route-error-state";

import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { resolveLocale } from "@/lib/i18n/locale";

/** Loading, missing and failed campaign routes inside the leader shell; a
 * failure retries with `retry()` and always keeps the way back. */
export function CollectionRouteState({
  kind,
  backHref = "/batch-leader",
  retry,
}: Readonly<{
  kind: "loading" | "not-found" | "error";
  backHref?: string;
  retry?: () => void;
}>) {
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams.get("lang"));
  const text = getCollectionCopy(locale);

  if (kind === "loading") {
    return (
      <AppShell locale={locale} role="leader" title={text.loading}>
        <PageState
          kind="loading"
          locale={locale}
          headingLevel={1}
          title={locale === "ar" ? "استلام المصادر" : "Source intake"}
        >
          <p>{text.loading}</p>
        </PageState>
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
      {failed && retry !== undefined ? (
        <RouteErrorState
          locale={locale}
          retry={retry}
          headingLevel={1}
          title={text.errorTitle}
          retryLabel={text.retry}
          exitHref={backHref}
          exitLabel={text.backToCampaigns}
        >
          <p>{text.errorBody}</p>
        </RouteErrorState>
      ) : (
        <PageState
          kind={failed ? "error" : "not-found"}
          locale={locale}
          headingLevel={1}
          title={failed ? text.errorTitle : text.unavailableTitle}
          actions={
            <ProductLink href={backHref} locale={locale} variant="primary">
              {text.backToCampaigns}
            </ProductLink>
          }
        >
          <p>{failed ? text.errorBody : text.unavailableBody}</p>
        </PageState>
      )}
    </AppShell>
  );
}
