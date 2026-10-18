"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { RouteErrorState } from "./_components/route-error-state";
import { resolveLocale, type Locale } from "@/lib/i18n/locale";

type ErrorProps = Readonly<{
  error: Error & { digest?: string };
  retry: () => void;
}>;

function RootErrorState({
  locale,
  retry,
}: Readonly<{ locale: Locale; retry: () => void }>) {
  const ar = locale === "ar";
  return (
    <RouteErrorState
      locale={locale}
      retry={retry}
      standalone
      headingLevel={1}
      title={ar ? "تعذر تحميل الصفحة" : "This page could not load"}
      exitHref="/"
      exitLabel={ar ? "العودة إلى UniMind" : "Return to UniMind"}
    >
      <p>
        {ar
          ? "حاول تحميل هذه الصفحة مرة أخرى."
          : "Try loading this page again."}
      </p>
    </RouteErrorState>
  );
}

function LocalizedRootError({ retry }: Pick<ErrorProps, "retry">) {
  const locale = resolveLocale(useSearchParams().get("lang"));
  return <RootErrorState locale={locale} retry={retry} />;
}

export default function ErrorBoundary({ retry }: ErrorProps) {
  return (
    <Suspense fallback={<RootErrorState locale="en" retry={retry} />}>
      <LocalizedRootError retry={retry} />
    </Suspense>
  );
}
