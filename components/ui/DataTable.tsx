"use client";
import { memo } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import { useVirtualization } from "@/hooks/useVirtualization";
import { CHART_COLORS, SERIES_LABELS } from "@/lib/types";
import { Download } from "lucide-react";

const formatNumber = (n: number, d = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const formatTime = (t: number) =>
  new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(t);

function DataTableImpl() {
  const { filteredPoints, stress } = useDashboard();
  const rowHeight = 46;
  const viewport = 322;
  const rows = [...filteredPoints].reverse().slice(0, Math.max(80, Math.min(1200, stress)));
  const { start, end, totalHeight, offsetY, setScrollTop } = useVirtualization({
    rowHeight,
    viewport,
    count: rows.length,
  });
  const visible = rows.slice(start, end);

  return (
    <div
      className="overflow-hidden rounded-[18px] border border-[#e6e6e3] bg-white shadow-[0_4px_0_#ededeb,0_14px_28px_rgba(25,25,30,0.05)]"
      data-testid="data-table"
    >
      <div className="flex items-center justify-between border-b border-[#ededeb] px-5 py-4">
        <div>
          <h3 className="text-sm font-extrabold tracking-[-.02em]">Live event stream</h3>
          <p className="mt-1 text-xs text-[#999995]">
            Virtualized · newest first · {formatNumber(rows.length)} rows
          </p>
        </div>
        <button className="flex items-center gap-1.5 rounded-lg border border-[#e6e6e3] px-3 py-2 text-xs font-bold text-[#646460] transition hover:bg-[#f7f7f5]">
          <Download size={13} />
          Export
        </button>
      </div>
      <div className="grid grid-cols-[1.1fr_1fr_.8fr_.7fr] border-b border-[#ededeb] bg-[#fbfbfa] px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-[#a3a29e]">
        <span>Event ID</span>
        <span>Timestamp</span>
        <span>Value</span>
        <span>Series</span>
      </div>
      <div className="relative h-[322px] overflow-auto" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
        <div style={{ height: totalHeight, position: "relative" }}>
          <div className="absolute left-0 right-0 top-0" style={{ transform: `translateY(${offsetY}px)` }}>
            {visible.map((p, i) => (
              <div
                key={p.id || `${start}-${i}`}
                className="grid h-[46px] grid-cols-[1.1fr_1fr_.8fr_.7fr] items-center border-b border-[#f0f0ee] px-5 text-xs transition hover:bg-[#fcf9f7]"
              >
                <span className="truncate font-bold text-[#484844]">{p.id?.slice(-14) || "evt-stream"}</span>
                <span className="text-[#92928e]">{formatTime(p.timestamp)}</span>
                <span className="font-bold text-[#292927]">{formatNumber(p.value, 2)}</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[p.series % 5] }} />
                  {SERIES_LABELS[p.series % 5]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DataTableImpl);
