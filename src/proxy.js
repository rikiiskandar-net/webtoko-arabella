import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "auth_token";

// Helper for verifying token in edge runtime
async function verifyToken(token) {
  try {
    const secret = process.env.AUTH_SECRET || "arabella-admin-secret-2025-secure";
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload;
  } catch (error) {
    return null;
  }
}

export default async function proxy(req) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  
  // 1. SUBDOMAIN ROUTING FOR ABSEN
  const hostname = req.headers.get("host");
  if (hostname && hostname.startsWith("absen.")) {
    if (
      !pathname.startsWith("/absen") && 
      !pathname.startsWith("/_next") && 
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/portfolio")
    ) {
      // If going to the root of the worker domain and already logged in, go straight to dashboard
      if (pathname === "/") {
        const workerToken = req.cookies.get("worker_auth_token")?.value;
        if (workerToken) {
          url.pathname = "/absen/dashboard";
          return NextResponse.rewrite(url);
        }
      }
      url.pathname = `/absen${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // 2. ADMIN AUTHENTICATION GUARD
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    
    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role checking for Superadmin routes
    if (pathname.startsWith("/dashboard/admins") || pathname.startsWith("/api/admin/admins")) {
      if (payload.role !== "superadmin") {
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
