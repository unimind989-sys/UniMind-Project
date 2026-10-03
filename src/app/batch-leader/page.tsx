import { redirect } from "next/navigation";

import { supabaseCollectionRepository } from "@/lib/collection/collection.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";
import { LeaderHome } from "./_components/leader-home";

export default async function BatchLeaderPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const query = await searchParams;
  const localeValue = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale = resolveLocale(localeValue);
  let campaigns;
  try {
    campaigns = await supabaseCollectionRepository.listActiveCampaigns();
  } catch {
    const next =
      query.view === "history" ? "/batch-leader?view=history" : "/batch-leader";
    redirect(`/login?lang=${locale}&next=${encodeURIComponent(next)}`);
  }
  return (
    <LeaderHome
      campaigns={campaigns}
      locale={locale}
      history={query.view === "history"}
    />
  );
}
