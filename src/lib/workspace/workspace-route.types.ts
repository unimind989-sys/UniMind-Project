import type { ReactNode } from "react";

type WorkspaceRouteParams = Readonly<{
  cohortId: string;
  unitId: string;
}>;

export type WorkspacePageProps = Readonly<{
  params: Promise<WorkspaceRouteParams>;
  searchParams: Promise<Record<string, string | readonly string[] | undefined>>;
}>;

export type WorkspaceLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<WorkspaceRouteParams>;
}>;
