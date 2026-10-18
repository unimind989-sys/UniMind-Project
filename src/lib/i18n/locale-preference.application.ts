import { isSupportedLocale, type Locale } from "./locale";

/** Remembers the interface language between visits; functional, HttpOnly. */
export const localeCookieName = "unimind-locale";
export const localeCookieMaxAgeSeconds = 60 * 60 * 24 * 365;
/**
 * The language a real-runtime request renders in, set by the proxy for the
 * root layout's `lang` and `dir` (a layout cannot read `?lang=`). Presentation
 * only: a value sent by the browser is overwritten or validated.
 */
export const localeHeaderName = "x-unimind-locale";

export type LocaleRequest = Readonly<{
  method: string;
  pathname: string;
  search: string;
  cookie: string | undefined;
  /** A top-level page load. */
  document: boolean;
  /**
   * A same-origin script request for a page: a client navigation. The proxy
   * cannot tell it from a prefetch, so links to another language never
   * prefetch (`LanguageSwitch`).
   */
  navigation: boolean;
}>;

export type LocaleDecision = Readonly<{
  /** Same page with the remembered language added, or null. */
  redirectTo: string | null;
  /** The language to remember after this response, or null. */
  remember: Locale | null;
}>;

const unchanged: LocaleDecision = { redirectTo: null, remember: null };

/** The remembered language, or English when nothing valid is remembered. */
function rememberedOrDefault(cookie: string | undefined): Locale {
  return isSupportedLocale(cookie) ? cookie : "en";
}

/**
 * The interface language lives in the URL (`?lang=`), so server and client
 * render the same language. A page load without it falls back to the
 * remembered language, then to English. A page load or client navigation
 * that names a different language updates the memory (the language switch is
 * a client navigation); English links on a device that remembers nothing
 * write nothing, so sign-in can still use the account's language. Email links
 * and redirects therefore keep an Arabic user in Arabic.
 */
export function decideLocale(request: LocaleRequest): LocaleDecision {
  if (
    request.method !== "GET" ||
    (!request.document && !request.navigation) ||
    request.pathname.startsWith("/api/") ||
    request.pathname.startsWith("/auth/")
  )
    return unchanged;
  const query = new URLSearchParams(request.search);
  const requested = query.get("lang");
  if (requested !== null)
    return isSupportedLocale(requested) &&
      requested !== rememberedOrDefault(request.cookie)
      ? { redirectTo: null, remember: requested }
      : unchanged;
  if (!request.document || !isSupportedLocale(request.cookie)) return unchanged;
  query.set("lang", request.cookie);
  return { redirectTo: `${request.pathname}?${query}`, remember: null };
}

/**
 * Whether this device chose its language: a remembered language, or a page
 * that names a language other than the default. Otherwise sign-in uses the
 * account's language.
 */
export function hasChosenLanguage(
  requested: unknown,
  cookie: string | undefined,
): boolean {
  return (
    isSupportedLocale(cookie) ||
    (isSupportedLocale(requested) && requested !== "en")
  );
}

/** Cookie options shared by the proxy and Server Actions. */
export function localeCookieOptions(secure: boolean) {
  return {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: true,
    secure,
    maxAge: localeCookieMaxAgeSeconds,
  };
}
