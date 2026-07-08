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

export default async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard and /api/admin routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    
    if (!token) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      if (pathname.startsWith("/api/admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role checking for Superadmin routes
    if (pathname.startsWith("/dashboard/admins") || pathname.startsWith("/api/admin/admins")) {
      if (payload.role !== "superadmin") {
        if (pathname.startsWith("/api/admin")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/admin/:path*"
  ],
};
