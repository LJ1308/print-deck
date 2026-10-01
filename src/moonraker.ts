import type { PrinterEntry, PrinterSnapshot, PrintState } from "./types";

interface ObjectsQueryResult {
  result?: {
    status?: Record<string, Record<string, unknown>>;
  };
  error?: { message?: string };
}

const QUERY =
  "webhooks&print_stats&extruder&heater_bed&display_status&virtual_sdcard";

function asPrintState(value: unknown): PrintState {
  const s = String(value ?? "unknown");
  if (
    s === "standby" ||
    s === "printing" ||
    s === "paused" ||
    s === "complete" ||
    s === "error"
  ) {
    return s;
  }
  return "unknown";
}

function parseSnapshot(
  printer: PrinterEntry,
  body: ObjectsQueryResult,
  fetchError: string | null,
): PrinterSnapshot {
  const base: PrinterSnapshot = {
    printerId: printer.id,
    name: printer.name,
    url: printer.url,
    online: false,
    klippyState: "offline",
    printState: "unknown",
    filename: null,
    progress: 0,
    extruderTemp: 0,
    extruderTarget: 0,
    bedTemp: 0,
    bedTarget: 0,
    error: fetchError,
  };

  if (fetchError) return base;

  const status = body.result?.status;
  if (!status) {
    return { ...base, error: "Unexpected response from Moonraker" };
  }

  const webhooks = status.webhooks ?? {};
  const printStats = status.print_stats ?? {};
  const extruder = status.extruder ?? {};
  const bed = status.heater_bed ?? {};
  const display = status.display_status ?? {};
  const vsd = status.virtual_sdcard ?? {};

  const klippyState = String(webhooks.state ?? "unknown");
  const online = klippyState === "ready" || klippyState === "startup";

  let progress = Number(display.progress ?? vsd.progress ?? 0);
  if (progress > 0 && progress <= 1) progress *= 100;

  return {
    ...base,
    online,
    klippyState,
    printState: asPrintState(printStats.state),
    filename: printStats.filename ? String(printStats.filename) : null,
    progress: Math.min(100, Math.max(0, progress)),
    extruderTemp: Number(extruder.temperature ?? 0),
    extruderTarget: Number(extruder.target ?? 0),
    bedTemp: Number(bed.temperature ?? 0),
    bedTarget: Number(bed.target ?? 0),
    error: online ? null : String(webhooks.message ?? "Printer not ready"),
  };
}

export async function fetchPrinterStatus(
  printer: PrinterEntry,
): Promise<PrinterSnapshot> {
  const url = `${printer.url}/printer/objects/query?${QUERY}`;
  try {
    const res = await fetch(url, { method: "GET", mode: "cors" });
    if (!res.ok) {
      return parseSnapshot(printer, {}, `HTTP ${res.status}`);
    }
    const body = (await res.json()) as ObjectsQueryResult;
    if (body.error?.message) {
      return parseSnapshot(printer, body, body.error.message);
    }
    return parseSnapshot(printer, body, null);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    return parseSnapshot(printer, {}, msg);
  }
}

async function postAction(baseUrl: string, path: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}${path}`, { method: "POST", mode: "cors" });
    if (!res.ok) return `HTTP ${res.status}`;
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? null;
  } catch (e) {
    return e instanceof Error ? e.message : "Request failed";
  }
}

export function pausePrint(printer: PrinterEntry): Promise<string | null> {
  return postAction(printer.url, "/printer/print/pause");
}

export function resumePrint(printer: PrinterEntry): Promise<string | null> {
  return postAction(printer.url, "/printer/print/resume");
}

export function cancelPrint(printer: PrinterEntry): Promise<string | null> {
  return postAction(printer.url, "/printer/print/cancel");
}
