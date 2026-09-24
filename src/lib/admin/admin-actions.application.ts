import {
  AdminActionBoundaryError,
  adminActionRequestSchema,
  adminActionResultSchema,
  type AdminActionRequest,
  type AdminActionResult,
} from "./admin-actions.domain";

export interface AdminActionRepository {
  submit(actorId: string, request: AdminActionRequest): Promise<unknown>;
}

export { AdminActionBoundaryError } from "./admin-actions.domain";
export type {
  AdminActionCandidate,
  AdminActionCode,
} from "./admin-actions.domain";

export function parseAdminActionRequest(
  input: unknown,
): AdminActionRequest | null {
  const parsed = adminActionRequestSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

export async function runAdminAction(
  repository: AdminActionRepository,
  actorId: string,
  input: unknown,
): Promise<AdminActionResult> {
  if (actorId.length === 0) {
    throw new AdminActionBoundaryError("FORBIDDEN");
  }

  const request = adminActionRequestSchema.safeParse(input);
  if (!request.success) {
    throw new AdminActionBoundaryError("INVALID_REQUEST");
  }

  const result = adminActionResultSchema.safeParse(
    await repository.submit(actorId, request.data),
  );
  if (!result.success) {
    throw new AdminActionBoundaryError("UNAVAILABLE");
  }
  return result.data;
}
