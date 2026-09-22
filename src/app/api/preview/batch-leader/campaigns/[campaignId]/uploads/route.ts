import type { NextRequest } from "next/server";

import { handleCollectionUpload } from "@/app/api/batch-leader/upload-handler.server";
import { previewCollectionRepository } from "@/app/preview/batch-leader/preview-collection.server";

export async function POST(
  request: NextRequest,
  context: Readonly<{ params: Promise<{ campaignId: string }> }>,
) {
  const { campaignId } = await context.params;
  return handleCollectionUpload(
    request,
    campaignId,
    previewCollectionRepository,
  );
}
