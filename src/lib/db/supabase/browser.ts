import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

import { clientEnvironment } from "../../config/env.client";
import type { Database } from "../../../types/database.generated";

export function createBrowserSupabaseClient() {
  return createSupabaseBrowserClient<Database>(
    clientEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    clientEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
