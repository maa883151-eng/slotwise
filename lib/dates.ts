import { BOOKABLE_DAYS_AHEAD } from "./availability";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function nextBookableDates(fromIso: string): Array<{ date: string; label: string; weekday: string }> {
  const dates = [];
  // Date-only ISO strings parse as UTC midnight; stay in UTC getters/setters
  // throughout so this list is identical regardless of server timezone.
  const start = new Date(fromIso);
  for (let i = 0; i < BOOKABLE_DAYS_AHEAD; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    const weekday = WEEKDAY_LABELS[d.getUTCDay()];
    const label = `${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCDate()}`;
    dates.push({ date, label, weekday });
  }
  return dates;
}
