"use client";
import { useMemo, useState } from "react";

type Options = {
  rowHeight: number;
  viewport: number;
  count: number;
  overscan?: number;
};

/**
 * Windowed virtualization: computes visible index range from scrollTop.
 */
export function useVirtualization({ rowHeight, viewport, count, overscan = 4 }: Options) {
  const [scrollTop, setScrollTop] = useState(0);
  const result = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(count, start + Math.ceil(viewport / rowHeight) + overscan * 2);
    return { start, end, totalHeight: count * rowHeight, offsetY: start * rowHeight };
  }, [scrollTop, rowHeight, viewport, count, overscan]);
  return { ...result, setScrollTop };
}
