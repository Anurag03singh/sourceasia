# Lovair

A flight search and booking demo built with Next.js and Supabase. You can search routes, pick a seat from a live map, and cancel or reschedule bookings when the database rules allow it.

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your Supabase URL and anon key to `.env.local`, then apply migrations:

```bash
npx supabase db push
```

Run the app:

```bash
npm run dev
```

## Stack

- Next.js 14 (App Router)
- Supabase (Postgres, Auth, Realtime)
- Zustand for search/booking state
- Tailwind CSS
- PWA via `@ducanh2912/next-pwa`

## Routes

| Path | What it does |
|------|----------------|
| `/` | Home |
| `/search` | Search form |
| `/results` | Server-side flight list |
| `/book/[flightId]` | Seat map + passenger form |
| `/confirmation/[bookingId]` | Booking receipt |
| `/bookings` | Your trips |
| `/login` | Email or Google sign-in |
| `/offline` | PWA fallback page |

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for the assignment checklist.
