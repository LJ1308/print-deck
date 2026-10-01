export interface PrinterEntry {
  id: string;
  name: string;
  /** Base URL, e.g. http://192.168.1.10:7125 */
  url: string;
}

export interface AppSettings {
  printers: PrinterEntry[];
}

export type PrintState =
  | "standby"
  | "printing"
  | "paused"
  | "complete"
  | "error"
  | "unknown";

export interface PrinterSnapshot {
  printerId: string;
  name: string;
  url: string;
  online: boolean;
  klippyState: string;
  printState: PrintState;
  filename: string | null;
  progress: number;
  extruderTemp: number;
  extruderTarget: number;
  bedTemp: number;
  bedTarget: number;
  error: string | null;
}
