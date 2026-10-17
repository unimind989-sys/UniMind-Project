"use client";
import { usePathname } from "next/navigation";
import { ProductLink } from "@/app/_components/product-ui";
import styles from "@/app/_components/product.module.css";
import type { ProductStudyProps } from "./study-props";

export type UnitChoice = Readonly<{
  id: string;
  nameEn: string;
  nameAr: string;
}>;

/**
 * The cohort's available units, keeping the current study tool. Real routes
 * pass the student's authorized catalog units; the synthetic runtime passes
 * its available sample units.
 */
export function UnitSwitch({
  scope,
  locale,
  base,
  units,
}: Pick<ProductStudyProps, "scope" | "locale" | "base"> & {
  units: readonly UnitChoice[];
}) {
  const pathname = usePathname();
  const suffix =
    ["/chat", "/studio", "/quiz"].find((tab) => pathname === base + tab) ?? "";
  return (
    <nav
      className={styles.unitChoices}
      aria-label={
        locale === "ar"
          ? `${scope.unitLabelPluralAr} مجموعتك`
          : `${scope.unitLabelPluralEn} in your cohort`
      }
    >
      {units.map((unit) => (
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
