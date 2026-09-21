"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";

import styles from "../../workspace.module.css";

function WorkspaceNotFoundContent() {
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
      <Link href={`/learn?lang=${locale}`}>{text.backToShelf}</Link>
    </main>
  );
}

export default function WorkspaceNotFound() {
  return (
    <Suspense
      fallback={
        <main className={styles.standaloneState}>
          <h1>Workspace unavailable</h1>
        </main>
      }
    >
      <WorkspaceNotFoundContent />
    </Suspense>
  );
}
