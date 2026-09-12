"use client";
import { memo, useMemo, useState } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import ChartSurface from "@/components/charts/ChartSurface";
import DataTable from "@/components/ui/DataTable";
import PerformanceMonitor from "@/components/ui/PerformanceMonitor";
import FilterPanel from "@/components/controls/FilterPanel";
import TimeRangeSelector from "@/components/controls/TimeRangeSelector";
import LiveStreamsView from "@/components/views/LiveStreamsView";
import DataExplorerView from "@/components/views/DataExplorerView";
import SavedViewsView from "@/components/views/SavedViewsView";
import { CHART_COLORS } from "@/lib/types";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Clock3,
  Command,
  Cpu,
  Database,
  Grid3X3,
  Layers3,
  LineChart,
  Maximize2,
  Menu,
  MoreHorizontal,
  Radio,
  Search,
  Settings2,
  Sparkles,
  Table2,
  X,
  ZoomIn,
} from "lucide-react";

const formatNumber = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const formatTime = (t: number) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(t);

type IconComp = React.ComponentType<{ size?: number; strokeWidth?: number }>;

function Sparkline({ color, points = [] }: { color: string; points?: number[] }) {
  const min = points.length ? Math.min(...points) : 0;
  const max = points.length ? Math.max(...points) : 1;
  const path = points.length
    ? points
        .map(
          (p, i) =>
            `${i ? "L" : "M"}${(i / Math.max(points.length - 1, 1)) * 100},${58 -
              ((p - min) / Math.max(max - min, 1)) * 48}`,
        )
        .join(" ")
    : "M0,48 L25,38 L50,43 L75,18 L100,26";
  return (
    <svg viewBox="0 0 100 64" className="h-14 w-28 overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path d={`${path} L100,64 L0,64 Z`} fill={color} opacity=".08" />
    </svg>
  );
}

