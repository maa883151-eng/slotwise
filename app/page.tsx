import { nextBookableDates } from "@/lib/dates";
import { BookingFlow } from "@/components/BookingFlow";

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const dates = nextBookableDates(today);

  return (
    <div className="flex flex-1 flex-col items-center bg-[#fbf9f6] px-4 py-14">
      <div className="w-full max-w-xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">Book a consultation</h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            30-minute sessions with SlotWise Consulting · Mon–Fri
          </p>
        </header>
        <BookingFlow dates={dates} />
      </div>
    </div>
  );
}
