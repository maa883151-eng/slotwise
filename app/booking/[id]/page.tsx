import { notFound } from "next/navigation";
import Link from "next/link";
import { getBooking } from "@/lib/bookings";

export default async function BookingConfirmationPage({ params }: PageProps<"/booking/[id]">) {
  const { id } = await params;
  const booking = getBooking(id);
  if (!booking) notFound();

  return (
    <div className="flex flex-1 items-center justify-center bg-[#fbf9f6] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-[0_8px_30px_rgba(30,25,15,0.08)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-800 text-white text-2xl">
          ✓
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">
          {booking.status === "canceled" ? "Booking canceled" : "You're booked!"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {booking.date} at {booking.time} — 30 minutes
        </p>
        <p className="mt-3 text-sm text-zinc-600">
          A confirmation would normally be emailed to <strong>{booking.email}</strong>.
        </p>
        {booking.status === "confirmed" && (
          <a
            href={`/api/bookings/${booking.id}/ics`}
            className="mt-4 inline-block rounded-full bg-teal-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-teal-900"
          >
            Add to calendar (.ics)
          </a>
        )}
        <div className="mt-4">
          <Link href="/" className="text-sm font-medium text-teal-800 hover:underline">
            ← Book another slot
          </Link>
        </div>
      </div>
    </div>
  );
}
