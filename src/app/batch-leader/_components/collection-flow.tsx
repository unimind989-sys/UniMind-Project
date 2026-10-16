"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ProductNavigationLink as Link,
  useProductRouter,
} from "@/app/_components/product-navigation";
import { useSearchParams } from "next/navigation";
import type { Route } from "next";
import { AppShell } from "@/app/_components/app-shell";
import { Button } from "@/app/_components/product-ui";
import { FrontendIcon } from "@/app/_components/frontend-controls";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import type { CollectionActionState } from "../collection-actions";
import {
  compatibleCollectionItems,
  collectionRetryable,
} from "@/lib/collection/collection-queue.application";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { formatCollectionDate } from "@/lib/i18n/collection-format";
import type { Locale } from "@/lib/i18n/locale";
import {
  collectionUploadClient,
  type CollectionUploadClient,
} from "./collection-upload-client";
import {
  useCollectionQueue,
  type CollectionQueueFile,
  type CollectionFinalizeAction,
} from "./use-collection-queue";
import { CollectionHistory, collectionWindowMessage } from "./leader-home";
import { useCollectionClock } from "./use-collection-clock";
import {
  collectionDeadline,
  collectionRequestAction,
  collectionWindow,
  projectCollectionRecords,
  resolveCollectionInspection,
  resolveCollectionUploadSelection,
} from "@/lib/collection/collection-presentation.application";
import styles from "../collection.module.css";

