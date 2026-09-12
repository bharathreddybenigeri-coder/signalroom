"use client";
import { memo, useEffect, useState } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import type { BucketSize, ChartMode, TimeRange } from "@/lib/types";
import { CHART_COLORS, SERIES_LABELS } from "@/lib/types";
import { BarChart3, Bookmark, Grid3X3, LineChart as LineIcon, Plus, Trash2, Activity as ScatterIcon } from "lucide-react";

const STORAGE_KEY = "signalroom:saved-views";

type SavedView = {
  id: string;
  name: string;
  createdAt: number;
  mode: ChartMode;
  range: TimeRange;
  bucket: BucketSize;
  activeSeries: number[];
  stress: number;
};

const SEED_VIEWS: SavedView[] = [
  { id: "seed-baseline", name: "Steady baseline", createdAt: 1710000000000, mode: "line", range: "30m", bucket: "raw", activeSeries: [0, 1], stress: 3000 },
  { id: "seed-anomaly", name: "Anomaly sweep", createdAt: 1710000000000, mode: "scatter", range: "2h", bucket: "1m", activeSeries: [2, 3], stress: 15000 },
  { id: "seed-heat", name: "24h heat window", createdAt: 1710000000000, mode: "heatmap", range: "24h", bucket: "5m", activeSeries: [0, 1, 2, 3, 4], stress: 50000 },
];

const MODE_ICONS: Record<ChartMode, React.ComponentType<{ size?: number }>> = {
  line: LineIcon,
  bar: BarChart3,
  scatter: ScatterIcon,
  heatmap: Grid3X3,
};

function loadViews(): SavedView[] {
  try {
    if (typeof window === "undefined") return SEED_VIEWS;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_VIEWS;
    const parsed = JSON.parse(raw) as SavedView[];
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_VIEWS;
  } catch {
    return SEED_VIEWS;
  }
}

