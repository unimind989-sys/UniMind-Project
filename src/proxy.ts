import { NextResponse, type NextRequest } from "next/server";

import { refreshSupabaseSession } from "./lib/auth/refresh-session.server";

export async function proxy(request: NextRequest) {
  // Public fixtures have no identity. Never refresh a signed-in reviewer's
  // session, emit cookies, or contact Auth while rendering the simulation.
  const path = request.nextUrl.pathname;
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
  matcher: [
    "/((?!api/health(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
