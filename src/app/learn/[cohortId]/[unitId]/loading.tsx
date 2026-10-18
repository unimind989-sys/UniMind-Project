"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageState } from "@/app/_components/page-state";
import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";
import { resolveLocale, type Locale } from "@/lib/i18n/locale";

function WorkspaceLoadingState({ locale }: Readonly<{ locale: Locale }>) {
  return (
    <PageState
      kind="loading"
      locale={locale}
      title={getWorkspaceCopy(locale).loading}
    />
  );
}

function LocalizedWorkspaceLoading() {
  const locale = resolveLocale(useSearchParams().get("lang"));
  return <WorkspaceLoadingState locale={locale} />;
}

export default function WorkspaceLoading() {
  return (
    <Suspense fallback={<WorkspaceLoadingState locale="en" />}>
      <LocalizedWorkspaceLoading />
    </Suspense>
  );
}
