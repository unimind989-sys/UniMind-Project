import type { ReactNode } from "react";

import { resolveLocale } from "@/lib/i18n/locale";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import { requireAuthorizedWorkspace } from "@/lib/workspace/workspace-route.server";
import type { WorkspacePageProps } from "@/lib/workspace/workspace-route.types";

import { ProductStudy } from "./product-study";

export type RealStudyScreen =
  "overview" | "chat" | "studio" | "quiz" | "sources" | "evidence" | "report";

/**
 * One real study route: authorize the scope on the server, then render the
 * shared study screen. `wrap` lets a route add its own live data provider.
 */
export async function RealStudyPage({
  params,
  searchParams,
  screen,
  wrap,
}: WorkspacePageProps & {
  screen: RealStudyScreen;
  wrap?: (
    content: ReactNode,
    context: Readonly<{
      scope: WorkspaceScope;
      query: Awaited<WorkspacePageProps["searchParams"]>;
    }>,
  ) => Promise<ReactNode>;
}) {
  const [{ cohortId, unitId }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const scope = await requireAuthorizedWorkspace(cohortId, unitId);
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  const content = (
    <ProductStudy
      screen={screen}
      scope={scope}
      locale={locale}
      base={`/learn/${scope.cohortId}/${scope.unitId}`}
      scenario="ready"
    />
  );
  return wrap ? wrap(content, { scope, query }) : content;
}
