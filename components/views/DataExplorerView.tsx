"use client";
import { memo, useMemo, useState } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import { useVirtualization } from "@/hooks/useVirtualization";
import { CHART_COLORS, SERIES_LABELS, TelemetryPoint } from "@/lib/types";
import { downloadCsv } from "@/lib/csvExport";
import { ArrowDown, ArrowUp, Download, Search } from "lucide-react";
import { toast } from "sonner";

const formatNumber = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const formatTime = (t: number) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(t);

type SortKey = "timestamp" | "value" | "secondary" | "series";

function toCsv(rows: TelemetryPoint[]): string {
  const header = "id,timestamp,value,secondary,series";
  const body = rows.map((r) => `${r.id},${new Date(r.timestamp).toISOString()},${r.value},${r.secondary},${SERIES_LABELS[r.series % 5]}`).join("\n");
  return `${header}\n${body}`;
}

function handleExport(rows: TelemetryPoint[]) {
  downloadCsv(rows, `signalroom-explorer-${Date.now()}.csv`);
  toast.success("Exported", { description: `${rows.length} rows saved as CSV` });
}

function DataExplorerViewImpl() {
  const { filteredPoints } = useDashboard();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? filteredPoints.filter(
          (p) =>
            p.id.toLowerCase().includes(q) ||
            SERIES_LABELS[p.series % 5].toLowerCase().includes(q) ||
            String(p.value).includes(q),
        )
      : filteredPoints;
    const sorted = [...filtered].sort((a, b) => {
      const va = a[sortKey] as number | string;
      const vb = b[sortKey] as number | string;
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return sorted;
  }, [filteredPoints, query, sortKey, sortDir]);

  const rowHeight = 44;
  const viewport = 560;
  const { start, end, totalHeight, offsetY, setScrollTop } = useVirtualization({
    rowHeight,
    viewport,
    count: rows.length,
  });
  const visible = rows.slice(start, end);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortArrow = ({ column }: { column: SortKey }) =>
    sortKey === column ? (
      sortDir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />
    ) : null;

  const stats = useMemo(() => {
    if (!rows.length) return { min: 0, max: 0, avg: 0 };
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (const p of rows) {
      if (p.value < min) min = p.value;
      if (p.value > max) max = p.value;
      sum += p.value;
    }
    return { min, max, avg: sum / rows.length };
  }, [rows]);

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#7058d8]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7058d8]" />
            Data explorer
          </div>
          <h2 className="text-[34px] font-extrabold leading-none tracking-[-.065em] text-[#242422] sm:text-[42px]">
            Search the <span className="relative inline-block">signal<span className="absolute -bottom-1 left-0 h-1 w-[62%] rounded-full bg-[#1fb8a8]" /></span><span className="text-[#7058d8]">.</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#858580]">Every point from the current filter set. Sort, search, and export the slice you care about.</p>
        </div>
        <button
          onClick={() => handleExport(rows)}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#242422] px-4 text-xs font-extrabold text-white shadow-[0_4px_0_#c5c5bf] transition hover:-translate-y-0.5"
        >
          <Download size={13} />
          Export {formatNumber(rows.length)} rows
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4 mb-5">
        {[
          ["Rows", formatNumber(rows.length), CHART_COLORS[2]],
          ["Min", formatNumber(stats.min, 2), CHART_COLORS[0]],
          ["Avg", formatNumber(stats.avg, 2), CHART_COLORS[1]],
          ["Max", formatNumber(stats.max, 2), CHART_COLORS[3]],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-[16px] border border-[#e6e6e3] bg-white p-4 shadow-[0_4px_0_#eaeae7,0_10px_20px_rgba(25,25,30,.04)]">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.13em] text-[#a0a09b]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color as string }} />
              {label}
            </div>
            <div className="mt-2 text-[24px] font-extrabold tracking-[-.05em]">{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#e6e6e3] bg-white shadow-[0_5px_0_#eaeae7,0_18px_36px_rgba(20,20,30,.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ededeb] px-5 py-4">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a09b]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by id, series, or value…"
              className="w-full rounded-lg border border-[#e6e6e3] bg-[#fbfbfa] py-2 pl-8 pr-3 text-xs font-medium text-[#242422] placeholder:text-[#a0a09b] outline-none focus:border-[#7058d8]"
            />
          </div>
          <div className="text-[10px] font-bold text-[#a0a09b]">Showing {formatNumber(Math.min(end - start, rows.length))} of {formatNumber(rows.length)}</div>
        </div>
        <div className="grid grid-cols-[1.2fr_1fr_.8fr_.8fr_.8fr] border-b border-[#ededeb] bg-[#fbfbfa] px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#a3a29e]">
          <span>Event ID</span>
          <button className="flex items-center gap-1 text-left" onClick={() => toggleSort("timestamp")}>Timestamp <SortArrow column="timestamp" /></button>
          <button className="flex items-center gap-1 text-left" onClick={() => toggleSort("value")}>Value <SortArrow column="value" /></button>
          <button className="flex items-center gap-1 text-left" onClick={() => toggleSort("secondary")}>Secondary <SortArrow column="secondary" /></button>
          <button className="flex items-center gap-1 text-left" onClick={() => toggleSort("series")}>Series <SortArrow column="series" /></button>
        </div>
        <div className="relative overflow-auto" style={{ height: viewport }} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
          <div style={{ height: totalHeight, position: "relative" }}>
            <div className="absolute left-0 right-0 top-0" style={{ transform: `translateY(${offsetY}px)` }}>
              {visible.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-xs font-bold text-[#a0a09b]">Nothing matches “{query}”.</div>
              ) : (
                visible.map((p, i) => (
                  <div
                    key={p.id || `${start}-${i}`}
                    className="grid h-[44px] grid-cols-[1.2fr_1fr_.8fr_.8fr_.8fr] items-center border-b border-[#f0f0ee] px-5 text-xs transition hover:bg-[#fcf9f7]"
                  >
                    <span className="truncate font-bold text-[#484844]">{p.id?.slice(-18) || "evt-stream"}</span>
                    <span className="text-[#92928e]">{formatTime(p.timestamp)}</span>
                    <span className="font-bold text-[#292927]">{formatNumber(p.value, 2)}</span>
                    <span className="font-bold text-[#484844]">{formatNumber(p.secondary, 2)}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[p.series % 5] }} />
                      {SERIES_LABELS[p.series % 5]}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DataExplorerViewImpl);
