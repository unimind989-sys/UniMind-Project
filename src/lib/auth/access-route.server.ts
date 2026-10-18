import "server-only";

import type { Route } from "next";
import { redirect } from "next/navigation";

import type { Locale } from "../i18n/locale";
import type { AuthAccessSnapshot } from "./auth-access.application";
import { getCurrentAuthAccess } from "./auth-access.supabase.server";
import { accessDestination } from "./auth-flow.domain";

/**
 * The account gate for every authenticated page: redirects to the page that
 * resolves the caller's gate (sign-in, verification, consent, profile) and
 * returns the snapshot only when the caller is READY. Pages still authorize
 * their own data through RLS and their own seams.
 */
export async function requireReadyAccess(
  options: Readonly<{ locale: Locale; next: string }>,
): Promise<AuthAccessSnapshot> {
  let access: AuthAccessSnapshot;
  try {
    access = await getCurrentAuthAccess();
  } catch {
    access = { gate: "UNAVAILABLE", currentTerms: null };
  }
  const destination = accessDestination(access.gate, options);
  if (destination !== null) redirect(destination as Route);
  return access;
}

/** The same gate for Route Handlers and Server Actions, which must not redirect. */
export async function hasReadyAccess(): Promise<boolean> {
  try {
    return (await getCurrentAuthAccess()).gate === "READY";
  } catch {
    return false;
  }
}
