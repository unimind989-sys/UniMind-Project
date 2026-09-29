import "server-only";

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { clientEnvironment } from "../config/env.client";
import type { Database } from "../../types/database.generated";
import { authResponseHeaders } from "./auth-response-headers.application";

export async function refreshSupabaseSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    clientEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    clientEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [name, value] of Object.entries(responseHeaders)) {
            response.headers.set(name, value);
          }
        },
      },
    },
  );

  await supabase.auth.getClaims();

  // Also cover first sign-in and logout: those cookie writes happen later in
  // Server Actions, after this proxy has already performed its refresh read.
  for (const [name, value] of Object.entries(authResponseHeaders)) {
    response.headers.set(name, value);
  }

  return response;
}
