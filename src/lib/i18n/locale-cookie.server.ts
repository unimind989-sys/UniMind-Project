import "server-only";

import { cookies, headers } from "next/headers";

import type { Locale } from "./locale";
import {
  localeCookieName,
  localeCookieOptions,
} from "./locale-preference.application";

/**
 * Remembers the interface language from a Server Action. `Secure` follows the
 * request's origin, as in the proxy, so local HTTP and hosted HTTPS agree.
 */
export async function rememberInterfaceLanguage(locale: Locale): Promise<void> {
  const origin = (await headers()).get("origin");
  const secure =
    origin === null
      ? process.env.NODE_ENV === "production"
      : origin.startsWith("https:");
  (await cookies()).set(localeCookieName, locale, localeCookieOptions(secure));
}
