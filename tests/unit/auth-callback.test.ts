import { describe, expect, it, vi } from "vitest";

import {
  completeAuthCallback,
  type AuthCallbackGateway,
} from "../../src/lib/auth/auth-callback.application";

function gateway(): AuthCallbackGateway {
  return {
    exchangeCode: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({ error: null }),
  };
}

describe("auth callback application", () => {
  it("exchanges a PKCE code and keeps a validated learning destination", async () => {
    const adapter = gateway();
    const result = await completeAuthCallback(adapter, {
      code: "synthetic-code",
      next: "/learn/unit?focus=renal",
    });

    expect(adapter.exchangeCode).toHaveBeenCalledWith("synthetic-code");
    expect(adapter.verifyOtp).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "SUCCESS",
      next: "/learn/unit?focus=renal",
    });
  });

  it("accepts only the signup and recovery OTP callback types", async () => {
    const adapter = gateway();
    const result = await completeAuthCallback(adapter, {
      tokenHash: "synthetic-token-hash",
      type: "magiclink",
      next: "/learn",
    });

    expect(adapter.verifyOtp).not.toHaveBeenCalled();
    expect(result.status).toBe("INVALID_LINK");
  });

  it("preserves the reset page as the sole non-learning callback target", async () => {
    const adapter = gateway();
    const result = await completeAuthCallback(adapter, {
      tokenHash: "synthetic-token-hash",
      type: "recovery",
      next: "/reset-password",
    });

    expect(adapter.verifyOtp).toHaveBeenCalledWith({
      tokenHash: "synthetic-token-hash",
      type: "recovery",
    });
    expect(result).toEqual({ status: "SUCCESS", next: "/reset-password" });
  });

  it.each([
    ["https://attacker.invalid", "/learn"],
    ["//attacker.invalid/learn", "/learn"],
    ["/admin", "/learn"],
  ])("replaces a forged callback destination %s", async (next, expected) => {
    const result = await completeAuthCallback(gateway(), {
      code: "synthetic-code",
      next,
    });
    expect(result.next).toBe(expected);
  });

  it.each([
    ["otp_expired", "EXPIRED_LINK"],
    ["otp_used", "REPLAYED_LINK"],
    ["flow_state_not_found", "REPLAYED_LINK"],
    ["provider_diagnostic", "INVALID_LINK"],
  ] as const)(
    "maps %s to the bounded public state %s",
    async (code, status) => {
      const adapter = gateway();
      vi.mocked(adapter.exchangeCode).mockResolvedValue({ error: { code } });

      const result = await completeAuthCallback(adapter, {
        code: "synthetic-code",
      });
      expect(result.status).toBe(status);
      expect(result).not.toHaveProperty("error");
    },
  );
});
