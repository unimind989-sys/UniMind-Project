import type { NextRequest } from "next/server";

import { handleCollectionUpload } from "../../../upload-handler.server";
import { supabaseCollectionRepository } from "@/lib/collection/collection.supabase.server";

export async function POST(
  request: NextRequest,
  context: Readonly<{ params: Promise<{ campaignId: string }> }>,
) {
  const { campaignId } = await context.params;
  return handleCollectionUpload(
    request,
    campaignId,
    supabaseCollectionRepository,
  );
}
