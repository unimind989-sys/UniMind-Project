"use client";
import { useEffect, type ReactNode } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import type { CatalogUnitNode } from "@/lib/catalog/catalog-journey.application";
import { Select } from "@/app/_components/product-ui";
import { FrontendShell } from "@/app/_components/frontend-system";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";

export function WorkspaceFrame({
  scope,
  children,
  preview = false,
  completeNavigation = false,
  available = true,
  units = [],
}: {
  scope: WorkspaceScope;
  children: ReactNode;
  preview?: boolean;
  completeNavigation?: boolean;
  available?: boolean;
  units?: readonly CatalogUnitNode[];
}) {
  const parameters = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = parameters.get("lang") === "ar" ? "ar" : "en";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  const base = `${preview ? "/preview/learn" : "/learn"}/${scope.cohortId}/${scope.unitId}`;
  return (
    <FrontendShell
      locale={locale}
      title={locale === "ar" ? scope.unitTitleAr : scope.unitTitleEn}
      context={[
        locale === "ar" ? scope.programNameAr : scope.programNameEn,
        locale === "ar" ? scope.levelNameAr : scope.levelNameEn,
        locale === "ar" ? scope.termNameAr : scope.termNameEn,
      ].join(" · ")}
      base={base}
      available={available}
      synthetic={preview || completeNavigation}
      preview={preview}
      scopeControl={
        units.length > 1 ? (
          <Select
            id="workspace-unit"
            label={locale === "ar" ? "تغيير الوحدة" : "Switch unit"}
            value={scope.unitId}
            options={units.map(
              (unit) =>
                [unit.id, locale === "ar" ? unit.nameAr : unit.nameEn] as const,
            )}
            onChange={(unitId) => {
              const suffix =
                ["/chat", "/studio", "/quiz"].find(
                  (tab) => pathname === base + tab,
                ) ?? "";
              router.push(
                `/learn/${scope.cohortId}/${unitId}${suffix}?lang=${locale}` as Route,
              );
            }}
          />
        ) : undefined
      }
    >
      {children}
    </FrontendShell>
  );
}
