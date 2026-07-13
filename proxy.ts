import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdmin = verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (pathname === "/admin/login" && isAdmin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
