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
};

export function useCollectionQueue({
  campaign,
  upload,
  finalize,
  initialState,
  allowFile,
  initialTitle,
}: {
  campaign: CollectionCampaign;
  upload: CollectionUploadClient;
  finalize: CollectionFinalizeAction;
  initialState: CollectionActionState;
  allowFile?: (file: File) => Promise<boolean>;
  initialTitle?: string;
}) {
  const [files, setFiles] = useState<CollectionQueueFile[]>([]);
  const [running, setRunning] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const queue = useRef<CollectionQueueFile[]>([]);
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

  async function add(selected: readonly File[]) {
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
        title: initialTitle ?? collectionSourceTitle(file.name),
        itemId: null,
        inspection: null,
        state: "CHECKING",
        progress: 0,
        error: null,
        receipt: null,
        metadata: null,
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
        change(row.id, {
          inspection: inspected,
          itemId: inferredCollectionItem(
            campaign.requestedItems,
            inspected.expectedType,
          ),
          state: "READY",
        });
      } catch {
        change(row.id, { state: "INVALID", error: "FILE_UNREADABLE" });
      }
    }
  }
  function edit(
    id: string,
    patch: Partial<Pick<CollectionQueueFile, "title" | "itemId">>,
  ) {
    const row = queue.current.find((x) => x.id === id);
    if (!row || operation.current || row.receipt || row.state === "RECEIVED")
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
          row.title.trim().length < 3
        )
          continue;
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
          const result = await finalize(initialState, data);
          if (!mounted.current) break;
          if (
            result.requestedItemId !== row.itemId ||
            result.clientIdempotencyKey !== row.key
          )
            throw new Error("FINALIZE_FAILED");
          if (result.status === "SUCCESS")
            change(id, { state: "RECEIVED", error: null });
          else
            change(id, {
              state: "ERROR",
              error:
                result.status === "ERROR" &&
                result.message === "RIGHTS_REQUIRED"
                  ? "RIGHTS_REQUIRED"
                  : "FINALIZE_FAILED",
            });
        } catch (error) {
          change(id, {
            state: "ERROR",
            error:
              error instanceof Error && error.message === "VALIDATION_REJECTED"
                ? "VALIDATION_REJECTED"
                : active.cancelled
                  ? "UPLOAD_INTERRUPTED"
                  : receipt
                    ? "FINALIZE_FAILED"
                    : "UPLOAD_FAILED",
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
