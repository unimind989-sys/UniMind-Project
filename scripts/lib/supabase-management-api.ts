export class SupabaseManagementApiError extends Error {
  constructor() {
    super("Supabase Management API response is missing a service-role key.");
    this.name = "SupabaseManagementApiError";
  }
}

export type SupabaseManagementCurlRequest = Readonly<{
  arguments: readonly string[];
  stdin: string;
}>;

export function createProjectApiKeysCurlRequest(
  projectRef: string,
  accessToken: string,
): SupabaseManagementCurlRequest {
  if (
    !/^[a-z]{20}$/u.test(projectRef) ||
    accessToken.length < 16 ||
    /[\r\n"\\]/u.test(accessToken)
  ) {
    throw new SupabaseManagementApiError();
  }

  const managementUrl =
    "https://api.supabase.com/v1/projects/" +
    encodeURIComponent(projectRef) +
    "/api-keys?reveal=true";

  return {
    arguments: ["-q", "--config", "-"],
    stdin: [
      `url = "${managementUrl}"`,
      `header = "Authorization: Bearer ${accessToken}"`,
      'header = "Accept: application/json"',
      "silent",
      "show-error",
      "fail-with-body",
    ].join("\n"),
  };
}

type ProjectApiKey = Readonly<{
  api_key?: unknown;
  id?: unknown;
  name?: unknown;
}>;

export function parseProjectServiceRoleKey(body: unknown): string {
  if (!Array.isArray(body)) {
    throw new SupabaseManagementApiError();
  }

  const serviceRole = (body as ProjectApiKey[]).find(
    (candidate) =>
      candidate.id === "service_role" || candidate.name === "service_role",
  );
  if (
    serviceRole === undefined ||
    typeof serviceRole.api_key !== "string" ||
    serviceRole.api_key.length < 16
  ) {
    throw new SupabaseManagementApiError();
  }

  return serviceRole.api_key;
}

export function parseProjectServiceRoleKeyJson(json: string): string {
  try {
    return parseProjectServiceRoleKey(JSON.parse(json));
  } catch {
    throw new SupabaseManagementApiError();
  }
}
