import { NextResponse, type NextRequest } from "next/server";

import { handleCollectionUpload } from "../../../upload-handler.server";
import { hasReadyAccess } from "@/lib/auth/access-route.server";
import { supabaseCollectionRepository } from "@/lib/collection/collection.supabase.server";

export async function POST(
  request: NextRequest,
  context: Readonly<{ params: Promise<{ campaignId: string }> }>,
) {
  // The account gate (verification, consent, suspension, profile) applies
  // before the campaign assignment checked by the handler and the database.
  if (!(await hasReadyAccess()))
    return NextResponse.json(
      { error: "UPLOAD_REJECTED" },
      { status: 403, headers: { "cache-control": "no-store" } },
    );
  const { campaignId } = await context.params;
  return handleCollectionUpload(
    request,
    campaignId,
    supabaseCollectionRepository,
  );
}
