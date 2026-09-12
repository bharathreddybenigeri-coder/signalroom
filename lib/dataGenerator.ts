import { TelemetryPoint } from "./types";

export const STABLE_NOW = 1710000000000;

export const seededValue = (index: number, series = 0): number =>
  112 +
  Math.sin(index / 28 + series * 0.8) * 18 +
  Math.sin(index / 111) * 12 +
  Math.sin(index / 7.5 + series) * 4 +
  series * 8;

export const buildPoint = (index: number, count: number, now = STABLE_NOW): TelemetryPoint => ({
  id: `evt-${now}-${index}`,
  timestamp: now - (count - index) * 100,
  value: Math.round(seededValue(index) * 100) / 100,
  secondary: Math.round(seededValue(index, 1) * 100) / 100,
  series: index % 5,
});

export const generateInitialDataset = (count = 1500): TelemetryPoint[] =>
  Array.from({ length: count }, (_, i) => buildPoint(i, count));
