import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  acceptCurrentConsent,
  readAuthAccess,
  type AuthAccessRepository,
} from "../../src/lib/auth/auth-access.application";

const currentTerms = {
  id: "12000000-0000-0000-0000-000000000001",
  termsVersion: "synthetic-terms-v1",
  privacyVersion: "synthetic-privacy-v1",
  educationalBoundaryVersion: "synthetic-boundary-v1",
} as const;
const userId = "10000000-0000-0000-0000-000000000002";

function createRepository() {
  return {
    getVerifiedUserId: vi.fn().mockResolvedValue(userId),
    getAccountStatus: vi.fn().mockResolvedValue("ACTIVE" as const),
    getCurrentTerms: vi.fn().mockResolvedValue(currentTerms),
    hasAcceptedTerms: vi.fn().mockResolvedValue(true),
    acceptCurrentTerms: vi.fn().mockResolvedValue(undefined),
  } satisfies AuthAccessRepository;
}

describe("authoritative auth access", () => {
  let repository: ReturnType<typeof createRepository>;

  beforeEach(() => {
    repository = createRepository();
  });

  it("requires sign-in before reading private profile or consent state", async () => {
    repository.getVerifiedUserId.mockResolvedValue(null);
    await expect(readAuthAccess(repository)).resolves.toEqual({
      gate: "SIGN_IN",
      currentTerms: null,
    });
    expect(repository.getAccountStatus).not.toHaveBeenCalled();
    expect(repository.getCurrentTerms).not.toHaveBeenCalled();
  });

  it.each(["SUSPENDED", "DISABLED"] as const)(
    "denies a %s profile without exposing terms state",
    async (accountStatus) => {
      repository.getAccountStatus.mockResolvedValue(accountStatus);
      await expect(readAuthAccess(repository)).resolves.toEqual({
        gate: accountStatus,
        currentTerms: null,
      });
      expect(repository.getCurrentTerms).not.toHaveBeenCalled();
    },
  );

  it("fails closed when no current terms bundle exists", async () => {
    repository.getCurrentTerms.mockResolvedValue(null);
    await expect(readAuthAccess(repository)).resolves.toEqual({
      gate: "UNAVAILABLE",
      currentTerms: null,
    });
  });

  it("requires the exact current bundle and accepts it idempotently", async () => {
    repository.hasAcceptedTerms
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(acceptCurrentConsent(repository)).resolves.toEqual({
      gate: "READY",
      currentTerms,
    });
    expect(repository.acceptCurrentTerms).toHaveBeenCalledOnce();
    expect(repository.acceptCurrentTerms).toHaveBeenCalledWith(
      userId,
      currentTerms,
    );
  });

  it("does not write when current consent already exists", async () => {
    await expect(acceptCurrentConsent(repository)).resolves.toEqual({
      gate: "READY",
      currentTerms,
    });
    expect(repository.acceptCurrentTerms).not.toHaveBeenCalled();
  });

  it("routes a pending profile to verification without exposing consent state", async () => {
    repository.getAccountStatus.mockResolvedValue("PENDING");
    await expect(readAuthAccess(repository)).resolves.toEqual({
      gate: "VERIFY_EMAIL",
      currentTerms: null,
    });
    expect(repository.getCurrentTerms).not.toHaveBeenCalled();
    expect(repository.hasAcceptedTerms).not.toHaveBeenCalled();
  });
});
