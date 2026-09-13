import { z } from "zod";

export const accountStatuses = [
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "DISABLED",
] as const;

export type AccountStatus = (typeof accountStatuses)[number];

export function isAccountStatus(value: unknown): value is AccountStatus {
  return accountStatuses.includes(value as AccountStatus);
}

export type AuthGate =
  | "SIGN_IN"
  | "VERIFY_EMAIL"
  | "CONSENT_REQUIRED"
  | "ACCOUNT_PENDING"
  | "SUSPENDED"
  | "DISABLED"
  | "READY";

export type PublicAuthError =
  "INVALID_CREDENTIALS" | "CHECK_EMAIL" | "RATE_LIMITED" | "UNAVAILABLE";

export type RecoveryLinkError =
  "EXPIRED_LINK" | "REPLAYED_LINK" | "INVALID_LINK";

export type ProviderErrorLike = Readonly<{
  code?: string | undefined;
  status?: number | undefined;
}>;

export type FieldErrorCode =
  | "ACCEPTANCE_REQUIRED"
  | "EMAIL_INVALID"
  | "PASSWORD_REQUIRED"
  | "PASSWORD_REQUIREMENTS"
  | "PASSWORD_MISMATCH";

export type InputValidationResult<T> =
  | Readonly<{ success: true; data: T }>
  | Readonly<{
      success: false;
      fieldErrors: Readonly<Record<string, readonly FieldErrorCode[]>>;
    }>;

const emailSchema = z.string().trim().toLowerCase().max(320).pipe(z.email());
const loginPasswordSchema = z.string().min(1).max(1024);
const registrationPasswordSchema = z
  .string()
  .min(12)
  .max(128)
  .regex(/[A-Za-z]/u)
  .regex(/[0-9]/u)
  .regex(/[^A-Za-z0-9]/u);

function validationFailure(
  fieldErrors: Record<string, readonly FieldErrorCode[]>,
): InputValidationResult<never> {
  return { success: false, fieldErrors };
}

export function validateLoginInput(
  input: Readonly<{
    email: unknown;
    password: unknown;
  }>,
): InputValidationResult<Readonly<{ email: string; password: string }>> {
  const email = emailSchema.safeParse(input.email);
  const password = loginPasswordSchema.safeParse(input.password);
  const fieldErrors: Record<string, readonly FieldErrorCode[]> = {};

  if (!email.success) fieldErrors.email = ["EMAIL_INVALID"];
  if (!password.success) fieldErrors.password = ["PASSWORD_REQUIRED"];

  if (!email.success || !password.success)
    return validationFailure(fieldErrors);
  return {
    success: true,
    data: { email: email.data, password: password.data },
  };
}

export function validateEmailInput(
  input: Readonly<{
    email: unknown;
  }>,
): InputValidationResult<Readonly<{ email: string }>> {
  const email = emailSchema.safeParse(input.email);
  if (!email.success) {
    return validationFailure({ email: ["EMAIL_INVALID"] });
  }
  return { success: true, data: { email: email.data } };
}

export function validatePasswordResetInput(
  input: Readonly<{
    password: unknown;
    passwordConfirmation: unknown;
  }>,
): InputValidationResult<
  Readonly<{ password: string; passwordConfirmation: string }>
> {
  const password = registrationPasswordSchema.safeParse(input.password);
  const confirmation = z.string().safeParse(input.passwordConfirmation);
  const fieldErrors: Record<string, readonly FieldErrorCode[]> = {};

  if (!password.success) fieldErrors.password = ["PASSWORD_REQUIREMENTS"];
  if (
    !confirmation.success ||
    !password.success ||
    confirmation.data !== password.data
  ) {
    fieldErrors.passwordConfirmation = ["PASSWORD_MISMATCH"];
  }

  if (!password.success || !confirmation.success) {
    return validationFailure(fieldErrors);
  }
  if (confirmation.data !== password.data)
    return validationFailure(fieldErrors);
  return {
    success: true,
    data: {
      password: password.data,
      passwordConfirmation: confirmation.data,
    },
  };
}

export function validateRegistrationInput(
  input: Readonly<{
    email: unknown;
    password: unknown;
    passwordConfirmation: unknown;
  }>,
): InputValidationResult<
  Readonly<{ email: string; password: string; passwordConfirmation: string }>
> {
  const email = emailSchema.safeParse(input.email);
  const password = registrationPasswordSchema.safeParse(input.password);
  const confirmation = z.string().safeParse(input.passwordConfirmation);
  const fieldErrors: Record<string, readonly FieldErrorCode[]> = {};

  if (!email.success) fieldErrors.email = ["EMAIL_INVALID"];
  if (!password.success) fieldErrors.password = ["PASSWORD_REQUIREMENTS"];
  if (
    !confirmation.success ||
    !password.success ||
    confirmation.data !== password.data
  ) {
    fieldErrors.passwordConfirmation = ["PASSWORD_MISMATCH"];
  }

  if (!email.success || !password.success || !confirmation.success) {
    return validationFailure(fieldErrors);
  }
  if (confirmation.data !== password.data)
    return validationFailure(fieldErrors);

  return {
    success: true,
    data: {
      email: email.data,
      password: password.data,
      passwordConfirmation: confirmation.data,
    },
  };
}

export function validatedInternalReturnPath(
  value: unknown,
  fallback = "/learn",
): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 2048 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/u.test(value)
  ) {
    return fallback;
  }

  try {
    const decodedPath = decodeURIComponent(value.split(/[?#]/u, 1)[0] ?? "");
    if (decodedPath.startsWith("//") || decodedPath.includes("\\")) {
      return fallback;
    }

    const url = new URL(value, "https://unimind.invalid");
    if (
      url.origin !== "https://unimind.invalid" ||
      !/^\/learn(?:\/|$)/u.test(url.pathname)
    ) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function validatedAuthCallbackPath(value: unknown): string {
  if (value === "/reset-password") return value;
  return validatedInternalReturnPath(value);
}

export function resolveAuthGate(
  state:
    | Readonly<{ hasVerifiedIdentity: false }>
    | Readonly<{
        hasVerifiedIdentity: true;
        emailVerified: boolean;
        accountStatus: AccountStatus;
        hasCurrentConsent: boolean;
      }>,
): AuthGate {
  if (!state.hasVerifiedIdentity) return "SIGN_IN";
  if (!state.emailVerified) return "VERIFY_EMAIL";
  if (state.accountStatus === "SUSPENDED") return "SUSPENDED";
  if (state.accountStatus === "DISABLED") return "DISABLED";
  if (!state.hasCurrentConsent) return "CONSENT_REQUIRED";
  if (state.accountStatus === "PENDING") return "ACCOUNT_PENDING";
  return "READY";
}

export function classifyAuthProviderError(
  error: ProviderErrorLike,
): PublicAuthError {
  if (error.status === 429 || error.code?.includes("rate_limit") === true) {
    return "RATE_LIMITED";
  }
  if (error.code === "email_not_confirmed") return "CHECK_EMAIL";
  if (error.code === "invalid_credentials") return "INVALID_CREDENTIALS";
  return "UNAVAILABLE";
}

export function classifyRecoveryLinkError(
  error: ProviderErrorLike,
): RecoveryLinkError {
  if (error.code === "otp_expired") return "EXPIRED_LINK";
  if (error.code === "flow_state_not_found" || error.code === "otp_used") {
    return "REPLAYED_LINK";
  }
  return "INVALID_LINK";
}
