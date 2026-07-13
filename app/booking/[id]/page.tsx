import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooking } from "@/lib/bookings";

export default async function BookingConfirmationPage({ params }: PageProps<"/booking/[id]">) {
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking) notFound();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 text-2xl">
          ✓
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {booking.status === "canceled" ? "Booking canceled" : "You're booked!"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {booking.date} at {booking.time} — 30 minutes
        </p>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          A confirmation would normally be emailed to <strong>{booking.email}</strong>.
        </p>
        {booking.status === "confirmed" && (
          <a
            href={`/api/bookings/${booking.id}/ics`}
            className="mt-4 inline-block rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium"
          >
            Add to calendar (.ics)
          </a>
        )}
        <div className="mt-4">
          <Link href="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            ← Book another slot
          </Link>
        </div>
      </div>
    </div>
  );
}
