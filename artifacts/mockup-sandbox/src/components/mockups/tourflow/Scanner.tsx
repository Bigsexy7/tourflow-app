import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  Camera,
  Check,
  CircleAlert,
  FileCheck2,
  FileScan,
  Plus,
  ScanLine,
  Trash2,
  UploadCloud,
  UsersRound,
  X,
} from "lucide-react";
import { useTour } from "./TourContext";
import { scanWaybill } from "./ocr";
import { Button, SectionLabel } from "./ui";
import type { ItineraryStop, Passenger, ScannedFields } from "./types";

type Tab = "cockpit" | "expenses" | "scanner";

type ScanState =
  | { phase: "idle" }
  | { phase: "scanning"; status: string; progress: number }
  | { phase: "error"; message: string };

const emptyPassenger = (index: number): Passenger => ({
  id: `scan-manual-${Date.now()}-${index}`,
  name: "",
  time: "",
  hotel: "",
  pax: 1,
  ref: "",
  phone: "",
  status: "pending",
});

/** Rebuilds the itinerary pickup block so stop data matches the scanned manifest. */
function deriveItinerary(
  passengers: Passenger[],
  existing: ItineraryStop[],
): ItineraryStop[] {
  if (existing.length > 0) return existing;
  const times = passengers.map((p) => p.time).filter(Boolean).sort();
  const totalPax = passengers.reduce((sum, p) => sum + p.pax, 0);
  const window =
    times.length > 1
      ? `${times[0]}–${times[times.length - 1]}`
      : (times[0] ?? "TBC");
  return [
    {
      id: "s-pickups",
      time: window,
      title: "Guest pickups",
      location: passengers
        .map((p) => p.hotel.split(",")[0])
        .filter(Boolean)
        .join(" · "),
      detail: `${passengers.length} bookings · ${totalPax} seats`,
      state: "next",
    },
  ];
}

function FieldInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wide text-[#7b897f]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[#dbe4d8] bg-[#fbfaf5] px-3 py-2.5 text-sm font-bold text-[#345548] outline-none transition focus:border-[#c98255] focus:ring-2 focus:ring-[#edcfb6]"
      />
    </div>
  );
}

