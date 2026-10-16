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
import { resolveCollectionCorrection } from "@/lib/collection/collection-queue.application";
import {
  collectionDeadline,
  collectionInspectionHref,
  collectionRequestAction,
  collectionWindow,
  projectCollectionRecords,
  type CollectionAcknowledgement,
} from "@/lib/collection/collection-presentation.application";
import type { Locale } from "@/lib/i18n/locale";
import { useCollectionClock } from "./use-collection-clock";
import styles from "../collection.module.css";

export function CollectionHistory({
  campaigns,
  locale,
  heading,
  preview = false,
  compact = false,
  acknowledgements = [],
  referenceTime,
}: {
  campaigns: readonly CollectionCampaign[];
  locale: Locale;
  heading: string;
  preview?: boolean;
  compact?: boolean;
  acknowledgements?: readonly CollectionAcknowledgement[];
  referenceTime?: string;
}) {
  const text = getCollectionCopy(locale),
    now = useCollectionClock(referenceTime);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const labels: Record<CollectionSubmissionStatus, string> = {
    RECEIVED: t("Received", "تم الاستلام"),
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
  const projected = campaigns.map((campaign) =>
    projectCollectionRecords(
      campaign,
      campaigns.length === 1 ? acknowledgements : [],
    ),
  );
  const rows = projected
    .flatMap((projection) =>
      projection.campaign.requestedItems.flatMap((item) =>
        item.latestSubmission
          ? [
              {
                campaign: projection.campaign,
                item,
                submission: item.latestSubmission,
                detail: projection.details.get(item.id),
              },
            ]
          : [],
      ),
    )
    .sort((a, b) =>
      b.submission.createdAt.localeCompare(a.submission.createdAt),
    );
  return (
    <section
      className={styles.history}
      aria-label={heading}
      id="latest-submissions"
    >
      <h2>{heading}</h2>
      <p className={styles.helper}>
        {t(
          "Latest submission per request in this view. Earlier versions are not listed here.",
          "آخر إرسال لكل طلب في هذا العرض. لا تظهر الإصدارات السابقة هنا.",
        )}
      </p>
      {projected.some((p) => p.unresolved.length) ? (
        <p role="status" className={styles.helper}>
          {t(
            "A file was received, but its latest status needs a fresh campaign view. Reopen the campaign to inspect the current record.",
            "تم استلام ملف، لكن آخر حالته يحتاج إلى تحديث عرض الحملة. أعد فتح الحملة للاطلاع على السجل الحالي.",
          )}
        </p>
      ) : null}
      {rows.length ? (
        <ul
          className={`${styles.historyList} ${compact ? styles.compactRecords : ""}`}
        >
          {rows.map(({ campaign, item, submission, detail }) => {
            const body = (
              <div className={styles.recordBody}>
                {campaigns.length > 1 ? <p>{campaign.name}</p> : null}
                {submission.createdAt ? (
                  <p className={styles.helper}>
                    {formatCollectionDate(locale, submission.createdAt)} ·{" "}
                    {t("Cairo time", "بتوقيت القاهرة")}
                  </p>
                ) : (
                  <p className={styles.helper}>
                    {t(
                      "Received in this tab; latest processing status awaits refresh.",
                      "تم الاستلام في هذا التبويب؛ آخر حالة للمعالجة تنتظر التحديث.",
                    )}
                  </p>
                )}
                <p className={styles.helper}>
                  {descriptions[submission.status]}
                </p>
                {submission.status === "RECEIVED" ? (
                  <p className={styles.helper}>
                    {t(
                      "File received. Processing and review are separate; this does not make it available to students.",
                      "تم استلام الملف. المعالجة والمراجعة خطوتان منفصلتان؛ ولا يعني هذا إتاحته للطلاب.",
                    )}
                  </p>
                ) : null}
                {detail ? (
                  <dl className={styles.receiptDetails}>
                    <dt>{t("File", "الملف")}</dt>
                    <dd>
                      <bdi>{detail.fileName}</bdi>
                    </dd>
                    <dt>{text.sourceTitle}</dt>
                    <dd>{detail.title}</dd>
                    <dt>{text.description}</dt>
                    <dd>{detail.description}</dd>
                    {detail.origin ? (
                      <>
                        <dt>{t("Origin", "المصدر")}</dt>
                        <dd>
                          {detail.origin === "APPROVED_REFERENCE"
                            ? t("Approved reference", "مرجع معتمد")
                            : t("Your device", "جهازك")}
                        </dd>
                      </>
                    ) : null}
                    <dt>{t("Permission", "الإذن")}</dt>
                    <dd>
                      {t(
                        "Declared when this file was submitted.",
                        "أُقرّ به عند إرسال هذا الملف.",
                      )}
                    </dd>
                  </dl>
                ) : null}
                {submission.status === "NEEDS_INFORMATION" ||
                submission.status === "REJECTED" ? (
                  <p className={styles.helper}>
                    {submission.correction
                      ? locale === "ar"
                        ? submission.correction.reasonAr
                        : submission.correction.reasonEn
                      : t(
                          "This recorded submission is read-only here. No correction action is available.",
                          "هذا الإرسال المسجل للقراءة فقط هنا. لا يتوفر إجراء للتصحيح.",
                        )}
                  </p>
                ) : null}
                <div className={styles.recordActions}>
                  <Link
                    className={styles.recordLink}
                    href={
                      collectionInspectionHref(
                        campaign.id,
                        item.id,
                        submission.id,
                        locale,
                        preview,
                      ) as Route
                    }
                  >
                    {t("Open request", "فتح الطلب")}
                  </Link>
                  {collectionWindow(campaign, now) === "ACTIVE" &&
                  resolveCollectionCorrection(
                    campaign,
                    item.id,
                    submission.id,
                  ) ? (
                    <Link
                      className={styles.open}
                      href={
                        `${preview ? "/preview" : ""}/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?request=${encodeURIComponent(item.id)}&submission=${encodeURIComponent(submission.id)}&lang=${locale}#collection-intake` as Route
                      }
                    >
                      {submission.correction?.action === "FIX_INFORMATION"
                        ? t("Fix information", "تصحيح المعلومات")
                        : t("Replace file", "استبدال الملف")}
                    </Link>
                  ) : null}
                </div>
              </div>
            );
            const summary = (
              <>
                <span>
                  <strong>{item.title}</strong>
                  <span className={styles.recordSource}>
                    {submission.sourceName}
                  </span>
                </span>
                <span className={styles.status} data-status={submission.status}>
                  {labels[submission.status]}
                </span>
              </>
            );
            return (
              <li
                key={`${campaign.id}:${item.id}`}
                data-record-request={item.id}
              >
                {compact ? (
                  <details
                    id={`collection-record-${encodeURIComponent(item.id)}`}
                    className={styles.recordDisclosure}
                  >
                    <summary>
                      <span className={styles.recordSummary}>{summary}</span>
                    </summary>
                    {body}
                  </details>
                ) : (
                  <>
                    <div className={styles.recordHeading}>{summary}</div>
                    {body}
                  </>
                )}
              </li>
            );
          })}
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
  referenceTime,
}: {
  campaigns: readonly CollectionCampaign[];
  locale: Locale;
  history?: boolean;
  synthetic?: boolean;
  preview?: boolean;
  referenceTime?: string;
}) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const title = history
    ? t("Latest submissions", "آخر الإرسالات")
    : t("Source intake", "استلام المصادر");
  const now = useCollectionClock(referenceTime),
    prefix = preview ? "/preview" : "";
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
                  "Follow the latest recorded status and open its request.",
                  "تابع آخر حالة مسجلة وافتح طلبها.",
                )
              : t(
                  "Start with the requests that need your action.",
                  "ابدأ بالطلبات التي تحتاج إلى إجراء منك.",
                )}
          </p>
        </header>
        {history ? (
          <CollectionHistory
            campaigns={campaigns}
            locale={locale}
            heading={t("Requests with submissions", "الطلبات ذات الإرسالات")}
            preview={preview}
            {...(referenceTime ? { referenceTime } : {})}
          />
        ) : (
          <section aria-label={t("Assigned campaigns", "الحملات المسندة")}>
            <h2>{t("Assigned campaigns", "الحملات المسندة")}</h2>
            {campaigns.length ? (
              <ul className={styles.campaignList}>
                {campaigns.map((campaign) => {
                  const cutoff = collectionDeadline(campaign),
                    window = collectionWindow(campaign, now),
                    outstanding = campaign.requestedItems.filter((item) =>
                      collectionRequestAction(campaign, item),
                    ).length;
                  return (
                    <li key={campaign.id}>
                      <div>
                        <h3>
                          <Link
                            href={
                              `${prefix}/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?lang=${locale}` as Route
                            }
                          >
                            {campaign.name}
                          </Link>
                        </h3>
                        <p>{campaign.cohortName}</p>
                        <p className={styles.personalDeadline}>
                          {t("Your deadline", "موعدك النهائي")}:{" "}
                          {cutoff
                            ? formatCollectionDate(locale, cutoff)
                            : t("Unavailable", "غير متاح")}{" "}
                          · {t("Cairo time", "بتوقيت القاهرة")}
                        </p>
                        <p>
                          {window === "ACTIVE"
                            ? `${new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(outstanding)} ${t("requests need your action", "طلبات تحتاج إلى إجراء منك")}`
                            : collectionWindowMessage(window, locale)}
                        </p>
                        <details className={styles.deadlineDetails}>
                          <summary>
                            {t(
                              "Assignment and campaign dates",
                              "مواعيد التكليف والحملة",
                            )}
                          </summary>
                          <p>
                            {t("Assignment expires", "ينتهي التكليف")}:{" "}
                            {formatCollectionDate(
                              locale,
                              campaign.assignmentExpiresAt,
                            )}
                          </p>
                          <p>
                            {t("Campaign closes", "تُغلق الحملة")}:{" "}
                            {formatCollectionDate(locale, campaign.closesAt)}
                          </p>
                          <p>
                            {t(
                              "The earlier date is your upload cutoff. All dates use Cairo time.",
                              "الموعد الأسبق هو آخر وقت متاح لك للرفع. كل المواعيد بتوقيت القاهرة.",
                            )}
                          </p>
                        </details>
                      </div>
                      <Link
                        className={styles.open}
                        href={
                          `${prefix}/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?lang=${locale}` as Route
                        }
                      >
                        {window === "ACTIVE"
                          ? t("Open requests", "فتح الطلبات")
                          : t("Inspect requests", "الاطلاع على الطلبات")}
                      </Link>
                    </li>
                  );
                })}
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

export function collectionWindowMessage(
  window: ReturnType<typeof collectionWindow>,
  locale: Locale,
) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  return window === "EXPIRED"
    ? t(
        "Your upload deadline has passed. You can inspect the recorded submissions available in this view.",
        "انتهى موعدك للرفع. يمكنك الاطلاع على الإرسالات المسجلة المتاحة في هذا العرض.",
      )
    : window === "CLOSED"
      ? t(
          "This campaign is closed. You can inspect the recorded submissions available in this view.",
          "هذه الحملة مغلقة. يمكنك الاطلاع على الإرسالات المسجلة المتاحة في هذا العرض.",
        )
      : window === "NOT_OPEN"
        ? t(
            "This campaign has not opened for uploads yet.",
            "لم تبدأ هذه الحملة في استقبال الملفات بعد.",
          )
        : t(
            "Upload availability could not be confirmed. Reopen your assigned campaigns.",
            "تعذر التأكد من إتاحة الرفع. أعد فتح الحملات المسندة إليك.",
          );
}
