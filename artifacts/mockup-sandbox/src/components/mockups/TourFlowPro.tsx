import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  CloudSun,
  Compass,
  Copy,
  DollarSign,
  FileCheck2,
  FileScan,
  Gauge,
  Globe2,
  HandCoins,
  Headphones,
  Landmark,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Paperclip,
  Phone,
  Receipt,
  RefreshCw,
  ScanLine,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserCheck,
  UsersRound,
  WalletCards,
  Waypoints,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect } from "react";

type Tab = "cockpit" | "guest" | "expenses" | "scanner";
type PassengerStatus = "pending" | "onboard" | "no-show";

type Passenger = {
  id: number;
  name: string;
  time: string;
  hotel: string;
  pax: number;
  ref: string;
  phone: string;
  status: PassengerStatus;
};

type ItineraryStop = {
  time: string;
  title: string;
  location: string;
  detail: string;
  state: "done" | "next" | "upcoming";
};

const initialPassengers: Passenger[] = [
  {
    id: 1,
    name: "Ahmed Abdelrazek Mohamed",
    time: "07:35",
    hotel: "Bryanston",
    pax: 1,
    ref: "GYG996W7NLXM",
    phone: "+27825550184",
    status: "pending",
  },
  {
    id: 2,
    name: "Lynn Diane Davis",
    time: "08:00",
    hotel: "Sandton Sun & Towers",
    pax: 1,
    ref: "GYGN6BZK9N5A",
    phone: "+27825550221",
    status: "pending",
  },
  {
    id: 3,
    name: "Alex Stewart",
    time: "08:25",
    hotel: "Four Seasons Hotel The Westcliff",
    pax: 2,
    ref: "GYG8LHF5K6RN",
    phone: "+27825550302",
    status: "pending",
  },
];

const itinerary: ItineraryStop[] = [
  {
    time: "07:35–08:25",
    title: "Guest pickups",
    location: "Bryanston · Sandton · Westcliff",
    detail: "3 guests · 4 seats",
    state: "done",
  },
  {
    time: "09:20",
    title: "Constitution Hill",
    location: "11 Kotze Street, Braamfontein",
    detail: "Guided visit · 75 min",
    state: "done",
  },
  {
    time: "11:10",
    title: "Soweto orientation",
    location: "Vilakazi Street",
    detail: "Drive-through · 35 min",
    state: "next",
  },
  {
    time: "12:00",
    title: "Lunch",
    location: "Sakhumzi Restaurant",
    detail: "Prepaid · 60 min",
    state: "upcoming",
  },
  {
    time: "13:30",
    title: "Hector Pieterson Memorial",
    location: "8287 Khumalo Road, Orlando West",
    detail: "Hosted visit · 60 min",
    state: "upcoming",
  },
  {
    time: "15:20",
    title: "Return drop-offs",
    location: "Sandton / Bryanston",
    detail: "Confirm with guests",
    state: "upcoming",
  },
];

