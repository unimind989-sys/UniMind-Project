import type { CollectionRepository } from "@/lib/collection/collection.application";
import {
  CollectionBoundaryError,
  finalizeCollectionSubmission,
} from "@/lib/collection/collection.application";

export type CollectionActionState = Readonly<{
  status: "IDLE" | "SUCCESS" | "ERROR";
  requestedItemId?: string;
  clientIdempotencyKey?: string;
  submissionId?: string;
  replayed?: boolean;
  message?: "RIGHTS_REQUIRED" | "INVALID_SUBMISSION" | "UNAVAILABLE";
}>;

export const initialCollectionActionState: CollectionActionState = {
  status: "IDLE",
};

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function runCollectionFinalizeAction(
  repository: CollectionRepository,
  _previousState: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const requestedItemId = formString(formData, "requestedItemId");
  const clientIdempotencyKey = formString(formData, "clientIdempotencyKey");
  try {
    const result = await finalizeCollectionSubmission(repository, {
      campaignId: formString(formData, "campaignId"),
      requestedItemId,
      uploadId: formString(formData, "uploadId"),
      clientIdempotencyKey,
      sourceName: formString(formData, "sourceName"),
      sourceDescription: formString(formData, "sourceDescription"),
      declaredRights:
        formString(formData, "declaredRights") === "DECLARED"
          ? "DECLARED"
          : "UNKNOWN",
    });
    return {
      status: "SUCCESS",
      requestedItemId,
      clientIdempotencyKey,
      submissionId: result.id,
      replayed: result.replayed,
    };
  } catch (error) {
    if (error instanceof CollectionBoundaryError) {
      return {
        status: "ERROR",
        requestedItemId,
        clientIdempotencyKey,
        message:
          error.code === "RIGHTS_REQUIRED"
            ? "RIGHTS_REQUIRED"
            : error.code === "INVALID_SUBMISSION"
              ? "INVALID_SUBMISSION"
              : "UNAVAILABLE",
      };
    }
    return {
      status: "ERROR",
      requestedItemId,
      clientIdempotencyKey,
      message: "UNAVAILABLE",
    };
  }
}
