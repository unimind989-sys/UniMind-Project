"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { Route } from "next";
import { AppShell } from "./app-shell";
import { ProductLink } from "./product-ui";
import { useProductRouter } from "./product-navigation";
import { resolveCollectionCorrection } from "@/lib/collection/collection-queue.application";
import {
  CollectionFlow,
  type CollectionUploadClient,
} from "@/app/batch-leader/_components/collection-flow";
import type { CollectionActionState } from "@/app/batch-leader/collection-actions";
import { useProductServices } from "./product-services";
import {
  isSyntheticFile,
  makeSyntheticFile,
  syntheticFiles,
} from "./synthetic-files";
import type { Locale } from "./synthetic-fixtures";
import { syntheticDemoTime } from "@/lib/demo/synthetic-clock.application";
import { useSyntheticNavigation } from "./product-navigation";

import {
  demoCampaignId,
  makeSyntheticCampaign,
  registerSyntheticCollectionReceipt,
  finalizeSyntheticCollectionSubmission,
  prepareSyntheticCollectionCorrections,
} from "./synthetic-campaigns";

export function ProductCollection({
  locale,
  fixture,
  campaignId = demoCampaignId,
}: {
  locale: Locale;
  fixture: string;
  campaignId?: string;
}) {
  const { state, update, collectionMemory } = useProductServices();
  const hosted = useSyntheticNavigation();
  const query = useSearchParams();
  const router = useProductRouter();
  const generation = collectionMemory.generation;
  const campaign = makeSyntheticCampaign(state, locale, campaignId)!;
  const latestState = useRef(state);
  useEffect(() => {
    latestState.current = state;
  }, [state]);
  useEffect(() => {
    if (
      hosted?.active ||
      !prepareSyntheticCollectionCorrections(state, campaignId, fixture).length
    )
      return;
    update((current) => ({
      ...current,
      submissions: [
        ...current.submissions,
        ...prepareSyntheticCollectionCorrections(current, campaignId, fixture),
      ],
    }));
  }, [state, campaignId, fixture, hosted?.active, update]);
  const requested = query.getAll("request");
  const previous = query.getAll("submission");
  const hasCorrection = query.has("request") || query.has("submission");
  const target =
    requested.length === 1 && previous.length === 1
      ? resolveCollectionCorrection(campaign, requested[0]!, previous[0]!)
      : null;
  const upload: CollectionUploadClient = async (
    file,
    itemId,
    key,
    progress,
    signal,
    correction,
  ) => {
    if (!(await isSyntheticFile(file)))
      throw new Error("Use supplied synthetic files.");
    for (const value of [25, 50, 75, 100]) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (signal.aborted || fixture === "offline")
        throw new Error("Sample interrupted.");
      progress(value);
    }
    const failure = (
      {
        checksum: "CHECKSUM_MISMATCH",
        duplicate: "DUPLICATE_FILE",
        oversize: "FILE_TOO_LARGE",
        rights: "RIGHTS_REJECTED",
      } as Record<string, string | undefined>
    )[fixture];
    if (failure) throw new Error(failure);
    if (collectionMemory.generation !== generation)
      throw new Error("Sample interrupted.");
    const spec = syntheticFiles[file.name as keyof typeof syntheticFiles];
    return registerSyntheticCollectionReceipt(
      latestState.current,
      collectionMemory,
      campaignId,
      itemId,
      key,
      spec.mime,
      file.size,
      correction,
    );
  };
  async function finalize(
    _previous: CollectionActionState,
    data: FormData,
  ): Promise<CollectionActionState> {
    if (collectionMemory.generation !== generation)
      return {
        status: "ERROR",
        message: "INVALID_SUBMISSION",
        requestedItemId: String(data.get("requestedItemId")),
        clientIdempotencyKey: String(data.get("clientIdempotencyKey")),
      };
    const { result, submission } = finalizeSyntheticCollectionSubmission(
      latestState.current,
      collectionMemory,
      campaignId,
      data,
    );
    if (submission)
      update((current) =>
        current.submissions.some((row) => row.id === submission.id)
          ? current
          : { ...current, submissions: [...current.submissions, submission] },
      );
    return result;
  }
  if (hasCorrection && !target)
    return (
      <AppShell
        locale={locale}
        role="leader"
        title={locale === "ar" ? "التصحيح غير متاح" : "Correction unavailable"}
      >
        <h1>
          {locale === "ar" ? "التصحيح غير متاح" : "Correction unavailable"}
        </h1>
        <p>
          {locale === "ar"
            ? "هذا الطلب أو الإرسال السابق لم يعد متاحًا للتصحيح. افتح الحملة للاطلاع على الطلبات الحالية."
            : "This request or earlier submission is no longer available for correction. Open the campaign to inspect its current requests."}
        </p>
        <ProductLink
          href={`/batch-leader/campaigns/${campaignId}`}
          locale={locale}
        >
          {locale === "ar" ? "فتح الحملة" : "Open campaign"}
        </ProductLink>
      </AppShell>
    );
  return (
    <CollectionFlow
      campaign={campaign}
      referenceTime={syntheticDemoTime.now}
      draft={collectionMemory.draft(campaignId)}
      locale={locale}
      dateReference={
        hosted?.active ? undefined : (
          <>
            {locale === "ar" ? "ساعة العرض التجريبي" : "Demo clock"}:{" "}
            <bdi>{syntheticDemoTime.clockLabel}</bdi>
            {locale === "ar"
              ? " · تُعرض المواعيد بتوقيت القاهرة."
              : " · Dates are shown in Cairo time."}
          </>
        )
      }
      homeHref="/batch-leader"
      uploadEndpoint="/api/unavailable"
      uploadClient={upload}
      allowFile={isSyntheticFile}
      finalizeAction={finalize}
      initialActionState={{ status: "IDLE" }}
      {...(target?.latestSubmission?.correction
        ? {
            correction: {
              requestedItemId: target.id,
              submissionId: target.latestSubmission.id,
              ...target.latestSubmission.correction,
            },
            onCorrectionPrepared: (href: Route) => router.replace(href),
          }
        : {})}
      initialClientKey="sample-initial"
      initialMetadata={{
        title: "Synthetic study source",
        description: "Invented source for the UniMind synthetic product flow.",
      }}
      reference={{
        name:
          locale === "ar"
            ? "مرجع الملزمة التجريبي المعتمد"
            : "Approved synthetic handout reference",
        file: () => makeSyntheticFile("synthetic-handout.pdf"),
      }}
    />
  );
}