const navigationUrl = (destination: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination + ", Johannesburg")}`;

const whatsappUrl = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

function IconBubble({
  icon: Icon,
  tone = "orange",
}: {
  icon: LucideIcon;
  tone?: "orange" | "sage" | "blue" | "ink";
}) {
  const toneClass = {
    orange: "bg-[#f7ddbd] text-[#a44c23]",
    sage: "bg-[#dce6d5] text-[#35624d]",
    blue: "bg-[#d7e5e7] text-[#285d67]",
    ink: "bg-[#dce1d9] text-[#1d332d]",
  }[tone];
  return (
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
      <Icon size={17} strokeWidth={2} />
    </span>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6c7970]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#d26f3f]" />
      {children}
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "ghost" | "outline" | "danger";
  className?: string;
  icon?: LucideIcon;
  type?: "button" | "submit";
}) {
  const variants = {
    primary: "bg-[#17483d] text-[#fffaf0] shadow-[0_8px_18px_rgba(23,72,61,0.14)] hover:bg-[#236052]",
    soft: "bg-[#f8e4ca] text-[#8e4828] hover:bg-[#f2d4b0]",
    ghost: "text-[#466057] hover:bg-[#edf0e8]",
    outline: "border border-[#ccd5c9] bg-[#fffdf8] text-[#315348] hover:border-[#9aaea0] hover:bg-[#f4f6ef]",
    danger: "border border-[#edc9bd] bg-[#fff7f2] text-[#aa4c30] hover:bg-[#fbe8df]",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-bold transition-all duration-200 active:translate-y-px ${variants} ${className}`}
    >
      {Icon ? <Icon size={15} strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: PassengerStatus }) {
  const content = {
    pending: {
      label: "Awaiting pickup",
      cls: "bg-[#f4eee1] text-[#7a6c53]",
      icon: Clock3,
    },
    onboard: {
      label: "On board",
      cls: "bg-[#e0efdf] text-[#356447]",
      icon: CheckCircle2,
    },
    "no-show": {
      label: "No-show",
      cls: "bg-[#fae4dd] text-[#a54d38]",
      icon: CircleAlert,
    },
  }[status];
  const Icon = content.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${content.cls}`}>
      <Icon size={12} />
      {content.label}
    </span>
  );
}

function Header({
  tab,
  setTab,
  onMenu,
}: {
  tab: Tab;
  setTab: (tab: Tab) => void;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dfe5dc] bg-[#f7f4ed]/95 backdrop-blur-md">
      <div className="flex h-[72px] items-center justify-between px-4 sm:px-7 lg:px-10">
        <div className="flex items-center gap-3">
          <button className="rounded-lg p-2 text-[#496258] lg:hidden" onClick={onMenu} aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <div className="lg:hidden">
            <p className="font-serif text-[19px] font-bold tracking-[-0.04em] text-[#173f35]">TourFlow<span className="text-[#cd6b38]">.</span></p>
          </div>
          <div className="hidden items-center gap-2 text-sm text-[#6b786f] lg:flex">
            <span className="font-semibold text-[#2c4c41]">Operations</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-[#b06945]">{tab === "cockpit" ? "Guide cockpit" : tab === "guest" ? "Guest live view" : tab === "expenses" ? "Waybill reconciliation" : "Waybill scanner"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-[#dce4d8] bg-[#fbfaf5] px-3 py-2 text-[11px] font-bold text-[#5a6c62] sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#60915f]" />
            Syncing live
          </div>
          <button className="relative rounded-xl p-2 text-[#50655b] transition hover:bg-[#e9eee5]" onClick={() => setTab("guest")} aria-label="Open alerts">
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[#f7f4ed] bg-[#d26f3f]" />
          </button>
          <div className="flex items-center gap-2.5 border-l border-[#dce3da] pl-3 sm:pl-4">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#29483e]">Kamineth Lauren</p>
              <p className="text-[10px] text-[#819087]">Guide · JHB</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7e2d3] text-xs font-extrabold text-[#315a47]">KL</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const items: { id: Tab; label: string; icon: LucideIcon; detail?: string }[] = [
    { id: "cockpit", label: "Guide cockpit", icon: LayoutDashboard, detail: "Today’s run" },
    { id: "guest", label: "Guest live view", icon: Globe2, detail: "Shareable status" },
    { id: "expenses", label: "Reconciliation", icon: WalletCards, detail: "Waybill expenses" },
    { id: "scanner", label: "Upload scanner", icon: FileScan, detail: "OCR waybill" },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#173f35] px-5 py-6 text-[#dce7d8] lg:flex">
      <div className="mb-14 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#e28a52] text-[#173f35] shadow-[0_8px_18px_rgba(226,138,82,0.22)]">
          <Compass size={21} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-serif text-[22px] font-bold leading-none tracking-[-0.05em] text-[#fff8e9]">TourFlow<span className="text-[#eb9b65]">.</span></p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#93b39f]">African Eagle Day Tours</p>
        </div>
      </div>
      <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#78988a]">Your command centre</div>
      <nav className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${active ? "bg-[#e5e8d9] text-[#1d463a] shadow-[0_10px_20px_rgba(7,35,27,0.14)]" : "text-[#b7ccbd] hover:bg-[#245346] hover:text-[#fff7e8]"}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-[#f3c18c] text-[#9b4a28]" : "bg-[#285848] text-[#b7ccbd] group-hover:bg-[#316956]"}`}>
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold">{item.label}</span>
                <span className={`mt-0.5 block text-[10px] ${active ? "text-[#6b7d71]" : "text-[#79998b]"}`}>{item.detail}</span>
              </span>
              {active ? <ChevronRight className="ml-auto" size={15} /> : null}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="mb-4 rounded-2xl border border-[#3c6758] bg-[#204b3f] p-3.5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.13em] text-[#a6c3af]">
            <CloudSun size={14} className="text-[#efb06f]" />
            Johannesburg
          </div>
          <p className="font-serif text-[25px] font-bold leading-none text-[#fff5df]">22° <span className="font-sans text-[11px] font-medium text-[#aac2b2]">Clear skies</span></p>
          <p className="mt-2 text-[10px] text-[#91b09f]">Perfect conditions for the road.</p>
        </div>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#9fbcaf] transition hover:bg-[#245346] hover:text-[#fff7e8]" onClick={() => setTab("expenses")}>
          <Settings2 size={17} />
          Workspace settings
        </button>
      </div>
    </aside>
  );
}

