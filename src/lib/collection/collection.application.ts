import type { ObjectStorageProvider } from "../storage/object-storage-provider";
import {
  inspectCollectionFile,
  MAX_COLLECTION_FILE_BYTES,
  type CollectionExpectedType,
} from "./collection.domain";

export const MAX_COLLECTION_UPLOAD_BODY_BYTES =
  MAX_COLLECTION_FILE_BYTES + 1_048_576;

export type CollectionSubmissionStatus =
  | "RECEIVED"
  | "PROCESSING"
  | "NEEDS_INFORMATION"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED";

export type CollectionSubmissionSummary = Readonly<{
  id: string;
  sourceName: string;
  status: CollectionSubmissionStatus;
  createdAt: string;
}>;

export type CollectionRequestedItem = Readonly<{
  id: string;
  unitId: string;
  title: string;
  unitTitleEn: string;
  unitTitleAr: string;
  expectedType: CollectionExpectedType;
  required: boolean;
  status: "REQUESTED" | "RECEIVED";
  latestSubmission: CollectionSubmissionSummary | null;
}>;

export type CollectionCampaign = Readonly<{
  id: string;
  name: string;
  cohortName: string;
  opensAt: string;
  closesAt: string;
  assignmentExpiresAt: string;
  requestedItems: readonly CollectionRequestedItem[];
}>;

export type RegisteredCollectionUpload = Readonly<{
  uploadId: string;
  checksum: string;
  mimeType: string;
  byteSize: number;
}>;

export type FinalizedCollectionSubmission = Readonly<{
  id: string;
  status: "RECEIVED";
  createdAt: string;
  replayed: boolean;
}>;

export type RegisterCollectionUploadInput = Readonly<{
  campaignId: string;
  requestedItemId: string;
  curriculumUnitId: string;
  clientIdempotencyKey: string;
  fileName: string;
  declaredFormat: string;
  mimeType: string;
  byteSize: number;
  checksum: string;
  provider: "mock-object-storage-provider";
  objectKey: string;
}>;

export type FinalizeCollectionSubmissionInput = Readonly<{
  campaignId: string;
  requestedItemId: string;
  uploadId: string;
  clientIdempotencyKey: string;
  sourceName: string;
  sourceDescription: string;
  declaredRights: "DECLARED" | "UNKNOWN" | "REVOKED";
}>;

export type CollectionRepository = Readonly<{
  listActiveCampaigns(): Promise<readonly CollectionCampaign[]>;
  loadCampaign(campaignId: string): Promise<CollectionCampaign | null>;
  registerUpload(
    input: RegisterCollectionUploadInput,
  ): Promise<RegisteredCollectionUpload>;
  finalizeSubmission(
    input: FinalizeCollectionSubmissionInput,
  ): Promise<FinalizedCollectionSubmission>;
}>;

export type CollectionBoundaryCode =
  | "CAMPAIGN_UNAVAILABLE"
  | "ITEM_UNAVAILABLE"
  | "EMPTY_FILE"
  | "FILE_TOO_LARGE"
  | "FORBIDDEN_TYPE"
  | "TYPE_MISMATCH"
  | "UPLOAD_FAILED"
  | "UPLOAD_EVIDENCE_MISMATCH"
  | "RIGHTS_REQUIRED"
  | "INVALID_SUBMISSION";

export class CollectionBoundaryError extends Error {
  constructor(readonly code: CollectionBoundaryCode) {
    super("The collection request could not be completed.");
    this.name = "CollectionBoundaryError";
  }
}

export async function resolveCollectionCampaign(
  repository: CollectionRepository,
  campaignId: string,
) {
  return repository.loadCampaign(campaignId);
}

function findRequestedItem(
  campaign: CollectionCampaign,
  requestedItemId: string,
) {
  return campaign.requestedItems.find((item) => item.id === requestedItemId);
}

function validClientKey(value: string) {
  return value.length >= 8 && value.length <= 200;
}

