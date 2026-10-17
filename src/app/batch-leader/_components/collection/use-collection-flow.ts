"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useProductRouter } from "@/app/_components/product-navigation";
import { useSearchParams } from "next/navigation";
import type { Route } from "next";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import type {
  CollectionActionState,
  CollectionFlowDraft,
  CollectionQueueFile,
} from "@/lib/collection/collection-client-state.application";
import { collectionRetryable } from "@/lib/collection/collection-queue.application";
import type { Locale } from "@/lib/i18n/locale";
import {
  collectionUploadClient,
  type CollectionUploadClient,
} from "../collection-upload-client";
import {
  useCollectionQueue,
  type CollectionFinalizeAction,
} from "../use-collection-queue";
import { useCollectionClock } from "../use-collection-clock";
import {
  collectionDeadline,
  collectionRequestAction,
  collectionWindow,
  projectCollectionRecords,
  resolveCollectionInspection,
  resolveCollectionUploadSelection,
} from "@/lib/collection/collection-presentation.application";

export type CollectionFlowProps = Readonly<{
  campaign: CollectionCampaign;
  locale: Locale;
  uploadEndpoint: string;
  finalizeAction: CollectionFinalizeAction;
  initialActionState: CollectionActionState;
  initialClientKey: string;
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
}>;

// Owns the intake flow's state, effects and handlers. Hook and effect order
// matches the original single-component implementation; views stay stateless.
export function useCollectionFlow({
  campaign,
  locale,
  uploadEndpoint,
  finalizeAction,
  initialActionState,
  uploadClient,
  allowFile,
  homeHref,
  initialMetadata,
  draft,
  correction: initialCorrection,
  referenceTime,
  onCorrectionPrepared,
}: CollectionFlowProps) {
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
      `/batch-leader/campaigns/${encodeURIComponent(campaign.id)}?${next}#collection-intake` as Route,
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
  const back = homeHref ?? "/batch-leader";
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
  // `as const` keeps literal unions such as the window state from widening.
  return {
    query,
    windowState,
    picker,
    correction,
    uploadSelection,
    selectedRequestId,
    queue,
    receivedCount,
    acknowledgements,
    projection,
    inspection,
    outstanding,
    openIntake,
    deadline,
    beginUpload,
    description,
    setDescription,
    rights,
    setRights,
    drag,
    setDrag,
    back,
    ready,
    canSubmit,
    add,
    submit,
  } as const;
}

export type CollectionFlowState = ReturnType<typeof useCollectionFlow>;
