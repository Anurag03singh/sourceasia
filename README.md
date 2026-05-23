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

## Vercel deployment

This project can deploy directly to Vercel from the GitHub repository.

1. Push this repository to GitHub.
2. Create a new Vercel project and connect it to the repository.
3. In Vercel project settings, add these environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel will run `npm install` and `npm run build` automatically.

> Use the same Supabase values as in `.env.local`, and do not commit secret keys to Git.

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
