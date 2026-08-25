export class SupabaseManagementApiError extends Error {
  constructor() {
    super("Supabase Management API response is missing a service-role key.");
    this.name = "SupabaseManagementApiError";
  }
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
