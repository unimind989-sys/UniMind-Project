import { describe, expect, it } from "vitest";

import {
  classifyAuthProviderError,
  classifyRecoveryLinkError,
  resolveAuthGate,
  validatedInternalReturnPath,
  validateLoginInput,
  validateRegistrationInput,
} from "../../src/lib/auth/auth-flow.domain";

describe("auth return-path contract", () => {
  it("keeps only authorized internal learning destinations", () => {
    expect(validatedInternalReturnPath("/learn")).toBe("/learn");
    expect(validatedInternalReturnPath("/learn/unit-a?tab=studio#quiz")).toBe(
      "/learn/unit-a?tab=studio#quiz",
    );
    expect(validatedInternalReturnPath(undefined)).toBe("/learn");
  });

  it.each([
    "https://attacker.invalid/learn",
    "//attacker.invalid/learn",
    "/\\attacker.invalid/learn",
    "/%2f%2fattacker.invalid/learn",
    "javascript:alert(1)",
    "/admin",
    "/login",
    "/learn\r\nLocation:https://attacker.invalid",
  ])("rejects forged destination %s", (destination) => {
    expect(validatedInternalReturnPath(destination)).toBe("/learn");
  });
});

describe("auth input contract", () => {
  it("normalizes email without changing passwords", () => {
    expect(
      validateLoginInput({
        email: "  STUDENT@Example.edu ",
        password: " spaces-stay ",
      }),
    ).toEqual({
      success: true,
      data: {
        email: "student@example.edu",
        password: " spaces-stay ",
      },
    });
  });

  it("returns field codes instead of leaking provider diagnostics", () => {
    expect(
      validateRegistrationInput({
        email: "not-an-email",
        password: "short",
        passwordConfirmation: "different",
      }),
    ).toEqual({
      success: false,
      fieldErrors: {
        email: ["EMAIL_INVALID"],
        password: ["PASSWORD_REQUIREMENTS"],
        passwordConfirmation: ["PASSWORD_MISMATCH"],
      },
    });
  });
});

describe("auth state contract", () => {
  it.each([
    [{ hasVerifiedIdentity: false }, "SIGN_IN"],
    [
      {
        hasVerifiedIdentity: true,
        emailVerified: false,
        accountStatus: "PENDING",
        hasCurrentConsent: false,
      },
      "VERIFY_EMAIL",
    ],
    [
      {
        hasVerifiedIdentity: true,
        emailVerified: true,
        accountStatus: "SUSPENDED",
        hasCurrentConsent: true,
      },
      "SUSPENDED",
    ],
    [
      {
        hasVerifiedIdentity: true,
        emailVerified: true,
        accountStatus: "ACTIVE",
        hasCurrentConsent: false,
      },
      "CONSENT_REQUIRED",
    ],
    [
      {
        hasVerifiedIdentity: true,
        emailVerified: true,
        accountStatus: "PENDING",
        hasCurrentConsent: true,
      },
      "ACCOUNT_PENDING",
    ],
    [
      {
        hasVerifiedIdentity: true,
        emailVerified: true,
        accountStatus: "ACTIVE",
        hasCurrentConsent: true,
      },
      "READY",
    ],
  ] as const)("maps authoritative state %# to %s", (input, expected) => {
    expect(resolveAuthGate(input)).toBe(expected);
  });

  it("uses generic credential failures and bounded provider states", () => {
    expect(
      classifyAuthProviderError({ code: "invalid_credentials", status: 400 }),
    ).toBe("INVALID_CREDENTIALS");
    expect(
      classifyAuthProviderError({ code: "email_not_confirmed", status: 400 }),
    ).toBe("CHECK_EMAIL");
    expect(
      classifyAuthProviderError({
        code: "over_request_rate_limit",
        status: 429,
      }),
    ).toBe("RATE_LIMITED");
    expect(
      classifyAuthProviderError({
        code: "internal_provider_detail_with_private_email",
        status: 500,
      }),
    ).toBe("UNAVAILABLE");
  });

  it("distinguishes expired, replayed, and otherwise invalid recovery links", () => {
    expect(classifyRecoveryLinkError({ code: "otp_expired" })).toBe(
      "EXPIRED_LINK",
    );
    expect(classifyRecoveryLinkError({ code: "flow_state_not_found" })).toBe(
      "REPLAYED_LINK",
    );
    expect(classifyRecoveryLinkError({ code: "unknown" })).toBe("INVALID_LINK");
  });
});
