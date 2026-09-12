"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import LineChart from "./LineChart";
import BarChart from "./BarChart";
import ScatterPlot from "./ScatterPlot";
import Heatmap from "./Heatmap";
import { useDashboard } from "@/components/providers/DataProvider";
import type { HoverState } from "@/lib/types";

export default function ChartSurface() {
  const { filteredPoints, mode, paused, filters, viewport, setViewport, setHover, isPending } = useDashboard();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 330 });
  const pointerRef = useRef({ down: false, x: 0 });

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const obs = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: Math.max(entry.contentRect.height, 280) });
    });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const visibleCount = Math.max(12, Math.floor(filteredPoints.length / viewport.zoom));
  const maxOffset = Math.max(0, filteredPoints.length - visibleCount);
  const start = Math.min(maxOffset, Math.max(0, Math.floor(viewport.offset * maxOffset)));
  const visibleRange = { start, count: visibleCount };

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      setViewport((prev) => ({
        ...prev,
        zoom: Math.max(1, Math.min(8, prev.zoom * (e.deltaY > 0 ? 0.9 : 1.1))),
      }));
    },
    [setViewport],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;
      if (pointerRef.current.down) {
        const delta = (e.clientX - pointerRef.current.x) / bounds.width;
        setViewport((prev) => ({
          ...prev,
          offset: Math.max(0, Math.min(1, prev.offset - delta / prev.zoom)),
        }));
        pointerRef.current.x = e.clientX;
      }
      if (filteredPoints.length) {
        const idx = Math.max(
          0,
          Math.min(
            filteredPoints.length - 1,
            Math.floor(((e.clientX - bounds.left) / bounds.width) * filteredPoints.length),
          ),
        );
        const hover: HoverState = {
          point: filteredPoints[idx],
          x: e.clientX - bounds.left,
          y: e.clientY - bounds.top,
        };
        setHover(hover);
      }
    },
    [filteredPoints, setHover, setViewport],
  );

  const chartProps = {
    points: filteredPoints,
    width: size.width,
    height: size.height,
    paused,
    activeSeries: filters.activeSeries,
    visibleRange,
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative h-[330px] w-full touch-none overflow-hidden rounded-[14px] border border-[#e8e8e5] bg-[#fbfbfa] ${
        isPending ? "opacity-95" : ""
      }`}
      onWheel={onWheel}
      onPointerMove={onPointerMove}
      onPointerDown={(e) => {
        pointerRef.current = { down: true, x: e.clientX };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={() => {
        pointerRef.current.down = false;
      }}
      onPointerLeave={() => {
        pointerRef.current.down = false;
        setHover(null);
      }}
    >
      {mode === "line" && <LineChart {...chartProps} />}
      {mode === "bar" && <BarChart {...chartProps} />}
      {mode === "scatter" && <ScatterPlot {...chartProps} />}
      {mode === "heatmap" && <Heatmap {...chartProps} />}
      <div className="pointer-events-none absolute left-4 top-3 flex items-center gap-2 rounded-md bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[.13em] text-[#999995] backdrop-blur-sm">
        Drag to pan · scroll to zoom
      </div>
    </div>
  );
}
