import type {
  CollectionCampaign,
  RegisteredCollectionUpload,
} from "../../lib/collection/collection.application";
import type { CollectionActionState } from "../batch-leader/collection-actions";
import type { CollectionFlowDraft } from "../batch-leader/_components/collection-flow";
import type { Locale, ReviewSubmission } from "./synthetic-fixtures";
import { syntheticDemoTime } from "../../lib/demo/synthetic-clock.application";
import { COLLECTION_BROWSER_MAX_FILE_BYTES } from "../../lib/collection/collection-browser.application";
import { resolveCollectionCorrection } from "../../lib/collection/collection-queue.application";

export const demoCampaignId = "sample-campaign";
export const additionalCampaignIds = [
  "sample-biochemistry-campaign",
  "sample-physiology-campaign",
] as const;
const types = ["DOCUMENT", "AUDIO", "IMAGE"] as const;
const names = [
  ["Synthetic Anatomy source call", "حملة مصادر التشريح التجريبية"],
  [
    "Synthetic Biochemistry source call — comparison handouts, recordings and diagrams for the first revision cycle",
    "حملة مصادر الكيمياء الحيوية التجريبية — ملازم المقارنة والتسجيلات والرسوم لدورة المراجعة الأولى",
  ],
  [
    "Synthetic Physiology source call — labelled diagrams and supporting explanations for a separate revision cycle",
    "حملة مصادر وظائف الأعضاء التجريبية — الرسوم المسماة والشروح الداعمة لدورة مراجعة مستقلة",
  ],
] as const;
type State = {
  submissions: ReviewSubmission[];
  campaignDensity: boolean;
  role: string | null;
  verified: boolean;
  consent: boolean;
};
export function syntheticCampaignId(pathname: string): string | null {
  const id = pathname.replace(/^\/batch-leader\/campaigns\//u, "");
  return pathname === `/batch-leader/campaigns/${id}` &&
    [demoCampaignId, ...additionalCampaignIds].includes(id)
    ? id
    : null;
}
export function syntheticCampaignsManifest() {
  return {
    localOnly: true,
    preparedPath: "/batch-leader?fixture=dense",
    campaignIds: [demoCampaignId, ...additionalCampaignIds],
    campaignCount: 3,
    requestsPerCampaign: 3,
    names,
    note: "Fixed invented assignments; separate document-local queues, requests and receipts. No real assignment, processing or storage claim.",
  };
}
export function makeSyntheticCampaign(
  state: Pick<State, "submissions">,
  locale: Locale,
  id = demoCampaignId,
): CollectionCampaign | null {
  const index = [demoCampaignId, ...additionalCampaignIds].indexOf(id);
  if (index < 0) return null;
  const unitNames = [
    ["Anatomy", "التشريح"],
    ["Biochemistry", "الكيمياء الحيوية"],
    ["Physiology", "وظائف الأعضاء"],
  ] as const;
  const unit = unitNames[index]!;
  const statuses = [
    "PROCESSING",
    "NEEDS_INFORMATION",
    "ACCEPTED",
    "REJECTED",
    "COMPLETED",
  ] as const;
  return {
    id,
    name: names[index]![locale === "ar" ? 1 : 0],
    cohortName:
      locale === "ar"
        ? "الطب البشري · السنة الأولى · الفصل الأول"
        : "Human Medicine · Year 1 · Term 1",
    opensAt: syntheticDemoTime.campaignOpensAt,
    closesAt: syntheticDemoTime.campaignClosesAt,
    assignmentExpiresAt: syntheticDemoTime.assignmentExpiresAt,
    requestedItems: [
      ...types.map((type, itemIndex) => {
        const itemId =
          index === 0
            ? `sample-item-${itemIndex + 1}`
            : `${id}-${type.toLowerCase()}`;
        const latest = state.submissions
          .filter(
            (submission) =>
              (submission.campaignId ?? demoCampaignId) === id &&
              (submission.requestedItemId
                ? submission.requestedItemId === itemId
                : index === 0 && submission.format === type),
          )
          .at(-1);
        return {
          id: itemId,
          unitId: index === 0 ? `sample-unit-${itemIndex + 1}` : `${id}-unit`,
          title:
            locale === "ar"
              ? index === 0
                ? ["ملزمة التشريح", "تسجيل تشريح", "رسم تشريح"][itemIndex]!
                : `${["ملزمة", "تسجيل", "رسم"][itemIndex]} ${unit[1]}`
              : `${unit[0]} ${["handout", "recording", "diagram"][itemIndex]}`,
          unitTitleEn: unit[0],
          unitTitleAr: unit[1],
          expectedType: type,
          required: true,
          status: latest ? ("RECEIVED" as const) : ("REQUESTED" as const),
          latestSubmission: latest
            ? {
                id: String(latest.id),
                sourceName: latest.sourceName ?? "Synthetic study source",
                status: latest.status as "RECEIVED",
                createdAt: syntheticDemoTime.now,
                ...(latest.correction ? { correction: latest.correction } : {}),
              }
            : null,
        };
      }),
      ...(index === 0
        ? statuses.map((status, itemIndex) => ({
            id: `sample-history-${itemIndex}`,
            unitId: "sample-unit-1",
            title:
              locale === "ar"
                ? `مثال متابعة ${itemIndex + 1}`
                : `Tracking example ${itemIndex + 1}`,
            unitTitleEn: "Anatomy",
            unitTitleAr: "التشريح",
            expectedType: "DOCUMENT" as const,
            required: false,
            uploadAllowed: false,
            status: "RECEIVED" as const,
            latestSubmission: {
              id: `history-${itemIndex}`,
              sourceName: "Synthetic historical source",
              status,
              createdAt: syntheticDemoTime.historicalSubmittedAt,
            },
          }))
        : []),
    ],
  };
}
export function assignedSyntheticCampaigns(
  state: Pick<State, "submissions" | "campaignDensity">,
  locale: Locale,
) {
  return [
    demoCampaignId,
    ...(state.campaignDensity ? additionalCampaignIds : []),
  ].map((id) => makeSyntheticCampaign(state, locale, id)!);
}
export type SyntheticCollectionDraftHandle = {
  current?: CollectionFlowDraft;
  save: (draft: CollectionFlowDraft) => void;
};
type Receipt = RegisteredCollectionUpload & {
  campaignId: string;
  itemId: string;
  key: string;
  correction?: {
    submissionId: string;
    action: "FIX_INFORMATION" | "REPLACE_FILE";
  };
};
export function createSyntheticCollectionMemory() {
  const drafts = new Map<string, SyntheticCollectionDraftHandle>();
  const receipts = new Map<string, Receipt>();
  const finalized = new Map<string, { id: string; fingerprint: string }>();
  return {
    drafts,
    receipts,
    finalized,
    sequence: 0,
    generation: 0,
    draft(campaignId: string) {
      let handle = drafts.get(campaignId);
      if (!handle) {
        const created: SyntheticCollectionDraftHandle = {
          save: (draft) => {
            created.current = draft;
          },
        };
        drafts.set(campaignId, created);
        handle = created;
      }
      return handle;
    },
    clear() {
      this.generation += 1;
      drafts.clear();
      receipts.clear();
      finalized.clear();
      this.sequence = 0;
    },
  };
}
type Memory = ReturnType<typeof createSyntheticCollectionMemory>;
function permitted(state: State, campaignId: string) {
  return (
    state.role === "leader" &&
    state.verified &&
    state.consent &&
    (campaignId === demoCampaignId ||
      (state.campaignDensity &&
        additionalCampaignIds.some((id) => id === campaignId)))
  );
}
export function prepareSyntheticCollectionCorrections(
  state: State,
  campaignId: string,
  fixture: string,
): ReviewSubmission[] {
  if (campaignId !== demoCampaignId || !permitted(state, campaignId)) return [];
  const prepared: ReviewSubmission[] =
    fixture === "corrections"
      ? [
          {
            id: -201,
            campaignId,
            requestedItemId: "sample-item-1",
            format: "DOCUMENT",
            status: "NEEDS_INFORMATION",
            sourceName: "Earlier synthetic handout",
            correction: {
              action: "FIX_INFORMATION",
              reasonEn:
                "Describe who prepared this handout and what material it covers.",
              reasonAr: "وضّح من أعد هذه الملزمة وما المحتوى الذي تغطيه.",
            },
          },
          {
            id: -202,
            campaignId,
            requestedItemId: "sample-item-2",
            format: "AUDIO",
            status: "REJECTED",
            sourceName: "Earlier synthetic recording",
            correction: {
              action: "REPLACE_FILE",
              reasonEn:
                "The recording is incomplete. Submit a complete recording for this request.",
              reasonAr: "التسجيل غير مكتمل. أرسل تسجيلًا كاملًا لهذا الطلب.",
            },
          },
        ]
      : fixture === "duplicate"
        ? [
            {
              id: -101,
              campaignId,
              requestedItemId: "sample-item-1",
              format: "DOCUMENT",
              status: "RECEIVED",
              sourceName: "Recorded synthetic handout",
            },
          ]
        : [];
  return prepared.filter(
    (candidate) =>
      !state.submissions.some(
        (row) =>
          (row.campaignId ?? demoCampaignId) === campaignId &&
          row.requestedItemId === candidate.requestedItemId,
      ),
  );
}
export function registerSyntheticCollectionReceipt(
  state: State,
  memory: Memory,
  campaignId: string,
  itemId: string,
  key: string,
  mimeType: string,
  byteSize: number,
  correction?: {
    submissionId: string;
    action: "FIX_INFORMATION" | "REPLACE_FILE";
  },
): RegisteredCollectionUpload {
  const item = makeSyntheticCampaign(
    state,
    "en",
    campaignId,
  )?.requestedItems.find((row) => row.id === itemId && row.required);
  const expectedMime = {
    DOCUMENT: "application/pdf",
    AUDIO: "audio/wav",
    IMAGE: "image/png",
  };
  if (
    !permitted(state, campaignId) ||
    !item ||
    item.expectedType === "OTHER" ||
    expectedMime[item.expectedType] !== mimeType ||
    byteSize <= 0 ||
    byteSize > COLLECTION_BROWSER_MAX_FILE_BYTES ||
    key.length < 8 ||
    key.length > 200
  )
    throw new Error("VALIDATION_REJECTED");
  const uploadId = `sample-upload:${campaignId}:${itemId}:${key}`;
  if (correction) {
    const target = resolveCollectionCorrection(
      makeSyntheticCampaign(state, "en", campaignId)!,
      itemId,
      correction.submissionId,
    );
    if (
      !target ||
      target.latestSubmission?.correction?.action !== correction.action
    )
      throw new Error("CORRECTION_STALE");
  }
  const existing = memory.receipts.get(uploadId);
  if (
    existing &&
    (existing.mimeType !== mimeType ||
      existing.byteSize !== byteSize ||
      existing.correction?.submissionId !== correction?.submissionId ||
      existing.correction?.action !== correction?.action)
  )
    throw new Error("VALIDATION_REJECTED");
  const receipt = {
    uploadId,
    checksum: "invented-checksum",
    mimeType,
    byteSize,
    campaignId,
    itemId,
    key,
    ...(correction ? { correction: { ...correction } } : {}),
  };
  memory.receipts.set(uploadId, receipt);
  return { uploadId, checksum: receipt.checksum, mimeType, byteSize };
}
export function finalizeSyntheticCollectionSubmission(
  state: State,
  memory: Memory,
  campaignId: string,
  data: FormData,
): { result: CollectionActionState; submission?: ReviewSubmission } {
  const itemId = String(data.get("requestedItemId"));
  const key = String(data.get("clientIdempotencyKey"));
  const error = (
    message: "INVALID_SUBMISSION" | "RIGHTS_REQUIRED",
  ): { result: CollectionActionState } => ({
    result: {
      status: "ERROR",
      message,
      requestedItemId: itemId,
      clientIdempotencyKey: key,
    },
  });
  const description = data.get("sourceDescription");
  const item = makeSyntheticCampaign(
    state,
    "en",
    campaignId,
  )?.requestedItems.find((row) => row.id === itemId && row.required);
  if (
    !permitted(state, campaignId) ||
    data.get("campaignId") !== campaignId ||
    !item ||
    data.get("sourceName") !== "Synthetic study source" ||
    typeof description !== "string" ||
    description.trim().length < 10 ||
    description.trim().length > 1000 ||
    key.length < 8 ||
    key.length > 200
  )
    return error("INVALID_SUBMISSION");
  if (data.get("declaredRights") !== "DECLARED")
    return error("RIGHTS_REQUIRED");
  const replayKey = JSON.stringify([campaignId, itemId, key]);
  const fingerprint = JSON.stringify([
    String(data.get("uploadId")),
    description,
    data.get("sourceName"),
    data.get("declaredRights"),
    data.get("replacesSubmissionId"),
    data.get("correctionAction"),
  ]);
  const replay = memory.finalized.get(replayKey);
  if (replay)
    return replay.fingerprint === fingerprint
      ? {
          result: {
            status: "SUCCESS",
            submissionId: replay.id,
            requestedItemId: itemId,
            clientIdempotencyKey: key,
          },
        }
      : error("INVALID_SUBMISSION");
  const receipt = memory.receipts.get(String(data.get("uploadId")));
  if (
    !receipt ||
    receipt.campaignId !== campaignId ||
    receipt.itemId !== itemId ||
    receipt.key !== key
  )
    return error("INVALID_SUBMISSION");
  if (receipt.correction) {
    if (
      data.get("replacesSubmissionId") !== receipt.correction.submissionId ||
      data.get("correctionAction") !== receipt.correction.action
    )
      return error("INVALID_SUBMISSION");
    const target = resolveCollectionCorrection(
      makeSyntheticCampaign(state, "en", campaignId)!,
      itemId,
      receipt.correction.submissionId,
    );
    if (
      !target ||
      target.latestSubmission?.correction?.action !== receipt.correction.action
    )
      return error("INVALID_SUBMISSION");
  } else if (data.has("replacesSubmissionId") || data.has("correctionAction"))
    return error("INVALID_SUBMISSION");
  memory.sequence =
    Math.max(memory.sequence, ...state.submissions.map((row) => row.id)) + 1;
  const id = String(memory.sequence);
  memory.receipts.delete(receipt.uploadId);
  memory.finalized.set(replayKey, { id, fingerprint });
  return {
    result: {
      status: "SUCCESS",
      submissionId: id,
      requestedItemId: itemId,
      clientIdempotencyKey: key,
    },
    submission: {
      id: memory.sequence,
      campaignId,
      requestedItemId: itemId,
      format: item.expectedType,
      status: "RECEIVED",
    },
  };
}
