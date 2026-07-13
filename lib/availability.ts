export type WorkingHours = { start: string; end: string }; // "09:00", "17:00"

// Mon–Fri 9–12 and 13–17, single timezone (demo simplicity — see README).
const WEEKLY_HOURS: Record<number, WorkingHours[]> = {
  1: [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }],
  2: [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }],
  3: [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }],
  4: [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }],
  5: [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "16:00" }],
};
const SLOT_MINUTES = 30;
export const BOOKABLE_DAYS_AHEAD = 14;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function isValidBookingDate(dateStr: string, todayStr: string): boolean {
  if (dateStr < todayStr) return false;
  // Date-only ISO strings ("YYYY-MM-DD") parse as UTC midnight per spec; stick to
  // UTC getters/setters throughout so server-local timezone never shifts the result.
  const maxDate = new Date(todayStr);
  maxDate.setUTCDate(maxDate.getUTCDate() + BOOKABLE_DAYS_AHEAD);
  return new Date(dateStr) <= maxDate;
}

/** All bookable slot start times for a given date, before excluding existing bookings. */
export function slotsForDate(dateStr: string): string[] {
  const dayOfWeek = new Date(dateStr).getUTCDay();
  const windows = WEEKLY_HOURS[dayOfWeek] ?? [];
  const slots: string[] = [];
  for (const window of windows) {
    let cursor = timeToMinutes(window.start);
    const end = timeToMinutes(window.end);
    while (cursor + SLOT_MINUTES <= end) {
      slots.push(minutesToTime(cursor));
      cursor += SLOT_MINUTES;
    }
  }
  return slots;
}

export { SLOT_MINUTES };
