import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  registerSyntheticCollectionUploadEvidence: vi.fn(),
  requireVerifiedIdentity: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("../../src/lib/db/supabase/admin.server", () => ({
  registerSyntheticCollectionUploadEvidence:
    mocks.registerSyntheticCollectionUploadEvidence,
}));
vi.mock("../../src/lib/auth/verified-identity.server", () => ({
  requireVerifiedIdentity: mocks.requireVerifiedIdentity,
}));

const campaignRow = {
  campaign_id: "11111111-1111-4111-8111-111111111111",
  campaign_name: "Synthetic Anatomy intake",
  cohort_name: "Synthetic Medicine 2026",
  campaign_opens_at: "2026-09-01T00:00:00.000Z",
  campaign_closes_at: "2026-10-01T00:00:00.000Z",
  assignment_expires_at: "2026-10-01T00:00:00.000Z",
  requested_item_id: "22222222-2222-4222-8222-222222222222",
  curriculum_unit_id: "33333333-3333-4333-8333-333333333333",
  requested_title: "Lecture handout",
  expected_type: "DOCUMENT",
  required: true,
  requested_status: "REQUESTED",
  unit_title_en: "Anatomy",
  unit_title_ar: "علم التشريح",
  latest_submission_id: null,
  latest_submission_name: null,
  latest_submission_status: null,
  latest_submission_created_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createServerSupabaseClient.mockResolvedValue({ rpc: mocks.rpc });
  mocks.requireVerifiedIdentity.mockResolvedValue({
    userId: "99999999-9999-4999-8999-999999999999",
  });
  mocks.rpc.mockResolvedValue({ data: [campaignRow], error: null });
});

describe("collection Supabase adapter", () => {
  it("loads only rows returned by the caller-scoped campaign function", async () => {
    const { supabaseCollectionRepository } =
      await import("../../src/lib/collection/collection.supabase.server");
    const result = await supabaseCollectionRepository.loadCampaign(
      campaignRow.campaign_id,
    );
    expect(mocks.rpc).toHaveBeenCalledWith("current_batch_leader_campaign", {
      target_campaign_id: campaignRow.campaign_id,
    });
    expect(result).toMatchObject({
      id: campaignRow.campaign_id,
      requestedItems: [{ id: campaignRow.requested_item_id }],
    });
  });

  it("rejects malformed route IDs before querying", async () => {
    const { supabaseCollectionRepository } =
      await import("../../src/lib/collection/collection.supabase.server");
    await expect(
      supabaseCollectionRepository.loadCampaign("forged"),
    ).resolves.toBeNull();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("fails closed on crossed or incomplete submission rows", async () => {
    mocks.rpc.mockResolvedValue({
      data: [
        {
          ...campaignRow,
          latest_submission_id: "44444444-4444-4444-8444-444444444444",
          latest_submission_name: null,
          latest_submission_status: "RECEIVED",
          latest_submission_created_at: "2026-09-22T00:00:00.000Z",
        },
      ],
      error: null,
    });
    const { supabaseCollectionRepository } =
      await import("../../src/lib/collection/collection.supabase.server");
    await expect(
      supabaseCollectionRepository.loadCampaign(campaignRow.campaign_id),
    ).rejects.toThrow("assigned collection campaign");
  });

  it("registers verified upload evidence through the service-only seam", async () => {
    mocks.registerSyntheticCollectionUploadEvidence.mockResolvedValue({
      upload_id: "44444444-4444-4444-8444-444444444444",
      upload_checksum:
        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      upload_mime_type: "application/pdf",
      upload_byte_size: 2048,
    });
    const { supabaseCollectionRepository } =
      await import("../../src/lib/collection/collection.supabase.server");
    await supabaseCollectionRepository.registerUpload({
      campaignId: campaignRow.campaign_id,
      requestedItemId: campaignRow.requested_item_id,
      curriculumUnitId: campaignRow.curriculum_unit_id,
      clientIdempotencyKey: "synthetic-key",
      fileName: "handout.pdf",
      declaredFormat: "PDF",
      mimeType: "application/pdf",
      byteSize: 2048,
      checksum:
        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      provider: "mock-object-storage-provider",
      objectKey: "synthetic/object",
    });
    expect(mocks.requireVerifiedIdentity).toHaveBeenCalledOnce();
    expect(
      mocks.registerSyntheticCollectionUploadEvidence,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: "99999999-9999-4999-8999-999999999999",
      }),
    );
  });
});
