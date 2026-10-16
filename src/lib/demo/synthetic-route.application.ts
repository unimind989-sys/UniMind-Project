import {
  loadReviewScope,
  resourceNames,
  type Locale,
} from "./synthetic-fixtures.application";
import type { WorkspaceScope } from "@/lib/workspace/workspace.application";
import {
  additionalCampaignIds,
  demoCampaignId,
} from "./synthetic-campaigns.application";

/** The screen family that composes a synthetic route in the client runtime. */
export type SyntheticComposer =
  "home" | "auth" | "catalog" | "study" | "settings" | "admin" | "leader";

export type SyntheticPage = {
  composer: SyntheticComposer;
  screen: string;
  locale: Locale;
  fixture: string;
  scope?: WorkspaceScope;
  callbackToken?: string | undefined;
  campaignId?: string;
};

type Parameters = Readonly<Record<string, string>>;
type SyntheticRoute = Readonly<{
  pattern: string;
  composer: SyntheticComposer;
  screen: string | ((parameters: Parameters) => string);
  /** Rejects parameters the synthetic fixtures do not own (null = no route). */
  accept?: (
    parameters: Parameters,
  ) => Pick<SyntheticPage, "scope" | "campaignId"> | null;
}>;

const studyScope = ({ cohortId, unitId }: Parameters) => {
  const scope = loadReviewScope(cohortId!, unitId!);
  return scope ? { scope: { ...scope, sourceCount: 8 } } : null;
};
const study = (suffix: string, screen: string): SyntheticRoute => ({
  pattern: `/learn/:cohortId/:unitId${suffix}`,
  composer: "study",
  screen,
  accept: studyScope,
});

/**
 * The explicit synthetic route table: URL pattern → screen composer. Both the
 * hosted entry (real login) and the loopback demo resolve product URLs here;
 * a URL outside this table is not part of the synthetic product.
 */
export const syntheticRoutes: readonly SyntheticRoute[] = [
  { pattern: "/", composer: "home", screen: "home" },
  { pattern: "/home", composer: "home", screen: "home" },
  { pattern: "/login", composer: "auth", screen: "login" },
  { pattern: "/register", composer: "auth", screen: "register" },
  { pattern: "/verify-email", composer: "auth", screen: "verify-email" },
  { pattern: "/consent", composer: "auth", screen: "consent" },
  { pattern: "/forgot-password", composer: "auth", screen: "forgot-password" },
  { pattern: "/reset-password", composer: "auth", screen: "reset-password" },
  { pattern: "/learn", composer: "catalog", screen: "catalog" },
  { pattern: "/settings", composer: "settings", screen: "settings" },
  { pattern: "/admin", composer: "admin", screen: "decisions" },
  {
    pattern: "/admin/:resource",
    composer: "admin",
    screen: ({ resource }) => `admin-${resource}`,
    accept: ({ resource }) =>
      Object.hasOwn(resourceNames, resource!) ? {} : null,
  },
  { pattern: "/batch-leader", composer: "leader", screen: "campaign-list" },
  {
    pattern: "/batch-leader/invitation",
    composer: "leader",
    screen: "invitation",
  },
  {
    pattern: "/batch-leader/campaigns/:campaignId",
    composer: "leader",
    screen: "collection",
    accept: ({ campaignId }) =>
      [demoCampaignId, ...additionalCampaignIds].some((id) => id === campaignId)
        ? { campaignId: campaignId! }
        : null,
  },
  study("", "overview"),
  study("/chat", "chat"),
  study("/studio", "studio"),
  study("/quiz", "quiz"),
  study("/quiz/sample-attempt", "attempt"),
  study("/quiz/sample-attempt/review", "quiz-review"),
  study("/sources", "sources"),
  study("/evidence", "evidence"),
  study("/report", "report"),
];

function segments(path: string) {
  return path.replace(/^\//u, "").replace(/\/$/u, "").split("/");
}

function matchPattern(pattern: string, path: readonly string[]) {
  const expected = segments(pattern);
  if (expected.length !== path.length) return null;
  const parameters: Record<string, string> = {};
  for (const [index, part] of expected.entries()) {
    const actual = path[index]!;
    if (part.startsWith(":")) {
      if (!actual) return null;
      parameters[part.slice(1)] = actual;
    } else if (part !== actual) return null;
  }
  return parameters;
}

/** The loopback demo server renders product URLs through a rewrite; the
 * runtime always resolves the browser's product path. */
export function syntheticProductPath(pathname: string) {
  return pathname.replace(/^\/synthetic-runtime(?=\/|$)/u, "") || "/";
}

export function resolveSyntheticPage(
  pathname: string,
  query: URLSearchParams,
): SyntheticPage | null {
  const common = {
    locale: query.get("lang") === "ar" ? ("ar" as const) : ("en" as const),
    fixture: query.get("fixture") ?? "ready",
  };
  const path = segments(pathname);
  if (path.join("/") === "auth/callback") {
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
      composer: "auth",
      screen: recovery ? "reset-password" : "verify-email",
      fixture: token ? common.fixture : "expired",
      callbackToken: token,
    };
  }
  for (const route of syntheticRoutes) {
    const parameters = matchPattern(route.pattern, path);
    if (!parameters) continue;
    const accepted = route.accept ? route.accept(parameters) : {};
    if (!accepted) return null;
    return {
      ...common,
      ...accepted,
      composer: route.composer,
      screen:
        typeof route.screen === "string"
          ? route.screen
          : route.screen(parameters),
    };
  }
  return null;
}