export type { CollectionUploadClient } from "./collection-upload-client";
export type CollectionFlowDraft = {
  files: CollectionQueueFile[];
  description: string;
  rights: boolean;
};

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
  dateReference,
  draft,
  correction: initialCorrection,
  referenceTime,
  onCorrectionPrepared,
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
  dateReference?: ReactNode;
  referenceTime?: string;
  draft?: {
    current?: CollectionFlowDraft;
    save: (draft: CollectionFlowDraft) => void;
  };
  correction?: {
    requestedItemId: string;
    submissionId: string;
    action: "FIX_INFORMATION" | "REPLACE_FILE";
    reasonEn: string;
    reasonAr: string;
  };
  onCorrectionPrepared?: (href: Route) => void;
}>) {
  const prefix = syntheticPreview ? "/preview" : "";
  const text = getCollectionCopy(locale);
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const query = useSearchParams();
  const router = useProductRouter();
  const clock = useCollectionClock(referenceTime);
  const windowState = collectionWindow(campaign, clock);
  const picker = useRef<HTMLInputElement>(null);
  const correction = initialCorrection;
  const uploadSelection = resolveCollectionUploadSelection(campaign, query);
  const selectedRequestId =
    uploadSelection.status === "FOUND" ? uploadSelection.itemId : null;
  const [, refreshWindow] = useState(0);
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
    ...(draft?.current ? { initialFiles: draft.current.files } : {}),
  });
  const completionFocus = useRef<{
    element: Element | null;
    ids: readonly string[];
  } | null>(null);
  useEffect(() => {
    const pending = completionFocus.current;
    if (!pending || queue.running) return;
    completionFocus.current = null;
    const received = queue.files.find(
      (row) => pending.ids.includes(row.id) && row.state === "RECEIVED",
    );
    const old = pending.element;
    if (
      !received?.itemId ||
      (document.activeElement !== old &&
        document.activeElement !== document.body) ||
      (old instanceof HTMLElement &&
        old.isConnected &&
        old.getClientRects().length)
    )
      return;
    const receipt = document.getElementById(
      `collection-record-${encodeURIComponent(received.itemId)}`,
    );
    if (receipt instanceof HTMLDetailsElement) {
      receipt.open = true;
      receipt.querySelector("summary")?.focus();
    }
  }, [queue.files, queue.running]);
  const receivedCount = queue.files.filter(
    (row) => row.state === "RECEIVED",
  ).length;
  const acknowledgements = queue.files
    .filter((row) => row.state === "RECEIVED" && row.metadata)
    .map((row) => ({
      itemId: row.itemId,
      fileName: row.file.name,
      title: row.metadata!.title,
      description: row.metadata!.description,
      origin: row.origin,
      ...(row.submissionId ? { submissionId: row.submissionId } : {}),
      ...(row.predecessor?.id ? { predecessorId: row.predecessor.id } : {}),
    }));
  const projection = projectCollectionRecords(campaign, acknowledgements);
  const inspection = resolveCollectionInspection(projection.campaign, query);
  const inspectedId = inspection.status === "FOUND" ? inspection.item.id : null;
  const inspectedRecord =
    inspection.status === "FOUND" ? inspection.item.latestSubmission?.id : null;
  useEffect(() => {
    if (!inspectedId) return;
    const target = document.getElementById(
      `collection-record-${encodeURIComponent(inspectedId)}`,
    );
    if (target instanceof HTMLDetailsElement) {
      target.open = true;
      target.querySelector("summary")?.focus();
      target.scrollIntoView({ block: "center" });
    }
  }, [inspectedId, inspectedRecord]);
  const outstanding = projection.campaign.requestedItems.filter((item) =>
    collectionRequestAction(projection.campaign, item),
  );
  const openIntake =
    !!correction ||
    queue.files.some((row) => row.state !== "RECEIVED") ||
    uploadSelection.status === "FOUND";
  const deadline = collectionDeadline(campaign);
  function beginUpload(itemId: string | null) {
    if (windowState !== "ACTIVE" || queue.running) return;
    const next = new URLSearchParams(query.toString());
    for (const key of ["request", "submission", "inspect", "record", "upload"])
      next.delete(key);
    next.set("upload", itemId ?? "all");
    next.set("lang", locale);
    router.push(
      `${prefix}/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?${next}#collection-intake` as Route,
    );
  }
  const uploadFocus =
    uploadSelection.status === "FOUND"
      ? (uploadSelection.itemId ?? "all")
      : null;
  useEffect(() => {
    if (
      uploadFocus &&
      picker.current?.previousElementSibling instanceof HTMLElement
    )
      picker.current.previousElementSibling.focus();
  }, [uploadFocus]);
  const [description, setDescription] = useState(
    draft?.current?.description ?? initialMetadata?.description ?? "",
  );
  const [rights, setRights] = useState(draft?.current?.rights ?? false);
  useEffect(() => {
    draft?.save({ files: queue.files, description, rights });
  }, [draft, queue.files, description, rights]);
  const [drag, setDrag] = useState(false);

  const correctionAction = correction?.action;
  const correctionSubmissionId = correction?.submissionId;
  useEffect(() => {
    if (correctionAction === "FIX_INFORMATION")
      document.getElementById("collection-description")?.focus();
    else if (
      correctionAction === "REPLACE_FILE" &&
      picker.current?.previousElementSibling instanceof HTMLElement
    )
      picker.current.previousElementSibling.focus();
  }, [correctionAction, correctionSubmissionId]);
  const back =
    homeHref ?? (syntheticPreview ? "/preview/batch-leader" : "/batch-leader");
  const ready = queue.files.filter(
    (row) =>
      row.inspection &&
      row.itemId &&
      row.title.trim().length >= 3 &&
      (row.state === "READY" ||
        (row.state === "ERROR" && collectionRetryable(row.error))),
  );
  const canSubmit =
    windowState === "ACTIVE" &&
    rights &&
    description.trim().length >= 10 &&
    description.trim().length <= 1000;
  function add(
    files: readonly File[],
    origin: CollectionQueueFile["origin"] = "DEVICE",
  ) {
    if (queue.running) return;
    if (
      collectionWindow(
        campaign,
        referenceTime ? Date.parse(referenceTime) : Date.now(),
      ) !== "ACTIVE"
    ) {
      refreshWindow((value) => value + 1);
      return;
    }
    setRights(false);
    const pathname = window.location.pathname;
    const uploadIntent =
      uploadSelection.status === "FOUND" ? query.get("upload") : null;
    void queue
      .add(files, origin, correction, selectedRequestId ?? undefined)
      .then((prepared) => {
        if (!prepared) return;
        const live = new URL(window.location.href);
        if (live.pathname !== pathname) return;
        if (correction) {
          if (
            live.searchParams.getAll("request").length !== 1 ||
            live.searchParams.getAll("submission").length !== 1 ||
            live.searchParams.get("request") !== correction.requestedItemId ||
            live.searchParams.get("submission") !== correction.submissionId ||
            ["upload", "inspect", "record"].some((key) =>
              live.searchParams.has(key),
            )
          )
            return;
          live.searchParams.delete("request");
          live.searchParams.delete("submission");
          onCorrectionPrepared?.(
            `${live.pathname}?${live.searchParams}#collection-intake` as Route,
          );
        } else if (uploadIntent !== null) {
          if (
            live.searchParams.getAll("upload").length !== 1 ||
            live.searchParams.get("upload") !== uploadIntent ||
            ["request", "submission", "inspect", "record"].some((key) =>
              live.searchParams.has(key),
            )
          )
            return;
          live.searchParams.delete("upload");
          router.replace(
            `${live.pathname}?${live.searchParams}#collection-intake` as Route,
          );
        }
      });
  }
  async function submit(ids: readonly string[]) {
    if (
      collectionWindow(
        campaign,
        referenceTime ? Date.parse(referenceTime) : Date.now(),
      ) !== "ACTIVE"
    ) {
      refreshWindow((value) => value + 1);
      return;
    }
    completionFocus.current = { element: document.activeElement, ids };
    await queue.submit(ids, description, rights);
  }
  const errorText = (code: string) =>
    ({
      UNSAFE_DEMO_FILE: t(
        "Use the supplied synthetic files only. Private files are not accepted in this demo.",
        "استخدم الملفات التجريبية المرفقة فقط. لا يقبل العرض ملفات خاصة.",
      ),
      FILE_TOO_LARGE: t(
        "This file exceeds the 10 MB limit. Remove it and choose a smaller supported file.",
        "هذا الملف يتجاوز الحد الأقصى ١٠ ميجابايت. احذفه واختر ملفًا مدعومًا أصغر.",
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
        "This file did not pass validation. Check the requested material, remove the file and choose a supported file.",
        "لم يجتز الملف الفحص. راجع المادة المطلوبة، واحذف الملف واختر ملفًا مدعومًا.",
      ),
      CHECKSUM_MISMATCH: t(
        "This file failed the integrity check. Remove it and choose an intact file.",
        "لم يجتز الملف فحص السلامة. احذفه واختر ملفًا سليمًا.",
      ),
      UPLOAD_EVIDENCE_MISMATCH: t(
        "This file failed the integrity check. Remove it and choose an intact file.",
        "لم يجتز الملف فحص السلامة. احذفه واختر ملفًا سليمًا.",
      ),
      DUPLICATE_FILE: t(
        "This file is already recorded for this request. View the recorded submission before choosing a different file.",
        "هذا الملف مسجل بالفعل لهذا الطلب. راجع الإرسال المسجل قبل اختيار ملف مختلف.",
      ),
      RIGHTS_REJECTED: t(
        "Permission for this file could not be confirmed. Remove it and submit only a file you are permitted to share.",
        "تعذر تأكيد صلاحية إرسال هذا الملف. احذفه وأرسل فقط ملفًا يُسمح لك بمشاركته.",
      ),
      CORRECTION_STALE: t(
        "This correction no longer matches the current request. Inspect its latest submission before adding another file.",
        "لم يعد هذا التصحيح يطابق الطلب الحالي. راجع آخر إرسال قبل إضافة ملف آخر.",
      ),
      CAMPAIGN_UNAVAILABLE: text.unavailableBody,
      TYPE_MISMATCH: t(
        "This file does not match the named request. Remove it and choose the requested file type.",
        "هذا الملف لا يطابق الطلب المحدد. احذفه واختر الصيغة المطلوبة.",
      ),
      ITEM_UNAVAILABLE: t(
        "This request is no longer available. Open an assigned campaign to inspect its current requests.",
        "لم يعد هذا الطلب متاحًا. افتح حملة مسندة للاطلاع على طلباتها الحالية.",
      ),
      RIGHTS_REQUIRED: text.rightsMissing,
    })[code] ?? text.genericError;
  if (
    inspection.status === "UNAVAILABLE" ||
    uploadSelection.status === "UNAVAILABLE" ||
    ((query.has("request") || query.has("submission")) && !initialCorrection)
  )
    return (
      <AppShell
        locale={locale}
        role="leader"
        title={t("Request unavailable", "الطلب غير متاح")}
      >
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
            `${prefix}/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?lang=${locale}` as Route
          }
        >
          {t("Open campaign", "فتح الحملة")}
        </Link>
      </AppShell>
    );
  return (
    <AppShell
      locale={locale}
      role="leader"
      synthetic={syntheticPreview}
      preview={syntheticPreview}
      title={t("Source intake", "استلام المصادر")}
    >
      <div className={`${styles.workspace} ${styles.requestWorkspace}`}>
        <Link className={styles.back} href={`${back}?lang=${locale}` as Route}>
          {t("Source intake", "استلام المصادر")}
        </Link>
        <header className={styles.header}>
          <h1>{campaign.name}</h1>
          <p>{campaign.cohortName}</p>
        </header>
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
        {windowState !== "ACTIVE" ? (
          <p role="status" className={styles.helper}>
            {collectionWindowMessage(windowState, locale)}
          </p>
        ) : null}
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className={styles.helper}
        >
          {receivedCount
            ? `${t("Received files", "الملفات المستلمة")}: ${new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(receivedCount)}. ${t("Processing and review are separate; receipt does not make a file available to students.", "المعالجة والمراجعة خطوتان منفصلتان؛ الاستلام لا يجعل الملف متاحًا للطلاب.")}`
            : ""}
        </p>
        <section
          className={styles.workRequests}
          aria-labelledby="outstanding-requests"
        >
          <div className={styles.requestHeading}>
            <h2 id="outstanding-requests">
              {t("Awaiting your action", "بانتظار إجراء منك")} ·{" "}
              {new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en").format(
                outstanding.length,
              )}
            </h2>
            {windowState === "ACTIVE" ? (
              <Button
                variant="primary"
                disabled={queue.running || windowState !== "ACTIVE"}
                onClick={() => beginUpload(null)}
              >
                {t("Upload files", "رفع الملفات")}
              </Button>
            ) : null}
          </div>
          {outstanding.length ? (
            <ul className={styles.requestList}>
              {outstanding.map((item) => {
                const action = collectionRequestAction(
                  projection.campaign,
                  item,
                );
                return (
                  <li key={item.id} data-request-id={item.id}>
                    <div>
                      <h3>{item.title}</h3>
                      <p className={styles.helper}>
                        {item.expectedType === "DOCUMENT"
                          ? "PDF"
                          : item.expectedType === "AUDIO"
                            ? "WAV"
                            : item.expectedType === "IMAGE"
                              ? "PNG"
                              : t("Requested format", "الصيغة المطلوبة")}{" "}
                        ·{" "}
                        {action === "UPLOAD"
                          ? t("Awaiting file", "بانتظار ملف")
                          : action === "FIX_INFORMATION"
                            ? t("Needs information", "يحتاج إلى معلومات")
                            : t("Needs a replacement", "يحتاج إلى استبدال")}
                        {!item.required ? ` · ${text.optional}` : ""}
                      </p>
                      {item.latestSubmission?.correction ? (
                        <p className={styles.helper}>
                          {locale === "ar"
                            ? item.latestSubmission.correction.reasonAr
                            : item.latestSubmission.correction.reasonEn}
                        </p>
                      ) : null}
                    </div>
                    {windowState === "ACTIVE" ? (
                      action === "UPLOAD" ? (
                        <Button
                          variant="secondary"
                          disabled={queue.running || windowState !== "ACTIVE"}
                          onClick={() => beginUpload(item.id)}
                        >
                          {t("Upload file", "رفع ملف")}
                        </Button>
                      ) : (
                        <Link
                          className={styles.open}
                          href={
                            `${prefix}/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?request=${encodeURIComponent(item.id)}&submission=${encodeURIComponent(item.latestSubmission!.id)}&lang=${locale}#collection-intake` as Route
                          }
                        >
                          {action === "FIX_INFORMATION"
                            ? t("Fix information", "تصحيح المعلومات")
                            : t("Replace file", "استبدال الملف")}
                        </Link>
                      )
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.helper}>
              {t(
                "No request needs your action right now. Expand a recorded receipt to inspect processing and review status.",
                "لا يوجد طلب يحتاج إلى إجراء منك الآن. وسّع إيصالًا مسجلًا للاطلاع على حالة المعالجة والمراجعة.",
              )}
            </p>
          )}
        </section>
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
              <p>
                {locale === "ar" ? correction.reasonAr : correction.reasonEn}
              </p>
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
                .map((row) => {
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
                  const predecessor = row.metadata
                    ? row.predecessor
                    : item?.latestSubmission;
                  const permanentFailure =
                    (row.state === "ERROR" || row.state === "INVALID") &&
                    !collectionRetryable(row.error);
                  return (
                    <li
                      className={styles.file}
                      key={row.id}
                      data-state={row.state}
                      data-predecessor-id={
                        row.metadata ? row.predecessor?.id : undefined
                      }
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
                      <p className={styles.helper}>
                        {row.origin === "APPROVED_REFERENCE"
                          ? t(
                              "Origin: Approved reference",
                              "المصدر: مرجع معتمد",
                            )
                          : t("Origin: Your device", "المصدر: جهازك")}
                      </p>
                      {row.inspection ? (
                        <>
                          {item ? (
                            <p className={styles.destination}>
                              {t("For", "لـ")}: {item.title}
                              {predecessor
                                ? ` · ${t("Replacement candidate", "نسخة بديلة")}`
                                : ""}
                            </p>
                          ) : null}
                          {predecessor ? (
                            <p className={styles.helper}>
                              {t("Earlier submission", "الإرسال السابق")}:{" "}
                              <bdi>
                                {predecessor.id} · {predecessor.sourceName}
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
                                {t(
                                  "Change requested material",
                                  "تغيير المادة المطلوبة",
                                )}
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
                        {row.error === "DUPLICATE_FILE" ||
                        row.error === "CORRECTION_STALE" ? (
                          <a className={styles.open} href="#latest-submissions">
                            {t(
                              "View recorded submission",
                              "عرض الإرسال المسجل",
                            )}
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
          {correction ||
          queue.files.some(
            (row) => row.inspection && row.state !== "RECEIVED",
          ) ? (
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
        <CollectionHistory
          campaigns={[campaign]}
          acknowledgements={acknowledgements}
          compact
          preview={syntheticPreview}
          {...(referenceTime ? { referenceTime } : {})}
          locale={locale}
          heading={t("Recorded submissions", "الإرسالات المسجلة")}
        />
      </div>
    </AppShell>
  );
}
