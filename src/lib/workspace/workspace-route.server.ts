import "server-only";

import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { getCurrentAuthAccess } from "../auth/auth-access.supabase.server";
import { resolveWorkspace, type WorkspaceScope } from "./workspace.application";
import { supabaseWorkspaceRepository } from "./workspace.supabase.server";

export const requireAuthorizedWorkspace = cache(
  async function requireAuthorizedWorkspace(
    cohortId: string,
    unitId: string,
  ): Promise<WorkspaceScope> {
    const nextPath = encodeURIComponent(`/learn/${cohortId}/${unitId}`);
    let access: Awaited<ReturnType<typeof getCurrentAuthAccess>>;
    try {
      access = await getCurrentAuthAccess();
    } catch {
      redirect(`/login?status=unavailable` as Route);
    }

    if (access.gate === "SIGN_IN") {
      redirect(`/login?next=${nextPath}` as Route);
    }
    if (access.gate === "CONSENT_REQUIRED") {
      redirect(`/consent?next=${nextPath}` as Route);
    }
    if (access.gate === "VERIFY_EMAIL") {
      redirect(`/verify-email?next=${nextPath}` as Route);
    }
    if (access.gate === "SUSPENDED" || access.gate === "DISABLED") {
      redirect(`/login?status=${access.gate.toLowerCase()}` as Route);
    }
    if (access.gate !== "READY") {
      redirect(`/login?status=unavailable` as Route);
    }

    const scope = await resolveWorkspace(
      supabaseWorkspaceRepository,
      cohortId,
      unitId,
    );
    if (scope === null) notFound();
    return scope;
  },
);
