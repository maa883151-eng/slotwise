import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, createAdminToken, adminCookieOptions, ADMIN_COOKIE } from "@/lib/adminSession";
import { rateLimit } from "@/lib/rateLimit";

const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterSeconds } = rateLimit(`admin-login:${ip}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  let passwordMatches: boolean;
  try {
    passwordMatches = checkAdminPassword(password);
  } catch (error) {
    // Deployment is missing ADMIN_PASSWORD/AUTH_SECRET in a production-like
    // environment. adminSession refuses to fall back to the insecure default
    // here, so surface a clear (non-leaky) error instead of a default login.
    console.error("[api/admin/login] admin auth is not configured:", error);
    return NextResponse.json({ error: "Admin login is not configured on this deployment." }, { status: 503 });
  }

  if (!passwordMatches) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  let token: string;
  try {
    token = createAdminToken();
  } catch (error) {
    console.error("[api/admin/login] admin auth is not configured:", error);
    return NextResponse.json({ error: "Admin login is not configured on this deployment." }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
