import "server-only";

import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { getServerEnvironment } from "../../config/env.server";
import type { Database } from "../../../types/database.generated";

const syntheticAuthMarker = "wp01-t05-synthetic-auth";
const syntheticEmailSchema = z
  .string()
  .email()
  .regex(/^[a-z0-9][a-z0-9._-]*@auth-fixture\.unimind\.invalid$/u);
const syntheticPasswordSchema = z.string().min(16).max(128);
const userIdSchema = z.string().uuid();
const databaseUuidSchema = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu);
const privilegedContextSchema = z.object({
  actorUserId: databaseUuidSchema,
  correlationId: databaseUuidSchema,
  reason: z.string().trim().min(1).max(500),
});

export type SyntheticAuthUserInput = Readonly<{
  email: string;
  password: string;
}>;

export type SyntheticAuthUser = Readonly<{
  userId: string;
  email: string;
}>;

export type PrivilegedAuthContext = Readonly<{
  actorUserId: string;
  correlationId: string;
  reason: string;
}>;

export class InvalidSyntheticAuthUserError extends Error {
  constructor() {
    super("Synthetic Auth user input is invalid.");
    this.name = "InvalidSyntheticAuthUserError";
  }
}

export class InvalidPrivilegedAuthContextError extends Error {
  constructor() {
    super("Privileged Auth context is invalid.");
    this.name = "InvalidPrivilegedAuthContextError";
  }
}

export class UnsafeSyntheticAuthDeletionError extends Error {
  constructor() {
    super(
      "Refusing to delete an Auth user without the synthetic fixture marker.",
    );
    this.name = "UnsafeSyntheticAuthDeletionError";
  }
}

export class SupabaseAdminOperationError extends Error {
  readonly operation:
    "audit-action" | "create-user" | "get-user" | "delete-user";
  readonly providerCode: string;
  readonly providerStatus: number | undefined;

  constructor(
    operation: "audit-action" | "create-user" | "get-user" | "delete-user",
    providerCode?: string,
    providerStatus?: number,
  ) {
    super(`Supabase admin operation failed: ${operation}.`);
    this.name = "SupabaseAdminOperationError";
    this.operation = operation;
    this.providerCode = providerCode ?? "unknown";
    this.providerStatus =
      Number.isInteger(providerStatus) &&
      providerStatus !== undefined &&
      providerStatus >= 400 &&
      providerStatus <= 599
        ? providerStatus
        : undefined;
  }
}

function createAdminClient() {
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

type ProviderErrorShape = Readonly<{
  code?: string | undefined;
  status?: number | undefined;
}>;

function providerCode(error: ProviderErrorShape | null): string | undefined {
  return error?.code;
}

function providerStatus(error: ProviderErrorShape | null): number | undefined {
  return error?.status;
}

function safeProviderCode(error: ProviderErrorShape | null): string {
  const code = providerCode(error);
  return code !== undefined && /^[a-z0-9_]{1,64}$/u.test(code)
    ? code
    : "unknown";
}

type AdminClient = ReturnType<typeof createAdminClient>;
type PrivilegedAuthAction = "CREATE_SYNTHETIC_USER" | "DELETE_SYNTHETIC_USER";
type PrivilegedAuthOutcome = "FAILED" | "STARTED" | "SUCCEEDED";

function parsePrivilegedContext(
  context: PrivilegedAuthContext,
): PrivilegedAuthContext {
  const parsed = privilegedContextSchema.safeParse(context);
  if (!parsed.success) {
    throw new InvalidPrivilegedAuthContextError();
  }
  return parsed.data;
}

async function recordPrivilegedAuthAction(
  client: AdminClient,
  context: PrivilegedAuthContext,
  action: PrivilegedAuthAction,
  outcome: PrivilegedAuthOutcome,
  targetUserId?: string,
  errorCode?: string,
): Promise<void> {
  const { data, error } = await client.rpc("record_privileged_auth_action", {
    p_action_name: action,
    p_action_outcome: outcome,
    p_actor_user_id: context.actorUserId,
    p_correlation_id: context.correlationId,
    p_reason: context.reason,
    ...(errorCode === undefined ? {} : { p_provider_error_code: errorCode }),
    ...(targetUserId === undefined ? {} : { p_target_user_id: targetUserId }),
  });
  if (error !== null || !userIdSchema.safeParse(data).success) {
    throw new SupabaseAdminOperationError(
      "audit-action",
      providerCode(error),
      providerStatus(error),
    );
  }
}

export async function createSyntheticAuthUser(
  input: SyntheticAuthUserInput,
  context: PrivilegedAuthContext,
): Promise<SyntheticAuthUser> {
  const parsed = z
    .object({
      email: syntheticEmailSchema,
      password: syntheticPasswordSchema,
    })
    .safeParse(input);
  if (!parsed.success) {
    throw new InvalidSyntheticAuthUserError();
  }

  const privilegedContext = parsePrivilegedContext(context);
  const admin = createAdminClient();
  await recordPrivilegedAuthAction(
    admin,
    privilegedContext,
    "CREATE_SYNTHETIC_USER",
    "STARTED",
  );
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: {
      unimind_fixture: syntheticAuthMarker,
    },
    user_metadata: {
      synthetic_fixture: true,
    },
  });
  if (error !== null || data.user === null) {
    await recordPrivilegedAuthAction(
      admin,
      privilegedContext,
      "CREATE_SYNTHETIC_USER",
      "FAILED",
      undefined,
      safeProviderCode(error),
    );
    throw new SupabaseAdminOperationError(
      "create-user",
      providerCode(error),
      providerStatus(error),
    );
  }

  try {
    await recordPrivilegedAuthAction(
      admin,
      privilegedContext,
      "CREATE_SYNTHETIC_USER",
      "SUCCEEDED",
      data.user.id,
    );
  } catch (error) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw error;
  }

  return {
    userId: data.user.id,
    email: parsed.data.email,
  };
}

export async function deleteSyntheticAuthUser(
  userId: string,
  context: PrivilegedAuthContext,
): Promise<void> {
  const parsedUserId = userIdSchema.safeParse(userId);
  if (!parsedUserId.success) {
    throw new InvalidSyntheticAuthUserError();
  }

  const privilegedContext = parsePrivilegedContext(context);
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(parsedUserId.data);
  if (error !== null || data.user === null) {
    throw new SupabaseAdminOperationError(
      "get-user",
      providerCode(error),
      providerStatus(error),
    );
  }

  const safeEmail = syntheticEmailSchema.safeParse(data.user.email);
  if (
    !safeEmail.success ||
    data.user.app_metadata.unimind_fixture !== syntheticAuthMarker
  ) {
    throw new UnsafeSyntheticAuthDeletionError();
  }

  await recordPrivilegedAuthAction(
    admin,
    privilegedContext,
    "DELETE_SYNTHETIC_USER",
    "STARTED",
    parsedUserId.data,
  );
  const deletion = await admin.auth.admin.deleteUser(parsedUserId.data);
  if (deletion.error !== null) {
    await recordPrivilegedAuthAction(
      admin,
      privilegedContext,
      "DELETE_SYNTHETIC_USER",
      "FAILED",
      parsedUserId.data,
      safeProviderCode(deletion.error),
    );
    throw new SupabaseAdminOperationError(
      "delete-user",
      providerCode(deletion.error),
      providerStatus(deletion.error),
    );
  }
  await recordPrivilegedAuthAction(
    admin,
    privilegedContext,
    "DELETE_SYNTHETIC_USER",
    "SUCCEEDED",
    parsedUserId.data,
  );
}
