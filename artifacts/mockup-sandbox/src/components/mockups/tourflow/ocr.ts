import type { ExpenseLine, ItineraryStop, Passenger, ScannedFields } from "./types";

export type ScanProgress = (status: string, progress: number) => void;

const PHONE_RE = /(?:\+?27|0)[\s-]?\d{2}[\s-]?\d{3,4}[\s-]?\d{3,4}|\+?\d{8,15}/;
const TIME_RE = /\b(\d{1,2}:\d{2})\b/;
const REF_RE = /(?:JGY|GYG)[A-Z0-9]{4,}|[A-Z0-9]{8,}/i;
const VEHICLE_RE = /\b([A-Z]{2,3}\d{2,4}[A-Z]{1,3}|[A-Z]{3}\d{3})\b/;
const PAX_RE = /\b(\d{1,2})\s*(?:pax|guests?|passengers?|p)\b/i;

function extractTourRef(text: string): string {
  const m =
    text.match(/(?:JGY|GYG)[A-Z0-9]{4,}/i) ?? text.match(/\b[A-Z0-9]{8,}\b/);
  return m ? m[0].toUpperCase() : "";
}

function extractVehicle(text: string): { reg: string; desc: string } {
  const regMatch = text.match(VEHICLE_RE);
  const descMatch = text.match(/(?:vehicle|transport|unit)[:\s]+([^\n]+)/i);
  return {
    reg: regMatch ? regMatch[1].toUpperCase() : "",
    desc: descMatch ? descMatch[1].trim() : "",
  };
}

function extractGuideName(text: string): string {
  const m = text.match(
    /(?:guide|driver|tour leader)[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/,
  );
  return m ? m[1].trim() : "";
}

function extractTourTitle(text: string): string {
  const m = text.match(/(?:tour|trip|itinerary)[:\s]+([^\n]{5,60})/i);
  return m ? m[1].trim() : "";
}

function extractTourDate(text: string): string {
  const m = text.match(/\b(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})\b/);
  return m ? m[1] : "";
}

function extractFloat(text: string): number {
  const m = text.match(/(?:float|cash float|petty cash)[:\s]*R?\s*([\d,.]+)/i);
  return m ? Number(m[1].replace(/[,.]/g, "")) : 0;
}

function extractPassengers(text: string): Passenger[] {
  const lines = text.split(/\n+/);
  const passengers: Passenger[] = [];
  let idCounter = 1;

  for (const line of lines) {
    if (line.trim().length < 5) continue;
    const phoneMatch = line.match(PHONE_RE);
    const timeMatch = line.match(TIME_RE);
    const refMatch = line.match(REF_RE);
    const paxMatch = line.match(PAX_RE);
    if (!phoneMatch && !timeMatch && !refMatch) continue;

    const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/);
    const name = nameMatch ? nameMatch[1].trim() : `Guest ${idCounter}`;

    passengers.push({
      id: `scan-${idCounter++}`,
      name,
      time: timeMatch ? timeMatch[1] : "",
      hotel:
        line
          .replace(nameMatch?.[0] ?? "", "")
          .replace(phoneMatch?.[0] ?? "", "")
          .replace(timeMatch?.[0] ?? "", "")
          .replace(refMatch?.[0] ?? "", "")
          .replace(/[|,;·]/g, " ")
          .trim()
          .slice(0, 80) || "TBC",
      pax: paxMatch ? Number(paxMatch[1]) : 1,
      ref: refMatch ? refMatch[0].toUpperCase() : "",
      phone: phoneMatch
        ? phoneMatch[0].startsWith("+")
          ? phoneMatch[0]
          : "+" + phoneMatch[0].replace(/\D/g, "")
        : "",
      status: "pending",
    });
  }

  return passengers.slice(0, 30);
}

function extractExpenses(text: string): ExpenseLine[] {
  const lines = text.split(/\n+/);
  const expenses: ExpenseLine[] = [];
  for (const line of lines) {
    const m = line.match(
      /^(fuel|toll|parking|lunch|entrance|misc|petrol|food|drink|tip)\D*?R?\s*([\d,.]+)/i,
    );
    if (m) {
      expenses.push({
        name: m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase(),
        amount: Number(m[2].replace(/[,.]/g, "")),
      });
    }
  }
  return expenses;
}

function extractItinerary(text: string): ItineraryStop[] {
  const lines = text.split(/\n+/);
  const stops: ItineraryStop[] = [];
  let idCounter = 1;
  for (const line of lines) {
    const timeMatch = line.match(TIME_RE);
    if (!timeMatch) continue;
    const rest = line.replace(timeMatch[0], "").trim();
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
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = "";
  const totalPages = pdf.numPages;
  for (let i = 1; i <= totalPages; i++) {
    onProgress(`Reading page ${i} of ${totalPages}`, 0.2 + (0.6 * i) / totalPages);
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ");
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
