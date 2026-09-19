"use client";

import {
  TIER_THRESHOLDS,
  getTierAnchorColor,
  getTierRowBackgroundByStamps,
} from "@/lib/stamp-gradient";

interface TierStat {
  tier: number;
  count: number;
}

export function TierBreakdown({ data, total }: { data: TierStat[]; total: number }) {
  const countByTier = new Map(data.map((d) => [d.tier, d.count]));
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-1.5">
      {[...TIER_THRESHOLDS].reverse().map((threshold) => {
        const count = countByTier.get(threshold) ?? 0;
        const ratio = count > 0 ? 0.7 + (count / maxCount) * 0.3 : 0.5;
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";

        return (
          <div
            key={threshold}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
            style={{ background: getTierRowBackgroundByStamps(threshold, count > 0) }}
          >
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{
                background: getTierAnchorColor(threshold),
                opacity: count > 0 ? ratio : 0.5,
              }}
            />
            <span className={`font-medium min-w-[90px] ${count > 0 ? "text-foreground/80" : "text-foreground/40"}`}>
              {threshold} timbri
            </span>
            {/* Barra */}
            <div className="flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${count > 0 ? Math.max((count / maxCount) * 100, 8) : 0}%`,
                  background: getTierAnchorColor(threshold),
                  opacity: count > 0 ? ratio : 0,
                }}
              />
            </div>
            {/* Numero */}
            <span
              className="font-bold tabular-nums min-w-[32px] text-right"
              style={{
                color: count > 0
                  ? `rgba(64, 64, 64, ${ratio})`
                  : "rgba(128, 128, 128, 0.4)",
              }}
            >
              {count}
            </span>
            {/* Percentuale */}
            <span className="text-xs text-foreground/40 min-w-[40px] text-right">
              {pct}%
            </span>
          </div>
        );
      })}
      <div className="mt-1 border-t border-foreground/10 pt-2 flex items-center justify-between text-xs text-foreground/50 px-3">
        <span>Totale riscatti</span>
        <span className="font-bold text-foreground/70">{total}</span>
      </div>
    </div>
  );
}
