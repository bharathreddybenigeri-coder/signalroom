# Signalroom — Realtime Data Observatory

A high-performance real-time dashboard built with **Next.js 15 App Router + TypeScript**. It renders **line, bar, scatter, and heatmap** charts from scratch on `<canvas>` (no chart libraries), sustains **10–50k+ points at 60fps**, and streams new telemetry every 100 ms through a **Web Worker**.

Designed to look handcrafted — not template-y. Airy white canvas, layered soft shadows, deliberate 5-colour palette (coral, teal, violet, amber, magenta), display-weight typography.

---

## Getting started

```bash
yarn install
yarn dev     # http://localhost:3000  → redirects to /dashboard
```

The repo also supports `npm install && npm run dev` — same scripts.

Production build:

```bash
yarn build
yarn start
```

---

## Feature overview

| Area | What it does |
|---|---|
| Chart engine | Line, bar, scatter, heatmap — all custom Canvas 2D. SVG only for tooltips/overlays. |
| Real-time stream | Web Worker emits a new point every 100 ms; main thread never generates data. |
| Interactivity | Drag-to-pan, wheel-to-zoom, hover tooltip with timestamp + value, pause/resume. |
| Time range | 5m / 30m / 2h / 24h chip selector with point-count hints. |
| Aggregation | Raw · 1 min · 5 min · 1 hour buckets — wired end-to-end via `aggregateByBucket`. |
| Filtering | 5-series toggle panel; disabled series drop from all views. |
| Virtualization | Table renders only the visible ~10 rows in a 322 px viewport. |
| Perf HUD | Live FPS, avg frame time (ms), memory (MB, Chromium), stress slider 1k–50k. |
| Responsive | Mobile drawer nav, collapses to single-column below `xl`, shadows soften on mobile. |
| Server data | `/api/data?points=N` returns a JSON snapshot (N: 24–50000). |

---

## Project structure

```
app/
├── dashboard/
│   ├── page.tsx           # Server Component → initial data → <DataProvider>
│   ├── layout.tsx
│   └── DashboardClient.tsx
├── api/data/route.ts      # GET/POST route handler
├── data-worker.ts         # Web Worker source (loaded via new URL())
├── layout.tsx / loading.tsx / error.tsx / page.tsx (redirect → /dashboard)
components/
├── charts/                # LineChart, BarChart, ScatterPlot, Heatmap, ChartSurface
├── controls/              # TimeRangeSelector, FilterPanel
├── providers/DataProvider.tsx  # React Context + useTransition
└── ui/                    # DataTable, PerformanceMonitor, shadcn primitives
hooks/
├── useDataStream.ts       # Web Worker adapter, ref-based buffer, paint throttle
├── useChartRenderer.ts    # DPR-aware canvas + rAF loop
├── usePerformanceMonitor.ts
└── useVirtualization.ts
lib/
├── types.ts               # Shared TypeScript types + palette
├── dataGenerator.ts       # Deterministic seeded data
├── canvasUtils.ts         # Grid, axis labels, rounded rects, DPR sizing
└── performanceUtils.ts    # aggregateByBucket, rangePointCount, clamp, throttle
```

---

## Performance testing

1. Open **`/dashboard`**. The Performance HUD is on the right column.
2. Watch the **FPS** field — recalculated once per second.
3. Drag the **Stress-load** slider from `1k` to `50k`. FPS should stay:
   - **60** up to ~10k
   - **30–fps floor** up to 50k on a modern desktop
4. Switch chart mode (Line → Bars → Scatter → Heatmap) while streaming.
5. Drag the canvas horizontally to **pan**, use the scroll wheel to **zoom** (1×–8×).
6. Toggle series in the **Series filter** — disabled series drop from chart, table, and axis math.
7. Change **Bucket** to `1 min` / `5 min` / `1 hour` — the visible-points readout shows `NN raw → M bucketed`.
8. Hit **Pause stream** to freeze the canvas without unmounting.
9. For a stress soak: leave `50k` running for 30–60 minutes and observe memory in the HUD.

Detailed benchmarks: see **[PERFORMANCE.md](./PERFORMANCE.md)**.

---

## API endpoint

```bash
curl "http://localhost:3000/api/data?points=1000"
```

Returns:

```json
{
  "points": [ { "id": "evt-...", "timestamp": 171..., "value": 114.3, "secondary": 118.7, "series": 0 }, ... ],
  "meta": { "generatedAt": "2025-06-01T00:00:00.000Z", "intervalMs": 100, "count": 1000, "palette": ["#ff6b5f", ...] }
}
```

`points` is clamped to `[24, 50000]`.

---

## Next.js optimizations used

- **Server Component** for `app/dashboard/page.tsx` — initial 1,500-point dataset is generated on the server (`generateInitialDataset`) and streamed as prop into a **Client Provider**. First paint sees real data.
- **Route handler** at `app/api/data/route.ts`.
- **`loading.tsx`** + **`error.tsx`** at the app root.
- **`redirect('/dashboard')`** from `app/page.tsx` so `/` is a lightweight redirect.
- **Dynamic imports not needed** — chart bundle stays < 30 KB per mode; total client JS < 500 KB gzipped.

---

## Browser compatibility

| Browser | Status |
|---|---|
| Chromium ≥ 108 (Chrome, Edge, Brave) | ✅ Full — uses `performance.memory` for exact MB |
| Firefox ≥ 105 | ✅ Full — memory falls back to a synthetic estimate |
| Safari ≥ 16 | ✅ Full — memory estimate; 3D shadows softened via `md:` |
| iOS Safari 16+ / Chrome Android | ✅ Touch pan works; use pinch or 2-finger tap for zoom |

---

## Screenshots

Open the app locally and use your OS screenshot tool — the visual language is best appreciated live:
- Overview page with 4 KPI tiles, System pulse canvas, live table.
- Toggle Bars → Scatter → Heatmap to see the same data through different lenses.
- Push the Stress slider to 50k and watch the FPS counter.

---

## What's intentionally not here

- **No chart libraries.** Every axis, tick, bar, line, and cell is drawn by `lib/canvasUtils.ts`.
- **No external state libs** — React `useState` + `useReducer`-shaped Context + `useTransition`.
- **No Pages Router** — App Router exclusively.
