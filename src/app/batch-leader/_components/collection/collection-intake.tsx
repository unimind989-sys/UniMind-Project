"use client";

import type { CollectionCampaign } from "@/lib/collection/collection.application";
import { Button } from "@/app/_components/product-ui";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import type { Locale } from "@/lib/i18n/locale";
import { CollectionQueueRow } from "./collection-queue-row";
import { collectionText } from "./collection-text";
import type { CollectionFlowState } from "./use-collection-flow";
import styles from "../../collection.module.css";

export function CollectionIntake({
  campaign,
  locale,
  reference,
  flow,
}: Readonly<{
  campaign: CollectionCampaign;
  locale: Locale;
  reference?: Readonly<{ name: string; file: () => File }> | undefined;
  flow: CollectionFlowState;
}>) {
  const text = getCollectionCopy(locale);
  const t = collectionText(locale);
  const {
    openIntake,
    selectedRequestId,
    correction,
    drag,
    setDrag,
    queue,
    add,
    picker,
    windowState,
    description,
    setDescription,
    rights,
    setRights,
    canSubmit,
    ready,
    submit,
  } = flow;
  return (
    <section
      className={styles.intake}
      aria-labelledby="collection-intake"
      hidden={!openIntake}
    >
      <h2 id="collection-intake">
        {selectedRequestId
          ? t("Upload file", "رفع ملف")
          : t("Upload files", "رفع الملفات")}
      </h2>
      {selectedRequestId ? (
        <p className={styles.helper}>
          {t("For", "لـ")}:{" "}
          <strong>
            {
              campaign.requestedItems.find(
                (item) => item.id === selectedRequestId,
              )?.title
            }
          </strong>
        </p>
      ) : null}
      {correction ? (
        <div role="status" className={styles.helper}>
          <p>
            {correction.action === "FIX_INFORMATION"
              ? t("Fix information", "تصحيح المعلومات")
              : t("Replace file", "استبدال الملف")}
            :{" "}
            <strong>
              {
                campaign.requestedItems.find(
                  (item) => item.id === correction.requestedItemId,
                )?.title
              }
            </strong>
          </p>
          <p>{locale === "ar" ? correction.reasonAr : correction.reasonEn}</p>
          <p>
            {t(
              "Choose the file for this request and confirm its description and permission. The earlier submission stays unchanged.",
              "اختر ملف هذا الطلب وأكّد وصفه وصلاحية إرساله. يبقى الإرسال السابق دون تغيير.",
            )}
          </p>
        </div>
      ) : null}
      <p className={styles.helper}>
        {t(
          "Only synthetic files are accepted at this stage.",
          "في هذه المرحلة، تقبل الملفات التجريبية فقط.",
        )}
      </p>
      <p className={styles.helper}>
        {t(
          "PDF · WAV · PNG · Up to 10 MB per file",
          "PDF · WAV · PNG · حتى ١٠ ميجابايت للملف",
        )}
      </p>
      <div
        className={styles.drop}
        data-drag={drag || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          if (!queue.running) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDrag(false);
          add(Array.from(event.dataTransfer.files));
        }}
      >
        <div className={styles.uploadMark} aria-hidden="true">
          <FrontendIcon name="send" />
        </div>
        <p>
          {t(
            "Drop files here, or choose them from your device.",
            "ضع الملفات هنا، أو اخترها من جهازك.",
          )}
        </p>
        <Button
          variant="primary"
          onClick={() => picker.current?.click()}
          disabled={queue.running || windowState !== "ACTIVE"}
        >
          {t("Choose files", "اختيار ملفات")}
        </Button>
        <input
          ref={picker}
          type="file"
          hidden
          multiple={!selectedRequestId && !correction}
          accept=".pdf,.wav,.png"
          aria-label={t("Choose files", "اختيار ملفات")}
          disabled={queue.running || windowState !== "ACTIVE"}
          onChange={(event) => {
            add(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>
      {reference ? (
        <div className={styles.reference}>
          <span>{reference.name}</span>
          <Button
            variant="quiet"
            disabled={queue.running || windowState !== "ACTIVE"}
            onClick={() => add([reference.file()], "APPROVED_REFERENCE")}
          >
            {t("Add approved reference", "إضافة المرجع المعتمد")}
          </Button>
        </div>
      ) : null}
      {queue.duplicate ? (
        <p role="status" className={styles.helper}>
          {t(
            "That file is already in your queue.",
            "هذا الملف موجود بالفعل في قائمتك.",
          )}
        </p>
      ) : null}
      {queue.files.some((row) => row.state !== "RECEIVED") ? (
        <ul
          className={styles.queue}
          aria-label={t("Upload queue", "قائمة الرفع")}
        >
          {queue.files
            .filter((row) => row.state !== "RECEIVED")
            .map((row) => (
              <CollectionQueueRow
                key={row.id}
                row={row}
                campaign={campaign}
                locale={locale}
                flow={flow}
              />
            ))}
        </ul>
      ) : (
        <p className={styles.helper}>
          {t(
            "Your queue is empty. Choose one or more files to get started.",
            "قائمة الرفع فارغة. اختر ملفًا أو أكثر للبدء.",
          )}
        </p>
      )}
      {correction ||
      queue.files.some((row) => row.inspection && row.state !== "RECEIVED") ? (
        <div className={styles.context}>
          <label className={styles.field}>
            {text.description}
            <textarea
              id="collection-description"
              rows={3}
              minLength={10}
              maxLength={1000}
              value={description}
              placeholder={t(
                "Who prepared these materials, and what do they cover?",
                "من أعد هذه المواد، وما موضوعها؟",
              )}
              disabled={queue.running || windowState !== "ACTIVE"}
              onChange={(event) => setDescription(event.target.value)}
            />
            <span>
              {t(
                "This context will accompany each file. Minimum 10 characters.",
                "يرفق هذا الوصف بكل ملف. ١٠ أحرف على الأقل.",
              )}
            </span>
          </label>
          <label className={styles.rights}>
            <input
              type="checkbox"
              checked={rights}
              disabled={queue.running || windowState !== "ACTIVE"}
              onChange={(event) => setRights(event.target.checked)}
            />
            <span>
              {t(
                "I have permission to submit every selected file for this campaign.",
                "لدي صلاحية إرسال كل الملفات المختارة لهذه الحملة.",
              )}
            </span>
          </label>
          <div className={styles.actions}>
            <Button
              variant="primary"
              disabled={queue.running || !canSubmit || !ready.length}
              onClick={() => void submit(ready.map((row) => row.id))}
            >
              {t("Submit files", "إرسال الملفات")}
            </Button>
            {queue.running ? (
              <Button variant="secondary" onClick={queue.cancel}>
                {text.cancel}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
