"use client";

import { useEffect, useRef, useState } from "react";
import type { CollectionActionState } from "../collection-actions";
import type {
  CollectionCampaign,
  RegisteredCollectionUpload,
} from "@/lib/collection/collection.application";
import {
  collectionFileIdentity,
  collectionSourceTitle,
  inferredCollectionItem,
  collectionFailureCode,
  collectionRetryable,
  resolveCollectionCorrection,
  boundCollectionItem,
} from "@/lib/collection/collection-queue.application";
import {
  COLLECTION_BROWSER_MAX_FILE_BYTES,
  inspectCollectionFileForBrowser,
} from "@/lib/collection/collection-browser.application";
import type { CollectionUploadClient } from "./collection-upload-client";

export type CollectionFinalizeAction = (
  state: CollectionActionState,
  data: FormData,
) => Promise<CollectionActionState>;
type Inspection = Extract<
  ReturnType<typeof inspectCollectionFileForBrowser>,
  { ok: true }
>;
export type CollectionQueueFile = {
  id: string;
  key: string;
  identity: string;
  file: File;
  origin: "DEVICE" | "APPROVED_REFERENCE";
  title: string;
  itemId: string | null;
  inspection: Inspection | null;
  state:
    | "CHECKING"
    | "READY"
    | "INVALID"
    | "UPLOADING"
    | "FINALIZING"
    | "ERROR"
    | "RECEIVED";
  progress: number;
  error: string | null;
  receipt: RegisteredCollectionUpload | null;
  metadata: { title: string; description: string } | null;
  predecessor?: { id: string; sourceName: string } | null;
  correctionSubmissionId?: string;
  correctionRequestedItemId?: string;
  correctionAction?: "FIX_INFORMATION" | "REPLACE_FILE";
  boundRequestedItemId?: string;
  submissionId?: string;
};

