import "server-only";

import { getServerEnvironment } from "../config/env.server";
import { createServerSupabaseClient } from "../db/supabase/server";
import {
  createAuthApplication,
  type AuthGateway,
  type AuthProviderResult,
} from "./auth-actions.application";

type SupabaseAuthErrorLike = Readonly<{
  code?: string | undefined;
  status?: number | undefined;
}>;

function providerResult(
  error: SupabaseAuthErrorLike | null,
): AuthProviderResult {
  if (error === null) return { error: null };
  return {
    error: {
      code: error.code,
      status: error.status,
    },
  };
}

async function safelyRunAuthCall(
  call: () => Promise<{ error: SupabaseAuthErrorLike | null }>,
): Promise<AuthProviderResult> {
  try {
    const { error } = await call();
    return providerResult(error);
  } catch {
    return { error: {} };
  }
}

export function createSupabaseAuthGateway(): AuthGateway {
  return {
    async signIn(input) {
      const client = await createServerSupabaseClient();
      return safelyRunAuthCall(() => client.auth.signInWithPassword(input));
    },

    async signUp(input) {
      const client = await createServerSupabaseClient();
      return safelyRunAuthCall(() =>
        client.auth.signUp({
          email: input.email,
          password: input.password,
          options: { emailRedirectTo: input.emailRedirectTo },
        }),
      );
    },

    async resendVerification(input) {
      const client = await createServerSupabaseClient();
      return safelyRunAuthCall(() =>
        client.auth.resend({
          type: "signup",
          email: input.email,
          options: { emailRedirectTo: input.emailRedirectTo },
        }),
      );
    },

    async requestPasswordReset(input) {
      const client = await createServerSupabaseClient();
      return safelyRunAuthCall(() =>
        client.auth.resetPasswordForEmail(input.email, {
          redirectTo: input.redirectTo,
        }),
      );
    },

    async updatePassword(password) {
      const client = await createServerSupabaseClient();
      return safelyRunAuthCall(() => client.auth.updateUser({ password }));
    },

    async signOut() {
      const client = await createServerSupabaseClient();
      return safelyRunAuthCall(() => client.auth.signOut({ scope: "local" }));
    },
  };
}

export function getAuthApplication() {
  const environment = getServerEnvironment();
  return createAuthApplication(
    createSupabaseAuthGateway(),
    environment.APP_ORIGIN,
  );
}