function saveViews(views: SavedView[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views));
  } catch {
    /* ignore */
  }
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)} h ago`;
  return `${Math.round(diff / 86_400_000)} d ago`;
}

function SavedViewsViewImpl() {
  const { mode, setMode, range, setRange, bucket, setBucket, filters, toggleSeries, stress, setStress } = useDashboard();
  const [views, setViews] = useState<SavedView[]>(SEED_VIEWS);
  const [name, setName] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setViews(loadViews());
    setHydrated(true);
  }, []);

  const persist = (next: SavedView[]) => {
    setViews(next);
    saveViews(next);
  };

  const currentView = (label: string): SavedView => ({
    id: `v-${Date.now()}`,
    name: label,
    createdAt: Date.now(),
    mode,
    range,
    bucket,
    activeSeries: Array.from(filters.activeSeries).sort(),
    stress,
  });

  const onSave = () => {
    const label = name.trim() || `View · ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
    persist([currentView(label), ...views]);
    setName("");
  };

  const applyView = (v: SavedView) => {
    setMode(v.mode);
    setRange(v.range);
    setBucket(v.bucket);
    setStress(v.stress);
    const current = filters.activeSeries;
    const target = new Set(v.activeSeries);
    [0, 1, 2, 3, 4].forEach((s) => {
      const isActive = current.has(s);
      const shouldBeActive = target.has(s);
      if (isActive !== shouldBeActive) toggleSeries(s);
    });
  };

  const deleteView = (id: string) => persist(views.filter((v) => v.id !== id));

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#f4b23e]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f4b23e]" />
            Saved views
          </div>
          <h2 className="text-[34px] font-extrabold leading-none tracking-[-.065em] text-[#242422] sm:text-[42px]">
            Your favourite <span className="relative inline-block">angles<span className="absolute -bottom-1 left-0 h-1 w-[62%] rounded-full bg-[#ff6b5f]" /></span><span className="text-[#f4b23e]">.</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#858580]">Snapshot the current chart mode, range, bucket, series filter and stress level. One tap restores everything.</p>
        </div>
      </div>

      <div className="mb-6 rounded-[20px] border border-dashed border-[#dcdcd8] bg-white p-5 shadow-[0_4px_0_#eaeae7]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="text-[10px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Snapshot the current view</div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Afternoon spike, Warehouse backfill…"
              className="mt-1.5 w-full bg-transparent text-lg font-extrabold tracking-[-.02em] outline-none placeholder:text-[#c6c6c1]"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSave();
              }}
            />
          </div>
          <button
            onClick={onSave}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#242422] px-5 text-xs font-extrabold text-white shadow-[0_4px_0_#c5c5bf] transition hover:-translate-y-0.5"
          >
            <Plus size={14} />
            Save view
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold text-[#8b8b86]">
          <span className="rounded-md bg-[#faf9f7] px-2 py-0.5">Mode: <span className="text-[#242422]">{mode}</span></span>
          <span className="rounded-md bg-[#faf9f7] px-2 py-0.5">Range: <span className="text-[#242422]">{range}</span></span>
          <span className="rounded-md bg-[#faf9f7] px-2 py-0.5">Bucket: <span className="text-[#242422]">{bucket}</span></span>
          <span className="rounded-md bg-[#faf9f7] px-2 py-0.5">Series: <span className="text-[#242422]">{filters.activeSeries.size}/5</span></span>
          <span className="rounded-md bg-[#faf9f7] px-2 py-0.5">Stress: <span className="text-[#242422]">{Math.round(stress / 100) / 10}k</span></span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(hydrated ? views : SEED_VIEWS).map((v) => {
          const ModeIcon = MODE_ICONS[v.mode];
          return (
            <div
              key={v.id}
              className="group relative overflow-hidden rounded-[20px] border border-[#e6e6e3] bg-white p-5 shadow-[0_5px_0_#eaeae7,0_18px_36px_rgba(20,20,30,.06)] transition hover:-translate-y-1 hover:shadow-[0_7px_0_#e5e5e2,0_22px_42px_rgba(20,20,30,.1)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#faf9f7] text-[#7058d8] shadow-[inset_0_-2px_0_rgba(0,0,0,.04)]">
                    <ModeIcon size={16} />
                  </span>
                  <div>
                    <div className="text-[15px] font-extrabold tracking-[-.02em]">{v.name}</div>
                    <div className="text-[10px] font-medium text-[#a0a09b]">Saved {relativeTime(v.createdAt)}</div>
                  </div>
                </div>
                <button
                  onClick={() => deleteView(v.id)}
                  className="rounded-md p-1.5 text-[#c6c6c1] opacity-0 transition hover:bg-[#faf9f7] hover:text-[#e15b54] group-hover:opacity-100"
                  aria-label="Delete view"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-[#8b8b86]">
                <div className="rounded-lg bg-[#faf9f7] px-2.5 py-1.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Range</div>
                  <div className="text-[13px] font-extrabold text-[#242422]">{v.range}</div>
                </div>
                <div className="rounded-lg bg-[#faf9f7] px-2.5 py-1.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Bucket</div>
                  <div className="text-[13px] font-extrabold text-[#242422]">{v.bucket}</div>
                </div>
                <div className="rounded-lg bg-[#faf9f7] px-2.5 py-1.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Stress</div>
                  <div className="text-[13px] font-extrabold text-[#242422]">{Math.round(v.stress / 100) / 10}k</div>
                </div>
                <div className="rounded-lg bg-[#faf9f7] px-2.5 py-1.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">Series</div>
                  <div className="text-[13px] font-extrabold text-[#242422]">{v.activeSeries.length}/5</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1">
                {v.activeSeries.map((s) => (
                  <span key={s} className="flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[9px] font-bold text-[#8b8b86]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CHART_COLORS[s] }} />
                    {SERIES_LABELS[s]}
                  </span>
                ))}
              </div>

              <button
                onClick={() => applyView(v)}
                className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#242422] text-xs font-extrabold text-white shadow-[0_3px_0_#c5c5bf] transition hover:-translate-y-0.5"
              >
                <Bookmark size={12} />
                Apply view
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(SavedViewsViewImpl);
