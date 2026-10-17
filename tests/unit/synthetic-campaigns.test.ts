import { describe, expect, it } from "vitest";
import {
  additionalCampaignIds,
  assignedSyntheticCampaigns,
  createSyntheticCollectionMemory,
  demoCampaignId,
  finalizeSyntheticCollectionSubmission,
  makeSyntheticCampaign,
  registerSyntheticCollectionReceipt,
  syntheticCampaignId,
  syntheticCampaignsManifest,
  prepareSyntheticCollectionCorrections,
  syntheticSourceTitle,
} from "../../src/lib/demo/synthetic-campaigns.application";
import type { ReviewSubmission } from "../../src/lib/demo/synthetic-fixtures.application";

const state = () => ({
  role: "leader",
  verified: true,
  consent: true,
  campaignDensity: true,
  submissions: [] as ReviewSubmission[],
});
const target = (campaignId: string) =>
  makeSyntheticCampaign(state(), "en", campaignId)!.requestedItems[0]!.id;
function prepared(campaignId = demoCampaignId) {
  const current = state();
  const memory = createSyntheticCollectionMemory();
  const key = "synthetic-client-key-001";
  const receipt = registerSyntheticCollectionReceipt(
    current,
    memory,
    campaignId,
    target(campaignId),
    key,
    "application/pdf",
    128,
  );
  const data = new FormData();
  for (const [field, value] of Object.entries({
    campaignId,
    requestedItemId: target(campaignId),
    clientIdempotencyKey: key,
    uploadId: receipt.uploadId,
    sourceName: syntheticSourceTitle,
    sourceDescription: "Synthetic description with ordinary safe metadata.",
    declaredRights: "DECLARED",
  }))
    data.set(field, value);
  return { current, memory, data };
}
describe("document-local multi-campaign collection", () => {
  it("prepares permitted corrections only on exact local required requests and preserves first uploads", () => {
    const current = state();
    expect(
      prepareSyntheticCollectionCorrections(current, demoCampaignId, ""),
    ).toEqual([]);
    const corrections = prepareSyntheticCollectionCorrections(
      current,
      demoCampaignId,
      "corrections",
    );
    expect(corrections.map((row) => [row.requestedItemId, row.status])).toEqual(
      [
        ["sample-item-1", "NEEDS_INFORMATION"],
        ["sample-item-2", "REJECTED"],
      ],
    );
    current.submissions = corrections;
    const campaign = makeSyntheticCampaign(current, "en")!;
    expect(
      campaign.requestedItems[0]!.latestSubmission!.correction!.action,
    ).toBe("FIX_INFORMATION");
    expect(
      campaign.requestedItems[1]!.latestSubmission!.correction!.action,
    ).toBe("REPLACE_FILE");
    expect(campaign.requestedItems[2]!.latestSubmission).toBeNull();
    expect(
      prepareSyntheticCollectionCorrections(
        current,
        demoCampaignId,
        "corrections",
      ),
    ).toEqual([]);
    current.submissions.push({
      id: 1,
      requestedItemId: "sample-item-1",
      campaignId: demoCampaignId,
      format: "DOCUMENT",
      status: "RECEIVED",
    });
    expect(
      makeSyntheticCampaign(current, "en")!.requestedItems[0]!.latestSubmission!
        .id,
    ).toBe("1");
    expect(
      prepareSyntheticCollectionCorrections(
        current,
        demoCampaignId,
        "corrections",
      ),
    ).toEqual([]);
  });
  it("denies correction preparation to wrong role, access state and campaign", () => {
    for (const current of [
      { ...state(), role: "student" },
      { ...state(), verified: false },
      { ...state(), consent: false },
    ])
      expect(
        prepareSyntheticCollectionCorrections(
          current,
          demoCampaignId,
          "corrections",
        ),
      ).toEqual([]);
    expect(
      prepareSyntheticCollectionCorrections(
        state(),
        additionalCampaignIds[0],
        "corrections",
      ),
    ).toEqual([]);
    expect(
      prepareSyntheticCollectionCorrections(state(), "unknown", "corrections"),
    ).toEqual([]);
    expect(
      prepareSyntheticCollectionCorrections(
        state(),
        demoCampaignId,
        "duplicate",
      ),
    ).toEqual([
      expect.objectContaining({
        requestedItemId: "sample-item-1",
        status: "RECEIVED",
      }),
    ]);
  });
  it("preserves the ordinary single campaign and creates exact distinct prepared assignments", () => {
    const current = state();
    expect(
      assignedSyntheticCampaigns(
        { ...current, campaignDensity: false },
        "en",
      ).map((row) => row.id),
    ).toEqual([demoCampaignId]);
    const campaigns = assignedSyntheticCampaigns(current, "en");
    expect(campaigns).toHaveLength(3);
    const requests = campaigns.flatMap((campaign) =>
      campaign.requestedItems.filter((row) => row.required),
    );
    expect(requests).toHaveLength(9);
    expect(new Set(requests.map((row) => row.id)).size).toBe(9);
    expect(makeSyntheticCampaign(current, "en", "unassigned")).toBeNull();
    expect(syntheticCampaignsManifest().campaignIds).toEqual(
      campaigns.map((row) => row.id),
    );
    expect(
      assignedSyntheticCampaigns(current, "ar")[0]!
        .requestedItems.slice(0, 3)
        .map((row) => row.title),
    ).toEqual(["ملزمة المحاضرة 7", "تسجيل العملي 4", "رسم الضفيرة العضدية"]);
    expect(
      assignedSyntheticCampaigns(current, "ar")[2]!.name.length,
    ).toBeGreaterThan(80);
  });
  it("retains distinct document-owned draft handles and clears all collection state", () => {
    const { current, memory, data } = prepared();
    const finalized = finalizeSyntheticCollectionSubmission(
      current,
      memory,
      demoCampaignId,
      data,
    );
    expect(finalized.result.status).toBe("SUCCESS");
    const pending = prepared(additionalCampaignIds[0]);
    const pendingReceipt = registerSyntheticCollectionReceipt(
      current,
      memory,
      additionalCampaignIds[0],
      target(additionalCampaignIds[0]),
      String(pending.data.get("clientIdempotencyKey")),
      "application/pdf",
      128,
    );
    pending.data.set("uploadId", pendingReceipt.uploadId);
    memory
      .draft(demoCampaignId)
      .save({ files: [], description: "Synthetic A draft", rights: true });
    memory
      .draft(additionalCampaignIds[0])
      .save({ files: [], description: "Synthetic B draft", rights: false });
    expect(memory.draft(demoCampaignId).current?.description).toBe(
      "Synthetic A draft",
    );
    expect(memory.draft(additionalCampaignIds[0]).current?.rights).toBe(false);
    memory.clear();
    expect(memory.draft(demoCampaignId).current).toBeUndefined();
    expect(memory.draft(additionalCampaignIds[0]).current).toBeUndefined();
    // Cleared memory forgets both the finalized replay and the pending receipt.
    expect(
      finalizeSyntheticCollectionSubmission(
        current,
        memory,
        demoCampaignId,
        data,
      ).result.status,
    ).toBe("ERROR");
    expect(
      finalizeSyntheticCollectionSubmission(
        current,
        memory,
        additionalCampaignIds[0],
        pending.data,
      ).result.status,
    ).toBe("ERROR");
  });
  it.each([
    "/batch-leader/campaigns/unassigned",
    "/batch-leader/campaigns/sample-campaign/extra",
    "//batch-leader/campaigns/sample-campaign",
    "/admin/sample-campaign",
  ])("rejects unknown or ambiguous campaign path %s", (path) => {
    expect(syntheticCampaignId(path)).toBeNull();
  });
});
