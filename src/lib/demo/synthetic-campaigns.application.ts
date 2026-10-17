import type {
  CollectionCampaign,
  RegisteredCollectionUpload,
} from "../collection/collection.application";
import type {
  CollectionActionState,
  CollectionFlowDraft,
} from "../collection/collection-client-state.application";
import type {
  Locale,
  ReviewSubmission,
} from "./synthetic-fixtures.application";
import { syntheticDemoTime } from "./synthetic-clock.application";
import { COLLECTION_BROWSER_MAX_FILE_BYTES } from "../collection/collection-browser.application";
import { resolveCollectionCorrection } from "../collection/collection-queue.application";

export const demoCampaignId = "sample-campaign";
export const additionalCampaignIds = [
  "sample-biochemistry-campaign",
  "sample-physiology-campaign",
] as const;
const types = ["DOCUMENT", "AUDIO", "IMAGE"] as const;
const names = [
  ["Anatomy lecture and practical sources", "مصادر محاضرات وعمليات التشريح"],
  [
    "Biochemistry revision sources: comparison handouts, lecture recordings and pathway diagrams for the first revision cycle",
    "مصادر مراجعة الكيمياء الحيوية: ملازم المقارنة وتسجيلات المحاضرات ورسوم المسارات لدورة المراجعة الأولى",
  ],
  [
    "Physiology practical sources: labelled diagrams and supporting explanations for the second revision cycle",
    "مصادر عملي وظائف الأعضاء: الرسوم المسماة والشروح الداعمة لدورة المراجعة الثانية",
  ],
] as const;
/**
 * The title every new synthetic file starts with. The synthetic finalize
 * service accepts this supplied title only, as it always has.
 */
export const syntheticSourceTitle = "Upper limb lecture material";
/** Requested items per campaign (handout, recording, diagram), EN and AR. */
const requestTitles = [
  [
    ["Lecture 7 handout", "ملزمة المحاضرة 7"],
    ["Practical 4 recording", "تسجيل العملي 4"],
    ["Brachial plexus diagram", "رسم الضفيرة العضدية"],
  ],
  [
    ["Biochemistry lecture 3 handout", "ملزمة محاضرة الكيمياء الحيوية 3"],
    ["Biochemistry lecture 3 recording", "تسجيل محاضرة الكيمياء الحيوية 3"],
    ["Glycolysis pathway diagram", "رسم مسار تحلل الجلوكوز"],
  ],
  [
    ["Physiology lecture 5 handout", "ملزمة محاضرة وظائف الأعضاء 5"],
    ["Physiology practical 2 recording", "تسجيل عملي وظائف الأعضاء 2"],
    ["Cardiac cycle diagram", "رسم الدورة القلبية"],
  ],
] as const;
/** Earlier submissions already recorded in the Anatomy campaign. */
const historyItems = [
  ["Lecture 5 handout", "ملزمة المحاضرة 5", "Lecture 5, pectoral region"],
  [
    "Practical 2 worksheet",
    "ورقة عمل العملي 2",
    "Practical 2, shoulder and scapula",
  ],
  [
    "Lecture 4 handout",
    "ملزمة المحاضرة 4",
    "Lecture 4, bones of the upper limb",
  ],
  [
    "Term 1 revision summary",
    "ملخص مراجعة الترم الأول",
    "Revision summary, shared by a student",
  ],
  [
    "Lecture 3 handout",
    "ملزمة المحاضرة 3",
    "Lecture 3, introduction to the upper limb",
  ],
] as const;
type State = {
  submissions: ReviewSubmission[];
  campaignDensity: boolean;
  role: string | null;
  verified: boolean;
  consent: boolean;
  /**
   * Loopback `fixture=shared-format` only: the demo campaign also requests a
   * second diagram, so one image matches two outstanding requests and the
   * leader must choose its destination. Never part of persisted state.
   */
  sharedFormatRequest?: boolean;
};
export const sharedFormatItemId = "sample-item-4";
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
  state: Pick<State, "submissions" | "sharedFormatRequest">,
  locale: Locale,
  id = demoCampaignId,
): CollectionCampaign | null {
  const index = [demoCampaignId, ...additionalCampaignIds].indexOf(id);
  if (index < 0) return null;
  const practiceLatest =
    index === 0 && state.sharedFormatRequest
      ? state.submissions
          .filter(
            (submission) =>
              (submission.campaignId ?? demoCampaignId) === id &&
              submission.requestedItemId === sharedFormatItemId,
          )
          .at(-1)
      : undefined;
  const practiceDiagram =
    index === 0 && state.sharedFormatRequest
      ? [
          {
            id: sharedFormatItemId,
            unitId: "sample-unit-3",
            title:
              locale === "ar" ? "رسم حدود الإبط" : "Axilla boundaries diagram",
            unitTitleEn: "Anatomy",
            unitTitleAr: "التشريح",
            expectedType: "IMAGE" as const,
            required: true,
            status: practiceLatest
              ? ("RECEIVED" as const)
              : ("REQUESTED" as const),
            latestSubmission: practiceLatest
              ? {
                  id: String(practiceLatest.id),
                  sourceName: practiceLatest.sourceName ?? syntheticSourceTitle,
                  status: practiceLatest.status as "RECEIVED",
                  createdAt: syntheticDemoTime.now,
                }
              : null,
          },
        ]
      : [];
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
        ? "طب الزقازيق، السنة الأولى، الترم الأول"
        : "Zagazig Medicine, Year 1, Term 1",
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
          title: requestTitles[index]![itemIndex]![locale === "ar" ? 1 : 0],
          unitTitleEn: unit[0],
          unitTitleAr: unit[1],
          expectedType: type,
          required: true,
          status: latest ? ("RECEIVED" as const) : ("REQUESTED" as const),
          latestSubmission: latest
            ? {
                id: String(latest.id),
                sourceName: latest.sourceName ?? syntheticSourceTitle,
                status: latest.status as "RECEIVED",
                createdAt: syntheticDemoTime.now,
                ...(latest.correction ? { correction: latest.correction } : {}),
              }
            : null,
        };
      }),
      ...practiceDiagram,
      ...(index === 0
        ? statuses.map((status, itemIndex) => ({
            id: `sample-history-${itemIndex}`,
            unitId: "sample-unit-1",
            title: historyItems[itemIndex]![locale === "ar" ? 1 : 0],
            unitTitleEn: "Anatomy",
            unitTitleAr: "التشريح",
            expectedType: "DOCUMENT" as const,
            required: false,
            uploadAllowed: false,
            status: "RECEIVED" as const,
            latestSubmission: {
              id: `history-${itemIndex}`,
              sourceName: historyItems[itemIndex]![2],
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
            sourceName: "Lecture 7 handout, first upload",
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
            sourceName: "Practical 4 recording, first upload",
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
              sourceName: "Lecture 7 handout",
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
    data.get("sourceName") !== syntheticSourceTitle ||
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
