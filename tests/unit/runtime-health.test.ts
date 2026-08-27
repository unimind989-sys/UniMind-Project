import { describe, expect, it, vi } from "vitest";

import {
  assessReadiness,
  reportLiveness,
} from "../../src/lib/health/runtime-health.application";

describe("runtime health", () => {
  it("reports process liveness without invoking a dependency", () => {
    expect(reportLiveness()).toEqual({ status: "live", httpStatus: 200 });
  });

  it("reports readiness after configuration validation passes", () => {
    const validate = vi.fn(() => ({ PROVIDER_MODE: "mock" }));

    expect(assessReadiness(validate)).toEqual({
      status: "ready",
      httpStatus: 200,
    });
    expect(validate).toHaveBeenCalledOnce();
  });

  it("fails closed without returning validation error details", () => {
    const secretDetail = "DATABASE_URL=private-value";
    const result = assessReadiness(() => {
      throw new Error(secretDetail);
    });

    expect(result).toEqual({ status: "not_ready", httpStatus: 503 });
    expect(JSON.stringify(result)).not.toContain(secretDetail);
  });
});
