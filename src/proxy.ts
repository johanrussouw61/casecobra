// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const isAuthenticated = request.cookies.get("auth-token");
  // Example: Redirect unauthenticated users from the dashboard
  if (request.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  /*
    // Example: Modify a request header
    const response = NextResponse.next();
    response.headers.set("X-Custom-Header", "Value-from-Proxy");
    return response;
  }
    */
}
export const config = {
  matcher: [], // Apply proxy to specific paths
};
/*
export const config = {
  matcher: ["/api/:path*", "/configure/:path*", "/thank-you/:path*"],
};
*/
