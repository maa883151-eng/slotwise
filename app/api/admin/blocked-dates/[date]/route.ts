import { NextRequest, NextResponse } from "next/server";
import { unblockDate } from "@/lib/bookings";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/admin/blocked-dates/[date]">) {
  if (!verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { date } = await ctx.params;
  unblockDate(date);
  return NextResponse.json({ ok: true });
}
