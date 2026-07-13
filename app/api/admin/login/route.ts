import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, createAdminToken, adminCookieOptions, ADMIN_COOKIE } from "@/lib/adminSession";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createAdminToken(), adminCookieOptions);
  return res;
}
