type WorkerPoint = { id: string; timestamp: number; value: number; secondary: number; series: number };
type WorkerMessage = { type: "start" | "resize"; count?: number };

let points: WorkerPoint[] = [];
let targetCount = 1500;
let timer: ReturnType<typeof setInterval> | undefined;
let sequence = 0;
const workerScope = self as unknown as { postMessage: (message: unknown) => void; onmessage: ((event: MessageEvent<WorkerMessage>) => void) | null };
const valueAt = (index: number, series = 0): number => 112 + Math.sin(index / 28 + series * 0.8) * 18 + Math.sin(index / 111) * 12 + Math.sin(index / 7.5 + series) * 4 + series * 8;
const createPoint = (index: number): WorkerPoint => ({ id: `evt-${Date.now()}-${index}`, timestamp: Date.now() - (targetCount - index) * 100, value: Math.round(valueAt(index) * 100) / 100, secondary: Math.round(valueAt(index, 1) * 100) / 100, series: index % 5 });
const resize = (count = 1500): void => { targetCount = Math.max(1000, Math.min(50000, count)); points = Array.from({ length: targetCount }, (_, index) => createPoint(index)); workerScope.postMessage({ type: "init", points }); };
workerScope.onmessage = (event: MessageEvent<WorkerMessage>): void => {
  if (event.data?.type === "start") { resize(event.data.count || 1500); clearInterval(timer); timer = setInterval(() => { sequence += 1; const point = createPoint(targetCount + sequence); points.push(point); if (points.length > targetCount) points.shift(); workerScope.postMessage({ type: "tick", point }); }, 100); }
  if (event.data?.type === "resize") resize(event.data.count);
};