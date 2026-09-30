"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { AuthShell } from "@/app/(auth)/_components/auth-shell";
import {
  AuthForm,
  type AuthFormMode,
  type AuthNotice,
} from "@/app/(auth)/_components/auth-form";
import {
  createAuthApplication,
  type AuthGateway,
  type AuthActionResult,
} from "@/lib/auth/auth-actions.application";
import { useProductServices, type DemoRole } from "./product-services";
import { ProductLink, Notice } from "./product-ui";
import type { Locale } from "./synthetic-fixtures";

export const syntheticPassword = "Synthetic-study-2026!";
const accounts: Record<string, DemoRole> = {
  "student@example.invalid": "student",
  "leader@example.invalid": "leader",
  "admin@example.invalid": "admin",
  "second-admin@example.invalid": "second-admin",
};
export const demoTerms = {
  id: "sample-current-terms",
  termsVersion: "sample-terms-v1",
  privacyVersion: "sample-privacy-v1",
  educationalBoundaryVersion: "sample-study-v1",
};
export function ProductAuth({
  mode,
  locale,
  fixture,
  email,
  token,
  next,
}: {
  mode: AuthFormMode;
  locale: Locale;
  fixture: string;
  email?: string | undefined;
  token?: string | undefined;
  next?: string | undefined;
}) {
  const { state, update } = useProductServices();
  const router = useRouter();
  const query = useSearchParams();
  const notice: AuthNotice | undefined =
    fixture === "suspended"
      ? "suspended"
      : fixture === "expired"
        ? "expired_link"
        : fixture === "replayed"
          ? "replayed_link"
          : undefined;
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const destination =
    state.returnPath ??
    (state.role === "leader"
      ? "/batch-leader"
      : state.role === "admin" || state.role === "second-admin"
        ? "/admin"
        : "/learn");
  const path = {
    login: "/login",
    register: "/register",
    verify: "/verify-email",
    consent: "/consent",
    forgot: "/forgot-password",
    reset: "/reset-password",
  }[mode];
  const go = (next: string) =>
    router.push(
      `${next}${next.includes("?") ? "&" : "?"}lang=${locale}` as Route,
    );

  useEffect(() => {
    if (
      mode === "verify" &&
      token === "sample-verification" &&
      !state.verificationUsed &&
      !["expired", "replayed"].includes(fixture)
    ) {
      update((current) => ({
        ...current,
        verified: true,
        account: "VERIFIED",
        role: current.role ?? "student",
        verificationUsed: true,
      }));
      router.replace(
        `${state.consent ? destination : "/consent"}?lang=${locale}` as Route,
      );
    }
  }, [
    mode,
    token,
    fixture,
    locale,
    router,
    update,
    state.verificationUsed,
    state.consent,
    destination,
  ]);

  async function action(
    _previous: AuthActionResult,
    data: FormData,
  ): Promise<AuthActionResult> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const rawEmail = String(data.get("email") ?? "")
      .toLowerCase()
      .trim();
    const role = accounts[rawEmail];
    const allowed =
      role !== undefined && data.get("password") === syntheticPassword;
    const result = (valid: boolean) => ({
      error: valid ? null : { code: "invalid_credentials" },
    });
    const gateway: AuthGateway = {
      signIn: async () => result(allowed),
      signUp: async () => result(allowed && role === "student"),
      resendVerification: async () => result(Boolean(role)),
      requestPasswordReset: async () => result(Boolean(role)),
      updatePassword: async (password) =>
        result(
          password === syntheticPassword &&
            (token === "sample-recovery" || state.recoveryToken) &&
            !state.recoveryUsed,
        ),
      signOut: async () => ({ error: null }),
    };
    const app = createAuthApplication(gateway, "https://synthetic.invalid");
    const input = {
      email: rawEmail,
      password: data.get("password"),
      passwordConfirmation: data.get("passwordConfirmation"),
      returnPath: destination,
    };
    if (["suspended", "expired", "replayed"].includes(fixture))
      return { status: "UNAVAILABLE", returnPath: destination };
    if (mode === "consent") {
      if (!state.role || !state.verified)
        return { status: "UNAVAILABLE", returnPath: "/login" };
      if (data.get("acceptance") !== "accepted")
        return {
          status: "INVALID_INPUT",
          returnPath: destination,
          fieldErrors: { acceptance: ["ACCEPTANCE_REQUIRED"] },
        };
      update((current) => ({
        ...current,
        consent: true,
        account: "SIGNED_IN",
        returnPath: null,
      }));
      go(destination);
      return { status: "SUCCESS", returnPath: destination };
    }
    const response =
      mode === "login"
        ? await app.login(input)
        : mode === "register"
          ? await app.register(input)
          : mode === "verify"
            ? await app.resendVerification(input)
            : mode === "forgot"
              ? await app.requestPasswordReset(input)
              : await app.updatePassword(input);
    if (response.status === "SUCCESS" && mode === "login") {
      const verified = fixture !== "unverified" && state.verified;
      const target =
        role === "leader"
          ? "/batch-leader"
          : role === "admin" || role === "second-admin"
            ? "/admin"
            : "/learn";
      const requested =
        next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\")
          ? new URL(next, "https://synthetic.invalid")
          : null;
      const returnPath =
        requested &&
        /^\/(learn(?:\/[a-z0-9/-]+)?|settings|admin(?:\/[a-z-]+)?|batch-leader(?:\/campaigns\/sample-campaign|\/invitation)?)$/u.test(
          requested.pathname,
        )
          ? `${requested.pathname}${requested.searchParams.has("fixture") ? `?fixture=${encodeURIComponent(requested.searchParams.get("fixture")!)}` : ""}`
          : target;
      update((current) => ({
        ...current,
        role: role!,
        verified,
        account: verified ? "SIGNED_IN" : "UNVERIFIED",
        consent: fixture === "outdated-consent" ? false : current.consent,
        returnPath,
      }));
      go(
        !verified
          ? "/verify-email"
          : state.consent && fixture !== "outdated-consent"
            ? returnPath
            : "/consent",
      );
    } else if (response.status === "CHECK_EMAIL") {
      if (mode === "register") {
        update((current) => ({
          ...current,
          role: "student",
          verified: false,
          account: "UNVERIFIED",
        }));
        go("/verify-email?status=check_email");
      }
    } else if (response.status === "SUCCESS" && mode === "reset") {
      update((current) => ({
        ...current,
        recoveryUsed: true,
        recoveryToken: false,
      }));
      go("/login?status=signed_out");
    }
    return response;
  }
  const blocked =
    ["suspended", "expired", "replayed"].includes(fixture) ||
    (mode === "reset" &&
      ((!state.recoveryToken && token !== "sample-recovery") ||
        state.recoveryUsed)) ||
    (mode === "verify" &&
      token === "sample-verification" &&
      state.verificationUsed);
  const languageHref = (language: string) => {
    const params = new URLSearchParams(query);
    params.set("lang", language);
    return `${path}?${params}`;
  };
  return (
    <AuthShell
      locale={locale}
      activeStep={mode === "verify" ? 1 : mode === "consent" ? 2 : 0}
      languageHref={{ en: languageHref("en"), ar: languageHref("ar") }}
    >
      {blocked ? (
        <>
          <Notice error>
            {t(
              "This account or link is unavailable. Request a fresh link or return to sign in.",
              "هذا الحساب أو الرابط غير متاح. اطلب رابطًا جديدًا أو ارجع للدخول.",
            )}
          </Notice>
          <ProductLink href="/forgot-password" locale={locale}>
            {t("Request a new link", "طلب رابط جديد")}
          </ProductLink>
        </>
      ) : (
        <AuthForm
          key={mode}
          mode={mode}
          locale={locale}
          returnPath={destination}
          currentTerms={demoTerms}
          notice={notice}
          actionOverride={action}
          initialEmail={
            email && accounts[email] ? email : "student@example.invalid"
          }
          initialPassword={syntheticPassword}
        />
      )}
    </AuthShell>
  );
}
