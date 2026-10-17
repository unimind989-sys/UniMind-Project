"use client";

import { Button } from "@/app/_components/product-ui";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import type { CollectionQueueFile } from "@/lib/collection/collection-client-state.application";
import {
  compatibleCollectionItems,
  collectionRetryable,
} from "@/lib/collection/collection-queue.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import type { Locale } from "@/lib/i18n/locale";
import { collectionErrorText, collectionText } from "./collection-text";
import type { CollectionFlowState } from "./use-collection-flow";
import styles from "../../collection.module.css";

export function CollectionQueueRow({
  row,
  campaign,
  locale,
  flow,
}: Readonly<{
  row: CollectionQueueFile;
  campaign: CollectionCampaign;
  locale: Locale;
  flow: CollectionFlowState;
}>) {
  const text = getCollectionCopy(locale);
  const t = collectionText(locale);
  const errorText = (code: string) => collectionErrorText(code, locale);
  const { queue, windowState, canSubmit, submit } = flow;
  const item = campaign.requestedItems.find((value) => value.id === row.itemId);
  const choices = row.inspection
    ? compatibleCollectionItems(
        campaign.requestedItems,
        row.inspection.expectedType,
      )
    : [];
  const busy = row.state === "UPLOADING" || row.state === "FINALIZING";
  const predecessor = row.metadata ? row.predecessor : item?.latestSubmission;
  const permanentFailure =
    (row.state === "ERROR" || row.state === "INVALID") &&
    !collectionRetryable(row.error);
  return (
    <li
      className={styles.file}
      data-state={row.state}
      data-predecessor-id={row.metadata ? row.predecessor?.id : undefined}
      aria-busy={busy}
    >
      <div className={styles.fileHeading}>
        <strong>
          <bdi>{row.file.name}</bdi>
        </strong>
        {row.inspection ? (
          <span>
            {row.inspection.declaredFormat}
            {t(", ", "، ")}
            {new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en", {
              maximumFractionDigits: 1,
            }).format(row.file.size / 1024)}{" "}
            KB
          </span>
        ) : null}
      </div>
      <p className={styles.fileOrigin}>
        {row.origin === "APPROVED_REFERENCE"
          ? t("Origin: Approved reference", "المصدر: مرجع معتمد")
          : t("Origin: Your device", "المصدر: جهازك")}
      </p>
      {row.inspection ? (
        <>
          {item ? (
            <p className={styles.destination}>
              <span>
                {t("For", "لـ")}: {item.title}
              </span>
              {predecessor ? (
                <span className={styles.tag}>
                  {t("Replacement candidate", "نسخة بديلة")}
                </span>
              ) : null}
            </p>
          ) : null}
          {predecessor ? (
            <p className={styles.helper}>
              {t("Earlier submission", "الإرسال السابق")}:{" "}
              <bdi>
                {predecessor.sourceName} ({predecessor.id})
              </bdi>
            </p>
          ) : null}
          {!item ? (
            <label className={styles.field}>
              {text.requestedItem}
              <select
                value={row.itemId ?? ""}
                disabled={
                  queue.running ||
                  windowState !== "ACTIVE" ||
                  !!row.receipt ||
                  !!row.boundRequestedItemId
                }
                onChange={(event) =>
                  queue.edit(row.id, {
                    itemId: event.target.value || null,
                  })
                }
              >
                <option value="">
                  {t("Choose a requested material", "اختر المادة المطلوبة")}
                </option>
                {choices.map((choice) => (
                  <option value={choice.id} key={choice.id}>
                    {choice.title}
                  </option>
                ))}
              </select>
              {!choices.length ? (
                <span>
                  {t(
                    "No compatible request is available for this file.",
                    "لا يوجد طلب مناسب لهذا الملف.",
                  )}
                </span>
              ) : null}
            </label>
          ) : null}
          <details className={styles.fileDetails} open>
            <summary>{t("Source details", "تفاصيل المصدر")}</summary>
            <label className={styles.field}>
              {text.sourceTitle}
              <input
                value={row.title}
                dir="auto"
                minLength={3}
                maxLength={200}
                disabled={
                  queue.running ||
                  !!row.receipt ||
                  row.state === "RECEIVED" ||
                  permanentFailure ||
                  windowState !== "ACTIVE"
                }
                onChange={(event) =>
                  queue.edit(row.id, {
                    title: event.target.value,
                  })
                }
              />
            </label>
            {item && choices.length > 1 ? (
              <label className={styles.field}>
                {t("Change requested material", "تغيير المادة المطلوبة")}
                <select
                  value={row.itemId ?? ""}
                  disabled={
                    queue.running ||
                    !!row.receipt ||
                    row.state === "RECEIVED" ||
                    !!row.correctionSubmissionId ||
                    !!row.boundRequestedItemId ||
                    permanentFailure ||
                    windowState !== "ACTIVE"
                  }
                  onChange={(event) =>
                    queue.edit(row.id, {
                      itemId: event.target.value,
                    })
                  }
                >
                  {choices.map((choice) => (
                    <option value={choice.id} key={choice.id}>
                      {choice.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </details>
        </>
      ) : null}
      <div className={styles.fileResult} role="status">
        {row.state === "CHECKING"
          ? t("Checking file…", "جارٍ فحص الملف…")
          : row.state === "READY"
            ? !row.itemId
              ? t(
                  "Choose a requested material to continue.",
                  "اختر المادة المطلوبة للمتابعة.",
                )
              : row.title.trim().length < 3
                ? t(
                    "Add a source title of at least 3 characters.",
                    "أضف عنوان مصدر من ٣ أحرف على الأقل.",
                  )
                : t("Ready to upload", "جاهز للرفع")
            : row.state === "UPLOADING"
              ? `${t("Uploading", "جارٍ الرفع")} · ${row.progress}%`
              : row.state === "FINALIZING"
                ? t("Confirming submission…", "جارٍ تأكيد الإرسال…")
                : row.state === "RECEIVED"
                  ? text.submitted
                  : row.error
                    ? errorText(row.error)
                    : null}
      </div>
      {row.state === "UPLOADING" ? (
        <progress
          max={100}
          value={row.progress}
          aria-label={`${t("Upload progress", "تقدم الرفع")}: ${row.file.name}`}
        />
      ) : null}
      <div className={styles.actions}>
        {row.state === "ERROR" &&
        collectionRetryable(row.error) &&
        row.inspection &&
        row.itemId ? (
          <Button
            variant="secondary"
            disabled={queue.running || !canSubmit}
            onClick={() => void submit([row.id])}
          >
            {row.receipt
              ? t("Retry submission", "إعادة محاولة الإرسال")
              : text.uploadAgain}
          </Button>
        ) : null}
        {row.error === "DUPLICATE_FILE" || row.error === "CORRECTION_STALE" ? (
          <a className={styles.open} href="#latest-submissions">
            {t("View recorded submission", "عرض الإرسال المسجل")}
          </a>
        ) : null}
        {!queue.running && row.state !== "RECEIVED" ? (
          <Button
            variant="quiet"
            onClick={() => queue.remove(row.id)}
            aria-label={`${text.removeFile}: ${row.file.name}`}
          >
            {text.removeFile}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
