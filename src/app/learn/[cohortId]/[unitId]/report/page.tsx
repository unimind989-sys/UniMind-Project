import { RealStudyPage } from "@/app/learn/_components/real-study-page";
import type { WorkspacePageProps } from "@/lib/workspace/workspace-route.types";

export default function ReportPage(props: WorkspacePageProps) {
  return <RealStudyPage {...props} screen="report" />;
}
