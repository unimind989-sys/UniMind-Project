"use client";

import { useId } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { collectionText } from "./collection-text";
import styles from "../../collection.module.css";

/**
 * Request progress from existing state only (`collectionRequestProgress`), as
 * text plus a native progress bar. Nothing renders without requests.
 */
export function CollectionProgress({
  sent,
  total,
  locale,
}: Readonly<{ sent: number; total: number; locale: Locale }>) {
  const t = collectionText(locale);
  const labelId = useId();
  if (total === 0) return null;
  const number = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en");
  const label = t(
    `${number.format(sent)} of ${number.format(total)} requests sent`,
    `أُرسل ${number.format(sent)} من ${number.format(total)} طلبات`,
  );
  return (
    <div className={styles.progress}>
      <p id={labelId}>{label}</p>
      <progress max={total} value={sent} aria-labelledby={labelId} />
    </div>
  );
}