function MobileTabs({ tab, setTab }: { tab: Tab; setTab: (tab: Tab) => void }) {
  const items: { id: Tab; label: string; icon: LucideIcon }[] = [
    { id: "cockpit", label: "Cockpit", icon: Gauge },
    { id: "guest", label: "Guest view", icon: Globe2 },
    { id: "expenses", label: "Expenses", icon: Receipt },
    { id: "scanner", label: "Scan", icon: ScanLine },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#dbe4d8] bg-[#fbfaf6]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(24,55,44,0.08)] backdrop-blur-md lg:hidden">
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setTab(id)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-bold transition ${tab === id ? "text-[#ae552e]" : "text-[#809087]"}`}>
          <Icon size={18} strokeWidth={tab === id ? 2.5 : 1.9} />
          {label}
        </button>
      ))}
    </nav>
  );
}

function PassengerRow({
  passenger,
  onStatus,
  alertSent,
  onAlert,
  delayMinutes,
}: {
  passenger: Passenger;
  onStatus: (id: number, status: PassengerStatus) => void;
  alertSent: boolean;
  onAlert: () => void;
  delayMinutes: number;
}) {
  return (
    <div className="group border-b border-[#e9ede5] py-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dbe7da] text-[11px] font-extrabold text-[#38604c]">{initials(passenger.name)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[13px] font-extrabold text-[#263f36]">{passenger.name}</p>
            <span className="rounded-md bg-[#f2f1ea] px-1.5 py-0.5 text-[9px] font-bold text-[#78867d]">{passenger.pax} {passenger.pax === 1 ? "pax" : "pax"}</span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[#718078]"><Clock3 size={12} /> {passenger.time} <span className="text-[#b3bdb5]">·</span> {passenger.hotel}</p>
          <p className="mt-1 font-mono text-[9px] tracking-wide text-[#a0aba3]">{passenger.ref}</p>
        </div>
        <StatusPill status={passenger.status} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 pl-[52px]">
        {passenger.status !== "onboard" ? (
          <Button variant="outline" className="min-h-8 px-2.5 text-[10px]" icon={UserCheck} onClick={() => onStatus(passenger.id, "onboard")}>Mark onboard</Button>
        ) : (
          <Button variant="soft" className="min-h-8 px-2.5 text-[10px]" icon={Check} onClick={() => onStatus(passenger.id, "pending")}>Undo onboard</Button>
        )}
        {passenger.status !== "no-show" ? (
          <Button variant="ghost" className="min-h-8 px-2.5 text-[10px]" icon={X} onClick={() => onStatus(passenger.id, "no-show")}>No-show</Button>
        ) : (
          <Button variant="ghost" className="min-h-8 px-2.5 text-[10px]" icon={RefreshCw} onClick={() => onStatus(passenger.id, "pending")}>Restore guest</Button>
        )}
        <a href={`tel:${passenger.phone}`} className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#597065] transition hover:bg-[#edf1e9]" aria-label={`Call ${passenger.name}`}>
          <Phone size={15} />
        </a>
        <a href={navigationUrl(passenger.hotel)} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#597065] transition hover:bg-[#edf1e9]" aria-label={`Navigate to ${passenger.hotel}`}>
          <Navigation size={15} />
        </a>
        {delayMinutes > 0 ? (
          <Button variant={alertSent ? "soft" : "danger"} className="min-h-8 px-2.5 text-[10px]" icon={alertSent ? Check : Send} onClick={onAlert}>
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
    <div className="relative mt-4 h-[270px] overflow-hidden rounded-2xl bg-[#e4e9dd]" style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,.38) 1px, transparent 1px), linear-gradient(30deg, rgba(255,255,255,.26) 1px, transparent 1px)", backgroundSize: "30px 30px" }}>
      <div className="absolute left-[12%] top-[49%] h-[1px] w-[72%] rotate-[-22deg] border-t border-dashed border-[#819889]" />
      <div className="absolute left-[44%] top-[41%] h-[1px] w-[43%] rotate-[24deg] border-t border-dashed border-[#819889]" />
      <div className="absolute left-[16%] top-[73%] h-[72%] w-[40%] -rotate-[25deg] rounded-[50%] border-r border-dashed border-[#b4c1af]" />
      <div className="absolute right-3 top-3 rounded-lg bg-[#f7f4ed]/80 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.13em] text-[#6c7d71] backdrop-blur-sm">Live route · 38 km</div>
      {points.map((point, index) => (
        <div key={point.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: point.left, top: point.top }}>
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#f5f3eb]" style={{ backgroundColor: point.color }}>
            {index === 2 ? <CarFront size={13} className="text-[#fffaf0]" /> : <span className="h-1.5 w-1.5 rounded-full bg-[#fffaf0]" />}
          </div>
          <span className="absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#f8f6ef]/85 px-1.5 py-0.5 text-[9px] font-bold text-[#50675b] backdrop-blur-sm">{point.label}</span>
        </div>
      ))}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg bg-[#f8f6ef]/85 px-2.5 py-1.5 text-[9px] font-bold text-[#63766b] backdrop-blur-sm">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#d77943]" /> pickups</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#285d67]" /> next stop</span>
      </div>
    </div>
  );
}

function Cockpit({
  passengers,
  setPassengers,
  flash,
}: {
  passengers: Passenger[];
  setPassengers: React.Dispatch<React.SetStateAction<Passenger[]>>;
  flash: (message: string) => void;
}) {
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [alertSent, setAlertSent] = useState<Record<number, boolean>>({});
  const onboard = passengers.filter((passenger) => passenger.status === "onboard").reduce((sum, passenger) => sum + passenger.pax, 0);

  const updateStatus = (id: number, status: PassengerStatus) => {
    setPassengers((current) => current.map((passenger) => passenger.id === id ? { ...passenger, status } : passenger));
    flash(status === "onboard" ? "Guest marked onboard" : status === "no-show" ? "Guest marked as no-show" : "Guest returned to pickup list");
  };

  const sendAlert = (id: number) => {
    setAlertSent((current) => ({ ...current, [id]: true }));
    flash("WhatsApp delay alert queued for guest");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#af5e37]"><CalendarDays size={14} /> Saturday · 23 August 2026</p>
          <h1 className="font-serif text-[34px] font-bold leading-[0.98] tracking-[-0.055em] text-[#173f35] sm:text-[42px]">Run the day,<br /><span className="text-[#b75d32]">not the paperwork.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6b7970]">Your Johannesburg, Soweto & Apartheid Museum day is staged and ready. Make the next right decision from one calm cockpit.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start rounded-2xl border border-[#d9e3d7] bg-[#fbfaf5] px-3 py-2.5 sm:self-auto">
          <div className="flex -space-x-2">
            {passengers.map((passenger) => <div key={passenger.id} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#fbfaf5] bg-[#dce8da] text-[8px] font-black text-[#3e6651]">{initials(passenger.name)}</div>)}
          </div>
          <div className="ml-1"><p className="text-[11px] font-extrabold text-[#335347]">{onboard} / 4 onboard</p><p className="text-[9px] text-[#819087]">guest manifest</p></div>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[24px] bg-[#204f42] p-5 text-[#fff8e8] shadow-[0_16px_36px_rgba(28,68,54,0.12)] sm:p-6">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-[#d98a55]/15" />
        <div className="absolute -right-2 -top-6 h-36 w-36 rounded-full border border-[#efb37c]/20" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9c4ae]"><Zap size={14} className="text-[#f0af70]" /> Next decision</div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e2915e] text-[#204f42]"><MapPin size={20} /></div>
              <div>
                <h2 className="font-serif text-[25px] font-bold tracking-[-0.035em]">Head to Soweto orientation</h2>
                <p className="mt-1 text-xs text-[#b7d0bb]">Vilakazi Street <span className="mx-1.5 text-[#6f9882]">·</span> 11:10 <span className="mx-1.5 text-[#6f9882]">·</span> 35 min drive</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={navigationUrl("Vilakazi Street, Soweto")} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#f2bd83] px-4 text-xs font-extrabold text-[#24473b] transition hover:bg-[#ffd19f]"><Navigation size={15} /> Start navigation <ArrowUpRight size={14} /></a>
            <Button variant="outline" className="min-h-11 border-[#52776a] bg-transparent text-[#fff8e8] hover:bg-[#326354] hover:text-[#fff8e8]" icon={MessageCircle} onClick={() => flash("Guest group message opened in WhatsApp")}>Message group</Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: UsersRound, label: "Guest manifest", value: "4", detail: "3 bookings · 3 pickups", tone: "orange" as const },
          { icon: Waypoints, label: "Route progress", value: "42%", detail: "2 of 6 stops complete", tone: "sage" as const },
          { icon: Clock3, label: "Timing health", value: "On time", detail: "Next stop in 38 min", tone: "blue" as const },
        ].map(({ icon, label, value, detail, tone }) => (
          <div key={label} className="rounded-2xl border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)]">
            <div className="flex items-center justify-between"><IconBubble icon={icon} tone={tone} /><span className="text-[10px] font-semibold text-[#94a199]">{label}</span></div>
            <p className="mt-3 font-serif text-[25px] font-bold tracking-[-0.04em] text-[#25463b]">{value}</p>
            <p className="mt-0.5 text-[10px] text-[#79877e]">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] px-4 py-2 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:px-5">
          <div className="flex items-center justify-between border-b border-[#e9ede5] py-4">
            <div><SectionLabel>Guest manifest</SectionLabel><h2 className="font-serif text-[22px] font-bold tracking-[-0.04em] text-[#294a3e]">Pickup decisions</h2></div>
            <span className="rounded-full bg-[#eff4ec] px-2.5 py-1 text-[10px] font-bold text-[#547263]">{passengers.length} bookings</span>
          </div>
          {passengers.map((passenger) => (
            <PassengerRow key={passenger.id} passenger={passenger} onStatus={updateStatus} delayMinutes={delayMinutes} alertSent={Boolean(alertSent[passenger.id])} onAlert={() => sendAlert(passenger.id)} />
          ))}
        </section>
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-5">
          <div className="flex items-start justify-between">
            <div><SectionLabel>Road picture</SectionLabel><h2 className="font-serif text-[22px] font-bold tracking-[-0.04em] text-[#294a3e]">Today’s route</h2></div>
            <Button variant="ghost" className="min-h-8 px-2 text-[10px]" icon={RefreshCw} onClick={() => flash("Route refreshed from live traffic")}>Refresh</Button>
          </div>
          <RouteMap />
          <div className="mt-3 flex items-center justify-between text-[10px] text-[#78877d]"><span className="flex items-center gap-1.5"><CarFront size={13} /> FOR61JB · Toyota Quantum</span><span className="font-bold text-[#4e7061]">Traffic light</span></div>
        </section>
      </div>

      <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><SectionLabel>Keep guests in the loop</SectionLabel><h2 className="font-serif text-[22px] font-bold tracking-[-0.04em] text-[#294a3e]">Delay control</h2><p className="mt-1 text-xs text-[#7c8980]">One update keeps the whole group relaxed. Choose your delay, then message only who needs it.</p></div>
          <div className="flex rounded-xl bg-[#f1f3eb] p-1">
            {[0, 10, 20, 30].map((minutes) => <button key={minutes} onClick={() => { setDelayMinutes(minutes); if (minutes === 0) flash("Schedule returned to on time"); }} className={`min-h-9 rounded-lg px-3 text-[11px] font-extrabold transition ${delayMinutes === minutes ? "bg-[#fffdf8] text-[#ae552e] shadow-sm" : "text-[#718178] hover:text-[#3b5a4c]"}`}>{minutes === 0 ? "On time" : `+${minutes} min`}</button>)}
          </div>
        </div>
        {delayMinutes === 0 ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-[#cbd9cb] bg-[#f4f7f0] px-4 py-3 text-xs text-[#61786a]"><CheckCircle2 size={17} className="text-[#5f9367]" /> You’re tracking to plan. Delay controls will appear here if the road changes.</div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#edcfbf] bg-[#fff7f0] p-3.5">
            <div className="flex items-start gap-2.5"><CircleAlert size={17} className="mt-0.5 shrink-0 text-[#c4663d]" /><p className="text-xs leading-5 text-[#805846]">Your group is currently <strong>{delayMinutes} minutes behind plan</strong>. Send a calm ETA update to each guest below.</p></div>
            <div className="mt-3 flex flex-wrap gap-2">{passengers.map((passenger) => <a key={passenger.id} href={whatsappUrl(passenger.phone, `Hi ${passenger.name.split(" ")[0]}, a quick update from African Eagle Day Tours: we are running ${delayMinutes} minutes behind schedule. We will keep you posted.`)} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#e9c9b6] bg-[#fffdf8] px-3 text-[10px] font-bold text-[#9d5232] transition hover:bg-[#fae5d7]"><MessageCircle size={13} /> {passenger.name.split(" ")[0]}</a>)}</div>
          </div>
        )}
      </section>

      <section className="rounded-[22px] border border-[#dbe5d9] bg-[#e9f0e5] p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3"><IconBubble icon={ClipboardCheck} tone="sage" /><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5f7868]">End-of-day handover</p><h2 className="mt-1 font-serif text-[20px] font-bold tracking-[-0.03em] text-[#294d3d]">Close the loop before you park.</h2><p className="mt-1 text-xs text-[#6d8175]">Upload the signed waybill and reconcile your road expenses in under two minutes.</p></div></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => flash("Opening expense reconciliation")} icon={WalletCards}>Expenses</Button><Button variant="primary" onClick={() => flash("Waybill scanner ready")} icon={FileScan}>Scan waybill</Button></div>
        </div>
      </section>
    </div>
  );
}

function GuestLiveView({ passengers, flash }: { passengers: Passenger[]; flash: (message: string) => void }) {
  const [liveStep, setLiveStep] = useState(2);
  const liveStops = [
    { title: "Pickups complete", detail: "All guests are on board", icon: UsersRound },
    { title: "Constitution Hill", detail: "Visit complete · 10:35", icon: Landmark },
    { title: "Soweto orientation", detail: "Next stop · 11:10", icon: MapPin },
    { title: "Hector Pieterson Memorial", detail: "Planned · 13:30", icon: ShieldCheck },
  ];
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#af5e37]"><Globe2 size={14} /> Guest experience</p><h1 className="font-serif text-[34px] font-bold leading-none tracking-[-0.055em] text-[#173f35] sm:text-[42px]">A little calm,<br /><span className="text-[#b75d32]">on their screen.</span></h1><p className="mt-3 max-w-lg text-sm leading-6 text-[#6b7970]">A simple live view guests can open from WhatsApp. No app, no noise — just the next place, the next time, and your guide’s reassurance.</p></div>
        <Button variant="outline" icon={Copy} onClick={() => flash("Guest live-view link copied")}>Copy guest link</Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="mx-auto w-full max-w-[390px] rounded-[30px] border-[7px] border-[#274f42] bg-[#fbfaf4] p-3 shadow-[0_18px_34px_rgba(28,62,48,0.14)]">
          <div className="rounded-[21px] bg-[#e8efe3] px-4 pb-5 pt-4">
            <div className="mb-7 flex items-center justify-between text-[10px] font-bold text-[#5e7366]"><span>09:48</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#639168]" /> LIVE</span></div>
            <div className="mb-6 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#df8753] text-[#204f42]"><Compass size={17} /></div><div><p className="font-serif text-[16px] font-bold leading-none text-[#214e40]">African Eagle</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#708476]">TourFlow guest view</p></div></div>
            <div className="rounded-2xl bg-[#204f42] p-4 text-[#fff8e8]"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#a9c4ae]">You are here</p><h2 className="mt-2 font-serif text-[26px] font-bold leading-[1.05]">On the way to<br />Soweto</h2><p className="mt-3 text-[11px] leading-5 text-[#bad0bc]">Your guide Kamineth is driving. Next stop is about 35 minutes away.</p><div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-[#f2bd83]"><Navigation size={13} /> Vilakazi Street · 11:10</div></div>
            <div className="my-5 flex items-center justify-between px-1"><div className="h-2 w-2 rounded-full bg-[#5d9468]" /><div className="h-px flex-1 border-t border-dashed border-[#9bb09f]" /><div className="h-2 w-2 rounded-full bg-[#d77b48]" /><div className="h-px flex-1 border-t border-dashed border-[#9bb09f]" /><div className="h-2 w-2 rounded-full bg-[#82958a]" /></div>
            <div className="space-y-3">{liveStops.map((stop, index) => { const Icon = stop.icon; return <div key={stop.title} className={`flex items-center gap-3 ${index === liveStep ? "opacity-100" : index < liveStep ? "opacity-70" : "opacity-45"}`}><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${index === liveStep ? "bg-[#f0bf8d] text-[#944825]" : "bg-[#d4e2d4] text-[#52705d]"}`}><Icon size={14} /></div><div><p className="text-[11px] font-bold text-[#335548]">{stop.title}</p><p className="text-[9px] text-[#728379]">{stop.detail}</p></div>{index < liveStep ? <Check size={14} className="ml-auto text-[#5d9468]" /> : null}</div>; })}</div>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#f8f6ef] px-3 py-2.5 text-[10px] text-[#6b7c70]"><Headphones size={14} className="text-[#c36b3c]" /> Need help? <span className="font-bold text-[#315c4a]">Message Kamineth</span></div>
          </div>
        </section>
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-6">
          <div className="flex items-start justify-between border-b border-[#e9ede5] pb-5"><div><SectionLabel>Guide controls</SectionLabel><h2 className="font-serif text-[24px] font-bold tracking-[-0.04em] text-[#294a3e]">Keep the live view true</h2><p className="mt-1 max-w-md text-xs leading-5 text-[#79877e]">Tap a checkpoint and every guest sees the same clear update. The controls are local to this tour.</p></div><IconBubble icon={Activity} tone="blue" /></div>
          <div className="mt-5 space-y-2">{liveStops.map((stop, index) => { const Icon = stop.icon; return <button key={stop.title} onClick={() => { setLiveStep(index); flash(`Guest view updated: ${stop.title}`); }} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${liveStep === index ? "border-[#dfb58d] bg-[#fff3e5]" : "border-[#e7ece3] bg-[#fcfbf7] hover:border-[#bfd0c1]"}`}><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${liveStep === index ? "bg-[#edbc88] text-[#944825]" : "bg-[#e8eee5] text-[#60786b]"}`}><Icon size={16} /></div><div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-[#345347]">{stop.title}</p><p className="mt-0.5 text-[10px] text-[#829087]">{stop.detail}</p></div>{liveStep === index ? <BadgeCheck size={18} className="text-[#bc6338]" /> : <ChevronRight size={16} className="text-[#a9b7ad]" />}</button>; })}</div>
          <div className="mt-5 rounded-2xl bg-[#f1f4ed] p-4"><div className="flex items-center gap-2 text-xs font-bold text-[#3b5d4e]"><MessageCircle size={15} className="text-[#bb6339]" /> Guest group · 4 recipients</div><p className="mt-2 text-xs leading-5 text-[#718279]">Send a one-tap update if the plan changes. WhatsApp keeps the conversation where guests already are.</p><div className="mt-3 flex flex-wrap gap-2">{passengers.map((passenger) => <a key={passenger.id} href={whatsappUrl(passenger.phone, "Hi from Kamineth — your TourFlow live view has been updated.")} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#fffdf8] px-2.5 text-[10px] font-bold text-[#45685a] shadow-sm transition hover:bg-[#e9f2e7]"><Send size={12} /> {passenger.name.split(" ")[0]}</a>)}</div></div>
        </section>
      </div>
    </div>
  );
}

function Expenses({ flash }: { flash: (message: string) => void }) {
  const [expenses, setExpenses] = useState({ Fuel: 520, "Toll gates": 136, "Lunch top-up": 420, Parking: 70, Miscellaneous: 0 });
  const [submitted, setSubmitted] = useState(false);
  const total = useMemo(() => Object.values(expenses).reduce((sum, amount) => sum + amount, 0), [expenses]);
  const float = 1850;
  const balance = float - total;
  const updateExpense = (name: string, value: string) => setExpenses((current) => ({ ...current, [name]: Number(value) || 0 }));
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#af5e37]"><WalletCards size={14} /> Waybill close-out</p><h1 className="font-serif text-[34px] font-bold leading-none tracking-[-0.055em] text-[#173f35] sm:text-[42px]">Make every rand<br /><span className="text-[#b75d32]">accountable.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#6b7970]">Reconcile the road while it is still fresh. Waybill <span className="font-mono text-xs font-bold text-[#566c60]">JGY26082301</span> · tour funds for Joburg, Soweto & Apartheid Museum FD + lunch.</p></div><Button variant={submitted ? "soft" : "primary"} icon={submitted ? CheckCircle2 : ClipboardCheck} onClick={() => { setSubmitted(true); flash("Handover submitted to operations"); }}>{submitted ? "Handover submitted" : "Submit handover"}</Button></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e0e6dc] bg-[#fffdf8] p-5"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b897f]">Guide float</p><IconBubble icon={HandCoins} tone="sage" /></div><p className="mt-3 font-serif text-[28px] font-bold tracking-[-0.04em] text-[#2b4c3e]">R {float.toLocaleString("en-ZA")}</p><p className="mt-1 text-[10px] text-[#859289]">Issued for today’s waybill</p></div>
        <div className="rounded-2xl border border-[#e0e6dc] bg-[#fffdf8] p-5"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b897f]">Total expenses</p><IconBubble icon={Receipt} tone="orange" /></div><p className="mt-3 font-serif text-[28px] font-bold tracking-[-0.04em] text-[#2b4c3e]">R {total.toLocaleString("en-ZA")}</p><p className="mt-1 text-[10px] text-[#859289]">{Object.keys(expenses).length} line items captured</p></div>
        <div className={`rounded-2xl border p-5 ${balance >= 0 ? "border-[#cfe0d0] bg-[#eaf3e8]" : "border-[#ecc9bc] bg-[#fff0e9]"}`}><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#688071]">Return balance</p><IconBubble icon={DollarSign} tone={balance >= 0 ? "sage" : "orange"} /></div><p className={`mt-3 font-serif text-[28px] font-bold tracking-[-0.04em] ${balance >= 0 ? "text-[#2f6847]" : "text-[#ae4d34]"}`}>R {balance.toLocaleString("en-ZA")}</p><p className="mt-1 text-[10px] text-[#718578]">{balance >= 0 ? "Ready to hand back" : "Over float — review lines"}</p></div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-6"><div className="flex items-start justify-between border-b border-[#e9ede5] pb-4"><div><SectionLabel>Capture spend</SectionLabel><h2 className="font-serif text-[23px] font-bold tracking-[-0.04em] text-[#294a3e]">Today’s road costs</h2></div><span className="font-mono text-[10px] font-bold text-[#9aa69e]">ZAR</span></div><div className="mt-2">{Object.entries(expenses).map(([name, amount]) => <div key={name} className="flex items-center gap-3 border-b border-[#edf0e9] py-3.5 last:border-0"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2e9] text-[#5d7867]">{name === "Fuel" ? <CarFront size={16} /> : name === "Lunch top-up" ? <HandCoins size={16} /> : <Receipt size={16} />}</div><label className="flex-1 text-xs font-bold text-[#486256]" htmlFor={`expense-${name}`}>{name}<span className="mt-1 block text-[10px] font-normal text-[#8b978f]">{name === "Fuel" ? "Vehicle FOR61JB" : name === "Toll gates" ? "M1 / N12" : name === "Lunch top-up" ? "Sakhumzi Restaurant" : "Add a note in receipt"}</span></label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#929e95]">R</span><input id={`expense-${name}`} type="number" min="0" value={amount} onChange={(event) => updateExpense(name, event.target.value)} className="h-10 w-28 rounded-xl border border-[#dbe4d8] bg-[#fbfaf5] pl-7 pr-2 text-right text-sm font-bold text-[#345548] outline-none transition focus:border-[#c98255] focus:ring-2 focus:ring-[#edcfb6]" /></div></div>)}</div><div className="mt-3 rounded-xl border border-dashed border-[#cbdacb] bg-[#f5f8f2] px-3 py-3 text-[10px] text-[#708276]"><span className="font-bold text-[#4e6c5b]">Tip:</span> Add the receipt photo in the scanner tab to keep this handover audit-ready.</div></section>
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-6"><SectionLabel>Waybill details</SectionLabel><h2 className="font-serif text-[23px] font-bold tracking-[-0.04em] text-[#294a3e]">A clean handover</h2><div className="mt-5 space-y-0">{[["Tour", "Joburg, Soweto & Apartheid Museum FD + lunch"], ["Reference", "JGY26082301"], ["Date", "23/08/26"], ["Guide", "Kamineth Lauren"], ["Vehicle", "FOR61JB"], ["Passengers", "Ahmed · Lynn · Alex"]].map(([label, value]) => <div key={label} className="flex gap-4 border-b border-[#edf0e9] py-3 text-xs last:border-0"><span className="w-20 shrink-0 text-[#849189]">{label}</span><span className="font-bold leading-5 text-[#3d5c4e]">{value}</span></div>)}</div><div className="mt-5 rounded-2xl bg-[#214f41] p-4 text-[#fff8e8]"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#aac4ae]"><ShieldCheck size={14} className="text-[#efb171]" /> Handover confidence</div><p className="mt-2 font-serif text-[21px] font-bold">Everything lines up.</p><p className="mt-1 text-[11px] leading-5 text-[#b7d0bb]">Float, passengers and route are ready for operations review.</p></div></section>
      </div>
    </div>
  );
}

function Scanner({ flash }: { flash: (message: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "reading" | "done">("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const chooseFile = (nextFile?: File) => { if (!nextFile) return; setFile(nextFile); setScanState("idle"); flash(`${nextFile.name} attached for scanning`); };
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0]); };
  const scan = () => { if (!file) { flash("Choose a waybill file first"); return; } setScanState("reading"); window.setTimeout(() => { setScanState("done"); flash("Waybill scanned — fields are ready to review"); }, 850); };
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#af5e37]"><ScanLine size={14} /> Document intelligence</p><h1 className="font-serif text-[34px] font-bold leading-none tracking-[-0.055em] text-[#173f35] sm:text-[42px]">Turn the waybill<br /><span className="text-[#b75d32]">into a handover.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#6b7970]">Drop a photo or PDF. TourFlow reads the route, manifest and vehicle details so the office receives a clean record, not a blurry promise.</p></div><div className="hidden items-center gap-2 rounded-xl bg-[#edf3e9] px-3 py-2 text-[10px] font-bold text-[#587262] sm:flex"><ShieldCheck size={15} /> Private to your workspace</div></div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-6"><SectionLabel>Upload a waybill</SectionLabel><h2 className="font-serif text-[23px] font-bold tracking-[-0.04em] text-[#294a3e]">Start with the source document</h2><div onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} className={`mt-5 flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 text-center transition ${dragging ? "border-[#cb7344] bg-[#fff0df]" : file ? "border-[#9fbe9f] bg-[#f1f7ef]" : "border-[#cfdacf] bg-[#f6f8f2] hover:border-[#b67a5d] hover:bg-[#fff8ee]"}`}><input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={onFileChange} className="hidden" />{file ? <><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d8ead7] text-[#3d7651]"><FileCheck2 size={27} /></div><p className="mt-4 max-w-full truncate text-sm font-extrabold text-[#335c48]">{file.name}</p><p className="mt-1 text-xs text-[#819087]">{(file.size / 1024).toFixed(0)} KB · Ready to scan</p><button className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-[#ad5a35]" onClick={(event) => { event.stopPropagation(); setFile(null); setScanState("idle"); }}>Remove file <X size={12} /></button></> : <><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2ddc5] text-[#af5b35]"><UploadCloud size={27} /></div><p className="mt-4 text-sm font-extrabold text-[#3c5a4d]">Drop your waybill here</p><p className="mt-1 text-xs text-[#89958d]">PDF, JPG or PNG · up to 10 MB</p><span className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#fffdf8] px-3 text-[10px] font-bold text-[#a85a37] shadow-sm"><Paperclip size={13} /> Browse files</span></>}</div><Button className="mt-4 w-full" icon={scanState === "done" ? CheckCircle2 : scanState === "reading" ? RefreshCw : ScanLine} onClick={scan}>{scanState === "done" ? "Scan complete" : scanState === "reading" ? "Reading waybill…" : "Scan document"}</Button></section>
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-6"><div className="flex items-start justify-between"><div><SectionLabel>What gets captured</SectionLabel><h2 className="font-serif text-[23px] font-bold tracking-[-0.04em] text-[#294a3e]">A useful first draft</h2></div><IconBubble icon={Sparkles} tone="orange" /></div><div className="mt-5 space-y-3">{[{ icon: ClipboardCheck, title: "Tour & waybill reference", text: "JGY26082301 · route and service type" }, { icon: UsersRound, title: "Guest manifest", text: "Names, pickup times, hotel and booking refs" }, { icon: CarFront, title: "Vehicle & guide", text: "FOR61JB · Kamineth Lauren" }, { icon: Waypoints, title: "Itinerary checkpoints", text: "Constitution Hill through Hector Pieterson" }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3 rounded-xl border border-[#ebefe8] bg-[#fcfbf7] p-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f0e5] text-[#4f735f]"><Icon size={16} /></div><div><p className="text-xs font-extrabold text-[#456255]">{title}</p><p className="mt-1 text-[10px] text-[#86938b]">{text}</p></div><CheckCircle2 size={15} className="ml-auto mt-1 text-[#77a17c]" /></div>)}</div><div className="mt-5 rounded-2xl border border-[#ead7c6] bg-[#fff6e9] p-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a6603a]"><ShieldCheck size={14} /> Built for the handover</p><p className="mt-2 text-xs leading-5 text-[#816c5a]">Scanned fields stay editable. Always review before sending to operations.</p></div></section>
      </div>
      {scanState === "done" ? <section className="rounded-[22px] border border-[#cfe0d0] bg-[#eaf3e8] p-4 sm:p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="flex items-start gap-3"><CheckCircle2 size={21} className="mt-0.5 text-[#4e865b]" /><div><p className="text-sm font-extrabold text-[#345c46]">Waybill fields ready for review</p><p className="mt-1 text-xs text-[#6f8375]">6 itinerary stops, 3 pickup records and 1 vehicle detected.</p></div></div><Button variant="outline" icon={ArrowRight} onClick={() => flash("Opening scanned waybill review")}>Review fields</Button></div></section> : null}
    </div>
  );
}

export function TourFlowPro() {
  const [tab, setTab] = useState<Tab>("cockpit");
  const [passengers, setPassengers] = useState(initialPassengers);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [menuOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#f7f4ed] text-[#294a3e]" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.025]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.75'/%3E%3C/svg%3E\")" }} />
      <Sidebar tab={tab} setTab={setTab} />
      {menuOpen ? <div className="fixed inset-0 z-40 bg-[#173f35]/30 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}><div className="h-full w-[min(82vw,320px)] bg-[#173f35] p-5 text-[#dce7d8] shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-10 flex items-center justify-between"><p className="font-serif text-[22px] font-bold text-[#fff8e9]">TourFlow<span className="text-[#eb9b65]">.</span></p><button onClick={() => setMenuOpen(false)} className="rounded-lg p-2 text-[#b6cdbd]"><X size={19} /></button></div><p className="mb-3 px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#78988a]">Your command centre</p>{[{ id: "cockpit" as Tab, label: "Guide cockpit", icon: LayoutDashboard }, { id: "guest" as Tab, label: "Guest live view", icon: Globe2 }, { id: "expenses" as Tab, label: "Reconciliation", icon: WalletCards }, { id: "scanner" as Tab, label: "Upload scanner", icon: FileScan }].map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { setTab(id); setMenuOpen(false); }} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold ${tab === id ? "bg-[#e5e8d9] text-[#1d463a]" : "text-[#b7ccbd]"}`}><Icon size={17} />{label}</button>)}</div></div> : null}
      <div className="lg:ml-64">
        <Header tab={tab} setTab={setTab} onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-[1480px] px-4 pb-28 pt-7 sm:px-7 sm:pt-9 lg:px-10 lg:pb-10">{tab === "cockpit" ? <Cockpit passengers={passengers} setPassengers={setPassengers} flash={flash} /> : tab === "guest" ? <GuestLiveView passengers={passengers} flash={flash} /> : tab === "expenses" ? <Expenses flash={flash} /> : <Scanner flash={flash} />}</main>
      </div>
      <MobileTabs tab={tab} setTab={setTab} />
      {toast ? <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#204f42] px-4 py-3 text-xs font-bold text-[#fff8e8] shadow-[0_14px_28px_rgba(24,55,44,0.22)] lg:bottom-7"><CheckCircle2 size={16} className="text-[#f1ba7d]" />{toast}</div> : null}
    </div>
  );
}

export default TourFlowPro;