import { NextRequest, NextResponse } from "next/server";
import { availableSlotsForDate } from "@/lib/bookings";
import { isValidBookingDate } from "@/lib/availability";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isValidBookingDate(date, todayStr())) {
    return NextResponse.json({ error: "Invalid or out-of-range date" }, { status: 400 });
  }
  return NextResponse.json({ date, slots: availableSlotsForDate(date) });
}
