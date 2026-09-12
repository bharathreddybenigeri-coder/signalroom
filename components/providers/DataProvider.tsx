"use client";
import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { useDataStream } from "@/hooks/useDataStream";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { aggregateByBucket, rangePointCount } from "@/lib/performanceUtils";
import type { BucketSize, ChartMode, FilterState, HoverState, TelemetryPoint, TimeRange, Viewport } from "@/lib/types";

type Ctx = {
  points: TelemetryPoint[];
  visiblePoints: TelemetryPoint[];
  aggregatedPoints: TelemetryPoint[];
  filteredPoints: TelemetryPoint[];
  mode: ChartMode;
  setMode: (v: ChartMode) => void;
  range: TimeRange;
  setRange: (v: TimeRange) => void;
  bucket: BucketSize;
  setBucket: (v: BucketSize) => void;
  stress: number;
  setStress: (v: number) => void;
  paused: boolean;
  setPaused: (v: boolean) => void;
  hover: HoverState;
  setHover: (v: HoverState) => void;
  filters: FilterState;
  toggleSeries: (s: number) => void;
  viewport: Viewport;
  setViewport: (v: Viewport | ((prev: Viewport) => Viewport)) => void;
  fps: number;
  memoryMB: number;
  renderTime: number;
  isPending: boolean;
};

const DataContext = createContext<Ctx | null>(null);

export function DataProvider({ initialData, children }: { initialData: TelemetryPoint[]; children: React.ReactNode }) {
  const [mode, setMode] = useState<ChartMode>("line");
  const [range, setRange] = useState<TimeRange>("30m");
  const [bucket, setBucket] = useState<BucketSize>("raw");
  const [stress, setStressState] = useState(1500);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState<HoverState>(null);
  const [viewport, setViewport] = useState<Viewport>({ zoom: 1, offset: 0 });
  const [filters, setFilters] = useState<FilterState>({
    activeSeries: new Set([0, 1, 2, 3, 4]),
    minValue: 0,
    maxValue: 200,
  });
  const [isPending, startTransition] = useTransition();

  const { points, resize } = useDataStream({ initialCount: 1500, initialData, paused, cap: stress });

  const setStress = useCallback(
    (value: number) => {
      startTransition(() => {
        setStressState(value);
        resize(value);
      });
    },
    [resize],
  );

  const toggleSeries = useCallback((s: number) => {
    setFilters((prev) => {
      const next = new Set(prev.activeSeries);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return { ...prev, activeSeries: next };
    });
  }, []);

  const { fps, memoryMB, renderTime } = usePerformanceMonitor();

  const visiblePoints = useMemo(() => {
    const window = rangePointCount(range);
    return points.length > window ? points.slice(-window) : points;
  }, [points, range]);

  const aggregatedPoints = useMemo(
    () => aggregateByBucket(visiblePoints, bucket),
    [visiblePoints, bucket],
  );

  const filteredPoints = useMemo(
    () => aggregatedPoints.filter((p) => filters.activeSeries.has(p.series)),
    [aggregatedPoints, filters.activeSeries],
  );

  const value: Ctx = {
    points,
    visiblePoints,
    aggregatedPoints,
    filteredPoints,
    mode,
    setMode,
    range,
    setRange,
    bucket,
    setBucket,
    stress,
    setStress,
    paused,
    setPaused,
    hover,
    setHover,
    filters,
    toggleSeries,
    viewport,
    setViewport,
    fps,
    memoryMB,
    renderTime,
    isPending,
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDashboard must be used within DataProvider");
  return ctx;
}
