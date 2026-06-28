import { NextResponse } from "next/server";

const COOKIE_NAME = "auth_token";
const PUBLIC_PATHS = ["/login", "/api/auth"];

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  const isProtected = pathname.startsWith("/dashboard");

  if (!isProtected || isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|uploads).*)",
  ],
};
