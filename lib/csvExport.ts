import type { TelemetryPoint } from "./types";
import { SERIES_LABELS } from "./types";

export function pointsToCsv(rows: TelemetryPoint[]): string {
  const header = "id,timestamp,value,secondary,series";
  const body = rows
    .map(
      (r) =>
        `${r.id},${new Date(r.timestamp).toISOString()},${r.value},${r.secondary},${SERIES_LABELS[r.series % 5]}`,
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(rows: TelemetryPoint[], filename?: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([pointsToCsv(rows)], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `signalroom-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
