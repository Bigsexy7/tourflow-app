import { useMemo, useState } from "react";
import { CarFront, CircleCheck as CheckCircle2, ClipboardCheck, DollarSign, HandCoins, Receipt, ShieldCheck, WalletCards } from "lucide-react";
import { useTour } from "./TourContext";
import { Button, IconBubble, SectionLabel } from "./ui";
import type { ExpenseLine } from "./types";

export function Expenses({ flash }: { flash: (m: string) => void }) {
  const { tour, setTour } = useTour();
  const [submitted, setSubmitted] = useState(false);

  const expenses = tour.expenses;
  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses],
  );
  const float = tour.float;
  const balance = float - total;
  const totalPax = tour.passengers.reduce((s, p) => s + p.pax, 0);

  const updateExpense = (name: string, value: string) => {
    const amount = Number(value) || 0;
    setTour((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) =>
        e.name === name ? { ...e, amount } : e,
      ),
    }));
  };

  const addLine = () => {
    setTour((prev) => ({
      ...prev,
      expenses: [
        ...prev.expenses,
        { name: `Custom ${prev.expenses.length + 1}`, amount: 0 },
      ],
    }));
  };

  const removeLine = (name: string) => {
    setTour((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.name !== name),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#af5e37]">
            <WalletCards size={14} /> Waybill close-out
          </p>
          <h1 className="font-serif text-[34px] font-bold leading-none tracking-[-0.055em] text-[#173f35] sm:text-[42px]">
            Make every rand
            <br />
            <span className="text-[#b75d32]">accountable.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6b7970]">
            Reconcile the road while it is still fresh. Waybill{" "}
            <span className="font-mono text-xs font-bold text-[#566c60]">
              {tour.tourRef}
            </span>{" "}
            · {tour.tourTitle} · {totalPax} pax.
          </p>
        </div>
        <Button
          variant={submitted ? "soft" : "primary"}
          icon={submitted ? CheckCircle2 : ClipboardCheck}
          onClick={() => {
            setSubmitted(true);
            flash("Handover submitted to operations");
          }}
        >
          {submitted ? "Handover submitted" : "Submit handover"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e0e6dc] bg-[#fffdf8] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b897f]">
              Guide float
            </p>
            <IconBubble icon={HandCoins} tone="sage" />
          </div>
          <p className="mt-3 font-serif text-[28px] font-bold tracking-[-0.04em] text-[#2b4c3e]">
            R {float.toLocaleString("en-ZA")}
          </p>
          <p className="mt-1 text-[10px] text-[#859289]">
            Issued for today's waybill
          </p>
        </div>
        <div className="rounded-2xl border border-[#e0e6dc] bg-[#fffdf8] p-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b897f]">
              Total expenses
            </p>
            <IconBubble icon={Receipt} tone="orange" />
          </div>
          <p className="mt-3 font-serif text-[28px] font-bold tracking-[-0.04em] text-[#2b4c3e]">
            R {total.toLocaleString("en-ZA")}
          </p>
          <p className="mt-1 text-[10px] text-[#859289]">
            {expenses.length} line items captured
          </p>
        </div>
        <div
          className={`rounded-2xl border p-5 ${
            balance >= 0
              ? "border-[#cfe0d0] bg-[#eaf3e8]"
              : "border-[#ecc9bc] bg-[#fff0e9]"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#688071]">
              Return balance
            </p>
            <IconBubble icon={DollarSign} tone={balance >= 0 ? "sage" : "orange"} />
          </div>
          <p
            className={`mt-3 font-serif text-[28px] font-bold tracking-[-0.04em] ${
              balance >= 0 ? "text-[#2f6847]" : "text-[#ae4d34]"
            }`}
          >
            R {balance.toLocaleString("en-ZA")}
          </p>
          <p className="mt-1 text-[10px] text-[#718578]">
            {balance >= 0 ? "Ready to hand back" : "Over float — review lines"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-6">
          <div className="flex items-start justify-between border-b border-[#e9ede5] pb-4">
            <div>
              <SectionLabel>Capture spend</SectionLabel>
              <h2 className="font-serif text-[23px] font-bold tracking-[-0.04em] text-[#294a3e]">
                Today's road costs
              </h2>
            </div>
            <span className="font-mono text-[10px] font-bold text-[#9aa69e]">
              ZAR
            </span>
          </div>
          <div className="mt-2">
            {expenses.map((exp: ExpenseLine) => (
              <div
                key={exp.name}
                className="flex items-center gap-3 border-b border-[#edf0e9] py-3.5 last:border-0"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf2e9] text-[#5d7867]">
                  {exp.name.toLowerCase().includes("fuel") ? (
                    <CarFront size={16} />
                  ) : (
                    <Receipt size={16} />
                  )}
                </div>
                <label
                  className="flex-1 text-xs font-bold text-[#486256]"
                  htmlFor={`expense-${exp.name}`}
                >
                  {exp.name}
                  {exp.note && (
                    <span className="mt-1 block text-[10px] font-normal text-[#8b978f]">
                      {exp.note}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#929e95]">
                    R
                  </span>
                  <input
                    id={`expense-${exp.name}`}
                    type="number"
                    min="0"
                    value={exp.amount}
                    onChange={(e) => updateExpense(exp.name, e.target.value)}
                    className="h-10 w-28 rounded-xl border border-[#dbe4d8] bg-[#fbfaf5] pl-7 pr-2 text-right text-sm font-bold text-[#345548] outline-none transition focus:border-[#c98255] focus:ring-2 focus:ring-[#edcfb6]"
                  />
                </div>
                <button
                  onClick={() => removeLine(exp.name)}
                  className="rounded-lg p-1.5 text-[#a0aba3] transition hover:bg-[#f0e8e0] hover:text-[#aa4c30]"
                  aria-label={`Remove ${exp.name}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="mt-3"
            icon={ClipboardCheck}
            onClick={addLine}
          >
            Add expense line
          </Button>
        </section>

        <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-4 shadow-[0_5px_14px_rgba(28,52,39,0.035)] sm:p-6">
          <SectionLabel>Waybill details</SectionLabel>
          <h2 className="font-serif text-[23px] font-bold tracking-[-0.04em] text-[#294a3e]">
            A clean handover
          </h2>
          <div className="mt-5 space-y-0">
            {(
              [
                ["Tour", tour.tourTitle],
                ["Reference", tour.tourRef],
                ["Date", tour.tourDate],
                ["Guide", tour.guideName],
                ["Vehicle", `${tour.vehicleReg} · ${tour.vehicleDesc}`],
                ["Passengers", `${totalPax} pax · ${tour.passengers.length} bookings`],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="flex gap-4 border-b border-[#edf0e9] py-3 text-xs last:border-0"
              >
                <span className="w-20 shrink-0 text-[#849189]">{label}</span>
                <span className="font-bold leading-5 text-[#3d5c4e]">
                  {value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-[#214f41] p-4 text-[#fff8e8]">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#aac4ae]">
              <ShieldCheck size={14} className="text-[#efb171]" /> Handover
              confidence
            </div>
            <p className="mt-2 font-serif text-[21px] font-bold">
              Everything lines up.
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[#b7d0bb]">
              Float, passengers and route are ready for operations review.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
