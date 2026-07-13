import { describe, it, expect, beforeEach } from "vitest";
import {
  availableSlotsForDate,
  createBooking,
  cancelBooking,
  listBookings,
  blockDate,
  unblockDate,
} from "../bookings";

// 2026-07-13 is a Monday with slots including "09:00".
const MONDAY = "2026-07-13";

describe("bookings store", () => {
  beforeEach(() => {
    (globalThis as unknown as { __slotwiseStore?: unknown }).__slotwiseStore = undefined;
  });

  it("prevents double-booking the same slot", () => {
    const first = createBooking({ date: MONDAY, time: "09:00", name: "A", email: "a@example.com", notes: "" });
    expect(first).not.toBeNull();

    const second = createBooking({ date: MONDAY, time: "09:00", name: "B", email: "b@example.com", notes: "" });
    expect(second).toBeNull();
  });

  it("removes a booked slot from availability", () => {
    createBooking({ date: MONDAY, time: "09:00", name: "A", email: "a@example.com", notes: "" });
    expect(availableSlotsForDate(MONDAY)).not.toContain("09:00");
    expect(availableSlotsForDate(MONDAY)).toContain("09:30");
  });

  it("reopens a slot when its booking is canceled", () => {
    const booking = createBooking({ date: MONDAY, time: "09:00", name: "A", email: "a@example.com", notes: "" });
    cancelBooking(booking!.id);
    expect(availableSlotsForDate(MONDAY)).toContain("09:00");
  });

  it("rejects bookings on blocked dates", () => {
    blockDate(MONDAY);
    expect(availableSlotsForDate(MONDAY)).toEqual([]);
    const booking = createBooking({ date: MONDAY, time: "09:00", name: "A", email: "a@example.com", notes: "" });
    expect(booking).toBeNull();
    unblockDate(MONDAY);
    expect(availableSlotsForDate(MONDAY).length).toBeGreaterThan(0);
  });

  it("rejects a booking for a slot outside working hours", () => {
    const booking = createBooking({ date: MONDAY, time: "23:00", name: "A", email: "a@example.com", notes: "" });
    expect(booking).toBeNull();
  });

  it("lists bookings sorted by date and time", () => {
    createBooking({ date: MONDAY, time: "10:00", name: "A", email: "a@example.com", notes: "" });
    createBooking({ date: MONDAY, time: "09:00", name: "B", email: "b@example.com", notes: "" });
    const all = listBookings();
    expect(all[0].time).toBe("09:00");
    expect(all[1].time).toBe("10:00");
  });
});
