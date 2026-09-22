import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionFlow } from "@/app/batch-leader/_components/collection-flow";
import { initialCollectionActionState } from "@/app/batch-leader/collection-actions";
import { resolveCollectionCampaign } from "@/lib/collection/collection.application";
import { resolveLocale } from "@/lib/i18n/locale";
import { previewCollectionRepository } from "../../preview-collection.server";

import { finalizePreviewCollectionAction } from "./actions";

export const metadata: Metadata = {
  title: "Synthetic collection desk | UniMind",
};

export default async function PreviewCollectionCampaignPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const [{ campaignId }, query] = await Promise.all([params, searchParams]);
  const localeValue = Array.isArray(query.lang) ? query.lang[0] : query.lang;
  const locale = resolveLocale(localeValue);
  if (query.state === "expired") notFound();
  const campaign = await resolveCollectionCampaign(
    previewCollectionRepository,
    campaignId,
  );
  if (campaign === null) notFound();
  return (
    <CollectionFlow
      campaign={campaign}
      locale={locale}
      uploadEndpoint={`/api/preview/batch-leader/campaigns/${campaign.id}/uploads`}
      finalizeAction={finalizePreviewCollectionAction}
      initialActionState={initialCollectionActionState}
      initialClientKey={crypto.randomUUID()}
      syntheticPreview
    />
  );
}
