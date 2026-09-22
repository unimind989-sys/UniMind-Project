import "server-only";

import { NextResponse } from "next/server";

import {
  CollectionBoundaryError,
  MAX_COLLECTION_UPLOAD_BODY_BYTES,
  type CollectionRepository,
} from "@/lib/collection/collection.application";
import { prepareSyntheticCollectionUpload } from "@/lib/collection/collection-upload.server";

function safeUploadStatus(error: unknown) {
  if (!(error instanceof CollectionBoundaryError)) return 400;
  if (
    error.code === "CAMPAIGN_UNAVAILABLE" ||
    error.code === "ITEM_UNAVAILABLE"
  ) {
    return 403;
  }
  if (error.code === "UPLOAD_FAILED") return 503;
  return 400;
}

export async function handleCollectionUpload(
  request: Request,
  campaignId: string,
  repository: CollectionRepository,
) {
  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (
      Number.isFinite(contentLength) &&
      contentLength > MAX_COLLECTION_UPLOAD_BODY_BYTES
    ) {
      return NextResponse.json({ error: "UPLOAD_REJECTED" }, { status: 413 });
    }
    if ((await repository.loadCampaign(campaignId)) === null) {
      return NextResponse.json({ error: "UPLOAD_REJECTED" }, { status: 403 });
    }
    const formData = await request.formData();
    const requestedItemId = formData.get("requestedItemId");
    const clientIdempotencyKey = formData.get("clientIdempotencyKey");
    const file = formData.get("file");
    if (
      typeof requestedItemId !== "string" ||
      typeof clientIdempotencyKey !== "string" ||
      !(file instanceof File)
    ) {
      return NextResponse.json({ error: "UPLOAD_REJECTED" }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const receipt = await prepareSyntheticCollectionUpload(repository, {
      campaignId,
      requestedItemId,
      clientIdempotencyKey,
      fileName: file.name,
      clientMimeType: file.type,
      bytes,
      correlationId: crypto.randomUUID(),
      signal: request.signal,
    });
    return NextResponse.json(receipt, {
      status: 201,
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "UPLOAD_REJECTED" },
      {
        status: safeUploadStatus(error),
        headers: { "cache-control": "no-store" },
      },
    );
  }
}
