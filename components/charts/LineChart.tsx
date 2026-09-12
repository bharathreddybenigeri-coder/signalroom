"use client";
import { memo, useRef } from "react";
import { useChartRenderer } from "@/hooks/useChartRenderer";
import { CHART_COLORS, TelemetryPoint } from "@/lib/types";
import { clearCanvas, decimateStep, drawAxisLabels, drawGridlines } from "@/lib/canvasUtils";

type Props = {
  points: TelemetryPoint[];
  width: number;
  height: number;
  paused: boolean;
  activeSeries: Set<number>;
  visibleRange: { start: number; count: number };
};

function LineChartImpl({ points, width, height, paused, activeSeries, visibleRange }: Props) {
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
      if (visible.length < 2) {
        drawAxisLabels(ctx, pad, chartW, chartH, size.height, 0, 100);
        return;
      }
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < visible.length; i += 1) {
        const p = visible[i];
        if (p.value < min) min = p.value;
        if (p.value > max) max = p.value;
        if (p.secondary < min) min = p.secondary;
        if (p.secondary > max) max = p.secondary;
      }
      const range = Math.max(max - min, 1);
      const toX = (i: number) => pad.left + (i / Math.max(visible.length - 1, 1)) * chartW;
      const toY = (v: number) => pad.top + chartH - ((v - min) / range) * chartH;
      const step = decimateStep(visible.length, 12000);
      const drawSeries = (key: "value" | "secondary", color: string) => {
        ctx.beginPath();
        for (let i = 0; i < visible.length; i += step) {
          const x = toX(i);
          const y = toY(visible[i][key]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        ctx.stroke();
      };
      drawSeries("value", CHART_COLORS[0]);
      drawSeries("secondary", CHART_COLORS[1]);
      drawAxisLabels(ctx, pad, chartW, chartH, size.height, min, max);
    },
    paused,
  );
  return <canvas ref={canvasRef} className="absolute inset-0" aria-label="Line chart" role="img" />;
}

const LineChart = memo(LineChartImpl);
export default LineChart;