async function sha256(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes.slice().buffer);
  return `sha256:${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

export async function prepareCollectionUpload(
  repository: CollectionRepository,
  storage: ObjectStorageProvider,
  input: Readonly<{
    campaignId: string;
    requestedItemId: string;
    clientIdempotencyKey: string;
    fileName: string;
    clientMimeType: string;
    bytes: Uint8Array;
    correlationId: string;
    signal?: AbortSignal;
  }>,
): Promise<RegisteredCollectionUpload> {
  if (!validClientKey(input.clientIdempotencyKey)) {
    throw new CollectionBoundaryError("INVALID_SUBMISSION");
  }
  const campaign = await repository.loadCampaign(input.campaignId);
  if (campaign === null) {
    throw new CollectionBoundaryError("CAMPAIGN_UNAVAILABLE");
  }
  const item = findRequestedItem(campaign, input.requestedItemId);
  if (item === undefined) {
    throw new CollectionBoundaryError("ITEM_UNAVAILABLE");
  }
  const inspection = inspectCollectionFile({
    fileName: input.fileName,
    clientMimeType: input.clientMimeType,
    bytes: input.bytes,
  });
  if (!inspection.ok) {
    throw new CollectionBoundaryError(inspection.code);
  }
  if (
    item.expectedType !== "OTHER" &&
    inspection.expectedType !== item.expectedType
  ) {
    throw new CollectionBoundaryError("TYPE_MISMATCH");
  }

  const objectKey = `${campaign.id}/${crypto.randomUUID()}`;
  const stored = await storage.putObject(
    {
      namespace: "temporary",
      objectKey,
      bytes: input.bytes,
      contentType: inspection.actualMimeType,
    },
    {
      correlationId: input.correlationId,
      idempotencyKey: input.clientIdempotencyKey,
      timeoutMs: 10_000,
      attempt: 1,
      ...(input.signal === undefined ? {} : { signal: input.signal }),
    },
  );
  if (stored.status !== "SUCCEEDED") {
    throw new CollectionBoundaryError("UPLOAD_FAILED");
  }
  const expectedChecksum = await sha256(input.bytes);
  if (
    stored.value.byteLength !== inspection.byteSize ||
    stored.value.namespace !== "temporary" ||
    stored.value.objectKey !== objectKey ||
    stored.value.checksum !== expectedChecksum
  ) {
    throw new CollectionBoundaryError("UPLOAD_EVIDENCE_MISMATCH");
  }

  const registered = await repository.registerUpload({
    campaignId: campaign.id,
    requestedItemId: item.id,
    curriculumUnitId: item.unitId,
    clientIdempotencyKey: input.clientIdempotencyKey,
    fileName: input.fileName,
    declaredFormat: inspection.declaredFormat,
    mimeType: inspection.actualMimeType,
    byteSize: inspection.byteSize,
    checksum: stored.value.checksum,
    provider: "mock-object-storage-provider",
    objectKey,
  });
  return {
    uploadId: registered.uploadId,
    checksum: registered.checksum,
    mimeType: registered.mimeType,
    byteSize: registered.byteSize,
  };
}

export async function finalizeCollectionSubmission(
  repository: CollectionRepository,
  input: FinalizeCollectionSubmissionInput,
) {
  if (input.declaredRights !== "DECLARED") {
    throw new CollectionBoundaryError("RIGHTS_REQUIRED");
  }
  if (
    !validClientKey(input.clientIdempotencyKey) ||
    input.sourceName.trim().length < 3 ||
    input.sourceName.trim().length > 200 ||
    input.sourceDescription.trim().length < 10 ||
    input.sourceDescription.trim().length > 1_000
  ) {
    throw new CollectionBoundaryError("INVALID_SUBMISSION");
  }
  const campaign = await repository.loadCampaign(input.campaignId);
  if (campaign === null) {
    throw new CollectionBoundaryError("CAMPAIGN_UNAVAILABLE");
  }
  if (findRequestedItem(campaign, input.requestedItemId) === undefined) {
    throw new CollectionBoundaryError("ITEM_UNAVAILABLE");
  }
  return repository.finalizeSubmission({
    ...input,
    sourceName: input.sourceName.trim(),
    sourceDescription: input.sourceDescription.trim(),
  });
}
