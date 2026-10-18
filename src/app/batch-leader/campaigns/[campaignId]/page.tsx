import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionFlow } from "../../_components/collection-flow";
import { initialCollectionActionState } from "../../collection-actions";
import { resolveCollectionCampaign } from "@/lib/collection/collection.application";
import { requireReadyAccess } from "@/lib/auth/access-route.server";
import { supabaseCollectionRepository } from "@/lib/collection/collection.supabase.server";
import { resolveLocale } from "@/lib/i18n/locale";

import { finalizeCollectionAction } from "./actions";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const query = await searchParams;
  const locale = resolveLocale(
    Array.isArray(query.lang) ? query.lang[0] : query.lang,
  );
  return {
    title: `${locale === "ar" ? "استلام المصادر" : "Source intake"} · UniMind`,
    description: "Campaign-scoped source submission for UniMind Batch Leaders.",
  };
}

export default async function CollectionCampaignPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const [{ campaignId }, query] = await Promise.all([params, searchParams]);
  const localeValue = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale = resolveLocale(localeValue);
  await requireReadyAccess({
    locale,
    next: `/batch-leader/campaigns/${campaignId}`,
  });
  let campaign;
  try {
    campaign = await resolveCollectionCampaign(
      supabaseCollectionRepository,
      campaignId,
    );
  } catch {
    notFound();
  }
  if (campaign === null) notFound();

  return (
    <CollectionFlow
      campaign={campaign}
      locale={locale}
      uploadEndpoint={`/api/batch-leader/campaigns/${campaign.id}/uploads`}
      finalizeAction={finalizeCollectionAction}
      initialActionState={initialCollectionActionState}
      initialClientKey={crypto.randomUUID()}
    />
  );
}
