import "server-only";

import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { clientEnvironment } from "../../config/env.client";
import type { Database } from "../../../types/database.generated";

export class SupabaseResponseHeadersRequiredError extends Error {
  constructor() {
    super(
      "Supabase Auth cookie writes require a response-header propagation sink.",
    );
    this.name = "SupabaseResponseHeadersRequiredError";
  }
}

export type ServerSupabaseClientOptions = Readonly<{
  applyResponseHeaders?: (
    responseHeaders: Readonly<Record<string, string>>,
  ) => void;
}>;

export async function createServerSupabaseClient(
  options: ServerSupabaseClientOptions = {},
) {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    clientEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    clientEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, responseHeaders = {}) {
          if (
            Object.keys(responseHeaders).length > 0 &&
            options.applyResponseHeaders === undefined
          ) {
            throw new SupabaseResponseHeadersRequiredError();
          }

          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components expose a read-only cookie store.
            // Refresh writes for those renders must be handled by the request proxy.
            return;
          }

          options.applyResponseHeaders?.(responseHeaders);
        },
      },
    },
  );
}
