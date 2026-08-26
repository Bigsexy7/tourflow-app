export type PassengerStatus = "pending" | "onboard" | "no-show";

export type Passenger = {
  id: string;
  name: string;
  time: string;
  hotel: string;
  pax: number;
  ref: string;
  phone: string;
  status: PassengerStatus;
};

export type ItineraryStop = {
  id: string;
  time: string;
  title: string;
  location: string;
  detail: string;
  state: "done" | "next" | "upcoming";
};

export type ExpenseLine = {
  name: string;
  amount: number;
  note?: string;
};

export type TourData = {
  tourRef: string;
  tourTitle: string;
  tourDate: string;
  guideName: string;
  vehicleReg: string;
  vehicleDesc: string;
  float: number;
  passengers: Passenger[];
  itinerary: ItineraryStop[];
  expenses: ExpenseLine[];
  liveStep: number;
};

export type ScannedFields = {
  tourRef: string;
  tourTitle: string;
  tourDate: string;
  guideName: string;
  vehicleReg: string;
  vehicleDesc: string;
  float: number;
  passengers: Passenger[];
  itinerary: ItineraryStop[];
  expenses: ExpenseLine[];
};
