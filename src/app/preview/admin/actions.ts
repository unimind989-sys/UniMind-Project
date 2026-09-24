"use server";

import type { AdminActionFormState } from "@/app/admin/actions";

const previewOutcomes: ReadonlyMap<string, AdminActionFormState> = new Map([
  ["a0000000-0000-4000-8000-000000000001", { status: "APPLIED" }],
  [
    "a0000000-0000-4000-8000-000000000002",
    { status: "PENDING_SECOND_CONFIRMATION" },
  ],
  [
    "a0000000-0000-4000-8000-000000000003",
    { status: "ERROR", code: "STALE_VERSION" },
  ],
  [
    "a0000000-0000-4000-8000-000000000004",
    { status: "ERROR", code: "UNAVAILABLE" },
  ],
] as const);

export async function submitSyntheticAdminAction(
  _previous: AdminActionFormState,
  formData: FormData,
): Promise<AdminActionFormState> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  const targetId = formData.get("targetId");
  if (typeof targetId !== "string") {
    return { status: "ERROR", code: "INVALID_REQUEST" };
  }
  return (
    previewOutcomes.get(targetId) ?? {
      status: "ERROR",
      code: "INVALID_REQUEST",
    }
  );
}
