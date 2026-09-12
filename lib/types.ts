export type TelemetryPoint = {
  id: string;
  timestamp: number;
  value: number;
  secondary: number;
  series: number;
};

export type ChartMode = "line" | "bar" | "scatter" | "heatmap";
export type TimeRange = "5m" | "30m" | "2h" | "24h";
export type BucketSize = "raw" | "1m" | "5m" | "1h";

export type Viewport = { zoom: number; offset: number };
export type HoverState = { point?: TelemetryPoint; x: number; y: number } | null;

export type PerformanceMetrics = {
  fps: number;
  memoryMB: number;
  renderTime: number;
};

export type FilterState = {
  activeSeries: Set<number>;
  minValue: number;
  maxValue: number;
};

export const SERIES_LABELS = ["Primary", "Baseline", "Anomaly", "Signal", "Auxiliary"];
export const CHART_COLORS = ["#ff6b5f", "#1fb8a8", "#7058d8", "#f4b23e", "#e14da3"];
