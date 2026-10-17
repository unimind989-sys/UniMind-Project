"use client";

import type { ReactNode } from "react";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { formatCollectionDate } from "@/lib/i18n/collection-format";
import type { Locale } from "@/lib/i18n/locale";
import { collectionText } from "./collection-text";
import styles from "../../collection.module.css";

export function CollectionDeadline({
  campaign,
  locale,
  deadline,
  dateReference,
}: Readonly<{
  campaign: CollectionCampaign;
  locale: Locale;
  deadline: string | null;
  dateReference?: ReactNode;
}>) {
  const text = getCollectionCopy(locale);
  const t = collectionText(locale);
  return (
    <aside className={styles.assignment} aria-labelledby="intake-deadline">
      <h2 id="intake-deadline">{t("Your deadline", "موعدك النهائي")}</h2>
      <strong>
        {deadline
          ? formatCollectionDate(locale, deadline)
          : t("Unavailable", "غير متاح")}{" "}
        · {t("Cairo time", "بتوقيت القاهرة")}
      </strong>
      <details className={styles.deadlineDetails}>
        <summary>
          {t("Assignment and campaign dates", "مواعيد التكليف والحملة")}
        </summary>
        {dateReference ? <p>{dateReference}</p> : null}
        <p>
          {text.assignment}:{" "}
          {formatCollectionDate(locale, campaign.assignmentExpiresAt)}
        </p>
        <p>
          {text.due}: {formatCollectionDate(locale, campaign.closesAt)}
        </p>
        <p>
          {t(
            "The earlier date is your upload cutoff. All dates use Cairo time.",
            "الموعد الأسبق هو آخر وقت متاح لك للرفع. كل المواعيد بتوقيت القاهرة.",
          )}
        </p>
      </details>
    </aside>
  );
}
