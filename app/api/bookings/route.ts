import { NextRequest, NextResponse } from "next/server";
import { createBooking, listBookings } from "@/lib/bookings";
import { isValidBookingDate } from "@/lib/availability";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/adminSession";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  const isAdmin = verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ bookings: listBookings() });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const date = typeof body?.date === "string" ? body.date : "";
  const time = typeof body?.time === "string" ? body.time : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 500) : "";

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid name and email are required" }, { status: 400 });
  }
  if (!isValidBookingDate(date, todayStr())) {
    return NextResponse.json({ error: "Date is out of the bookable range" }, { status: 400 });
  }

  const booking = createBooking({ date, time, name, email, notes });
  if (!booking) {
    return NextResponse.json({ error: "That slot was just taken — please pick another" }, { status: 409 });
  }
  return NextResponse.json(booking, { status: 201 });
}
