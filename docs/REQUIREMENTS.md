# Assignment requirements checklist

| Requirement | Status | Location |
|-------------|--------|----------|
| **Next.js 14+ App Router** | ✅ | `src/app/**` |
| **Supabase schema + migrations** | ✅ | `supabase/migrations/` |
| **RLS on all tables** | ✅ | Migration SQL |
| **RPC seat lock (`book_seat`)** | ✅ | `FOR UPDATE` + atomic booking |
| **2h cancellation trigger** | ✅ | `enforce_cancellation_window` |
| **Seed 8 flights / 4 routes / seat maps** | ✅ | Seed in migration |
| **Supabase Auth** | ✅ | `/login`, middleware |
| **Task 01 — Search → confirm** | ✅ | `/search` … `/confirmation/[id]` |
| **Server-side Supabase on results** | ✅ | `src/app/results/page.tsx` + `lib/flights.ts` |
| **Task 02 — Seat map + Realtime** | ✅ | `SeatMap.tsx` |
| **Task 03 — Cancel / reschedule** | ✅ | `bookings-view.tsx` + RPCs |
| **Task 04 — Zustand persist + partialize** | ✅ | `stores/*.ts` |
| **Optimistic seat selection** | ✅ | `optimisticSeatIds` in SeatMap |
| **Reset on logout / cancel** | ✅ | Nav + cancel handler |
| **Task 05 — PWA** | ✅ | `next.config.mjs` + manifest + `/offline` |
| **Offline My Bookings** | ✅ | `cachedBookings` in userStore |
| **TypeScript, no `any`** | ✅ | Strict TS |
| **Responsive UI** | ✅ | Tailwind mobile-first |

## PWA audit

```bash
npm run build && npm start
```

Chrome DevTools → Lighthouse → Progressive Web App → save `docs/lighthouse-pwa.png`.
