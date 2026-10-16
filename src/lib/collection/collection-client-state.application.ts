import type { RegisteredCollectionUpload } from "./collection.application";
import type { inspectCollectionFileForBrowser } from "./collection-browser.application";

export type CollectionActionState = Readonly<{
  status: "IDLE" | "SUCCESS" | "ERROR";
  requestedItemId?: string;
  clientIdempotencyKey?: string;
  submissionId?: string;
  replayed?: boolean;
  message?: "RIGHTS_REQUIRED" | "INVALID_SUBMISSION" | "UNAVAILABLE";
}>;

type CollectionFileInspection = Extract<
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
  inspection: CollectionFileInspection | null;
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

export type CollectionFlowDraft = {
  files: CollectionQueueFile[];
  description: string;
  rights: boolean;
};
