import type { ExpenseLine, ItineraryStop, Passenger, ScannedFields } from "./types";

export type ScanProgress = (status: string, progress: number) => void;

// Requires either a leading "+" or a local trunk "0" so plain numbers such as
// a date code (26082455) are not misread as contact numbers.
const PHONE_RE =
  /\+\d[\d\s-]{7,16}\d|\b0\d{1,2}[\s-]?\d{3}[\s-]?\d{4}\b/;
const TIME_RE = /\b(\d{1,2}:\d{2})\b/;
const VEHICLE_RE = /\b([A-Z]{2,3}\d{2,4}[A-Z]{1,3}|[A-Z]{3}\d{3})\b/;
const PAX_RE = /\b(\d{1,2})\s*(?:pax|guests?|passengers?|p)\b/i;

function extractTourRef(text: string): string {
  // Prefer an explicitly labelled reference, then a JGY/GYG code, and only
  // then fall back to a bare alphanumeric code that contains a digit (so
  // all-letter headings like "WAYBILL" are never mistaken for a reference).
  const labelled = text.match(/(?:ref|reference|waybill\s*no)[.:\s]+([A-Z0-9-]{5,})/i);
  if (labelled) return labelled[1].toUpperCase();
  const coded = text.match(/\b(?:JGY|GYG)[A-Z0-9]{4,}\b/i);
  if (coded) return coded[0].toUpperCase();
  const bare = text.match(/\b(?=[A-Z0-9]*\d)[A-Z0-9]{8,}\b/);
  return bare ? bare[0].toUpperCase() : "";
}

function extractVehicle(text: string): { reg: string; desc: string } {
  // Anchor the description to a single line so it cannot swallow later rows.
  const descMatch = text.match(
    /(?:vehicle|transport|unit)\s*(?:description|desc)?[:\s]+([^\n]{2,60})/i,
  );
  const desc = descMatch ? descMatch[1].trim() : "";
  // A registration on the vehicle line wins over any elsewhere in the doc.
  const regMatch = desc.match(VEHICLE_RE) ?? text.match(VEHICLE_RE);
  return {
    reg: regMatch ? regMatch[1].toUpperCase() : "",
    desc,
  };
}

function extractGuideName(text: string): string {
  const m = text.match(
    /(?:guide|driver|tour\s*leader)\s*(?:name)?[:\s]+([^\n]{2,50})/i,
  );
  if (!m) return "";
  // Trim trailing labels that share the line (e.g. "Sipho Ndlovu Vehicle: ...").
  return m[1]
    .split(/\s{2,}|\b(?:vehicle|date|ref|reference|float|tour)\b/i)[0]
    .replace(/[|,;:]+$/, "")
    .trim();
}

function extractTourTitle(text: string): string {
  const m = text.match(/(?:tour|trip|itinerary)[:\s]+([^\n]{5,60})/i);
  return m ? m[1].trim() : "";
}

function extractTourDate(text: string): string {
  const m = text.match(/\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})\b/);
  return m ? m[1] : "";
}

/** Parses "1,850.50" / "1 850" / "2400" into a number without mangling decimals. */
function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[\s,](?=\d{3}\b)/g, "").replace(/[,\s]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function extractFloat(text: string): number {
  const m = text.match(
    /(?:cash\s*float|petty\s*cash|float)[:\s]*R?\s*([\d\s,.]+)/i,
  );
  return m ? parseAmount(m[1]) : 0;
}

/** Lines that are clearly document furniture rather than guest rows. */
const HEADER_RE =
  /^(?:tour|ref|reference|date|guide|driver|vehicle|transport|unit|cash\s*float|float|petty\s*cash|waybill|passenger|guest\s*name|pickup|total|expenses?|fuel|toll|parking|lunch|entrance|misc|company|african\s+eagle)\b/i;

const VOUCHER_RE = /\b(?:JGY|GYG)[A-Z0-9]{4,}\b/i;

function extractPassengers(text: string): Passenger[] {
  const lines = text.split(/\n+/);
  const passengers: Passenger[] = [];
  let idCounter = 1;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line.length < 8) continue;
    if (HEADER_RE.test(line)) continue;

    const voucherMatch = line.match(VOUCHER_RE);
    const phoneMatch = line.match(PHONE_RE);
    // A guest row must carry a booking identifier or a contact number;
    // a bare time or stray code is not enough and produced junk rows before.
    if (!voucherMatch && !phoneMatch) continue;

    const timeMatch = line.match(TIME_RE);
    const paxMatch = line.match(PAX_RE);

    // Names are leading capitalised words, allowing surnames like "Ndlovu"
    // and particles such as "van der".
    const nameMatch = line.match(
      /^((?:[A-Z][\w'’-]*|van|der|den|de|du|la|le)(?:\s+(?:[A-Z][\w'’-]*|van|der|den|de|du|la|le)){1,3})/,
    );
    const name = nameMatch ? nameMatch[1].trim() : `Guest ${idCounter}`;

    const hotel =
      line
        .replace(nameMatch?.[0] ?? "", "")
        .replace(phoneMatch?.[0] ?? "", "")
        .replace(voucherMatch?.[0] ?? "", "")
        .replace(timeMatch?.[0] ?? "", "")
        .replace(paxMatch?.[0] ?? "", "")
        .replace(/[|,;·]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 80) || "TBC";

    const rawPhone = phoneMatch?.[0] ?? "";
    const digits = rawPhone.replace(/\D/g, "");

    passengers.push({
      id: `scan-${idCounter++}`,
      name,
      time: timeMatch ? timeMatch[1] : "",
      hotel,
      pax: paxMatch ? Number(paxMatch[1]) : 1,
      ref: voucherMatch ? voucherMatch[0].toUpperCase() : "",
      phone: digits
        ? rawPhone.trim().startsWith("+")
          ? `+${digits}`
          : // Normalise local SA numbers (0XX…) to E.164 for wa.me links.
            `+${digits.replace(/^0/, "27")}`
        : "",
      status: "pending",
    });
  }

  return passengers.slice(0, 30);
}

