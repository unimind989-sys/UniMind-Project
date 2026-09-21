"use server";

import type { Route } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { resolveLocale } from "@/lib/i18n/locale";
import {
  resolveWorkspace,
  startWorkspaceChat,
} from "@/lib/workspace/workspace.application";

import { previewWorkspaceRepository } from "../preview-workspace.server";

const inputSchema = z.object({
  cohortId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9-]+$/u),
  unitId: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z0-9-]+$/u),
  locale: z.enum(["en", "ar"]),
});

export async function startPreviewChatSession(formData: FormData) {
  const input = inputSchema.safeParse({
    cohortId: formData.get("cohortId"),
    unitId: formData.get("unitId"),
    locale: resolveLocale(formData.get("locale")?.toString()),
  });
  if (!input.success) notFound();
  const scope = await resolveWorkspace(
    previewWorkspaceRepository,
    input.data.cohortId,
    input.data.unitId,
  );
  if (scope === null) notFound();
  const session = await startWorkspaceChat(
    previewWorkspaceRepository,
    scope,
    input.data.locale,
  );
  redirect(
    `/preview/learn/${scope.cohortId}/${scope.unitId}/chat?lang=${input.data.locale}&session=${session.id}` as Route,
  );
}
