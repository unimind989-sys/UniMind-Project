import type {
  CollectionCampaign,
  CollectionRequestedItem,
} from "./collection.application";
import type { CollectionExpectedType } from "./collection.domain";

// This is a draft convenience. The server reauthorizes the chosen item.
export function compatibleCollectionItems(
  items: readonly CollectionRequestedItem[],
  type: CollectionExpectedType,
) {
  return items.filter(
    (item) =>
      item.uploadAllowed !== false &&
      (item.expectedType === type || item.expectedType === "OTHER"),
  );
}

export function inferredCollectionItem(
  items: readonly CollectionRequestedItem[],
  type: CollectionExpectedType,
): string | null {
  const compatible = compatibleCollectionItems(items, type);
  const outstanding = compatible.filter(
    (item) => item.status === "REQUESTED" && !item.latestSubmission,
  );
  const choices = outstanding.length ? outstanding : compatible;
  return choices.length === 1 ? choices[0]!.id : null;
}

// A named request restricts a fresh UI row; it never grants server authority.
export function boundCollectionItem(
  items: readonly CollectionRequestedItem[],
  requestedItemId: string,
  type: CollectionExpectedType,
) {
  const item = items.find((item) => item.id === requestedItemId);
  if (
    !item ||
    item.uploadAllowed === false ||
    item.status !== "REQUESTED" ||
    item.latestSubmission
  )
    return { item: null, error: "ITEM_UNAVAILABLE" as const };
  if (item.expectedType !== type && item.expectedType !== "OTHER")
    return { item: null, error: "TYPE_MISMATCH" as const };
  return { item, error: null };
}

export function collectionFileIdentity(file: {
  name: string;
  size: number;
  lastModified: number;
}) {
  return JSON.stringify([file.name, file.size, file.lastModified]);
}

export function collectionSourceTitle(name: string) {
  return name
    .replace(/\.(pdf|wav|png)$/iu, "")
    .trim()
    .slice(0, 200);
}

export function collectionRetryable(error: string | null) {
  return [
    "UPLOAD_INTERRUPTED",
    "UPLOAD_FAILED",
    "FINALIZE_FAILED",
    "RIGHTS_REQUIRED",
  ].includes(error ?? "");
}

export function collectionFailureCode(
  error: unknown,
  hasReceipt: boolean,
  cancelled: boolean,
) {
  if (cancelled) return "UPLOAD_INTERRUPTED";
  if (
    typeof error === "string" &&
    [
      "CHECKSUM_MISMATCH",
      "UPLOAD_EVIDENCE_MISMATCH",
      "DUPLICATE_FILE",
      "FILE_TOO_LARGE",
      "RIGHTS_REJECTED",
      "RIGHTS_REQUIRED",
      "VALIDATION_REJECTED",
      "CAMPAIGN_UNAVAILABLE",
      "ITEM_UNAVAILABLE",
      "CORRECTION_STALE",
    ].includes(error)
  )
    return error;
  return hasReceipt ? "FINALIZE_FAILED" : "UPLOAD_FAILED";
}

export function resolveCollectionCorrection(
  campaign: CollectionCampaign,
  requestedItemId: string,
  submissionId: string,
) {
  const item = campaign.requestedItems.find(
    (candidate) =>
      candidate.required &&
      candidate.uploadAllowed !== false &&
      candidate.id === requestedItemId,
  );
  const previous = item?.latestSubmission;
  return item &&
    previous?.id === submissionId &&
    ((previous.status === "NEEDS_INFORMATION" &&
      previous.correction?.action === "FIX_INFORMATION") ||
      (previous.status === "REJECTED" &&
        previous.correction?.action === "REPLACE_FILE"))
    ? item
    : null;
}
