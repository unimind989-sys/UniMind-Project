import "server-only";

import type {
  CollectionCampaign,
  CollectionRepository,
  FinalizedCollectionSubmission,
  RegisterCollectionUploadInput,
  RegisteredCollectionUpload,
} from "@/lib/collection/collection.application";

export const previewCampaignId = "11111111-1111-4111-8111-111111111111";

const previewCampaign: CollectionCampaign = {
  id: previewCampaignId,
  name: "Synthetic Anatomy source call",
  cohortName: "Human Medicine · Year 1 · Term 1",
  opensAt: "2026-09-01T00:00:00.000Z",
  closesAt: "2026-10-12T20:00:00.000Z",
  assignmentExpiresAt: "2026-10-10T20:00:00.000Z",
  requestedItems: [
    {
      id: "22222222-2222-4222-8222-222222222221",
      unitId: "33333333-3333-4333-8333-333333333333",
      title: "Week 3 lecture handout",
      unitTitleEn: "Anatomy",
      unitTitleAr: "علم التشريح",
      expectedType: "DOCUMENT",
      required: true,
      status: "REQUESTED",
      latestSubmission: null,
    },
    {
      id: "22222222-2222-4222-8222-222222222222",
      unitId: "33333333-3333-4333-8333-333333333334",
      title: "Histology lab recording",
      unitTitleEn: "Histology",
      unitTitleAr: "علم الأنسجة",
      expectedType: "AUDIO",
      required: true,
      status: "RECEIVED",
      latestSubmission: {
        id: "55555555-5555-4555-8555-555555555551",
        sourceName: "Synthetic lab narration",
        status: "PROCESSING",
        createdAt: "2026-09-20T10:00:00.000Z",
      },
    },
    {
      id: "22222222-2222-4222-8222-222222222223",
      unitId: "33333333-3333-4333-8333-333333333335",
      title: "Biochemistry pathway plate",
      unitTitleEn: "Biochemistry",
      unitTitleAr: "الكيمياء الحيوية",
      expectedType: "IMAGE",
      required: false,
      status: "RECEIVED",
      latestSubmission: {
        id: "55555555-5555-4555-8555-555555555552",
        sourceName: "Synthetic pathway plate",
        status: "NEEDS_INFORMATION",
        createdAt: "2026-09-19T09:00:00.000Z",
      },
    },
    {
      id: "22222222-2222-4222-8222-222222222224",
      unitId: "33333333-3333-4333-8333-333333333336",
      title: "Physiology seminar notes",
      unitTitleEn: "Physiology",
      unitTitleAr: "علم وظائف الأعضاء",
      expectedType: "DOCUMENT",
      required: false,
      status: "RECEIVED",
      latestSubmission: {
        id: "55555555-5555-4555-8555-555555555553",
        sourceName: "Synthetic seminar notes",
        status: "ACCEPTED",
        createdAt: "2026-09-18T09:00:00.000Z",
      },
    },
    {
      id: "22222222-2222-4222-8222-222222222225",
      unitId: "33333333-3333-4333-8333-333333333337",
      title: "Practice diagram set",
      unitTitleEn: "Medical terminology",
      unitTitleAr: "المصطلحات الطبية",
      expectedType: "IMAGE",
      required: false,
      status: "RECEIVED",
      latestSubmission: {
        id: "55555555-5555-4555-8555-555555555554",
        sourceName: "Synthetic diagram set",
        status: "REJECTED",
        createdAt: "2026-09-17T09:00:00.000Z",
      },
    },
    {
      id: "22222222-2222-4222-8222-222222222226",
      unitId: "33333333-3333-4333-8333-333333333338",
      title: "Orientation reference",
      unitTitleEn: "Foundations",
      unitTitleAr: "الأساسيات",
      expectedType: "DOCUMENT",
      required: false,
      status: "RECEIVED",
      latestSubmission: {
        id: "55555555-5555-4555-8555-555555555555",
        sourceName: "Synthetic orientation reference",
        status: "COMPLETED",
        createdAt: "2026-09-16T09:00:00.000Z",
      },
    },
  ],
};

type PreviewUpload = RegisterCollectionUploadInput & RegisteredCollectionUpload;
const previewGlobal = globalThis as typeof globalThis & {
  __unimindCollectionUploads?: PreviewUpload[];
  __unimindCollectionSubmissions?: Array<
    FinalizedCollectionSubmission & {
      uploadId: string;
      sourceName: string;
      sourceDescription: string;
    }
  >;
};
const uploads = (previewGlobal.__unimindCollectionUploads ??= []);
const submissions = (previewGlobal.__unimindCollectionSubmissions ??= []);

class PreviewCollectionConflictError extends Error {}

export const previewCollectionRepository: CollectionRepository = {
  async listActiveCampaigns() {
    return [previewCampaign];
  },
  async loadCampaign(campaignId) {
    return campaignId === previewCampaign.id ? previewCampaign : null;
  },
  async registerUpload(input) {
    const existing = uploads.find(
      (upload) =>
        upload.campaignId === input.campaignId &&
        upload.clientIdempotencyKey === input.clientIdempotencyKey,
    );
    if (existing !== undefined) {
      if (
        existing.requestedItemId !== input.requestedItemId ||
        existing.checksum !== input.checksum ||
        existing.mimeType !== input.mimeType ||
        existing.byteSize !== input.byteSize
      ) {
        throw new PreviewCollectionConflictError();
      }
      return existing;
    }
    const upload: PreviewUpload = {
      ...input,
      uploadId: crypto.randomUUID(),
    };
    uploads.push(upload);
    return upload;
  },
  async finalizeSubmission(input) {
    const upload = uploads.find(
      (candidate) =>
        candidate.uploadId === input.uploadId &&
        candidate.campaignId === input.campaignId &&
        candidate.requestedItemId === input.requestedItemId &&
        candidate.clientIdempotencyKey === input.clientIdempotencyKey,
    );
    if (upload === undefined) throw new PreviewCollectionConflictError();
    const existing = submissions.find(
      (submission) => submission.uploadId === upload.uploadId,
    );
    if (existing !== undefined) {
      if (
        existing.sourceName !== input.sourceName ||
        existing.sourceDescription !== input.sourceDescription
      ) {
        throw new PreviewCollectionConflictError();
      }
      return { ...existing, replayed: true };
    }
    const submission = {
      id: crypto.randomUUID(),
      status: "RECEIVED" as const,
      createdAt: new Date().toISOString(),
      replayed: false,
      uploadId: upload.uploadId,
      sourceName: input.sourceName,
      sourceDescription: input.sourceDescription,
    };
    submissions.push(submission);
    return submission;
  },
};
