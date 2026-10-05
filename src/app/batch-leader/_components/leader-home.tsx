"use client";

import { ProductNavigationLink as Link } from "@/app/_components/product-navigation";
import type { Route } from "next";
import { AppShell } from "@/app/_components/app-shell";
import type {
  CollectionCampaign,
  CollectionSubmissionStatus,
} from "@/lib/collection/collection.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { formatCollectionDate } from "@/lib/i18n/collection-format";
import type { Locale } from "@/lib/i18n/locale";
import styles from "../collection.module.css";

export function CollectionHistory({
  campaigns,
  locale,
  heading,
}: {
  campaigns: readonly CollectionCampaign[];
  locale: Locale;
  heading: string;
}) {
  const text = getCollectionCopy(locale);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const labels: Record<CollectionSubmissionStatus, string> = {
    RECEIVED: text.received,
    PROCESSING: text.processing,
    NEEDS_INFORMATION: text.needsInformation,
    ACCEPTED: text.accepted,
    REJECTED: text.rejected,
    COMPLETED: text.completed,
  };
  const descriptions: Record<CollectionSubmissionStatus, string> = {
    RECEIVED: text.stateDescriptions[0],
    PROCESSING: text.stateDescriptions[1],
    NEEDS_INFORMATION: text.stateDescriptions[2],
    ACCEPTED: text.stateDescriptions[3],
    REJECTED: text.stateDescriptions[4],
    COMPLETED: text.stateDescriptions[5],
  };
  const rows = campaigns
    .flatMap((campaign) =>
      campaign.requestedItems.flatMap((item) =>
        item.latestSubmission
          ? [{ campaign, item, submission: item.latestSubmission }]
          : [],
      ),
    )
    .sort((a, b) =>
      b.submission.createdAt.localeCompare(a.submission.createdAt),
    );
  return (
    <section className={styles.history} aria-label={heading}>
      <h2>{heading}</h2>
      <p className={styles.helper}>
        {t(
          "Latest submission per request, from your currently assigned campaigns.",
          "آخر إرسال لكل طلب، من الحملات المسندة إليك حاليًا.",
        )}
      </p>
      {rows.length ? (
        <ul className={styles.historyList}>
          {rows.map(({ campaign, item, submission }) => (
            <li key={`${campaign.id}:${item.id}`}>
              <div>
                <strong>{item.title}</strong>
                <p>{submission.sourceName}</p>
                <span className={styles.helper}>
                  {formatCollectionDate(locale, submission.createdAt)}
                </span>
              </div>
              <div>
                <span className={styles.status} data-status={submission.status}>
                  {labels[submission.status]}
                </span>
                <p className={styles.helper}>
                  {descriptions[submission.status]}
                </p>
                {submission.status === "NEEDS_INFORMATION" ||
                submission.status === "REJECTED" ? (
                  <p className={styles.helper}>
                    {t(
                      "A review reason is not available in this view. Open the assigned campaign to inspect the request and permitted upload actions.",
                      "سبب المراجعة غير متاح في هذا العرض. افتح الحملة المسندة لفحص الطلب وإجراءات الرفع المسموحة.",
                    )}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p>{t("No submissions yet.", "لا توجد إرسالات بعد.")}</p>
          <p className={styles.helper}>
            {t(
              "Open an assigned campaign to upload its requested materials.",
              "افتح حملة مسندة لرفع المواد المطلوبة.",
            )}
          </p>
        </div>
      )}
    </section>
  );
}

export function LeaderHome({
  campaigns,
  locale,
  history = false,
  synthetic = false,
  preview = false,
}: {
  campaigns: readonly CollectionCampaign[];
  locale: Locale;
  history?: boolean;
  synthetic?: boolean;
  preview?: boolean;
}) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const title = history ? t("History", "السجل") : t("Uploads", "الرفع");
  const prefix = preview ? "/preview" : "";
  return (
    <AppShell
      locale={locale}
      role="leader"
      title={title}
      synthetic={synthetic}
      preview={preview}
    >
      <div className={`${styles.workspace} ${styles.campaignOverview}`}>
        <header className={styles.header}>
          <h1>{title}</h1>
          <p>
            {history
              ? t(
                  "Follow the latest status of the materials you submitted.",
                  "تابع آخر حالة للمواد التي أرسلتها.",
                )
              : t(
                  "Open a campaign assigned to you and add the requested materials.",
                  "افتح حملة مسندة إليك وأضف المواد المطلوبة.",
                )}
          </p>
        </header>
        {history ? (
          <CollectionHistory
            campaigns={campaigns}
            locale={locale}
            heading={t("Your submissions", "إرسالاتك")}
          />
        ) : (
          <section aria-label={t("Assigned campaigns", "الحملات المسندة")}>
            <h2>{t("Assigned campaigns", "الحملات المسندة")}</h2>
            {campaigns.length ? (
              <ul className={styles.campaignList}>
                {campaigns.map((campaign) => (
                  <li key={campaign.id}>
                    <div>
                      <h3>
                        <Link
                          href={
                            `${prefix}/batch-leader/campaigns/${campaign.id}?lang=${locale}` as Route
                          }
                        >
                          {campaign.name}
                        </Link>
                      </h3>
                      <p>{campaign.cohortName}</p>
                      <p className={styles.helper}>
                        {t("Required requests", "الطلبات المطلوبة")}:{" "}
                        {new Intl.NumberFormat(locale).format(
                          campaign.requestedItems.filter(
                            (item) => item.required,
                          ).length,
                        )}
                        {" · "}
                        {t("Latest submissions", "آخر الإرسالات")}:{" "}
                        {new Intl.NumberFormat(locale).format(
                          campaign.requestedItems.filter(
                            (item) => item.latestSubmission,
                          ).length,
                        )}
                      </p>
                      <p className={styles.helper}>
                        {t("Closes", "موعد الإغلاق")}:{" "}
                        {formatCollectionDate(locale, campaign.closesAt)}
                      </p>
                    </div>
                    <Link
                      className={styles.open}
                      href={
                        `${prefix}/batch-leader/campaigns/${campaign.id}?lang=${locale}` as Route
                      }
                    >
                      {t("Open campaign", "فتح الحملة")}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.empty}>
                <p>{getCollectionCopy(locale).noCampaigns}</p>
                <p className={styles.helper}>
                  {t(
                    "An administrator can assign you a campaign. Its invitation will take you here.",
                    "يمكن للمسؤول إسناد حملة إليك. ستنقلك دعوتها إلى هنا.",
                  )}
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </AppShell>
  );
}
