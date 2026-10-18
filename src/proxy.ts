import { NextResponse, type NextRequest } from "next/server";

import { refreshSupabaseSession } from "./lib/auth/refresh-session.server";
import {
  decideLocale,
  localeCookieName,
  localeCookieOptions,
} from "./lib/i18n/locale-preference.application";
import {
  isProductDemoPath,
  resolveDemoRuntime,
} from "./lib/demo/demo-runtime.application";

const brandFiles = new Set([
  "unimind-open-folio-horizontal-light.svg",
  "unimind-open-folio-horizontal-dark.svg",
  "unimind-open-folio-horizontal-white.svg",
  "unimind-open-folio-symbol-light.svg",
  "unimind-open-folio-symbol-dark.svg",
  "unimind-open-folio-symbol-white.svg",
  "unimind-open-folio-symbol-small-light.svg",
  "unimind-open-folio-symbol-small-dark.svg",
  "icons/favicon.svg",
  "icons/favicon-light.svg",
  "icons/favicon-dark.svg",
  "icons/favicon.ico",
  "icons/favicon-16.png",
  "icons/favicon-32.png",
  "icons/favicon-48.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-512.png",
  "icons/maskable-icon.svg",
  "icons/app-icon.svg",
  "icons/site.webmanifest",
]);
function publicBrandAsset(path: string) {
  return (
    path.startsWith("/brand/unimind/") &&
    brandFiles.has(path.slice("/brand/unimind/".length))
  );
}

export async function proxy(request: NextRequest) {
  const demo = resolveDemoRuntime(process.env);
  if (demo !== "DISABLED") {
    if (demo !== "ENABLED")
      return new NextResponse("Synthetic runtime configuration unavailable.", {
        status: 503,
      });
    // Next dev may normalize nextUrl's hostname to localhost internally. The
    // actual HTTP Host must still be the launcher's exact loopback host/port.
    const expected = new URL(process.env.APP_ORIGIN!);
    const host = request.headers.get("host");
    const originalHost = request.headers.get("x-forwarded-host") ?? host;
    if (
      originalHost !== expected.host ||
      ![expected.host, `localhost:${expected.port}`].includes(host ?? "") ||
      request.nextUrl.protocol !== "http:"
    )
      return new NextResponse("Synthetic runtime origin unavailable.", {
        status: 503,
      });
    if (
      !["GET", "HEAD"].includes(request.method) ||
      request.nextUrl.pathname.startsWith("/api/") ||
      request.headers.has("next-action")
    )
      return new NextResponse(
        "Service mutations are unavailable in this synthetic runtime.",
        { status: 403 },
      );
    const path = request.nextUrl.pathname;
    // Build from request.url, not nextUrl: nextUrl reports 127.0.0.1 as
    // localhost. The demo's next.config sets skipProxyUrlNormalize, so
    // request.url keeps 127.0.0.1 and Next keeps this rewrite internal instead
    // of proxying it over HTTP.
    const url = new URL(request.url);
    if (isProductDemoPath(path))
      url.pathname = `/synthetic-runtime/${path === "/" ? "home" : path.slice(1)}`;
    // skipProxyUrlNormalize shows raw /_next/data/<build>/<route>.json URLs
    // here after the router has already mapped them to <route>. App Router
    // never requests them, so they get the 404 instead of the real route.
    if (
      !isProductDemoPath(path) &&
      (!path.startsWith("/_next/") || path.startsWith("/_next/data/")) &&
      !path.startsWith("/demo-files/") &&
      !/^\/images\/study-shelf\/[a-z-]+\.png$/u.test(path) &&
      !/^\/images\/product\/studio-(?:en|ar)-(?:light|dark)\.jpg$/u.test(
        path,
      ) &&
      path !== "/favicon.ico" &&
      path !== "/icon.svg" &&
      path !== "/apple-icon.png" &&
      !publicBrandAsset(path) &&
      !path.startsWith("/synthetic-runtime/")
    )
      return new NextResponse("Not found in the synthetic product.", {
        status: 404,
      });
    const response = isProductDemoPath(path)
      ? NextResponse.rewrite(url)
      : NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  const path = request.nextUrl.pathname;
  // Hosted simulation lives only in the current browser document. The loopback
  // demo's document route and the retired fixture routes (/preview,
  // /api/preview) are never a public entry or an authorization shortcut; they
  // answer 404 before any session refresh, cookie or Auth call.
  if (
    /^\/(?:synthetic-runtime|preview|api\/preview)(?:\/|$)/u.test(path) ||
    path === "/wp03-review.html"
  ) {
    return new NextResponse("Not found.", {
      status: 404,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }
  // Preserve the previous real-runtime exclusions. Demo filtering above also
  // covers these paths, including API health probes and image-like API paths.
  if (
    /^\/api\/health(?:\/|$)/u.test(path) ||
    path.startsWith("/_next/static") ||
    path.startsWith("/_next/image") ||
    path === "/favicon.ico" ||
    publicBrandAsset(path) ||
    /\.(?:svg|png|jpg|jpeg|gif|webp)$/u.test(path)
  )
    return NextResponse.next();
  // Real runtime only (the synthetic runtime above sets no cookie): a page
  // load without ?lang= returns in the remembered language; a page load or
  // client navigation with it updates the memory.
  const locale = decideLocale({
    method: request.method,
    pathname: path,
    search: request.nextUrl.search,
    cookie: request.cookies.get(localeCookieName)?.value,
    document:
      request.headers.get("sec-fetch-dest") === "document" &&
      !request.headers.has("rsc") &&
      !request.headers.has("next-router-prefetch"),
    navigation:
      request.headers.has("rsc") &&
      !request.headers.has("next-router-prefetch"),
  });
  if (locale.redirectTo !== null) {
    const target = request.nextUrl.clone();
    target.search = locale.redirectTo.slice(locale.redirectTo.indexOf("?"));
    const redirect = NextResponse.redirect(target, 307);
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }
  const response = await refreshSupabaseSession(request);
  if (locale.remember !== null)
    response.cookies.set(
      localeCookieName,
      locale.remember,
      localeCookieOptions(request.nextUrl.protocol === "https:"),
    );
  return response;
}

export const config = {
  matcher: ["/:path*"],
};
