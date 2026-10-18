import "server-only";

import { z } from "zod";

import { createServerSupabaseClient } from "../db/supabase/server";

const verifiedUserIdSchema = z.string().uuid();
const verifiedEmailSchema = z.string().max(320).pipe(z.email());

export type VerifiedIdentity = Readonly<{
  userId: string;
  /** Display only (Settings); never an authorization input. */
  email: string | null;
}>;

export class UnauthenticatedError extends Error {
  readonly code = "UNAUTHORIZED" as const;

  constructor() {
    super("Verified user identity is required.");
    this.name = "UnauthenticatedError";
  }
}

export async function getVerifiedIdentity(): Promise<VerifiedIdentity | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();
  const subject = verifiedUserIdSchema.safeParse(data?.claims.sub);

  if (error !== null || !subject.success) {
    return null;
  }

  const email = verifiedEmailSchema.safeParse(data?.claims.email);
  return {
    userId: subject.data,
    email: email.success ? email.data : null,
  };
}

export async function requireVerifiedIdentity(): Promise<VerifiedIdentity> {
  const identity = await getVerifiedIdentity();
  if (identity === null) {
    throw new UnauthenticatedError();
  }
  return identity;
}
