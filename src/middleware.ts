// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const hostname = req.headers.get("host") || "";
  const baseHost = hostname.split(":")[0]; // strip port for localhost

  console.log("[Middleware] Incoming Request");
  console.log("[Middleware] Hostname:", hostname);
  console.log("[Middleware] Path:", url.pathname);
  console.log("--------------");

  const isAdminDomain = baseHost.startsWith("admin.");
  // const isAdminDomain = true

  const isAdminPath = url.pathname.startsWith("/admin");

  // --- ADMIN DOMAIN LOGIC ---
  if (isAdminDomain) {
    // allow /admin/* pages
    if (isAdminPath) {
      console.log("[Middleware] Admin domain accessing admin page ✅");
      return NextResponse.next();
    }

    // block everything else on admin domain
    console.log(
      "[Middleware] Admin domain tried to access normal page ❌ → 404",
    );
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // --- NORMAL DOMAIN LOGIC ---
  if (!isAdminDomain) {
    // block /admin pages
    if (isAdminPath) {
      console.log(
        "[Middleware] Normal domain tried to access admin page ❌ → 404",
      );
      return NextResponse.rewrite(new URL("/404", req.url));
    }

    // allow normal pages
    console.log("[Middleware] Normal domain accessing normal page ✅");
    return NextResponse.next();
  }

  // fallback
  return NextResponse.next();
}

// Apply middleware to all pages except API and static assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
