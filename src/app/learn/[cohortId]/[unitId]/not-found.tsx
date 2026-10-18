"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageState } from "@/app/_components/page-state";
import { ProductLink } from "@/app/_components/product-ui";
import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";
import { localizedHref, resolveLocale, type Locale } from "@/lib/i18n/locale";

function WorkspaceNotFoundState({ locale }: Readonly<{ locale: Locale }>) {
  const text = getWorkspaceCopy(locale);
  return (
    <PageState
      kind="not-found"
      standalone
      headingLevel={1}
      locale={locale}
      homeHref={localizedHref("/learn", locale)}
      title={text.notFoundTitle}
      actions={
        <ProductLink href="/learn" locale={locale} variant="primary">
          {text.backToShelf}
        </ProductLink>
      }
    >
      <p>{text.notFoundBody}</p>
    </PageState>
  );
}

function LocalizedWorkspaceNotFound() {
  const locale = resolveLocale(useSearchParams().get("lang"));
  return <WorkspaceNotFoundState locale={locale} />;
}

export default function WorkspaceNotFound() {
  return (
    <Suspense fallback={<WorkspaceNotFoundState locale="en" />}>
      <LocalizedWorkspaceNotFound />
    </Suspense>
  );
}
