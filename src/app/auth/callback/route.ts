import { NextRequest, NextResponse } from "next/server";

import {
  completeAuthCallback,
  type AuthCallbackGateway,
} from "@/lib/auth/auth-callback.application";
import { getCurrentAuthAccess } from "@/lib/auth/auth-access.supabase.server";
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
      `${recoveryPath}?status=${publicLinkState(result.status)}`,
      providerHeaders,
      canonicalOrigin,
    );
  }
  if (result.next === "/reset-password") {
    return redirectResponse(
      "/reset-password",
      providerHeaders,
      canonicalOrigin,
    );
  }

  let destination: string;
  try {
    const access = await getCurrentAuthAccess();
    if (access.gate === "READY") destination = result.next;
    else if (access.gate === "CONSENT_REQUIRED") {
      destination = `/consent?next=${encodeURIComponent(result.next)}`;
    } else if (access.gate === "VERIFY_EMAIL") {
      destination = `/verify-email?next=${encodeURIComponent(result.next)}`;
    } else if (access.gate === "SUSPENDED" || access.gate === "DISABLED") {
      destination = `/login?status=${access.gate.toLowerCase()}`;
    } else destination = "/login?status=unavailable";
  } catch {
    destination = "/login?status=unavailable";
  }

  return redirectResponse(destination, providerHeaders, canonicalOrigin);
}
