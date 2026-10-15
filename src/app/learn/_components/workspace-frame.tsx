"use client";
import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import { useEffect, type ReactNode } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import type { Route } from "next";
import type { CatalogUnitNode } from "@/lib/catalog/catalog-journey.application";
import styles from "@/app/_components/product.module.css";
import { FrontendShell } from "@/app/_components/frontend-system";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";

export function WorkspaceFrame({
  scope,
  children,
  preview = false,
  completeNavigation = false,
  available = true,
  units = [],
  profileName,
}: {
  scope: WorkspaceScope;
  children: ReactNode;
  preview?: boolean;
  completeNavigation?: boolean;
  available?: boolean;
  units?: readonly CatalogUnitNode[];
  profileName?: string | null | undefined;
}) {
  const parameters = useSearchParams();
  const pathname = usePathname();
  const locale = parameters.get("lang") === "ar" ? "ar" : "en";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  const base = `${preview ? "/preview/learn" : "/learn"}/${scope.cohortId}/${scope.unitId}`;
  return (
    <FrontendShell
      locale={locale}
      profileName={profileName}
      title={locale === "ar" ? scope.unitTitleAr : scope.unitTitleEn}
      unitLabel={
        locale === "ar" ? scope.unitLabelSingularAr : scope.unitLabelSingularEn
      }
      institution={
        locale === "ar" ? scope.institutionNameAr : scope.institutionNameEn
      }
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
          <nav
            className={styles.unitChoices}
            aria-label={
              locale === "ar"
                ? `${scope.unitLabelPluralAr} مجموعتك`
                : `${scope.unitLabelPluralEn} in your cohort`
            }
          >
            {units.map((unit) => {
              const suffix =
                ["/chat", "/studio", "/quiz"].find(
                  (tab) => pathname === base + tab,
                ) ?? "";
              return (
                <Link
                  key={unit.id}
                  href={
                    `${preview ? "/preview" : ""}/learn/${scope.cohortId}/${unit.id}${suffix}?lang=${locale}` as Route
                  }
                  prefetch={false}
                  aria-current={unit.id === scope.unitId ? "page" : undefined}
                  onClick={(event) =>
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open")
                  }
                >
                  {locale === "ar" ? unit.nameAr : unit.nameEn}
                </Link>
              );
            })}
          </nav>
        ) : undefined
      }
    >
      {children}
    </FrontendShell>
  );
}
