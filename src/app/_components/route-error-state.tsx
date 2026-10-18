"use client";

import { useTransition, type ReactNode } from "react";

import type { Locale } from "@/lib/i18n/locale";
import { PageState } from "./page-state";
import { Button, ProductLink } from "./product-ui";

/**
 * The recovery for a route error boundary (DESIGN.md "PageState"): Next's
 * `retry()` re-fetches and re-renders the segment, and a safe exit to the
 * role's home is always offered beside it.
 */
export function RouteErrorState({
  locale,
  retry,
  title,
  children,
  exitHref,
  exitLabel,
  standalone = false,
  headingLevel = 2,
  retryLabel,
}: Readonly<{
  locale: Locale;
  retry: () => void;
  title: string;
  children?: ReactNode;
  exitHref: string;
  exitLabel: string;
  standalone?: boolean;
  headingLevel?: 1 | 2;
  retryLabel?: string | undefined;
}>) {
  const [pending, startTransition] = useTransition();
  const ar = locale === "ar";
  return (
    <PageState
      kind="error"
      locale={locale}
      title={title}
      standalone={standalone}
      headingLevel={headingLevel}
      actions={
        <>
          <Button
            variant="primary"
            pending={pending}
            pendingLabel={ar ? "جارٍ إعادة المحاولة…" : "Trying again…"}
            onClick={() => startTransition(() => retry())}
          >
            {retryLabel ?? (ar ? "حاول مرة أخرى" : "Try again")}
          </Button>
          <ProductLink href={exitHref} locale={locale}>
            {exitLabel}
          </ProductLink>
        </>
      }
    >
      {children}
    </PageState>
  );
}
