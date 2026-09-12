"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TelemetryPoint } from "@/lib/types";

type Options = {
  initialCount?: number;
  initialData?: TelemetryPoint[];
  paused?: boolean;
  cap?: number;
};

type WorkerMsg = { type: string; points?: TelemetryPoint[]; point?: TelemetryPoint };

export function useDataStream({ initialCount = 1500, initialData, paused, cap = 50000 }: Options = {}) {
  const [points, setPoints] = useState<TelemetryPoint[]>(initialData ?? []);
  const pointsRef = useRef<TelemetryPoint[]>(initialData ?? []);
  const workerRef = useRef<Worker | null>(null);
  const pausedRef = useRef(!!paused);
  const capRef = useRef(cap);
  const lastPaintRef = useRef(0);

  useEffect(() => {
    pausedRef.current = !!paused;
  }, [paused]);
  useEffect(() => {
    capRef.current = cap;
  }, [cap]);

  useEffect(() => {
    const worker = new Worker(new URL("../app/data-worker.ts", import.meta.url));
    workerRef.current = worker;
    worker.onmessage = (event: MessageEvent<WorkerMsg>) => {
      const { type, points: init, point } = event.data;
      if (type === "init" && init) {
        pointsRef.current = init;
        setPoints(init);
        lastPaintRef.current = performance.now();
      }
      if (type === "tick" && point && !pausedRef.current) {
        const c = capRef.current;
        pointsRef.current = [...pointsRef.current.slice(-(c - 1)), point];
        const now = performance.now();
        if (now - lastPaintRef.current > 220) {
          setPoints(pointsRef.current);
          lastPaintRef.current = now;
        }
      }
    };
    worker.postMessage({ type: "start", count: initialCount });
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [initialCount]);

  const resize = useCallback((count: number) => {
    workerRef.current?.postMessage({ type: "resize", count });
  }, []);

  return { points, pointsRef, resize };
}
