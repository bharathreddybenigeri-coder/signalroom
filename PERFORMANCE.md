# Performance notes

## Rendering approach

The chart uses one Canvas surface and a requestAnimationFrame loop. React owns controls and low-frequency snapshots; the canvas receives a bounded snapshot while its drawing loop reads through refs. This prevents the 100ms telemetry cadence from forcing a full component-tree render.

## Scaling strategy

- The worker owns the live point buffer and trims it to the selected stress target.
- Line and scatter paths decimate to a maximum draw budget; heatmap cells aggregate into a fixed grid; bars bucket points before drawing.
- The table only mounts visible rows plus overscan.
- ResizeObserver aligns backing pixels to the display without polling.
- Device pixel ratio is capped at 2 to avoid huge backing buffers on high-density screens.

## Benchmark checklist

Test with 1k, 10k, and 50k points. Record steady-state FPS, long-task count, heap trend, and input latency while switching modes and panning. A healthy run should keep 60fps on a modern desktop for 1k–10k points and remain interactive with a 30fps floor during a 50k stress run.