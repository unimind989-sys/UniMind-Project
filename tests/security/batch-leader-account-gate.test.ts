import { beforeEach, describe, expect, it, vi } from "vitest";

// WP03-T27: the account gate (verification, consent, suspension, profile)
// applies to Batch Leader upload and finalize before any campaign work.
const mocks = vi.hoisted(() => ({
  ready: vi.fn(),
  upload: vi.fn(),
  finalize: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/auth/access-route.server", () => ({
  hasReadyAccess: mocks.ready,
}));
vi.mock("../../src/app/api/batch-leader/upload-handler.server", () => ({
  handleCollectionUpload: mocks.upload,
}));
vi.mock("../../src/app/batch-leader/collection-actions", () => ({
  runCollectionFinalizeAction: mocks.finalize,
}));
vi.mock("../../src/lib/collection/collection.supabase.server", () => ({
  supabaseCollectionRepository: {},
}));

import { POST } from "../../src/app/api/batch-leader/campaigns/[campaignId]/uploads/route";
import { finalizeCollectionAction } from "../../src/app/batch-leader/campaigns/[campaignId]/actions";

const campaignId = "11111111-1111-4111-8111-111111111111";
const context = { params: Promise.resolve({ campaignId }) };
function submission() {
  const data = new FormData();
  data.set("campaignId", campaignId);
  data.set("requestedItemId", "item-1");
  data.set("clientIdempotencyKey", "key-1");
  data.set("uploadId", "upload-1");
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.upload.mockResolvedValue(new Response(null, { status: 201 }));
  mocks.finalize.mockResolvedValue({ status: "SUCCESS" });
});

describe("Batch Leader account gate", () => {
  it("answers 403 to an upload from a caller who is not ready, before reading it", async () => {
    mocks.ready.mockResolvedValue(false);
    const response = await POST(
      new Request("http://localhost/upload", {
        method: "POST",
        body: "synthetic",
      }) as never,
      context,
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "UPLOAD_REJECTED" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(mocks.upload).not.toHaveBeenCalled();
  });

  it("refuses to finalize for a caller who is not ready, without touching the submission", async () => {
    mocks.ready.mockResolvedValue(false);
    await expect(
      finalizeCollectionAction({ status: "IDLE" }, submission()),
    ).resolves.toEqual({
      status: "ERROR",
      requestedItemId: "item-1",
      clientIdempotencyKey: "key-1",
      message: "UNAVAILABLE",
    });
    expect(mocks.finalize).not.toHaveBeenCalled();
  });

  it("lets a ready caller through to the existing campaign checks", async () => {
    mocks.ready.mockResolvedValue(true);
    expect(
      (
        await POST(
          new Request("http://localhost/upload", {
            method: "POST",
            body: "synthetic",
          }) as never,
          context,
        )
      ).status,
    ).toBe(201);
    expect(mocks.upload).toHaveBeenCalledOnce();
    await finalizeCollectionAction({ status: "IDLE" }, submission());
    expect(mocks.finalize).toHaveBeenCalledOnce();
  });
});
