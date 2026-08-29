import { getServerEnvironment } from "@/lib/config/env.server";
import { assessReadiness } from "@/lib/health/runtime-health.application";
import { createHealthResponse } from "@/lib/http/health-response";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return createHealthResponse(assessReadiness(getServerEnvironment));
}
