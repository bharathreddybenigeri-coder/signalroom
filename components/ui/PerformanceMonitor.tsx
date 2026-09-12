"use client";
import { memo } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Gauge, Pause, Play } from "lucide-react";

const formatNumber = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);

function PerformanceMonitorImpl() {
  const { stress, setStress, paused, setPaused, fps, memoryMB, renderTime, isPending } = useDashboard();
  return (
    <div
      className="rounded-[18px] border border-[#25252b] bg-[#242429] p-5 text-white shadow-[0_5px_0_#151519,0_18px_34px_rgba(15,15,20,.14)]"
      data-testid="performance-hud"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <Gauge size={16} className="text-[#f4b23e]" />
            Performance HUD
          </div>
          <p className="mt-1 text-[11px] text-[#85858d]">A quiet pulse check for the canvas engine</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#1fb8a8]/15 px-2.5 py-1 text-[10px] font-bold text-[#52ddc8]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#52ddc8]" />
          {isPending ? "SCALING" : "LIVE"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-4">
        <div>
          <div className="text-xl font-extrabold tracking-[-.05em]" data-testid="fps-value">
            {fps}
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#85858d]">FPS</div>
        </div>
        <div>
          <div className="text-xl font-extrabold tracking-[-.05em]">
            {memoryMB}
            <span className="text-xs text-[#85858d]"> MB</span>
          </div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#85858d]">Memory</div>
        </div>
        <div>
          <div className="text-xl font-extrabold tracking-[-.05em]">{formatNumber(stress / 1000, 1)}k</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#85858d]">Points</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-[#c6c6cc]">Stress load</span>
          <span data-testid="stress-value" className="font-extrabold text-[#f4b23e]">
            {formatNumber(stress / 1000, 1)}k points
          </span>
        </div>
        <Slider
          aria-label="Stress load"
          data-testid="stress-slider"
          value={[stress]}
          min={1000}
          max={50000}
          step={1000}
          onValueChange={([v]) => setStress(v)}
          className="py-1"
        />
        <div className="mt-2 flex justify-between text-[10px] font-medium text-[#74747b]">
          <span>1k · smooth</span>
          <span>50k · stress</span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-[10px] font-bold text-[#c6c6cc]">
        <span>Frame time (avg)</span>
        <span className="font-extrabold text-[#52ddc8]">{renderTime} ms</span>
      </div>
      <Button
        onClick={() => setPaused(!paused)}
        className="mt-4 h-10 w-full justify-center rounded-xl border-0 bg-white/10 text-xs font-bold text-white shadow-none hover:bg-white/15"
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
        {paused ? "Resume stream" : "Pause stream"}
      </Button>
    </div>
  );
}

export default memo(PerformanceMonitorImpl);
