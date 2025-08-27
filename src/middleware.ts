// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  const baseHost = hostname.split(":")[0]; // strip port for localhost

  const isAdminDomain = baseHost.startsWith("admin.");
  const isAdminPath = url.pathname.startsWith("/admin");

  // --- ADMIN DOMAIN LOGIC ---
  if (isAdminDomain) {
    if (!isAdminPath) {
      // rewrite any non-/admin path to /admin + preserve subpath
      url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
      // console.log("[Middleware] Admin domain rewrite to:", url.pathname);
      return NextResponse.rewrite(url);
    }
  }

  // --- NORMAL DOMAIN LOGIC ---
  if (!isAdminDomain) {
    console.log("[Middleware] Incoming Request");
    console.log("[Middleware] Hostname:", hostname);
    console.log("[Middleware] Path:", url.pathname);

    // block /admin paths
    if (isAdminPath) {
      console.log("[Middleware] Normal domain tried to access /admin ❌ → 404");
      return NextResponse.rewrite(new URL("/404", req.url));
    }

    // allow normal paths
    // console.log("[Middleware] Normal domain accessing normal path ✅");
    return NextResponse.next();
  }

  // safety net
  return NextResponse.next();
}

// Apply middleware to all pages except API and static assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
