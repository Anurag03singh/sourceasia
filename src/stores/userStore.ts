import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type CachedBooking = {
  id: string;
  pnr_code: string;
  status: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  seat_number: string;
  total_price: number;
};

type UserStore = {
  sessionToken: string | null;
  userId: string | null;
  email: string | null;
  cachedBookings: CachedBooking[];
  setSession: (s: { token: string; userId: string; email: string | null } | null) => void;
  setCachedBookings: (b: CachedBooking[]) => void;
  reset: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      sessionToken: null,
      userId: null,
      email: null,
      cachedBookings: [],
      setSession: (s) =>
        set(
          s
            ? { sessionToken: s.token, userId: s.userId, email: s.email }
            : { sessionToken: null, userId: null, email: null },
        ),
      setCachedBookings: (b) => set({ cachedBookings: b }),
      reset: () => set({ sessionToken: null, userId: null, email: null, cachedBookings: [] }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as never))),
      // Only persist the session token + cached bookings for offline view
      partialize: (s) => ({
        sessionToken: s.sessionToken,
        cachedBookings: s.cachedBookings,
      }),
    },
  ),
);
