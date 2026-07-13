import { NextRequest, NextResponse } from "next/server";
import { blockedDatesList, blockDate } from "@/lib/bookings";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";

function requireAdmin(request: NextRequest): boolean {
  return verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ blockedDates: blockedDatesList() });
}

export async function POST(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const date = typeof body?.date === "string" ? body.date : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  blockDate(date);
  return NextResponse.json({ ok: true }, { status: 201 });
}
