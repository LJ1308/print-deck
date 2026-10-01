import type { PrinterEntry, PrinterSnapshot } from "./types";

const DEMO_PRINTERS: PrinterEntry[] = [
  {
    id: "demo-a",
    name: "Benchy Bot",
    url: "http://demo.local:7125",
  },
  {
    id: "demo-b",
    name: "Spool Room",
    url: "http://demo.local:7126",
  },
];

/** Simulated states that drift over time for demo mode. */
const demoPhase: Record<string, number> = {};

function phaseFor(id: string): number {
  if (demoPhase[id] === undefined) {
    demoPhase[id] = Math.random() * Math.PI * 2;
  }
  return demoPhase[id];
}

export function getDemoPrinters(): PrinterEntry[] {
  return DEMO_PRINTERS.map((p) => ({ ...p }));
}

export function fetchDemoStatus(printer: PrinterEntry): PrinterSnapshot {
  const t = Date.now() / 1000;
  const phase = phaseFor(printer.id) + t * 0.15;
  const progress = ((Math.sin(phase) + 1) / 2) * 100;
  const printing = progress > 20 && progress < 92;
  const paused = progress >= 92 && progress < 96;

  let printState: PrinterSnapshot["printState"] = "standby";
  if (printing) printState = paused ? "paused" : "printing";
  else if (progress >= 96) printState = "complete";

  const filename =
    printState === "standby" ? null : "demo_calibration_cube.gcode";

  return {
    printerId: printer.id,
    name: printer.name,
    url: printer.url,
    online: true,
    klippyState: "ready",
    printState,
    filename,
    progress: printState === "standby" ? 0 : progress,
    extruderTemp: 210 + Math.sin(t * 0.4) * 2,
    extruderTarget: printing || paused ? 210 : 0,
    bedTemp: 60 + Math.cos(t * 0.3),
    bedTarget: printing || paused ? 60 : 0,
    error: null,
  };
}

export async function demoAction(
  _printer: PrinterEntry,
  _action: "pause" | "resume" | "cancel",
): Promise<string | null> {
  await new Promise((r) => setTimeout(r, 200));
  return null;
}
