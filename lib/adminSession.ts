import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "sw_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me";
const DEV_FALLBACK_PASSWORD = "admin1234";

// Vercel sets VERCEL_ENV ("production" | "preview" | "development") on every
// deployment, and Next.js sets NODE_ENV=production for `next build`/`next start`.
// Either signal means this code is not running under `next dev` on a laptop, so
// the well-known dev-only defaults below must never be used.
const isProductionLikeEnv = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL_ENV);

let warnedAboutSecret = false;
let warnedAboutPassword = false;

// These are intentionally lazy (called from request handlers, not at module
// load) so that `next build` — which always sets NODE_ENV=production and may
// import this module while bundling — never throws just from importing it.
// The check only fires when admin auth is actually exercised at runtime.
function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;

  if (isProductionLikeEnv) {
    throw new Error(
      "AUTH_SECRET is not set. Refusing to run admin auth with an insecure default outside local " +
        "development. Set the AUTH_SECRET environment variable on this deployment."
    );
  }

  if (!warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn(
      "[adminSession] AUTH_SECRET is not set - using an insecure development-only fallback. " +
        "This fallback is ONLY allowed outside production; set AUTH_SECRET before deploying."
    );
  }
  return DEV_FALLBACK_SECRET;
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (password) return password;

  if (isProductionLikeEnv) {
    throw new Error(
      "ADMIN_PASSWORD is not set. Refusing to run admin auth with an insecure default outside local " +
        "development. Set the ADMIN_PASSWORD environment variable on this deployment."
    );
  }

  if (!warnedAboutPassword) {
    warnedAboutPassword = true;
    console.warn(
      "[adminSession] ADMIN_PASSWORD is not set - using an insecure development-only fallback " +
        "('admin1234'). This fallback is ONLY allowed outside production; set ADMIN_PASSWORD before deploying."
    );
  }
  return DEV_FALLBACK_PASSWORD;
}

function sign(value: string): string {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url");
}

export function checkAdminPassword(password: string): boolean {
  const adminPassword = getAdminPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword);
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

  let expected: string;
  try {
    expected = sign(body);
  } catch (error) {
    // Misconfigured deployment (missing AUTH_SECRET in production): fail
    // closed instead of crashing every request to /admin/*.
    console.error("[adminSession] verifyAdminToken could not verify - is AUTH_SECRET set?", error);
    return false;
  }

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
