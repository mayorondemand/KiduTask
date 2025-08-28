import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to ensure requests from "admin.**" domains are routed to "/admin" paths,
// and to block access to "/admin" from non-admin domains.

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  console.log("[Middleware] Request to", url.pathname);

  const hostname = request.headers.get("host") || "";
  const baseHost = hostname.split(":")[0];

  const isAdminDomain = baseHost.startsWith("admin.");
  const isAdminPath = url.pathname.startsWith("/admin");

  if (isAdminDomain) {
    if (!isAdminPath) {
      url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
      // console.log(
      //   "[Middleware][App] Admin domain, rewriting to:",
      //   url.pathname,
      // );
      return NextResponse.rewrite(url);
    }
  } else {
    if (isAdminPath) {
      // console.log("[Middleware][App] Non-admin domain attempted /admin → 404");
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  }

  // console.log("[Middleware][App] Passing through");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
