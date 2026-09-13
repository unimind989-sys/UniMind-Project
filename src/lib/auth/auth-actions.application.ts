import {
  classifyAuthProviderError,
  type FieldErrorCode,
  type ProviderErrorLike,
  validatedInternalReturnPath,
  validateEmailInput,
  validateLoginInput,
  validatePasswordResetInput,
  validateRegistrationInput,
} from "./auth-flow.domain";

export { validatedInternalReturnPath } from "./auth-flow.domain";
export type { FieldErrorCode } from "./auth-flow.domain";

export type AuthActionStatus =
  | "SUCCESS"
  | "CHECK_EMAIL"
  | "INVALID_INPUT"
  | "INVALID_CREDENTIALS"
  | "RATE_LIMITED"
  | "UNAVAILABLE";

export type AuthActionResult = Readonly<{
  status: AuthActionStatus;
  returnPath: string;
  fieldErrors?: Readonly<Record<string, readonly FieldErrorCode[]>>;
}>;

export type AuthProviderResult = Readonly<{
  error: ProviderErrorLike | null;
}>;

export interface AuthGateway {
  signIn(
    input: Readonly<{ email: string; password: string }>,
  ): Promise<AuthProviderResult>;
  signUp(
    input: Readonly<{
      email: string;
      password: string;
      emailRedirectTo: string;
    }>,
  ): Promise<AuthProviderResult>;
  resendVerification(
    input: Readonly<{
      email: string;
      emailRedirectTo: string;
    }>,
  ): Promise<AuthProviderResult>;
  requestPasswordReset(
    input: Readonly<{
      email: string;
      redirectTo: string;
    }>,
  ): Promise<AuthProviderResult>;
  updatePassword(password: string): Promise<AuthProviderResult>;
  signOut(): Promise<AuthProviderResult>;
}

function invalidInput(
  returnPath: string,
  fieldErrors: Readonly<Record<string, readonly FieldErrorCode[]>>,
): AuthActionResult {
  return { status: "INVALID_INPUT", returnPath, fieldErrors };
}

function providerStatus(error: ProviderErrorLike | null): AuthActionStatus {
  return error === null ? "SUCCESS" : classifyAuthProviderError(error);
}

export function createAuthApplication(
  gateway: AuthGateway,
  canonicalOrigin: string,
) {
  const origin = new URL(canonicalOrigin).origin;

  return {
    async login(
      input: Readonly<{
        email: unknown;
        password: unknown;
        returnPath?: unknown;
      }>,
    ): Promise<AuthActionResult> {
      const returnPath = validatedInternalReturnPath(input.returnPath);
      const parsed = validateLoginInput(input);
      if (!parsed.success) return invalidInput(returnPath, parsed.fieldErrors);

      const result = await gateway.signIn(parsed.data);
      return { status: providerStatus(result.error), returnPath };
    },

    async register(
      input: Readonly<{
        email: unknown;
        password: unknown;
        passwordConfirmation: unknown;
        returnPath?: unknown;
      }>,
    ): Promise<AuthActionResult> {
      const returnPath = validatedInternalReturnPath(input.returnPath);
      const parsed = validateRegistrationInput(input);
      if (!parsed.success) return invalidInput(returnPath, parsed.fieldErrors);

      const callback = new URL("/auth/callback", origin);
      callback.searchParams.set("next", returnPath);
      const result = await gateway.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        emailRedirectTo: callback.toString(),
      });
      const status = providerStatus(result.error);
      return {
        status: status === "SUCCESS" ? "CHECK_EMAIL" : status,
        returnPath,
      };
    },

    async resendVerification(
      input: Readonly<{
        email: unknown;
        returnPath?: unknown;
      }>,
    ): Promise<AuthActionResult> {
      const returnPath = validatedInternalReturnPath(input.returnPath);
      const parsed = validateEmailInput(input);
      if (!parsed.success) return invalidInput(returnPath, parsed.fieldErrors);

      const callback = new URL("/auth/callback", origin);
      callback.searchParams.set("next", returnPath);
      const result = await gateway.resendVerification({
        email: parsed.data.email,
        emailRedirectTo: callback.toString(),
      });
      const status = providerStatus(result.error);
      return {
        status: status === "SUCCESS" ? "CHECK_EMAIL" : status,
        returnPath,
      };
    },

    async requestPasswordReset(
      input: Readonly<{
        email: unknown;
      }>,
    ): Promise<AuthActionResult> {
      const returnPath = "/learn";
      const parsed = validateEmailInput(input);
      if (!parsed.success) return invalidInput(returnPath, parsed.fieldErrors);

      const callback = new URL("/auth/callback", origin);
      callback.searchParams.set("next", "/reset-password");
      const result = await gateway.requestPasswordReset({
        email: parsed.data.email,
        redirectTo: callback.toString(),
      });
      const status = providerStatus(result.error);
      return {
        status: status === "SUCCESS" ? "CHECK_EMAIL" : status,
        returnPath,
      };
    },

    async updatePassword(
      input: Readonly<{
        password: unknown;
        passwordConfirmation: unknown;
      }>,
    ): Promise<AuthActionResult> {
      const parsed = validatePasswordResetInput(input);
      if (!parsed.success) return invalidInput("/learn", parsed.fieldErrors);
      const result = await gateway.updatePassword(parsed.data.password);
      return { status: providerStatus(result.error), returnPath: "/learn" };
    },

    async logout(): Promise<AuthActionResult> {
      const result = await gateway.signOut();
      return { status: providerStatus(result.error), returnPath: "/learn" };
    },
  };
}
