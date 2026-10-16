import type {
  CollectionCampaign,
  CollectionRequestedItem,
} from "./collection.application";
import { resolveCollectionCorrection } from "./collection-queue.application";

// Presentation only. The upload/finalize services reauthorize every mutation.
export function collectionDeadline(
  campaign: CollectionCampaign,
): string | null {
  const cutoff = Math.min(
    Date.parse(campaign.assignmentExpiresAt),
    Date.parse(campaign.closesAt),
  );
  return Number.isFinite(cutoff) ? new Date(cutoff).toISOString() : null;
}

export function collectionWindow(campaign: CollectionCampaign, now: number) {
  const opens = Date.parse(campaign.opensAt);
  const closes = Date.parse(campaign.closesAt);
  const assignment = Date.parse(campaign.assignmentExpiresAt);
  if (![opens, closes, assignment, now].every(Number.isFinite))
    return "UNAVAILABLE";
  if (now >= closes) return "CLOSED";
  if (now >= assignment) return "EXPIRED";
  if (now < opens) return "NOT_OPEN";
  return "ACTIVE";
}

export function collectionRequestAction(
  campaign: CollectionCampaign,
  item: CollectionRequestedItem,
) {
  if (item.uploadAllowed === false) return null;
  if (!item.latestSubmission && item.status === "REQUESTED") return "UPLOAD";
  return item.latestSubmission &&
    resolveCollectionCorrection(campaign, item.id, item.latestSubmission.id)
    ? item.latestSubmission.correction!.action
    : null;
}

type InspectionQuery = Pick<URLSearchParams, "has" | "getAll">;
export function resolveCollectionInspection(
  campaign: CollectionCampaign,
  query: InspectionQuery,
):
  | { status: "NONE" }
  | { status: "UNAVAILABLE" }
  | { status: "FOUND"; item: CollectionRequestedItem } {
  if (!query.has("inspect") && !query.has("record")) return { status: "NONE" };
  const ids = query.getAll("inspect");
  const records = query.getAll("record");
  if (
    query.has("request") ||
    query.has("submission") ||
    query.has("upload") ||
    ids.length !== 1 ||
    records.length !== 1 ||
    !ids[0] ||
    !records[0]
  )
    return { status: "UNAVAILABLE" };
  const item = campaign.requestedItems.find((item) => item.id === ids[0]);
  return item?.latestSubmission?.id === records[0]
    ? { status: "FOUND", item }
    : { status: "UNAVAILABLE" };
}

export function resolveCollectionUploadSelection(
  campaign: CollectionCampaign,
  query: InspectionQuery,
):
  | { status: "NONE" }
  | { status: "UNAVAILABLE" }
  | { status: "FOUND"; itemId: string | null } {
  if (!query.has("upload")) return { status: "NONE" };
  const values = query.getAll("upload");
  if (
    values.length !== 1 ||
    !values[0] ||
    ["request", "submission", "inspect", "record"].some((key) => query.has(key))
  )
    return { status: "UNAVAILABLE" };
  if (values[0] === "all") return { status: "FOUND", itemId: null };
  const item = campaign.requestedItems.find((item) => item.id === values[0]);
  return item && collectionRequestAction(campaign, item) === "UPLOAD"
    ? { status: "FOUND", itemId: item.id }
    : { status: "UNAVAILABLE" };
}

export function collectionInspectionHref(
  campaignId: string,
  itemId: string,
  submissionId: string,
  locale: string,
  preview = false,
) {
  const query = new URLSearchParams({
    inspect: itemId,
    record: submissionId,
    lang: locale,
  });
  return `${preview ? "/preview" : ""}/batch-leader/campaigns/${encodeURIComponent(campaignId)}?${query}#collection-record-${encodeURIComponent(itemId)}`;
}

export type CollectionAcknowledgement = Readonly<{
  itemId: string | null;
  submissionId?: string;
  fileName: string;
  title: string;
  description: string;
  origin?: "DEVICE" | "APPROVED_REFERENCE";
  predecessorId?: string;
}>;

// Reconcile only canonical identities, never filenames or inferred timestamps.
export function projectCollectionRecords(
  campaign: CollectionCampaign,
  acknowledgements: readonly CollectionAcknowledgement[],
) {
  const unresolved: CollectionAcknowledgement[] = acknowledgements.filter(
    (row) => !campaign.requestedItems.some((item) => item.id === row.itemId),
  );
  const details = new Map<string, CollectionAcknowledgement>();
  const requestedItems = campaign.requestedItems.map((item) => {
    const receipts = acknowledgements.filter((row) => row.itemId === item.id);
    if (!receipts.length) return item;
    const matches = receipts.filter(
      (row) =>
        row.submissionId && row.submissionId === item.latestSubmission?.id,
    );
    const exact = matches.length === 1 ? matches[0] : null;
    const latest = item.latestSubmission;
    const candidates = receipts.filter(
      (row) =>
        row.submissionId &&
        ((!latest && !row.predecessorId) || latest?.id === row.predecessorId),
    );
    if (exact) {
      details.set(item.id, exact);
      const superseded = new Set([exact]);
      let predecessor = exact.predecessorId;
      while (predecessor) {
        const previous = receipts.filter(
          (row) => row.submissionId === predecessor,
        );
        if (previous.length !== 1 || superseded.has(previous[0]!)) break;
        const previousReceipt = previous[0]!;
        superseded.add(previousReceipt);
        predecessor = previousReceipt.predecessorId;
      }
      unresolved.push(...receipts.filter((row) => !superseded.has(row)));
      return item;
    }
    if (candidates.length === 1 && receipts.length === 1) {
      const ack = candidates[0]!;
      details.set(item.id, ack);
      return {
        ...item,
        status: "RECEIVED" as const,
        latestSubmission: {
          id: ack.submissionId!,
          sourceName: ack.title,
          status: "RECEIVED" as const,
          createdAt: "",
        },
      };
    }
    // Another loaded record wins; ambiguous/missing IDs receive no guessed link.
    unresolved.push(...receipts);
    return item;
  });
  return { campaign: { ...campaign, requestedItems }, details, unresolved };
}
