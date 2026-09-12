"use client";
import { memo } from "react";
import { useDashboard } from "@/components/providers/DataProvider";
import type { BucketSize, TimeRange } from "@/lib/types";
import { Clock3, Layers } from "lucide-react";

const RANGES: { id: TimeRange; label: string; hint: string }[] = [
  { id: "5m", label: "5m", hint: "3k" },
  { id: "30m", label: "30m", hint: "18k" },
  { id: "2h", label: "2h", hint: "50k" },
  { id: "24h", label: "24h", hint: "100k" },
];

const BUCKETS: { id: BucketSize; label: string }[] = [
  { id: "raw", label: "Raw" },
  { id: "1m", label: "1 min" },
  { id: "5m", label: "5 min" },
  { id: "1h", label: "1 hour" },
];

function TimeRangeSelectorImpl() {
  const { range, setRange, bucket, setBucket } = useDashboard();
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="time-range-selector">
      <div className="flex rounded-xl border border-[#e6e6e3] bg-[#fafaf8] p-1 shadow-[0_2px_0_#efefec]">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRange(r.id)}
            aria-pressed={range === r.id}
            className={`flex flex-col items-center rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold transition ${
              range === r.id
                ? "bg-white text-[#242422] shadow-[0_2px_0_#e3e3df]"
                : "text-[#9b9a95] hover:text-[#555550]"
            }`}
          >
            <span>{r.label}</span>
            <span className="text-[9px] font-medium text-[#aaa9a4]">{r.hint} pts</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 rounded-xl border border-[#e6e6e3] bg-white px-2.5 py-2 text-[10px] font-bold text-[#898984] shadow-[0_2px_0_#efefec]">
        <Layers size={12} className="text-[#7058d8]" />
        Bucket
        <select
          value={bucket}
          onChange={(e) => setBucket(e.target.value as BucketSize)}
          aria-label="Aggregation bucket"
          className="bg-transparent font-extrabold text-[#555550] outline-none"
        >
          {BUCKETS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default memo(TimeRangeSelectorImpl);
