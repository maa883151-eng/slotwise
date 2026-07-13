import { nextBookableDates } from "@/lib/dates";
import { BookingFlow } from "@/components/BookingFlow";

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const dates = nextBookableDates(today);

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-2xl">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Book a consultation</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            30-minute sessions with SlotWise Consulting · Mon–Fri
          </p>
        </header>
        <BookingFlow dates={dates} />
      </div>
    </div>
  );
}
