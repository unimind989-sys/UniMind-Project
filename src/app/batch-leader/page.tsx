import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { supabaseCollectionRepository } from "@/lib/collection/collection.supabase.server";
import { getCollectionCopy } from "@/lib/i18n/collection-copy";
import { getTextDirection, resolveLocale } from "@/lib/i18n/locale";

export default async function BatchLeaderPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const query = await searchParams;
  const localeValue = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale = resolveLocale(localeValue);
  const text = getCollectionCopy(locale);
  let campaigns;
  try {
    campaigns = await supabaseCollectionRepository.listActiveCampaigns();
  } catch {
    redirect(`/login?lang=${locale}&next=%2Fbatch-leader`);
  }
  return (
    <main
      className="foundation-page"
      lang={locale}
      dir={getTextDirection(locale)}
    >
      <h1>{text.assignedCampaigns}</h1>
      {campaigns.length === 0 ? (
        <p>{text.noCampaigns}</p>
      ) : (
        <ul>
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <Link
                href={
                  `/batch-leader/campaigns/${campaign.id}?lang=${locale}` as Route
                }
              >
                {campaign.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
