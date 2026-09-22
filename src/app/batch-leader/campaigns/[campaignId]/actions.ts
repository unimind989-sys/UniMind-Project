"use server";

import {
  runCollectionFinalizeAction,
  type CollectionActionState,
} from "../../collection-actions";
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
