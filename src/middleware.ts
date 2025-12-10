import { withAuth } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default withAuth(async (_req: NextRequest) => {
  return;
});

export const config = {
  matcher: ["/api/:path*", "/configure/:path*", "/thank-you/:path*"],
};
