import { LeaderHome } from "@/app/batch-leader/_components/leader-home";
import { resolveLocale } from "@/lib/i18n/locale";
import { previewCollectionRepository } from "./preview-collection.server";

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
      history={query.view === "history"}
      synthetic
      preview
    />
  );
}
