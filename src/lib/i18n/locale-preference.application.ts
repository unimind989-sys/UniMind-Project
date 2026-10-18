import { isSupportedLocale, type Locale } from "./locale";

/** Remembers the interface language between visits; functional, HttpOnly. */
export const localeCookieName = "unimind-locale";
export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;

export type LocaleRequest = Readonly<{
  method: string;
  pathname: string;
  search: string;
  cookie: string | undefined;
  /** A top-level page load, not an RSC fetch, prefetch, API call or asset. */
  document: boolean;
}>;

export type LocaleDecision = Readonly<{
  /** Same page with the remembered language added, or null. */
  redirectTo: string | null;
  /** The language to remember after this response, or null. */
  remember: Locale | null;
}>;

const unchanged: LocaleDecision = { redirectTo: null, remember: null };

/**
 * The interface language lives in the URL (`?lang=`), so server and client
 * render the same language. A page load without it falls back to the
 * remembered language, then to English; a page load with it updates the
 * memory. Email links and redirects therefore keep an Arabic user in Arabic.
 */
export function decideLocale(request: LocaleRequest): LocaleDecision {
  if (
    request.method !== "GET" ||
    !request.document ||
    request.pathname.startsWith("/api/") ||
    request.pathname.startsWith("/auth/")
  )
    return unchanged;
  const query = new URLSearchParams(request.search);
  const requested = query.get("lang");
  if (requested !== null)
    return isSupportedLocale(requested) && requested !== request.cookie
      ? { redirectTo: null, remember: requested }
      : unchanged;
  if (!isSupportedLocale(request.cookie)) return unchanged;
  query.set("lang", request.cookie);
  return { redirectTo: `${request.pathname}?${query}`, remember: null };
}
