import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  CloudOff,
  CloudSun,
  Compass,
  FileScan,
  Gauge,
  LayoutDashboard,
  Lock,
  Menu,
  Receipt,
  ScanLine,
  Settings2,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";

import { TourProvider, useTour } from "./tourflow/TourContext";
import { Cockpit } from "./tourflow/Cockpit";
import { Expenses } from "./tourflow/Expenses";
import { Scanner } from "./tourflow/Scanner";
import { GuestLiveView } from "./tourflow/GuestLiveView";
import { PinLock, isUnlocked, lockDashboard } from "./tourflow/PinLock";
import { navigate, useHashRoute } from "./tourflow/router";
import { Toast } from "./tourflow/ui";

type Tab = "cockpit" | "expenses" | "scanner";

const NAV_ITEMS: {
  id: Tab;
  label: string;
  icon: LucideIcon;
  mobileIcon: LucideIcon;
  mobileLabel: string;
  detail: string;
}[] = [
  {
    id: "cockpit",
    label: "Guide cockpit",
    icon: LayoutDashboard,
    mobileIcon: Gauge,
    mobileLabel: "Cockpit",
    detail: "Today's run",
  },
  {
    id: "expenses",
    label: "Reconciliation",
    icon: WalletCards,
    mobileIcon: Receipt,
    mobileLabel: "Expenses",
    detail: "Waybill expenses",
  },
  {
    id: "scanner",
    label: "Waybill scanner",
    icon: FileScan,
    mobileIcon: ScanLine,
    mobileLabel: "Scan",
    detail: "Camera & OCR",
  },
];

const TAB_TITLES: Record<Tab, string> = {
  cockpit: "Guide cockpit",
  expenses: "Waybill reconciliation",
  scanner: "Waybill scanner",
};

