// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = ["https://admin.kuditask.com"];

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  console.log("[Middleware] →", request.method, url.pathname);

  // CORS handling for API routes
  const isApiRoute = url.pathname.startsWith("/api");
  if (isApiRoute) {
    console.log("[Middleware][API] Handling API route");
    // Check the origin from the request
    const origin = request.headers.get("origin") ?? "";
    const isAllowedOrigin = allowedOrigins.includes(origin);
    console.log(
      "[Middleware][API] Origin:",
      origin || "<none>",
      "Allowed:",
      isAllowedOrigin,
    );

    // Handle preflighted requests
    const isPreflight = request.method === "OPTIONS";
    if (isPreflight)
      console.log("[Middleware][API] Preflight request detected");

    if (isPreflight) {
      const preflightHeaders = {
        ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
        ...corsOptions,
      };
      console.log(
        "[Middleware][API] Responding to preflight with headers:",
        preflightHeaders,
      );
      return NextResponse.json({}, { headers: preflightHeaders });
    }

    // Handle simple requests
    const response = NextResponse.next();

    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    Object.entries(corsOptions).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    console.log("[Middleware][API] Response headers set for CORS");
    console.log("[Middleware][API] corsOptions:", JSON.stringify(corsOptions));

    return response;
  }

  // App routing logic (non-API)
  const hostname = request.headers.get("host") || "";
  const baseHost = hostname.split(":")[0]; // strip port for localhost

  const isAdminDomain = baseHost.startsWith("admin.");
  // const isAdminDomain = true;
  const isAdminPath = url.pathname.startsWith("/admin");

  if (isAdminDomain) {
    if (!isAdminPath) {
      url.pathname = `/admin${url.pathname === "/" ? "" : url.pathname}`;
      console.log(
        "[Middleware][App] Admin domain, rewriting to:",
        url.pathname,
      );
      return NextResponse.rewrite(url);
    }
  } else {
    if (isAdminPath) {
      console.log("[Middleware][App] Non-admin domain attempted /admin → 404");
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  }

  console.log("[Middleware][App] Passing through");
  return NextResponse.next();
}

// Apply to API (for CORS) and to app routes (excluding Next static assets)
export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
