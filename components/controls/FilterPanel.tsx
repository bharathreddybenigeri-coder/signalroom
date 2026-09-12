"use client";
import { memo } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import { CHART_COLORS, SERIES_LABELS } from "@/lib/types";
import { Filter } from "lucide-react";

function FilterPanelImpl() {
  const { filters, toggleSeries } = useDashboard();
  return (
    <div
      className="rounded-[18px] border border-[#e5e5e2] bg-white p-5 shadow-[0_4px_0_#eaeae7,0_14px_28px_rgba(25,25,30,.05)]"
      data-testid="filter-panel"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-extrabold">
            <Filter size={14} className="text-[#7058d8]" />
            Series filter
          </div>
          <p className="mt-1 text-xs text-[#a0a09b]">Toggle categories to focus the canvas</p>
        </div>
        <span className="rounded-md bg-[#f5f2ff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[.1em] text-[#7058d8]">
          {filters.activeSeries.size}/5
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {SERIES_LABELS.map((label, idx) => {
          const active = filters.activeSeries.has(idx);
          return (
            <button
              key={label}
              onClick={() => toggleSeries(idx)}
              aria-pressed={active}
              data-testid={`series-toggle-${idx}`}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition ${
                active
                  ? "bg-[#faf9f7] text-[#242422] shadow-[0_2px_0_#eaeae7]"
                  : "bg-white text-[#a0a09b] hover:bg-[#faf9f7]"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-transform ${
                    active ? "scale-100" : "scale-75 opacity-40"
                  }`}
                  style={{ backgroundColor: CHART_COLORS[idx] }}
                />
                {label}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-[.1em] ${
                  active ? "text-[#159887]" : "text-[#c6c6c1]"
                }`}
              >
                {active ? "On" : "Off"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default memo(FilterPanelImpl);
