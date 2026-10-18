"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { RouteErrorState } from "@/app/_components/route-error-state";
import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";
import { resolveLocale, type Locale } from "@/lib/i18n/locale";

type ErrorProps = Readonly<{
  error: Error & { digest?: string };
  retry: () => void;
}>;

function WorkspaceErrorState({
  locale,
  retry,
}: Readonly<{ locale: Locale; retry: () => void }>) {
  const text = getWorkspaceCopy(locale);
  return (
    <RouteErrorState
      locale={locale}
      retry={retry}
      title={text.genericErrorTitle}
      retryLabel={text.retry}
      exitHref="/learn?view=subjects"
      exitLabel={locale === "ar" ? "تصفح المواد" : "Browse subjects"}
    >
      <p>{text.genericErrorBody}</p>
    </RouteErrorState>
  );
}

function LocalizedWorkspaceError({ retry }: Pick<ErrorProps, "retry">) {
  const locale = resolveLocale(useSearchParams().get("lang"));
  return <WorkspaceErrorState locale={locale} retry={retry} />;
}

export default function WorkspaceError({ retry }: ErrorProps) {
  return (
    <Suspense fallback={<WorkspaceErrorState locale="en" retry={retry} />}>
      <LocalizedWorkspaceError retry={retry} />
    </Suspense>
  );
}
