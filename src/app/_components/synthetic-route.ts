import {
  loadReviewScope,
  resourceNames,
  type Locale,
} from "./synthetic-fixtures";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";

type SyntheticPage = {
  screen: string;
  locale: Locale;
  fixture: string;
  scope?: WorkspaceScope;
  callbackToken?: string | undefined;
};
const screens: Readonly<Record<string, string>> = {
  "": "home",
  home: "home",
  login: "login",
  register: "register",
  "verify-email": "verify-email",
  consent: "consent",
  "forgot-password": "forgot-password",
  "reset-password": "reset-password",
  learn: "catalog",
  settings: "settings",
  admin: "decisions",
  "batch-leader": "campaign-list",
  "batch-leader/invitation": "invitation",
  "batch-leader/campaigns/sample-campaign": "collection",
};
const studyPages: Readonly<Record<string, string>> = {
  "": "overview",
  chat: "chat",
  studio: "studio",
  quiz: "quiz",
  "quiz/sample-attempt": "attempt",
  "quiz/sample-attempt/review": "quiz-review",
  sources: "sources",
  evidence: "evidence",
  report: "report",
};

export function resolveSyntheticPage(
  pathname: string,
  query: URLSearchParams,
): SyntheticPage | null {
  const joined = pathname.replace(/^\//u, "").replace(/\/$/u, "");
  const path = joined.split("/");
  const common = {
    locale: query.get("lang") === "ar" ? ("ar" as const) : ("en" as const),
    fixture: query.get("fixture") ?? "ready",
  };
  if (joined === "auth/callback") {
    const recovery = query.get("next") === "/reset-password";
    const code = query.get("code") ?? query.get("token_hash");
    const token =
      code === "sample-verification" && !recovery
        ? "sample-verification"
        : code === "sample-recovery" && recovery
          ? "sample-recovery"
          : undefined;
    return {
      ...common,
      screen: recovery ? "reset-password" : "verify-email",
      fixture: token ? common.fixture : "expired",
      callbackToken: token,
    };
  }
  if (Object.hasOwn(screens, joined))
    return { ...common, screen: screens[joined]! };
  if (
    path[0] === "admin" &&
    path.length === 2 &&
    path[1] &&
    Object.hasOwn(resourceNames, path[1])
  )
    return { ...common, screen: `admin-${path[1]}` };
  if (path[0] === "learn" && path[1] && path[2]) {
    const scope = loadReviewScope(path[1], path[2]);
    const suffix = path.slice(3).join("/");
    if (scope && Object.hasOwn(studyPages, suffix))
      return {
        ...common,
        screen: studyPages[suffix]!,
        scope: { ...scope, sourceCount: 8 },
      };
  }
  return null;
}
