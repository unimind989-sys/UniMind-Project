"use server";

import { runCollectionFinalizeAction } from "../../collection-actions";
import type { CollectionActionState } from "@/lib/collection/collection-client-state.application";
import { supabaseCollectionRepository } from "@/lib/collection/collection.supabase.server";

export async function finalizeCollectionAction(
  previousState: CollectionActionState,
  formData: FormData,
) {
  return runCollectionFinalizeAction(
    supabaseCollectionRepository,
    previousState,
    formData,
  );
}
