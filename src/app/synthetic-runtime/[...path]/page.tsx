import { notFound } from "next/navigation";
import { ProductNativePage } from "@/app/_components/product-native-page";
import {
  loadReviewScope,
  resourceNames,
} from "@/app/_components/synthetic-fixtures";
import { resolveDemoRuntime } from "@/lib/demo/demo-runtime.application";

export default async function SyntheticProductRoute({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (resolveDemoRuntime(process.env) !== "ENABLED") notFound();
  const [{ path }, query] = await Promise.all([params, searchParams]);
  const joined = path.join("/");
  const locale = query.lang === "ar" ? "ar" : "en";
  const fixture = typeof query.fixture === "string" ? query.fixture : "ready";
  if (joined === "auth/callback") {
    const recovery = query.next === "/reset-password";
    const code = query.code ?? query.token_hash;
    const token =
      code === "sample-verification" && !recovery
        ? "sample-verification"
        : code === "sample-recovery" && recovery
          ? "sample-recovery"
          : undefined;
    return (
      <ProductNativePage
        screen={recovery ? "reset-password" : "verify-email"}
        locale={locale}
        fixture={token ? fixture : "expired"}
        callbackToken={token}
      />
    );
  }
  const screens: Record<string, string> = {
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
  if (screens[joined])
    return (
      <ProductNativePage
        key={joined + fixture}
        screen={screens[joined]}
        locale={locale}
        fixture={fixture}
      />
    );
  if (
    path[0] === "admin" &&
    path.length === 2 &&
    path[1] &&
    Object.hasOwn(resourceNames, path[1])
  )
    return (
      <ProductNativePage
        key={joined + fixture}
        screen={`admin-${path[1]}`}
        locale={locale}
        fixture={fixture}
      />
    );
  if (path[0] === "learn" && path[1] && path[2]) {
    const scope = loadReviewScope(path[1], path[2]);
    const pages: Record<string, string> = {
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
    const screen = pages[path.slice(3).join("/")];
    if (!scope || !screen) notFound();
    // The pool is exactly the eight invented source rows rendered by the UI.
    return (
      <ProductNativePage
        key={joined + fixture}
        scope={{ ...scope, sourceCount: 8 }}
        screen={screen}
        locale={locale}
        fixture={fixture}
      />
    );
  }
  notFound();
}
