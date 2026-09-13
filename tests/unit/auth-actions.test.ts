import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createAuthApplication,
  type AuthGateway,
} from "../../src/lib/auth/auth-actions.application";

const providerSuccess = { error: null } as const;

function createGateway() {
  return {
    signIn: vi.fn().mockResolvedValue(providerSuccess),
    signUp: vi.fn().mockResolvedValue(providerSuccess),
    resendVerification: vi.fn().mockResolvedValue(providerSuccess),
    requestPasswordReset: vi.fn().mockResolvedValue(providerSuccess),
    updatePassword: vi.fn().mockResolvedValue(providerSuccess),
    signOut: vi.fn().mockResolvedValue(providerSuccess),
  } satisfies AuthGateway;
}

describe("auth application", () => {
  let gateway: ReturnType<typeof createGateway>;

  beforeEach(() => {
    gateway = createGateway();
  });

  it("validates before calling the provider and preserves a safe return path", async () => {
    const application = createAuthApplication(
      gateway,
      "https://preview.unimind.invalid",
    );
    const result = await application.login({
      email: "invalid",
      password: "",
      returnPath: "https://attacker.invalid",
    });

    expect(result).toEqual({
      status: "INVALID_INPUT",
      returnPath: "/learn",
      fieldErrors: {
        email: ["EMAIL_INVALID"],
        password: ["PASSWORD_REQUIRED"],
      },
    });
    expect(gateway.signIn).not.toHaveBeenCalled();
  });

  it("never returns provider diagnostics or submitted credentials", async () => {
    gateway.signIn.mockResolvedValue({
      error: { code: "private-provider-error", status: 500 },
    });
    const application = createAuthApplication(
      gateway,
      "https://preview.unimind.invalid",
    );
    const result = await application.login({
      email: "student@synthetic.unimind.invalid",
      password: "Synthetic!Password1",
      returnPath: "/learn/unit-a",
    });

    expect(result).toEqual({
      status: "UNAVAILABLE",
      returnPath: "/learn/unit-a",
    });
    expect(JSON.stringify(result)).not.toContain("student@");
    expect(JSON.stringify(result)).not.toContain("Synthetic!Password1");
    expect(JSON.stringify(result)).not.toContain("private-provider-error");
  });

  it("uses the canonical origin and safe return path for email verification", async () => {
    const application = createAuthApplication(
      gateway,
      "https://preview.unimind.invalid/some-path",
    );
    const result = await application.register({
      email: " New.Student@Synthetic.Unimind.Invalid ",
      password: "Synthetic!Password1",
      passwordConfirmation: "Synthetic!Password1",
      returnPath: "/learn/unit-a?tab=studio",
    });

    expect(result).toEqual({
      status: "CHECK_EMAIL",
      returnPath: "/learn/unit-a?tab=studio",
    });
    expect(gateway.signUp).toHaveBeenCalledWith({
      email: "new.student@synthetic.unimind.invalid",
      password: "Synthetic!Password1",
      emailRedirectTo:
        "https://preview.unimind.invalid/auth/callback?next=%2Flearn%2Funit-a%3Ftab%3Dstudio",
    });
  });

  it("returns the same recovery success for eligible and non-existent accounts", async () => {
    const application = createAuthApplication(
      gateway,
      "https://preview.unimind.invalid",
    );
    const result = await application.requestPasswordReset({
      email: "unknown@synthetic.unimind.invalid",
    });

    expect(result.status).toBe("CHECK_EMAIL");
    expect(gateway.requestPasswordReset).toHaveBeenCalledWith({
      email: "unknown@synthetic.unimind.invalid",
      redirectTo:
        "https://preview.unimind.invalid/auth/callback?next=%2Freset-password",
    });
  });

  it("surfaces rate limiting without account-discovery detail", async () => {
    gateway.resendVerification.mockResolvedValue({
      error: { code: "over_email_send_rate_limit", status: 429 },
    });
    const application = createAuthApplication(
      gateway,
      "https://preview.unimind.invalid",
    );
    const result = await application.resendVerification({
      email: "student@synthetic.unimind.invalid",
      returnPath: "/learn",
    });

    expect(result).toEqual({ status: "RATE_LIMITED", returnPath: "/learn" });
  });

  it("updates passwords and signs out through bounded results", async () => {
    const application = createAuthApplication(
      gateway,
      "https://preview.unimind.invalid",
    );
    await expect(
      application.updatePassword({
        password: "Synthetic!Password2",
        passwordConfirmation: "Synthetic!Password2",
      }),
    ).resolves.toEqual({ status: "SUCCESS", returnPath: "/learn" });
    await expect(application.logout()).resolves.toEqual({
      status: "SUCCESS",
      returnPath: "/learn",
    });
  });
});
