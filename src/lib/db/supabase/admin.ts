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

export type SyntheticAuthUserInput = Readonly<{
  email: string;
  password: string;
}>;

export type SyntheticAuthUser = Readonly<{
  userId: string;
  email: string;
}>;

export class InvalidSyntheticAuthUserError extends Error {
  constructor() {
    super("Synthetic Auth user input is invalid.");
    this.name = "InvalidSyntheticAuthUserError";
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
  readonly operation: "create-user" | "get-user" | "delete-user";
  readonly providerCode: string;
  readonly providerStatus: number | undefined;

  constructor(
    operation: "create-user" | "get-user" | "delete-user",
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

export async function createSyntheticAuthUser(
  input: SyntheticAuthUserInput,
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

  const { data, error } = await createAdminClient().auth.admin.createUser({
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
    throw new SupabaseAdminOperationError(
      "create-user",
      providerCode(error),
      providerStatus(error),
    );
  }

  return {
    userId: data.user.id,
    email: parsed.data.email,
  };
}

export async function deleteSyntheticAuthUser(userId: string): Promise<void> {
  const parsedUserId = userIdSchema.safeParse(userId);
  if (!parsedUserId.success) {
    throw new InvalidSyntheticAuthUserError();
  }

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

  const deletion = await admin.auth.admin.deleteUser(parsedUserId.data);
  if (deletion.error !== null) {
    throw new SupabaseAdminOperationError(
      "delete-user",
      providerCode(deletion.error),
      providerStatus(deletion.error),
    );
  }
}
