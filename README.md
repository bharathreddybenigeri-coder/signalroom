# Signalroom

Signalroom is a handcrafted realtime data observatory built with Next.js App Router. It renders line, bar, scatter, and heatmap views from scratch with Canvas, while React controls keep interaction clear and accessible.

## Run locally

```bash
yarn install
yarn dev
```

## Features

- Live simulated telemetry arriving every 100ms through a Web Worker
- Canvas line, bar, scatter, and heatmap modes with drag-to-pan and scroll-to-zoom
- Time range, aggregation bucket, stress load, pause/resume, and live FPS/memory HUD
- Virtualized event stream that stays bounded while stress testing 50,000 points
- Responsive sidebar, KPI cards, stream health, loading/error boundaries
- `/api/data?points=1200` for a server-generated telemetry snapshot

## Browser notes

Use a current Chromium, Firefox, or Safari release. The performance HUD uses `requestAnimationFrame`; memory is a lightweight display estimate because `performance.memory` is Chromium-only.

## Performance testing

1. Move the Performance HUD slider from 1k to 50k points.
2. Switch chart modes and drag/zoom the canvas.
3. Keep the stream live for several minutes and verify FPS and event-table scrolling.
4. Use browser Performance tools for a longer profile when comparing devices.