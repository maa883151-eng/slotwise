import { describe, it, expect } from "vitest";
import { slotsForDate, isValidBookingDate, BOOKABLE_DAYS_AHEAD } from "../availability";

describe("slotsForDate", () => {
  it("generates 30-minute slots for a weekday", () => {
    // 2026-07-13 is a Monday
    const slots = slotsForDate("2026-07-13");
    expect(slots[0]).toBe("09:00");
    expect(slots).toContain("11:30");
    expect(slots).toContain("13:00");
    expect(slots).not.toContain("12:00"); // lunch gap
    expect(slots).not.toContain("17:00"); // window end is exclusive
  });

  it("returns no slots on a Sunday", () => {
    // 2026-07-12 is a Sunday
    expect(slotsForDate("2026-07-12")).toEqual([]);
  });

  it("has a shorter afternoon window on Fridays", () => {
    // 2026-07-17 is a Friday
    const slots = slotsForDate("2026-07-17");
    expect(slots).toContain("15:30");
    expect(slots).not.toContain("16:00");
  });
});

describe("isValidBookingDate", () => {
  const today = "2026-07-14";

  it("rejects dates in the past", () => {
    expect(isValidBookingDate("2026-07-13", today)).toBe(false);
  });

  it("accepts today", () => {
    expect(isValidBookingDate(today, today)).toBe(true);
  });

  it(`accepts exactly ${BOOKABLE_DAYS_AHEAD} days ahead`, () => {
    expect(isValidBookingDate("2026-07-28", today)).toBe(true);
  });

  it("rejects dates beyond the bookable window", () => {
    expect(isValidBookingDate("2026-08-15", today)).toBe(false);
  });
});
