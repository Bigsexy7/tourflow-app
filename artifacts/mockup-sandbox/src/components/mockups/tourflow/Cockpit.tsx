import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, CarFront, Check, CircleCheck as CheckCircle2, CircleAlert, ClipboardCheck, Clock3, FileScan, MapPin, MessageCircle, Navigation, RefreshCw, Send, UserCheck, UsersRound, WalletCards, Waypoints, X, Zap } from "lucide-react";
import { useTour } from "./TourContext";
import {
  Button,
  IconBubble,
  SectionLabel,
  StatusPill,
  initials,
  navigationUrl,
  whatsappUrl,
} from "./ui";
import type { Passenger, PassengerStatus } from "./types";

type Tab = "cockpit" | "guest" | "expenses" | "scanner";

function PassengerRow({
  passenger,
  onStatus,
  onEdit,
  alertSent,
  onAlert,
  delayMinutes,
}: {
  passenger: Passenger;
  onStatus: (id: string, status: PassengerStatus) => void;
  onEdit: (p: Passenger) => void;
  alertSent: boolean;
  onAlert: () => void;
  delayMinutes: number;
}) {
  return (
    <div className="border-b border-[#e9ede5] py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dbe7da] text-[11px] font-extrabold text-[#38604c]">
          {initials(passenger.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              onClick={() => onEdit(passenger)}
              className="text-[13px] font-extrabold text-[#263f36] underline-offset-2 hover:underline"
            >
              {passenger.name}
            </button>
            <span className="rounded-md bg-[#f2f1ea] px-1.5 py-0.5 text-[9px] font-bold text-[#78867d]">
              {passenger.pax} pax
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#718078]">
            <Clock3 size={12} /> {passenger.time}{" "}
            <span className="text-[#b3bdb5]">·</span> {passenger.hotel}
          </p>
          <p className="mt-1 font-mono text-[9px] tracking-wide text-[#a0aba3]">
            {passenger.ref}
          </p>
        </div>
        <StatusPill status={passenger.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 pl-[52px]">
        {passenger.status !== "onboard" ? (
          <Button
            variant="outline"
            className="min-h-8 px-2.5 text-[10px]"
            icon={UserCheck}
            onClick={() => onStatus(passenger.id, "onboard")}
          >
            Mark onboard
          </Button>
        ) : (
          <Button
            variant="soft"
            className="min-h-8 px-2.5 text-[10px]"
            icon={Check}
            onClick={() => onStatus(passenger.id, "pending")}
          >
            Undo onboard
          </Button>
        )}
        {passenger.status !== "no-show" ? (
          <Button
            variant="ghost"
            className="min-h-8 px-2.5 text-[10px]"
            icon={X}
            onClick={() => onStatus(passenger.id, "no-show")}
          >
            No-show
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="min-h-8 px-2.5 text-[10px]"
            icon={RefreshCw}
            onClick={() => onStatus(passenger.id, "pending")}
          >
            Restore guest
          </Button>
        )}
        <a
          href={`tel:${passenger.phone}`}
          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#597065] transition hover:bg-[#edf1e9]"
          aria-label={`Call ${passenger.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </a>
        <a
          href={navigationUrl(passenger.hotel)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#597065] transition hover:bg-[#edf1e9]"
          aria-label={`Navigate to ${passenger.hotel}`}
        >
          <Navigation size={15} />
        </a>
        {delayMinutes > 0 ? (
          <Button
            variant={alertSent ? "soft" : "danger"}
            className="min-h-8 px-2.5 text-[10px]"
            icon={alertSent ? Check : Send}
            onClick={onAlert}
          >
            {alertSent ? "Alert sent" : "Alert guest"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function RouteMap() {
  const points = [
    { left: "15%", top: "70%", label: "Bryanston", color: "#d77943" },
    { left: "32%", top: "57%", label: "Sandton", color: "#d77943" },
    { left: "45%", top: "42%", label: "Westcliff", color: "#d77943" },
    { left: "62%", top: "33%", label: "Constitution Hill", color: "#5f8b66" },
    { left: "80%", top: "65%", label: "Hector Pieterson", color: "#285d67" },
  ];
  return (
    <div
      className="relative mt-4 h-[270px] overflow-hidden rounded-2xl bg-[#e4e9dd]"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(255,255,255,.38) 1px, transparent 1px), linear-gradient(30deg, rgba(255,255,255,.26) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }}
    >
      <div className="absolute left-[12%] top-[49%] h-[1px] w-[72%] rotate-[-22deg] border-t border-dashed border-[#819889]" />
      <div className="absolute left-3 top-3 rounded-lg bg-[#f7f4ed]/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#6c7d71] backdrop-blur-sm">
        Live route
      </div>
      {points.map((point, index) => (
        <div
          key={point.label}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: point.left, top: point.top }}
        >
          <div
            className="relative flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#f5f3eb]"
            style={{ backgroundColor: point.color }}
          >
            {index === 2 ? (
              <CarFront size={13} className="text-[#fffaf0]" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-[#fffaf0]" />
            )}
          </div>
          <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#f8f6ef]/85 px-1.5 py-0.5 text-[9px] font-bold text-[#50675b] backdrop-blur-sm">
            {point.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function EditPassengerModal({
  passenger,
  onSave,
  onClose,
}: {
  passenger: Passenger;
  onSave: (patch: Partial<Passenger>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(passenger);
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-[#173f35]/50 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-[#fffdf8] p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-[20px] font-bold tracking-[-0.03em] text-[#294a3e]">
            Edit guest
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#809087] hover:bg-[#edf1e9]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {(
            [
              { key: "name", label: "Full name", type: "text" },
              { key: "phone", label: "WhatsApp / phone", type: "tel" },
              { key: "hotel", label: "Pickup location", type: "text" },
              { key: "time", label: "Pickup time", type: "text" },
            ] as const
          ).map((f) => (
            <div key={f.key}>
              <label className="text-[10px] font-bold uppercase tracking-wide text-[#7b897f]">
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key] as string}
                onChange={(e) =>
                  setForm({ ...form, [f.key]: e.target.value })
                }
                className="mt-1 w-full rounded-xl border border-[#dbe4d8] bg-[#fbfaf5] px-3 py-2.5 text-sm font-bold text-[#345548] outline-none focus:border-[#c98255] focus:ring-2 focus:ring-[#edcfb6]"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide text-[#7b897f]">
              Pax count
            </label>
            <input
              type="number"
              min={1}
              value={form.pax}
              onChange={(e) =>
                setForm({ ...form, pax: Number(e.target.value) || 1 })
              }
              className="mt-1 w-full rounded-xl border border-[#dbe4d8] bg-[#fbfaf5] px-3 py-2.5 text-sm font-bold text-[#345548] outline-none focus:border-[#c98255] focus:ring-2 focus:ring-[#edcfb6]"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            icon={Check}
            onClick={() => {
              onSave({
                name: form.name,
                phone: form.phone,
                hotel: form.hotel,
                time: form.time,
                pax: form.pax,
              });
              onClose();
            }}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Cockpit({
  setTab,
  flash,
}: {
  setTab: (t: Tab) => void;
  flash: (m: string) => void;
}) {
  const { tour, updatePassenger } = useTour();
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [alertSent, setAlertSent] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<Passenger | null>(null);

  const totalPax = useMemo(
    () => tour.passengers.reduce((s, p) => s + p.pax, 0),
    [tour.passengers],
  );
  const onboard = tour.passengers
    .filter((p) => p.status === "onboard")
    .reduce((s, p) => s + p.pax, 0);
  const doneStops = tour.itinerary.filter((s) => s.state === "done").length;
  const routePct = tour.itinerary.length
    ? Math.round((doneStops / tour.itinerary.length) * 100)
    : 0;
  const nextStop =
    tour.itinerary.find((s) => s.state === "next") ??
    tour.itinerary.find((s) => s.state === "upcoming");

  const updateStatus = (id: string, status: PassengerStatus) => {
    updatePassenger(id, { status });
    flash(
      status === "onboard"
        ? "Guest marked onboard"
        : status === "no-show"
          ? "Guest marked as no-show"
          : "Guest returned to pickup list",
    );
  };

  const sendAlert = (id: string) => {
    setAlertSent((c) => ({ ...c, [id]: true }));
    flash("WhatsApp delay alert queued for guest");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#af5e37]">
            <CalendarDays size={14} /> {tour.tourDate}
          </p>
          <h1 className="font-serif text-[34px] font-bold leading-[0.98] tracking-[-0.055em] text-[#173f35] sm:text-[42px]">
            Run the day,
            <br />
            <span className="text-[#b75d32]">not the paperwork.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6b7970]">
            {tour.tourTitle} · Ref {tour.tourRef}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-[#d9e3d7] bg-[#fbfaf5] px-3 py-2.5 sm:self-auto">
          <div className="flex -space-x-2">
            {tour.passengers.map((p) => (
              <div
                key={p.id}
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#fbfaf5] bg-[#dce8da] text-[8px] font-black text-[#3e6651]"
              >
                {initials(p.name)}
              </div>
            ))}
          </div>
          <div className="ml-1">
            <p className="text-[11px] font-extrabold text-[#335347]">
              {onboard} / {totalPax} onboard
            </p>
            <p className="text-[9px] text-[#819087]">guest manifest</p>
          </div>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[24px] bg-[#204f42] p-5 text-[#fff8e8] shadow-[0_16px_36px_rgba(28,68,54,0.12)] sm:p-6">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-[#d98a55]/15" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9c4ae]">
              <Zap size={14} className="text-[#f0af70]" /> Next decision
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e2915e] text-[#204f42]">
                <MapPin size={20} />
              </div>
              <div>
                <h2 className="font-serif text-[25px] font-bold tracking-[-0.035em]">
                  {nextStop?.title ?? "Tour complete"}
                </h2>
                <p className="mt-1 text-xs text-[#b7d0bb]">
                  {nextStop?.location ?? ""}{" "}
                  {nextStop ? (
                    <span className="mx-1.5 text-[#6f9882]">·</span>
                  ) : (
                    ""
                  )}{" "}
                  {nextStop?.time ?? ""}
                </p>
              </div>
            </div>
          </div>
          {nextStop && (
            <div className="flex flex-wrap gap-2">
              <a
                href={navigationUrl(nextStop.location)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f2bd83] px-4 text-xs font-extrabold text-[#24473b] transition hover:bg-[#ffd19f]"
              >
                <Navigation size={15} /> Start navigation{" "}
                <ArrowUpRight size={14} />
              </a>
              <Button
                variant="outline"
                className="min-h-11 border-[#52776a] bg-transparent text-[#fff8e8] hover:bg-[#326354] hover:text-[#fff8e8]"
                icon={MessageCircle}
                onClick={() => flash("Guest group message opened in WhatsApp")}
              >
                Message group
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: UsersRound,
            label: "Guest manifest",
            value: String(totalPax),
            detail: `${tour.passengers.length} bookings`,
            tone: "orange" as const,
          },
          {
            icon: Waypoints,
            label: "Route progress",
            value: `${routePct}%`,
            detail: `${doneStops} of ${tour.itinerary.length} stops`,
            tone: "sage" as const,
          },
          {
            icon: Clock3,
            label: "Timing health",
            value: delayMinutes === 0 ? "On time" : `+${delayMinutes}m`,
            detail:
              delayMinutes === 0 ? "Tracking to plan" : "Delay active",
            tone: "blue" as const,
          },
        ].map(({ icon, label, value, detail, tone }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)]"
          >
            <div className="flex items-center justify-between">
              <IconBubble icon={icon} tone={tone} />
              <span className="text-[10px] font-semibold text-[#94a199]">
                {label}
              </span>
            </div>
            <p className="mt-3 font-serif text-[25px] font-bold tracking-[-0.04em] text-[#25463b]">
              {value}
            </p>
            <p className="mt-0.5 text-[10px] text-[#79877e]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] px-4 py-2 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:px-5">
          <div className="flex items-center justify-between border-b border-[#e9ede5] py-4">
            <div>
              <SectionLabel>Guest manifest</SectionLabel>
              <h2 className="font-serif text-[22px] font-bold tracking-[-0.04em] text-[#294a3e]">
                Pickup decisions
              </h2>
            </div>
            <span className="rounded-full bg-[#eff4ec] px-2.5 py-1 text-[10px] font-bold text-[#547263]">
              {tour.passengers.length} bookings
            </span>
          </div>
          {tour.passengers.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#819087]">
              No passengers yet. Scan a waybill to load the manifest.
            </p>
          ) : (
            tour.passengers.map((p) => (
              <PassengerRow
                key={p.id}
                passenger={p}
                onStatus={updateStatus}
                onEdit={setEditing}
                delayMinutes={delayMinutes}
                alertSent={Boolean(alertSent[p.id])}
                onAlert={() => sendAlert(p.id)}
              />
            ))
          )}
        </section>
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <SectionLabel>Road picture</SectionLabel>
              <h2 className="font-serif text-[22px] font-bold tracking-[-0.04em] text-[#294a3e]">
                Today's route
              </h2>
            </div>
            <Button
              variant="ghost"
              className="min-h-8 px-2 text-[10px]"
              icon={RefreshCw}
              onClick={() => flash("Route refreshed from live traffic")}
            >
              Refresh
            </Button>
          </div>
          <RouteMap />
          <div className="mt-3 flex items-center justify-between text-[10px] text-[#78877d]">
            <span className="flex items-center gap-1.5">
              <CarFront size={13} /> {tour.vehicleReg} · {tour.vehicleDesc}
            </span>
            <span className="font-bold text-[#4e7061]">Traffic light</span>
          </div>
        </section>
      </div>

      <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionLabel>Keep guests in the loop</SectionLabel>
            <h2 className="font-serif text-[22px] font-bold tracking-[-0.04em] text-[#294a3e]">
              Delay control
            </h2>
            <p className="mt-1 text-xs text-[#7c8980]">
              One update keeps the whole group relaxed.
            </p>
          </div>
          <div className="flex rounded-xl bg-[#f1f3eb] p-1">
            {[0, 10, 20, 30].map((minutes) => (
              <button
                key={minutes}
                onClick={() => {
                  setDelayMinutes(minutes);
                  if (minutes === 0) flash("Schedule returned to on time");
                }}
                className={`min-h-9 rounded-lg px-3 text-[11px] font-extrabold transition ${
                  delayMinutes === minutes
                    ? "bg-[#fffdf8] text-[#ae552e] shadow-sm"
                    : "text-[#718178] hover:text-[#3b5a4c]"
                }`}
              >
                {minutes === 0 ? "On time" : `+${minutes} min`}
              </button>
            ))}
          </div>
        </div>
        {delayMinutes === 0 ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-[#cbd9cb] bg-[#f4f7f0] px-4 py-3 text-xs text-[#61786a]">
            <CheckCircle2 size={17} className="text-[#5f9367]" /> You're tracking
            to plan.
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#edcfbf] bg-[#fff7f0] p-3.5">
            <div className="flex items-start gap-2.5">
              <CircleAlert
                size={17}
                className="mt-0.5 shrink-0 text-[#c4663d]"
              />
              <p className="text-xs leading-5 text-[#805846]">
                Your group is currently{" "}
                <strong>{delayMinutes} minutes behind plan</strong>. Send a calm
                ETA update to each guest below.
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {tour.passengers.map((p) => (
                <a
                  key={p.id}
                  href={whatsappUrl(
                    p.phone,
                    `Hi ${p.name.split(" ")[0]}, a quick update from African Eagle Day Tours: we are running ${delayMinutes} minutes behind schedule. We will keep you posted.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#e9c9b6] bg-[#fffdf8] px-3 text-[10px] font-bold text-[#9d5232] transition hover:bg-[#fae5d7]"
                >
                  <MessageCircle size={13} /> {p.name.split(" ")[0]}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[22px] border border-[#dbe5d9] bg-[#e9f0e5] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <IconBubble icon={ClipboardCheck} tone="sage" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5f7868]">
                End-of-day handover
              </p>
              <h2 className="mt-1 font-serif text-[20px] font-bold tracking-[-0.03em] text-[#294d3d]">
                Close the loop before you park.
              </h2>
              <p className="mt-1 text-xs text-[#6d8175]">
                Upload the signed waybill and reconcile your road expenses.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setTab("expenses")}
              icon={WalletCards}
            >
              Expenses
            </Button>
            <Button
              variant="primary"
              onClick={() => setTab("scanner")}
              icon={FileScan}
            >
              Scan waybill
            </Button>
          </div>
        </div>
      </section>

      {editing && (
        <EditPassengerModal
          passenger={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            updatePassenger(editing.id, patch);
            flash("Guest details updated");
          }}
        />
      )}
    </div>
  );
}
