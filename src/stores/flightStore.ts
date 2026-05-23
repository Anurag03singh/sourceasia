import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SearchQuery = {
  origin: string;
  destination: string;
  date: string; // ISO date
  passengers: number;
};

export type PassengerForm = {
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string; // ISO date
};

export type BookingStep = "search" | "results" | "seat" | "passenger" | "confirm";

type FlightStore = {
  searchQuery: SearchQuery;
  selectedFlightId: string | null;
  selectedSeatId: string | null;
  optimisticSeatIds: string[]; // optimistic selection before write confirms
  currentStep: BookingStep;
  passengerForm: PassengerForm;
  setSearchQuery: (q: Partial<SearchQuery>) => void;
  setSelectedFlight: (id: string | null) => void;
  setSelectedSeat: (id: string | null) => void;
  markSeatOptimistic: (id: string) => void;
  clearSeatOptimistic: (id: string) => void;
  setStep: (s: BookingStep) => void;
  setPassengerForm: (p: Partial<PassengerForm>) => void;
  resetBooking: () => void;
};

const initialSearch: SearchQuery = { origin: "", destination: "", date: "", passengers: 1 };
const initialPassenger: PassengerForm = { full_name: "", passport_no: "", nationality: "", dob: "" };

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: initialSearch,
      selectedFlightId: null,
      selectedSeatId: null,
      optimisticSeatIds: [],
      currentStep: "search",
      passengerForm: initialPassenger,
      setSearchQuery: (q) => set((s) => ({ searchQuery: { ...s.searchQuery, ...q } })),
      setSelectedFlight: (id) => set({ selectedFlightId: id }),
      setSelectedSeat: (id) => set({ selectedSeatId: id }),
      markSeatOptimistic: (id) =>
        set((s) => ({ optimisticSeatIds: [...new Set([...s.optimisticSeatIds, id])] })),
      clearSeatOptimistic: (id) =>
        set((s) => ({ optimisticSeatIds: s.optimisticSeatIds.filter((x) => x !== id) })),
      setStep: (s) => set({ currentStep: s }),
      setPassengerForm: (p) => set((s) => ({ passengerForm: { ...s.passengerForm, ...p } })),
      resetBooking: () =>
        set({
          selectedFlightId: null,
          selectedSeatId: null,
          optimisticSeatIds: [],
          currentStep: "search",
          passengerForm: initialPassenger,
        }),
    }),
    {
      name: "flight-store",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as never))),
      // Exclude sensitive passport data from localStorage
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlightId: state.selectedFlightId,
        selectedSeatId: state.selectedSeatId,
        currentStep: state.currentStep,
        passengerForm: {
          full_name: state.passengerForm.full_name,
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
          passport_no: "", // never persist passport numbers
        },
      }),
    },
  ),
);
