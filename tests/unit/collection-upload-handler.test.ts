import { describe, expect, it, vi } from "vitest";

import type { CollectionRepository } from "../../src/lib/collection/collection.application";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/collection/collection.application", () => ({
  CollectionBoundaryError: class CollectionBoundaryError extends Error {
    readonly code = "INVALID_SUBMISSION";
  },
  MAX_COLLECTION_UPLOAD_BODY_BYTES: 11_534_336,
}));
vi.mock("@/lib/collection/collection-upload.server", () => ({
  prepareSyntheticCollectionUpload: vi.fn(),
}));

function repository(
  loadCampaign: CollectionRepository["loadCampaign"],
): CollectionRepository {
  return {
    listActiveCampaigns: vi.fn(),
    loadCampaign,
    registerUpload: vi.fn(),
    finalizeSubmission: vi.fn(),
  };
}

describe("collection upload route boundary", () => {
  it("rejects an unavailable campaign before parsing multipart content", async () => {
    const loadCampaign = vi.fn().mockResolvedValue(null);
    const request = new Request("http://localhost/upload", {
      method: "POST",
      body: "not multipart content",
    });
    const { handleCollectionUpload } =
      await import("../../src/app/api/batch-leader/upload-handler.server");

    const response = await handleCollectionUpload(
      request,
      "11111111-1111-4111-8111-111111111111",
      repository(loadCampaign),
    );

    expect(response.status).toBe(403);
    expect(loadCampaign).toHaveBeenCalledOnce();
  });

  it("rejects an oversized request before identity or campaign work", async () => {
    const loadCampaign = vi.fn();
    const request = new Request("http://localhost/upload", {
      method: "POST",
      headers: { "content-length": "12000000" },
      body: "synthetic",
    });
    const { handleCollectionUpload } =
      await import("../../src/app/api/batch-leader/upload-handler.server");

    const response = await handleCollectionUpload(
      request,
      "11111111-1111-4111-8111-111111111111",
      repository(loadCampaign),
    );

    expect(response.status).toBe(413);
    expect(loadCampaign).not.toHaveBeenCalled();
  });
});
