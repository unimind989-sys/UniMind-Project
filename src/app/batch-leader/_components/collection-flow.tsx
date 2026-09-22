"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import type { CollectionActionState } from "../collection-actions";
import type {
  CollectionCampaign,
  CollectionSubmissionStatus,
} from "@/lib/collection/collection.application";
import {
  COLLECTION_BROWSER_MAX_FILE_BYTES,
  inspectCollectionFileForBrowser,
} from "@/lib/collection/collection-browser.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { getTextDirection, type Locale } from "@/lib/i18n/locale";

import styles from "../collection.module.css";

type UploadReceipt = Readonly<{
  uploadId: string;
  checksum: string;
  mimeType: string;
  byteSize: number;
}>;

type ClientInspection = Readonly<{
  file: File;
  mimeType: string;
  format: string;
  expectedType: "DOCUMENT" | "AUDIO" | "IMAGE";
  byteSize: number;
}>;

type FinalizeAction = (
  previousState: CollectionActionState,
  formData: FormData,
) => Promise<CollectionActionState>;

const statusOrder: readonly CollectionSubmissionStatus[] = [
  "RECEIVED",
  "PROCESSING",
  "NEEDS_INFORMATION",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
];

function statusLabel(
  status: CollectionSubmissionStatus,
  text: ReturnType<typeof getCollectionCopy>,
) {
  return {
    RECEIVED: text.received,
    PROCESSING: text.processing,
    NEEDS_INFORMATION: text.needsInformation,
    ACCEPTED: text.accepted,
    REJECTED: text.rejected,
    COMPLETED: text.completed,
  }[status];
}

function formatDate(locale: Locale, value: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatBytes(locale: Locale, value: number) {
  if (value < 1024) return locale === "ar" ? "أقل من ١" : "<1";
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en", {
    maximumFractionDigits: 1,
  }).format(value / 1024);
}

