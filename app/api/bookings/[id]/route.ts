import { NextRequest, NextResponse } from "next/server";
import { cancelBooking, getBooking } from "@/lib/bookings";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  const { id } = await ctx.params;
  const booking = getBooking(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(booking);
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  const isAdmin = verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = cancelBooking(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(booking);
}
