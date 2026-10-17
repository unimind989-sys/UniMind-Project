import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import type { Locale } from "@/lib/demo/synthetic-fixtures.application";

/** What every study view receives from the unit workspace. */
export type ProductStudyProps = {
  screen: string;
  scope: WorkspaceScope;
  locale: Locale;
  base: string;
  scenario: string;
};
