"use client";

import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";

import styles from "../../../../learn/workspace.module.css";

function PreviewWorkspaceNotFoundContent() {
  const locale = useSearchParams().get("lang") === "ar" ? "ar" : "en";
  const text = getWorkspaceCopy(locale);
  return (
    <main
      className={styles.standaloneState}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <p className={styles.plannedLabel}>UniMind</p>
      <h1>{text.notFoundTitle}</h1>
      <p>{text.notFoundBody}</p>
      <Link href={`/preview/learn?lang=${locale}` as Route}>
        {text.backToShelf}
      </Link>
    </main>
  );
}

export default function PreviewWorkspaceNotFound() {
  return (
    <Suspense
      fallback={
        <main className={styles.standaloneState}>
          <h1>Workspace unavailable</h1>
        </main>
      }
    >
      <PreviewWorkspaceNotFoundContent />
    </Suspense>
  );
}