const MetricCard = memo(function MetricCard({
  label,
  value,
  change,
  color,
  icon: Icon,
  points,
  suffix = "",
}: {
  label: string;
  value: string;
  change: string;
  color: string;
  icon: IconComp;
  points: number[];
  suffix?: string;
}) {
  const positive = !String(change).startsWith("-");
  return (
    <div className="group relative overflow-hidden rounded-[18px] border border-[#e9e9e7] bg-white p-5 shadow-[0_5px_0_#e9e9e7,0_16px_34px_rgba(20,20,30,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_7px_0_#e5e5e2,0_22px_42px_rgba(20,20,30,0.1)]">
      <div
        className="absolute right-0 top-0 h-24 w-24 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: color }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-[#8c8c89]">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}18`, color }}
            >
              <Icon size={15} />
            </span>
            {label}
          </div>
          <div className="flex items-baseline gap-1 text-[29px] font-extrabold tracking-[-0.06em] text-[#181817]">
            {value}
            <span className="text-sm font-semibold tracking-normal text-[#8c8c89]">{suffix}</span>
          </div>
          <div
            className={`mt-2 flex items-center gap-1 text-xs font-bold ${
              positive ? "text-[#18a18e]" : "text-[#e15b54]"
            }`}
          >
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change} <span className="font-medium text-[#aaa9a5]">vs last hour</span>
          </div>
        </div>
        <Sparkline color={color} points={points} />
      </div>
    </div>
  );
});

export default function DashboardClient() {
  const { visiblePoints, mode, setMode, hover, bucket, aggregatedPoints } = useDashboard();
  const [mobileNav, setMobileNav] = useState(false);
  const [activeNav, setActiveNav] = useState("Overview");

  const values = useMemo(() => visiblePoints.map((p) => p.value), [visiblePoints]);
  const average = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const peak = values.length ? values.reduce((m, v) => Math.max(m, v), -Infinity) : 0;
  const sparkValues = useMemo(() => visiblePoints.slice(-18).map((p) => p.value), [visiblePoints]);
  const eventPulse = visiblePoints.length % 20;

  const modes = [
    { id: "line" as const, label: "Line", icon: LineChart },
    { id: "bar" as const, label: "Bars", icon: BarChart3 },
    { id: "scatter" as const, label: "Scatter", icon: Activity },
    { id: "heatmap" as const, label: "Heatmap", icon: Grid3X3 },
  ];
  const navItems = [
    { label: "Overview", icon: Layers3 },
    { label: "Live streams", icon: Radio, count: "3" },
    { label: "Data explorer", icon: Table2 },
    { label: "Saved views", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f6] font-sans text-[#242422] selection:bg-[#ff6b5f]/20">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[238px] flex-col border-r border-[#e7e7e4] bg-[#fbfbfa] px-4 py-5 transition-transform duration-300 lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#242422] text-white shadow-[0_3px_0_#c7c7c2]">
              <Activity size={16} strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-extrabold tracking-[-.04em]">
              signal<span className="text-[#ff6b5f]">/</span>room
            </span>
          </div>
          <button
            className="text-[#a0a09b] lg:hidden"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
            data-testid="close-drawer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mb-7 px-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#aaa9a4]">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, count }) => (
            <button
              key={label}
              onClick={() => {
                setActiveNav(label);
                setMobileNav(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition ${
                activeNav === label
                  ? "bg-white text-[#242422] shadow-[0_3px_0_#e7e7e4,0_8px_16px_rgba(20,20,25,.05)]"
                  : "text-[#8d8d88] hover:bg-white/70 hover:text-[#444440]"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={16} />
                {label}
              </span>
              {count && (
                <span className="rounded-full bg-[#ff6b5f]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#ff6b5f]">
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="mb-3 mt-10 px-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-[#aaa9a4]">
          Collections
        </div>
        <div className="space-y-1 px-2">
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-xs font-bold text-[#70706c] hover:bg-white">
            <span className="h-2.5 w-2.5 rounded-full bg-[#1fb8a8]" />
            Production health
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-xs font-bold text-[#70706c] hover:bg-white">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7058d8]" />
            Growth signals
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-xs font-bold text-[#70706c] hover:bg-white">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f4b23e]" />
            Experiment lab
          </button>
        </div>
        <div className="mt-auto rounded-[16px] border border-[#e6e6e3] bg-white p-3.5 shadow-[0_3px_0_#e8e8e5]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffebe7] text-[10px] font-extrabold text-[#e15b54]">
              JD
            </div>
            <span className="h-2 w-2 rounded-full bg-[#1fb8a8]" />
          </div>
          <div className="text-xs font-extrabold">Jordan Davis</div>
          <div className="mt-0.5 text-[10px] text-[#aaa9a4]">Personal workspace</div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="min-h-screen lg:ml-[238px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-[#e7e7e4]/90 bg-[#f8f8f6]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-[#777772] hover:bg-white lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#a0a09b]">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-[#555550]">Overview</span>
              </div>
              <h1 className="mt-0.5 text-lg font-extrabold tracking-[-.04em]">
                Good morning, Jordan <span className="text-[#ff6b5f]">.</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden items-center gap-2 rounded-lg border border-[#e2e2df] bg-white px-3 py-2 text-xs font-bold text-[#8b8b86] shadow-[0_2px_0_#e8e8e5] transition hover:-translate-y-px sm:flex">
              <Search size={14} />
              Search
              <kbd className="ml-2 rounded border border-[#e5e5e2] px-1.5 py-0.5 text-[9px] text-[#aaa9a4]">⌘ K</kbd>
            </button>
            <button className="relative rounded-lg p-2 text-[#777772] hover:bg-white" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ff6b5f] ring-2 ring-[#f8f8f6]" />
            </button>
            <button className="rounded-lg p-2 text-[#777772] hover:bg-white" aria-label="Settings">
              <Settings2 size={18} />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-5 py-7 sm:px-8 lg:px-10 lg:py-9">
          {activeNav === "Live streams" && <LiveStreamsView />}
          {activeNav === "Data explorer" && <DataExplorerView />}
          {activeNav === "Saved views" && <SavedViewsView />}
          {activeNav === "Overview" && (
            <>
          <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#ff6b5f]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6b5f]" />
                Realtime observatory
              </div>
              <h2 className="text-[34px] font-extrabold leading-none tracking-[-.065em] text-[#242422] sm:text-[42px]">
                Everything is{" "}
                <span className="relative inline-block">
                  in signal
                  <span className="absolute -bottom-1 left-0 h-1 w-[58%] rounded-full bg-[#f4b23e]" />
                </span>
                <span className="text-[#ff6b5f]">.</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#858580]">
                A living read on your systems, with the noise turned down and the useful parts turned up.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-[#e2e2df] bg-white px-3 py-2.5 text-xs font-bold text-[#676762] shadow-[0_3px_0_#e9e9e5]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#1fb8a8]" />
                Streaming now
              </div>
              <button className="flex h-10 items-center gap-2 rounded-xl bg-[#242422] px-4 text-xs font-extrabold text-white shadow-[0_4px_0_#c5c5bf] transition hover:-translate-y-0.5">
                <Command size={14} />
                Share view
              </button>
            </div>
          </div>

          <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Events / second"
              value={formatNumber(1248 + eventPulse)}
              change="12.8%"
              color={CHART_COLORS[0]}
              icon={Radio}
              points={sparkValues}
            />
            <MetricCard
              label="P95 latency"
              value={formatNumber(average * 0.44, 1)}
              change="-4.2%"
              color={CHART_COLORS[1]}
              icon={Clock3}
              points={sparkValues.map((p) => p * 0.4)}
              suffix=" ms"
            />
            <MetricCard
              label="Signal quality"
              value="98.7"
              change="8.4%"
              color={CHART_COLORS[2]}
              icon={Sparkles}
              points={sparkValues.map((p) => 150 - p)}
              suffix="%"
            />
            <MetricCard
              label="Peak throughput"
              value={formatNumber(peak * 14, 1)}
              change="16.1%"
              color={CHART_COLORS[3]}
              icon={Database}
              points={sparkValues.map((p) => p * 1.2)}
              suffix="k"
            />
          </div>

          <section className="mb-7 overflow-hidden rounded-[20px] border border-[#e5e5e2] bg-white p-4 shadow-[0_5px_0_#e9e9e6,0_18px_40px_rgba(25,25,30,.07)] sm:p-5">
            <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold tracking-[-.03em]">System pulse</h3>
                  <span className="rounded-md bg-[#eaf8f5] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#159887]">
                    Live
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#92928e]">
                  <span>Last updated just now</span>
                  <span className="h-1 w-1 rounded-full bg-[#d1d1cd]" />
                  <span>
                    {formatNumber(visiblePoints.length)} visible points
                    {bucket !== "raw" && ` → ${formatNumber(aggregatedPoints.length)} bucketed`}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-[#e6e6e3] bg-[#fafaf8] p-1">
                  {modes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      data-testid={`mode-${id}`}
                      aria-pressed={mode === id}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-extrabold transition sm:px-3 ${
                        mode === id
                          ? "bg-white text-[#242422] shadow-[0_2px_0_#e3e3df]"
                          : "text-[#9b9a95] hover:text-[#555550]"
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  className="rounded-xl border border-[#e6e6e3] p-2.5 text-[#83837e] hover:bg-[#fafaf8]"
                  aria-label="Maximize"
                >
                  <Maximize2 size={15} />
                </button>
                <button
                  className="rounded-xl border border-[#e6e6e3] p-2.5 text-[#83837e] hover:bg-[#fafaf8]"
                  aria-label="More"
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#767671]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ff6b5f]" />
                  Primary signal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#1fb8a8]" />
                  Baseline
                </span>
              </div>
              <TimeRangeSelector />
            </div>
            <div className="relative">
              <ChartSurface />
              {hover?.point && (
                <div className="pointer-events-none absolute right-4 top-12 rounded-xl border border-[#e6e6e3] bg-white/95 p-3 shadow-lg backdrop-blur">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#aaa9a4]">
                    {formatTime(hover.point.timestamp)}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-extrabold">
                    <span className="h-2 w-2 rounded-full bg-[#ff6b5f]" />
                    {formatNumber(hover.point.value, 2)}{" "}
                    <span className="text-xs font-medium text-[#aaa9a4]">units</span>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-[#aaa9a4]">
              <span>Auto-refreshing every 100ms</span>
              <span className="flex items-center gap-1">
                <ZoomIn size={12} />
                Interactive canvas
              </span>
            </div>
          </section>

          <div className="grid items-start gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
            <DataTable />
            <div className="space-y-7">
              <PerformanceMonitor />
              <FilterPanel />
              <div className="rounded-[18px] border border-[#e5e5e2] bg-white p-5 shadow-[0_4px_0_#eaeae7,0_14px_28px_rgba(25,25,30,.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold">Stream health</h3>
                    <p className="mt-1 text-xs text-[#a0a09b]">Across 3 live sources</p>
                  </div>
                  <MoreHorizontal size={16} className="text-[#9a9994]" />
                </div>
                <div className="space-y-4">
                  {[
                    ["API gateway", "99.9%", "w-[99%]", "bg-[#1fb8a8]"],
                    ["Event pipeline", "98.4%", "w-[94%]", "bg-[#7058d8]"],
                    ["Warehouse sync", "96.8%", "w-[87%]", "bg-[#f4b23e]"],
                  ].map(([name, value, width, color]) => (
                    <div key={name}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="font-bold text-[#64645f]">{name}</span>
                        <span className="font-extrabold text-[#1aa290]">{value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0ed]">
                        <div className={`h-full rounded-full ${width} ${color}`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 border-t border-[#f0f0ed] pt-4 text-[11px] font-bold text-[#989893]">
                  <Cpu size={13} className="text-[#1fb8a8]" />
                  All systems nominal
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
