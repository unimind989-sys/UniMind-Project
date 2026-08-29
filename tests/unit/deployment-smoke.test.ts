import { describe, expect, it } from "vitest";

import {
  DeploymentSmokeError,
  parseDeploymentSmokeCommand,
  runDeploymentSmoke,
} from "../../scripts/lib/deployment-smoke";

function passingFetch(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(input);
  const method = init?.method ?? "GET";

  if (method === "POST") {
    return Promise.resolve(new Response(null, { status: 405 }));
  }
  if (url.pathname === "/api/health/live") {
    return Promise.resolve(
      Response.json(
        { status: "live" },
        { headers: { "cache-control": "no-store" } },
      ),
    );
  }
  if (url.pathname === "/api/health/ready") {
    return Promise.resolve(
      Response.json(
        { status: "ready" },
        { headers: { "cache-control": "no-store" } },
      ),
    );
  }
  return Promise.resolve(
    new Response("<h1>UniMind</h1><p>Synthetic only</p><p>Mock only</p>"),
  );
}

describe("deployment smoke contract", () => {
  it("accepts only loopback local targets and remote HTTPS previews", () => {
    expect(
      parseDeploymentSmokeCommand([
        "--",
        "--base-url",
        "http://127.0.0.1:3100",
        "--target",
        "local",
      ]).baseUrl.href,
    ).toBe("http://127.0.0.1:3100/");
    expect(
      parseDeploymentSmokeCommand([
        "--base-url",
        "https://preview.unimind.invalid",
        "--target",
        "preview",
      ]).baseUrl.href,
    ).toBe("https://preview.unimind.invalid/");

    expect(() =>
      parseDeploymentSmokeCommand([
        "--base-url",
        "http://preview.unimind.invalid",
        "--target",
        "preview",
      ]),
    ).toThrow("PREVIEW_TARGET_REQUIRES_REMOTE_HTTPS");
    expect(() =>
      parseDeploymentSmokeCommand([
        "--base-url",
        "https://preview.unimind.invalid/path?token=private",
        "--target",
        "preview",
      ]),
    ).toThrow("UNSAFE_BASE_URL");
  });

  it("passes minimal health, write-denial, and mock-only checks", async () => {
    const command = parseDeploymentSmokeCommand([
      "--base-url",
      "https://preview.unimind.invalid",
      "--target",
      "preview",
    ]);

    await expect(runDeploymentSmoke(command, passingFetch)).resolves.toEqual({
      target: "preview",
      checks: [
        "live-response",
        "live-write-denied",
        "ready-response",
        "ready-write-denied",
        "application-response",
        "synthetic-mock-only",
      ],
    });
  });

  it("rejects an unhealthy or real-provider preview without body leakage", async () => {
    const command = parseDeploymentSmokeCommand([
      "--base-url",
      "https://preview.unimind.invalid",
      "--target",
      "preview",
    ]);
    const unhealthyFetch = async (
      input: string | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const url = new URL(input);
      if (url.pathname === "/api/health/ready" && init?.method === "GET") {
        return new Response("DATABASE_URL=private-value", { status: 503 });
      }
      return passingFetch(input, init);
    };

    await expect(runDeploymentSmoke(command, unhealthyFetch)).rejects.toEqual(
      expect.objectContaining<Partial<DeploymentSmokeError>>({
        code: "READY_UNHEALTHY",
      }),
    );
    await expect(
      runDeploymentSmoke(command, unhealthyFetch),
    ).rejects.not.toThrow("private-value");

    const realModeFetch = async (
      input: string | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      const url = new URL(input);
      if (url.pathname === "/") {
        return new Response(
          "<h1>UniMind</h1><p>Synthetic only</p><p>Approved real mode</p>",
        );
      }
      return passingFetch(input, init);
    };
    await expect(runDeploymentSmoke(command, realModeFetch)).rejects.toThrow(
      "NON_SYNTHETIC_RUNTIME",
    );
  });
});
