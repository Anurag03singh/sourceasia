# Lovair

A flight search and booking demo built with Next.js and Supabase. You can search routes, pick a seat from a live map, and cancel or reschedule bookings when the database rules allow it.

## Live Demo

- **Production:** https://sourceasia.vercel.app
- **GitHub:** https://github.com/Anurag03singh/sourceasia

## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase project

### 1. Clone and install
```bash
git clone https://github.com/Anurag03singh/sourceasia.git
cd sourceasia
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> 📌 Get these from your Supabase dashboard: Project Settings → API Keys (use the public `anon` key)

### 3. Apply database migrations
```bash
npx supabase db push
```

This creates tables for flights, seats, bookings, passengers, and reschedules, plus the booking/cancellation/reschedule RPCs.

### 4. Seed test data (optional)
To populate the database with test flights and seats:

```bash
npx supabase db execute --file supabase/seed.sql
```

**Test credentials** (after enabling email auth in Supabase):
- Email: `test@example.com`
- Password: `Test12345`

Or create a new account via the `/login` page.

### 5. Run locally
```bash
npm run dev
```

The app runs at `http://localhost:3000` (or 3001/3002 if ports are in use).

### Build for production
```bash
npm run build
npm run start
```

## Architecture

### Zustand Store Structure

The app uses two Zustand stores to manage state:

#### `flightStore` (`src/stores/flightStore.ts`)
Manages search and results state:
```typescript
{
  searchParams: {
    origin?: string;
    destination?: string;
    departDate?: string;
  };
  setSearchParams(params);
  clearSearchParams();
}
```

#### `userStore` (`src/stores/userStore.ts`)
Manages authenticated user session:
```typescript
{
  session: {
    token: string;
    userId: string;
    email: string | null;
  } | null;
  setSession(session);
}
```

These are wired into the React tree via `useAuthSync()` hook in `AppProviders`, which syncs Supabase auth state to the store on mount.

### Database Schema

**Tables:**
- `flights` — flight metadata (route, times, price, status)
- `seats` — seat inventory per flight (class, availability, extra fees)
- `bookings` — user bookings (references user, flight, seat, PNR code)
- `passengers` — passenger details per booking (name, passport, DOB)
- `reschedules` — booking reschedule history

**Key Functions (RPC):**
- `book_seat()` — atomic seat booking with race condition prevention
- `cancel_booking()` — cancel with 2-hour rule enforcement
- `reschedule_booking()` — reschedule to another flight on the same route

See `/supabase/migrations` for full schema.

## Vercel Deployment

This project is deployed on Vercel. To deploy your own:

1. Push the repository to GitHub.
2. Create a new Vercel project and connect to the repository.
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel runs `npm run build` automatically.

> ⚠️ Do not commit `.env.local` or any secret keys to Git.

## Stack

- **Framework:** Next.js 14 (App Router, server components, dynamic routes)
- **Database:** Supabase (PostgreSQL, Auth, Realtime)
- **State:** Zustand for search/booking/user state
- **Styling:** Tailwind CSS + custom components
- **PWA:** `@ducanh2912/next-pwa` (offline fallback)

## Routes

| Path | What it does |
|------|----------------|
| `/` | Home |
| `/search` | Search form (origin, destination, date) |
| `/results` | Server-side flight list with filter options |
| `/book/[flightId]` | Seat map + passenger form |
| `/confirmation/[bookingId]` | Booking receipt with PNR and details |
| `/bookings` | User's trips (view, cancel, reschedule) |
| `/login` | Email or Google sign-in |
| `/offline` | PWA fallback page |

## Features

- 🔍 **Search** flights by origin, destination, and date
- 💺 **Seat selection** with visual map and real-time availability
- 📋 **Passenger form** for each booking
- 🎫 **PNR code** generation and confirmation
- ✈️ **Manage bookings** — view, cancel, or reschedule
- 🔐 **Auth** with email/password or Google OAuth
- ⏰ **2-hour cancellation rule** enforced at the database level
- 🌐 **Realtime** seat availability updates
- 📱 **PWA support** with offline fallback

## Testing

### Manual test flow
1. Go to `/search` and search for flights
2. Click a flight to book
3. Select a seat from the seat map
4. Fill in passenger details and confirm
5. View your PNR in the confirmation page
6. Go to `/bookings` to cancel or reschedule

### Available test flights
After running `supabase/seed.sql`:
- LV101: New York → London (2 days)
- LV102: New York → Paris (3 days)
- LV103: London → Dubai (1 day)
- LV104: Paris → Tokyo (4 days)
- LV105: New York → Los Angeles (5 hours)

## Performance

- **Lighthouse PWA Score:** 92/100 (with manifest and service worker)
- **Performance:** ~45/100 (due to Supabase latency on free tier)
- **Accessibility:** 90/100
- **Best Practices:** 96/100
- **SEO:** 90/100

To generate a Lighthouse PWA report locally, see [docs/LIGHTHOUSE.md](docs/LIGHTHOUSE.md).

## Troubleshooting

### "Missing NEXT_PUBLIC_SUPABASE_URL" error
Make sure `.env.local` has the correct Supabase credentials and the dev server is restarted.

### Seats not updating in real-time
Check Supabase project settings → Realtime → confirm the tables have realtime enabled.

### Cancellation failing with "not allowed within 2 hours"
The flight departs in less than 2 hours. Cancellations are only allowed 2+ hours before departure.

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for the full assignment checklist.
