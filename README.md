# SlotWise

> A booking/scheduling app — live availability, double-booking-proof slots, and calendar export.

**Live demo:** [slotwise-eosin.vercel.app](https://slotwise-eosin.vercel.app) — admin panel at `/admin`, password `admin1234`.

## What it does

- **Public booking flow** — pick a day (next 14 bookable days), pick an open 30-minute slot, enter details, confirm. No account needed.
- **Real availability, not a static calendar.** Slots are generated from weekly working hours and filtered against existing bookings and blocked dates server-side — the same check runs at submit time, so two people can't win the same slot even if both had it open in their browser.
- **Calendar export** — every confirmed booking can be downloaded as a `.ics` file.
- **Admin panel** (`/admin`, password-gated) — see all bookings, cancel one (reopens its slot), block/unblock entire days.

## Architecture decisions

- **Slot-level race safety.** `createBooking` re-checks availability at write time, not just at read time — the UI shows open slots optimistically, but the server is the source of truth for whether a slot is actually still free.
- **All date math in UTC.** Every date computation uses `getUTCDay`/`setUTCDate`/UTC-safe parsing instead of local-timezone `Date` methods. Mixing the two is a classic bug: a date-only string parses as UTC midnight, but local getters/setters read that instant back through the server's timezone — off by a day depending on where it runs. Keeping everything in one timezone frame (UTC, standing in for "the provider's fixed timezone") avoids that entirely.
- **Password-gated admin, not full user auth.** A single shared admin password (HMAC-signed cookie session, same primitive as the other portfolio apps) is proportionate for a single-provider scheduling tool — no multi-tenant user system needed.
- **In-memory demo storage.** Bookings and blocked dates live in a module-level store scoped to the serverless instance — resets on cold start/redeploy, consistent with the zero-config philosophy across this portfolio.

## Stack

Next.js 16 (App Router, Proxy) · React 19 · TypeScript · Tailwind CSS 4 · Vitest

## Running locally

```bash
npm install
cp .env.example .env.local   # optional: AUTH_SECRET, ADMIN_PASSWORD
npm run dev                  # http://localhost:3000
```

## Testing

```bash
npm test
```

Covers slot generation (weekday hours, lunch gap, shorter Friday window), the bookable-date
window, and the bookings store — double-booking prevention, cancellation reopening a slot,
blocked-date rejection, and out-of-hours rejection.

## Deploying

```bash
npm i -g vercel
vercel --prod
```

Set `AUTH_SECRET` and `ADMIN_PASSWORD` as Vercel environment variables.

---

Built by **Ahmed Al-Madani**
