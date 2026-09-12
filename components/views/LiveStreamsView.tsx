"use client";
import { memo, useMemo } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import { CHART_COLORS, SERIES_LABELS } from "@/lib/types";
import { Activity, ArrowUpRight, Cpu, Database, Radio, Zap } from "lucide-react";

const formatNumber = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);

function MiniSparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) {
    return (
      <svg viewBox="0 0 100 40" className="h-14 w-full" preserveAspectRatio="none">
        <path d="M0,30 L100,30" stroke={color} strokeWidth="1.5" opacity=".3" fill="none" />
      </svg>
    );
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const path = values
    .map((v, i) => `${i ? "L" : "M"}${(i / (values.length - 1)) * 100},${34 - ((v - min) / range) * 28}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" className="h-14 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,40 L0,40 Z`} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={path} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

type StreamDef = {
  id: string;
  name: string;
  seriesIds: number[];
  color: string;
  icon: React.ComponentType<{ size?: number }>;
  health: number;
  description: string;
};

const STREAMS: StreamDef[] = [
  { id: "gateway", name: "API gateway", seriesIds: [0], color: CHART_COLORS[0], icon: Radio, health: 99.9, description: "North\u2011south traffic · primary edge" },
  { id: "pipeline", name: "Event pipeline", seriesIds: [1, 2], color: CHART_COLORS[2], icon: Zap, health: 98.4, description: "Kafka fanout · anomaly detection" },
  { id: "warehouse", name: "Warehouse sync", seriesIds: [3, 4], color: CHART_COLORS[3], icon: Database, health: 96.8, description: "Batch sink · analytical replicas" },
];

function StreamCard({ stream }: { stream: StreamDef }) {
  const { visiblePoints, filters } = useDashboard();
  const { subset, throughput, avg, spark } = useMemo(() => {
    const subset = visiblePoints.filter((p) => stream.seriesIds.includes(p.series));
    const throughput = subset.length ? (subset.length / Math.max(visiblePoints.length / 10, 1)) : 0;
    const avg = subset.length ? subset.reduce((s, p) => s + p.value, 0) / subset.length : 0;
    const spark = subset.slice(-48).map((p) => p.value);
    return { subset, throughput, avg, spark };
  }, [visiblePoints, stream.seriesIds]);

  const someActive = stream.seriesIds.some((id) => filters.activeSeries.has(id));

  return (
    <div className="group relative overflow-hidden rounded-[20px] border border-[#e6e6e3] bg-white p-5 shadow-[0_5px_0_#eaeae7,0_18px_36px_rgba(20,20,30,.06)] transition hover:-translate-y-1 hover:shadow-[0_7px_0_#e5e5e2,0_22px_42px_rgba(20,20,30,.1)]">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-[.08] blur-3xl" style={{ backgroundColor: stream.color }} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl shadow-[inset_0_-2px_0_rgba(0,0,0,.05)]" style={{ backgroundColor: `${stream.color}18`, color: stream.color }}>
              <stream.icon size={17} />
            </span>
            <div>
              <div className="text-[15px] font-extrabold tracking-[-.02em]">{stream.name}</div>
              <div className="text-[10px] font-medium text-[#a0a09b]">{stream.description}</div>
            </div>
          </div>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-[.1em] ${someActive ? "bg-[#eaf8f5] text-[#159887]" : "bg-[#f5f5f2] text-[#a0a09b]"}`}>
          {someActive ? "Live" : "Muted"}
        </span>
      </div>
      <div className="mt-4">
        <MiniSparkline values={spark} color={stream.color} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#f0f0ed] pt-4">
        <div>
          <div className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Throughput</div>
          <div className="mt-1 flex items-baseline gap-0.5 text-[15px] font-extrabold tracking-[-.03em]">
            {formatNumber(throughput, 1)}<span className="text-[10px] font-medium text-[#a0a09b]">/s</span>
          </div>
        </div>
        <div>
          <div className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Avg value</div>
          <div className="mt-1 text-[15px] font-extrabold tracking-[-.03em]">{formatNumber(avg, 1)}</div>
        </div>
        <div>
          <div className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Health</div>
          <div className="mt-1 flex items-center gap-1 text-[15px] font-extrabold tracking-[-.03em] text-[#1aa290]">
            <ArrowUpRight size={12} />
            {stream.health}%
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-[#8b8b86]">
        Series:
        {stream.seriesIds.map((id) => (
          <span key={id} className="flex items-center gap-1 rounded-md bg-[#faf9f7] px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS[id] }} />
            {SERIES_LABELS[id]}
          </span>
        ))}
        <span className="ml-auto text-[#a0a09b]">{formatNumber(subset.length)} pts</span>
      </div>
    </div>
  );
}

function LiveStreamsViewImpl() {
  const { visiblePoints, fps } = useDashboard();
  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#1fb8a8]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1fb8a8]" />
            Live streams
          </div>
          <h2 className="text-[34px] font-extrabold leading-none tracking-[-.065em] text-[#242422] sm:text-[42px]">
            Three sources, <span className="relative inline-block">one heartbeat<span className="absolute -bottom-1 left-0 h-1 w-[70%] rounded-full bg-[#7058d8]" /></span><span className="text-[#1fb8a8]">.</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#858580]">Each card is a live subscription over the same worker feed. Toggle series in the filter to mute a stream on the fly.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-[#e2e2df] bg-white px-3 py-2.5 text-xs font-bold text-[#676762] shadow-[0_3px_0_#e9e9e5]">
            <Activity size={13} className="text-[#1fb8a8]" />
            {formatNumber(visiblePoints.length)} live pts
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#e2e2df] bg-white px-3 py-2.5 text-xs font-bold text-[#676762] shadow-[0_3px_0_#e9e9e5]">
            <Cpu size={13} className="text-[#f4b23e]" />
            {fps} fps
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {STREAMS.map((s) => <StreamCard key={s.id} stream={s} />)}
      </div>
    </div>
  );
}

export default memo(LiveStreamsViewImpl);
