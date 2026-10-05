"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { Button } from "@/app/_components/product-ui";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import type { CollectionActionState } from "../collection-actions";
import { compatibleCollectionItems } from "@/lib/collection/collection-queue.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { formatCollectionDate } from "@/lib/i18n/collection-format";
import type { Locale } from "@/lib/i18n/locale";
import {
  collectionUploadClient,
  type CollectionUploadClient,
} from "./collection-upload-client";
import {
  useCollectionQueue,
  type CollectionFinalizeAction,
} from "./use-collection-queue";
import { CollectionHistory } from "./leader-home";
import styles from "../collection.module.css";

export type { CollectionUploadClient } from "./collection-upload-client";

export function CollectionFlow({
  campaign,
  locale,
  uploadEndpoint,
  finalizeAction,
  initialActionState,
  syntheticPreview = false,
  uploadClient,
  allowFile,
  reference,
  homeHref,
  initialMetadata,
}: Readonly<{
  campaign: CollectionCampaign;
  locale: Locale;
  uploadEndpoint: string;
  finalizeAction: CollectionFinalizeAction;
  initialActionState: CollectionActionState;
  initialClientKey: string;
  syntheticPreview?: boolean;
  uploadClient?: CollectionUploadClient;
  allowFile?: (file: File) => Promise<boolean>;
  reference?: Readonly<{ name: string; file: () => File }>;
  homeHref?: string;
  initialMetadata?: Readonly<{ title: string; description: string }>;
}>) {
  const text = getCollectionCopy(locale);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const upload = useMemo(
    () => uploadClient ?? collectionUploadClient(uploadEndpoint),
    [uploadClient, uploadEndpoint],
  );
  const queue = useCollectionQueue({
    campaign,
    upload,
    finalize: finalizeAction,
    initialState: initialActionState,
    ...(allowFile ? { allowFile } : {}),
    ...(initialMetadata ? { initialTitle: initialMetadata.title } : {}),
  });
  const [description, setDescription] = useState(
    initialMetadata?.description ?? "",
  );
  const [rights, setRights] = useState(false);
  const [drag, setDrag] = useState(false);
  const picker = useRef<HTMLInputElement>(null);
  const back =
    homeHref ?? (syntheticPreview ? "/preview/batch-leader" : "/batch-leader");
  const ready = queue.files.filter(
    (row) =>
      row.inspection &&
      row.itemId &&
      row.title.trim().length >= 3 &&
      ["READY", "ERROR"].includes(row.state),
  );
  const canSubmit =
    rights &&
    description.trim().length >= 10 &&
    description.trim().length <= 1000;
  function add(files: readonly File[]) {
    if (queue.running) return;
    setRights(false);
    void queue.add(files);
  }
  const errorText = (code: string) =>
    ({
      UNSAFE_DEMO_FILE: t(
        "Use the supplied synthetic files only. Private files are not accepted in this demo.",
        "استخدم الملفات التجريبية المرفقة فقط. لا يقبل العرض ملفات خاصة.",
      ),
      FILE_TOO_LARGE: t(
        "This file exceeds the 10 MB limit.",
        "هذا الملف يتجاوز الحد الأقصى ١٠ ميجابايت.",
      ),
      EMPTY_FILE: t(
        "This file is empty. Choose another file.",
        "هذا الملف فارغ. اختر ملفًا آخر.",
      ),
      FORBIDDEN_TYPE: t(
        "The file contents are not a supported PDF, WAV, or PNG.",
        "محتوى الملف ليس PDF أو WAV أو PNG مدعومًا.",
      ),
      FILE_UNREADABLE: t(
        "This file could not be read. Choose it again.",
        "تعذرت قراءة الملف. اختره مرة أخرى.",
      ),
      UPLOAD_INTERRUPTED: text.offlineError,
      UPLOAD_FAILED: text.offlineError,
      FINALIZE_FAILED: t(
        "The file was uploaded, but its submission could not be confirmed. Retry submission without uploading again.",
        "تم رفع الملف، لكن تعذر تأكيد الإرسال. أعد محاولة الإرسال دون رفع الملف مجددًا.",
      ),
      VALIDATION_REJECTED: t(
        "The server could not verify this file. Check the campaign and try again.",
        "تعذر على الخادم التحقق من الملف. راجع الحملة وحاول مجددًا.",
      ),
      RIGHTS_REQUIRED: text.rightsMissing,
    })[code] ?? text.genericError;
  return (
    <AppShell
      locale={locale}
      role="leader"
      synthetic={syntheticPreview}
      preview={syntheticPreview}
      title={t("Uploads", "الرفع")}
    >
      <div className={styles.workspace}>
        <Link className={styles.back} href={`${back}?lang=${locale}` as Route}>
          {text.backToCampaigns}
        </Link>
        <header className={styles.header}>
          <h1>{campaign.name}</h1>
          <p>{campaign.cohortName}</p>
          <p>
            {t(
              "Add the materials requested for your batch. Uploading finishes before processing begins.",
              "أضف المواد المطلوبة لدفعتك. ينتهي الرفع قبل بدء المعالجة.",
            )}
          </p>
        </header>
        <aside className={styles.assignment} aria-labelledby="intake-deadline">
          <h2 id="intake-deadline">{t("Your deadline", "موعدك النهائي")}</h2>
          <strong>
            {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Africa/Cairo",
            }).format(
              new Date(
                Math.min(
                  Date.parse(campaign.closesAt),
                  Date.parse(campaign.assignmentExpiresAt),
                ),
              ),
            )}
          </strong>
          <details className={styles.deadlineDetails}>
            <summary>
              {t("Assignment and campaign dates", "مواعيد التكليف والحملة")}
            </summary>
            <p>
              {text.assignment}:{" "}
              {formatCollectionDate(locale, campaign.assignmentExpiresAt)}
            </p>
            <p>
              {text.due}: {formatCollectionDate(locale, campaign.closesAt)}
            </p>
          </details>
          <details className={styles.requests} open>
            <summary>
              {text.requestQueue} ·{" "}
              {campaign.requestedItems.filter((item) => item.required).length}
            </summary>
            <ul>
              {campaign.requestedItems
                .filter((item) => item.required)
                .map((item) => (
                  <li key={item.id}>
                    <span>{item.title}</span>
                    <span>
                      {item.latestSubmission
                        ? text.received
                        : t("Awaiting file", "بانتظار ملف")}
                    </span>
                  </li>
                ))}
            </ul>
          </details>
        </aside>
        <section className={styles.intake} aria-labelledby="collection-intake">
          <h2 id="collection-intake">{t("Add files", "إضافة ملفات")}</h2>
          <p className={styles.helper}>
            {t(
              "Only synthetic files are accepted at this stage.",
              "في هذه المرحلة، تقبل الملفات التجريبية فقط.",
            )}
          </p>
          <p className={styles.helper}>
            {t(
              "PDF, WAV and PNG · Up to 10 MB per file · Mixed files welcome",
              "PDF وWAV وPNG · حتى ١٠ ميجابايت للملف · يمكنك اختيار أنواع مختلفة",
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
              disabled={queue.running}
            >
              {t("Choose files", "اختيار ملفات")}
            </Button>
            <input
              ref={picker}
              type="file"
              hidden
              multiple
              accept=".pdf,.wav,.png"
              aria-label={t("Choose files", "اختيار ملفات")}
              disabled={queue.running}
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
                disabled={queue.running}
                onClick={() => add([reference.file()])}
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
          {queue.files.length ? (
            <ul
              className={styles.queue}
              aria-label={t("Upload queue", "قائمة الرفع")}
            >
              {queue.files.map((row) => {
                const item = campaign.requestedItems.find(
                  (value) => value.id === row.itemId,
                );
                const choices = row.inspection
                  ? compatibleCollectionItems(
                      campaign.requestedItems,
                      row.inspection.expectedType,
                    )
                  : [];
                const busy =
                  row.state === "UPLOADING" || row.state === "FINALIZING";
                return (
                  <li
                    className={styles.file}
                    key={row.id}
                    data-state={row.state}
                    aria-busy={busy}
                  >
                    <div className={styles.fileHeading}>
                      <strong>
                        <bdi>{row.file.name}</bdi>
                      </strong>
                      {row.inspection ? (
                        <span>
                          {row.inspection.declaredFormat} ·{" "}
                          {new Intl.NumberFormat(
                            locale === "ar" ? "ar-EG" : "en",
                            { maximumFractionDigits: 1 },
                          ).format(row.file.size / 1024)}{" "}
                          KB
                        </span>
                      ) : null}
                    </div>
                    {row.inspection ? (
                      <>
                        {item ? (
                          <p className={styles.destination}>
                            {t("For", "لـ")}: {item.title}
                            {item.latestSubmission
                              ? ` · ${t("Replacement candidate", "نسخة بديلة")}`
                              : ""}
                          </p>
                        ) : null}
                        {!item ? (
                          <label className={styles.field}>
                            {text.requestedItem}
                            <select
                              value={row.itemId ?? ""}
                              disabled={queue.running || !!row.receipt}
                              onChange={(event) =>
                                queue.edit(row.id, {
                                  itemId: event.target.value || null,
                                })
                              }
                            >
                              <option value="">
                                {t(
                                  "Choose a requested material",
                                  "اختر المادة المطلوبة",
                                )}
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
                          <summary>
                            {t("Source details", "تفاصيل المصدر")}
                          </summary>
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
                                row.state === "RECEIVED"
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
                              {t(
                                "Change requested material",
                                "تغيير المادة المطلوبة",
                              )}
                              <select
                                value={row.itemId ?? ""}
                                disabled={
                                  queue.running ||
                                  !!row.receipt ||
                                  row.state === "RECEIVED"
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
                              ? t(
                                  "Confirming submission…",
                                  "جارٍ تأكيد الإرسال…",
                                )
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
                    {row.state === "RECEIVED" ? (
                      <div className={styles.receiptStages}>
                        <p>
                          <FrontendIcon name="check" />
                          {t("File received", "تم استلام الملف")}
                        </p>
                        <p>
                          {t(
                            "Processing and review pending",
                            "المعالجة والمراجعة معلقتان",
                          )}
                        </p>
                        <p>
                          {t(
                            "Not available to students yet",
                            "غير متاح للطلاب بعد",
                          )}
                        </p>
                        <p className={styles.helper}>
                          {t(
                            "Received safely. Processing will continue separately; you can upload the next file.",
                            "تم الاستلام بأمان. تستمر المعالجة بشكل منفصل؛ يمكنك رفع الملف التالي.",
                          )}
                        </p>
                      </div>
                    ) : null}
                    <div className={styles.actions}>
                      {row.state === "ERROR" && row.inspection && row.itemId ? (
                        <Button
                          variant="secondary"
                          disabled={queue.running || !canSubmit}
                          onClick={() =>
                            void queue.submit([row.id], description, rights)
                          }
                        >
                          {row.receipt
                            ? t("Retry submission", "إعادة محاولة الإرسال")
                            : text.uploadAgain}
                        </Button>
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
              })}
            </ul>
          ) : (
            <p className={styles.helper}>
              {t(
                "Your queue is empty. Choose one or more files to get started.",
                "قائمة الرفع فارغة. اختر ملفًا أو أكثر للبدء.",
              )}
            </p>
          )}
          {queue.files.some(
            (row) => row.inspection && row.state !== "RECEIVED",
          ) ? (
            <div className={styles.context}>
              <label className={styles.field}>
                {text.description}
                <textarea
                  rows={3}
                  minLength={10}
                  maxLength={1000}
                  value={description}
                  placeholder={t(
                    "Who prepared these materials, and what do they cover?",
                    "من أعد هذه المواد، وما موضوعها؟",
                  )}
                  disabled={queue.running}
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
                  disabled={queue.running}
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
                  onClick={() =>
                    void queue.submit(
                      ready.map((row) => row.id),
                      description,
                      rights,
                    )
                  }
                >
                  {t("Upload files", "رفع الملفات")}
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
        <CollectionHistory
          campaigns={[campaign]}
          locale={locale}
          heading={t("Latest submissions", "آخر الإرسالات")}
        />
      </div>
    </AppShell>
  );
}
