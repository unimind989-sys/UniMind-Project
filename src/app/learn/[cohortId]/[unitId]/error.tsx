"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";

import styles from "../../workspace.module.css";

function WorkspaceErrorContent({
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  const locale = useSearchParams().get("lang") === "ar" ? "ar" : "en";
  const text = getWorkspaceCopy(locale);
  return (
    <section
      className={styles.routeState}
      role="alert"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <h2>{text.genericErrorTitle}</h2>
      <p>{text.genericErrorBody}</p>
      <button type="button" onClick={reset}>
        {text.retry}
      </button>
    </section>
  );
}

export default function WorkspaceError(
  props: Readonly<{ error: Error & { digest?: string }; reset: () => void }>,
) {
  return (
    <Suspense
      fallback={<div role="alert">We could not load this workspace.</div>}
    >
      <WorkspaceErrorContent {...props} />
    </Suspense>
  );
}
