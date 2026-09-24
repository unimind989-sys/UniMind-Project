import "server-only";

import { createClient } from "@supabase/supabase-js";

import { requireVerifiedIdentity } from "../auth/verified-identity.server";
import { getServerEnvironment } from "../config/env.server";
import type { Database } from "../../types/database.generated";
import {
  AdminActionBoundaryError,
  adminActionResultSchema,
  resolveAdminActionCode,
  type AdminActionRequest,
} from "./admin-actions.domain";
import { runAdminAction } from "./admin-actions.application";
import {
  loadAdminActionQueue as readAdminActionQueue,
  type AdminReadinessRepository,
} from "./admin-readiness.application";
import type { AdminActionRepository } from "./admin-actions.application";

type RuntimeEnvironment = "local" | "ci" | "preview" | "production";

function getRuntimeEnvironment(): RuntimeEnvironment {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (process.env.NODE_ENV === "test") return "ci";
  return "local";
}

function createServiceClient() {
  const environment = getServerEnvironment();
  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}

function mapRpcError(error: Readonly<{ code?: string; message?: string }>) {
  const actionCode = error.message?.match(/^ADMIN_ACTION:([A-Z_]+)$/u)?.[1];
  if (actionCode !== undefined) {
    return new AdminActionBoundaryError(resolveAdminActionCode(actionCode));
  }
  if (error.code === "23505") {
    return new AdminActionBoundaryError("CONFLICT");
  }
  return new AdminActionBoundaryError("UNAVAILABLE");
}

async function verifiedActorId(expectedActorId?: string) {
  const identity = await requireVerifiedIdentity();
  if (expectedActorId !== undefined && identity.userId !== expectedActorId) {
    throw new AdminActionBoundaryError("FORBIDDEN");
  }
  return identity.userId;
}

const actionRepository: AdminActionRepository = {
  async submit(actorId, request: AdminActionRequest) {
    const verifiedUserId = await verifiedActorId(actorId);
    const client = createServiceClient();
    const { data, error } = await client.rpc("submit_admin_governance_action", {
      p_actor_id: verifiedUserId,
      p_action: request.action,
      p_target_id: request.targetId,
      p_expected_version: request.expectedVersion,
      p_expected_state: request.expectedState,
      p_reason: request.reason,
      p_correlation_id: request.correlationId,
      p_idempotency_key: request.idempotencyKey,
      p_pending_action_id: request.pendingActionId ?? null,
      p_hold_expires_at:
        request.action === "PLACE_RAW_HOLD" ? request.holdExpiresAt : null,
      p_review_attested:
        request.action === "PLACE_RAW_HOLD" && request.reviewAttested,
      p_runtime_environment: getRuntimeEnvironment(),
    });
    if (error !== null) throw mapRpcError(error);

    const result = adminActionResultSchema.safeParse(data);
    if (!result.success) {
      throw new AdminActionBoundaryError("UNAVAILABLE");
    }
    return result.data;
  },
};

const readinessRepository: AdminReadinessRepository = {
  async loadActionQueue(actorId) {
    const verifiedUserId = await verifiedActorId(actorId);
    const client = createServiceClient();
    const { data, error } = await client.rpc("current_admin_action_queue", {
      p_actor_id: verifiedUserId,
      p_runtime_environment: getRuntimeEnvironment(),
    });
    if (error !== null) throw mapRpcError(error);
    return data?.map((row) => ({
      candidateId: row.candidate_id,
      action: row.action,
      targetId: row.target_id,
      targetLabelEn: row.target_label_en,
      targetLabelAr: row.target_label_ar,
      currentState: row.current_state,
      proposedState: row.proposed_state,
      expectedState: row.expected_state,
      expectedVersion: row.expected_version,
      failedPredicates: row.failed_predicates,
      protected: row.protected,
      pendingActionId: row.pending_action_id,
      reason: row.reason,
      commandState: row.command_state,
      initiatorSlot: row.initiator_slot,
      correlationId: row.correlation_id,
    }));
  },
};

export async function submitVerifiedAdminAction(input: unknown) {
  const identity = await verifiedActorId();
  return runAdminAction(actionRepository, identity, input);
}

export async function loadVerifiedAdminActionQueue() {
  let identity: Awaited<ReturnType<typeof requireVerifiedIdentity>>;
  try {
    identity = await requireVerifiedIdentity();
  } catch {
    return { status: "FORBIDDEN" } as const;
  }
  return readAdminActionQueue(readinessRepository, identity.userId);
}
