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
    <div className="flex flex-col gap-7">
      <section>
        <h2 className="mb-2.5 text-[13px] font-semibold text-zinc-700">1. Pick a day</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex flex-col items-center rounded-xl px-3 py-2.5 min-w-[64px] text-sm ${
                selectedDate === d.date
                  ? "bg-teal-800 text-white"
                  : "bg-white text-zinc-700 shadow-[0_1px_4px_rgba(30,25,15,0.06)]"
              }`}
            >
              <span className={`text-[10.5px] ${selectedDate === d.date ? "text-white/75" : "text-zinc-400"}`}>{d.weekday}</span>
              <span className="font-semibold">{d.label}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedDate && (
        <section>
          <h2 className="mb-2.5 text-[13px] font-semibold text-zinc-700">2. Pick a time</h2>
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
                  className={`rounded-[10px] px-3 py-2.5 text-sm font-medium ${
                    selectedTime === time
                      ? "bg-teal-800 text-white"
                      : "bg-white text-zinc-700 shadow-[0_1px_4px_rgba(30,25,15,0.06)]"
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
          <h2 className="mb-2.5 text-[13px] font-semibold text-zinc-700">3. Your details</h2>
          <form onSubmit={submit} className="flex flex-col gap-2.5 rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(30,25,15,0.06)]">
            <input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-[10px] border-0 bg-zinc-50 px-3.5 py-2.5 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-[10px] border-0 bg-zinc-50 px-3.5 py-2.5 text-sm"
            />
            <textarea
              placeholder="Anything we should know? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="rounded-[10px] border-0 bg-zinc-50 px-3.5 py-2.5 text-sm"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-[10px] bg-teal-800 text-white py-2.5 text-sm font-semibold hover:bg-teal-900 disabled:opacity-50"
            >
              {submitting ? "Booking…" : `Confirm ${selectedDate} at ${selectedTime}`}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
