"use client";
import { RefObject, useEffect, useRef } from "react";

type Size = { width: number; height: number };
type DrawFn = (ctx: CanvasRenderingContext2D, size: Size & { ratio: number }) => void;

/**
 * Manages a Canvas + requestAnimationFrame loop with DPR-aware sizing,
 * safe cleanup, and pause support.
 */
export function useChartRenderer(
  canvasRef: RefObject<HTMLCanvasElement>,
  size: Size,
  drawFn: DrawFn,
  paused = false,
) {
  const drawRef = useRef(drawFn);
  useEffect(() => {
    drawRef.current = drawFn;
  }, [drawFn]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    let raf = 0;
    let running = true;
    const loop = () => {
      if (!running) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(size.width * ratio);
      const targetH = Math.round(size.height * ratio);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        canvas.style.width = `${size.width}px`;
        canvas.style.height = `${size.height}px`;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      drawRef.current(ctx, { width: size.width, height: size.height, ratio });
      if (!paused) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [canvasRef, size.width, size.height, paused]);
}
