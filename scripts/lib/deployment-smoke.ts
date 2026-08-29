export type DeploymentSmokeTarget = "local" | "preview";

export type DeploymentSmokeCommand = Readonly<{
  baseUrl: URL;
  target: DeploymentSmokeTarget;
}>;

export type DeploymentSmokeResult = Readonly<{
  target: DeploymentSmokeTarget;
  checks: readonly string[];
}>;

type SmokeFetch = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

export class DeploymentSmokeError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(`Deployment smoke failed: ${code}`);
    this.name = "DeploymentSmokeError";
    this.code = code;
  }
}

function isLocalHostname(hostname: string): boolean {
  return ["127.0.0.1", "::1", "localhost"].includes(hostname);
}

function parseBaseUrl(value: string, target: DeploymentSmokeTarget): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new DeploymentSmokeError("INVALID_BASE_URL");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== "" ||
    !["", "/"].includes(url.pathname)
  ) {
    throw new DeploymentSmokeError("UNSAFE_BASE_URL");
  }

  if (target === "local" && !isLocalHostname(url.hostname)) {
    throw new DeploymentSmokeError("LOCAL_TARGET_REQUIRES_LOOPBACK");
  }
  if (
    target === "preview" &&
    (url.protocol !== "https:" || isLocalHostname(url.hostname))
  ) {
    throw new DeploymentSmokeError("PREVIEW_TARGET_REQUIRES_REMOTE_HTTPS");
  }

  url.pathname = "/";
  return url;
}

export function parseDeploymentSmokeCommand(
  arguments_: readonly string[],
): DeploymentSmokeCommand {
  let baseUrlValue: string | undefined;
  let target: DeploymentSmokeTarget | undefined;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    const value = arguments_[index + 1];

    if (argument === "--") {
      continue;
    }

    if (argument === "--base-url" && value !== undefined) {
      baseUrlValue = value;
      index += 1;
      continue;
    }
    if (argument === "--target" && (value === "local" || value === "preview")) {
      target = value;
      index += 1;
      continue;
    }
    throw new DeploymentSmokeError("INVALID_ARGUMENTS");
  }

  if (baseUrlValue === undefined || target === undefined) {
    throw new DeploymentSmokeError("MISSING_ARGUMENTS");
  }

  return {
    baseUrl: parseBaseUrl(baseUrlValue, target),
    target,
  };
}

async function request(
  fetcher: SmokeFetch,
  baseUrl: URL,
  path: string,
  method: "GET" | "POST",
): Promise<Response> {
  const url = new URL(path, baseUrl);
  try {
    return await fetcher(url, {
      method,
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new DeploymentSmokeError("REQUEST_FAILED");
  }
}

async function assertHealthRoute(
  fetcher: SmokeFetch,
  baseUrl: URL,
  path: string,
  expectedStatus: "live" | "ready",
): Promise<readonly string[]> {
  const response = await request(fetcher, baseUrl, path, "GET");
  if (response.status !== 200) {
    throw new DeploymentSmokeError(`${expectedStatus.toUpperCase()}_UNHEALTHY`);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new DeploymentSmokeError(
      `${expectedStatus.toUpperCase()}_INVALID_BODY`,
    );
  }
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    Object.keys(body).length !== 1 ||
    !("status" in body) ||
    body.status !== expectedStatus
  ) {
    throw new DeploymentSmokeError(
      `${expectedStatus.toUpperCase()}_INVALID_BODY`,
    );
  }
  if (!response.headers.get("cache-control")?.includes("no-store")) {
    throw new DeploymentSmokeError(
      `${expectedStatus.toUpperCase()}_CACHE_UNSAFE`,
    );
  }

  const forbiddenWrite = await request(fetcher, baseUrl, path, "POST");
  if (forbiddenWrite.status !== 405) {
    throw new DeploymentSmokeError(
      `${expectedStatus.toUpperCase()}_WRITE_ALLOWED`,
    );
  }

  return [`${expectedStatus}-response`, `${expectedStatus}-write-denied`];
}

export async function runDeploymentSmoke(
  command: DeploymentSmokeCommand,
  fetcher: SmokeFetch = fetch,
): Promise<DeploymentSmokeResult> {
  const checks = [
    ...(await assertHealthRoute(
      fetcher,
      command.baseUrl,
      "/api/health/live",
      "live",
    )),
    ...(await assertHealthRoute(
      fetcher,
      command.baseUrl,
      "/api/health/ready",
      "ready",
    )),
  ];

  const home = await request(fetcher, command.baseUrl, "/", "GET");
  if (home.status !== 200) {
    throw new DeploymentSmokeError("APPLICATION_UNAVAILABLE");
  }
  const html = await home.text();
  if (!html.includes("UniMind")) {
    throw new DeploymentSmokeError("APPLICATION_IDENTITY_MISSING");
  }
  if (
    !html.includes("Synthetic only") ||
    !html.includes("Mock only") ||
    html.includes("Approved real mode")
  ) {
    throw new DeploymentSmokeError("NON_SYNTHETIC_RUNTIME");
  }
  checks.push("application-response", "synthetic-mock-only");

  return { target: command.target, checks };
}
