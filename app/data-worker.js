let points = [];
let targetCount = 1500;
let timer;
let sequence = 0;
const valueAt = (index, series = 0) => 112 + Math.sin(index / 28 + series * 0.8) * 18 + Math.sin(index / 111) * 12 + Math.sin(index / 7.5 + series) * 4 + series * 8;
const createPoint = (index) => ({ id: `evt-${Date.now()}-${index}`, timestamp: Date.now() - (targetCount - index) * 100, value: Math.round(valueAt(index) * 100) / 100, secondary: Math.round(valueAt(index, 1) * 100) / 100, series: index % 5 });
const resize = (count) => { targetCount = Math.max(1000, Math.min(50000, count)); points = Array.from({ length: targetCount }, (_, index) => createPoint(index)); self.postMessage({ type: "init", points }); };
self.onmessage = (event) => {
  if (event.data?.type === "start") { resize(event.data.count || 1500); clearInterval(timer); timer = setInterval(() => { sequence += 1; const point = createPoint(targetCount + sequence); points.push(point); if (points.length > targetCount) points.shift(); self.postMessage({ type: "tick", point }); }, 100); }
  if (event.data?.type === "resize") resize(event.data.count);
};