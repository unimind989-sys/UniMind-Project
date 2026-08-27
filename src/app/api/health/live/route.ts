import { reportLiveness } from "@/lib/health/runtime-health.application";
import { createHealthResponse } from "@/lib/http/health-response";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return createHealthResponse(reportLiveness());
}
