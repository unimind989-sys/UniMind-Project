"use client";
import { usePathname } from "next/navigation";
import { useProductServices } from "@/app/_components/product-services";
import { ProductLink } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import {
  reviewCatalogRows,
  sampleScopeAvailable,
} from "@/lib/demo/synthetic-fixtures.application";
import type { ProductStudyProps } from "./study-props";

/** The cohort's other available units, keeping the current study tool. */
export function UnitSwitch({
  scope,
  locale,
  base,
}: Pick<ProductStudyProps, "scope" | "locale" | "base">) {
  const { state } = useProductServices();
  const pathname = usePathname();
  const suffix =
    ["/chat", "/studio", "/quiz"].find((tab) => pathname === base + tab) ?? "";
  const units = reviewCatalogRows.filter(
    (row) =>
      row.cohort.id === scope.cohortId &&
      sampleScopeAvailable(state, row.cohort.id, row.unit.id),
  );
  return (
    <nav
      className={styles.unitChoices}
      aria-label={
        locale === "ar"
          ? `${scope.unitLabelPluralAr} مجموعتك`
          : `${scope.unitLabelPluralEn} in your cohort`
      }
    >
      {units.map(({ unit }) => (
        <ProductLink
          key={unit.id}
          href={`/learn/${scope.cohortId}/${unit.id}${suffix}`}
          locale={locale}
          aria-current={unit.id === scope.unitId ? "page" : undefined}
          onClick={(event) =>
            event.currentTarget.closest("details")?.removeAttribute("open")
          }
        >
          {locale === "ar" ? unit.nameAr : unit.nameEn}
        </ProductLink>
      ))}
    </nav>
  );
}
