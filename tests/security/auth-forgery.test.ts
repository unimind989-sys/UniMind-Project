import { beforeEach, describe, expect, it, vi } from "vitest";

const verifiedUserId = "5f6b38b2-1040-4bce-8d65-4db44d755b0c";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  getClaims: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/db/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createServerSupabaseClient.mockResolvedValue({
    auth: {
      getClaims: mocks.getClaims,
      getSession: mocks.getSession,
    },
  });
});

describe("verified Auth identity", () => {
  it("denies a forged cookie role when signature verification fails", async () => {
    mocks.getClaims.mockResolvedValue({
      data: null,
      error: new Error("invalid JWT signature"),
    });
    mocks.getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: verifiedUserId,
            user_metadata: {
              role: "admin",
              cohort_id: "forged-cohort",
            },
          },
        },
      },
      error: null,
    });

    const { requireVerifiedIdentity, UnauthenticatedError } =
      await import("../../src/lib/auth/verified-identity.server");

    await expect(requireVerifiedIdentity()).rejects.toBeInstanceOf(
      UnauthenticatedError,
    );
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it("returns only the verified subject and discards user-editable authority", async () => {
    mocks.getClaims.mockResolvedValue({
      data: {
        claims: {
          sub: verifiedUserId,
          user_metadata: {
            role: "admin",
            cohort_id: "forged-cohort",
          },
        },
      },
      error: null,
    });

    const { requireVerifiedIdentity } =
      await import("../../src/lib/auth/verified-identity.server");

    await expect(requireVerifiedIdentity()).resolves.toEqual({
      userId: verifiedUserId,
    });
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it("denies a verified token without a valid Supabase user subject", async () => {
    mocks.getClaims.mockResolvedValue({
      data: {
        claims: {
          sub: "not-a-user-id",
        },
      },
      error: null,
    });

    const { getVerifiedIdentity } =
      await import("../../src/lib/auth/verified-identity.server");

    await expect(getVerifiedIdentity()).resolves.toBeNull();
  });
});
