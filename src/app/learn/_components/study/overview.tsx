"use client";
import styles from "@/app/_components/product.module.css";
import { Evidence } from "./evidence";
import type { ProductStudyProps } from "./study-props";

/** The unit's landing view: material freshness, edition and the library. */
export function Overview(props: ProductStudyProps) {
  const t = (en: string, ar: string) => (props.locale === "ar" ? ar : en);
  const edition =
    props.scope.curriculumEdition === "synthetic-2026-2027"
      ? t("Sample edition 2026–2027", "إصدار تجريبي ٢٠٢٦–٢٠٢٧")
      : props.scope.curriculumEdition;
  return (
    <section>
      <header className={styles.materialsHeading}>
        <div>
          <h2>{t("Materials", "مصادر المذاكرة")}</h2>
          <p>
            {t("Updated", "آخر تحديث")}{" "}
            {new Intl.DateTimeFormat(
              props.locale === "ar" ? "ar-EG" : "en-GB",
              {
                dateStyle: "medium",
                timeZone: "UTC",
              },
            ).format(new Date(props.scope.materialUpdatedAt))}
            {t(", ", "، ")}
            <bdi>{edition}</bdi>
          </p>
        </div>
      </header>
      <Evidence {...props} screen="sources" embedded />
    </section>
  );
}
