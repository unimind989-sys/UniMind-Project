import { describe, expect, it, vi } from "vitest";

import { handleCollectionUpload } from "../../src/app/api/batch-leader/upload-handler.server";
import { UnauthenticatedError } from "../../src/lib/auth/verified-identity.server";
import type { CollectionRepository } from "../../src/lib/collection/collection.application";

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(),
}));

const campaignId = "11111111-1111-4111-8111-111111111111";

function repository(): CollectionRepository {
  return {
    listActiveCampaigns: vi.fn(),
    loadCampaign: vi.fn().mockResolvedValue(null),
    registerUpload: vi.fn(),
    finalizeSubmission: vi.fn(),
  };
}

describe("production upload API denial contract", () => {
  it("rejects an oversized request before identity or campaign work", async () => {
    const repo = repository();
    const response = await handleCollectionUpload(
      new Request("http://localhost/upload", {
        method: "POST",
        headers: { "content-length": "12000000" },
        body: "synthetic",
      }),
      campaignId,
      repo,
    );

    expect(response.status).toBe(413);
    expect(repo.loadCampaign).not.toHaveBeenCalled();
  });

  it("reports an unverified caller as forbidden before reading upload content", async () => {
    const repo = repository();
    vi.mocked(repo.loadCampaign).mockRejectedValue(new UnauthenticatedError());
    const request = new Request("http://localhost/upload", {
      method: "POST",
      body: "not multipart content",
    });

    const response = await handleCollectionUpload(request, campaignId, repo);

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "UPLOAD_REJECTED" });
    expect(request.bodyUsed).toBe(false);
    expect(repo.registerUpload).not.toHaveBeenCalled();
  });

  it("rejects unavailable assignments before reading bytes or storing an object", async () => {
    const repo = repository();
    const request = new Request(
      "http://localhost/api/batch-leader/campaigns/forged/uploads?role=ADMIN",
      { method: "POST", body: "WP03_PRIVATE_SOURCE_CANARY" },
    );
    const parse = vi.spyOn(request, "formData");

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

    const response = await handleCollectionUpload(
      new Request("http://localhost/upload", { method: "POST" }),
      "forged",
      repo,
    );

    expect(await response.json()).toEqual({ error: "UPLOAD_REJECTED" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
