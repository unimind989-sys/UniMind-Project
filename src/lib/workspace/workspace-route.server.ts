import "server-only";

import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { getCurrentAuthAccess } from "../auth/auth-access.supabase.server";
import { accessDestination } from "../auth/auth-flow.domain";
import { resolveWorkspace, type WorkspaceScope } from "./workspace.application";
import { supabaseWorkspaceRepository } from "./workspace.supabase.server";

export const requireAuthorizedWorkspace = cache(
  async function requireAuthorizedWorkspace(
    cohortId: string,
    unitId: string,
  ): Promise<WorkspaceScope> {
    let gate: Awaited<ReturnType<typeof getCurrentAuthAccess>>["gate"];
    try {
      gate = (await getCurrentAuthAccess()).gate;
    } catch {
      gate = "UNAVAILABLE";
    }
    const destination = accessDestination(gate, {
      next: `/learn/${cohortId}/${unitId}`,
    });
    if (destination !== null) redirect(destination as Route);

    const scope = await resolveWorkspace(
      supabaseWorkspaceRepository,
      cohortId,
      unitId,
    );
    if (scope === null) notFound();
    return scope;
  },
);
