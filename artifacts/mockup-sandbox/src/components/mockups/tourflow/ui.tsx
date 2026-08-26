import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  type LucideIcon,
} from "lucide-react";
import type { PassengerStatus } from "./types";

export const navigationUrl = (destination: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination + ", Johannesburg",
  )}`;

export const whatsappUrl = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export const initials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

type Tone = "orange" | "sage" | "blue" | "ink";

export function IconBubble({
  icon: Icon,
  tone = "orange",
}: {
  icon: LucideIcon;
  tone?: Tone;
}) {
  const toneClass = {
    orange: "bg-[#f7ddbd] text-[#a44c23]",
    sage: "bg-[#dce6d5] text-[#35624d]",
    blue: "bg-[#d7e5e7] text-[#285d67]",
    ink: "bg-[#dce1d9] text-[#1d332d]",
  }[tone];
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}
    >
      <Icon size={17} strokeWidth={2} />
    </span>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#6c7970]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#d26f3f]" />
      {children}
    </div>
  );
}

type ButtonVariant = "primary" | "soft" | "ghost" | "outline" | "danger";

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  icon: Icon,
  type = "button",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  className?: string;
  icon?: LucideIcon;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[#17483d] text-[#fffaf0] shadow-[0_8px_18px_rgba(23,72,61,0.14)] hover:bg-[#236052]",
    soft: "bg-[#f8e4ca] text-[#8e4828] hover:bg-[#f2d4b0]",
    ghost: "text-[#466057] hover:bg-[#edf0e8]",
    outline:
      "border border-[#ccd5c9] bg-[#fffdf8] text-[#315348] hover:border-[#9aaea0] hover:bg-[#f4f6ef]",
    danger:
      "border border-[#edc9bd] bg-[#fff7f2] text-[#aa4c30] hover:bg-[#fbe8df]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-bold transition-all duration-200 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {Icon ? <Icon size={15} strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: PassengerStatus }) {
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${content.cls}`}
    >
      <Icon size={12} />
      {content.label}
    </span>
  );
}

export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-24 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[#204f42] px-4 py-3 text-xs font-bold text-[#fff8e8] shadow-[0_14px_28px_rgba(24,55,44,0.22)] lg:bottom-7">
      <CheckCircle2 size={16} className="text-[#f1ba7d]" />
      {message}
    </div>
  );
}
