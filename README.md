# Lovair — Flight Management Web App (PWA)

Individual coursework project: search and book flights, live seat maps, reschedule/cancel, Zustand persistence, and installable PWA.

## Tech stack (per assignment)

| Requirement | Implementation |
|-------------|----------------|
| **Next.js 14+ App Router** | `src/app/` routes |
| **Supabase** | PostgreSQL, Auth, Realtime — `supabase/migrations/` |
| **Zustand + persist** | `src/stores/flightStore.ts`, `userStore.ts` |
| **Tailwind CSS** | `tailwind.config.ts` + `src/app/globals.css` |
| **PWA (bonus)** | `@ducanh2912/next-pwa` + `public/manifest.webmanifest` |

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Environment (copy and fill):

   ```bash
   cp .env.example .env.local
   ```

   Required:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon / publishable key only — never the service role key in the client)

3. Apply database migrations:

   ```bash
   npx supabase db push
   ```

4. Run development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

5. Production build:

   ```bash
   npm run build
   npm start
   ```

## App routes

| Route | Description |
|-------|-------------|
| `/` | Landing |
| `/search` | Step 1 — search form (Zustand persist) |
| `/results` | Step 2 — **Server Component** flight search + class fares |
| `/book/[flightId]` | Steps 3–4 — seat map (Realtime) + passenger + `book_seat` RPC |
| `/confirmation/[bookingId]` | PNR confirmation |
| `/bookings` | Manage trips, cancel/reschedule RPCs, offline cache |
| `/login` | Supabase Auth (email + Google) |
| `/offline` | PWA offline fallback |

## Assignment checklist

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md).

### Lighthouse PWA screenshot

After `npm run build && npm start`, run Chrome Lighthouse → PWA and save as `docs/lighthouse-pwa.png`.

## Project structure

```
src/app/              # Next.js App Router pages
src/components/       # SeatMap, UI, layout
src/lib/              # Supabase clients, server flight search
src/stores/           # Zustand stores
supabase/migrations/  # Schema, RLS, RPCs, seed data
public/               # PWA manifest & icons
```
