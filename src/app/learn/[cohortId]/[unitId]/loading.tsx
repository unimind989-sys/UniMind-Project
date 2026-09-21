"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { getWorkspaceCopy } from "@/lib/i18n/workspace-copy";

import styles from "../../workspace.module.css";

function WorkspaceLoadingContent() {
  const locale = useSearchParams().get("lang") === "ar" ? "ar" : "en";
  return (
    <div
      className={styles.routeState}
      role="status"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <span className={styles.loadingMark} />
      {getWorkspaceCopy(locale).loading}
    </div>
  );
}

export default function WorkspaceLoading() {
  return (
    <Suspense fallback={<div role="status">Checking workspace access…</div>}>
      <WorkspaceLoadingContent />
    </Suspense>
  );
}
