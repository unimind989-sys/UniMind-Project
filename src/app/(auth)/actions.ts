"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import {
  validatedInternalReturnPath,
  type AuthActionResult,
} from "@/lib/auth/auth-actions.application";
import {
  getCurrentAuthAccess,
  acceptCurrentAuthConsent,
} from "@/lib/auth/auth-access.supabase.server";
import { getAuthApplication } from "@/lib/auth/supabase-auth.server";
import { resolveLocale } from "@/lib/i18n/locale";

export type AuthFormState = AuthActionResult;

function value(formData: FormData, name: string): FormDataEntryValue | null {
  return formData.get(name);
}

function authPath(
  path: string,
  localeValue: unknown,
  parameters: Readonly<Record<string, string>> = {},
): Route {
  const locale = resolveLocale(localeValue);
  const query = new URLSearchParams({ lang: locale, ...parameters });
  return `${path}?${query.toString()}` as Route;
}

function trustedRoute(path: string): Route {
  return path as Route;
}

async function redirectAfterAuthentication(
  returnPath: string,
  localeValue: unknown,
): Promise<AuthFormState | never> {
  let access: Awaited<ReturnType<typeof getCurrentAuthAccess>>;
  try {
    access = await getCurrentAuthAccess();
  } catch {
    return { status: "UNAVAILABLE", returnPath };
  }

  if (access.gate === "READY") redirect(trustedRoute(returnPath));
  if (access.gate === "CONSENT_REQUIRED") {
    redirect(authPath("/consent", localeValue, { next: returnPath }));
  }
  if (access.gate === "VERIFY_EMAIL") {
    redirect(authPath("/verify-email", localeValue, { next: returnPath }));
  }
  if (access.gate === "SUSPENDED" || access.gate === "DISABLED") {
    redirect(
      authPath("/login", localeValue, {
        status: access.gate.toLowerCase(),
      }),
    );
  }

  return { status: "UNAVAILABLE", returnPath };
}

export async function loginAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const application = getAuthApplication();
  const result = await application.login({
    email: value(formData, "email"),
    password: value(formData, "password"),
    returnPath: value(formData, "returnPath"),
  });
  if (result.status !== "SUCCESS") return result;

  return redirectAfterAuthentication(
    result.returnPath,
    value(formData, "locale"),
  );
}

export async function registerAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return getAuthApplication().register({
    email: value(formData, "email"),
    password: value(formData, "password"),
    passwordConfirmation: value(formData, "passwordConfirmation"),
    returnPath: value(formData, "returnPath"),
  });
}

export async function resendVerificationAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return getAuthApplication().resendVerification({
    email: value(formData, "email"),
    returnPath: value(formData, "returnPath"),
  });
}

export async function requestPasswordResetAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return getAuthApplication().requestPasswordReset({
    email: value(formData, "email"),
  });
}

export async function updatePasswordAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const result = await getAuthApplication().updatePassword({
    password: value(formData, "password"),
    passwordConfirmation: value(formData, "passwordConfirmation"),
  });
  if (result.status !== "SUCCESS") return result;
  return redirectAfterAuthentication(
    validatedInternalReturnPath(value(formData, "returnPath")),
    value(formData, "locale"),
  );
}

export async function acceptConsentAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  if (value(formData, "acceptance") !== "accepted") {
    return {
      status: "INVALID_INPUT",
      returnPath: "/learn",
      fieldErrors: { acceptance: ["ACCEPTANCE_REQUIRED"] },
    };
  }

  let access: Awaited<ReturnType<typeof acceptCurrentAuthConsent>>;
  try {
    access = await acceptCurrentAuthConsent();
  } catch {
    return { status: "UNAVAILABLE", returnPath: "/learn" };
  }
  if (access.gate === "READY") {
    redirect(
      trustedRoute(validatedInternalReturnPath(value(formData, "returnPath"))),
    );
  }
  if (access.gate === "SIGN_IN") {
    redirect(authPath("/login", value(formData, "locale")));
  }
  if (access.gate === "VERIFY_EMAIL") {
    redirect(
      authPath("/verify-email", value(formData, "locale"), {
        next: validatedInternalReturnPath(value(formData, "returnPath")),
      }),
    );
  }
  return { status: "UNAVAILABLE", returnPath: "/learn" };
}

export async function logoutAction(): Promise<void> {
  const result = await getAuthApplication().logout();
  const status = result.status === "SUCCESS" ? "signed_out" : "unavailable";
  redirect(`/login?status=${status}` as Route);
}
