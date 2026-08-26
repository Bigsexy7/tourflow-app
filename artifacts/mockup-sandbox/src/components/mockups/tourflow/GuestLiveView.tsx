import {
  Check,
  Compass,
  Headphones,
  Landmark,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useTour } from "./TourContext";
import { navigationUrl, whatsappUrl } from "./ui";

const GUIDE_HOTLINE = "+27117767700";

export function GuestLiveView({ guestId }: { guestId: string }) {
  const { tour } = useTour();
  const guest = tour.passengers.find((p) => p.id === guestId);

  if (!guest) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#e8efe3] px-4 text-center">
        <div>
          <Compass size={40} className="mx-auto mb-4 text-[#204f42]" />
          <h1 className="font-serif text-2xl font-bold text-[#214e40]">
            Tour link not found
          </h1>
          <p className="mt-2 text-sm text-[#708476]">
            This guest tracking link is invalid or has expired. Please contact
            your tour operator.
          </p>
        </div>
      </div>
    );
  }

  // Checkpoints come from the live itinerary, so a freshly scanned waybill
  // cascades straight through to the guest view.
  const liveStops = [
    {
      title: "Your pickup",
      detail: `${guest.time} · ${guest.hotel}`,
      icon: MapPin,
    },
    ...tour.itinerary
      .filter((stop) => !/pickup/i.test(stop.title))
      .map((stop) => ({
        title: stop.title,
        detail: [stop.time, stop.location].filter(Boolean).join(" · "),
        icon: Landmark,
      })),
  ];

  const liveStep = tour.liveStep;

  return (
    <div
      className="min-h-[100dvh] bg-[#e8efe3] px-4 py-6"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#df8753] text-[#204f42]">
            <Compass size={18} />
          </div>
          <div>
            <p className="font-serif text-[17px] font-bold leading-none text-[#214e40]">
              African Eagle
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#708476]">
              TourFlow guest view
            </p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[9px] font-bold text-[#5e7366]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#639168]" />{" "}
            LIVE
          </span>
        </div>

        <div className="rounded-2xl bg-[#204f42] p-5 text-[#fff8e8]">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a9c4ae]">
            {tour.tourDate}
          </p>
          <h2 className="mt-2 font-serif text-[24px] font-bold leading-[1.05]">
            {tour.tourTitle}
          </h2>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-[#173f35] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#df8753] font-bold text-[#204f42]">
                {tour.guideName.charAt(0)}
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#fff8e8]">
                  Your guide: {tour.guideName}
                </p>
                <p className="text-[10px] text-[#aac2b2]">
                  Vehicle: {tour.vehicleReg}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <a
                href={`tel:${GUIDE_HOTLINE}`}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#df8753] px-3 py-2 text-[10px] font-extrabold text-[#204f42] transition hover:bg-[#f0a06a]"
              >
                <Phone size={12} /> Call
              </a>
              <a
                href={whatsappUrl(
                  GUIDE_HOTLINE,
                  `Hi ${tour.guideName}, this is ${guest.name} from the ${tour.tourTitle} tour.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#2f6b4f] px-3 py-2 text-[10px] font-extrabold text-[#fff8e8] transition hover:bg-[#3a8060]"
              >
                <MessageCircle size={12} /> WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-[#173f35] p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8fb3a0]">
              Your pickup
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <MapPin size={14} className="text-[#f0bf8d]" />
              <p className="text-[12px] font-bold text-[#fff8e8]">
                {guest.time} · {guest.hotel}
              </p>
            </div>
            <a
              href={navigationUrl(guest.hotel)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#f2bd83]"
            >
              <Navigation size={12} /> View pickup on map
            </a>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#fbfaf4] p-4 shadow-sm">
          <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#5e7366]">
            Tour progress
          </h3>
          <div className="space-y-2.5">
            {liveStops.map((stop, index) => {
              const Icon = stop.icon;
              const isDone = index < liveStep;
              const isCurrent = index === liveStep;
              return (
                <div
                  key={stop.title}
                  className={`flex items-center gap-3 ${
                    isCurrent
                      ? "opacity-100"
                      : isDone
                        ? "opacity-70"
                        : "opacity-45"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isCurrent
                        ? "bg-[#f0bf8d] text-[#944825]"
                        : "bg-[#d4e2d4] text-[#52705d]"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#335548]">
                      {stop.title}
                    </p>
                    <p className="text-[9px] text-[#728379]">{stop.detail}</p>
                  </div>
                  {isDone ? (
                    <Check size={14} className="ml-auto text-[#5d9468]" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f8f6ef] px-3 py-2.5 text-[10px] text-[#6b7c70]">
          <Headphones size={14} className="text-[#c36b3c]" /> Need help?{" "}
          <span className="font-bold text-[#315c4a]">
            Call African Eagle: +27 11 776 7700
          </span>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-[#1a3d6e]/10 bg-[#1a3d6e]/5 px-3 py-2 text-[10px] text-[#285d67]">
          <ShieldCheck size={13} /> 24/7 Operations Support Active
        </div>

        <p className="mt-4 text-center text-[9px] text-[#82958a]">
          <UsersRound size={11} className="mr-1 inline" /> Your privacy is
          protected. No other guest details are visible on this page.
        </p>
      </div>
    </div>
  );
}