export function useCollectionQueue({
  campaign,
  upload,
  finalize,
  initialState,
  allowFile,
  initialTitle,
  initialFiles,
}: {
  campaign: CollectionCampaign;
  upload: CollectionUploadClient;
  finalize: CollectionFinalizeAction;
  initialState: CollectionActionState;
  allowFile?: (file: File) => Promise<boolean>;
  initialTitle?: string;
  initialFiles?: CollectionQueueFile[];
}) {
  const [files, setFiles] = useState<CollectionQueueFile[]>(() =>
    (initialFiles ?? []).map((row) =>
      ["UPLOADING", "FINALIZING", "CHECKING"].includes(row.state)
        ? {
            ...row,
            state: "ERROR",
            error: row.receipt ? "FINALIZE_FAILED" : "UPLOAD_INTERRUPTED",
          }
        : row,
    ),
  );
  const [running, setRunning] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const queue = useRef<CollectionQueueFile[]>(files);
  const mounted = useRef(true);
  const operation = useRef<{
    cancelled: boolean;
    controller: AbortController;
  } | null>(null);
  const change = (id: string, patch: Partial<CollectionQueueFile>) => {
    if (!mounted.current) return;
    queue.current = queue.current.map((row) =>
      row.id === id ? { ...row, ...patch } : row,
    );
    setFiles(queue.current);
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (operation.current) {
        operation.current.cancelled = true;
        operation.current.controller.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!initialFiles) return;
    let cancelled = false;
    const resumeInspection = async () => {
      for (const row of queue.current.filter(
        (entry) => !entry.inspection && entry.state === "ERROR",
      )) {
        try {
          if (allowFile && !(await allowFile(row.file))) {
            if (!cancelled)
              change(row.id, { state: "INVALID", error: "UNSAFE_DEMO_FILE" });
            continue;
          }
          const inspected = inspectCollectionFileForBrowser({
            fileName: row.file.name,
            clientMimeType: row.file.type,
            bytes: new Uint8Array(await row.file.arrayBuffer()),
          });
          if (cancelled) break;
          if (!inspected.ok)
            change(row.id, { state: "INVALID", error: inspected.code });
          else {
            const target =
              row.correctionSubmissionId && row.correctionRequestedItemId
                ? resolveCollectionCorrection(
                    campaign,
                    row.correctionRequestedItemId,
                    row.correctionSubmissionId,
                  )
                : null;
            const invalid =
              !!row.correctionSubmissionId &&
              (!target ||
                target.latestSubmission?.correction?.action !==
                  row.correctionAction ||
                (target.expectedType !== inspected.expectedType &&
                  target.expectedType !== "OTHER"));
            const bound = row.boundRequestedItemId
              ? boundCollectionItem(
                  campaign.requestedItems,
                  row.boundRequestedItemId,
                  inspected.expectedType,
                )
              : null;
            change(row.id, {
              inspection: inspected,
              itemId: row.correctionSubmissionId
                ? invalid
                  ? null
                  : target!.id
                : bound
                  ? (bound.item?.id ?? null)
                  : inferredCollectionItem(
                      campaign.requestedItems,
                      inspected.expectedType,
                    ),
              state: invalid || bound?.error ? "INVALID" : "READY",
              error: invalid ? "CORRECTION_STALE" : (bound?.error ?? null),
            });
          }
        } catch {
          if (!cancelled)
            change(row.id, { state: "INVALID", error: "FILE_UNREADABLE" });
        }
      }
    };
    void resumeInspection();
    return () => {
      cancelled = true;
    };
  }, [initialFiles, allowFile, campaign]);

  async function add(
    selected: readonly File[],
    origin: CollectionQueueFile["origin"] = "DEVICE",
    correction?: {
      requestedItemId: string;
      submissionId: string;
      action: "FIX_INFORMATION" | "REPLACE_FILE";
    },
    requestedItemId?: string,
  ) {
    setDuplicate(false);
    const fresh: CollectionQueueFile[] = [];
    const identities = new Set(queue.current.map((row) => row.identity));
    for (const file of selected) {
      const identity = collectionFileIdentity(file);
      if (identities.has(identity)) {
        setDuplicate(true);
        continue;
      }
      identities.add(identity);
      fresh.push({
        id: crypto.randomUUID(),
        key: crypto.randomUUID(),
        identity,
        file,
        origin,
        title: initialTitle ?? collectionSourceTitle(file.name),
        itemId: null,
        inspection: null,
        state: "CHECKING",
        progress: 0,
        error: null,
        receipt: null,
        metadata: null,
        ...(requestedItemId && !correction
          ? { boundRequestedItemId: requestedItemId }
          : {}),
        ...(correction
          ? {
              correctionSubmissionId: correction.submissionId,
              correctionRequestedItemId: correction.requestedItemId,
              correctionAction: correction.action,
            }
          : {}),
      });
    }
    queue.current = [...queue.current, ...fresh];
    setFiles(queue.current);
    for (const row of fresh) {
      if (!mounted.current) break;
      try {
        if (allowFile && !(await allowFile(row.file))) {
          change(row.id, { state: "INVALID", error: "UNSAFE_DEMO_FILE" });
          continue;
        }
        if (!mounted.current) break;
        if (row.file.size > COLLECTION_BROWSER_MAX_FILE_BYTES) {
          change(row.id, { state: "INVALID", error: "FILE_TOO_LARGE" });
          continue;
        }
        const inspected = inspectCollectionFileForBrowser({
          fileName: row.file.name,
          clientMimeType: row.file.type,
          bytes: new Uint8Array(await row.file.arrayBuffer()),
        });
        if (!inspected.ok) {
          change(row.id, { state: "INVALID", error: inspected.code });
          continue;
        }
        const inferred = inferredCollectionItem(
          campaign.requestedItems,
          inspected.expectedType,
        );
        const selected = correction
          ? resolveCollectionCorrection(
              campaign,
              correction.requestedItemId,
              correction.submissionId,
            )
          : null;
        const target = correction
          ? selected?.expectedType === inspected.expectedType ||
            selected?.expectedType === "OTHER"
            ? selected
            : null
          : undefined;
        const bound = row.boundRequestedItemId
          ? boundCollectionItem(
              campaign.requestedItems,
              row.boundRequestedItemId,
              inspected.expectedType,
            )
          : null;
        change(row.id, {
          inspection: inspected,
          itemId: correction
            ? (target?.id ?? null)
            : bound
              ? (bound.item?.id ?? null)
              : inferred,
          state:
            bound?.error ||
            (correction &&
              (!target ||
                target.latestSubmission?.correction?.action !==
                  correction.action))
              ? "INVALID"
              : "READY",
          error:
            correction &&
            (!target ||
              target.latestSubmission?.correction?.action !== correction.action)
              ? "CORRECTION_STALE"
              : (bound?.error ?? null),
        });
      } catch {
        change(row.id, { state: "INVALID", error: "FILE_UNREADABLE" });
      }
    }
    return (
      mounted.current &&
      fresh.some((row) =>
        queue.current.some(
          (entry) => entry.id === row.id && entry.state === "READY",
        ),
      )
    );
  }
  function edit(
    id: string,
    patch: Partial<Pick<CollectionQueueFile, "title" | "itemId">>,
  ) {
    const row = queue.current.find((x) => x.id === id);
    if (
      !row ||
      operation.current ||
      row.receipt ||
      row.state === "RECEIVED" ||
      (row.state === "INVALID" &&
        (row.boundRequestedItemId || row.correctionSubmissionId)) ||
      (row.state === "ERROR" && !collectionRetryable(row.error)) ||
      ((row.correctionSubmissionId || row.boundRequestedItemId) &&
        patch.itemId !== undefined &&
        patch.itemId !== row.itemId)
    )
      return;
    change(id, {
      ...patch,
      metadata: null,
      error: null,
      ...(patch.itemId !== undefined ? { key: crypto.randomUUID() } : {}),
      state: row.inspection ? "READY" : row.state,
    });
  }
  function remove(id: string) {
    if (operation.current) return;
    queue.current = queue.current.filter((row) => row.id !== id);
    setFiles(queue.current);
  }
  function cancel() {
    if (operation.current) {
      operation.current.cancelled = true;
      operation.current.controller.abort();
    }
  }
  async function submit(
    ids: readonly string[],
    description: string,
    declared: boolean,
  ) {
    if (operation.current || !declared || description.trim().length < 10)
      return;
    const active = { cancelled: false, controller: new AbortController() };
    operation.current = active;
    setRunning(true);
    try {
      for (const id of ids) {
        if (active.cancelled || !mounted.current) break;
        const row = queue.current.find((x) => x.id === id);
        if (
          !row?.inspection ||
          !row.itemId ||
          row.state === "RECEIVED" ||
          row.title.trim().length < 3 ||
          (row.state === "ERROR" && !collectionRetryable(row.error))
        )
          continue;
        const item = campaign.requestedItems.find(
          (item) => item.id === row.itemId,
        );
        if (
          row.boundRequestedItemId &&
          (row.itemId !== row.boundRequestedItemId ||
            (!row.receipt &&
              boundCollectionItem(
                campaign.requestedItems,
                row.boundRequestedItemId,
                row.inspection.expectedType,
              ).error))
        ) {
          change(id, { state: "ERROR", error: "ITEM_UNAVAILABLE" });
          continue;
        }
        if (
          row.correctionSubmissionId &&
          !row.receipt &&
          (!resolveCollectionCorrection(
            campaign,
            row.itemId,
            row.correctionSubmissionId,
          ) ||
            item?.latestSubmission?.correction?.action !== row.correctionAction)
        ) {
          change(id, { state: "ERROR", error: "CORRECTION_STALE" });
          continue;
        }
        const metadata = row.metadata ?? {
          title: row.title.trim(),
          description: description.trim(),
        };
        let receipt = row.receipt;
        try {
          if (!receipt) {
            change(id, {
              state: "UPLOADING",
              error: null,
              progress: 0,
              metadata,
              predecessor: row.metadata
                ? (row.predecessor ?? null)
                : item?.latestSubmission
                  ? {
                      id: item.latestSubmission.id,
                      sourceName: item.latestSubmission.sourceName,
                    }
                  : null,
            });
            receipt = await upload(
              row.file,
              row.itemId,
              row.key,
              (value) => {
                if (!active.cancelled && mounted.current)
                  change(id, { progress: Math.min(100, Math.max(0, value)) });
              },
              active.controller.signal,
              row.correctionSubmissionId && row.correctionAction
                ? {
                    submissionId: row.correctionSubmissionId,
                    action: row.correctionAction,
                  }
                : undefined,
            );
            if (active.cancelled || !mounted.current)
              throw new Error("UPLOAD_INTERRUPTED");
            if (
              receipt.mimeType !== row.inspection.actualMimeType ||
              receipt.byteSize !== row.inspection.byteSize ||
              typeof receipt.uploadId !== "string" ||
              !receipt.uploadId ||
              typeof receipt.checksum !== "string" ||
              !receipt.checksum
            )
              throw new Error("VALIDATION_REJECTED");
            change(id, { receipt, progress: 100 });
          }
          change(id, { state: "FINALIZING", error: null });
          const data = new FormData();
          data.set("campaignId", campaign.id);
          data.set("requestedItemId", row.itemId);
          data.set("uploadId", receipt.uploadId);
          data.set("clientIdempotencyKey", row.key);
          data.set("sourceName", metadata.title);
          data.set("sourceDescription", metadata.description);
          data.set("declaredRights", "DECLARED");
          if (row.correctionSubmissionId) {
            data.set("replacesSubmissionId", row.correctionSubmissionId);
            data.set("correctionAction", row.correctionAction ?? "");
          }
          const result = await finalize(initialState, data);
          if (!mounted.current) break;
          if (
            result.requestedItemId !== row.itemId ||
            result.clientIdempotencyKey !== row.key
          )
            throw new Error("FINALIZE_FAILED");
          if (result.status === "SUCCESS")
            change(id, {
              state: "RECEIVED",
              error: null,
              ...(result.submissionId
                ? { submissionId: result.submissionId }
                : {}),
            });
          else
            change(id, {
              state: "ERROR",
              error:
                result.status === "ERROR" &&
                result.message === "RIGHTS_REQUIRED"
                  ? "RIGHTS_REQUIRED"
                  : row.correctionSubmissionId &&
                      result.message === "INVALID_SUBMISSION"
                    ? "CORRECTION_STALE"
                    : "FINALIZE_FAILED",
            });
        } catch (error) {
          change(id, {
            state: "ERROR",
            error: collectionFailureCode(
              error instanceof Error ? error.message : null,
              !!receipt,
              active.cancelled,
            ),
          });
        }
      }
    } finally {
      operation.current = null;
      if (mounted.current) setRunning(false);
    }
  }
  return { files, running, duplicate, add, edit, remove, cancel, submit };
}
