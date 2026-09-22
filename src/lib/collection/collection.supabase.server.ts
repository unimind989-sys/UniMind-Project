import "server-only";

import { z } from "zod";

import { requireVerifiedIdentity } from "../auth/verified-identity.server";
import {
  finalizeSyntheticCollectionSubmission,
  registerSyntheticCollectionUploadEvidence,
} from "../db/supabase/admin.server";
import { createServerSupabaseClient } from "../db/supabase/server";
import type { Database } from "../../types/database.generated";
import type {
  CollectionCampaign,
  CollectionRepository,
  CollectionSubmissionStatus,
} from "./collection.application";
import type { CollectionExpectedType } from "./collection.domain";

const uuid = z.string().uuid();
const expectedTypes = new Set<CollectionExpectedType>([
  "DOCUMENT",
  "AUDIO",
  "IMAGE",
  "OTHER",
]);
const requestedStatuses = new Set(["REQUESTED", "RECEIVED"]);
const submissionStatuses = new Set<CollectionSubmissionStatus>([
  "RECEIVED",
  "PROCESSING",
  "NEEDS_INFORMATION",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
]);

export class CollectionDataError extends Error {
  constructor() {
    super("The assigned collection campaign could not be loaded.");
    this.name = "CollectionDataError";
  }
}

type CampaignRow =
  Database["public"]["Functions"]["current_batch_leader_campaign"]["Returns"][number];

function parseCampaigns(rows: readonly CampaignRow[]): CollectionCampaign[] {
  const grouped = new Map<string, CollectionCampaign>();
  for (const row of rows) {
    if (
      !uuid.safeParse(row.campaign_id).success ||
      !uuid.safeParse(row.requested_item_id).success ||
      !uuid.safeParse(row.curriculum_unit_id).success ||
      !expectedTypes.has(row.expected_type as CollectionExpectedType) ||
      !requestedStatuses.has(row.requested_status) ||
      (row.latest_submission_status !== null &&
        !submissionStatuses.has(
          row.latest_submission_status as CollectionSubmissionStatus,
        )) ||
      (row.latest_submission_id === null) !==
        (row.latest_submission_status === null) ||
      (row.latest_submission_id === null) !==
        (row.latest_submission_name === null) ||
      (row.latest_submission_id === null) !==
        (row.latest_submission_created_at === null)
    ) {
      throw new CollectionDataError();
    }

    const existing = grouped.get(row.campaign_id);
    const item = {
      id: row.requested_item_id,
      unitId: row.curriculum_unit_id,
      title: row.requested_title,
      unitTitleEn: row.unit_title_en,
      unitTitleAr: row.unit_title_ar,
      expectedType: row.expected_type as CollectionExpectedType,
      required: row.required,
      status: row.requested_status as "REQUESTED" | "RECEIVED",
      latestSubmission:
        row.latest_submission_id === null
          ? null
          : {
              id: row.latest_submission_id,
              sourceName: row.latest_submission_name!,
              status:
                row.latest_submission_status as CollectionSubmissionStatus,
              createdAt: row.latest_submission_created_at!,
            },
    } as const;

    if (existing === undefined) {
      grouped.set(row.campaign_id, {
        id: row.campaign_id,
        name: row.campaign_name,
        cohortName: row.cohort_name,
        opensAt: row.campaign_opens_at,
        closesAt: row.campaign_closes_at,
        assignmentExpiresAt: row.assignment_expires_at,
        requestedItems: [item],
      });
      continue;
    }
    if (
      existing.name !== row.campaign_name ||
      existing.cohortName !== row.cohort_name ||
      existing.opensAt !== row.campaign_opens_at ||
      existing.closesAt !== row.campaign_closes_at ||
      existing.assignmentExpiresAt !== row.assignment_expires_at ||
      existing.requestedItems.some((candidate) => candidate.id === item.id)
    ) {
      throw new CollectionDataError();
    }
    grouped.set(row.campaign_id, {
      ...existing,
      requestedItems: [...existing.requestedItems, item],
    });
  }
  return [...grouped.values()];
}

async function callCampaignRpc(targetCampaignId?: string) {
  const [, client] = await Promise.all([
    requireVerifiedIdentity(),
    createServerSupabaseClient(),
  ]);
  const { data, error } = await client.rpc("current_batch_leader_campaign", {
    ...(targetCampaignId === undefined
      ? {}
      : { target_campaign_id: targetCampaignId }),
  });
  if (error !== null || data === null) throw new CollectionDataError();
  return parseCampaigns(data);
}

export const supabaseCollectionRepository: CollectionRepository = {
  async listActiveCampaigns() {
    return callCampaignRpc();
  },

  async loadCampaign(campaignId) {
    if (!uuid.safeParse(campaignId).success) return null;
    const campaigns = await callCampaignRpc(campaignId);
    if (campaigns.length > 1) throw new CollectionDataError();
    return campaigns[0] ?? null;
  },

  async registerUpload(input) {
    const identity = await requireVerifiedIdentity();
    const row = await registerSyntheticCollectionUploadEvidence({
      actorId: identity.userId,
      campaignId: input.campaignId,
      requestedMaterialItemId: input.requestedItemId,
      curriculumUnitId: input.curriculumUnitId,
      clientIdempotencyKey: input.clientIdempotencyKey,
      originalFileName: input.fileName,
      declaredFormat: input.declaredFormat,
      provider: input.provider,
      objectKey: input.objectKey,
      checksum: input.checksum,
      mimeType: input.mimeType,
      byteSize: input.byteSize,
    });
    if (
      !uuid.safeParse(row.upload_id).success ||
      row.upload_checksum !== input.checksum ||
      row.upload_mime_type !== input.mimeType ||
      row.upload_byte_size !== input.byteSize
    ) {
      throw new CollectionDataError();
    }
    return {
      uploadId: row.upload_id,
      checksum: row.upload_checksum,
      mimeType: row.upload_mime_type,
      byteSize: row.upload_byte_size,
    };
  },

  async finalizeSubmission(input) {
    const identity = await requireVerifiedIdentity();
    const row = await finalizeSyntheticCollectionSubmission({
      actorId: identity.userId,
      campaignId: input.campaignId,
      requestedMaterialItemId: input.requestedItemId,
      uploadId: input.uploadId,
      clientIdempotencyKey: input.clientIdempotencyKey,
      sourceName: input.sourceName,
      sourceDescription: input.sourceDescription,
      declaredRights: input.declaredRights,
    });
    if (
      !uuid.safeParse(row.submission_id).success ||
      row.submission_status !== "RECEIVED"
    ) {
      throw new CollectionDataError();
    }
    return {
      id: row.submission_id,
      status: "RECEIVED",
      createdAt: row.submission_created_at,
      replayed: row.replayed,
    };
  },
};
