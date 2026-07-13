import type { Booking } from "./bookings";
import { SLOT_MINUTES } from "./availability";

function toIcsDateTime(date: string, time: string): string {
  const [h, m] = time.split(":").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d, h, m));
  return dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/** Minimal RFC 5545 .ics file for a single booking — no calendar library needed. */
export function bookingToIcs(booking: Booking, providerName: string): string {
  const start = toIcsDateTime(booking.date, booking.time);
  const [h, m] = booking.time.split(":").map(Number);
  const endMinutes = h * 60 + m + SLOT_MINUTES;
  const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, "0")}:${(endMinutes % 60).toString().padStart(2, "0")}`;
  const end = toIcsDateTime(booking.date, endTime);
  const now = toIcsDateTime(booking.date, booking.time);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SlotWise//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${booking.id}@slotwise`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${providerName} — Consultation with ${booking.name}`,
    `DESCRIPTION:${booking.notes.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
