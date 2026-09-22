import { describe, expect, it, vi } from "vitest";

import {
  finalizeCollectionSubmission,
  prepareCollectionUpload,
  resolveCollectionCampaign,
  CollectionBoundaryError,
  type CollectionCampaign,
  type CollectionRepository,
} from "../../src/lib/collection/collection.application";
import { DeterministicMockObjectStorageProvider } from "../../src/lib/storage/mocks/object-storage.mock.adapter";
import type { ObjectStorageProvider } from "../../src/lib/storage/object-storage-provider";

const campaign: CollectionCampaign = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Synthetic Anatomy intake",
  cohortName: "Synthetic Medicine 2026",
  opensAt: "2026-09-01T00:00:00.000Z",
  closesAt: "2026-10-01T00:00:00.000Z",
  assignmentExpiresAt: "2026-10-01T00:00:00.000Z",
  requestedItems: [
    {
      id: "22222222-2222-4222-8222-222222222222",
      unitId: "33333333-3333-4333-8333-333333333333",
      title: "Lecture handout",
      unitTitleEn: "Anatomy",
      unitTitleAr: "علم التشريح",
      expectedType: "DOCUMENT",
      required: true,
      status: "REQUESTED",
      latestSubmission: null,
    },
  ],
};

function repository(
  overrides: Partial<CollectionRepository> = {},
): CollectionRepository {
  return {
    listActiveCampaigns: vi.fn().mockResolvedValue([campaign]),
    loadCampaign: vi.fn().mockResolvedValue(campaign),
    registerUpload: vi.fn().mockResolvedValue({
      uploadId: "44444444-4444-4444-8444-444444444444",
      checksum:
        "sha256:5c9ef8c1a4fc8bb0765e2d10b9bc07044ac417d5eb957619229ac4787b7ce212",
      mimeType: "application/pdf",
      byteSize: 26,
    }),
    finalizeSubmission: vi.fn().mockResolvedValue({
      id: "55555555-5555-4555-8555-555555555555",
      status: "RECEIVED",
      createdAt: "2026-09-22T12:00:00.000Z",
      replayed: false,
    }),
    ...overrides,
  };
}

const pdf = new TextEncoder().encode("%PDF-1.7\nsynthetic fixture");

describe("collection application boundary", () => {
  it("returns only the repository-authorized active campaign", async () => {
    const loadCampaign = vi.fn().mockResolvedValue(null);
    await expect(
      resolveCollectionCampaign(repository({ loadCampaign }), "forged"),
    ).resolves.toBeNull();
    expect(loadCampaign).toHaveBeenCalledWith("forged");
  });

  it("inspects and stores an allowed synthetic object before registering server evidence", async () => {
    const registerUpload = vi.fn().mockResolvedValue({
      uploadId: "44444444-4444-4444-8444-444444444444",
      checksum:
        "sha256:5c9ef8c1a4fc8bb0765e2d10b9bc07044ac417d5eb957619229ac4787b7ce212",
      mimeType: "application/pdf",
      byteSize: pdf.byteLength,
    });
    const result = await prepareCollectionUpload(
      repository({ registerUpload }),
      new DeterministicMockObjectStorageProvider(),
      {
        campaignId: campaign.id,
        requestedItemId: campaign.requestedItems[0]!.id,
        clientIdempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        fileName: "synthetic.pdf",
        clientMimeType: "text/plain",
        bytes: pdf,
        correlationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      },
    );
    expect(result.mimeType).toBe("application/pdf");
    expect(registerUpload).toHaveBeenCalledWith(
      expect.objectContaining({
        campaignId: campaign.id,
        requestedItemId: campaign.requestedItems[0]!.id,
        clientIdempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        mimeType: "application/pdf",
      }),
    );
  });

  it("rejects a file whose signature does not match the requested item", async () => {
    const audio = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    ]);
    await expect(
      prepareCollectionUpload(
        repository(),
        new DeterministicMockObjectStorageProvider(),
        {
          campaignId: campaign.id,
          requestedItemId: campaign.requestedItems[0]!.id,
          clientIdempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          fileName: "synthetic.wav",
          clientMimeType: "audio/wav",
          bytes: audio,
          correlationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        },
      ),
    ).rejects.toMatchObject({ code: "TYPE_MISMATCH" });
  });

  it("rejects mismatched storage evidence without registering the upload", async () => {
    const registerUpload = vi.fn();
    const mismatchedStorage = {
      putObject: vi.fn().mockImplementation((request: { objectKey: string }) =>
        Promise.resolve({
          status: "SUCCEEDED",
          value: {
            namespace: "temporary",
            objectKey: request.objectKey,
            checksum:
              "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            byteLength: pdf.byteLength,
          },
        }),
      ),
      getObject: vi.fn(),
      deleteObject: vi.fn(),
    } as unknown as ObjectStorageProvider;

    await expect(
      prepareCollectionUpload(
        repository({ registerUpload }),
        mismatchedStorage,
        {
          campaignId: campaign.id,
          requestedItemId: campaign.requestedItems[0]!.id,
          clientIdempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          fileName: "synthetic.pdf",
          clientMimeType: "application/pdf",
          bytes: pdf,
          correlationId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        },
      ),
    ).rejects.toMatchObject({ code: "UPLOAD_EVIDENCE_MISMATCH" });
    expect(registerUpload).not.toHaveBeenCalled();
  });

  it("requires declared rights and forwards sealed upload evidence for finalization", async () => {
    await expect(
      finalizeCollectionSubmission(repository(), {
        campaignId: campaign.id,
        requestedItemId: campaign.requestedItems[0]!.id,
        uploadId: "44444444-4444-4444-8444-444444444444",
        clientIdempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        sourceName: "Synthetic lecture handout",
        sourceDescription: "Generated fixture without private content.",
        declaredRights: "UNKNOWN",
      }),
    ).rejects.toBeInstanceOf(CollectionBoundaryError);

    await expect(
      finalizeCollectionSubmission(repository(), {
        campaignId: campaign.id,
        requestedItemId: campaign.requestedItems[0]!.id,
        uploadId: "44444444-4444-4444-8444-444444444444",
        clientIdempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        sourceName: "Synthetic lecture handout",
        sourceDescription: "Generated fixture without private content.",
        declaredRights: "REVOKED",
      }),
    ).rejects.toMatchObject({ code: "RIGHTS_REQUIRED" });

    const finalizeSubmission = vi.fn().mockResolvedValue({
      id: "55555555-5555-4555-8555-555555555555",
      status: "RECEIVED",
      createdAt: "2026-09-22T12:00:00.000Z",
      replayed: true,
    });
    const result = await finalizeCollectionSubmission(
      repository({ finalizeSubmission }),
      {
        campaignId: campaign.id,
        requestedItemId: campaign.requestedItems[0]!.id,
        uploadId: "44444444-4444-4444-8444-444444444444",
        clientIdempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        sourceName: "Synthetic lecture handout",
        sourceDescription: "Generated fixture without private content.",
        declaredRights: "DECLARED",
      },
    );
    expect(result.replayed).toBe(true);
    expect(finalizeSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ declaredRights: "DECLARED" }),
    );
  });
});
