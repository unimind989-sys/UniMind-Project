"use client";

import { createContext, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/app/_components/app-shell";
import { getAdminCopy } from "@/lib/i18n/admin-copy";
import { localizedHref, type Locale } from "@/lib/i18n/locale";
import { SegmentedControl } from "@/app/_components/segmented-control";
import styles from "../admin.module.css";

const groups = {
  content: ["sources", "campaigns"],
  academics: ["catalog", "cohorts"],
  operations: ["jobs", "quality", "usage", "incidents"],
} as const;

/**
 * The Night band's slot for controls owned by the page below it (the decision
 * queue's count tabs). `undefined` outside a workspace; `null` until mounted.
 */
export const AdminBandSlot = createContext<HTMLElement | null | undefined>(
  undefined,
);

export function AdminWorkspace({
  locale,
  resource,
  children,
  synthetic = false,
  actions,
  roleLabel,
}: {
  locale: Locale;
  resource?: string | undefined;
  children: ReactNode;
  synthetic?: boolean;
  actions?: ReactNode;
  roleLabel?: string | undefined;
}) {
  const query = useSearchParams();
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
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
      roleLabel={roleLabel}
    >
      <AdminBandSlot.Provider value={slot}>
        <header
          className={styles.band}
          data-view={resource ? "resource" : "queue"}
        >
          <div className={styles.bandTitle}>
            <h1>{title}</h1>
            {group?.length ? (
              <SegmentedControl
                mode="links"
                tone="night"
                className={styles.resourceNav}
                label={t("Section resources", "موارد القسم")}
                items={group.map((key) => ({
                  key,
                  label: resources[key],
                  href: localizedHref(`/admin/${key}`, locale),
                  current: key === resource,
                }))}
              />
            ) : null}
          </div>
          <div ref={setSlot} className={styles.bandSlot} />
          {actions ? <div className={styles.bandActions}>{actions}</div> : null}
        </header>
        <div className={styles.console}>{children}</div>
      </AdminBandSlot.Provider>
    </AppShell>
  );
}
