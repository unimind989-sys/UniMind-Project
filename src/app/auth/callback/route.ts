import { NextRequest, NextResponse } from "next/server";

import {
  completeAuthCallback,
  type AuthCallbackGateway,
} from "@/lib/auth/auth-callback.application";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
import { accessDestination } from "@/lib/auth/auth-actions.application";
import { currentRoleHome } from "@/lib/account/account.supabase.server";
import { createServerSupabaseClient } from "@/lib/db/supabase/server";
import { getServerEnvironment } from "@/lib/config/env.server";

const privateHeaders = {
  "cache-control": "private, no-cache, no-store, must-revalidate, max-age=0",
  expires: "0",
  pragma: "no-cache",
} as const;

function publicLinkState(status: string): string {
  return status.toLowerCase();
}

function redirectResponse(
  destination: string,
  providerHeaders: Readonly<Record<string, string>>,
  canonicalOrigin: string,
) {
  const response = NextResponse.redirect(
    new URL(destination, canonicalOrigin),
    303,
  );
  for (const [name, value] of Object.entries({
    ...providerHeaders,
    ...privateHeaders,
  })) {
    response.headers.set(name, value);
  }
  return response;
}

export async function GET(request: NextRequest) {
  const canonicalOrigin = getServerEnvironment().APP_ORIGIN;
  let providerHeaders: Readonly<Record<string, string>> = {};
  const client = await createServerSupabaseClient({
    applyResponseHeaders(headers) {
      providerHeaders = { ...providerHeaders, ...headers };
    },
  });
  const gateway: AuthCallbackGateway = {
    async exchangeCode(code) {
      const { error } = await client.auth.exchangeCodeForSession(code);
      return { error };
    },
    async verifyOtp({ tokenHash, type }) {
      const { error } = await client.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      return { error };
    },
  };
  const parameters = request.nextUrl.searchParams;
  const next = parameters.get("next");
  // Email links carry the interface language chosen when they were sent.
  const requestedLocale = parameters.get("lang");
  const locale =
    requestedLocale === "ar" || requestedLocale === "en"
      ? requestedLocale
      : undefined;
  const withLocale = (path: string) => {
    if (locale === undefined) return path;
    const address = new URL(path, "https://unimind.invalid");
    address.searchParams.set("lang", locale);
    return address.pathname + address.search + address.hash;
  };

  let result: Awaited<ReturnType<typeof completeAuthCallback>>;
  try {
    result = await completeAuthCallback(gateway, {
      code: parameters.get("code"),
      tokenHash: parameters.get("token_hash"),
      type: parameters.get("type"),
      next,
    });
  } catch {
    result = {
      status: "INVALID_LINK",
      next: next === "/reset-password" ? "/reset-password" : "/learn",
    };
  }

  if (result.status !== "SUCCESS") {
    const recoveryPath =
      result.next === "/reset-password" ? "/forgot-password" : "/verify-email";
    return redirectResponse(
      withLocale(`${recoveryPath}?status=${publicLinkState(result.status)}`),
      providerHeaders,
      canonicalOrigin,
    );
  }
  if (result.next === "/reset-password") {
    return redirectResponse(
      withLocale("/reset-password"),
      providerHeaders,
      canonicalOrigin,
    );
  }

  let destination: string;
  try {
    const access = await getCurrentAuthAccess();
    if (access.gate === "READY")
      destination = ["/", "/learn"].includes(result.next)
        ? await currentRoleHome()
        : result.next;
    else
      destination =
        accessDestination(access.gate, { locale, next: result.next }) ??
        "/login?status=unavailable";
  } catch {
    destination = "/login?status=unavailable";
  }

  return redirectResponse(
    withLocale(destination),
    providerHeaders,
    canonicalOrigin,
  );
}
