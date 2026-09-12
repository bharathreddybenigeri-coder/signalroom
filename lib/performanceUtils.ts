import { BucketSize, TelemetryPoint, TimeRange } from "./types";

export const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

export const bucketMs = (bucket: BucketSize): number => {
  switch (bucket) {
    case "1m":
      return 60_000;
    case "5m":
      return 300_000;
    case "1h":
      return 3_600_000;
    default:
      return 0;
  }
};

export const rangePointCount = (range: TimeRange): number => {
  switch (range) {
    case "5m":
      return 3000;
    case "30m":
      return 18000;
    case "2h":
      return 50000;
    case "24h":
      return 100000;
    default:
      return 18000;
  }
};

export const aggregateByBucket = (points: TelemetryPoint[], bucket: BucketSize): TelemetryPoint[] => {
  const size = bucketMs(bucket);
  if (!size || points.length === 0) return points;
  const buckets = new Map<number, { sum: number; sec: number; count: number; series: number; ts: number }>();
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const key = Math.floor(p.timestamp / size) * size;
    const b = buckets.get(key);
    if (b) {
      b.sum += p.value;
      b.sec += p.secondary;
      b.count += 1;
    } else {
      buckets.set(key, { sum: p.value, sec: p.secondary, count: 1, series: p.series, ts: key });
    }
  }
  const out: TelemetryPoint[] = [];
  const keys = Array.from(buckets.keys()).sort((a, b) => a - b);
  for (const k of keys) {
    const b = buckets.get(k)!;
    out.push({
      id: `bucket-${b.ts}`,
      timestamp: b.ts,
      value: b.sum / b.count,
      secondary: b.sec / b.count,
      series: b.series,
    });
  }
  return out;
};

// Simple throttle for high-frequency setState.
export const throttle = <A extends unknown[]>(fn: (...args: A) => void, wait = 200) => {
  let last = 0;
  let pending: ReturnType<typeof setTimeout> | null = null;
  return (...args: A) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      if (pending) {
        clearTimeout(pending);
        pending = null;
      }
      last = now;
      fn(...args);
    } else if (!pending) {
      pending = setTimeout(() => {
        last = Date.now();
        pending = null;
        fn(...args);
      }, remaining);
    }
  };
};
