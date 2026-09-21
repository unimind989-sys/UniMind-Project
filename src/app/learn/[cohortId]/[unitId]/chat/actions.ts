"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { resolveLocale } from "@/lib/i18n/locale";
import { startWorkspaceChat } from "@/lib/workspace/workspace.application";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";
import { supabaseWorkspaceRepository } from "@/lib/workspace/workspace.supabase.server";

const inputSchema = z.object({
  cohortId: z.string().uuid(),
  unitId: z.string().uuid(),
  locale: z.enum(["en", "ar"]),
});

export async function startChatSession(formData: FormData) {
  const input = inputSchema.safeParse({
    cohortId: formData.get("cohortId"),
    unitId: formData.get("unitId"),
    locale: resolveLocale(formData.get("locale")?.toString()),
  });
  if (!input.success) redirect("/learn" as Route);
  const scope = await requireAuthorizedWorkspace(
    input.data.cohortId,
    input.data.unitId,
  );
  const session = await startWorkspaceChat(
    supabaseWorkspaceRepository,
    scope,
    input.data.locale,
  );
  redirect(
    `/learn/${scope.cohortId}/${scope.unitId}/chat?lang=${input.data.locale}&session=${session.id}` as Route,
  );
}
