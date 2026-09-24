"use server";

import {
  AdminActionBoundaryError,
  parseAdminActionRequest,
  type AdminActionCode,
} from "@/lib/admin/admin-actions.application";
import { submitVerifiedAdminAction } from "@/lib/admin/admin-actions.supabase.server";

export type AdminActionFormState = Readonly<{
  status:
    | "IDLE"
    | "APPLIED"
    | "PENDING_SECOND_CONFIRMATION"
    | "PENDING_OWNER_REVIEW"
    | "ERROR";
  code?: AdminActionCode;
}>;

function formString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function parseActionForm(formData: FormData) {
  const action = formString(formData, "action");
  const versionText = formString(formData, "expectedVersion");
  if (!/^(0|[1-9][0-9]*)$/u.test(versionText)) return null;
  const expectedVersion = Number(versionText);
  const request = {
    action,
    targetId: formString(formData, "targetId"),
    expectedVersion,
    expectedState: formString(formData, "expectedState"),
    reason: formString(formData, "reason"),
    correlationId: formString(formData, "correlationId"),
    idempotencyKey: formString(formData, "idempotencyKey"),
    ...(formString(formData, "pendingActionId") === ""
      ? {}
      : { pendingActionId: formString(formData, "pendingActionId") }),
    ...(action === "PLACE_RAW_HOLD"
      ? {
          holdExpiresAt: formString(formData, "holdExpiresAt"),
          reviewAttested: formString(formData, "reviewAttested") === "true",
        }
      : {}),
  };
  return parseAdminActionRequest(request);
}

export async function submitAdminAction(
  _previousState: AdminActionFormState,
  formData: FormData,
): Promise<AdminActionFormState> {
  const request = parseActionForm(formData);
  if (request === null) return { status: "ERROR", code: "INVALID_REQUEST" };

  try {
    const result = await submitVerifiedAdminAction(request);
    return { status: result.status };
  } catch (error) {
    return {
      status: "ERROR",
      code:
        error instanceof AdminActionBoundaryError ? error.code : "UNAVAILABLE",
    };
  }
}