function ReviewModal({
  fields,
  onConfirm,
  onClose,
}: {
  fields: ScannedFields;
  onConfirm: (f: ScannedFields) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ScannedFields>(fields);

  const set = <K extends keyof ScannedFields>(
    key: K,
    value: ScannedFields[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const setPassenger = (index: number, patch: Partial<Passenger>) =>
    setForm((prev) => ({
      ...prev,
      passengers: prev.passengers.map((p, i) =>
        i === index ? { ...p, ...patch } : p,
      ),
    }));

  const totalPax = form.passengers.reduce((sum, p) => sum + p.pax, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#173f35]/55 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[92dvh] w-full max-w-3xl flex-col rounded-t-3xl bg-[#fffdf8] shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-[#e9ede5] p-5">
          <div>
            <SectionLabel>Step 2 of 2</SectionLabel>
            <h3 className="font-serif text-[24px] font-bold tracking-[-0.04em] text-[#294a3e]">
              Review scanned waybill
            </h3>
            <p className="mt-1 text-xs text-[#7c8980]">
              Correct any OCR slips before this overwrites the live tour.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#809087] transition hover:bg-[#edf1e9]"
            aria-label="Close review"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FieldInput
              label="Tour reference"
              value={form.tourRef}
              onChange={(v) => set("tourRef", v)}
            />
            <FieldInput
              label="Tour title"
              value={form.tourTitle}
              onChange={(v) => set("tourTitle", v)}
            />
            <FieldInput
              label="Tour date"
              value={form.tourDate}
              onChange={(v) => set("tourDate", v)}
            />
            <FieldInput
              label="Guide name"
              value={form.guideName}
              onChange={(v) => set("guideName", v)}
            />
            <FieldInput
              label="Vehicle registration"
              value={form.vehicleReg}
              onChange={(v) => set("vehicleReg", v.toUpperCase())}
            />
            <FieldInput
              label="Vehicle description"
              value={form.vehicleDesc}
              onChange={(v) => set("vehicleDesc", v)}
            />
            <FieldInput
              label="Cash float (R)"
              type="number"
              value={form.float}
              onChange={(v) => set("float", Number(v) || 0)}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <SectionLabel>Passenger manifest</SectionLabel>
              <p className="text-[11px] font-bold text-[#547263]">
                {form.passengers.length} bookings · {totalPax} pax
              </p>
            </div>
            <Button
              variant="outline"
              className="min-h-9 px-3 text-[10px]"
              icon={Plus}
              onClick={() =>
                set("passengers", [
                  ...form.passengers,
                  emptyPassenger(form.passengers.length),
                ])
              }
            >
              Add guest
            </Button>
          </div>

          {form.passengers.length === 0 ? (
            <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-dashed border-[#e0cdbc] bg-[#fdf6ef] px-4 py-3.5 text-xs text-[#8a6a53]">
              <CircleAlert size={16} className="shrink-0 text-[#c4663d]" />
              No passenger rows were detected. Add them manually, or rescan with
              a sharper photo.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {form.passengers.map((p, index) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-[#e4e9df] bg-[#fbfaf5] p-3.5"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8b978f]">
                      Guest {index + 1}
                    </span>
                    <button
                      onClick={() =>
                        set(
                          "passengers",
                          form.passengers.filter((_, i) => i !== index),
                        )
                      }
                      className="rounded-lg p-1.5 text-[#a0aba3] transition hover:bg-[#f3e6dc] hover:text-[#aa4c30]"
                      aria-label={`Remove guest ${index + 1}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    <FieldInput
                      label="Full name"
                      value={p.name}
                      onChange={(v) => setPassenger(index, { name: v })}
                    />
                    <FieldInput
                      label="Pickup time"
                      value={p.time}
                      onChange={(v) => setPassenger(index, { time: v })}
                    />
                    <FieldInput
                      label="Pax"
                      type="number"
                      value={p.pax}
                      onChange={(v) =>
                        setPassenger(index, { pax: Number(v) || 1 })
                      }
                    />
                    <FieldInput
                      label="Pickup location"
                      value={p.hotel}
                      onChange={(v) => setPassenger(index, { hotel: v })}
                    />
                    <FieldInput
                      label="Contact number"
                      type="tel"
                      value={p.phone}
                      onChange={(v) => setPassenger(index, { phone: v })}
                    />
                    <FieldInput
                      label="Voucher / booking ref"
                      value={p.ref}
                      onChange={(v) => setPassenger(index, { ref: v })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {form.expenses.length > 0 && (
            <>
              <div className="mt-6">
                <SectionLabel>Detected expenses</SectionLabel>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {form.expenses.map((exp, index) => (
                  <FieldInput
                    key={`${exp.name}-${index}`}
                    label={`${exp.name} (R)`}
                    type="number"
                    value={exp.amount}
                    onChange={(v) =>
                      set(
                        "expenses",
                        form.expenses.map((e, i) =>
                          i === index ? { ...e, amount: Number(v) || 0 } : e,
                        ),
                      )
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-[#e9ede5] p-5 sm:flex-row">
          <Button variant="ghost" className="sm:flex-1" onClick={onClose}>
            Discard scan
          </Button>
          <Button
            variant="primary"
            className="sm:flex-[2]"
            icon={Check}
            onClick={() => onConfirm(form)}
          >
            Confirm &amp; load into cockpit
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Scanner({
  setTab,
  flash,
}: {
  setTab: (t: Tab) => void;
  flash: (m: string) => void;
}) {
  const { tour, setTour } = useTour();
  const [state, setState] = useState<ScanState>({ phase: "idle" });
  const [scanned, setScanned] = useState<ScannedFields | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const runScan = async (file: File) => {
    setFileName(file.name);
    setState({ phase: "scanning", status: "Preparing scanner", progress: 0.02 });
    try {
      const fields = await scanWaybill(file, (status, progress) =>
        setState({ phase: "scanning", status, progress }),
      );
      setScanned(fields);
      setState({ phase: "idle" });
    } catch (error) {
      setState({
        phase: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not read that file. Try a clearer photo or a PDF.",
      });
    }
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so re-picking the same file still fires a change event.
    event.target.value = "";
    if (file) void runScan(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void runScan(file);
  };

  const confirmScan = (fields: ScannedFields) => {
    setTour((prev) => ({
      ...prev,
      tourRef: fields.tourRef || prev.tourRef,
      tourTitle: fields.tourTitle || prev.tourTitle,
      tourDate: fields.tourDate || prev.tourDate,
      guideName: fields.guideName || prev.guideName,
      vehicleReg: fields.vehicleReg || prev.vehicleReg,
      vehicleDesc: fields.vehicleDesc || prev.vehicleDesc,
      float: fields.float || prev.float,
      passengers: fields.passengers.length ? fields.passengers : prev.passengers,
      itinerary: deriveItinerary(fields.passengers, fields.itinerary),
      expenses: fields.expenses.length ? fields.expenses : prev.expenses,
      liveStep: 0,
    }));
    setScanned(null);
    setFileName(null);
    flash("Waybill loaded — cockpit, guests and expenses updated");
    setTab("cockpit");
  };

  const scanning = state.phase === "scanning";
  const totalPax = tour.passengers.reduce((sum, p) => sum + p.pax, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#af5e37]">
          <FileScan size={14} /> Waybill intake
        </p>
        <h1 className="font-serif text-[34px] font-bold leading-none tracking-[-0.055em] text-[#173f35] sm:text-[42px]">
          Scan the paper,
          <br />
          <span className="text-[#b75d32]">load the whole day.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#6b7970]">
          Photograph the printed waybill or drop in the PDF. Everything is read
          on this device — no guest data leaves the phone.
        </p>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onPick}
        className="hidden"
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={onPick}
        className="hidden"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <button
          onClick={() => cameraRef.current?.click()}
          disabled={scanning}
          className="group flex items-center gap-4 rounded-[22px] bg-[#204f42] p-5 text-left text-[#fff8e8] shadow-[0_16px_36px_rgba(28,68,54,0.12)] transition hover:bg-[#276252] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e2915e] text-[#204f42]">
            <Camera size={26} />
          </span>
          <span className="min-w-0">
            <span className="block font-serif text-[21px] font-bold tracking-[-0.03em]">
              Take photo / scan waybill
            </span>
            <span className="mt-1 block text-[11px] text-[#b7d0bb]">
              Opens the rear camera on phone and tablet
            </span>
          </span>
        </button>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-[22px] border-2 border-dashed p-5 transition ${
            dragging
              ? "border-[#c98255] bg-[#fdf3e9]"
              : "border-[#d3ddcf] bg-[#fffdf8]"
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef2ea] text-[#4e7061]">
              <UploadCloud size={26} />
            </span>
            <div className="min-w-0">
              <p className="font-serif text-[21px] font-bold tracking-[-0.03em] text-[#294a3e]">
                Upload waybill
              </p>
              <p className="mt-1 text-[11px] text-[#7c8980]">
                Drag &amp; drop, or choose a PDF or image
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full"
            icon={FileCheck2}
            disabled={scanning}
            onClick={() => uploadRef.current?.click()}
          >
            Choose file
          </Button>
        </div>
      </div>

      {scanning && (
        <section className="overflow-hidden rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-5">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#f7ddbd] text-[#a44c23]">
              <ScanLine size={20} className="animate-pulse" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-extrabold text-[#294a3e]">
                {state.status}…
              </p>
              <p className="truncate text-[10px] text-[#849189]">{fileName}</p>
            </div>
            <span className="font-mono text-sm font-bold text-[#4e7061]">
              {Math.round(state.progress * 100)}%
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#eaefe6]">
            <div
              className="h-full rounded-full bg-[#d68a52] transition-all duration-300"
              style={{ width: `${Math.max(3, state.progress * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-[10px] text-[#849189]">
            Reading on-device with OCR. Large photos can take a few moments.
          </p>
        </section>
      )}

      {state.phase === "error" && (
        <section className="flex items-start gap-3 rounded-[22px] border border-[#edcfbf] bg-[#fff7f0] p-5">
          <CircleAlert size={18} className="mt-0.5 shrink-0 text-[#c4663d]" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-extrabold text-[#8f4a2c]">
              Scan failed
            </p>
            <p className="mt-1 text-xs leading-5 text-[#805846]">
              {state.message}
            </p>
          </div>
          <Button
            variant="outline"
            className="min-h-9 px-3 text-[10px]"
            onClick={() => setState({ phase: "idle" })}
          >
            Dismiss
          </Button>
        </section>
      )}

      <section className="rounded-[22px] border border-[#e0e6dc] bg-[#fffdf8] p-5">
        <SectionLabel>Currently loaded</SectionLabel>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="font-serif text-[20px] font-bold tracking-[-0.03em] text-[#294a3e]">
              {tour.tourTitle}
            </p>
            <p className="mt-1 font-mono text-[10px] font-bold text-[#849189]">
              {tour.tourRef} · {tour.tourDate} · {tour.vehicleReg}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ec] px-3 py-1.5 text-[10px] font-bold text-[#547263]">
            <UsersRound size={13} /> {tour.passengers.length} bookings ·{" "}
            {totalPax} pax
          </span>
        </div>
      </section>

      {scanned && (
        <ReviewModal
          fields={scanned}
          onConfirm={confirmScan}
          onClose={() => {
            setScanned(null);
            setFileName(null);
          }}
        />
      )}
    </div>
  );
}
