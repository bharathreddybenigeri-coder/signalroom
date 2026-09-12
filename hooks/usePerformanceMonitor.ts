"use client";
import { useEffect, useState } from "react";

type PerfWithMemory = Performance & { memory?: { usedJSHeapSize: number } };

export function usePerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const [memoryMB, setMemoryMB] = useState(42);
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let frames = 0;
    let totalFrameTime = 0;
    let lastFrame = performance.now();
    const measure = (now: number) => {
      frames += 1;
      totalFrameTime += now - lastFrame;
      lastFrame = now;
      if (now - last > 1000) {
        setFps(Math.min(60, frames));
        setRenderTime(Math.round((totalFrameTime / Math.max(frames, 1)) * 10) / 10);
        frames = 0;
        totalFrameTime = 0;
        last = now;
        const perf = performance as PerfWithMemory;
        if (perf.memory?.usedJSHeapSize) {
          setMemoryMB(Math.round(perf.memory.usedJSHeapSize / 1_000_000));
        }
      }
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, []);

  return { fps, memoryMB, renderTime };
}
