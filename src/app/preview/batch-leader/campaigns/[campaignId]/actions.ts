"use server";

import { runCollectionFinalizeAction } from "@/app/batch-leader/collection-actions";
import type { CollectionActionState } from "@/lib/collection/collection-client-state.application";
import { previewCollectionRepository } from "../../preview-collection.server";

export async function finalizePreviewCollectionAction(
  previousState: CollectionActionState,
  formData: FormData,
) {
  return runCollectionFinalizeAction(
    previewCollectionRepository,
    previousState,
    formData,
  );
}
