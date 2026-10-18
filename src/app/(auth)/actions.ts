"use server";

import type { Route } from "next";
import { cookies } from "next/headers";
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
import { accessDestination } from "@/lib/auth/auth-actions.application";
import { resolveLocale } from "@/lib/i18n/locale";
import { localeCookieName } from "@/lib/i18n/locale-preference.application";
import {
  currentRoleHome,
  loadCurrentAccount,
} from "@/lib/account/account.supabase.server";

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

function reservedEmailDomain(email: FormDataEntryValue | null): boolean {
  return (
    typeof email === "string" &&
    /\.(?:invalid|test|example|localhost)\s*$/iu.test(email)
  );
}

function trustedRoute(path: string): Route {
  return path as Route;
}

async function redirectAfterAuthentication(
  returnPath: string,
  requestedLocale: unknown,
  preferAccountLanguage = false,
): Promise<AuthFormState | never> {
  let localeValue = requestedLocale;
  // On a new device the sign-in page has no language yet: use the account's.
  if (preferAccountLanguage)
    try {
      localeValue = (await loadCurrentAccount()).language ?? requestedLocale;
    } catch {
      /* Keep the page language when the account cannot be read. */
    }
  let access: Awaited<ReturnType<typeof getCurrentAuthAccess>>;
  try {
    access = await getCurrentAuthAccess();
  } catch {
    return { status: "UNAVAILABLE", returnPath };
  }

  if (access.gate === "READY") {
    let destination = returnPath;
    if (["/", "/learn"].includes(returnPath)) {
      try {
        destination = await currentRoleHome();
      } catch {
        return { status: "UNAVAILABLE", returnPath };
      }
    }
    const address = new URL(destination, "https://unimind.invalid");
    address.searchParams.set("lang", resolveLocale(localeValue));
    redirect(trustedRoute(address.pathname + address.search + address.hash));
  }
  if (
    access.gate === "CONSENT_REQUIRED" ||
    access.gate === "VERIFY_EMAIL" ||
    access.gate === "PROFILE_REQUIRED" ||
    access.gate === "SUSPENDED" ||
    access.gate === "DISABLED"
  ) {
    redirect(
      accessDestination(access.gate, {
        locale: resolveLocale(localeValue),
        next: returnPath,
      }) as Route,
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
    value(formData, "localeSource") === "default",
  );
}

export async function registerAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  // Reserved test domains (RFC 2606/6761) can never receive the verification
  // email; the published demo addresses use them, so refuse before Auth.
  if (reservedEmailDomain(value(formData, "email")))
    return {
      status: "INVALID_INPUT",
      returnPath: validatedInternalReturnPath(value(formData, "returnPath")),
      fieldErrors: { email: ["EMAIL_INVALID"] },
    };
  const result = await getAuthApplication().register({
    email: value(formData, "email"),
    password: value(formData, "password"),
    passwordConfirmation: value(formData, "passwordConfirmation"),
    returnPath: value(formData, "returnPath"),
    locale: value(formData, "locale"),
  });
  // The next step is the inbox: continue on the verification page, where a
  // resend lives, instead of staying on the registration form.
  if (result.status === "CHECK_EMAIL")
    redirect(
      authPath("/verify-email", value(formData, "locale"), {
        status: "check_email",
        next: result.returnPath,
      }),
    );
  return result;
}

export async function resendVerificationAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return getAuthApplication().resendVerification({
    email: value(formData, "email"),
    returnPath: value(formData, "returnPath"),
    locale: value(formData, "locale"),
  });
}

export async function requestPasswordResetAction(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  return getAuthApplication().requestPasswordReset({
    email: value(formData, "email"),
    locale: value(formData, "locale"),
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
  if (access.gate === "READY" || access.gate === "PROFILE_REQUIRED") {
    return redirectAfterAuthentication(
      validatedInternalReturnPath(value(formData, "returnPath")),
      value(formData, "locale"),
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
  // Sign-out keeps the remembered interface language.
  const locale = resolveLocale((await cookies()).get(localeCookieName)?.value);
  redirect(`/login?lang=${locale}&status=${status}` as Route);
}
