"use client";
import { useRef } from "react";
import {
  CollectionFlow,
  type CollectionUploadClient,
} from "@/app/batch-leader/_components/collection-flow";
import type { CollectionCampaign } from "@/lib/collection/collection.application";
import type { CollectionActionState } from "@/app/batch-leader/collection-actions";
import { useProductServices } from "./product-services";
import {
  isSyntheticFile,
  makeSyntheticFile,
  syntheticFiles,
} from "./synthetic-files";
import type { Locale } from "./synthetic-fixtures";
import type { ProductState } from "./product-services";

export const demoCampaignId = "sample-campaign";
export function makeDemoCampaign(
  state: ProductState,
  locale: Locale,
): CollectionCampaign {
  const types = ["DOCUMENT", "AUDIO", "IMAGE"] as const;
  const statuses = [
    "PROCESSING",
    "NEEDS_INFORMATION",
    "ACCEPTED",
    "REJECTED",
    "COMPLETED",
  ] as const;
  return {
    id: demoCampaignId,
    name:
      locale === "ar"
        ? "حملة مصادر التشريح التجريبية"
        : "Synthetic Anatomy source call",
    cohortName:
      locale === "ar"
        ? "الطب البشري · السنة الأولى · الفصل الأول"
        : "Human Medicine · Year 1 · Term 1",
    opensAt: "2026-09-01T00:00:00Z",
    closesAt: "2026-10-12T20:00:00Z",
    assignmentExpiresAt: "2026-10-10T20:00:00Z",
    requestedItems: [
      ...types.map((type, index) => {
        const latest = state.submissions
          .filter((submission) => submission.format === type)
          .at(-1);
        return {
          id: `sample-item-${index + 1}`,
          unitId: `sample-unit-${index + 1}`,
          title:
            locale === "ar"
              ? ["ملزمة التشريح", "تسجيل تشريح", "رسم تشريح"][index]!
              : ["Anatomy handout", "Anatomy recording", "Anatomy diagram"][
                  index
                ]!,
          unitTitleEn: "Anatomy",
          unitTitleAr: "التشريح",
          expectedType: type,
          required: true,
          status: latest ? ("RECEIVED" as const) : ("REQUESTED" as const),
          latestSubmission: latest
            ? {
                id: String(latest.id),
                sourceName: "Synthetic study source",
                status: latest.status as "RECEIVED",
                createdAt: "2026-09-30T10:00:00Z",
              }
            : null,
        };
      }),
      ...statuses.map((status, index) => ({
        id: `sample-history-${index}`,
        unitId: "sample-unit-1",
        title:
          locale === "ar"
            ? `مثال متابعة ${index + 1}`
            : `Tracking example ${index + 1}`,
        unitTitleEn: "Anatomy",
        unitTitleAr: "التشريح",
        expectedType: "DOCUMENT" as const,
        required: false,
        status: "RECEIVED" as const,
        latestSubmission: {
          id: `history-${index}`,
          sourceName: "Synthetic historical source",
          status,
          createdAt: "2026-09-20T10:00:00Z",
        },
      })),
    ],
  };
}

export function ProductCollection({
  locale,
  fixture,
}: {
  locale: Locale;
  fixture: string;
}) {
  const { state, update } = useProductServices();
  const receipts = useRef(new Map<string, { itemId: string; key: string }>());
  const finalized = useRef(new Map<string, string>());
  const sequence = useRef(state.submissions.length);
  const campaign = makeDemoCampaign(state, locale);
  const types = ["DOCUMENT", "AUDIO", "IMAGE"] as const;
  const upload: CollectionUploadClient = async (
    file,
    itemId,
    key,
    progress,
    signal,
  ) => {
    if (!(await isSyntheticFile(file)))
      throw new Error("Use supplied synthetic files.");
    for (const value of [25, 50, 75, 100]) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (signal.aborted || fixture === "offline")
        throw new Error("Sample interrupted.");
      progress(value);
    }
    if (["checksum", "duplicate", "oversize", "rights"].includes(fixture))
      throw new Error("VALIDATION_REJECTED");
    const uploadId = `sample-upload-${key}`;
    receipts.current.set(uploadId, { itemId, key });
    return {
      uploadId,
      checksum: "invented-checksum",
      mimeType: syntheticFiles[file.name as keyof typeof syntheticFiles].mime,
      byteSize: file.size,
    };
  };
  async function finalize(
    _previous: CollectionActionState,
    data: FormData,
  ): Promise<CollectionActionState> {
    const requestedItemId = String(data.get("requestedItemId"));
    const clientIdempotencyKey = String(data.get("clientIdempotencyKey"));
    const replay = finalized.current.get(
      `${requestedItemId}:${clientIdempotencyKey}`,
    );
    if (replay)
      return {
        status: "SUCCESS",
        submissionId: replay,
        requestedItemId,
        clientIdempotencyKey,
      };
    const receipt = receipts.current.get(String(data.get("uploadId")));
    if (
      !receipt ||
      receipt.itemId !== requestedItemId ||
      receipt.key !== clientIdempotencyKey ||
      data.get("sourceName") !== "Synthetic study source" ||
      data.get("sourceDescription") !==
        "Invented source for the UniMind synthetic product flow."
    )
      return {
        status: "ERROR",
        message: "INVALID_SUBMISSION",
        requestedItemId,
        clientIdempotencyKey,
      };
    if (data.get("declaredRights") !== "DECLARED")
      return {
        status: "ERROR",
        message: "RIGHTS_REQUIRED",
        requestedItemId,
        clientIdempotencyKey,
      };
    const id = ++sequence.current;
    update((current) => ({
      ...current,
      submissions: [
        ...current.submissions,
        {
          id,
          format: types[Number(requestedItemId.at(-1)) - 1]!,
          status: "RECEIVED",
        },
      ],
    }));
    receipts.current.delete(String(data.get("uploadId")));
    finalized.current.set(
      `${requestedItemId}:${clientIdempotencyKey}`,
      String(id),
    );
    return {
      status: "SUCCESS",
      submissionId: String(id),
      requestedItemId,
      clientIdempotencyKey,
    };
  }
  return (
    <CollectionFlow
      campaign={campaign}
      locale={locale}
      homeHref="/batch-leader"
      uploadEndpoint="/api/unavailable"
      uploadClient={upload}
      allowFile={isSyntheticFile}
      finalizeAction={finalize}
      initialActionState={{ status: "IDLE" }}
      initialClientKey="sample-initial"
      initialMetadata={{
        title: "Synthetic study source",
        description: "Invented source for the UniMind synthetic product flow.",
      }}
      reference={{
        name: "Synthetic approved handout reference · no storage URL",
        file: () => makeSyntheticFile("synthetic-handout.pdf"),
      }}
    />
  );
}
