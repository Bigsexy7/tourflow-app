import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ExpenseLine, ItineraryStop, Passenger, TourData } from "./types";

const STORAGE_KEY = "tourflow:tour-data";
const PIN_KEY = "tourflow:pin";
const DEFAULT_PIN = "1234";

const initialPassengers: Passenger[] = [
  { id: "p1", name: "Ahmed Abdelrazek Mohamed", time: "07:35", hotel: "7 Tufnell Lane, Bryanston", pax: 1, ref: "GYG996W7NLXM", phone: "+27825550184", status: "pending" },
  { id: "p2", name: "Lynn Diane Davis", time: "08:00", hotel: "Sandton Sun & Towers, 5th St, Sandown, Sandton", pax: 1, ref: "GYGN6BZK9N5A", phone: "+27825550221", status: "pending" },
  { id: "p3", name: "Alex Stewart", time: "08:25", hotel: "Four Seasons Hotel The Westcliff, 67 Jan Smuts Ave, Westcliff", pax: 2, ref: "GYG8LHF5K6RN", phone: "+27825550302", status: "pending" },
];

const initialItinerary: ItineraryStop[] = [
  { id: "s1", time: "07:35–08:25", title: "Guest pickups", location: "Bryanston · Sandton · Westcliff", detail: "3 bookings · 4 seats", state: "done" },
  { id: "s2", time: "09:20", title: "Constitution Hill", location: "11 Kotze Street, Braamfontein", detail: "Guided visit · 75 min", state: "done" },
  { id: "s3", time: "11:10", title: "Soweto orientation", location: "Vilakazi Street", detail: "Drive-through · 35 min", state: "next" },
  { id: "s4", time: "12:00", title: "Lunch", location: "Sakhumzi Restaurant", detail: "Prepaid · 60 min", state: "upcoming" },
  { id: "s5", time: "13:30", title: "Hector Pieterson Memorial", location: "8287 Khumalo Road, Orlando West", detail: "Hosted visit · 60 min", state: "upcoming" },
  { id: "s6", time: "15:20", title: "Return drop-offs", location: "Sandton / Bryanston", detail: "Confirm with guests", state: "upcoming" },
];

const initialExpenses: ExpenseLine[] = [
  { name: "Fuel", amount: 520, note: "Vehicle FOR61JB" },
  { name: "Toll gates", amount: 136, note: "M1 / N12" },
  { name: "Lunch top-up", amount: 420, note: "Sakhumzi Restaurant" },
  { name: "Parking", amount: 70, note: "Apartheid Museum" },
  { name: "Miscellaneous", amount: 0 },
];

const defaultTour: TourData = {
  tourRef: "JGY26082301",
  tourTitle: "Joburg, Soweto & Apartheid Museum",
  tourDate: "23/08/26",
  guideName: "Kamineth Lauren",
  vehicleReg: "FOR61JB",
  vehicleDesc: "Toyota Quantum",
  float: 1850,
  passengers: initialPassengers,
  itinerary: initialItinerary,
  expenses: initialExpenses,
  liveStep: 2,
};

function loadTour(): TourData {
  if (typeof window === "undefined") return defaultTour;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTour;
    const parsed = JSON.parse(raw) as Partial<TourData>;
    return { ...defaultTour, ...parsed };
  } catch {
    return defaultTour;
  }
}

type TourContextValue = {
  tour: TourData;
  setTour: (updater: TourData | ((prev: TourData) => TourData)) => void;
  updatePassenger: (id: string, patch: Partial<Passenger>) => void;
  setLiveStep: (step: number) => void;
  resetTour: () => void;
  isOnline: boolean;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [tour, setTourState] = useState<TourData>(loadTour);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tour));
    } catch {
      // storage unavailable; keep working in-memory
    }
  }, [tour]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const setTour = useCallback(
    (updater: TourData | ((prev: TourData) => TourData)) => {
      setTourState((prev) =>
        typeof updater === "function"
          ? (updater as (p: TourData) => TourData)(prev)
          : updater,
      );
    },
    [],
  );

  const updatePassenger = useCallback((id: string, patch: Partial<Passenger>) => {
    setTourState((prev) => ({
      ...prev,
      passengers: prev.passengers.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    }));
  }, []);

  const setLiveStep = useCallback((step: number) => {
    setTourState((prev) => ({ ...prev, liveStep: step }));
  }, []);

  const resetTour = useCallback(() => setTourState(defaultTour), []);

  const value = useMemo<TourContextValue>(
    () => ({ tour, setTour, updatePassenger, setLiveStep, resetTour, isOnline }),
    [tour, setTour, updatePassenger, setLiveStep, resetTour, isOnline],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}

export { DEFAULT_PIN, PIN_KEY };
