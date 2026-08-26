import { useEffect, useState } from "react";
import { Compass, Lock, ShieldCheck } from "lucide-react";
import { DEFAULT_PIN, PIN_KEY } from "./TourContext";

const UNLOCK_KEY = "tourflow:unlocked";

export function isUnlocked(): boolean {
  return typeof window !== "undefined" && sessionStorage.getItem(UNLOCK_KEY) === "true";
}

export function lockDashboard(): void {
  sessionStorage.removeItem(UNLOCK_KEY);
}

export function PinLock({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isUnlocked()) onUnlock();
  }, [onUnlock]);

  const submit = () => {
    const storedPin = sessionStorage.getItem(PIN_KEY);
    if (pin === DEFAULT_PIN || pin === storedPin) {
      sessionStorage.setItem(UNLOCK_KEY, "true");
      setError(false);
      onUnlock();
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#173f35]/95 px-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-[28px] border border-[#3c6758] bg-[#204b3f] p-7 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e28a52] text-[#173f35]">
          <Compass size={28} strokeWidth={2.5} />
        </div>
        <p className="font-serif text-[24px] font-bold tracking-[-0.04em] text-[#fff8e9]">
          TourFlow<span className="text-[#eb9b65]">.</span>
        </p>
        <p className="mt-2 text-xs text-[#a6c3af]">Operations dashboard locked</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[#f0af70]">
          <Lock size={16} />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em]">
            Enter 4-digit PIN
          </span>
        </div>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          autoFocus
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="••••"
          className={`mt-4 w-full rounded-xl border bg-[#173f35] py-3.5 text-center font-mono text-2xl tracking-[0.5em] text-[#fff8e9] outline-none transition placeholder:text-[#4a6b5d] ${
            error
              ? "border-[#d26f3f] ring-2 ring-[#d26f3f]/30"
              : "border-[#3c6758] focus:border-[#e28a52]"
          }`}
        />
        {error && (
          <p className="mt-2 text-[11px] font-bold text-[#e8917a]">
            Incorrect PIN. Try again.
          </p>
        )}
        <button
          onClick={submit}
          className="mt-4 w-full rounded-xl bg-[#e28a52] py-3 text-xs font-extrabold text-[#173f35] transition hover:bg-[#f0a06a]"
        >
          Unlock dashboard
        </button>
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-[#7a9c8a]">
          <ShieldCheck size={12} />
          Default PIN: 1234
        </div>
      </div>
    </div>
  );
}
