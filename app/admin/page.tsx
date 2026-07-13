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
    <div className="flex flex-1 flex-col bg-[#fbf9f6] p-8 gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">Admin — SlotWise</h1>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(30,25,15,0.05)]">
        <h2 className="text-sm font-semibold text-zinc-800 mb-3">Bookings</h2>
        {loading ? (
          <p className="text-sm text-zinc-400">Loading…</p>
        ) : bookings.length === 0 ? (
          <p className="text-sm text-zinc-400">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-zinc-500 border-b border-zinc-100">
                <th className="py-2 pr-3 font-medium">When</th>
                <th className="py-2 pr-3 font-medium">Client</th>
                <th className="py-2 pr-3 font-medium">Notes</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-zinc-50 last:border-0">
                  <td className="py-2.5 pr-3 text-zinc-800">{b.date} {b.time}</td>
                  <td className="py-2.5 pr-3">
                    <p className="text-zinc-800">{b.name}</p>
                    <p className="text-xs text-zinc-400">{b.email}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-zinc-500 max-w-[200px] truncate">{b.notes || "—"}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        b.status === "confirmed" ? "bg-teal-800/10 text-teal-800" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    {b.status === "confirmed" && (
                      <button onClick={() => cancel(b.id)} className="text-xs font-medium text-red-500 hover:underline">
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

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(30,25,15,0.05)]">
        <h2 className="text-sm font-semibold text-zinc-800 mb-3">Blocked dates</h2>
        <form onSubmit={addBlockedDate} className="flex gap-2 mb-3">
          <input
            type="date"
            value={newBlockDate}
            onChange={(e) => setNewBlockDate(e.target.value)}
            className="rounded-[10px] border-0 bg-zinc-50 px-3.5 py-2 text-sm"
          />
          <button type="submit" className="rounded-full bg-teal-800 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-900">
            Block day
          </button>
        </form>
        {blockedDates.length === 0 ? (
          <p className="text-sm text-zinc-400">No blocked dates.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {blockedDates.map((date) => (
              <li key={date} className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
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
