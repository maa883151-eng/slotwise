"use client";

import { useEffect, useState } from "react";

type Booking = {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  notes: string;
  status: "confirmed" | "canceled";
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [bRes, dRes] = await Promise.all([fetch("/api/bookings"), fetch("/api/admin/blocked-dates")]);
    const bData = await bRes.json();
    const dData = await dRes.json();
    setBookings(bData.bookings ?? []);
    setBlockedDates(dData.blockedDates ?? []);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  const cancel = async (id: string) => {
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    load();
  };

  const addBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;
    await fetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: newBlockDate }),
    });
    setNewBlockDate("");
    load();
  };

  const unblock = async (date: string) => {
    await fetch(`/api/admin/blocked-dates/${date}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950 p-6 gap-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Admin — SlotWise</h1>

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Bookings</h2>
        {loading ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-zinc-400">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Client</th>
                <th className="py-2 pr-3 font-medium">Notes</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <td className="py-2 pr-3 text-zinc-800 dark:text-zinc-200">{b.date} {b.time}</td>
                  <td className="py-2 pr-3">
                    <p className="text-zinc-800 dark:text-zinc-200">{b.name}</p>
                    <p className="text-xs text-zinc-400">{b.email}</p>
                  </td>
                  <td className="py-2 pr-3 text-zinc-500 dark:text-zinc-400 max-w-[200px] truncate">{b.notes || "—"}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    {b.status === "confirmed" && (
                      <button onClick={() => cancel(b.id)} className="text-xs text-red-600 hover:underline">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Blocked dates</h2>
        <form onSubmit={addBlockedDate} className="flex gap-2 mb-3">
          <input
            type="date"
            value={newBlockDate}
            onChange={(e) => setNewBlockDate(e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium">
            Block day
          </button>
        </form>
        {blockedDates.length === 0 ? (
          <p className="text-sm text-zinc-400">No blocked dates.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {blockedDates.map((date) => (
              <li key={date} className="flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300">
                {date}
                <button onClick={() => unblock(date)} className="text-zinc-400 hover:text-red-600">×</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