export function CollectionFlow({
  campaign,
  locale,
  uploadEndpoint,
  finalizeAction,
  initialActionState,
  initialClientKey,
  syntheticPreview = false,
}: Readonly<{
  campaign: CollectionCampaign;
  locale: Locale;
  uploadEndpoint: string;
  finalizeAction: FinalizeAction;
  initialActionState: CollectionActionState;
  initialClientKey: string;
  syntheticPreview?: boolean;
}>) {
  const text = getCollectionCopy(locale);
  const direction = getTextDirection(locale);
  const firstOpenItem =
    campaign.requestedItems.find((item) => item.latestSubmission === null) ??
    campaign.requestedItems[0]!;
  const [selectedItemId, setSelectedItemId] = useState(firstOpenItem.id);
  const [clientKey, setClientKey] = useState(initialClientKey);
  const [inspection, setInspection] = useState<ClientInspection | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<UploadReceipt | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadState, setUploadState] = useState<
    "IDLE" | "UPLOADING" | "INTERRUPTED" | "UPLOADED"
  >("IDLE");
  const [dragActive, setDragActive] = useState(false);
  const [rightsDeclared, setRightsDeclared] = useState(false);
  const [actionState, formAction, finalizePending] = useActionState(
    finalizeAction,
    initialActionState,
  );
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const uploadAttemptRef = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = useMemo(
    () => campaign.requestedItems.find((item) => item.id === selectedItemId)!,
    [campaign.requestedItems, selectedItemId],
  );

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [direction, locale]);

  async function selectFile(file: File | undefined) {
    const selectionAttempt = ++uploadAttemptRef.current;
    xhrRef.current?.abort();
    xhrRef.current = null;
    setReceipt(null);
    setProgress(0);
    setUploadState("IDLE");
    setFileError(null);
    setRightsDeclared(false);
    setClientKey(crypto.randomUUID());
    if (file === undefined) {
      setInspection(null);
      return;
    }
    if (file.size > COLLECTION_BROWSER_MAX_FILE_BYTES) {
      setInspection(null);
      setFileError(
        locale === "ar"
          ? "حجم الملف أكبر من 10 ميجابايت."
          : "File exceeds 10 MB.",
      );
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (uploadAttemptRef.current !== selectionAttempt) return;
    const result = inspectCollectionFileForBrowser({
      fileName: file.name,
      clientMimeType: file.type,
      bytes,
    });
    if (!result.ok) {
      setInspection(null);
      setFileError(
        locale === "ar"
          ? "توقيع الملف أو نوعه غير مسموح. استخدم PDF أو WAV أو PNG تجريبيًا."
          : "File signature is not allowed. Use a synthetic PDF, WAV, or PNG.",
      );
      return;
    }
    if (
      selectedItem.expectedType !== "OTHER" &&
      selectedItem.expectedType !== result.expectedType
    ) {
      setInspection(null);
      setFileError(
        locale === "ar"
          ? "نوع الملف لا يطابق المادة المطلوبة."
          : "The file type does not match the requested item.",
      );
      return;
    }
    setInspection({
      file,
      mimeType: result.actualMimeType,
      format: result.declaredFormat,
      expectedType: result.expectedType,
      byteSize: result.byteSize,
    });
  }

  function resetForItem(itemId: string) {
    uploadAttemptRef.current += 1;
    xhrRef.current?.abort();
    xhrRef.current = null;
    formRef.current?.reset();
    setSelectedItemId(itemId);
    setInspection(null);
    setReceipt(null);
    setFileError(null);
    setProgress(0);
    setUploadState("IDLE");
    setRightsDeclared(false);
    setClientKey(crypto.randomUUID());
    if (fileInputRef.current !== null) fileInputRef.current.value = "";
  }

  function uploadFile() {
    if (inspection === null) {
      setFileError(text.noFile);
      return;
    }
    setFileError(null);
    setProgress(0);
    setUploadState("UPLOADING");
    const body = new FormData();
    body.set("requestedItemId", selectedItem.id);
    body.set("clientIdempotencyKey", clientKey);
    body.set("file", inspection.file);
    const xhr = new XMLHttpRequest();
    const uploadAttempt = ++uploadAttemptRef.current;
    xhrRef.current = xhr;
    xhr.open("POST", uploadEndpoint);
    xhr.upload.addEventListener("progress", (event) => {
      if (uploadAttemptRef.current !== uploadAttempt) return;
      if (event.lengthComputable) {
        setProgress(
          Math.max(1, Math.round((event.loaded / event.total) * 100)),
        );
      }
    });
    xhr.addEventListener("load", () => {
      if (uploadAttemptRef.current !== uploadAttempt) return;
      xhrRef.current = null;
      if (xhr.status < 200 || xhr.status >= 300) {
        setUploadState("INTERRUPTED");
        setFileError(text.genericError);
        return;
      }
      try {
        const nextReceipt = JSON.parse(xhr.responseText) as UploadReceipt;
        if (
          typeof nextReceipt.uploadId !== "string" ||
          nextReceipt.mimeType !== inspection.mimeType ||
          nextReceipt.byteSize !== inspection.byteSize
        ) {
          throw new Error("mismatch");
        }
        setReceipt(nextReceipt);
        setProgress(100);
        setUploadState("UPLOADED");
      } catch {
        setUploadState("INTERRUPTED");
        setFileError(text.genericError);
      }
    });
    xhr.addEventListener("error", () => {
      if (uploadAttemptRef.current !== uploadAttempt) return;
      xhrRef.current = null;
      setUploadState("INTERRUPTED");
      setFileError(text.offlineError);
    });
    xhr.addEventListener("abort", () => {
      if (uploadAttemptRef.current !== uploadAttempt) return;
      xhrRef.current = null;
      setProgress(0);
      setUploadState("INTERRUPTED");
      setFileError(text.offlineError);
    });
    xhr.send(body);
  }

  const currentActionState =
    actionState.requestedItemId === selectedItem.id &&
    actionState.clientIdempotencyKey === clientKey
      ? actionState
      : initialActionState;
  const successful = currentActionState.status === "SUCCESS";
  const actionError =
    currentActionState.status === "ERROR"
      ? currentActionState.message === "RIGHTS_REQUIRED"
        ? text.rightsMissing
        : text.genericError
      : null;

  return (
    <div className={styles.shell} lang={locale} dir={direction}>
      <a className={styles.skipLink} href="#collection-main">
        {locale === "ar" ? "انتقل إلى نموذج الجمع" : "Skip to collection form"}
      </a>
      <aside className={styles.campaignRail} aria-label={text.campaignScope}>
        <a
          className={styles.brand}
          href={
            (syntheticPreview ? "/preview/learn" : "/learn") + `?lang=${locale}`
          }
        >
          <svg viewBox="0 0 44 44" aria-hidden="true">
            <path
              d="M3 8.5c7.5 0 12.8 2.5 17 7.5v21c-4.2-4-9.5-6-17-6Z"
              fill="currentColor"
            />
            <path
              d="M41 8.5c-7.5 0-12.8 2.5-17 7.5v21c4.2-4 9.5-6 17-6Z"
              fill="#ecf3f9"
            />
          </svg>
          <span translate="no">UniMind</span>
        </a>
        <div className={styles.scopeBlock}>
          <p>{text.pageTitle}</p>
          <h1>{campaign.name}</h1>
          <p className={styles.cohort}>{campaign.cohortName}</p>
        </div>
        <dl className={styles.dates}>
          <div>
            <dt>{text.due}</dt>
            <dd>{formatDate(locale, campaign.closesAt)}</dd>
          </div>
          <div>
            <dt>{text.assignment}</dt>
            <dd>{formatDate(locale, campaign.assignmentExpiresAt)}</dd>
          </div>
        </dl>
        <p className={styles.syntheticLock}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
          {text.syntheticBoundary}
        </p>
        <div className={styles.localeSwitch} role="group" aria-label="Language">
          <a
            aria-current={locale === "en" ? "page" : undefined}
            href="?lang=en"
          >
            EN
          </a>
          <a
            aria-current={locale === "ar" ? "page" : undefined}
            href="?lang=ar"
          >
            عربي
          </a>
        </div>
      </aside>

      <main id="collection-main" className={styles.main} tabIndex={-1}>
        <header className={styles.mainHeader}>
          <div>
            <h2>{text.requestQueue}</h2>
            <p>{text.replaceGuidance}</p>
          </div>
          {syntheticPreview ? <span>{text.syntheticPreview}</span> : null}
        </header>

        <section className={styles.requestStrip} aria-label={text.requestQueue}>
          {campaign.requestedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selectedItemId === item.id}
              onClick={() => resetForItem(item.id)}
            >
              <span className={styles.requestMeta}>
                {item.required ? text.required : text.optional} ·{" "}
                {item.expectedType}
              </span>
              <strong>{item.title}</strong>
              <bdi>{locale === "ar" ? item.unitTitleAr : item.unitTitleEn}</bdi>
              <span
                className={styles.requestStatus}
                data-status={item.latestSubmission?.status ?? "REQUESTED"}
              >
                {item.latestSubmission === null
                  ? item.status === "REQUESTED"
                    ? locale === "ar"
                      ? "في انتظار الملف"
                      : "Awaiting file"
                    : text.received
                  : statusLabel(item.latestSubmission.status, text)}
              </span>
            </button>
          ))}
        </section>

        <div className={styles.workGrid}>
          <form ref={formRef} className={styles.formPanel} action={formAction}>
            <input type="hidden" name="campaignId" value={campaign.id} />
            <input
              type="hidden"
              name="requestedItemId"
              value={selectedItem.id}
            />
            <input
              type="hidden"
              name="uploadId"
              value={receipt?.uploadId ?? ""}
            />
            <input
              type="hidden"
              name="clientIdempotencyKey"
              value={clientKey}
            />
            <header>
              <h2>{text.formTitle}</h2>
              <p>{text.formBody}</p>
            </header>

            <label className={styles.field}>
              <span>{text.requestedItem}</span>
              <select
                value={selectedItem.id}
                onChange={(event) => resetForItem(event.target.value)}
                disabled={uploadState === "UPLOADING" || finalizePending}
              >
                {campaign.requestedItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.fieldPair}>
              <label className={styles.field}>
                <span>{text.sourceTitle}</span>
                <input
                  name="sourceName"
                  minLength={3}
                  maxLength={200}
                  required
                  placeholder={text.sourceTitlePlaceholder}
                />
              </label>
              <label className={styles.field}>
                <span>{text.description}</span>
                <textarea
                  name="sourceDescription"
                  minLength={10}
                  maxLength={1000}
                  required
                  rows={3}
                  placeholder={text.descriptionPlaceholder}
                />
              </label>
            </div>

            <div
              className={styles.dropZone}
              data-drag-active={dragActive}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                if (event.currentTarget === event.target) setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                void selectFile(event.dataTransfer.files[0]);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
                <path d="M5 14v5h14v-5" />
              </svg>
              <strong>{text.dropTitle}</strong>
              <span>{text.dropBody}</span>
              <label className={styles.fileAction}>
                {text.chooseFile}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.wav,.png,application/pdf,audio/wav,image/png"
                  onChange={(event) => void selectFile(event.target.files?.[0])}
                />
              </label>
              {inspection === null ? null : (
                <div className={styles.fileSelection} role="status">
                  <bdi>{inspection.file.name}</bdi>
                  <span>
                    {formatBytes(locale, inspection.byteSize)} KB ·{" "}
                    {inspection.format}
                  </span>
                  <button
                    type="button"
                    onClick={() => void selectFile(undefined)}
                  >
                    {text.removeFile}
                  </button>
                </div>
              )}
            </div>

            <label className={styles.rightsRow}>
              <input
                type="checkbox"
                name="declaredRights"
                value="DECLARED"
                checked={rightsDeclared}
                onChange={(event) => setRightsDeclared(event.target.checked)}
              />
              <span>{text.rights}</span>
            </label>

            {uploadState === "UPLOADING" ? (
              <div className={styles.progress} role="status" aria-live="polite">
                <div>
                  <span>{text.uploading}</span>
                  <span>{progress}%</span>
                </div>
                <progress value={progress} max={100}>
                  {progress}%
                </progress>
              </div>
            ) : null}

            {(fileError ?? actionError) ? (
              <div className={styles.errorSummary} role="alert">
                <strong>{text.validationTitle}</strong>
                <p>{fileError ?? actionError}</p>
              </div>
            ) : null}

            {successful ? (
              <div className={styles.successSummary} role="status">
                <strong>{text.submitted}</strong>
                <p>{text.submittedBody}</p>
              </div>
            ) : null}

            <div className={styles.actions}>
              {receipt === null ? (
                <button
                  className={styles.primaryAction}
                  type="button"
                  disabled={inspection === null || uploadState === "UPLOADING"}
                  onClick={uploadFile}
                >
                  {uploadState === "INTERRUPTED"
                    ? text.uploadAgain
                    : text.validateUpload}
                </button>
              ) : (
                <button
                  className={styles.primaryAction}
                  type="submit"
                  disabled={!rightsDeclared || finalizePending || successful}
                >
                  {finalizePending ? text.uploading : text.finalize}
                </button>
              )}
              {uploadState === "UPLOADING" ? (
                <button
                  className={styles.secondaryAction}
                  type="button"
                  onClick={() => xhrRef.current?.abort()}
                >
                  {text.cancel}
                </button>
              ) : null}
            </div>
          </form>

          <aside
            className={styles.proofPanel}
            aria-label={text.validationTitle}
          >
            <section>
              <h2>{text.validationTitle}</h2>
              {inspection === null ? (
                <p>{text.noFile}</p>
              ) : (
                <dl>
                  <div>
                    <dt>{text.signature}</dt>
                    <dd>{inspection.format}</dd>
                  </div>
                  <div>
                    <dt>{text.type}</dt>
                    <dd>{inspection.mimeType}</dd>
                  </div>
                  <div>
                    <dt>{text.size}</dt>
                    <dd>{formatBytes(locale, inspection.byteSize)} KB</dd>
                  </div>
                  <div>
                    <dt>{text.rightsLabel}</dt>
                    <dd>{rightsDeclared ? text.declared : text.pending}</dd>
                  </div>
                  <div>
                    <dt>{text.upload}</dt>
                    <dd>{receipt === null ? text.pending : text.uploaded}</dd>
                  </div>
                </dl>
              )}
            </section>
            <section className={styles.stateGuide}>
              <h2>{text.statesTitle}</h2>
              <ol>
                {statusOrder.map((status, index) => (
                  <li key={status} data-status={status}>
                    <span aria-hidden="true" />
                    <div>
                      <strong>{statusLabel(status, text)}</strong>
                      <p>{text.stateDescriptions[index]}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
