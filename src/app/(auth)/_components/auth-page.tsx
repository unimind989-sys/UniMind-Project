import { AuthForm, type AuthFormMode, type AuthNotice } from "./auth-form";
import { AuthShell } from "./auth-shell";

import type { CurrentTerms } from "@/lib/auth/auth-access.application";
import { SignOutForm } from "./sign-out-form";
import { validatedInternalReturnPath } from "@/lib/auth/auth-actions.application";
import { resolveLocale, type Locale } from "@/lib/i18n/locale";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { accessDestination } from "@/lib/auth/auth-actions.application";
import { currentRoleHome } from "@/lib/account/account.supabase.server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { Route } from "next";
import {
  hasChosenLanguage,
  localeCookieName,
} from "@/lib/i18n/locale-preference.application";

type SearchParameters = Record<string, string | string[] | undefined>;

const notices = new Set<AuthNotice>([
  "suspended",
  "disabled",
  "expired_link",
  "replayed_link",
  "invalid_link",
  "signed_out",
  "check_email",
  "unavailable",
]);

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pagePath(mode: AuthFormMode): string {
  return {
    login: "/login",
    register: "/register",
    verify: "/verify-email",
    forgot: "/forgot-password",
    reset: "/reset-password",
    consent: "/consent",
  }[mode];
}

export function resolveAuthPageParameters(
  parameters: SearchParameters,
  rememberedLocale?: string | undefined,
) {
  const locale = resolveLocale(first(parameters.lang));
  const returnPath = validatedInternalReturnPath(first(parameters.next));
  const status = first(parameters.status);
  return {
    locale,
    /** This device chose its language; otherwise sign-in uses the account's. */
    localeExplicit: hasChosenLanguage(first(parameters.lang), rememberedLocale),
    returnPath,
    notice:
      status !== undefined && notices.has(status as AuthNotice)
        ? (status as AuthNotice)
        : undefined,
  };
}

function languageHref(
  mode: AuthFormMode,
  locale: Locale,
  returnPath: string,
  notice: AuthNotice | undefined,
): string {
  const query = new URLSearchParams({ lang: locale, next: returnPath });
  if (notice !== undefined) query.set("status", notice);
  return `${pagePath(mode)}?${query.toString()}`;
}

export async function AuthPage({
  mode,
  searchParams,
  currentTerms,
}: Readonly<{
  mode: AuthFormMode;
  searchParams: Promise<SearchParameters>;
  currentTerms?: CurrentTerms | null | undefined;
}>) {
  const { locale, localeExplicit, returnPath, notice } =
    resolveAuthPageParameters(
      await searchParams,
      (await cookies()).get(localeCookieName)?.value,
    );
  let destination: string | null = null;
  if (["login", "register", "verify"].includes(mode)) {
    try {
      const { gate } = await getCurrentAuthAccess();
      if (gate === "READY")
        destination = ["/", "/learn"].includes(returnPath)
          ? await currentRoleHome()
          : returnPath;
      // A signed-in caller who still owes a profile finishes it first.
      else if (gate === "PROFILE_REQUIRED")
        destination = accessDestination(gate, { locale, next: returnPath });
    } catch {
      /* The form retains its safe unavailable behavior. */
    }
  }
  if (destination) {
    const address = new URL(destination, "https://unimind.invalid");
    address.searchParams.set("lang", locale);
    redirect((address.pathname + address.search + address.hash) as Route);
  }
  const activeStep = {
    login: 0,
    register: 0,
    forgot: 0,
    reset: 0,
    verify: 1,
    consent: 2,
  }[mode] as 0 | 1 | 2;

  return (
    <AuthShell
      locale={locale}
      activeStep={activeStep}
      languageHref={{
        en: languageHref(mode, "en", returnPath, notice),
        ar: languageHref(mode, "ar", returnPath, notice),
      }}
    >
      <AuthForm
        mode={mode}
        locale={locale}
        returnPath={returnPath}
        notice={notice}
        currentTerms={currentTerms}
        localeExplicit={localeExplicit}
        secondaryAction={
          mode === "consent" ? (
            // A signed-in caller who does not accept can still leave.
            <SignOutForm locale={locale} />
          ) : undefined
        }
      />
    </AuthShell>
  );
}
