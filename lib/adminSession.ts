import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";
export const ADMIN_COOKIE = "sw_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function checkAdminPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createAdminToken(): string {
  const body = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + MAX_AGE_SECONDS * 1000 })).toString(
    "base64url"
  );
  return `${body}.${sign(body)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    return payload.role === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
