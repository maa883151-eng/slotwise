"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DateOption = { date: string; label: string; weekday: string };

export function BookingFlow({ dates }: { dates: DateOption[] }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      setSelectedTime(null);
      const res = await fetch(`/api/availability?date=${selectedDate}`);
      const data = await res.json();
      if (!cancelled) {
        setSlots(data.slots ?? []);
        setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: selectedDate, time: selectedTime, name, email, notes }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(`/booking/${data.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">1. Pick a day</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center rounded-xl border px-3 py-2 min-w-[64px] text-sm ${
                selectedDate === d.date
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <span className="text-xs text-zinc-400">{d.weekday}</span>
              <span className="font-medium">{d.label}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedDate && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">2. Pick a time</h2>
          {loadingSlots ? (
            <p className="text-sm text-zinc-400">Loading availability…</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-zinc-400">No slots available this day — try another.</p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {slots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-lg border px-2 py-1.5 text-sm ${
                    selectedTime === time
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                      : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedTime && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">3. Your details</h2>
          <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Anything we should know? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Booking…" : `Confirm ${selectedDate} at ${selectedTime}`}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
