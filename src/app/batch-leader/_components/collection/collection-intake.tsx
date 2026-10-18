"use client";

import type { CollectionCampaign } from "@/lib/collection/collection.application";
import { Button } from "@/app/_components/product-ui";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import { StateIcon } from "@/app/_components/state-pill";
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
    dropZone,
    queue,
    add,
    picker,
    chooseButton,
    windowState,
    description,
    setDescription,
    rights,
    confirmRights,
    rightsCleared,
    canSubmit,
    ready,
    submit,
    cancel,
  } = flow;
  const descriptionShort = description.trim().length < 10;
  const editable = !queue.running && windowState === "ACTIVE";
  // Why Submit and Retry are disabled, next to the button (IX-08).
  const needs = [
    {
      key: "description",
      done: !descriptionShort,
      label: t(
        "A description of at least 10 characters",
        "وصف من ١٠ أحرف على الأقل",
      ),
    },
    {
      key: "rights",
      done: rights,
      label: t("Permission confirmed", "تأكيد صلاحية الإرسال"),
    },
    {
      key: "file",
      done: ready.length > 0,
      label: t(
        "A file with its requested material and a title of at least 3 characters",
        "ملف محدد له المادة المطلوبة وعنوان من ٣ أحرف على الأقل",
      ),
    },
  ] as const;
  const blocked = editable && needs.some((need) => !need.done);
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
        <p className={styles.intakeFor}>
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
        <div role="status" className={styles.correctionNote}>
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
        )}{" "}
        {t(
          "PDF, WAV or PNG, up to 10 MB each.",
          "PDF أو WAV أو PNG، حتى ١٠ ميجابايت للملف.",
        )}
      </p>
      <div className={styles.drop} data-drag={drag || undefined} {...dropZone}>
        <div className={styles.uploadMark} aria-hidden="true">
          <FrontendIcon name="upload" size={24} />
        </div>
        <p>
          {t(
            "Drop files here, or choose them from your device.",
            "ضع الملفات هنا، أو اخترها من جهازك.",
          )}
        </p>
        <Button
          ref={chooseButton}
          variant="primary"
          onClick={() => picker.current?.click()}
          disabled={!editable}
        >
          {t("Choose files", "اختيار ملفات")}
        </Button>
        {/* Hidden: the button above names and opens it. MIME types beside
            the extensions let Android pickers offer matching files. */}
        <input
          ref={picker}
          type="file"
          hidden
          multiple={!selectedRequestId && !correction}
          accept=".pdf,.wav,.png,application/pdf,audio/wav,audio/x-wav,image/png"
          disabled={!editable}
          onChange={(event) => {
            add(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>
      {reference ? (
        <div className={styles.reference}>
          <span>
            <bdi>{reference.name}</bdi>
          </span>
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
        <p className={styles.queueEmpty}>
          {t(
            "Your queue is empty. Choose one or more files to get started.",
            "قائمة الرفع فارغة. اختر ملفًا أو أكثر للبدء.",
          )}
        </p>
      )}
      {correction ||
      queue.files.some((row) => row.inspection && row.state !== "RECEIVED") ? (
        <div className={styles.context}>
          {/* The label holds only the name; the hint describes the field
              (inventory #20). What is still missing shows next to Submit,
              not under the field, so nothing shifts while a press is in
              flight. */}
          <div className={styles.field}>
            <label htmlFor="collection-description">{text.description}</label>
            <textarea
              id="collection-description"
              rows={3}
              minLength={10}
              maxLength={1000}
              required
              dir="auto"
              value={description}
              placeholder={t(
                "Who prepared these materials, and what do they cover?",
                "من أعد هذه المواد، وما موضوعها؟",
              )}
              disabled={!editable}
              aria-describedby="collection-description-hint"
              onChange={(event) => setDescription(event.target.value)}
            />
            <span id="collection-description-hint">
              {t(
                "This context will accompany each file. Minimum 10 characters.",
                "يرفق هذا الوصف بكل ملف. ١٠ أحرف على الأقل.",
              )}
            </span>
          </div>
          <label className={styles.rights}>
            <input
              type="checkbox"
              checked={rights}
              required
              disabled={!editable}
              aria-describedby={
                rightsCleared ? "collection-rights-cleared" : undefined
              }
              onChange={(event) => confirmRights(event.target.checked)}
            />
            <span>
              {t(
                "I have permission to submit every selected file for this campaign.",
                "لدي صلاحية إرسال كل الملفات المختارة لهذه الحملة.",
              )}
            </span>
          </label>
          {/* Always present, so adding files announces the cleared
              permission (IX-08). */}
          <p
            id="collection-rights-cleared"
            className={styles.rightsCleared}
            role="status"
          >
            {rightsCleared
              ? t(
                  "Permission was cleared because the files changed. Confirm it again for every selected file.",
                  "أُلغي تأكيد الصلاحية لأن الملفات تغيرت. أكّده مرة أخرى لكل الملفات المختارة.",
                )
              : null}
          </p>
          {blocked ? (
            <div className={styles.submitNeeds} id="collection-submit-needs">
              <p>{t("To submit:", "للإرسال:")}</p>
              <ul>
                {needs.map((need) => (
                  <li
                    key={need.key}
                    data-need={need.key}
                    data-done={need.done || undefined}
                  >
                    <StateIcon tone={need.done ? "ok" : "neutral"} />
                    <span className="visually-hidden">
                      {need.done
                        ? t("Done: ", "تم: ")
                        : t("Missing: ", "ناقص: ")}
                    </span>
                    {need.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className={styles.actions}>
            <Button
              variant="primary"
              disabled={queue.running || !canSubmit || !ready.length}
              aria-describedby={blocked ? "collection-submit-needs" : undefined}
              onClick={() => void submit(ready.map((row) => row.id))}
            >
              {t("Submit files", "إرسال الملفات")}
            </Button>
            {queue.running ? (
              <Button variant="secondary" onClick={cancel}>
                {text.cancel}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
