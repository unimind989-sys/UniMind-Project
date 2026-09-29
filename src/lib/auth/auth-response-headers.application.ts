export const authResponseHeaders = {
  "cache-control": "private, no-cache, no-store, must-revalidate, max-age=0",
  expires: "0",
  pragma: "no-cache",
} as const;

/** Server Actions cannot set arbitrary response headers. The request proxy
 * installs these policies before actions execute; reject any provider header
 * that that response policy does not already cover. */
export function assertAuthHeadersCoveredByProxy(
  headers: Readonly<Record<string, string>>,
): void {
  for (const [name, value] of Object.entries(headers)) {
    const key = name.toLowerCase();
    if (
      !Object.hasOwn(authResponseHeaders, key) ||
      authResponseHeaders[key as keyof typeof authResponseHeaders] !== value
    ) {
      throw new Error("Unsupported Auth response header.");
    }
  }
}
