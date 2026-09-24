import { z } from "zod";

export const adminActionNames = [
  "PUBLISH_UNIT",
  "HIDE_UNIT",
  "UNLOCK_COHORT",
  "LOCK_COHORT",
  "ACTIVATE_SOURCE",
  "DEACTIVATE_SOURCE",
  "QUARANTINE_SOURCE",
  "RETRY_SOURCE",
  "PLACE_RAW_HOLD",
  "REMOVE_RAW_HOLD",
  "ENABLE_FLAG",
  "DISABLE_FLAG",
] as const;

export type AdminActionName = (typeof adminActionNames)[number];

const uuid = z.string().uuid();
const sharedFields = {
  targetId: uuid,
  expectedVersion: z.number().int().min(0),
  reason: z.string().trim().min(8).max(500),
  correlationId: uuid,
  idempotencyKey: uuid,
  pendingActionId: uuid.optional(),
};

const actionSchemas = [
  z.object({
    ...sharedFields,
    action: z.literal("PUBLISH_UNIT"),
    expectedState: z.enum(["DRAFT", "WITHDRAWN"]),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("HIDE_UNIT"),
    expectedState: z.literal("PUBLISHED"),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("UNLOCK_COHORT"),
    expectedState: z.literal("LOCKED"),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("LOCK_COHORT"),
    expectedState: z.literal("UNLOCKED"),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("ACTIVATE_SOURCE"),
    expectedState: z.enum(["INACTIVE", "DEACTIVATED"]),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("DEACTIVATE_SOURCE"),
    expectedState: z.literal("ACTIVE"),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("QUARANTINE_SOURCE"),
    expectedState: z.enum(["FAILED", "NEEDS_REVIEW"]),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("RETRY_SOURCE"),
    expectedState: z.enum(["FAILED", "NEEDS_REVIEW", "QUARANTINED"]),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("PLACE_RAW_HOLD"),
    expectedState: z.literal("STORED"),
    holdExpiresAt: z.string().datetime({ offset: true }),
    reviewAttested: z.literal(true),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("REMOVE_RAW_HOLD"),
    expectedState: z.literal("HELD"),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("ENABLE_FLAG"),
    expectedState: z.literal("DISABLED"),
  }),
  z.object({
    ...sharedFields,
    action: z.literal("DISABLE_FLAG"),
    expectedState: z.literal("ENABLED"),
  }),
] as const;

export const adminActionRequestSchema = z.discriminatedUnion(
  "action",
  actionSchemas,
);

export type AdminActionRequest = z.infer<typeof adminActionRequestSchema>;

export const adminActionResultSchema = z.object({
  commandId: uuid,
  status: z.enum([
    "APPLIED",
    "PENDING_SECOND_CONFIRMATION",
    "PENDING_OWNER_REVIEW",
  ]),
  currentState: z.string().min(1).max(64),
  nextState: z.string().min(1).max(64),
  replayed: z.boolean(),
});

export type AdminActionResult = z.infer<typeof adminActionResultSchema>;

export const adminActionCodeSchema = z.enum([
  "FORBIDDEN",
  "INVALID_REQUEST",
  "STALE_VERSION",
  "STATE_CONFLICT",
  "READINESS_BLOCKED",
  "PRINCIPAL_UNVERIFIED",
  "DIFFERENT_FOUNDER_REQUIRED",
  "CONFIRMATION_EXPIRED",
  "RETRY_ALREADY_PENDING",
  "APPROVAL_GATE_CLOSED",
  "SAFETY_CHECK_FAILED",
  "CONFLICT",
  "UNAVAILABLE",
]);

export type AdminActionCode = z.infer<typeof adminActionCodeSchema>;

export type AdminActionCandidate = Readonly<{
  candidateId: string;
  action: AdminActionName;
  targetId: string;
  targetLabelEn: string;
  targetLabelAr: string;
  currentState: string;
  proposedState: string;
  expectedState: string;
  expectedVersion: number;
  failedPredicates: readonly string[];
  protected: boolean;
  pendingActionId: string | null;
  reason: string | null;
  commandState: string | null;
  initiatorSlot: "AHMED" | "ZIAD" | null;
  correlationId: string | null;
}>;

const adminActionCandidateSchema = z.object({
  candidateId: z.string().min(1).max(180),
  action: z.enum(adminActionNames),
  targetId: uuid,
  targetLabelEn: z.string().min(1).max(180),
  targetLabelAr: z.string().min(1).max(180),
  currentState: z.string().min(1).max(64),
  proposedState: z.string().min(1).max(64),
  expectedState: z.string().min(1).max(64),
  expectedVersion: z.number().int().min(0),
  failedPredicates: z.array(z.string().min(1).max(80)).max(12),
  protected: z.boolean(),
  pendingActionId: uuid.nullable(),
  reason: z.string().max(500).nullable(),
  commandState: z.string().max(40).nullable(),
  initiatorSlot: z.enum(["AHMED", "ZIAD"]).nullable(),
  correlationId: uuid.nullable(),
});

export function parseAdminActionCandidates(
  value: unknown,
): readonly AdminActionCandidate[] | null {
  const parsed = z
    .array(adminActionCandidateSchema)
    .max(2_000)
    .safeParse(value);
  return parsed.success ? parsed.data : null;
}

export class AdminActionBoundaryError extends Error {
  constructor(readonly code: AdminActionCode) {
    super("The admin action could not be completed.");
    this.name = "AdminActionBoundaryError";
  }
}

export function resolveAdminActionCode(value: unknown): AdminActionCode {
  const parsed = adminActionCodeSchema.safeParse(value);
  return parsed.success ? parsed.data : "UNAVAILABLE";
}
