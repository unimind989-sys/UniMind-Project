import { NextResponse, type NextRequest } from "next/server";

import { refreshSupabaseSession } from "./lib/auth/refresh-session.server";
import {
  isProductDemoPath,
  resolveDemoRuntime,
} from "./lib/demo/demo-runtime.application";

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
    const url = request.nextUrl.clone();
    if (["/preview", "/preview/review", "/wp03-review.html"].includes(path)) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (isProductDemoPath(path))
      url.pathname = `/synthetic-runtime/${path === "/" ? "home" : path.slice(1)}`;
    if (
      !isProductDemoPath(path) &&
      !path.startsWith("/_next/") &&
      !path.startsWith("/demo-files/") &&
      !/^\/images\/study-shelf\/[a-z-]+\.png$/u.test(path) &&
      path !== "/favicon.ico" &&
      path !== "/icon.svg" &&
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
  // Public fixtures have no identity. Never refresh a signed-in reviewer's
  // session, emit cookies, or contact Auth while rendering the simulation.
  const path = request.nextUrl.pathname;
  // Preserve the previous real-runtime exclusions. Demo filtering above also
  // covers these paths, including API health probes and image-like API paths.
  if (
    /^\/api\/health(?:\/|$)/u.test(path) ||
    path.startsWith("/_next/static") ||
    path.startsWith("/_next/image") ||
    path === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp)$/u.test(path)
  )
    return NextResponse.next();
  if (
    path === "/preview" ||
    path.startsWith("/preview/") ||
    path === "/wp03-review.html"
  ) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }
  return refreshSupabaseSession(request);
}

export const config = {
  matcher: ["/:path*"],
};
