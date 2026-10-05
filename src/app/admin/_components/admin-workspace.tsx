"use client";

import type { ReactNode } from "react";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import type { Locale } from "@/lib/i18n/locale";
import styles from "../admin.module.css";

const groups = {
  content: ["sources", "campaigns"],
  academics: ["catalog", "cohorts"],
  operations: ["jobs", "quality", "usage", "incidents"],
} as const;

export function AdminWorkspace({
  locale,
  resource,
  children,
  synthetic = false,
  preview = false,
  actions,
  roleLabel,
}: {
  locale: Locale;
  resource?: string | undefined;
  children: ReactNode;
  synthetic?: boolean;
  preview?: boolean;
  actions?: ReactNode;
  roleLabel?: string | undefined;
}) {
  const query = useSearchParams();
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const users = resource === "cohorts" && query.get("view") === "users";
  const copy = getAdminCopy(locale);
  const section = users
    ? t("Access context", "سياق الوصول")
    : groups.content.some((key) => key === resource)
      ? t("Content", "المحتوى")
      : groups.academics.some((key) => key === resource)
        ? t("Academics", "الدراسة")
        : groups.operations.some((key) => key === resource)
          ? t("Operations", "العمليات")
          : t("Decision queue", "قائمة القرارات");
  const resources: Readonly<Record<string, string>> = copy.resources;
  const title = users ? section : resource ? resources[resource] : section;
  const group = users
    ? []
    : Object.values(groups).find((keys) =>
        keys.some((key) => key === resource),
      );
  return (
    <AppShell
      locale={locale}
      role="admin"
      title={section}
      synthetic={synthetic}
      preview={preview}
      roleLabel={roleLabel}
    >
      <header className={styles.pageHeading}>
        <div className={styles.headingRow}>
          <h1>{title}</h1>
          {actions}
        </div>
        <p>
          {users
            ? t(
                "Review cohort context and campaign assignments.",
                "راجع سياق المجموعة وتكليفات الحملات.",
              )
            : resource
              ? t(
                  "Review this resource, then open the relevant decision when a change is needed.",
                  "راجع هذا المورد، ثم افتح القرار المناسب عند الحاجة إلى تغيير.",
                )
              : t(
                  "Review pending decisions and their consequences before recording a change.",
                  "راجع القرارات المعلقة ونتائجها قبل تسجيل أي تغيير.",
                )}
        </p>
      </header>
      {group?.length ? (
        <nav
          className={styles.resourceNav}
          aria-label={t("Section resources", "موارد القسم")}
        >
          {group.map((key) => (
            <Link
              key={key}
              prefetch={false}
              href={`/admin/${key}?lang=${locale}` as Route}
              aria-current={key === resource ? "page" : undefined}
            >
              {resources[key]}
            </Link>
          ))}
        </nav>
      ) : null}
      <div className={styles.console}>{children}</div>
    </AppShell>
  );
}
