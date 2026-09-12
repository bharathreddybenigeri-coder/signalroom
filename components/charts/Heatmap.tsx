"use client";
import { memo, useRef } from "react";
import { useChartRenderer } from "@/hooks/useChartRenderer";
import { TelemetryPoint } from "@/lib/types";
import { clearCanvas, drawAxisLabels, roundedRectPath } from "@/lib/canvasUtils";

type Props = {
  points: TelemetryPoint[];
  width: number;
  height: number;
  paused: boolean;
  activeSeries: Set<number>;
  visibleRange: { start: number; count: number };
};

function HeatmapImpl({ points, width, height, paused, activeSeries, visibleRange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useChartRenderer(
    canvasRef,
    { width, height },
    (ctx, size) => {
      clearCanvas(ctx, size.width, size.height);
      const pad = { left: 54, right: 18, top: 18, bottom: 28 };
      const chartW = size.width - pad.left - pad.right;
      const chartH = size.height - pad.top - pad.bottom;
      const visible = points
        .slice(visibleRange.start, visibleRange.start + visibleRange.count)
        .filter((p) => activeSeries.has(p.series));
      if (!visible.length) return;
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < visible.length; i += 1) {
        const v = visible[i].value;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const range = Math.max(max - min, 1);
      const cols = Math.min(48, Math.max(16, Math.floor(visible.length / 15)));
      const rows = 12;
      const cw = chartW / cols;
      const ch = chartH / rows;
      for (let c = 0; c < cols; c += 1) {
        const p = visible[Math.min(visible.length - 1, Math.floor((c / cols) * visible.length))];
        for (let r = 0; r < rows; r += 1) {
          const intensity = Math.max(
            0,
            Math.min(1, ((p?.value || 100) - min) / range + Math.sin(r * 2 + c) * 0.12),
          );
          ctx.fillStyle = `hsla(${8 + intensity * 292}, 74%, 57%, ${0.22 + intensity * 0.7})`;
          roundedRectPath(ctx, pad.left + c * cw + 2, pad.top + r * ch + 2, cw - 4, ch - 4, 4);
          ctx.fill();
        }
      }
      drawAxisLabels(ctx, pad, chartW, chartH, size.height, min, max);
    },
    paused,
  );
  return <canvas ref={canvasRef} className="absolute inset-0" aria-label="Heatmap" role="img" />;
}

const Heatmap = memo(HeatmapImpl);
export default Heatmap;
