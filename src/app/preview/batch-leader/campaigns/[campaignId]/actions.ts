"use server";

import {
  runCollectionFinalizeAction,
  type CollectionActionState,
} from "@/app/batch-leader/collection-actions";
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
