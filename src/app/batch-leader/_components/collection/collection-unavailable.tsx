"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import type { Locale } from "@/lib/i18n/locale";
import { collectionText } from "./collection-text";
import styles from "../../collection.module.css";

export function CollectionUnavailable({
  campaign,
  locale,
}: Readonly<{ campaign: CollectionCampaign; locale: Locale }>) {
  const t = collectionText(locale);
  return (
    <>
      <h1>{t("Request unavailable", "الطلب غير متاح")}</h1>
      <p>
        {t(
          "This request or recorded submission is no longer available in this campaign. Open the campaign to inspect its current requests.",
          "هذا الطلب أو الإرسال المسجل لم يعد متاحًا في هذه الحملة. افتح الحملة للاطلاع على طلباتها الحالية.",
        )}
      </p>
      <Link
        className={styles.open}
        href={
          `/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?lang=${locale}` as Route
        }
      >
        {t("Open campaign", "فتح الحملة")}
      </Link>
    </>
  );
}
