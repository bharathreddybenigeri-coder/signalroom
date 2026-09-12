"use client";
import { memo, useRef } from "react";
import { useChartRenderer } from "@/hooks/useChartRenderer";
import { CHART_COLORS, TelemetryPoint } from "@/lib/types";
import { clearCanvas, drawAxisLabels, drawGridlines, roundedRectPath } from "@/lib/canvasUtils";

type Props = {
  points: TelemetryPoint[];
  width: number;
  height: number;
  paused: boolean;
  activeSeries: Set<number>;
  visibleRange: { start: number; count: number };
};

function BarChartImpl({ points, width, height, paused, activeSeries, visibleRange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useChartRenderer(
    canvasRef,
    { width, height },
    (ctx, size) => {
      clearCanvas(ctx, size.width, size.height);
      const pad = { left: 54, right: 18, top: 18, bottom: 28 };
      const chartW = size.width - pad.left - pad.right;
      const chartH = size.height - pad.top - pad.bottom;
      drawGridlines(ctx, pad.left, pad.top, chartW, chartH);
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
      const bucket = Math.max(1, Math.floor(visible.length / 42));
      const bars = Math.ceil(visible.length / bucket);
      const barW = chartW / bars;
      ctx.globalAlpha = 0.82;
      for (let bi = 0; bi < bars; bi += 1) {
        const startI = bi * bucket;
        const slice = visible.slice(startI, startI + bucket);
        if (!slice.length) continue;
        let sum = 0;
        for (let j = 0; j < slice.length; j += 1) sum += slice[j].value;
        const avg = sum / slice.length;
        const h = Math.max(3, ((avg - min) / range) * chartH);
        const x = pad.left + bi * barW;
        const y = pad.top + chartH - h;
        ctx.fillStyle = CHART_COLORS[slice[0].series % CHART_COLORS.length];
        roundedRectPath(ctx, x + barW * 0.12, y, barW * 0.76, h, 5);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      drawAxisLabels(ctx, pad, chartW, chartH, size.height, min, max);
    },
    paused,
  );
  return <canvas ref={canvasRef} className="absolute inset-0" aria-label="Bar chart" role="img" />;
}

const BarChart = memo(BarChartImpl);
export default BarChart;
