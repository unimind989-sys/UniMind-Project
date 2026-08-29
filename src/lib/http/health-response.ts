import type { RuntimeHealth } from "../health/runtime-health.application";

const noStoreHeaders = {
  "cache-control": "no-store, max-age=0",
  pragma: "no-cache",
} as const;

export function createHealthResponse(health: RuntimeHealth): Response {
  return Response.json(
    { status: health.status },
    {
      status: health.httpStatus,
      headers: noStoreHeaders,
    },
  );
}
