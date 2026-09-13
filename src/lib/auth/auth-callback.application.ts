import {
  classifyRecoveryLinkError,
  type ProviderErrorLike,
  type RecoveryLinkError,
  validatedAuthCallbackPath,
} from "./auth-flow.domain";

export type AuthCallbackOtpType = "recovery" | "signup";

export type AuthCallbackResult =
  | Readonly<{ status: "SUCCESS"; next: string }>
  | Readonly<{ status: RecoveryLinkError; next: string }>;

export interface AuthCallbackGateway {
  exchangeCode(
    code: string,
  ): Promise<Readonly<{ error: ProviderErrorLike | null }>>;
  verifyOtp(
    input: Readonly<{
      tokenHash: string;
      type: AuthCallbackOtpType;
    }>,
  ): Promise<Readonly<{ error: ProviderErrorLike | null }>>;
}

function boundedValue(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= 4096
    ? value
    : null;
}

function otpType(value: unknown): AuthCallbackOtpType | null {
  return value === "signup" || value === "recovery" ? value : null;
}

export async function completeAuthCallback(
  gateway: AuthCallbackGateway,
  input: Readonly<{
    code?: unknown;
    tokenHash?: unknown;
    type?: unknown;
    next?: unknown;
  }>,
): Promise<AuthCallbackResult> {
  const next = validatedAuthCallbackPath(input.next);
  const code = boundedValue(input.code);
  const tokenHash = boundedValue(input.tokenHash);
  const type = otpType(input.type);

  let result: Readonly<{ error: ProviderErrorLike | null }>;
  if (code !== null) {
    result = await gateway.exchangeCode(code);
  } else if (tokenHash !== null && type !== null) {
    result = await gateway.verifyOtp({ tokenHash, type });
  } else {
    return { status: "INVALID_LINK", next };
  }

  if (result.error !== null) {
    return { status: classifyRecoveryLinkError(result.error), next };
  }
  return { status: "SUCCESS", next };
}
