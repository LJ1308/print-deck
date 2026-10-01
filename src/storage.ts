import type { AppSettings, PrinterEntry } from "./types";

const KEY = "print-deck:v1";

const DEFAULT: AppSettings = {
  printers: [],
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT, printers: [] };
    const parsed = JSON.parse(raw) as AppSettings & { demoMode?: boolean };
    return {
      printers: Array.isArray(parsed.printers) ? parsed.printers : [],
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}

export function normalizePrinterUrl(input: string): string {
  let url = input.trim();
  if (!url) throw new Error("URL is required");
  if (!/^https?:\/\//i.test(url)) {
    url = `http://${url}`;
  }
  const parsed = new URL(url);
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  return parsed.toString().replace(/\/+$/, "");
}

export function newPrinter(name: string, url: string): PrinterEntry {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || friendlyNameFromUrl(url),
    url: normalizePrinterUrl(url),
  };
}

function friendlyNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return "Printer";
  }
}
