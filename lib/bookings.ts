import { slotsForDate, SLOT_MINUTES } from "./availability";

export type Booking = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  email: string;
  notes: string;
  status: "confirmed" | "canceled";
  createdAt: string;
};

type Store = { bookings: Booking[]; blockedDates: Set<string> };

const globalForBookings = globalThis as unknown as { __slotwiseStore?: Store };

function getStore(): Store {
  if (!globalForBookings.__slotwiseStore) {
    globalForBookings.__slotwiseStore = { bookings: [], blockedDates: new Set() };
  }
  return globalForBookings.__slotwiseStore;
}

export function availableSlotsForDate(date: string): string[] {
  const store = getStore();
  if (store.blockedDates.has(date)) return [];
  const taken = new Set(
    store.bookings.filter((b) => b.date === date && b.status === "confirmed").map((b) => b.time)
  );
  return slotsForDate(date).filter((slot) => !taken.has(slot));
}

export function createBooking(input: {
  date: string;
  time: string;
  name: string;
  email: string;
  notes: string;
}): Booking | null {
  const free = availableSlotsForDate(input.date);
  if (!free.includes(input.time)) return null;

  const booking: Booking = {
    id: `bk-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    date: input.date,
    time: input.time,
    name: input.name,
    email: input.email,
    notes: input.notes,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  getStore().bookings.push(booking);
  return booking;
}

export function getBooking(id: string): Booking | undefined {
  return getStore().bookings.find((b) => b.id === id);
}

export function listBookings(): Booking[] {
  return [...getStore().bookings].sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
}

export function cancelBooking(id: string): Booking | null {
  const booking = getStore().bookings.find((b) => b.id === id);
  if (!booking) return null;
  booking.status = "canceled";
  return booking;
}

export function blockedDatesList(): string[] {
  return [...getStore().blockedDates].sort();
}

export function blockDate(date: string): void {
  getStore().blockedDates.add(date);
}

export function unblockDate(date: string): void {
  getStore().blockedDates.delete(date);
}

export { SLOT_MINUTES };
