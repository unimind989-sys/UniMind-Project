import "server-only";

import { createServerSupabaseClient } from "../db/supabase/server";
import {
  acceptCurrentConsent,
  readAuthAccess,
  type AuthAccessRepository,
  type CurrentTerms,
} from "./auth-access.application";
import { isAccountStatus } from "./auth-flow.domain";
import { getVerifiedIdentity } from "./verified-identity.server";

export class AuthAccessDataError extends Error {
  readonly operation: "profile" | "terms" | "acceptance";

  constructor(operation: "profile" | "terms" | "acceptance") {
    super(`Auth access data operation failed: ${operation}.`);
    this.name = "AuthAccessDataError";
    this.operation = operation;
  }
}

export function createSupabaseAuthAccessRepository(): AuthAccessRepository {
  return {
    async getVerifiedUserId() {
      const identity = await getVerifiedIdentity();
      return identity?.userId ?? null;
    },

    async getAccountStatus(userId) {
      const client = await createServerSupabaseClient();
      const { data, error } = await client
        .from("profiles")
        .select("account_status")
        .eq("user_id", userId)
        .maybeSingle();

      if (error !== null) throw new AuthAccessDataError("profile");
      if (data === null) return null;
      if (!isAccountStatus(data.account_status)) {
        throw new AuthAccessDataError("profile");
      }
      return data.account_status;
    },

    async getCurrentTerms() {
      const client = await createServerSupabaseClient();
      const { data, error } = await client
        .from("terms_versions")
        .select(
          "id, terms_version, privacy_version, educational_boundary_version",
        )
        .order("effective_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error !== null) throw new AuthAccessDataError("terms");
      if (data === null) return null;
      return {
        id: data.id,
        termsVersion: data.terms_version,
        privacyVersion: data.privacy_version,
        educationalBoundaryVersion: data.educational_boundary_version,
      };
    },

    async hasAcceptedTerms(userId, termsVersionId) {
      const client = await createServerSupabaseClient();
      const { data, error } = await client
        .from("terms_acceptances")
        .select("id")
        .eq("user_id", userId)
        .eq("terms_version_id", termsVersionId)
        .maybeSingle();

      if (error !== null) throw new AuthAccessDataError("acceptance");
      return data !== null;
    },

    async acceptCurrentTerms(userId: string, terms: CurrentTerms) {
      const client = await createServerSupabaseClient();
      const { error } = await client.from("terms_acceptances").insert({
        user_id: userId,
        terms_version_id: terms.id,
        terms_version: terms.termsVersion,
        privacy_version: terms.privacyVersion,
        educational_boundary_version: terms.educationalBoundaryVersion,
      });

      if (error !== null && error.code !== "23505") {
        throw new AuthAccessDataError("acceptance");
      }
    },
  };
}

export function getCurrentAuthAccess() {
  return readAuthAccess(createSupabaseAuthAccessRepository());
}

export function acceptCurrentAuthConsent() {
  return acceptCurrentConsent(createSupabaseAuthAccessRepository());
}
