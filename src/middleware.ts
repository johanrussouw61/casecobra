// src/middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";

export default withAuth(async () => {
  return;
});

export const config = {
  matcher: ["/api/:path*", "/configure/:path*", "/thank-you/:path*"],
};