function extractExpenses(text: string): ExpenseLine[] {
  const lines = text.split(/\n+/);
  const expenses: ExpenseLine[] = [];
  const seen = new Set<string>();
  for (const rawLine of lines) {
    const m = rawLine
      .trim()
      .match(
        /^(fuel|petrol|toll(?:\s*gates?)?|parking|lunch|entrance(?:\s*fees?)?|meals?|food|drinks?|tips?|misc(?:ellaneous)?)\b\D*?R?\s*([\d\s,.]+)/i,
      );
    if (!m) continue;
    const label = m[1].replace(/\s+/g, " ").toLowerCase();
    const name = label.charAt(0).toUpperCase() + label.slice(1);
    if (seen.has(name)) continue;
    seen.add(name);
    expenses.push({ name, amount: parseAmount(m[2]) });
  }
  return expenses;
}

function extractItinerary(text: string): ItineraryStop[] {
  const lines = text.split(/\n+/);
  const stops: ItineraryStop[] = [];
  let idCounter = 1;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const timeMatch = line.match(TIME_RE);
    if (!timeMatch) continue;
    // Guest pickup rows are handled by the manifest parser; a scheduled stop
    // has no voucher code or contact number attached to it.
    if (VOUCHER_RE.test(line) || PHONE_RE.test(line)) continue;
    if (HEADER_RE.test(line)) continue;
    const rest = line
      .replace(timeMatch[0], "")
      .replace(/[|;·]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (rest.length < 3) continue;
    stops.push({
      id: `it-${idCounter++}`,
      time: timeMatch[1],
      title: rest.slice(0, 50),
      location: rest,
      detail: "",
      state: "upcoming",
    });
  }
  return stops.slice(0, 20);
}

export function parseWaybillText(text: string): ScannedFields {
  const vehicle = extractVehicle(text);
  return {
    tourRef: extractTourRef(text),
    tourTitle: extractTourTitle(text),
    tourDate: extractTourDate(text),
    guideName: extractGuideName(text),
    vehicleReg: vehicle.reg,
    vehicleDesc: vehicle.desc,
    float: extractFloat(text),
    passengers: extractPassengers(text),
    itinerary: extractItinerary(text),
    expenses: extractExpenses(text),
  };
}

async function recognizeImage(
  file: File,
  onProgress: ScanProgress,
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === "recognizing text") {
        onProgress("Reading waybill", m.progress);
      }
    },
  });
  try {
    onProgress("Starting scanner", 0.1);
    const { data } = await worker.recognize(file);
    onProgress("Finalising", 0.95);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

async function recognizePdf(
  file: File,
  onProgress: ScanProgress,
): Promise<string> {
  onProgress("Loading PDF", 0.1);
  const pdfjs = await import("pdfjs-dist");
  // pdfjs v4 ships an ESM worker that must be registered explicitly, otherwise
  // getDocument() fails with "No GlobalWorkerOptions.workerSrc specified".
  const workerUrl = (
    await import("pdfjs-dist/build/pdf.worker.mjs?url")
  ).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";
  const totalPages = pdf.numPages;
  for (let i = 1; i <= totalPages; i++) {
    onProgress(`Reading page ${i} of ${totalPages}`, 0.2 + (0.6 * i) / totalPages);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // pdfjs returns positioned fragments, not lines. Group them by their Y
    // transform so the row-based parsers below actually see one line per row.
    const rows = new Map<number, string[]>();
    for (const item of content.items) {
      if (!("str" in item)) continue;
      const text = (item as { str: string }).str;
      if (!text.trim()) continue;
      const transform = (item as { transform?: number[] }).transform;
      // Round to the nearest 3pt to absorb sub-pixel baseline jitter.
      const y = transform ? Math.round(transform[5] / 3) * 3 : 0;
      const row = rows.get(y);
      if (row) row.push(text);
      else rows.set(y, [text]);
    }
    const pageText = [...rows.entries()]
      // PDF origin is bottom-left, so descending Y is top-to-bottom.
      .sort((a, b) => b[0] - a[0])
      .map(([, parts]) => parts.join(" ").replace(/\s+/g, " ").trim())
      .join("\n");
    fullText += pageText + "\n";
  }
  onProgress("Finalising", 0.95);
  return fullText;
}

export async function scanWaybill(
  file: File,
  onProgress: ScanProgress,
): Promise<ScannedFields> {
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");
  const text = isPdf
    ? await recognizePdf(file, onProgress)
    : await recognizeImage(file, onProgress);
  onProgress("Extracting fields", 0.98);
  const fields = parseWaybillText(text);
  onProgress("Done", 1);
  return fields;
}
