// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOriginSite = process.env.BETTER_AUTH_URL;

if (!allowedOriginSite) {
  throw new Error("invalid");
}
const baseAllowedHostname = new URL(allowedOriginSite).hostname;

const corsOptions: Record<string, string> = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // CORS handling for API routes
  const isApiRoute = url.pathname.startsWith("/api");
  if (isApiRoute) {
    const origin = request.headers.get("origin") ?? "";
    let isAllowedOrigin = false;
    if (origin && baseAllowedHostname) {
      try {
        const { hostname } = new URL(origin);
        isAllowedOrigin =
          hostname === baseAllowedHostname ||
          hostname.endsWith(`.${baseAllowedHostname}`);
      } catch {
        isAllowedOrigin = false;
      }
    }
    const isPreflight = request.method === "OPTIONS";

    if (isPreflight) {
      const preflightHeaders: Record<string, string> = {
        ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
        ...corsOptions,
      };
      return NextResponse.json({}, { headers: preflightHeaders });
    }

    const response = NextResponse.next();
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    Object.entries(corsOptions).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
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
      return NextResponse.rewrite(url);
    }
  } else {
    if (isAdminPath) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }
  }

  return NextResponse.next();
}

// Apply to API (for CORS) and to app routes (excluding Next static assets)
export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
