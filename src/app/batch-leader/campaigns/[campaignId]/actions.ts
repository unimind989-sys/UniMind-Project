"use server";

import { runCollectionFinalizeAction } from "../../collection-actions";
import type { CollectionActionState } from "@/lib/collection/collection-client-state.application";
import { supabaseCollectionRepository } from "@/lib/collection/collection.supabase.server";
import { hasReadyAccess } from "@/lib/auth/access-route.server";

export async function finalizeCollectionAction(
  previousState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  if (!(await hasReadyAccess())) {
    const field = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };
    return {
      status: "ERROR",
      requestedItemId: field("requestedItemId"),
      clientIdempotencyKey: field("clientIdempotencyKey"),
      message: "UNAVAILABLE",
    };
  }
  return runCollectionFinalizeAction(
    supabaseCollectionRepository,
    previousState,
    formData,
  );
}
