import { describe, expect, it, vi } from "vitest";

import type { CollectionRepository } from "../../src/lib/collection/collection.application";

vi.mock("server-only", () => ({}));
vi.mock(
  "@/lib/collection/collection.application",
  async () => await import("../../src/lib/collection/collection.application"),
);
vi.mock(
  "@/lib/collection/collection-upload.server",
  async () => await import("../../src/lib/collection/collection-upload.server"),
);

function repository(): CollectionRepository {
  return {
    listActiveCampaigns: vi.fn(),
    loadCampaign: vi.fn().mockResolvedValue(null),
    registerUpload: vi.fn(),
    finalizeSubmission: vi.fn(),
  };
}

describe("production upload API denial contract", () => {
  it("rejects unavailable assignments before reading bytes or storing an object", async () => {
    const repo = repository();
    const request = new Request(
      "http://localhost/api/batch-leader/campaigns/forged/uploads?role=ADMIN",
      { method: "POST", body: "WP03_PRIVATE_SOURCE_CANARY" },
    );
    const parse = vi.spyOn(request, "formData");
    const { handleCollectionUpload } =
      await import("../../src/app/api/batch-leader/upload-handler.server");
    const response = await handleCollectionUpload(request, "forged", repo);
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "UPLOAD_REJECTED" });
    expect(parse).not.toHaveBeenCalled();
    expect(repo.registerUpload).not.toHaveBeenCalled();
    expect(repo.finalizeSubmission).not.toHaveBeenCalled();
  });

  it("strips private diagnostics from an assignment lookup failure", async () => {
    const repo = repository();
    vi.mocked(repo.loadCampaign).mockRejectedValue(
      new Error("synthetic/private/key WP03_PRIVATE_SOURCE_CANARY"),
    );
    const { handleCollectionUpload } =
      await import("../../src/app/api/batch-leader/upload-handler.server");
    const response = await handleCollectionUpload(
      new Request("http://localhost/upload", { method: "POST" }),
      "forged",
      repo,
    );
    expect(await response.json()).toEqual({ error: "UPLOAD_REJECTED" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
