import { notFound, redirect } from "next/navigation";
import {
  parseCatalogSelectionHints,
  resolveCatalogJourney,
  serializeCatalogSelection,
} from "@/lib/catalog/catalog-journey.application";
import { ReviewCatalog } from "../_components/review-catalog";
import { ReviewScreen } from "../_components/review-screen";
import {
  resourceNames,
  reviewBase,
  reviewCatalogRows,
  loadReviewScope,
} from "../review-fixtures";

export default async function ReviewRoute({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ path }, query] = await Promise.all([params, searchParams]);
  const locale = query.lang === "ar" ? "ar" : "en";
  const joined = path.join("/");
  if (joined === "catalog") {
    const hints = parseCatalogSelectionHints(query);
    const journey = resolveCatalogJourney(reviewCatalogRows, hints);
    if (
      journey.correction !== null ||
      serializeCatalogSelection(hints) !== journey.canonicalQuery
    ) {
      const canonical = new URLSearchParams(journey.canonicalQuery);
      canonical.set("lang", locale);
      if (typeof query.state === "string") canonical.set("state", query.state);
      redirect(`${reviewBase}/catalog?${canonical.toString()}`);
    }
    return (
      <ReviewScreen screen="catalog">
        <ReviewCatalog locale={locale} selection={hints} />
      </ReviewScreen>
    );
  }
  if (path[0] === "catalog" && path[1] && path[2]) {
    const scope = loadReviewScope(path[1], path[2]);
    if (scope === null) notFound();
    const tail = path.slice(3).join("/");
    const screens: Record<string, string> = {
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
    const screen = screens[tail];
    if (screen === undefined) notFound();
    return <ReviewScreen screen={screen} scope={scope} />;
  }
  const access = [
    "login",
    "register",
    "verify-email",
    "consent",
    "forgot-password",
    "reset-password",
  ];
  if (
    path[0] === "access" &&
    path[1] &&
    access.includes(path[1]) &&
    path.length === 2
  )
    return <ReviewScreen screen={path[1]} />;
  if (joined === "settings") return <ReviewScreen screen="settings" />;
  if (joined === "batch-leader") return <ReviewScreen screen="campaign-list" />;
  if (joined === "batch-leader/invitation")
    return <ReviewScreen screen="invitation" />;
  if (joined === "batch-leader/campaigns/sample-campaign")
    return <ReviewScreen screen="collection" />;
  if (joined === "admin") return <ReviewScreen screen="decisions" />;
  if (
    path[0] === "admin" &&
    path.length === 2 &&
    path[1] &&
    Object.hasOwn(resourceNames, path[1])
  )
    return <ReviewScreen screen={`admin-${path[1]}`} />;
  notFound();
}
