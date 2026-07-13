import { NextRequest, NextResponse } from "next/server";
import { getBooking } from "@/lib/bookings";
import { bookingToIcs } from "@/lib/ics";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/bookings/[id]/ics">) {
  const { id } = await ctx.params;
  const booking = getBooking(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ics = bookingToIcs(booking, "SlotWise Consulting");
  return new NextResponse(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="booking-${booking.id}.ics"`,
    },
  });
}
