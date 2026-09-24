import {
  AdminActionBoundaryError,
  parseAdminActionCandidates,
  type AdminActionCandidate,
} from "./admin-actions.domain";

export interface AdminReadinessRepository {
  loadActionQueue(actorId: string): Promise<unknown>;
}

export type AdminQueueState =
  | Readonly<{
      status: "READY";
      candidates: readonly AdminActionCandidate[];
    }>
  | Readonly<{ status: "FORBIDDEN" }>
  | Readonly<{ status: "UNAVAILABLE" }>;

const commandPriority = new Map([
  ["PENDING_SECOND_CONFIRMATION", 0],
  ["PENDING_OWNER_REVIEW", 1],
]);

export async function loadAdminActionQueue(
  repository: AdminReadinessRepository,
  actorId: string,
): Promise<AdminQueueState> {
  if (actorId.length === 0) return { status: "FORBIDDEN" };

  try {
    const candidates = parseAdminActionCandidates(
      await repository.loadActionQueue(actorId),
    );
    if (candidates === null) return { status: "UNAVAILABLE" };

    return {
      status: "READY",
      candidates: [...candidates].sort((left, right) => {
        const leftPriority = commandPriority.get(left.commandState ?? "") ?? 2;
        const rightPriority =
          commandPriority.get(right.commandState ?? "") ?? 2;
        return (
          leftPriority - rightPriority ||
          left.candidateId.localeCompare(right.candidateId)
        );
      }),
    };
  } catch (error) {
    if (
      error instanceof AdminActionBoundaryError &&
      error.code === "FORBIDDEN"
    ) {
      return { status: "FORBIDDEN" };
    }
    return { status: "UNAVAILABLE" };
  }
}
