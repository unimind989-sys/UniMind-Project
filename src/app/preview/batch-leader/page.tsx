import { LeaderHome } from "@/app/batch-leader/_components/leader-home";
import type { Metadata } from "next";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import { resolveLocale } from "@/lib/i18n/locale";
import { previewCollectionRepository } from "./preview-collection.server";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = await searchParams;
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  const title =
    query.view === "history"
      ? locale === "ar"
        ? "آخر الإرسالات"
        : "Latest submissions"
      : locale === "ar"
        ? "استلام المصادر"
        : "Source intake";
  return { title: `${title} · UniMind` };
}

export default async function PreviewLeaderHome({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const campaigns = await previewCollectionRepository.listActiveCampaigns();
  return (
    <LeaderHome
      locale={resolveLocale(
        Array.isArray(query.lang) ? query.lang[0] : query.lang,
      )}
      campaigns={query.state === "empty" ? [] : campaigns}
      referenceTime={syntheticDemoTime.now}
      history={query.view === "history"}
      synthetic
      preview
    />
  );
}