function OfflineBadge() {
  const { isOnline } = useTour();
  if (isOnline) {
    return (
      <div className="hidden items-center gap-2 rounded-full border border-[#dce4d8] bg-[#fbfaf5] px-3 py-2 text-[11px] font-bold text-[#5a6c62] sm:flex">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#60915f]" />
        Syncing live
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#e6cdb9] bg-[#fdf3e9] px-3 py-2 text-[11px] font-bold text-[#95552f]">
      <CloudOff size={13} />
      <span className="hidden sm:inline">Offline mode · synced locally</span>
      <span className="sm:hidden">Offline</span>
    </div>
  );
}

function Sidebar({
  tab,
  setTab,
  onLock,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onLock: () => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#173f35] px-5 py-6 text-[#dce7d8] lg:flex">
      <div className="mb-14 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#e28a52] text-[#173f35] shadow-[0_8px_18px_rgba(226,138,82,0.22)]">
          <Compass size={21} strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-serif text-[22px] font-bold leading-none tracking-[-0.05em] text-[#fff8e9]">
            TourFlow<span className="text-[#eb9b65]">.</span>
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[#93b39f]">
            African Eagle Day Tours
          </p>
        </div>
      </div>
      <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#78988a]">
        Your command centre
      </div>
      <nav className="space-y-1.5">
        {NAV_ITEMS.map(({ id, label, icon: Icon, detail }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                active
                  ? "bg-[#e5e8d9] text-[#1d463a] shadow-[0_10px_20px_rgba(7,35,27,0.14)]"
                  : "text-[#b7ccbd] hover:bg-[#245346] hover:text-[#fff7e8]"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  active
                    ? "bg-[#f3c18c] text-[#9b4a28]"
                    : "bg-[#285848] text-[#b7ccbd] group-hover:bg-[#316956]"
                }`}
              >
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold">{label}</span>
                <span
                  className={`mt-0.5 block text-[10px] ${
                    active ? "text-[#6b7d71]" : "text-[#79998b]"
                  }`}
                >
                  {detail}
                </span>
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
          <p className="font-serif text-[25px] font-bold leading-none text-[#fff5df]">
            22°{" "}
            <span className="font-sans text-[11px] font-medium text-[#aac2b2]">
              Clear skies
            </span>
          </p>
          <p className="mt-2 text-[10px] text-[#91b09f]">
            Perfect conditions for the road.
          </p>
        </div>
        <button
          onClick={onLock}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#9fbcaf] transition hover:bg-[#245346] hover:text-[#fff7e8]"
        >
          <Lock size={16} />
          Lock dashboard
        </button>
      </div>
    </aside>
  );
}

function MobileDrawer({
  open,
  onClose,
  tab,
  setTab,
  onLock,
}: {
  open: boolean;
  onClose: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  onLock: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-[#173f35]/50 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <div
        className="h-full w-[82%] max-w-xs bg-[#173f35] px-5 py-6 text-[#dce7d8]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#e28a52] text-[#173f35]">
              <Compass size={21} strokeWidth={2.5} />
            </div>
            <p className="font-serif text-[21px] font-bold leading-none tracking-[-0.05em] text-[#fff8e9]">
              TourFlow<span className="text-[#eb9b65]">.</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#9fbcaf]"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon, detail }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setTab(id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active
                    ? "bg-[#e5e8d9] text-[#1d463a]"
                    : "text-[#b7ccbd] hover:bg-[#245346]"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    active
                      ? "bg-[#f3c18c] text-[#9b4a28]"
                      : "bg-[#285848] text-[#b7ccbd]"
                  }`}
                >
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-xs font-bold">{label}</span>
                  <span className="mt-0.5 block text-[10px] opacity-70">
                    {detail}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
        <button
          onClick={onLock}
          className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-[#9fbcaf] transition hover:bg-[#245346]"
        >
          <Lock size={16} />
          Lock dashboard
        </button>
      </div>
    </div>
  );
}

function MobileTabs({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#dbe4d8] bg-[#fbfaf6]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(24,55,44,0.08)] backdrop-blur-md lg:hidden">
      {NAV_ITEMS.map(({ id, mobileIcon: Icon, mobileLabel }) => (
        <button
          key={id}
          onClick={() => setTab(id)}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-bold transition ${
            tab === id ? "text-[#ae552e]" : "text-[#809087]"
          }`}
        >
          <Icon size={18} strokeWidth={tab === id ? 2.5 : 1.9} />
          {mobileLabel}
        </button>
      ))}
    </nav>
  );
}

function CockpitShell() {
  const { tour } = useTour();
  const [tab, setTab] = useState<Tab>("cockpit");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(() => isUnlocked());

  const flash = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!unlocked) {
    return <PinLock onUnlock={() => setUnlocked(true)} />;
  }

  const lock = () => {
    lockDashboard();
    setUnlocked(false);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#f7f4ed] text-[#1d332d] lg:pl-64">
      <Sidebar tab={tab} setTab={setTab} onLock={lock} />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        tab={tab}
        setTab={setTab}
        onLock={lock}
      />

      <header className="sticky top-0 z-30 border-b border-[#dfe5dc] bg-[#f7f4ed]/95 backdrop-blur-md">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-7 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="rounded-lg p-2 text-[#496258] lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="lg:hidden">
              <p className="font-serif text-[19px] font-bold tracking-[-0.04em] text-[#173f35]">
                TourFlow<span className="text-[#cd6b38]">.</span>
              </p>
            </div>
            <div className="hidden items-center gap-2 text-sm text-[#6b786f] lg:flex">
              <span className="font-semibold text-[#2c4c41]">Operations</span>
              <ChevronRight size={14} />
              <span className="font-semibold text-[#b06945]">
                {TAB_TITLES[tab]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <OfflineBadge />
            <button
              className="relative rounded-xl p-2 text-[#50655b] transition hover:bg-[#e9eee5]"
              onClick={() => flash("No new operations alerts")}
              aria-label="Open alerts"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-[#f7f4ed] bg-[#d26f3f]" />
            </button>
            <div className="flex items-center gap-2.5 border-l border-[#dce3da] pl-3 sm:pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold text-[#29483e]">
                  {tour.guideName}
                </p>
                <p className="text-[10px] text-[#819087]">Guide · JHB</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7e2d3] text-xs font-extrabold text-[#315a47]">
                {tour.guideName
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-7 lg:px-10 lg:pb-12">
        {tab === "cockpit" && <Cockpit setTab={setTab} flash={flash} />}
        {tab === "expenses" && <Expenses flash={flash} />}
        {tab === "scanner" && <Scanner setTab={setTab} flash={flash} />}
      </main>

      <MobileTabs tab={tab} setTab={setTab} />
      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}

export function TourFlowPro() {
  const route = useHashRoute();

  // Root redirects to the cockpit so operations is the default home screen.
  useEffect(() => {
    if (route.name === "root") navigate({ name: "cockpit" });
  }, [route.name]);

  return (
    <TourProvider>
      {route.name === "guest" ? (
        <GuestLiveView guestId={route.id} />
      ) : (
        <CockpitShell />
      )}
    </TourProvider>
  );
}

export default TourFlowPro;
