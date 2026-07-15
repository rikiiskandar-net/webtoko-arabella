import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;
  
  // Get hostname of request (e.g. localhost:3000, absen.arabella.web.id)
  const hostname = req.headers.get("host");

  // Define the subdomain you want to rewrite
  // We check if it starts with 'absen.' to handle absen.arabella.web.id 
  // or absen.localhost:3000 (for local testing)
  if (hostname && hostname.startsWith("absen.")) {
    // If they are on the root or a subpath of absen, rewrite to /absen/...
    if (!url.pathname.startsWith("/absen")) {
      url.pathname = `/absen${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
